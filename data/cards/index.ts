import type { TarotCard, ArcanaType, CardSuit } from "@/types/tarot";
import { MAJOR_ARCANA_CARDS } from "./major";
import { WANDS_CARDS } from "./wands";
import { CUPS_CARDS } from "./cups";
import { SWORDS_CARDS } from "./swords";
import { PENTACLES_CARDS } from "./pentacles";

export { MAJOR_ARCANA_CARDS } from "./major";
export { WANDS_CARDS } from "./wands";
export { CUPS_CARDS } from "./cups";
export { SWORDS_CARDS } from "./swords";
export { PENTACLES_CARDS } from "./pentacles";

/**
 * All 56 Minor Arcana cards.
 */
export const MINOR_ARCANA_CARDS: TarotCard[] = [
  ...WANDS_CARDS,
  ...CUPS_CARDS,
  ...SWORDS_CARDS,
  ...PENTACLES_CARDS,
];

/**
 * Complete master catalog of all 78 Tarot cards (SDD §3, §8).
 * 22 Major Arcana + 56 Minor Arcana.
 */
export const TAROT_DECK: TarotCard[] = [...MAJOR_ARCANA_CARDS, ...MINOR_ARCANA_CARDS];

/**
 * O(1) Lookup map keyed by card ID.
 */
export const TAROT_CARD_MAP: Record<string, TarotCard> = Object.fromEntries(
  TAROT_DECK.map((card) => [card.id, card])
);

/**
 * O(1) Lookup map keyed by card slug.
 */
export const TAROT_SLUG_MAP: Record<string, TarotCard> = Object.fromEntries(
  TAROT_DECK.map((card) => [card.slug, card])
);

/**
 * Find a card by its unique identifier (e.g. "fool", "wands-01").
 */
export function getCardById(id: string): TarotCard | undefined {
  return TAROT_CARD_MAP[id];
}

/**
 * Find a card by its URL slug (e.g. "the-fool", "ace-of-wands").
 */
export function getCardBySlug(slug: string): TarotCard | undefined {
  return TAROT_SLUG_MAP[slug];
}

/**
 * Retrieve all cards belonging to a specific Minor Arcana suit.
 */
export function getCardsBySuit(suit: CardSuit): TarotCard[] {
  return TAROT_DECK.filter((card) => card.suit === suit);
}

/**
 * Retrieve cards by arcana type ("major" or "minor").
 */
export function getCardsByArcana(arcana: ArcanaType): TarotCard[] {
  return TAROT_DECK.filter((card) => card.arcana === arcana);
}
