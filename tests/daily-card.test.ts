import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getLocalDateString,
  isSameDay,
  isConsecutiveDay,
  getTimeUntilMidnight,
  getTodayDailyCard,
  saveDailyCard,
  hasDrawnToday,
  getDailyStreak,
  updateStreakOnDraw,
  getDailyCardHistory,
  clearDailyCardStorage,
  ARCANFRACTAL_DAILY_CARD,
  ARCANFRACTAL_DAILY_STREAK,
} from "@/lib/storage/daily-card";
import {
  getDeterministicDailyInterpretation,
  generateDailyInterpretation,
} from "@/lib/tarot/daily-interpretation";
import { drawDailyCard } from "@/lib/tarot/daily-draw";
import { TAROT_DECK } from "@/data/cards";
import type { DailyCardRecord } from "@/types/daily";

describe("Daily Card Ritual — Unit & Integration Tests (Phase 9)", () => {
  // In-memory mock localStorage
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    clearDailyCardStorage();

    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => mockStore[key] || null,
        setItem: (key: string, value: string) => {
          mockStore[key] = value;
        },
        removeItem: (key: string) => {
          delete mockStore[key];
        },
        clear: () => {
          mockStore = {};
        },
      },
    });
  });

  describe("1. Date Helpers & Midnight Calculations", () => {
    it("formats local date in YYYY-MM-DD correctly", () => {
      const fixedDate = new Date(2026, 9, 15); // Month is 0-indexed: 9 = October
      const formatted = getLocalDateString(fixedDate);
      expect(formatted).toBe("2026-10-15");
    });

    it("correctly identifies same calendar day", () => {
      expect(isSameDay("2026-10-15", "2026-10-15")).toBe(true);
      expect(isSameDay("2026-10-15", "2026-10-16")).toBe(false);
    });

    it("correctly identifies consecutive calendar days", () => {
      expect(isConsecutiveDay("2026-10-14", "2026-10-15")).toBe(true);
      expect(isConsecutiveDay("2026-10-15", "2026-10-16")).toBe(true);

      // Month boundary
      expect(isConsecutiveDay("2026-09-30", "2026-10-01")).toBe(true);

      // Year boundary
      expect(isConsecutiveDay("2026-12-31", "2027-01-01")).toBe(true);

      // Non-consecutive
      expect(isConsecutiveDay("2026-10-13", "2026-10-15")).toBe(false);
      expect(isConsecutiveDay("2026-10-15", "2026-10-14")).toBe(false);
    });

    it("calculates time until next midnight", () => {
      const now = new Date(2026, 9, 15, 23, 30, 0); // 23:30
      const countdown = getTimeUntilMidnight(now);

      expect(countdown.hours).toBe(0);
      expect(countdown.minutes).toBe(30);
      expect(countdown.seconds).toBe(0);
      expect(countdown.totalSeconds).toBe(1800);
    });
  });

  describe("2. Streak Tracking & Reset Logic", () => {
    it("starts streak at 1 on first draw", () => {
      const streak = updateStreakOnDraw("2026-10-15");
      expect(streak.currentStreak).toBe(1);
      expect(streak.maxStreak).toBe(1);
      expect(streak.lastDrawnDate).toBe("2026-10-15");
    });

    it("does not increment streak if drawn twice on the same day", () => {
      updateStreakOnDraw("2026-10-15");
      const sameDayStreak = updateStreakOnDraw("2026-10-15");

      expect(sameDayStreak.currentStreak).toBe(1);
      expect(sameDayStreak.maxStreak).toBe(1);
    });

    it("increments streak on consecutive days", () => {
      updateStreakOnDraw("2026-10-15");
      const nextDayStreak = updateStreakOnDraw("2026-10-16");

      expect(nextDayStreak.currentStreak).toBe(2);
      expect(nextDayStreak.maxStreak).toBe(2);

      const thirdDayStreak = updateStreakOnDraw("2026-10-17");
      expect(thirdDayStreak.currentStreak).toBe(3);
      expect(thirdDayStreak.maxStreak).toBe(3);
    });

    it("resets current streak to 1 when gap is >= 2 days while preserving maxStreak", () => {
      updateStreakOnDraw("2026-10-15");
      updateStreakOnDraw("2026-10-16");
      updateStreakOnDraw("2026-10-17"); // streak = 3

      // Missed 2026-10-18, drawing on 2026-10-19
      const brokenStreak = updateStreakOnDraw("2026-10-19");

      expect(brokenStreak.currentStreak).toBe(1);
      expect(brokenStreak.maxStreak).toBe(3); // Preserved
    });
  });

  describe("3. Storage & Prevent Re-draw on Same Day", () => {
    it("returns null when no card drawn today", () => {
      expect(getTodayDailyCard()).toBeNull();
      expect(hasDrawnToday()).toBe(false);
    });

    it("persists and retrieves today's card", () => {
      const today = getLocalDateString();
      const mockRecord: DailyCardRecord = {
        id: `daily-${today}-fool`,
        date: today,
        drawnAt: new Date().toISOString(),
        card: {
          positionIndex: 0,
          positionKey: "daily_focus",
          cardId: "fool",
          orientation: "upright",
        },
        theme: "New Horizons",
        affirmation: "I welcome new beginnings.",
        advice: "Take a leap of faith.",
        locale: "en",
        status: "complete",
      };

      saveDailyCard(mockRecord);

      expect(hasDrawnToday()).toBe(true);
      const retrieved = getTodayDailyCard();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(mockRecord.id);
      expect(retrieved?.card.cardId).toBe("fool");

      const history = getDailyCardHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe(mockRecord.id);
    });

    it("expires card from today after midnight", () => {
      const yesterday = "2026-10-14";
      const pastRecord: DailyCardRecord = {
        id: `daily-${yesterday}-fool`,
        date: yesterday,
        drawnAt: new Date(2026, 9, 14).toISOString(),
        card: {
          positionIndex: 0,
          positionKey: "daily_focus",
          cardId: "fool",
          orientation: "upright",
        },
        theme: "Past Theme",
        affirmation: "Past Affirmation",
        advice: "Past Advice",
        locale: "en",
      };

      // Put yesterday's card directly in storage
      mockStore[ARCANFRACTAL_DAILY_CARD] = JSON.stringify(pastRecord);

      // Current local date is today (not yesterday)
      const current = getTodayDailyCard();
      expect(current).toBeNull();
      expect(hasDrawnToday()).toBe(false);
    });
  });

  describe("4. Micro-Interpretation Engine", () => {
    it("generates dual-language micro-interpretations for all 22 Major Arcana cards", () => {
      const majorCardIds = [
        "fool", "magician", "high-priestess", "empress", "emperor",
        "hierophant", "lovers", "chariot", "strength", "hermit",
        "wheel-of-fortune", "justice", "hanged-man", "death", "temperance",
        "devil", "tower", "star", "moon", "sun", "judgement", "world",
      ];

      for (const cardId of majorCardIds) {
        // Upright
        const upright = getDeterministicDailyInterpretation(cardId, "upright");
        expect(upright.en.theme.length).toBeGreaterThan(0);
        expect(upright.en.affirmation.length).toBeGreaterThan(0);
        expect(upright.en.advice.length).toBeGreaterThan(0);
        expect(upright.th.theme.length).toBeGreaterThan(0);
        expect(upright.th.affirmation.length).toBeGreaterThan(0);
        expect(upright.th.advice.length).toBeGreaterThan(0);

        // Reversed
        const reversed = getDeterministicDailyInterpretation(cardId, "reversed");
        expect(reversed.en.theme.length).toBeGreaterThan(0);
        expect(reversed.th.theme.length).toBeGreaterThan(0);
      }
    });

    it("generates valid interpretations for Minor Arcana cards across all suits", () => {
      const sampleMinorIds = [
        "wands-01", "wands-10", "wands-king",
        "cups-01", "cups-queen",
        "swords-01", "swords-knight",
        "pentacles-01", "pentacles-page",
      ];

      for (const cardId of sampleMinorIds) {
        const result = getDeterministicDailyInterpretation(cardId, "upright");
        expect(result.en.theme).toBeDefined();
        expect(result.en.affirmation).toBeDefined();
        expect(result.th.theme).toBeDefined();
        expect(result.th.affirmation).toBeDefined();
      }
    });

    it("generates interpretations without throwing for all 78 deck cards", () => {
      for (const card of TAROT_DECK) {
        const upright = getDeterministicDailyInterpretation(card.id, "upright");
        expect(upright.en.theme.length).toBeGreaterThan(0);
        expect(upright.th.theme.length).toBeGreaterThan(0);

        const reversed = getDeterministicDailyInterpretation(card.id, "reversed");
        expect(reversed.en.theme.length).toBeGreaterThan(0);
        expect(reversed.th.theme.length).toBeGreaterThan(0);
      }
    });
  });

  describe("5. Daily Draw Engine Integration", () => {
    it("draws a card, saves to storage, and caches for repeated draws", async () => {
      const firstDraw = await drawDailyCard();
      expect(firstDraw).toBeDefined();
      expect(firstDraw.date).toBe(getLocalDateString());
      expect(firstDraw.card).toBeDefined();
      expect(firstDraw.theme.length).toBeGreaterThan(0);
      expect(firstDraw.affirmation.length).toBeGreaterThan(0);

      // Re-drawing on the same day must return the exact same card record (True Index Selection)
      const secondDraw = await drawDailyCard();
      expect(secondDraw.id).toBe(firstDraw.id);
      expect(secondDraw.card.cardId).toBe(firstDraw.card.cardId);
      expect(secondDraw.card.orientation).toBe(firstDraw.card.orientation);
    });
  });
});
