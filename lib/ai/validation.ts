import { TAROT_DECK } from "@/data/cards";
import type { DrawnCard } from "@/types/tarot";
import type { AIInterpretationPayload, ReadingSafety } from "@/types/ai";

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
 * These require a card-specific marker (e.g. "The Justice", "ไพ่ Death", "Death card")
 * to avoid false positive triggers.
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
  const stringFields = ["overview", "synthesis", "advice", "reflectionQuestion"] as const;
  for (const field of stringFields) {
    if (typeof obj[field] !== "string" || (obj[field] as string).trim().length === 0) {
      return {
        valid: false,
        reason: `Field '${field}' must be a non-empty string.`,
      };
    }
  }

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

    if (typeof item.interpretation !== "string" || item.interpretation.trim().length === 0) {
      return {
        valid: false,
        reason: `Card interpretation for '${item.cardId}' must contain a non-empty 'interpretation'.`,
      };
    }
  }

  // 4. Undrawn Card Check (Zero Hallucination Guard, SDD §5.1 Rule 2)
  const drawnIds = new Set(drawnCards.map((c) => c.cardId));
  const undrawnCards = TAROT_DECK.filter((c) => !drawnIds.has(c.id));

  // Combine all generated text to check for undrawn card mentions
  const allCardTexts = (obj.cards as { interpretation: string }[])
    .map((c) => c.interpretation)
    .join(" ");

  const combinedFullText = [
    obj.overview,
    obj.synthesis,
    obj.advice,
    obj.reflectionQuestion,
    allCardTexts,
  ].join(" ");

  for (const card of undrawnCards) {
    const cardName = card.name;

    if (AMBIGUOUS_MAJOR_NAMES.has(cardName)) {
      // For ambiguous single words (e.g. "Strength", "Death"), check explicit card references
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
      // For Minor Arcana ("Three of Wands", "King of Pentacles") and distinctive Major Arcana ("The Tower", "The Fool")
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
      overview: (obj.overview as string).trim(),
      cards: (obj.cards as AIInterpretationPayload["cards"]).map((c) => ({
        cardId: c.cardId,
        positionKey: c.positionKey,
        interpretation: c.interpretation.trim(),
      })),
      synthesis: (obj.synthesis as string).trim(),
      advice: (obj.advice as string).trim(),
      reflectionQuestion: (obj.reflectionQuestion as string).trim(),
      status: "complete",
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
    // Continue to extract from markdown or brackets
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
