import { isValidSpreadId, getSpreadDefinition } from "@/data/spreads";
import type { SpreadDefinition } from "@/types/spread";
import { isValidCardId } from "@/data/cards";
import { getDrawSession, type DrawSession } from "./draw-store";
import type { DrawnCard } from "@/types/tarot";

/**
 * Result structure returned by Server Invariant Check.
 */
export interface InvariantValidationSuccess {
  valid: true;
  spread: SpreadDefinition;
  session: DrawSession;
}

export interface InvariantValidationFailure {
  valid: false;
  reason: string;
  code: string;
}

export type InvariantValidationResult = InvariantValidationSuccess | InvariantValidationFailure;

export interface InvariantValidationParams {
  drawId: unknown;
  question: unknown;
  spreadId: unknown;
  cards: unknown;
}

/**
 * Server Invariant Check (SDD §5 Guard).
 *
 * Verifies that:
 * 1. Question is between 5 and 500 characters (SDD §2 Step 1).
 * 2. spreadId is a valid known spread.
 * 3. drawId is a valid session previously created by POST /api/draw.
 * 4. spreadId in request strictly matches the spreadId of the draw session.
 * 5. cards array count matches spread's required cardCount.
 * 6. Each card's positionIndex and positionKey match the spread's position schema.
 * 7. Each cardId is a valid card in the 78-card catalog.
 * 8. Each card is unique within the reading (No Duplicate Rule, SDD §4.3).
 * 9. Each card was genuinely part of the shuffled deck for this drawId,
 *    and its orientation strictly matches the deck orientation generated on server.
 */
export function validateReadingInvariant(
  params: InvariantValidationParams
): InvariantValidationResult {
  const { drawId, question, spreadId, cards } = params;

  // 1. Validate question
  if (!question || typeof question !== "string") {
    return {
      valid: false,
      reason: "Question must be a non-empty string.",
      code: "INVALID_QUESTION",
    };
  }

  const trimmedQuestion = question.trim();
  if (trimmedQuestion.length < 5 || trimmedQuestion.length > 500) {
    return {
      valid: false,
      reason: `Question length must be between 5 and 500 characters (current: ${trimmedQuestion.length}).`,
      code: "INVALID_QUESTION_LENGTH",
    };
  }

  // 2. Validate spreadId
  if (!spreadId || typeof spreadId !== "string" || !isValidSpreadId(spreadId)) {
    return {
      valid: false,
      reason: "Invalid or unsupported spreadId. Must be one of: 'single', 'three-timeline', 'three-guidance', 'five-path'.",
      code: "INVALID_SPREAD_ID",
    };
  }

  const spreadDef = getSpreadDefinition(spreadId);

  // 3. Validate drawId & session
  if (!drawId || typeof drawId !== "string") {
    return {
      valid: false,
      reason: "Missing or invalid drawId string.",
      code: "INVALID_DRAW_ID",
    };
  }

  const session = getDrawSession(drawId);
  if (!session) {
    return {
      valid: false,
      reason: "Draw session not found or has expired. Please initiate a new draw.",
      code: "DRAW_SESSION_NOT_FOUND",
    };
  }

  // 4. Session spreadId matching
  if (session.spreadId !== spreadId) {
    return {
      valid: false,
      reason: `Spread ID '${spreadId}' does not match the draw session spread '${session.spreadId}'.`,
      code: "SPREAD_MISMATCH",
    };
  }

  // 5. Validate cards array
  if (!Array.isArray(cards)) {
    return {
      valid: false,
      reason: "Field 'cards' must be an array.",
      code: "INVALID_CARDS_PAYLOAD",
    };
  }

  if (cards.length !== spreadDef.cardCount) {
    return {
      valid: false,
      reason: `Spread '${spreadId}' requires exactly ${spreadDef.cardCount} cards, but received ${cards.length}.`,
      code: "CARD_COUNT_MISMATCH",
    };
  }

  // Build deck lookup map: cardId -> ShuffledCard
  const sessionDeckMap = new Map<string, (typeof session.deck)[number]>();
  for (const item of session.deck) {
    sessionDeckMap.set(item.cardId, item);
  }

  const seenCardIds = new Set<string>();

  // 6. Validate each card
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i] as DrawnCard;

    if (!card || typeof card !== "object") {
      return {
        valid: false,
        reason: `Card entry at index ${i} is not a valid object.`,
        code: "INVALID_CARD_ENTRY",
      };
    }

    if (card.positionIndex !== i) {
      return {
        valid: false,
        reason: `Position index mismatch at index ${i}. Expected ${i}, received ${card.positionIndex}.`,
        code: "POSITION_INDEX_MISMATCH",
      };
    }

    const expectedPosition = spreadDef.positions[i];
    if (card.positionKey !== expectedPosition.key) {
      return {
        valid: false,
        reason: `Position key mismatch at index ${i}. Expected '${expectedPosition.key}', received '${card.positionKey}'.`,
        code: "POSITION_KEY_MISMATCH",
      };
    }

    if (!card.cardId || typeof card.cardId !== "string" || !isValidCardId(card.cardId)) {
      return {
        valid: false,
        reason: `Card ID '${card.cardId}' at index ${i} is not recognized in the 78-card catalog.`,
        code: "UNKNOWN_CARD_ID",
      };
    }

    // No Duplicate Rule (SDD §4.3)
    if (seenCardIds.has(card.cardId)) {
      return {
        valid: false,
        reason: `Duplicate card '${card.cardId}' detected in spread (violates No Duplicate Rule).`,
        code: "DUPLICATE_CARD_DETECTED",
      };
    }
    seenCardIds.add(card.cardId);

    // Verify against server session deck
    const deckCard = sessionDeckMap.get(card.cardId);
    if (!deckCard) {
      return {
        valid: false,
        reason: `Card '${card.cardId}' was not found in the shuffled deck for drawId '${drawId}'.`,
        code: "CARD_NOT_IN_SESSION_DECK",
      };
    }

    if (card.orientation !== deckCard.orientation) {
      return {
        valid: false,
        reason: `Orientation mismatch for card '${card.cardId}'. Expected '${deckCard.orientation}', received '${card.orientation}'.`,
        code: "CARD_ORIENTATION_MISMATCH",
      };
    }
  }

  return {
    valid: true,
    spread: spreadDef,
    session,
  };
}
