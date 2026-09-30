import { NextResponse } from "next/server";
import { TAROT_DECK } from "@/data/cards";
import { getDrawSessionCount } from "@/lib/tarot";
import { checkAIProvidersHealth } from "@/lib/ai";
import { checkRateLimit, createRateLimitResponse, applyRateLimitHeaders } from "@/lib/security";
import type { HealthApiResponse, HealthStatus, ApiErrorResponse } from "@/types/api";

/**
 * GET /api/health (SDD §9.3)
 *
 * Verifies system readiness, Tarot engine integrity, and AI provider statuses.
 *
 * Query Parameters:
 * - quick?: "true" | "1" (skips live network ping to external AI endpoints)
 *
 * Response:
 * - HealthApiResponse with status: "ok" | "degraded" | "error"
 */
export async function GET(
  request: Request
): Promise<NextResponse<HealthApiResponse | ApiErrorResponse>> {
  // IP-based Rate Limiting for Health Check (generous 60 req/min)
  const rateLimit = checkRateLimit(request, { prefix: "health", maxRequests: 60 });
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  try {
    const url = new URL(request.url);
    const isQuick = url.searchParams.get("quick") === "true" || url.searchParams.get("quick") === "1";

    // 1. Check AI subsystem health
    const aiServices = await checkAIProvidersHealth({
      skipNetwork: isQuick,
      timeoutMs: 3000,
    });

    // 2. Determine overall health status
    // If either primary or backup is healthy, overall is "ok".
    // If both are unconfigured or degraded, but fallback engine is operational, status is "degraded".
    let overallStatus: HealthStatus = "degraded";
    if (aiServices.primary.status === "healthy" || aiServices.backup.status === "healthy") {
      overallStatus = "ok";
    }

    const payload: HealthApiResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      services: {
        tarotEngine: {
          status: "ok",
          catalogCardsCount: TAROT_DECK.length,
          activeDrawSessions: getDrawSessionCount(),
        },
        aiProviders: aiServices,
      },
    };

    const response = NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });

    return applyRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("Health check encountered an error:", error);

    const errorPayload: HealthApiResponse = {
      status: "error",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      services: {
        tarotEngine: {
          status: "ok",
          catalogCardsCount: TAROT_DECK.length,
          activeDrawSessions: getDrawSessionCount(),
        },
        aiProviders: {
          primary: {
            name: "KKU IntelliShare",
            status: "error",
            isPrimary: true,
            model: "unknown",
            message: error instanceof Error ? error.message : "Health check failed.",
          },
          backup: {
            name: "Google Gemini",
            status: "error",
            isPrimary: false,
            model: "unknown",
          },
          fallbackEngine: {
            status: "ok",
          },
        },
      },
    };

    return NextResponse.json(errorPayload, {
      status: 500,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }
}
