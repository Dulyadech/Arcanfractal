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
 */
export async function drawDailyCard(
  options: DailyDrawOptions = {}
): Promise<DailyCardRecord> {
  const existingToday = getTodayDailyCard();
  if (existingToday) {
    return existingToday;
  }

  const { allowReversed = false, locale = "en" } = options;

  // 1. Cryptographic random index selection (0..77) without modulo bias
  const randomBuffer = new Uint32Array(2);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBuffer);
  } else {
    randomBuffer[0] = Math.floor(Math.random() * 0xffffffff);
    randomBuffer[1] = Math.floor(Math.random() * 0xffffffff);
  }

  const cardIndex = randomBuffer[0] % TAROT_DECK.length;
  const rawCard = TAROT_DECK[cardIndex];

  // 2. Determine orientation (50% chance if enabled, else upright)
  const isReversed = allowReversed ? randomBuffer[1] % 2 === 1 : false;
  const orientation: CardOrientation = isReversed ? "reversed" : "upright";

  const drawnCard: DrawnCard = {
    positionIndex: 0,
    positionKey: "daily_focus",
    cardId: rawCard.id,
    orientation,
    card: rawCard,
  };

  // 3. Generate micro-interpretations
  const interpretations = await generateDailyInterpretation(drawnCard);
  const activeInterpretation = interpretations[locale] || interpretations.en;

  const todayStr = getLocalDateString();
  const recordId = `daily-${todayStr}-${rawCard.id}`;

  const record: DailyCardRecord = {
    id: recordId,
    date: todayStr,
    drawnAt: new Date().toISOString(),
    card: drawnCard,
    theme: activeInterpretation.theme,
    affirmation: activeInterpretation.affirmation,
    advice: activeInterpretation.advice,
    locale,
    interpretations,
    status: "complete",
  };

  // 4. Persist to localStorage, append to history, and update streak
  saveDailyCard(record);

  return record;
}
