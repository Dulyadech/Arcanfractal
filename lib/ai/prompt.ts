import { getSpreadDefinition } from "@/data/spreads";
import { getCardById } from "@/data/cards";
import type { SpreadId } from "@/types/spread";
import type { DrawnCard } from "@/types/tarot";
import type { ReadingAnalysis } from "@/types/reading";

export interface BuildPromptParams {
  question: string;
  spreadId: SpreadId;
  cards: DrawnCard[];
  analysis: ReadingAnalysis;
  locale?: string;
}

/**
 * System prompt establishing Tarot interpreter persona and enforcing the 3 absolute rules (SDD §5.1).
 */
export function buildSystemPrompt(locale: string = "th"): string {
  const isEn = locale.toLowerCase().startsWith("en");

  return `You are Arcanfractal, a wise, grounded, and deeply compassionate Tarot reader.
Your purpose is to provide empowering, psychologically reflective, and actionable insights.

ABSOLUTE PROHIBITIONS (SDD §5.1 - Violations will be rejected by automated guards):
1. NO CARD MODIFICATION: You MUST interpret ONLY the exact cards provided in the spread. Do not replace, re-order, or omit any card.
2. ZERO HALLUCINATION (UNDRAWN CARD GUARD): Under NO circumstances mention or reference any Tarot card that was NOT drawn in this spread. If you mention any card other than the specified drawn cards, your response will be flagged and discarded.
3. NO FATALISTIC CLAIMS: Never predict death, terminal illness, legal verdicts, or claim to read other people's private minds. Focus on the user's agency, growth, and self-awareness.

OUTPUT REQUIREMENTS:
- Output MUST be a single, valid JSON object matching the exact schema specified below.
- Do NOT wrap your JSON in markdown code blocks like \`\`\`json. Output raw JSON only.
- Language: Generate all descriptive text in ${isEn ? "English" : "Thai"}.

JSON SCHEMA:
{
  "safety": "none" | "sensitive" | "crisis",
  "overview": "Clear summary connecting the user's question to the overarching energy of the spread.",
  "cards": [
    {
      "cardId": "string matching the drawn card's cardId",
      "positionKey": "string matching the position key",
      "interpretation": "Insightful interpretation of this card in this specific position."
    }
  ],
  "synthesis": "How the cards interact and tell a cohesive narrative, incorporating the grounded analysis facts (major ratio, elements, patterns).",
  "advice": "Practical, grounded, and empowering steps the user can take.",
  "reflectionQuestion": "One open-ended, introspective question to encourage the user's own inner reflection."
}`;
}

/**
 * Builds user prompt containing the question, drawn cards, and grounded analysis facts.
 */
export function buildUserPrompt(params: BuildPromptParams): string {
  const { question, spreadId, cards, analysis, locale = "th" } = params;
  const spreadDef = getSpreadDefinition(spreadId);
  const isEn = locale.toLowerCase().startsWith("en");

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
- Name: ${cardName}
- Orientation: ${drawn.orientation}
- Position: ${pos?.name ?? `Position ${idx + 1}`} (${pos?.description ?? ""})
- Position Key: ${drawn.positionKey}
- Keywords: ${keywords}
- Core Meaning: ${meaningText}`;
    })
    .join("\n\n");

  return `USER QUESTION:
"${question}"

SPREAD TYPE:
${spreadDef.name} (${spreadDef.cardCount} cards)
Description: ${spreadDef.description}

DRAWN CARDS (STRICT LIST - ONLY INTERPRET THESE ${cards.length} CARDS):
${cardsListFormatted}

GROUNDED ANALYSIS FACTS:
- Major Arcana Count: ${analysis.majorCount}/${cards.length} (${(analysis.majorRatio * 100).toFixed(0)}%)
- Dominant Element: ${analysis.dominantElement ?? "Balanced"}
- Repeated Ranks: ${analysis.repeatedRanks.length > 0 ? analysis.repeatedRanks.join(", ") : "None"}
- Court Cards: ${analysis.courtCards.length > 0 ? analysis.courtCards.join(", ") : "None"}
- Reversed Cards Ratio: ${(analysis.reversedRatio * 100).toFixed(0)}%

INSTRUCTIONS:
Please provide your interpretation as valid JSON following the required schema in ${isEn ? "English" : "Thai"}.
Remember: Do NOT mention any cards outside this list of ${cards.length} cards.`;
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
1. Fix the specified error immediately.
2. If the error mentions undrawn cards, completely remove any reference to those undrawn cards.
3. Ensure every card in the 'cards' array matches one of the allowed cards above.
4. Output ONLY the corrected valid JSON object with no commentary or markdown wrappers.

PREVIOUS RESPONSE FOR REVISION:
${previousOutput.slice(0, 3000)}`;
}
