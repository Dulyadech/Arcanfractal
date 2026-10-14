import type { DrawnCard } from "./tarot";

/**
 * Micro-interpretation structure for a daily Tarot card.
 */
export interface DailyCardInterpretation {
  /** Thematic energy or focus keyword for the day (e.g. "Clarity & Decisiveness") */
  theme: string;
  /** Uplifting personal affirmation */
  affirmation: string;
  /** Practical mindset or action advice for the day */
  advice: string;
}

/**
 * Persisted record for a daily Tarot draw (TODO Phase 9, SDD Post-MVP).
 */
export interface DailyCardRecord {
  /** Unique record identifier (e.g., daily-2026-10-15 or UUID) */
  id: string;
  /** Calendar date in YYYY-MM-DD format based on local midnight */
  date: string;
  /** Exact ISO timestamp of the draw */
  drawnAt: string;
  /** The single Tarot card drawn for the day */
  card: DrawnCard;
  /** Active theme for the selected locale */
  theme: string;
  /** Active affirmation for the selected locale */
  affirmation: string;
  /** Active daily advice for the selected locale */
  advice: string;
  /** Active locale when drawn */
  locale: "th" | "en";
  /** Optional dual-language interpretations enabling instant quick-toggle */
  interpretations?: {
    th: DailyCardInterpretation;
    en: DailyCardInterpretation;
  };
  /** Status indicating whether interpretation was AI-generated or deterministic catalog fallback */
  status?: "complete" | "fallback";
}

/**
 * Daily streak state tracking consecutive days of ritual participation.
 */
export interface DailyStreakState {
  /** Current consecutive days streak count */
  currentStreak: number;
  /** All-time highest streak count achieved */
  maxStreak: number;
  /** The last date on which a daily card was drawn (YYYY-MM-DD) */
  lastDrawnDate: string | null;
  /** Chronological history of past daily card draws */
  history?: DailyCardRecord[];
  /** Array of consecutive dates recorded in the active streak */
  streakHistory?: string[];
}
