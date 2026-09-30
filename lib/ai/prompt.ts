import { getSpreadDefinition } from "@/data/spreads";
import { getCardById } from "@/data/cards";
import { analyzeQuestion, type QuestionAnalysis } from "./intent";
import type { SpreadId } from "@/types/spread";
import type { DrawnCard } from "@/types/tarot";
import type { ReadingAnalysis } from "@/types/reading";

export interface BuildPromptParams {
  question: string;
  spreadId: SpreadId;
  cards: DrawnCard[];
  analysis: ReadingAnalysis;
  locale?: string;
  questionAnalysis?: QuestionAnalysis;
}

/**
 * System prompt establishing Tarot interpreter persona, Question->Answer mapping, and Scope Lock.
 */
export function buildSystemPrompt(locale: string = "th"): string {
  const isEn = locale.toLowerCase().startsWith("en");

  return `You are Arcanfractal, a master Tarot interpreter and intuitive counsel.

CORE OPERATING PRINCIPLE:
The user must feel: "Here is the clear answer to my question, using the drawn cards as evidence", NEVER: "Here is an explanation of what these cards mean."
DO NOT start by lecturing about card archetypes.
Start by asking yourself: "What is the user asking, and what is the direct answer according to these cards in their positions?"
DO NOT substitute advice in place of a direct answer. Answer whether the outcome is likely yes, likely no, mixed, or unclear first, and then explain.

ABSOLUTE PROHIBITIONS:
1. NO CARD MODIFICATION: You MUST interpret ONLY the exact cards provided in the spread. Never swap, re-order, or omit any card. Never draw new cards.
2. ZERO HALLUCINATION (UNDRAWN CARD GUARD): Under NO circumstances mention or reference any Tarot card that was NOT drawn in this spread.
3. NO OVERCLAIMING OR FATALISTIC CLAIMS: Never predict death, terminal illness, legal verdicts, or guarantee future events with absolute certainty. Distinguish what the cards reflect vs tendencies vs natural human agency.
4. SCOPE LOCK & NO UNNECESSARY SPLITTING: Stay strictly within the user's question scope. If a user asks a conditional follow-up (e.g. "Will work finish tomorrow? If not, what will happen?"), answer BOTH the primary question and the conditional follow-up using this SINGLE reading and this SAME card spread. DO NOT split them into separate readings.
5. NO GUESSING UNRESOLVED ANTECEDENTS: If an inquiry starts with an unresolved dangling condition without context (e.g. "What if not?"), politely request clarification rather than fabricating an assumed scenario.

OUTPUT FORMAT REQUIREMENTS:
- Output MUST be a single, valid JSON object matching the exact schema below.
- Do NOT wrap your JSON in markdown code blocks (\`\`\`json). Output raw JSON only.
- Language: Generate all text values in ${isEn ? "English" : "Thai"}.

REQUIRED JSON SCHEMA:
{
  "safety": "none" | "sensitive" | "crisis",
  "originalQuestion": "The user's exact original question without alterations",
  "questionIntent": "feelings" | "relationship" | "career" | "decision" | "future" | "general" | "yes_no",
  "questionScope": "The specific thematic scope of the question",
  "directAnswer": "The direct, clear answer to the user's question based on the cards as a whole. If there is a conditional follow-up, include both the primary answer and the conditional follow-up answer here.",
  "confidence": "Nuanced statement of certainty/tendency based on card energy, acknowledging personal agency.",
  "overview": "Overview answering the user's query and setting the tone.",
  "answer": {
    "primary": {
      "direction": "likely_yes" | "likely_no" | "mixed" | "unclear",
      "text": "Direct, clear answer to the primary question.",
      "evidenceCardIds": ["cardId1", "cardId2"]
    },
    "followUps": [
      {
        "id": "followup-1",
        "text": "The follow-up question text",
        "answer": "The answer to the follow-up question using this same card spread",
        "evidenceCardIds": ["cardId3"]
      }
    ]
  },
  "cards": [
    {
      "cardId": "string matching the drawn card's cardId",
      "positionKey": "string matching the position key",
      "meaningInContext": "What this card means specifically in the context of the user's question and this position.",
      "contributionToAnswer": "How this card specifically acts as evidence supporting the direct answer.",
      "interpretation": "A cohesive paragraph combining the contextual meaning and its evidence for the answer."
    }
  ],
  "synthesis": "How the cards interact and support the direct answer together (incorporating elements, arcana ratio, repeated ranks).",
  "advice": "Grounded, empowering, actionable steps the user should take (distinct from the direct answer).",
  "reflectionQuestion": "One introspective, open-ended question to help the user reflect deeper.",
  "conclusion": "A concise concluding sentence reinforcing the direct answer."
}`;
}

/**
 * Builds user prompt containing the question, scope lock, contextual card positions, and grounded facts.
 */
