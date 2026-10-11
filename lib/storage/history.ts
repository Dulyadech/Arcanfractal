import type { ReadingRecord } from "@/types/reading";

export const READING_HISTORY_KEY = "tarot_reading_history";
export const MAX_HISTORY_RECORDS = 100;

/**
 * Retrieves the stored reading history list from localStorage.
 * Guaranteed to return an array (empty if none or SSR).
 * Returns records in descending chronological order (newest first).
 */
export function getReadingHistory(): ReadingRecord[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(READING_HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as ReadingRecord[];
    }
    return [];
  } catch (error) {
    console.error("Failed to read reading history from localStorage:", error);
    return [];
  }
}

/**
 * Saves a new reading record into history.
 * Enforces FIFO capping at MAX_HISTORY_RECORDS (100 items).
 * Prepends new record so it appears at index 0 (newest first).
 */
export function saveReadingToHistory(record: ReadingRecord): ReadingRecord[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [record];
  }

  try {
    const currentList = getReadingHistory();

    // Prevent duplicate entries of the same record ID if already saved
    const filtered = currentList.filter((item) => item.id !== record.id);

    // Prepend new record
    const updated = [record, ...filtered];

    // Enforce FIFO limit of 100 items
    const trimmed = updated.slice(0, MAX_HISTORY_RECORDS);

    window.localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch (error) {
    console.error("Failed to persist reading record to history:", error);
    return [];
  }
}

/**
 * Retrieves a single reading record by ID from history.
 */
export function getReadingById(id: string): ReadingRecord | null {
  const history = getReadingHistory();
  return history.find((record) => record.id === id) || null;
}

/**
 * Deletes a single reading record by ID from history.
 */
export function deleteReadingRecord(id: string): ReadingRecord[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const currentList = getReadingHistory();
    const updated = currentList.filter((item) => item.id !== id);
    window.localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to delete reading record from history:", error);
    return [];
  }
}

/**
 * Clears all reading records from history.
 */
export function clearReadingHistory(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(READING_HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear reading history:", error);
  }
}
