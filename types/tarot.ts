/**
 * Tarot card arcana classification.
 */
export type ArcanaType = "major" | "minor";

/**
 * Four suits of the Minor Arcana.
 */
export type CardSuit = "wands" | "cups" | "swords" | "pentacles";

/**
 * Four classical elements associated with Tarot cards.
 */
export type CardElement = "fire" | "water" | "air" | "earth";

/**
 * Orientation of a drawn card.
 */
export type CardOrientation = "upright" | "reversed";

/**
 * Static master data model for a single Tarot card (SDD §8).
 */
export interface TarotCard {
  id: string;
  slug: string;
  name: string;
  arcana: ArcanaType;
  suit: CardSuit | null;
  number: number;
  element: CardElement;
  keywords: {
    upright: string[];
    reversed: string[];
  };
  meaning: {
    short: {
      upright: string;
      reversed: string;
    };
    full: {
      upright: string;
      reversed: string;
    };
  };
}

/**
 * A card in a shuffled deck ready for True Index Selection (SDD §4.2, §9.1).
 */
export interface ShuffledCard {
  cardId: string;
  orientation: CardOrientation;
}

/**
 * A card that has been selected and drawn in a spread (SDD §8).
 */
export interface DrawnCard {
  positionIndex: number;
  positionKey: string;
  cardId: string;
  orientation: CardOrientation;
  card?: TarotCard;
}
