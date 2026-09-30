import { NextResponse } from "next/server";
import { validateReadingInvariant, calculateReadingAnalysis } from "@/lib/tarot";
import { interpretTarotSpread } from "@/lib/ai";
import { checkRateLimit, createRateLimitResponse, applyRateLimitHeaders } from "@/lib/security";
import type { InterpretApiResponse, ApiErrorResponse } from "@/types/api";
import type { SpreadId } from "@/types/spread";
import type { DrawnCard } from "@/types/tarot";

/**
 * POST /api/interpret (SDD §9.2, §5)
 *
 * Receives drawn cards, user question, spread, and session ID.
 * Executes:
 * 1. Server Invariant Check (SDD §5 Guard) to ensure cards match drawId 100%.
 * 2. Grounded analysis re-computation.
 * 3. AI interpretation orchestration (KKU Primary -> Gemini Backup -> Self-Repair -> Deterministic Fallback).
 *
 * Request Body:
 * - drawId: string
 * - question: string (5-500 chars)
 * - spreadId: "single" | "three-timeline" | "three-guidance" | "five-path"
 * - cards: DrawnCard[]
 * - analysis: ReadingAnalysis
 * - locale?: string (e.g. "th", "en")
 *
 * Response:
 * - AIInterpretationPayload (status: 200)
 */
export async function POST(
  request: Request
): Promise<NextResponse<InterpretApiResponse | ApiErrorResponse>> {
  // 1. IP-based Rate Limiting (SDD §3, §7)
  const rateLimit = checkRateLimit(request, { prefix: "interpret" });
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body.", code: "INVALID_JSON" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be a valid JSON object.", code: "INVALID_BODY" },
      { status: 400 }
    );
  }

  const { drawId, question, spreadId, cards, locale } = body as Record<string, unknown>;

  // 1. Server Invariant Check (SDD §5 Guard)
  const invariantResult = validateReadingInvariant({
    drawId,
    question,
    spreadId,
    cards,
  });

  if (!invariantResult.valid) {
    return NextResponse.json(
      { error: invariantResult.reason, code: invariantResult.code },
      { status: 400 }
    );
  }

  const validatedCards = cards as DrawnCard[];
  const validatedSpreadId = spreadId as SpreadId;
  const validatedQuestion = (question as string).trim();
  const requestLocale = typeof locale === "string" ? locale : "th";

  // 2. Re-compute deterministic analysis on server to guarantee grounded facts integrity (SDD §4.6)
  const computedAnalysis = calculateReadingAnalysis(validatedCards);

  try {
    // 3. Orchestrate interpretation through Tarot AI Adapter
    const interpretation = await interpretTarotSpread({
      question: validatedQuestion,
      spreadId: validatedSpreadId,
      cards: validatedCards,
      analysis: computedAnalysis,
      locale: requestLocale,
    });

    const response = NextResponse.json(interpretation, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });

    return applyRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("Error during interpretation pipeline:", error);

    return NextResponse.json(
      {
        error: "Failed to generate Tarot interpretation.",
        code: "INTERPRETATION_ERROR",
      },
      { status: 500 }
    );
  }
}
