import type { DrawnCard, CardElement } from "./tarot";
import type { SpreadId } from "./spread";
import type { AIInterpretationPayload } from "./ai";

/**
 * Lifecycle states of the Tarot reading ritual (SDD §7, §7.1).
 */
export type ReadingLifecycleState =
  "NEW" | "SHUFFLED" | "SELECTING" | "REVEALING" | "COMPLETE" | "INTERPRETING" | "RESULT";

/**
 * Final reading status indicator (SDD §8).
 */
export type ReadingStatus = "complete" | "fallback";

/**
 * Deterministic facts and statistics calculated from drawn cards (SDD §4.6, §8).
 */
export interface ReadingAnalysis {
  majorCount: number;
  majorRatio: number;
  dominantElement: CardElement | null;
  repeatedRanks: number[];
  courtCards: string[];
  reversedRatio: number;
}

/**
 * Persisted Tarot reading record for state machine and history (SDD §8).
 */
export interface ReadingRecord {
  id: string;
  createdAt: string;
  question: string;
  spreadId: SpreadId;
  reversedEnabled: boolean;
  cards: DrawnCard[];
  analysis: ReadingAnalysis;
  interpretation: AIInterpretationPayload | null;
  status: ReadingStatus;
}
