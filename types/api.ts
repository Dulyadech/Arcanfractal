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
 * Health status indicators for the application and its subsystems (SDD §9.3).
 */
export type HealthStatus = "ok" | "degraded" | "error";
export type ProviderHealthStatus = "healthy" | "degraded" | "unconfigured" | "error";

export interface AIProviderHealthInfo {
  name: string;
  status: ProviderHealthStatus;
  isPrimary: boolean;
  model: string;
  latencyMs?: number;
  message?: string;
}

/**
 * Successful response from GET /api/health (SDD §9.3).
 */
export interface HealthApiResponse {
  status: HealthStatus;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    tarotEngine: {
      status: "ok";
      catalogCardsCount: number;
      activeDrawSessions: number;
    };
    aiProviders: {
      primary: AIProviderHealthInfo;
      backup: AIProviderHealthInfo;
      fallbackEngine: {
        status: "ok";
      };
    };
  };
}

/**
 * Standard error response structure for API endpoints.
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

