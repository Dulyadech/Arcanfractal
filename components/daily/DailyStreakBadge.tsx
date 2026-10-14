"use client";

import React from "react";
import { Flame, Sparkles } from "lucide-react";
import type { DailyStreakState } from "@/types/daily";

interface DailyStreakBadgeProps {
  streak: DailyStreakState;
  className?: string;
  showDetails?: boolean;
}

export function DailyStreakBadge({
  streak,
  className = "",
  showDetails = false,
}: DailyStreakBadgeProps) {
  const count = streak.currentStreak || 0;
  const isHot = count >= 3;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${
        isHot
          ? "bg-emerald-950/60 text-emerald-200 border-emerald-500/40 shadow-sm shadow-emerald-900/30"
          : count > 0
          ? "bg-teal-950/40 text-teal-200 border-teal-500/30"
          : "bg-[#14181d]/80 text-zinc-400 border-white/[0.1]"
      } ${className}`}
      title={`Current Streak: ${count} days (Max: ${streak.maxStreak || count} days)`}
    >
      {isHot ? (
        <Flame className="w-3 h-3 text-emerald-300 animate-pulse" />
      ) : (
        <Sparkles className="w-3 h-3 text-teal-300" />
      )}
      <span className="font-semibold">{count}</span>
      <span className="text-[10px] opacity-80">
        {count === 1 ? "day streak" : "days streak"}
      </span>
      {showDetails && streak.maxStreak > count && (
        <span className="text-[10px] text-zinc-500 pl-1 border-l border-white/[0.1]">
          Best: {streak.maxStreak}d
        </span>
      )}
    </div>
  );
}
