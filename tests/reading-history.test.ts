import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getReadingHistory,
  saveReadingToHistory,
  deleteReadingRecord,
  clearReadingHistory,
  getReadingById,
  MAX_HISTORY_RECORDS,
  READING_HISTORY_KEY,
} from "@/lib/storage/history";
import type { ReadingRecord } from "@/types/reading";
import type { AIInterpretationPayload } from "@/types/ai";

describe("Reading History LocalStorage Management (SDD §3, §8)", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const localStorageMock = {
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
      localStorage: localStorageMock,
    });
  });

  const mockPayload: AIInterpretationPayload = {
    safety: "none",
    overview: "Sample overview of card energies.",
    cards: [
      {
        cardId: "the-fool",
        positionKey: "message",
        meaningInContext: "Embrace spontaneous beginnings.",
        contributionToAnswer: "Suggests optimism and fresh momentum.",
        interpretation: "Embrace spontaneous beginnings.",
      },
    ],
    synthesis: "Harmonious flow.",
    advice: "Step forward courageously.",
    reflectionQuestion: "What new adventure awaits you?",
  };

  const createMockRecord = (id: string, question: string = "Career path?"): ReadingRecord => ({
    id,
    createdAt: new Date().toISOString(),
    question,
    spreadId: "single",
    reversedEnabled: false,
    cards: [
      {
        positionIndex: 0,
        positionKey: "message",
        cardId: "the-fool",
        orientation: "upright",
      },
    ],
    analysis: {
      majorCount: 1,
      majorRatio: 1,
      dominantElement: "air",
      repeatedRanks: [],
      courtCards: [],
      reversedRatio: 0,
    },
    interpretation: mockPayload,
    status: "complete",
  });

  it("returns an empty array when no history is stored", () => {
    expect(getReadingHistory()).toEqual([]);
  });

  it("saves a new reading record and prepends it (newest first)", () => {
    const record1 = createMockRecord("rec-1", "Question 1");
    const record2 = createMockRecord("rec-2", "Question 2");

    saveReadingToHistory(record1);
    saveReadingToHistory(record2);

    const history = getReadingHistory();
    expect(history.length).toBe(2);
    expect(history[0].id).toBe("rec-2");
    expect(history[1].id).toBe("rec-1");
  });

  it("enforces FIFO cap of 100 items when exceeding MAX_HISTORY_RECORDS", () => {
    // Insert 105 records
    for (let i = 1; i <= 105; i++) {
      saveReadingToHistory(createMockRecord(`rec-${i}`, `Question #${i}`));
    }

    const history = getReadingHistory();
    expect(history.length).toBe(MAX_HISTORY_RECORDS); // Exactly 100
    expect(history[0].id).toBe("rec-105"); // Newest
    expect(history[99].id).toBe("rec-6"); // 100th newest; rec-1 to rec-5 were dropped via FIFO
  });

  it("finds a record by ID with getReadingById", () => {
    const record = createMockRecord("rec-target", "Special inquiry");
    saveReadingToHistory(record);

    const found = getReadingById("rec-target");
    expect(found).not.toBeNull();
    expect(found?.question).toBe("Special inquiry");

    expect(getReadingById("non-existent")).toBeNull();
  });

  it("deletes a record by ID correctly", () => {
    const r1 = createMockRecord("rec-1");
    const r2 = createMockRecord("rec-2");
    saveReadingToHistory(r1);
    saveReadingToHistory(r2);

    const remaining = deleteReadingRecord("rec-1");
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe("rec-2");
    expect(getReadingHistory().length).toBe(1);
  });

  it("clears all reading history with clearReadingHistory", () => {
    saveReadingToHistory(createMockRecord("rec-1"));
    saveReadingToHistory(createMockRecord("rec-2"));

    clearReadingHistory();
    expect(getReadingHistory()).toEqual([]);
  });

  it("updates existing record without duplication if saved with same ID", () => {
    const original = createMockRecord("rec-same", "Original question");
    saveReadingToHistory(original);

    const updated = { ...original, question: "Updated question" };
    saveReadingToHistory(updated);

    const history = getReadingHistory();
    expect(history.length).toBe(1);
    expect(history[0].question).toBe("Updated question");
  });
});
