/**
 * Safety flag detected in the AI interpretation (SDD §5.2).
 */
export type ReadingSafety = "none" | "sensitive" | "crisis";

/**
 * Structured output payload returned by the AI interpretation engine (SDD §5.2).
 */
export interface AIInterpretationPayload {
  safety: ReadingSafety;
  overview: string;
  cards: {
    cardId: string;
    positionKey: string;
    interpretation: string;
  }[];
  synthesis: string;
  advice: string;
  reflectionQuestion: string;
}
