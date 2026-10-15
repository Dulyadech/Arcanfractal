import type { SpreadId } from "@/types/spread";
import {
  extractSignals,
  type Signal,
} from "./spread-lexicon";

export type AllSignal = Signal | "complexity";

export interface RankedSpread {
  spread: SpreadId;
  score: number;
  share: number; // 0-100 percentage
}

export interface GuidedChip {
  id: Signal;
  labelTh: string;
  labelEn: string;
}

export interface ScoreResult {
  ranked: RankedSpread[];
  best: SpreadId;
  alternative: SpreadId;
  gap: number; // percentage difference between 1st and 2nd
  signalStrength: number; // sum of signals before affinity
  ambiguous: boolean;
  fired: AllSignal[];
  chips: GuidedChip[];
  signals: Record<AllSignal, number>;
}

// 2. Affinity Matrix
export const AFFINITY: Record<SpreadId, Record<AllSignal, number>> = {
  single: {
    quick: 1.0,
    timeline: 0.0,
    obstacle: 0.0,
    decision: 0.2,
    complexity: -0.8,
  },
  "three-timeline": {
    quick: -0.2,
    timeline: 1.0,
    obstacle: 0.2,
    decision: 0.0,
    complexity: 0.3,
  },
  "three-guidance": {
    quick: 0.0,
    timeline: 0.0,
    obstacle: 1.0,
    decision: 0.3,
    complexity: 0.4,
  },
  "five-path": {
    quick: -0.5,
    timeline: 0.2,
    obstacle: 0.2,
    decision: 1.0,
    complexity: 0.9,
  },
};

// Base prior scores
export const BASE_SCORES: Record<SpreadId, number> = {
  single: 0.1,
  "three-timeline": 0.25, // default fallback spread
  "three-guidance": 0.1,
  "five-path": 0.1,
};

export const AMBIGUITY = {
  minGap: 15, // Gap between rank 1 and 2 < 15% -> ambiguous
  minTopShare: 40, // Top share < 40% -> ambiguous
  minSignalStrength: 0.3, // Total signal strength < 0.3 -> ambiguous
  maxChips: 3,
};

export const CHIP_DEFINITIONS: Record<Signal, { labelTh: string; labelEn: string }> = {
  timeline: {
    labelTh: "ดูไทม์ไลน์ อดีต-ปัจจุบัน-อนาคต",
    labelEn: "Focus on timeline & future outlook",
  },
  obstacle: {
    labelTh: "อยากได้ทางออกแก้ปัญหา",
    labelEn: "Find obstacles & actionable solutions",
  },
  decision: {
    labelTh: "เปรียบเทียบทางเลือก",
    labelEn: "Compare choices & decision making",
  },
  quick: {
    labelTh: "ขอคำตอบสั้น ๆ สารใบเดียว",
    labelEn: "Quick snapshot & single-card message",
  },
};

/**
 * Calculates scores, ranks, ambiguity and guided chips for a given question.
 * Optionally accepts user-selected signal override (e.g. from a guided chip click).
 */
export function scoreSpreads(
  question: string,
  overrides?: Partial<Record<Signal, number>>
): ScoreResult {
  const extracted = extractSignals(question);
  const signals: Record<AllSignal, number> = {
    ...extracted,
    ...(overrides || {}),
  };

  const rawSignalsList: AllSignal[] = ["quick", "timeline", "obstacle", "decision", "complexity"];
  const signalStrength = rawSignalsList.reduce((sum, s) => sum + signals[s], 0);

  const fired: AllSignal[] = rawSignalsList.filter((s) => signals[s] >= 0.3);

  // Calculate score for each spread
  const spreads: SpreadId[] = ["single", "three-timeline", "three-guidance", "five-path"];
  const rawScores: Record<SpreadId, number> = {} as Record<SpreadId, number>;

  let totalScore = 0;
  for (const s of spreads) {
    let score = BASE_SCORES[s];
    for (const d of rawSignalsList) {
      score += AFFINITY[s][d] * signals[d];
    }
    const clampedScore = Math.max(0, score);
    rawScores[s] = clampedScore;
    totalScore += clampedScore;
  }

  // Calculate share percentages (normalize to 100)
  const ranked: RankedSpread[] = spreads
    .map((s) => {
      const share = totalScore > 0 ? (rawScores[s] / totalScore) * 100 : 25;
      return {
        spread: s,
        score: Number(rawScores[s].toFixed(3)),
        share: Number(share.toFixed(1)),
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = ranked[0].spread;
  const alternative = ranked[1].spread;
  const gap = Number((ranked[0].share - ranked[1].share).toFixed(1));

  const ambiguous =
    gap < AMBIGUITY.minGap ||
    ranked[0].share < AMBIGUITY.minTopShare ||
    signalStrength < AMBIGUITY.minSignalStrength;

  // Determine which chips to present when ambiguous
  // Target top 2-3 spreads and see what positive affinity signals would help them
  const relevantSignals = new Set<Signal>();
  const topSpreads = [ranked[0].spread, ranked[1].spread];

  for (const s of topSpreads) {
    (Object.keys(CHIP_DEFINITIONS) as Signal[]).forEach((sig) => {
      if (AFFINITY[s][sig] >= 0.8 && signals[sig] < 0.7) {
        relevantSignals.add(sig);
      }
    });
  }

  // If still empty, add default candidate chips
  if (relevantSignals.size === 0) {
    relevantSignals.add("timeline");
    relevantSignals.add("obstacle");
    relevantSignals.add("decision");
  }

  const chips: GuidedChip[] = Array.from(relevantSignals)
    .slice(0, AMBIGUITY.maxChips)
    .map((sig) => ({
      id: sig,
      labelTh: CHIP_DEFINITIONS[sig].labelTh,
      labelEn: CHIP_DEFINITIONS[sig].labelEn,
    }));

  return {
    ranked,
    best,
    alternative,
    gap,
    signalStrength: Number(signalStrength.toFixed(3)),
    ambiguous,
    fired,
    chips,
    signals,
  };
}
