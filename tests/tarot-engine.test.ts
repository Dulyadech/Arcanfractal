import { describe, it, expect } from "vitest";
import { getCardById } from "@/data/cards";
import { SPREADS } from "@/data/spreads";
import {
  getSecureRandomInt,
  fisherYatesShuffle,
  createShuffledDeck,
  randomizeOrientation,
  calculateReadingAnalysis,
} from "@/lib/tarot";
import type { DrawnCard } from "@/types/tarot";

describe("Tarot Engine Unit Tests (SDD §4, §7.1, §8)", () => {
  describe("1. Fisher-Yates Shuffle & Permutations", () => {
    it("creates a 78-card permutation with zero duplicates", () => {
      const shuffled = createShuffledDeck();

      expect(shuffled).toHaveLength(78);

      const cardIds = shuffled.map((c) => c.cardId);
      const uniqueIds = new Set(cardIds);
      expect(uniqueIds.size).toBe(78);

      // Verify every card in the deck exists in the master catalog
      for (const card of shuffled) {
        const found = getCardById(card.cardId);
        expect(found).toBeDefined();
      }
    });

    it("produces distinct permutations across successive shuffles", () => {
      const shuffleA = createShuffledDeck()
        .map((c) => c.cardId)
        .join(",");
      const shuffleB = createShuffledDeck()
        .map((c) => c.cardId)
        .join(",");

      expect(shuffleA).not.toBe(shuffleB);
    });

    it("does not mutate the original array", () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      const shuffled = fisherYatesShuffle(original);

      expect(original).toEqual(copy);
      expect(shuffled).toHaveLength(original.length);
    });
  });

  describe("2. Unbiased Randomness (No Modulo Bias)", () => {
    it("throws on non-positive maxExclusive", () => {
      expect(() => getSecureRandomInt(0)).toThrow(RangeError);
      expect(() => getSecureRandomInt(-5)).toThrow(RangeError);
    });

    it("returns 0 when maxExclusive is 1", () => {
      expect(getSecureRandomInt(1)).toBe(0);
    });

    it("generates a uniform distribution without modulo bias (Chi-square like distribution test)", () => {
      const outcomes = 6;
      const draws = 60_000;
      const expectedPerOutcome = draws / outcomes; // 10,000
      const counts = new Array(outcomes).fill(0);

      for (let i = 0; i < draws; i++) {
        const val = getSecureRandomInt(outcomes);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(outcomes);
        counts[val]++;
      }

      // In a fair uniform sample of 60,000, 3-sigma deviation is ~3 * sqrt(10000 * 5/6) ≈ 274.
      // We check that every bucket is within ±500 of expected 10,000 (extremely high confidence).
      for (let i = 0; i < outcomes; i++) {
        const diff = Math.abs(counts[i] - expectedPerOutcome);
        expect(diff).toBeLessThan(500);
      }
    });
  });

  describe("3. Reversed Card Randomization (SDD §3, Q-002)", () => {
    it("defaults to 100% upright when reversedEnabled is false", () => {
      const deck = createShuffledDeck({ reversedEnabled: false });

      for (const card of deck) {
        expect(card.orientation).toBe("upright");
      }

      for (let i = 0; i < 100; i++) {
        expect(randomizeOrientation(false)).toBe("upright");
      }
    });

    it("randomizes each card independently with ~50% probability when reversedEnabled is true", () => {
      const samples = 10_000;
      let reversedCount = 0;

      for (let i = 0; i < samples; i++) {
        if (randomizeOrientation(true) === "reversed") {
          reversedCount++;
        }
      }

      const ratio = reversedCount / samples;
      // Expect ratio to be very close to 0.50 (e.g. between 0.47 and 0.53)
      expect(ratio).toBeGreaterThan(0.47);
      expect(ratio).toBeLessThan(0.53);
    });
  });

  describe("4. No Duplicate Rule Within Reading (SDD §4.3)", () => {
    it("guarantees drawn cards in any spread have no duplicates", () => {
      const deck = createShuffledDeck();

      // Simulate drawing 5 cards for Five-Card Path
      const drawn5 = deck.slice(0, 5);
      const drawnIds = drawn5.map((c) => c.cardId);
      const uniqueIds = new Set(drawnIds);

      expect(uniqueIds.size).toBe(5);
    });
  });

  describe("5. Reading Analysis Calculation (SDD §4.6, §8)", () => {
    it("handles empty card array gracefully", () => {
      const result = calculateReadingAnalysis([]);
      expect(result).toEqual({
        majorCount: 0,
        majorRatio: 0,
        dominantElement: null,
        repeatedRanks: [],
        courtCards: [],
        reversedRatio: 0,
      });
    });

    it("accurately calculates major ratio, dominant element, repeated ranks, and court cards", () => {
      // Construct a controlled 5-card spread
      const sampleDrawnCards: DrawnCard[] = [
        // The Fool (Major, number 0, air) - upright
        { positionIndex: 0, positionKey: "heart", cardId: "fool", orientation: "upright" },
        // The Magician (Major, number 1, air) - reversed
        { positionIndex: 1, positionKey: "obstacle", cardId: "magician", orientation: "reversed" },
        // Ace of Swords (Minor, number 1, air) - upright -> Rank 1 repeated!
        {
          positionIndex: 2,
          positionKey: "foundation",
          cardId: "swords-01",
          orientation: "upright",
        },
        // Queen of Wands (Minor, number 13, fire, Court Card) - reversed
        {
          positionIndex: 3,
          positionKey: "guidance",
          cardId: "wands-queen",
          orientation: "reversed",
        },
        // King of Wands (Minor, number 14, fire, Court Card) - upright
        {
          positionIndex: 4,
          positionKey: "direction",
          cardId: "wands-king",
          orientation: "upright",
        },
      ];

      const analysis = calculateReadingAnalysis(sampleDrawnCards);

      // 2 major cards out of 5 = 40% (0.4)
      expect(analysis.majorCount).toBe(2);
      expect(analysis.majorRatio).toBe(0.4);

      // Elements: Fool (air), Magician (air), Ace of Swords (air) = 3 air; Queen of Wands (fire), King of Wands (fire) = 2 fire
      expect(analysis.dominantElement).toBe("air");

      // Repeated ranks: Rank 1 appears in Magician (1) and Ace of Swords (1)
      expect(analysis.repeatedRanks).toEqual([1]);

      // Court cards: Queen of Wands, King of Wands
      expect(analysis.courtCards).toEqual(["Queen of Wands", "King of Wands"]);

      // Reversed ratio: 2 out of 5 reversed = 0.4
      expect(analysis.reversedRatio).toBe(0.4);
    });

    it("returns dominantElement null when there is a tie between highest elements", () => {
      const tiedCards: DrawnCard[] = [
        // Ace of Wands (fire)
        { positionIndex: 0, positionKey: "situation", cardId: "wands-01", orientation: "upright" },
        // Ace of Cups (water)
        { positionIndex: 1, positionKey: "challenge", cardId: "cups-01", orientation: "upright" },
      ];

      const analysis = calculateReadingAnalysis(tiedCards);
      expect(analysis.dominantElement).toBeNull();
    });
  });

  describe("6. Spread Position Keys Verification (SDD §4.5)", () => {
    it("Single Card spread matches SDD §4.5 specification", () => {
      const spread = SPREADS["single"];
      expect(spread.cardCount).toBe(1);
      expect(spread.positions).toHaveLength(1);
      expect(spread.positions[0].key).toBe("message");
    });

    it("Three-Card Timeline spread matches SDD §4.5 specification", () => {
      const spread = SPREADS["three-timeline"];
      expect(spread.cardCount).toBe(3);
      expect(spread.positions).toHaveLength(3);
      expect(spread.positions.map((p) => p.key)).toEqual(["past", "present", "future"]);
    });

    it("Three-Card Guidance spread matches SDD §4.5 specification", () => {
      const spread = SPREADS["three-guidance"];
      expect(spread.cardCount).toBe(3);
      expect(spread.positions).toHaveLength(3);
      expect(spread.positions.map((p) => p.key)).toEqual(["situation", "challenge", "guidance"]);
    });

    it("Five-Card Path spread matches SDD §4.5 specification", () => {
      const spread = SPREADS["five-path"];
      expect(spread.cardCount).toBe(5);
      expect(spread.positions).toHaveLength(5);
      expect(spread.positions.map((p) => p.key)).toEqual([
        "heart",
        "obstacle",
        "foundation",
        "guidance",
        "direction",
      ]);
    });
  });
});
