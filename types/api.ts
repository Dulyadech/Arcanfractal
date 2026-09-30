import type { SpreadId } from "./spread";
import type { ShuffledCard, DrawnCard } from "./tarot";
import type { ReadingAnalysis } from "./reading";
import type { AIInterpretationPayload } from "./ai";

/**
 * Request payload for POST /api/draw (SDD §9.1).
 */
export interface DrawApiRequest {
  spreadId: SpreadId;
  reversedEnabled?: boolean;
}

/**
 * Successful response from POST /api/draw (SDD §9.1, Q-004).
 */
export interface DrawApiResponse {
  drawId: string;
  spreadId: SpreadId;
  deck: ShuffledCard[];
  analysis: ReadingAnalysis;
}

/**
 * Request payload for POST /api/interpret (SDD §9.2).
 */
export interface InterpretApiRequest {
  drawId: string;
  question: string;
  spreadId: SpreadId;
  cards: DrawnCard[];
  analysis: ReadingAnalysis;
  locale?: string;
}

/**
 * Successful response from POST /api/interpret (SDD §9.2, §5.2).
 */
export type InterpretApiResponse = AIInterpretationPayload;

/**
 * Standard error response structure for API endpoints.
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}
