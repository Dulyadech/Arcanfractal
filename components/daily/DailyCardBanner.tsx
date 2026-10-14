"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import type { DailyCardRecord, DailyStreakState } from "@/types/daily";
import { getTodayDailyCard, getDailyStreak } from "@/lib/storage/daily-card";
import { getCardById } from "@/data/cards";
import { getCardImageUrl, getCardBackImageUrl } from "@/lib/tarot/card-images";
import { DailyStreakBadge } from "./DailyStreakBadge";

export function DailyCardBanner() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [todayRecord, setTodayRecord] = useState<DailyCardRecord | null>(null);
  const [streak, setStreak] = useState<DailyStreakState>({
    currentStreak: 0,
    maxStreak: 0,
    lastDrawnDate: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setTodayRecord(getTodayDailyCard());
    setStreak(getDailyStreak());
  }, [pathname]);

  // Don't render redundant banner when already on the daily card page
  if (pathname === "/daily") {
    return null;
  }

  const isDrawn = mounted && !!todayRecord;
  const cardData = isDrawn && todayRecord ? getCardById(todayRecord.card.cardId) : null;
  const cardName = cardData ? cardData.name : todayRecord?.card.cardId;

  return (
    <div className="w-full border-b border-white/[0.08] bg-gradient-to-r from-emerald-950/40 via-[#10141a]/95 to-emerald-950/40 transition-all">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-2 sm:px-6 sm:py-2.5">
        {/* Left Side: Badge + Streak + Card Information */}
        <Link
          href="/daily"
          className="group flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
          aria-label="Open Daily Card Ritual"
        >
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-300 uppercase sm:text-[11px]">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            Daily Ritual
          </span>

          <DailyStreakBadge streak={streak} />

          {isDrawn && todayRecord ? (
            <span className="truncate text-xs text-zinc-300">
              <span className="hidden sm:inline text-zinc-400">Today: </span>
              <strong className="font-serif font-normal text-emerald-200 italic">{cardName}</strong>{" "}
              <span className="text-[11px] text-zinc-400">({todayRecord.card.orientation})</span>
              {todayRecord.theme && (
                <span className="hidden md:inline text-zinc-400"> • {todayRecord.theme}</span>
              )}
            </span>
          ) : (
            <span className="truncate text-xs text-zinc-300">
              <span className="font-medium text-zinc-200">Card of the Day</span>
              <span className="hidden sm:inline text-zinc-400">
                : Draw a single card for morning alignment & archetypal focus
              </span>
            </span>
          )}
        </Link>

        {/* Right Side: CTA Button + Card Thumbnail Preview */}
        <Link
          href="/daily"
          className="group/cta flex shrink-0 items-center gap-2 text-xs font-medium text-emerald-300 transition-colors hover:text-emerald-200"
          aria-label={isDrawn ? "View Today's Guidance" : "Begin Daily Draw"}
        >
          <span className="text-xs">
            {isDrawn ? "View Guidance" : "Begin Draw"}
          </span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5" />

          {/* Mini Card Thumbnail Preview */}
          <div className="relative h-7 w-5 shrink-0 overflow-hidden rounded border border-white/20 bg-[#0e1320] shadow-sm transition-transform group-hover/cta:scale-105 group-hover/cta:border-emerald-400/60 sm:h-8 sm:w-6">
            {isDrawn && todayRecord ? (
              <Image
                src={getCardImageUrl(todayRecord.card.cardId)}
                alt={cardName || "Card"}
                fill
                sizes="32px"
                className={`object-cover ${
                  todayRecord.card.orientation === "reversed" ? "rotate-180" : ""
                }`}
              />
            ) : (
              <Image
                src={getCardBackImageUrl()}
                alt="Card back"
                fill
                sizes="32px"
                quality={60}
                className="object-cover"
              />
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
