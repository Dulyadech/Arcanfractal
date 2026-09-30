import { TAROT_DECK } from "@/data/cards";
import type { DrawnCard } from "@/types/tarot";
import type {
  AIInterpretationPayload,
  ReadingSafety,
  QuestionIntent,
  ContextualCardInterpretation,
  StructuredAnswerPayload,
  AnswerDirection,
  FollowUpAnswerPayload,
  StructuredQuestionAnalysis,
} from "@/types/ai";

export interface ValidationSuccess {
  valid: true;
  payload: AIInterpretationPayload;
}

export interface ValidationFailure {
  valid: false;
  reason: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Single-word Major Arcana card names that could be common vocabulary words.
 */
const AMBIGUOUS_MAJOR_NAMES = new Set([
  "Death",
  "Justice",
  "Strength",
  "Temperance",
  "Judgement",
]);

/**
 * Validates AI output against the required schema and enforces the Zero Hallucination Guard (SDD §5, §5.1).
 */
export function validateAIInterpretation(
  data: unknown,
  drawnCards: DrawnCard[]
): ValidationResult {
  if (!data || typeof data !== "object") {
    return {
      valid: false,
      reason: "Output must be a valid JSON object.",
    };
  }

  const obj = data as Record<string, unknown>;

  // 1. Validate safety field
  const validSafeties: ReadingSafety[] = ["none", "sensitive", "crisis"];
  if (!obj.safety || !validSafeties.includes(obj.safety as ReadingSafety)) {
    return {
      valid: false,
      reason: `Field 'safety' must be one of: 'none', 'sensitive', 'crisis'. Got '${String(obj.safety)}'.`,
    };
  }

  // 2. Validate string fields
  const coreStringFields = ["synthesis", "advice", "reflectionQuestion"] as const;
  for (const field of coreStringFields) {
    if (typeof obj[field] !== "string" || (obj[field] as string).trim().length === 0) {
      return {
        valid: false,
        reason: `Field '${field}' must be a non-empty string.`,
      };
    }
  }

  // Ensure either directAnswer or overview is present
  const rawDirectAnswer = typeof obj.directAnswer === "string" ? obj.directAnswer.trim() : "";
  const rawOverview = typeof obj.overview === "string" ? obj.overview.trim() : "";

  if (!rawDirectAnswer && !rawOverview) {
    return {
      valid: false,
      reason: "Interpretation must provide a non-empty 'directAnswer' or 'overview'.",
    };
  }

  const finalDirectAnswer = rawDirectAnswer || rawOverview;
  const finalOverview = rawOverview || rawDirectAnswer;

  // 3. Validate cards array
  if (!Array.isArray(obj.cards)) {
    return {
      valid: false,
      reason: "Field 'cards' must be an array.",
    };
  }

  if (obj.cards.length !== drawnCards.length) {
    return {
      valid: false,
      reason: `Expected ${drawnCards.length} card interpretations in 'cards', but received ${obj.cards.length}.`,
    };
  }

  const drawnCardIdMap = new Map(drawnCards.map((c) => [c.cardId, c]));
  const validatedCards: ContextualCardInterpretation[] = [];

  for (let i = 0; i < obj.cards.length; i++) {
    const item = obj.cards[i] as Record<string, unknown>;
    if (!item || typeof item !== "object") {
      return {
        valid: false,
        reason: `Card interpretation at index ${i} is not a valid object.`,
      };
    }

    if (typeof item.cardId !== "string" || !drawnCardIdMap.has(item.cardId)) {
      return {
        valid: false,
        reason: `Card interpretation at index ${i} has invalid or undrawn cardId '${String(item.cardId)}'.`,
      };
    }

    if (typeof item.positionKey !== "string" || !item.positionKey.trim()) {
      return {
        valid: false,
        reason: `Card interpretation for '${item.cardId}' is missing a valid 'positionKey'.`,
      };
    }

    const interpretation =
      typeof item.interpretation === "string" ? item.interpretation.trim() : "";
    const meaningInContext =
      typeof item.meaningInContext === "string" ? item.meaningInContext.trim() : interpretation;
    const contributionToAnswer =
      typeof item.contributionToAnswer === "string"
        ? item.contributionToAnswer.trim()
        : interpretation;

    if (!interpretation && !meaningInContext) {
      return {
        valid: false,
        reason: `Card interpretation for '${item.cardId}' must contain non-empty interpretation text.`,
      };
    }

    const finalInterpretation = interpretation || `${meaningInContext} ${contributionToAnswer}`.trim();

    validatedCards.push({
      cardId: item.cardId,
      positionKey: item.positionKey,
      cardName: typeof item.cardName === "string" ? item.cardName : undefined,
      orientation:
        item.orientation === "reversed" || item.orientation === "upright"
          ? item.orientation
          : undefined,
      meaningInContext: meaningInContext || finalInterpretation,
      contributionToAnswer: contributionToAnswer || finalInterpretation,
      interpretation: finalInterpretation,
    });
  }

  // 4. Validate answer structure (if provided) and evidence cards
  const drawnCardIdSet = new Set(drawnCards.map((c) => c.cardId));
  let validatedAnswer: StructuredAnswerPayload | undefined;

  if (obj.answer && typeof obj.answer === "object") {
    const rawAnswer = obj.answer as Record<string, unknown>;
    const rawPrimary = rawAnswer.primary as Record<string, unknown> | undefined;

    if (rawPrimary && typeof rawPrimary === "object") {
      const validDirections: AnswerDirection[] = ["likely_yes", "likely_no", "mixed", "unclear"];
      const direction = validDirections.includes(rawPrimary.direction as AnswerDirection)
        ? (rawPrimary.direction as AnswerDirection)
        : "mixed";

      const pText = typeof rawPrimary.text === "string" ? rawPrimary.text.trim() : finalDirectAnswer;
      const rawEvidenceIds = Array.isArray(rawPrimary.evidenceCardIds)
        ? (rawPrimary.evidenceCardIds as string[])
        : [];

      // Validate evidenceCardIds match drawn cards
      for (const id of rawEvidenceIds) {
        if (!drawnCardIdSet.has(id)) {
          return {
            valid: false,
            reason: `Evidence card ID '${id}' is not among the drawn cards.`,
          };
        }
      }

      const validatedFollowUps: FollowUpAnswerPayload[] = [];
      if (Array.isArray(rawAnswer.followUps)) {
        for (let j = 0; j < rawAnswer.followUps.length; j++) {
          const fItem = rawAnswer.followUps[j] as Record<string, unknown>;
          if (fItem && typeof fItem === "object") {
            const fText = typeof fItem.text === "string" ? fItem.text.trim() : "";
            const fAnswer = typeof fItem.answer === "string" ? fItem.answer.trim() : "";
            const fEvidenceIds = Array.isArray(fItem.evidenceCardIds)
              ? (fItem.evidenceCardIds as string[])
              : [];

            for (const id of fEvidenceIds) {
              if (!drawnCardIdSet.has(id)) {
                return {
                  valid: false,
                  reason: `Follow-up evidence card ID '${id}' is not among the drawn cards.`,
                };
              }
            }

            validatedFollowUps.push({
              id: typeof fItem.id === "string" ? fItem.id : `followup-${j + 1}`,
              text: fText,
              answer: fAnswer,
              evidenceCardIds: fEvidenceIds,
            });
          }
        }
      }

      validatedAnswer = {
        primary: {
          direction,
          text: pText,
          evidenceCardIds: rawEvidenceIds.length > 0 ? rawEvidenceIds : drawnCards.map((c) => c.cardId),
        },
        followUps: validatedFollowUps.length > 0 ? validatedFollowUps : undefined,
      };
    }
  }

  // Fallback answer structure if omitted (backward compatibility)
  if (!validatedAnswer) {
    const fallbackDirection: AnswerDirection =
      /(?:ไม่|ยาก|ชะงัก|delay|fail|unlikely)/i.test(finalDirectAnswer)
        ? "likely_no"
        : /(?:สำเร็จ|ได้|ทัน|ผ่าน|ราบรื่น|success|likely|yes)/i.test(finalDirectAnswer)
        ? "likely_yes"
        : "mixed";

    validatedAnswer = {
      primary: {
        direction: fallbackDirection,
        text: finalDirectAnswer,
        evidenceCardIds: drawnCards.map((c) => c.cardId),
      },
    };
  }

  // 5. Undrawn Card Check (Zero Hallucination Guard, SDD §5.1 Rule 2)
  const drawnIds = new Set(drawnCards.map((c) => c.cardId));
  const undrawnCards = TAROT_DECK.filter((c) => !drawnIds.has(c.id));

  // Combine all generated text to check for undrawn card mentions
  const allCardTexts = validatedCards
    .map((c) => `${c.interpretation} ${c.meaningInContext} ${c.contributionToAnswer}`)
    .join(" ");

  const followUpAnswerTexts = validatedAnswer?.followUps?.map((f: FollowUpAnswerPayload) => f.answer).join(" ") || "";

  const combinedFullText = [
    finalDirectAnswer,
    finalOverview,
    validatedAnswer?.primary.text || "",
    followUpAnswerTexts,
    obj.synthesis,
    obj.advice,
    obj.reflectionQuestion,
    typeof obj.conclusion === "string" ? obj.conclusion : "",
    typeof obj.clarificationPrompt === "string" ? obj.clarificationPrompt : "",
    allCardTexts,
  ].join(" ");

  for (const card of undrawnCards) {
    const cardName = card.name;

    if (AMBIGUOUS_MAJOR_NAMES.has(cardName)) {
      const patterns = [
        new RegExp(`\\bthe\\s+${cardName}\\b`, "i"),
        new RegExp(`\\b${cardName}\\s+card\\b`, "i"),
        new RegExp(`\\bcard\\s+${cardName}\\b`, "i"),
        new RegExp(`ไพ่\\s*${cardName}`, "i"),
      ];

      for (const pattern of patterns) {
        if (pattern.test(combinedFullText)) {
          return {
            valid: false,
            reason: `Zero Hallucination violation: Undrawn card '${cardName}' was mentioned in interpretation.`,
          };
        }
      }
    } else {
      const escapedName = cardName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`\\b${escapedName}\\b`, "i");

      if (pattern.test(combinedFullText)) {
        return {
          valid: false,
          reason: `Zero Hallucination violation: Undrawn card '${cardName}' was mentioned in interpretation.`,
        };
      }
    }
  }

