import type { SpreadId } from "@/types/spread";
import type { ReadingLifecycleState, ReadingAnalysis, ReadingStatus } from "@/types/reading";
import type { ShuffledCard, DrawnCard } from "@/types/tarot";
import type { AIInterpretationPayload } from "@/types/ai";

export const READING_SESSION_KEY = "tarot_active_reading_session";

export interface ActiveReadingSession {
  question: string;
  spreadId?: SpreadId;
  reversedEnabled: boolean;
  step?: "spread" | "shuffle" | "select" | "result";
  lifecycleState: ReadingLifecycleState;
  drawId?: string;
  deck?: ShuffledCard[];
  analysis?: ReadingAnalysis;
  drawnCards?: DrawnCard[];
  selectedIndices?: number[];
  interpretation?: AIInterpretationPayload | null;
  readingStatus?: ReadingStatus;
  locale?: "en" | "th";
  updatedAt: string;
}

const DEFAULT_SESSION: ActiveReadingSession = {
  question: "",
  reversedEnabled: false,
  lifecycleState: "NEW",
  locale: "en",
  updatedAt: new Date().toISOString(),
};

let isReloadHandled = false;

/**
 * Resets reload-handled flag for testing environments.
 */
export function resetReloadHandledForTesting(): void {
  isReloadHandled = false;
}

/**
 * Detects whether the current page load is a browser refresh/reload.
 * If refreshed, resets the active reading session so the user starts fresh.
 * (SDD §7 Flow State Machine: reset on refresh).
 */
export function handlePageReloadReset(): void {
  if (typeof window === "undefined" || isReloadHandled) {
    return;
  }
  isReloadHandled = true;

  try {
    const navEntries = window.performance?.getEntriesByType?.("navigation") as
      | PerformanceNavigationTiming[]
      | undefined;
    const navType = navEntries?.[0]?.type;
    const legacyType = (window.performance as unknown as { navigation?: { type: number } })
      ?.navigation?.type;
    const isReload = navType === "reload" || legacyType === 1;

    if (isReload) {
      window.sessionStorage?.removeItem(READING_SESSION_KEY);
      if (typeof window.dispatchEvent === "function" && typeof CustomEvent === "function") {
        window.dispatchEvent(new CustomEvent("tarot_session_reset"));
      }
    }
  } catch (error) {
    console.error("Failed to detect reload navigation:", error);
  }
}

// Auto-run reload check on module evaluation in browser
if (typeof window !== "undefined") {
  handlePageReloadReset();
}

/**
 * Safely retrieves the active reading session from sessionStorage.
 * Returns null if not in browser or if no session exists.
 */
export function getReadingSession(): ActiveReadingSession | null {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }

  handlePageReloadReset();

  try {
    const raw = window.sessionStorage.getItem(READING_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && typeof parsed.question === "string") {
      return parsed as ActiveReadingSession;
    }
    return null;
  } catch (error) {
    console.error("Failed to read reading session from sessionStorage:", error);
    return null;
  }
}

/**
 * Saves or updates fields in the active reading session in sessionStorage.
 */
export function saveReadingSession(
  sessionUpdates: Partial<ActiveReadingSession>
): ActiveReadingSession | null {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }

  try {
    const existing = getReadingSession() ?? DEFAULT_SESSION;
    const updated: ActiveReadingSession = {
      ...existing,
      ...sessionUpdates,
      updatedAt: new Date().toISOString(),
    };

    window.sessionStorage.setItem(READING_SESSION_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to persist reading session to sessionStorage:", error);
    return null;
  }
}

/**
 * Sets the active question and starts a completely fresh reading session,
 * explicitly purging all previous cards, deck, and interpretations.
 */
export function saveQuestion(question: string): ActiveReadingSession | null {
  const existing = getReadingSession();
  const freshSession: ActiveReadingSession = {
    question: question.trim(),
    reversedEnabled: existing?.reversedEnabled ?? false,
    locale: "en",
    lifecycleState: "NEW",
    step: "spread",
    interpretation: null,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(READING_SESSION_KEY, JSON.stringify(freshSession));
    } catch (error) {
      console.error("Failed to persist new question session:", error);
    }
  }
  return freshSession;
}

/**
 * Saves selected spread and reversed cards preference to active session,
 * resetting any existing deck or card picks.
 */
export function saveSpreadSelection(
  spreadId: SpreadId,
  reversedEnabled: boolean
): ActiveReadingSession | null {
  return saveReadingSession({
    spreadId,
    reversedEnabled,
    step: "shuffle",
    lifecycleState: "NEW",
    drawId: undefined,
    deck: undefined,
    analysis: undefined,
    drawnCards: [],
    selectedIndices: [],
    interpretation: null,
    readingStatus: undefined,
  });
}

/**
 * Saves draw result from POST /api/draw (SDD §4.2, §7, §9.1),
 * resetting drawn card selections for the newly shuffled deck.
 */
export function saveDrawResult(
  drawId: string,
  deck: ShuffledCard[],
  analysis: ReadingAnalysis
): ActiveReadingSession | null {
  return saveReadingSession({
    drawId,
    deck,
    analysis,
    lifecycleState: "SHUFFLED",
    step: "select",
    drawnCards: [],
    selectedIndices: [],
    interpretation: null,
    readingStatus: undefined,
  });
}

/**
 * Sets the reading session locale ("en" | "th").
 */
export function saveLocale(locale: "en" | "th"): ActiveReadingSession | null {
  return saveReadingSession({
    locale,
  });
}

/**
 * Saves drawn card selections into session (SDD §4.2, §7).
 */
export function saveDrawnCards(
  drawnCards: DrawnCard[],
  selectedIndices: number[],
  isComplete: boolean = false
): ActiveReadingSession | null {
  return saveReadingSession({
    drawnCards,
    selectedIndices,
    lifecycleState: isComplete ? "COMPLETE" : "SELECTING",
    step: isComplete ? "result" : "select",
  });
}

/**
 * Saves interpretation payload from POST /api/interpret into session (SDD §8, §9.2).
 */
export function saveInterpretation(
  interpretation: AIInterpretationPayload,
  status: ReadingStatus
): ActiveReadingSession | null {
  return saveReadingSession({
    interpretation,
    readingStatus: status,
    lifecycleState: "RESULT",
    step: "result",
  });
}

/**
 * Resets the session back to NEW for a fresh reading ritual (SDD §6.2, §7).
 */
export function resetReadingSession(): void {
  clearReadingSession();
}

/**
 * Clears the active reading session from sessionStorage.
 */
export function clearReadingSession(): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  try {
    window.sessionStorage.removeItem(READING_SESSION_KEY);
    if (typeof window.dispatchEvent === "function" && typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent("tarot_session_reset"));
    }
  } catch (error) {
    console.error("Failed to clear reading session from sessionStorage:", error);
  }
}
