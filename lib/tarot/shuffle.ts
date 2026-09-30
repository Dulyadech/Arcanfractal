import { TAROT_DECK } from "@/data/cards";
import type { ShuffledCard, TarotCard, CardOrientation } from "@/types/tarot";
import { getSecureRandomBoolean, getSecureRandomInt } from "./random";

export interface ShuffleOptions {
  /**
   * Whether reversed cards are enabled. If false, all cards will be upright (SDD §3, Q-002).
   * Defaults to false.
   */
  reversedEnabled?: boolean;

  /**
   * Optional custom deck to shuffle (defaults to all 78 TAROT_DECK cards).
   */
  customDeck?: readonly TarotCard[];
}

/**
 * Performs an immutable, unbiased Fisher-Yates (Durstenfeld) shuffle on an array
 * using Web Crypto API randomness with zero modulo bias (SDD §4.1, §7.1).
 *
 * Time Complexity: O(N)
 * Space Complexity: O(N)
 *
 * @param array The array to shuffle. The original array is never mutated.
 * @returns A new shuffled array containing all elements in randomized order.
 */
export function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  const length = result.length;

  for (let i = length - 1; i > 0; i--) {
    // Generate secure random index j in [0, i] inclusive (i + 1 possibilities)
    const j = getSecureRandomInt(i + 1);
    // Swap elements at i and j
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result;
}

/**
 * Randomizes a card's orientation independently (50% upright, 50% reversed).
 * If reversedEnabled is false, always returns "upright" (SDD §3, Q-002).
 *
 * @param reversedEnabled Whether reversals are enabled in the reading.
 * @returns CardOrientation ("upright" | "reversed")
 */
export function randomizeOrientation(reversedEnabled = true): CardOrientation {
  if (!reversedEnabled) {
    return "upright";
  }
  return getSecureRandomBoolean(0.5) ? "reversed" : "upright";
}

/**
 * Creates a fully shuffled 78-card Tarot deck for a reading (SDD §4.1, §9.1).
 *
 * Follows the golden rule: "Shuffle once per Reading, select multiple cards, interpret once."
 * Each card's orientation (upright/reversed) is randomized independently (50% chance)
 * when reversedEnabled is true.
 *
 * @param options Configuration options for the shuffle.
 * @returns Array of 78 ShuffledCard objects ready for True Index Selection.
 */
export function createShuffledDeck(options: ShuffleOptions = {}): ShuffledCard[] {
  const { reversedEnabled = false, customDeck = TAROT_DECK } = options;

  // 1. Perform Fisher-Yates shuffle on the cards
  const shuffledCards = fisherYatesShuffle(customDeck);

  // 2. Assign orientation per card
  return shuffledCards.map((card) => ({
    cardId: card.id,
    orientation: randomizeOrientation(reversedEnabled),
  }));
}
