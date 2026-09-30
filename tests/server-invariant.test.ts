import { describe, it, expect, beforeEach } from "vitest";
import {
  validateReadingInvariant,
  saveDrawSession,
  clearDrawSessions,
  createShuffledDeck,
} from "@/lib/tarot";
import { getSpreadDefinition } from "@/data/spreads";
import type { DrawnCard } from "@/types/tarot";

describe("Server Invariant Check (SDD §5 Guard)", () => {
  const drawId = "test-session-uuid-1234";
  const spreadId = "three-timeline";
  const spreadDef = getSpreadDefinition(spreadId);

  let deck: ReturnType<typeof createShuffledDeck>;

  beforeEach(() => {
    clearDrawSessions();
    deck = createShuffledDeck({ reversedEnabled: true });
    saveDrawSession({
      drawId,
      spreadId,
      reversedEnabled: true,
      deck,
      createdAt: Date.now(),
    });
  });

  function getValidDrawnCards(): DrawnCard[] {
    return deck.slice(0, spreadDef.cardCount).map((card, index) => ({
      positionIndex: index,
      positionKey: spreadDef.positions[index].key,
      cardId: card.cardId,
      orientation: card.orientation,
    }));
  }

  it("passes when all parameters and card selections match the session deck 100%", () => {
    const cards = getValidDrawnCards();
    const result = validateReadingInvariant({
      drawId,
      question: "How will my career transition unfold over the next 6 months?",
      spreadId,
      cards,
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.spread.id).toBe(spreadId);
      expect(result.session.drawId).toBe(drawId);
    }
  });

  it("rejects questions shorter than 5 characters", () => {
    const cards = getValidDrawnCards();
    const result = validateReadingInvariant({
      drawId,
      question: "Why?",
      spreadId,
      cards,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe("INVALID_QUESTION_LENGTH");
    }
  });

  it("rejects questions longer than 500 characters", () => {
    const cards = getValidDrawnCards();
    const longQuestion = "a".repeat(501);
    const result = validateReadingInvariant({
      drawId,
      question: longQuestion,
      spreadId,
      cards,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe("INVALID_QUESTION_LENGTH");
    }
  });

  it("rejects when drawId does not exist or has expired", () => {
    const cards = getValidDrawnCards();
    const result = validateReadingInvariant({
      drawId: "non-existent-session-id",
      question: "Valid question for testing?",
      spreadId,
      cards,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe("DRAW_SESSION_NOT_FOUND");
    }
  });

  it("rejects when spreadId mismatches the draw session spread", () => {
    const cards = getValidDrawnCards();
    const result = validateReadingInvariant({
      drawId,
      question: "Valid question for testing?",
      spreadId: "single", // Session was created with three-timeline
      cards,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe("SPREAD_MISMATCH");
    }
  });

  it("rejects when card count does not match the spread definition", () => {
    const cards = getValidDrawnCards().slice(0, 2); // 2 cards instead of 3
    const result = validateReadingInvariant({
      drawId,
      question: "Valid question for testing?",
      spreadId,
      cards,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe("CARD_COUNT_MISMATCH");
    }
  });

  it("rejects when position key does not match the spread schema", () => {
    const cards = getValidDrawnCards();
    cards[0].positionKey = "wrong-key";

    const result = validateReadingInvariant({
      drawId,
      question: "Valid question for testing?",
      spreadId,
      cards,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe("POSITION_KEY_MISMATCH");
    }
  });

  it("rejects duplicate cards (No Duplicate Rule, SDD §4.3)", () => {
    const cards = getValidDrawnCards();
    cards[1].cardId = cards[0].cardId; // Duplicate card

    const result = validateReadingInvariant({
      drawId,
      question: "Valid question for testing?",
      spreadId,
      cards,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe("DUPLICATE_CARD_DETECTED");
    }
  });

  it("rejects card with forged orientation", () => {
    const cards = getValidDrawnCards();
    const originalOrientation = cards[0].orientation;
    // Invert the orientation
    cards[0].orientation = originalOrientation === "upright" ? "reversed" : "upright";

    const result = validateReadingInvariant({
      drawId,
      question: "Valid question for testing?",
      spreadId,
      cards,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe("CARD_ORIENTATION_MISMATCH");
    }
  });

  it("rejects unknown card ID", () => {
    const cards = getValidDrawnCards();
    cards[0].cardId = "non-existent-tarot-card";

    const result = validateReadingInvariant({
      drawId,
      question: "Valid question for testing?",
      spreadId,
      cards,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe("UNKNOWN_CARD_ID");
    }
  });
});
