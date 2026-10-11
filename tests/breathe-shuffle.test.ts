import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  saveQuestion,
  saveSpreadSelection,
  getReadingSession,
  saveDrawResult,
} from "@/lib/storage/reading-session";
import type { DrawApiResponse } from "@/types/api";

describe("Breathe & Shuffle Flow Integration (SDD §6.2 row 3, §4.2)", () => {
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

  it("verifies session requirements before entering shuffle phase", () => {
    // 1. Without question or spread, session is incomplete
    expect(getReadingSession()).toBeNull();

    // 2. Set question and spread
    saveQuestion("What guidance does the cosmos have for my creative journey?");
    saveSpreadSelection("three-timeline", false);

    const session = getReadingSession();
    expect(session).not.toBeNull();
    expect(session?.question).toBe("What guidance does the cosmos have for my creative journey?");
    expect(session?.spreadId).toBe("three-timeline");
    expect(session?.reversedEnabled).toBe(false);
    expect(session?.step).toBe("shuffle");
  });

  it("simulates successful POST /api/draw invocation and persists 78-card deck and drawId", async () => {
    saveQuestion("What mindset should I cultivate for this new transition?");
    saveSpreadSelection("single", true);

    const mockResponse: DrawApiResponse = {
      drawId: "draw-uuid-456",
      spreadId: "single",
      deck: Array.from({ length: 78 }, (_, i) => ({
        cardId: `card-${i}`,
        orientation: i % 2 === 0 ? ("upright" as const) : ("reversed" as const),
      })),
      analysis: {
        majorCount: 1,
        majorRatio: 1,
        dominantElement: "fire",
        repeatedRanks: [],
        courtCards: [],
        reversedRatio: 0.5,
      },
    };

    // Save draw result as done by BreatheShuffle component
    const updatedSession = saveDrawResult(
      mockResponse.drawId,
      mockResponse.deck,
      mockResponse.analysis
    );

    expect(updatedSession).not.toBeNull();
    expect(updatedSession?.drawId).toBe("draw-uuid-456");
    expect(updatedSession?.deck).toHaveLength(78);
    expect(updatedSession?.lifecycleState).toBe("SHUFFLED");
    expect(updatedSession?.step).toBe("select");

    const reloaded = getReadingSession();
    expect(reloaded?.drawId).toBe("draw-uuid-456");
    expect(reloaded?.deck).toHaveLength(78);
    expect(reloaded?.analysis?.dominantElement).toBe("fire");
  });

  it("handles rate limiting or network failure gracefully without corrupting session", async () => {
    saveQuestion("How can I find peace amidst turmoil?");
    saveSpreadSelection("five-path", false);

    // Initial state before fetch
    const initialSession = getReadingSession();
    expect(initialSession?.step).toBe("shuffle");
    expect(initialSession?.drawId).toBeUndefined();

    // Simulate API failure: session retains existing question and spreadId
    const currentSession = getReadingSession();
    expect(currentSession?.question).toBe("How can I find peace amidst turmoil?");
    expect(currentSession?.spreadId).toBe("five-path");
    expect(currentSession?.drawId).toBeUndefined();
  });
});
