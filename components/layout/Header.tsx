"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { History, Moon, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { resetReadingSession } from "@/lib/storage/reading-session";
import { getDailyStreak } from "@/lib/storage/daily-card";
import type { DailyStreakState } from "@/types/daily";

export function Header() {
  const { t } = useLanguage();
  const [streak, setStreak] = useState<DailyStreakState>({
    currentStreak: 0,
    maxStreak: 0,
    lastDrawnDate: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreak(getDailyStreak());
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#070b0e]/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-14 sm:h-16 w-full max-w-[1100px] items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <Link
          href="/"
          onClick={() => resetReadingSession()}
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-emerald-300 transition-colors group-hover:border-emerald-400 group-hover:bg-emerald-500/20">
            <Moon className="h-4 w-4 fill-emerald-300/30 text-emerald-300" />
          </div>
          <span className="font-heading font-serif text-base font-medium tracking-wide text-zinc-100 sm:text-lg">
            Arcanfractal
          </span>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden items-center gap-6 text-xs font-medium text-zinc-400 md:flex">
          <Link
            href="/"
            onClick={() => resetReadingSession()}
            className="transition-colors hover:text-zinc-100"
          >
            {t.nav.newReading}
          </Link>
          <Link href="/read?step=spread" className="transition-colors hover:text-zinc-100">
            {t.nav.spreads}
          </Link>
          <Link href="/history" className="transition-colors hover:text-zinc-100">
            {t.nav.history}
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/history"
            className="flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-100 md:hidden"
          >
            <History className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">{t.nav.history}</span>
          </Link>

          {/* Daily Card Button */}
          <Link
            href="/daily"
            className="group flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur-md transition-all hover:border-emerald-400/60 hover:bg-emerald-500/20 hover:text-emerald-200"
            title="Daily Card Ritual"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 transition-transform group-hover:rotate-12" />
            <span>
              Daily<span className="hidden sm:inline"> Card</span>
            </span>
            {streak.currentStreak > 0 && (
              <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-300">
                🔥 {streak.currentStreak}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
