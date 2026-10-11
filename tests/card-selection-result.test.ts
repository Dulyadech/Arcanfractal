import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  saveQuestion,
  saveSpreadSelection,
  saveDrawResult,
  saveDrawnCards,
  saveInterpretation,
  resetReadingSession,
  getReadingSession,
} from "@/lib/storage/reading-session";
import type { DrawnCard, ShuffledCard } from "@/types/tarot";
import type { ReadingAnalysis } from "@/types/reading";
import type { AIInterpretationPayload } from "@/types/ai";

describe("Card Selection & Reading Result Lifecycle (Phase 5, SDD §2, §6.2)", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const sessionStorageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    };

    vi.stubGlobal("window", {
      sessionStorage: sessionStorageMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles progressive card selection and updates lifecycle states", () => {
    saveQuestion("What guidance do the stars have for me?");
    saveSpreadSelection("three-timeline", false);

    const mockDeck = Array.from({ length: 78 }, (_, i) => ({
      cardId: `card-${i}`,
      orientation: "upright" as const,
    }));
    const mockAnalysis = {
      majorCount: 1,
      majorRatio: 0.33,
      dominantElement: null,
      repeatedRanks: [],
      courtCards: [],
      reversedRatio: 0,
    };
    saveDrawResult("draw-123", mockDeck, mockAnalysis);

    // Pick 1st card
    const card1: DrawnCard = {
      positionIndex: 0,
      positionKey: "past",
      cardId: "fool",
      orientation: "upright",
    };
    saveDrawnCards([card1], [5], false);

    let session = getReadingSession();
    expect(session?.drawnCards).toHaveLength(1);
    expect(session?.selectedIndices).toEqual([5]);
    expect(session?.lifecycleState).toBe("SELECTING");
    expect(session?.step).toBe("select");

    // Pick 2nd card
    const card2: DrawnCard = {
      positionIndex: 1,
      positionKey: "present",
      cardId: "magician",
      orientation: "upright",
    };
    saveDrawnCards([card1, card2], [5, 12], false);

    session = getReadingSession();
    expect(session?.drawnCards).toHaveLength(2);
    expect(session?.selectedIndices).toEqual([5, 12]);

    // Pick 3rd and final card -> isComplete: true
    const card3: DrawnCard = {
      positionIndex: 2,
      positionKey: "future",
      cardId: "star",
      orientation: "reversed",
    };
    saveDrawnCards([card1, card2, card3], [5, 12, 42], true);

    session = getReadingSession();
    expect(session?.drawnCards).toHaveLength(3);
    expect(session?.selectedIndices).toEqual([5, 12, 42]);
    expect(session?.lifecycleState).toBe("COMPLETE");
    expect(session?.step).toBe("result");
  });

  it("saves interpretation payload and sets lifecycleState to RESULT", () => {
    saveQuestion("How do I navigate this crossroads?");
    saveSpreadSelection("single", false);

    const mockPayload: AIInterpretationPayload = {
      overview: "A time of great courage and transition awaits you.",
      cards: [
        {
          cardId: "fool",
          cardName: "The Fool",
          positionKey: "message",
          orientation: "upright",
          meaningInContext: "Step forward without fear.",
          contributionToAnswer: "Encourages a fresh start.",
          interpretation: "Step forward without fear.",
        },
      ],
      synthesis: "Trust the unknown.",
      advice: "Take one clear, bold step today.",
      reflectionQuestion: "What is holding you back from beginning?",
      safety: "none",
      status: "complete",
    };

    saveInterpretation(mockPayload, "complete");

    const session = getReadingSession();
    expect(session?.interpretation?.overview).toBe(
      "A time of great courage and transition awaits you."
    );
    expect(session?.readingStatus).toBe("complete");
    expect(session?.lifecycleState).toBe("RESULT");
    expect(session?.step).toBe("result");
  });

  it("resets reading session on new reading trigger", () => {
    saveQuestion("Will this project flourish?");
    saveSpreadSelection("single", false);

    expect(getReadingSession()).not.toBeNull();

    resetReadingSession();
    expect(getReadingSession()).toBeNull();
  });

  it("purges previous deck, drawn cards, and interpretations when saving a new question", () => {
    saveQuestion("First question about my relationship?");
    saveSpreadSelection("three-timeline", false);
    const mockOldDeck: ShuffledCard[] = [{ cardId: "fool", orientation: "upright" }];
    const mockOldAnalysis: ReadingAnalysis = {
      majorCount: 1,
      majorRatio: 1,
      dominantElement: null,
      repeatedRanks: [],
      courtCards: [],
      reversedRatio: 0,
    };
    saveDrawResult("draw-old", mockOldDeck, mockOldAnalysis);
    saveDrawnCards(
      [{ positionIndex: 0, positionKey: "past", cardId: "fool", orientation: "upright" }],
      [0],
      true
    );

    let session = getReadingSession();
    expect(session?.drawnCards).toHaveLength(1);
    expect(session?.drawId).toBe("draw-old");

    // Saving a brand new question must start completely fresh
    saveQuestion("Brand new question about career?");
    session = getReadingSession();
    expect(session?.question).toBe("Brand new question about career?");
    expect(session?.drawId).toBeUndefined();
    expect(session?.deck).toBeUndefined();
    expect(session?.drawnCards).toBeUndefined();
    expect(session?.selectedIndices).toBeUndefined();
    expect(session?.interpretation).toBeNull();
  });
});