  return {
    valid: true,
    payload: {
      safety: obj.safety as ReadingSafety,
      originalQuestion: typeof obj.originalQuestion === "string" ? obj.originalQuestion : undefined,
      questionIntent: typeof obj.questionIntent === "string" ? (obj.questionIntent as QuestionIntent) : undefined,
      questionScope: typeof obj.questionScope === "string" ? obj.questionScope : undefined,
      directAnswer: finalDirectAnswer,
      confidence: typeof obj.confidence === "string" ? obj.confidence : undefined,
      overview: finalOverview,
      cards: validatedCards,
      synthesis: (obj.synthesis as string).trim(),
      advice: (obj.advice as string).trim(),
      reflectionQuestion: (obj.reflectionQuestion as string).trim(),
      conclusion: typeof obj.conclusion === "string" ? obj.conclusion.trim() : undefined,
      status: "complete",
      isMultiQuestion: typeof obj.isMultiQuestion === "boolean" ? obj.isMultiQuestion : undefined,
      subQuestions: Array.isArray(obj.subQuestions) ? (obj.subQuestions as string[]) : undefined,
      scopeNotice: typeof obj.scopeNotice === "string" ? obj.scopeNotice.trim() : undefined,
      answer: validatedAnswer,
      questionAnalysis:
        obj.questionAnalysis && typeof obj.questionAnalysis === "object"
          ? (obj.questionAnalysis as StructuredQuestionAnalysis)
          : undefined,
      clarificationPrompt:
        typeof obj.clarificationPrompt === "string" ? obj.clarificationPrompt.trim() : undefined,
    },
  };
}

/**
 * Extracts and parses JSON from raw LLM text (handles markdown fences if present).
 */
export function extractJsonFromText(rawText: string): unknown {
  if (!rawText || typeof rawText !== "string") {
    return null;
  }

  const trimmed = rawText.trim();

  // Try direct parse
  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue
  }

  // Check for ```json ... ``` code fence
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // Continue
    }
  }

  // Look for outermost { ... }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {
      // Failed to parse
    }
  }

  return null;
}
