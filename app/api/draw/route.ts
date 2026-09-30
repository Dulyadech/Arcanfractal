import { NextResponse } from "next/server";
import { isValidSpreadId, getSpreadDefinition } from "@/data/spreads";
import { createShuffledDeck, calculateReadingAnalysis } from "@/lib/tarot";
import type { DrawApiResponse, ApiErrorResponse } from "@/types/api";
import type { DrawnCard } from "@/types/tarot";

/**
 * POST /api/draw (SDD §9.1, Q-004)
 *
 * Generates a freshly shuffled 78-card deck for a new reading session.
 * Golden rule: "Shuffle once per Reading, select multiple cards, interpret once."
 *
 * Request Body:
 * - spreadId: "single" | "three-timeline" | "three-guidance" | "five-path"
 * - reversedEnabled?: boolean (defaults to false)
 *
 * Response:
 * - drawId: Unique session UUID
 * - spreadId: The requested spread ID
 * - deck: Array of all 78 ShuffledCard items for client-side True Index Selection
 * - analysis: Initial candidate analysis calculated for the spread's card count
 */
export async function POST(request: Request): Promise<NextResponse<DrawApiResponse | ApiErrorResponse>> {
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

  const { spreadId, reversedEnabled } = body as Record<string, unknown>;

  // 1. Validate spreadId
  if (!spreadId || typeof spreadId !== "string" || !isValidSpreadId(spreadId)) {
    return NextResponse.json(
      {
        error:
          "Invalid or missing 'spreadId'. Must be one of: 'single', 'three-timeline', 'three-guidance', 'five-path'.",
        code: "INVALID_SPREAD_ID",
      },
      { status: 400 }
    );
  }

  // 2. Validate reversedEnabled if provided
  if (reversedEnabled !== undefined && typeof reversedEnabled !== "boolean") {
    return NextResponse.json(
      {
        error: "Field 'reversedEnabled' must be a boolean if provided.",
        code: "INVALID_REVERSED_ENABLED",
      },
      { status: 400 }
    );
  }

  // 3. Generate unique draw session ID
  const drawId = crypto.randomUUID();

  // 4. Create shuffled 78-card deck using Web Crypto API (Shuffle Once Engine, SDD §4.1)
  const deck = createShuffledDeck({
    reversedEnabled: Boolean(reversedEnabled),
  });

  // 5. Calculate initial reading analysis for the spread
  const spreadDef = getSpreadDefinition(spreadId);
  const candidateCards: DrawnCard[] = deck.slice(0, spreadDef.cardCount).map((card, index) => ({
    positionIndex: index,
    positionKey: spreadDef.positions[index]?.key ?? String(index),
    cardId: card.cardId,
    orientation: card.orientation,
  }));
  const analysis = calculateReadingAnalysis(candidateCards);

  const responsePayload: DrawApiResponse = {
    drawId,
    spreadId,
    deck,
    analysis,
  };

  return NextResponse.json(responsePayload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
