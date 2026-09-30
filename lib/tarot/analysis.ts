import { getCardById } from "@/data/cards";
import type { DrawnCard, CardElement } from "@/types/tarot";
import type { ReadingAnalysis } from "@/types/reading";

const COURT_CARD_NUMBERS = new Set([11, 12, 13, 14]);

/**
 * Calculates deterministic statistics and grounded facts from drawn Tarot cards (SDD §4.6, §8).
 *
 * This function calculates:
 * - majorCount & majorRatio: Indicates structural life lessons (>= 60%) vs daily management
 * - dominantElement: The prevailing elemental energy (fire, water, air, earth) or null if tied/empty
 * - repeatedRanks: Card numbers that appear 2 or more times across the spread
 * - courtCards: Names of any court cards (Page, Knight, Queen, King) representing key personalities
 * - reversedRatio: Percentage of cards in reversed orientation
 *
 * @param drawnCards Array of DrawnCard objects selected in a reading.
 * @returns ReadingAnalysis object with deterministic facts.
 */
export function calculateReadingAnalysis(drawnCards: readonly DrawnCard[]): ReadingAnalysis {
  const totalCards = drawnCards.length;

  if (totalCards === 0) {
    return {
      majorCount: 0,
      majorRatio: 0,
      dominantElement: null,
      repeatedRanks: [],
      courtCards: [],
      reversedRatio: 0,
    };
  }

  let majorCount = 0;
  let reversedCount = 0;
  const elementCounts: Record<CardElement, number> = {
    fire: 0,
    water: 0,
    air: 0,
    earth: 0,
  };
  const rankFrequency = new Map<number, number>();
  const courtCards: string[] = [];

  for (const drawn of drawnCards) {
    // 1. Orientation check
    if (drawn.orientation === "reversed") {
      reversedCount++;
    }

    // 2. Card metadata lookup
    const card = drawn.card ?? getCardById(drawn.cardId);
    if (!card) {
      continue;
    }

    // 3. Major Arcana check
    if (card.arcana === "major") {
      majorCount++;
    }

    // 4. Element count
    if (card.element in elementCounts) {
      elementCounts[card.element]++;
    }

    // 5. Rank tracking for repeated ranks
    const currentRankCount = rankFrequency.get(card.number) ?? 0;
    rankFrequency.set(card.number, currentRankCount + 1);

    // 6. Court card detection (Minor Arcana Page, Knight, Queen, King)
    if (card.arcana === "minor" && COURT_CARD_NUMBERS.has(card.number)) {
      courtCards.push(card.name);
    }
  }

  // Calculate dominant element (highest count, null if tie or all zero)
  let dominantElement: CardElement | null = null;
  let maxElementCount = 0;
  let isTie = false;

  for (const [elem, count] of Object.entries(elementCounts) as [CardElement, number][]) {
    if (count > maxElementCount) {
      dominantElement = elem;
      maxElementCount = count;
      isTie = false;
    } else if (count === maxElementCount && count > 0) {
      isTie = true;
    }
  }

  if (isTie || maxElementCount === 0) {
    dominantElement = null;
  }

  // Find ranks repeated 2 or more times
  const repeatedRanks: number[] = [];
  for (const [rank, count] of rankFrequency.entries()) {
    if (count >= 2) {
      repeatedRanks.push(rank);
    }
  }
  repeatedRanks.sort((a, b) => a - b);

  const majorRatio = Number((majorCount / totalCards).toFixed(2));
  const reversedRatio = Number((reversedCount / totalCards).toFixed(2));

  return {
    majorCount,
    majorRatio,
    dominantElement,
    repeatedRanks,
    courtCards,
    reversedRatio,
  };
}
