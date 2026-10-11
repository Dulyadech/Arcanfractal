import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { validateStepAccess } from "@/lib/validation/route-guard";
import {
  saveQuestion,
  saveSpreadSelection,
  saveDrawResult,
  getReadingSession,
  saveReadingSession,
} from "@/lib/storage/reading-session";
import { SPREAD_LIST, SPREADS } from "@/data/spreads";
import { validateQuestion } from "@/lib/validation/question";
import type { ShuffledCard } from "@/types/tarot";
import type { ReadingAnalysis } from "@/types/reading";

describe("Route Protection & Step Guard Verification (SDD §6.2, §7, §7.1)", () => {
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

  // 1. Question Validation Check (5-500 characters)
  describe("Question Validation (5-500 chars)", () => {
    it("rejects empty or whitespace question", () => {
      expect(validateQuestion("").isValid).toBe(false);
      expect(validateQuestion("   ").isValid).toBe(false);
    });

    it("rejects questions shorter than 5 characters", () => {
      expect(validateQuestion("abc").isValid).toBe(false);
      expect(validateQuestion("help").isValid).toBe(false);
    });

    it("accepts valid questions between 5 and 500 characters", () => {
      expect(validateQuestion("What should I learn next?").isValid).toBe(true);
      expect(validateQuestion("a".repeat(500)).isValid).toBe(true);
    });

    it("rejects questions longer than 500 characters", () => {
      expect(validateQuestion("a".repeat(501)).isValid).toBe(false);
    });
  });

  // 2. Spread Options Verification (4 options)
  describe("Spread Selection Options", () => {
    it("provides exactly 4 spreads in SPREAD_LIST matching SDD §4.5", () => {
      expect(SPREAD_LIST).toHaveLength(4);
      expect(SPREAD_LIST.map((s) => s.id)).toEqual([
        "single",
        "three-timeline",
        "three-guidance",
        "five-path",
      ]);
    });

    it("validates that all 4 spreads have required cards and position mappings", () => {
      expect(SPREADS["single"].cardCount).toBe(1);
      expect(SPREADS["three-timeline"].cardCount).toBe(3);
      expect(SPREADS["three-guidance"].cardCount).toBe(3);
      expect(SPREADS["five-path"].cardCount).toBe(5);
    });
  });

  // 3. Route Protection Rule 1: No Question -> Redirect to "/"
  describe("Route Protection: Missing Question", () => {
    it("redirects to '/' when trying to access 'spread' without a question", () => {
      const result = validateStepAccess("spread", null);
      expect(result.allowed).toBe(false);
      expect(result.redirectUrl).toBe("/");
    });

    it("redirects to '/' when trying to access 'shuffle' without a question", () => {
      const result = validateStepAccess("shuffle", null);
      expect(result.allowed).toBe(false);
      expect(result.redirectUrl).toBe("/");
    });

    it("redirects to '/' when trying to access 'select' without a question", () => {
      const result = validateStepAccess("select", null);
      expect(result.allowed).toBe(false);
      expect(result.redirectUrl).toBe("/");
    });
  });

  // 4. Route Protection Rule 2: Question present, but Missing Spread -> Redirect to "/read?step=spread"
  describe("Route Protection: Missing Spread", () => {
    it("allows access to 'spread' when question is valid", () => {
      const session = saveQuestion("What path should I take in my career?");
      const result = validateStepAccess("spread", session);
      expect(result.allowed).toBe(true);
    });

    it("redirects to '/read?step=spread' when trying to access 'shuffle' without choosing a spread", () => {
      const session = saveQuestion("What path should I take in my career?");
      const result = validateStepAccess("shuffle", session);
      expect(result.allowed).toBe(false);
      expect(result.redirectUrl).toBe("/read?step=spread");
    });

    it("redirects to '/read?step=spread' when trying to access 'select' without choosing a spread", () => {
      const session = saveQuestion("What path should I take in my career?");
      const result = validateStepAccess("select", session);
      expect(result.allowed).toBe(false);
      expect(result.redirectUrl).toBe("/read?step=spread");
    });
  });

  // 5. Route Protection Rule 3: Question + Spread present, but NOT shuffled -> Redirect to "/read?step=shuffle"
  describe("Route Protection: Not Shuffled (Step Skipping Prevention)", () => {
    it("allows access to 'shuffle' once spread is selected", () => {
      saveQuestion("What should I focus on for inner growth?");
      const session = saveSpreadSelection("three-timeline", false);

      const result = validateStepAccess("shuffle", session);
      expect(result.allowed).toBe(true);
    });

    it("prevents skipping shuffle: redirects from 'select' to '/read?step=shuffle'", () => {
      saveQuestion("What should I focus on for inner growth?");
      const session = saveSpreadSelection("three-timeline", false);

      // User attempts to directly navigate to ?step=select without having shuffled
      const result = validateStepAccess("select", session);
      expect(result.allowed).toBe(false);
      expect(result.redirectUrl).toBe("/read?step=shuffle");
      expect(result.reason).toContain("shuffled");
    });
  });

  // 6. Route Protection Rule 4: Shuffled Deck Present -> Access to 'select' is granted!
  describe("Route Protection: Shuffled Deck Present", () => {
    it("grants access to 'select' when 78-card shuffled deck is verified", () => {
      saveQuestion("What should I focus on for inner growth?");
      saveSpreadSelection("three-timeline", false);

      const mockDeck: ShuffledCard[] = Array.from({ length: 78 }, (_, i) => ({
        cardId: `card-${i}`,
        orientation: "upright",
      }));
      const mockAnalysis: ReadingAnalysis = {
        majorCount: 2,
        majorRatio: 0.67,
        dominantElement: "water",
        repeatedRanks: [],
        courtCards: [],
        reversedRatio: 0,
      };

      const shuffledSession = saveDrawResult("draw-12345", mockDeck, mockAnalysis);
      const result = validateStepAccess("select", shuffledSession);

      expect(result.allowed).toBe(true);
    });
  });

  // 7. State Machine Transition & SessionStorage Persistence
  describe("State Machine Lifecycle Transitions (SDD §7.1)", () => {
    it("transitions properly: NEW -> SHUFFLED -> SELECTING", () => {
      // 1. Initial question: NEW
      const s1 = saveQuestion("How can I find peace?");
      expect(s1?.lifecycleState).toBe("NEW");

      // 2. Spread selection
      const s2 = saveSpreadSelection("single", true);
      expect(s2?.spreadId).toBe("single");
      expect(s2?.reversedEnabled).toBe(true);
      expect(s2?.step).toBe("shuffle");

      // 3. Shuffled via POST /api/draw: SHUFFLED
      const mockDeck: ShuffledCard[] = Array.from({ length: 78 }, (_, i) => ({
        cardId: `card-${i}`,
        orientation: "upright",
      }));
      const mockAnalysis: ReadingAnalysis = {
        majorCount: 1,
        majorRatio: 1,
        dominantElement: null,
        repeatedRanks: [],
        courtCards: [],
        reversedRatio: 0,
      };
      const s3 = saveDrawResult("draw-test-999", mockDeck, mockAnalysis);
      expect(s3?.lifecycleState).toBe("SHUFFLED");
      expect(s3?.step).toBe("select");

      // 4. Advance to SELECTING
      const s4 = saveReadingSession({ lifecycleState: "SELECTING" });
      expect(s4?.lifecycleState).toBe("SELECTING");

      // 5. Verify reload from SessionStorage retains state
      const reloaded = getReadingSession();
      expect(reloaded?.question).toBe("How can I find peace?");
      expect(reloaded?.spreadId).toBe("single");
      expect(reloaded?.reversedEnabled).toBe(true);
      expect(reloaded?.drawId).toBe("draw-test-999");
      expect(reloaded?.deck).toHaveLength(78);
      expect(reloaded?.lifecycleState).toBe("SELECTING");
    });
  });
});
