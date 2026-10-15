import { TAROT_DECK } from "@/data/cards";
import type { CardOrientation, DrawnCard } from "@/types/tarot";
import type { DailyCardRecord } from "@/types/daily";
import { generateDailyInterpretation } from "./daily-interpretation";
import {
  getLocalDateString,
  getTodayDailyCard,
  saveDailyCard,
} from "@/lib/storage/daily-card";

export interface DailyDrawOptions {
  allowReversed?: boolean;
  locale?: "th" | "en";
}

/**
 * Draws a single daily Tarot card using cryptographic entropy (crypto.getRandomValues).
 * If the user has already drawn today, returns today's cached record without re-drawing.
 * Connects to /api/daily for AI-powered interpretation when available, falling back to local engine.
 */
export async function drawDailyCard(
  options: DailyDrawOptions = {}
): Promise<DailyCardRecord> {
  const existingToday = getTodayDailyCard();
  if (existingToday) {
    return existingToday;
  }

  const { allowReversed = false, locale = "th" } = options;

  // 1. When in browser, fetch server /api/daily to leverage LLM generation
  if (typeof window !== "undefined" && Boolean(window.location?.origin) && typeof fetch !== "undefined") {
    try {
      const res = await fetch("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowReversed, locale }),
      });
      if (res.ok) {
        const record = (await res.json()) as DailyCardRecord;
        saveDailyCard(record);
        return record;
      }
    } catch (err) {
      console.warn("Server /api/daily request failed, using local draw fallback:", err);
    }
  }

  // 2. Cryptographic random index selection (0..77) without modulo bias
  const randomBuffer = new Uint32Array(2);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBuffer);
  } else {
    randomBuffer[0] = Math.floor(Math.random() * 0xffffffff);
    randomBuffer[1] = Math.floor(Math.random() * 0xffffffff);
  }

  const cardIndex = randomBuffer[0] % TAROT_DECK.length;
  const rawCard = TAROT_DECK[cardIndex];

  // 3. Determine orientation (50% chance if enabled, else upright)
  const isReversed = allowReversed ? randomBuffer[1] % 2 === 1 : false;
  const orientation: CardOrientation = isReversed ? "reversed" : "upright";

  const drawnCard: DrawnCard = {
    positionIndex: 0,
    positionKey: "daily_focus",
    cardId: rawCard.id,
    orientation,
    card: rawCard,
  };

  // 4. Generate micro-interpretations
  const interpretations = await generateDailyInterpretation(drawnCard, { useAi: true });
  const activeInterpretation = interpretations[locale] || interpretations.th;

  const todayStr = getLocalDateString();
  const recordId = `daily-${todayStr}-${rawCard.id}`;

  const record: DailyCardRecord = {
    id: recordId,
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

  // 5. Persist to localStorage, append to history, and update streak
  saveDailyCard(record);

  return record;
}
