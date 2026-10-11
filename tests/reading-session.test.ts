import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getReadingSession,
  saveReadingSession,
  saveQuestion,
  saveSpreadSelection,
  saveDrawResult,
  clearReadingSession,
  resetReloadHandledForTesting,
  READING_SESSION_KEY,
} from "@/lib/storage/reading-session";

describe("Reading Session Storage Manager (SDD §7 Flow State Machine)", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    resetReloadHandledForTesting();
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
      performance: {
        getEntriesByType: vi.fn(() => [{ type: "navigate" }]),
      },
    });
  });

  it("returns null if no session is stored", () => {
    expect(getReadingSession()).toBeNull();
  });

  it("saves a new question and initializes lifecycle state to NEW", () => {
    const questionText = "What energy surrounds my current work?";
    const saved = saveQuestion(questionText);

    expect(saved).not.toBeNull();
    expect(saved?.question).toBe(questionText);
    expect(saved?.lifecycleState).toBe("NEW");
    expect(mockStorage[READING_SESSION_KEY]).toBeDefined();

    const retrieved = getReadingSession();
    expect(retrieved?.question).toBe(questionText);
  });

  it("updates reading session properties while preserving existing question", () => {
    saveQuestion("How can I cultivate more balance?");
    const updated = saveReadingSession({
      spreadId: "three-timeline",
      reversedEnabled: true,
      step: "spread",
    });

    expect(updated?.question).toBe("How can I cultivate more balance?");
    expect(updated?.spreadId).toBe("three-timeline");
    expect(updated?.reversedEnabled).toBe(true);
    expect(updated?.step).toBe("spread");
  });

  it("saves spread selection and reversed cards toggle while keeping question intact", () => {
    saveQuestion("What should I focus on next month?");
    const updated = saveSpreadSelection("five-path", true);

    expect(updated?.question).toBe("What should I focus on next month?");
    expect(updated?.spreadId).toBe("five-path");
    expect(updated?.reversedEnabled).toBe(true);
    expect(updated?.step).toBe("shuffle");
  });

  it("saves draw result and advances lifecycle state to SHUFFLED and step to select", () => {
    saveQuestion("What guidance does the universe offer?");
    saveSpreadSelection("single", false);

    const mockDeck = [
      { cardId: "fool", orientation: "upright" as const },
      { cardId: "magician", orientation: "upright" as const },
    ];
    const mockAnalysis = {
      majorCount: 2,
      majorRatio: 1,
      dominantElement: null,
      repeatedRanks: [],
      courtCards: [],
      reversedRatio: 0,
    };

    const result = saveDrawResult("draw-test-123", mockDeck, mockAnalysis);

    expect(result?.drawId).toBe("draw-test-123");
    expect(result?.deck).toHaveLength(2);
    expect(result?.lifecycleState).toBe("SHUFFLED");
    expect(result?.step).toBe("select");

    const session = getReadingSession();
    expect(session?.drawId).toBe("draw-test-123");
    expect(session?.deck).toHaveLength(2);
    expect(session?.analysis?.majorCount).toBe(2);
  });

  it("clears the active reading session from sessionStorage", () => {
    saveQuestion("Should I start something new?");
    expect(getReadingSession()).not.toBeNull();

    clearReadingSession();
    expect(getReadingSession()).toBeNull();
    expect(mockStorage[READING_SESSION_KEY]).toBeUndefined();
  });

  it("resets and clears session when page refresh/reload is detected via performance navigation", () => {
    saveQuestion("Will this project go well?");
    expect(mockStorage[READING_SESSION_KEY]).toBeDefined();

    // Simulate page reload
    resetReloadHandledForTesting();
    vi.stubGlobal("window", {
      sessionStorage: {
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
      },
      performance: {
        getEntriesByType: vi.fn((type: string) =>
          type === "navigation" ? [{ type: "reload" }] : []
        ),
      },
    });

    const sessionAfterReload = getReadingSession();
    expect(sessionAfterReload).toBeNull();
    expect(mockStorage[READING_SESSION_KEY]).toBeUndefined();
  });

  it("resets and clears session when page reload is detected via legacy performance.navigation.type === 1", () => {
    saveQuestion("Will this project go well?");
    expect(mockStorage[READING_SESSION_KEY]).toBeDefined();

    // Simulate legacy reload navigation
    resetReloadHandledForTesting();
    vi.stubGlobal("window", {
      sessionStorage: {
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
      },
      performance: {
        getEntriesByType: vi.fn(() => []),
        navigation: {
          type: 1, // TYPE_RELOAD
        },
      },
    });

    const sessionAfterReload = getReadingSession();
    expect(sessionAfterReload).toBeNull();
    expect(mockStorage[READING_SESSION_KEY]).toBeUndefined();
  });
});
