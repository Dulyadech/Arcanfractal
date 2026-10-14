import type { DailyCardRecord, DailyStreakState } from "@/types/daily";

export const ARCANFRACTAL_DAILY_CARD = "arcanfractal_daily_card";
export const ARCANFRACTAL_DAILY_HISTORY = "arcanfractal_daily_history";
export const ARCANFRACTAL_DAILY_STREAK = "arcanfractal_daily_streak";
export const MAX_DAILY_HISTORY_RECORDS = 100;

/**
 * Returns the calendar date string in YYYY-MM-DD format based on local midnight.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Checks whether two YYYY-MM-DD date strings represent the exact same calendar day.
 */
export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

/**
 * Checks whether currentDate is exactly one calendar day after lastDate in local time.
 */
export function isConsecutiveDay(lastDate: string, currentDate: string): boolean {
  const [y1, m1, d1] = lastDate.split("-").map(Number);
  const [y2, m2, d2] = currentDate.split("-").map(Number);

  if (isNaN(y1) || isNaN(m1) || isNaN(d1) || isNaN(y2) || isNaN(m2) || isNaN(d2)) {
    return false;
  }

  const dateA = new Date(y1, m1 - 1, d1);
  const dateB = new Date(y2, m2 - 1, d2);

  const diffMs = dateB.getTime() - dateA.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return diffDays === 1;
}

/**
 * Calculates remaining hours, minutes, and seconds until the next local midnight.
 */
export function getTimeUntilMidnight(now: Date = new Date()): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );

  const diffMs = Math.max(0, nextMidnight.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds };
}

/**
 * Retrieves the daily card record drawn for today.
 * Returns null if no card was drawn today or if local midnight has passed.
 */
export function getTodayDailyCard(): DailyCardRecord | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ARCANFRACTAL_DAILY_CARD);
    if (!raw) {
      return null;
    }

    const record = JSON.parse(raw) as DailyCardRecord;
    const today = getLocalDateString();

    if (record && record.date === today) {
      return record;
    }

    return null;
  } catch (error) {
    console.error("Failed to read today's daily card from localStorage:", error);
    return null;
  }
}

/**
 * Fast check to determine if the user has already drawn a daily card today.
 */
export function hasDrawnToday(): boolean {
  return getTodayDailyCard() !== null;
}

/**
 * Retrieves past daily card records from localStorage in reverse chronological order.
 */
export function getDailyCardHistory(limit = MAX_DAILY_HISTORY_RECORDS): DailyCardRecord[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ARCANFRACTAL_DAILY_HISTORY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return (parsed as DailyCardRecord[]).slice(0, limit);
    }

    return [];
  } catch (error) {
    console.error("Failed to read daily card history from localStorage:", error);
    return [];
  }
}

/**
 * Retrieves the current streak state.
 * If the user missed yesterday and has not drawn today, the current streak resets to 0.
 */
export function getDailyStreak(today: string = getLocalDateString()): DailyStreakState {
  const defaultState: DailyStreakState = {
    currentStreak: 0,
    maxStreak: 0,
    lastDrawnDate: null,
    streakHistory: [],
  };

  if (typeof window === "undefined" || !window.localStorage) {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(ARCANFRACTAL_DAILY_STREAK);
    if (!raw) {
      return defaultState;
    }

    const state = JSON.parse(raw) as DailyStreakState;
    if (!state.lastDrawnDate) {
      return defaultState;
    }

    // If drawn today or yesterday, streak is currently active
    if (
      isSameDay(state.lastDrawnDate, today) ||
      isConsecutiveDay(state.lastDrawnDate, today)
    ) {
      return state;
    }

    // Streak broken: more than 1 day missed
    return {
      ...state,
      currentStreak: 0,
    };
  } catch (error) {
    console.error("Failed to read daily streak from localStorage:", error);
    return defaultState;
  }
}

/**
 * Updates and persists streak state when a card is drawn on drawDate.
 */
export function updateStreakOnDraw(drawDate: string = getLocalDateString()): DailyStreakState {
  if (typeof window === "undefined" || !window.localStorage) {
    return {
      currentStreak: 1,
      maxStreak: 1,
      lastDrawnDate: drawDate,
      streakHistory: [drawDate],
    };
  }

  try {
    const currentState = getDailyStreak(drawDate);

    // Already drawn today: no change in streak count
    if (currentState.lastDrawnDate && isSameDay(currentState.lastDrawnDate, drawDate)) {
      return currentState;
    }

    let newCurrentStreak = 1;
    let newStreakHistory = [drawDate];

    if (currentState.lastDrawnDate && isConsecutiveDay(currentState.lastDrawnDate, drawDate)) {
      newCurrentStreak = (currentState.currentStreak || 0) + 1;
      newStreakHistory = [...(currentState.streakHistory || []), drawDate];
    }

    const newMaxStreak = Math.max(currentState.maxStreak || 0, newCurrentStreak);

    const updatedState: DailyStreakState = {
      currentStreak: newCurrentStreak,
      maxStreak: newMaxStreak,
      lastDrawnDate: drawDate,
      streakHistory: newStreakHistory,
    };

    window.localStorage.setItem(ARCANFRACTAL_DAILY_STREAK, JSON.stringify(updatedState));
    return updatedState;
  } catch (error) {
    console.error("Failed to update daily streak in localStorage:", error);
    return {
      currentStreak: 1,
      maxStreak: 1,
      lastDrawnDate: drawDate,
      streakHistory: [drawDate],
    };
  }
}

/**
 * Saves a new daily card record into localStorage, updates history and updates streak.
 */
export function saveDailyCard(record: DailyCardRecord): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    // 1. Save today's card
    window.localStorage.setItem(ARCANFRACTAL_DAILY_CARD, JSON.stringify(record));

    // 2. Prepend to history (enforcing limit and avoiding duplicate date)
    const currentHistory = getDailyCardHistory();
    const filteredHistory = currentHistory.filter(
      (item) => item.id !== record.id && item.date !== record.date
    );
    const updatedHistory = [record, ...filteredHistory].slice(0, MAX_DAILY_HISTORY_RECORDS);
    window.localStorage.setItem(
      ARCANFRACTAL_DAILY_HISTORY,
      JSON.stringify(updatedHistory)
    );

    // 3. Update streak
    updateStreakOnDraw(record.date);
  } catch (error) {
    console.error("Failed to save daily card to localStorage:", error);
  }
}

/**
 * Clears all daily card related data from localStorage (useful for debugging/reset).
 */
export function clearDailyCardStorage(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(ARCANFRACTAL_DAILY_CARD);
    window.localStorage.removeItem(ARCANFRACTAL_DAILY_HISTORY);
    window.localStorage.removeItem(ARCANFRACTAL_DAILY_STREAK);
  } catch (error) {
    console.error("Failed to clear daily card storage:", error);
  }
}
