import { NextResponse } from "next/server";
import { TAROT_DECK, getCardById } from "@/data/cards";
import { getLocalDateString } from "@/lib/storage/daily-card";
import { generateDailyInterpretation } from "@/lib/tarot/daily-interpretation";
import type { CardOrientation, DrawnCard } from "@/types/tarot";
import type { DailyCardRecord } from "@/types/daily";

function getRandomCard(allowReversed = false): { card: (typeof TAROT_DECK)[number]; orientation: CardOrientation } {
  const randomBuffer = new Uint32Array(2);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBuffer);
  } else {
    randomBuffer[0] = Math.floor(Math.random() * 0xffffffff);
    randomBuffer[1] = Math.floor(Math.random() * 0xffffffff);
  }

  const cardIndex = randomBuffer[0] % TAROT_DECK.length;
  const card = TAROT_DECK[cardIndex];
  const isReversed = allowReversed ? randomBuffer[1] % 2 === 1 : false;
  const orientation: CardOrientation = isReversed ? "reversed" : "upright";

  return { card, orientation };
}

async function buildDailyCardResponse(params: {
  cardId?: string;
  orientation?: CardOrientation;
  locale?: "th" | "en";
  allowReversed?: boolean;
}): Promise<DailyCardRecord> {
  const { cardId, locale = "th", allowReversed = false } = params;

  let selectedRawCard = cardId ? getCardById(cardId) : null;
  let orientation: CardOrientation = params.orientation || "upright";

  if (!selectedRawCard) {
    const randomPick = getRandomCard(allowReversed);
    selectedRawCard = randomPick.card;
    if (!params.orientation) {
      orientation = randomPick.orientation;
    }
  }

  const drawnCard: DrawnCard = {
    positionIndex: 0,
    positionKey: "daily_focus",
    cardId: selectedRawCard.id,
    orientation,
    card: selectedRawCard,
  };

  const interpretations = await generateDailyInterpretation(drawnCard, { useAi: true });
  const activeInterpretation = interpretations[locale] || interpretations.th;
  const todayStr = getLocalDateString();

  return {
    id: `daily-${todayStr}-${selectedRawCard.id}`,
    date: todayStr,
    drawnAt: new Date().toISOString(),
    card: drawnCard,
    theme: activeInterpretation.theme,
    overview: activeInterpretation.overview,
    affirmation: activeInterpretation.affirmation,
    advice: activeInterpretation.advice,
    locale,
    interpretations,
    status: "complete",
  };
}

/**
 * GET /api/daily
 * Query parameters:
 * - locale: "th" | "en" (default: "th")
 * - cardId: optional specific card ID (e.g. "fool", "magician", "wands-01")
 * - orientation: "upright" | "reversed" (default: "upright" or random if allowReversed)
 * - allowReversed: "true" | "false" (default: false)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") === "en" ? "en" : "th";
    const cardId = searchParams.get("cardId") || undefined;
    const rawOrientation = searchParams.get("orientation");
    const orientation =
      rawOrientation === "reversed" || rawOrientation === "upright"
        ? (rawOrientation as CardOrientation)
        : undefined;
    const allowReversed = searchParams.get("allowReversed") === "true";

    if (cardId && !getCardById(cardId)) {
      return NextResponse.json(
        { error: `Card with id '${cardId}' not found.`, code: "INVALID_CARD_ID" },
        { status: 400 }
      );
    }

    const record = await buildDailyCardResponse({
      cardId,
      orientation,
      locale,
      allowReversed,
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("GET /api/daily error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while generating daily reading.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/daily
 * Request body:
 * - locale?: "th" | "en" (default: "th")
 * - cardId?: string (e.g. "the-fool", "magician")
 * - orientation?: "upright" | "reversed"
 * - allowReversed?: boolean
 */
export async function POST(request: Request) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      // Empty or invalid body is accepted as random draw
    }

    const locale = body.locale === "en" ? "en" : "th";
    const cardId = typeof body.cardId === "string" ? body.cardId.trim() : undefined;
    const rawOrientation = body.orientation;
    const orientation =
      rawOrientation === "reversed" || rawOrientation === "upright"
        ? (rawOrientation as CardOrientation)
        : undefined;
    const allowReversed = Boolean(body.allowReversed);

    if (cardId && !getCardById(cardId)) {
      return NextResponse.json(
        { error: `Card with id '${cardId}' not found.`, code: "INVALID_CARD_ID" },
        { status: 400 }
      );
    }

    const record = await buildDailyCardResponse({
      cardId,
      orientation,
      locale,
      allowReversed,
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("POST /api/daily error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while generating daily reading.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