export function buildUserPrompt(params: BuildPromptParams): string {
  const { question, spreadId, cards, analysis, locale = "th" } = params;
  const spreadDef = getSpreadDefinition(spreadId);
  const isEn = locale.toLowerCase().startsWith("en");
  const qAnalysis = params.questionAnalysis || analyzeQuestion(question, locale);

  const cardsListFormatted = cards
    .map((drawn, idx) => {
      const card = getCardById(drawn.cardId);
      const pos = spreadDef.positions[idx];
      const isReversed = drawn.orientation === "reversed";
      const cardName = card ? card.name : drawn.cardId;
      const meaningText = card
        ? isReversed
          ? card.meaning.full.reversed || card.meaning.short.reversed
          : card.meaning.full.upright || card.meaning.short.upright
        : "";
      const keywords = card
        ? (isReversed ? card.keywords.reversed : card.keywords.upright).join(", ")
        : "";

      return `[Card ${idx + 1}]
- ID: ${drawn.cardId}
- Card Name: ${cardName} (${drawn.orientation})
- Spread Position: ${pos?.name ?? `Position ${idx + 1}`} (Position Key: '${drawn.positionKey}')
- Position Role: ${pos?.description ?? ""}
- Core Archetype: ${meaningText}
- Keywords: ${keywords}
- ROLE IN READING: How does this card in this position specifically provide evidence to answer: "${qAnalysis.primary.text}"?`;
    })
    .join("\n\n");

  let resolutionInstruction = "";
  if (qAnalysis.resolution.type === "conditional_follow_up") {
    resolutionInstruction = `\nCRITICAL RESOLUTION STRATEGY (CONDITIONAL FOLLOW-UP):
The user inquiry contains a primary question and a conditional follow-up:
- Primary: "${qAnalysis.primary.text}"
${qAnalysis.followUps.map((f) => `- Follow-up (${f.type}): Condition="${f.condition}", Normalized="${f.normalizedQuestion}"`).join("\n")}
You MUST answer BOTH in this single reading using these exact cards.
1. Answer the primary question in 'answer.primary' with direction ('likely_yes', 'likely_no', 'mixed', or 'unclear') and direct text.
2. In 'answer.followUps', explain what happens if the condition occurs (e.g. if not on time), using the outcome/future card as evidence.
DO NOT tell the user to draw a new spread! Both questions share the same context.`;
  } else if (qAnalysis.resolution.type === "clarifying_follow_up") {
    resolutionInstruction = `\nCRITICAL RESOLUTION STRATEGY (CLARIFYING FOLLOW-UP):
The user asks for detail about the primary event:
- Primary: "${qAnalysis.primary.text}"
${qAnalysis.followUps.map((f) => `- Follow-up: "${f.normalizedQuestion}"`).join("\n")}
Answer both parts cohesively within this single reading using the drawn cards.`;
  } else if (qAnalysis.resolution.type === "clarify") {
    resolutionInstruction = `\nCRITICAL RESOLUTION STRATEGY (CLARIFICATION NEEDED):
The question refers to a relative or conditional antecedent without sufficient context (${qAnalysis.resolution.missingContext}).
Do NOT assume or fabricate what this refers to. Politely indicate in 'directAnswer' and 'overview' that clarification is needed to provide an accurate interpretation.`;
  } else if (qAnalysis.resolution.type === "independent_multi_question") {
    resolutionInstruction = `\nNOTE ON INDEPENDENT INQUIRIES:
The user asked about two distinct, unrelated topics.
Lock this reading strictly to the primary question: "${qAnalysis.primary.text}".
Set scopeNotice indicating that the secondary independent topic requires a separate spread.`;
  }

  return `USER QUESTION:
"${question}"

QUESTION ANALYSIS:
- Intent: ${qAnalysis.primary.intent}
- Scope Lock: ${qAnalysis.primary.scope}${qAnalysis.primary.timeframe ? ` (Timeframe: ${qAnalysis.primary.timeframe})` : ""}
- Resolution Type: ${qAnalysis.resolution.type}
${resolutionInstruction}

SPREAD CONTEXT:
- Spread: ${spreadDef.name} (${spreadDef.cardCount} cards)
- Spread Summary: ${spreadDef.description}

DRAWN CARDS (STRICT LIST - USE AS SUPPORTING EVIDENCE):
${cardsListFormatted}

GROUNDED FACTS FROM TAROT ENGINE:
- Major Arcana Count: ${analysis.majorCount}/${cards.length} (${(analysis.majorRatio * 100).toFixed(0)}%)
- Dominant Element: ${analysis.dominantElement ?? "Balanced"}
- Repeated Ranks: ${analysis.repeatedRanks.length > 0 ? analysis.repeatedRanks.join(", ") : "None"}
- Court Cards: ${analysis.courtCards.length > 0 ? analysis.courtCards.join(", ") : "None"}
- Reversed Cards Ratio: ${(analysis.reversedRatio * 100).toFixed(0)}%

INSTRUCTIONS FOR GENERATION:
1. Formulate 'directAnswer' and 'answer.primary' FIRST: Answer "${qAnalysis.primary.text}" clearly with a definite direction (likely_yes, likely_no, mixed, unclear).
2. If there are conditional follow-ups, answer them in 'answer.followUps' using this same spread.
3. In 'cards', explain 'meaningInContext' and 'contributionToAnswer' strictly tailored to the question and position.
4. In 'synthesis', demonstrate how the cards combine into a unified story supporting the answer.
5. In 'advice', provide actionable steps (do NOT substitute advice for the direct answer).
6. Output strictly valid JSON matching the schema in ${isEn ? "English" : "Thai"}.`;
}

/**
 * Builds a prompt for One-shot Self-Repair when initial AI output violates validation rules (SDD §5).
 */
export function buildSelfRepairPrompt(
  previousOutput: string,
  validationError: string,
  allowedCardIds: string[]
): string {
  return `Your previous JSON response was rejected by our automated Tarot Invariant Validator due to the following error:
${validationError}

ALLOWED CARDS FOR THIS READING:
${allowedCardIds.join(", ")}

STRICT REPAIR INSTRUCTIONS:
1. Fix the error immediately.
2. Ensure 'directAnswer' and 'answer.primary' directly and clearly answer the user's question first.
3. Ensure every card has 'meaningInContext' and 'contributionToAnswer' tailored to the question.
4. Under NO circumstances mention any undrawn Tarot cards.
5. Output ONLY the corrected valid JSON object with no markdown wrappers.

PREVIOUS RESPONSE FOR REVISION:
${previousOutput.slice(0, 3000)}`;
}
