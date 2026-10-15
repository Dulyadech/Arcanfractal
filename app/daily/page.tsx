"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Calendar } from "lucide-react";
import type { DailyCardRecord, DailyStreakState } from "@/types/daily";
import {
  getTodayDailyCard,
  getDailyStreak,
  getDailyCardHistory,
} from "@/lib/storage/daily-card";
import { drawDailyCard } from "@/lib/tarot/daily-draw";
import { getCardById } from "@/data/cards";
import { getThaiCardDetail } from "@/data/cards/thai-meanings";
import { DailyCardReveal } from "@/components/daily/DailyCardReveal";
import { DailyCardResult } from "@/components/daily/DailyCardResult";
import { DailyStreakBadge } from "@/components/daily/DailyStreakBadge";
import { DailyHistoryCalendar } from "@/components/daily/DailyHistoryCalendar";

export default function DailyCardPage() {
  const [mounted, setMounted] = useState(false);
  const [record, setRecord] = useState<DailyCardRecord | null>(null);
  const [streak, setStreak] = useState<DailyStreakState>({
    currentStreak: 0,
    maxStreak: 0,
    lastDrawnDate: null,
  });
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<DailyCardRecord[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const today = getTodayDailyCard();
    if (today) {
      setRecord(today);
      setIsRevealed(true);
    }
    setStreak(getDailyStreak());
    setHistoryList(getDailyCardHistory());
  }, []);

  const handleDraw = async () => {
    if (isDrawing || isRevealed) return;

    setIsDrawing(true);
    try {
      const newRecord = await drawDailyCard({ allowReversed: false, locale: "th" });
      setRecord(newRecord);
      // Brief pause to synchronize the ritual feeling with card reveal
      setTimeout(() => {
        setIsRevealed(true);
        setIsDrawing(false);
        setStreak(getDailyStreak());
        setHistoryList(getDailyCardHistory());
      }, 400);
    } catch (err) {
      console.error("Failed to draw daily card:", err);
      setIsDrawing(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  const thaiDetail = record?.card?.cardId ? getThaiCardDetail(record.card.cardId) : null;
  const fallbackData = record?.card?.cardId ? getCardById(record.card.cardId) : null;
  const cardName = thaiDetail ? thaiDetail.name : fallbackData?.name || record?.card?.cardId || "ไพ่ปริศนาประจำวัน";

  return (
    <main className="min-h-screen bg-[#070b0e] text-zinc-100 flex flex-col justify-between py-6 px-4">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between py-2 border-b border-white/[0.08] mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition py-1 px-2.5 rounded-lg hover:bg-white/[0.05]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>หน้าแรก</span>
        </Link>

        <div className="flex items-center gap-2">
          <DailyStreakBadge streak={streak} showDetails />
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-1.5 text-zinc-400 hover:text-emerald-300 hover:bg-white/[0.05] rounded-lg transition cursor-pointer"
            title="ดูประวัติไพ่ประจำวัน"
            aria-label="ดูประวัติไพ่ประจำวัน"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <section className="w-full max-w-xl mx-auto flex-1 flex flex-col items-center justify-center text-center space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>พลังงานประจำวัน</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {isRevealed ? "คำทำนายประจำวัน" : "ไพ่ประจำวันของคุณ"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            {isRevealed
              ? "ใคร่ครวญกระจกสะท้อนจิตวิญญาณใบนี้ และนำปัญญาญาณไปใช้ในการดำเนินชีวิตวันนี้"
              : "สูดลมหายใจอย่างมีสติ ตั้งจิตให้อยู่นิ่ง แล้วแตะที่ไพ่เพื่อเปิดคำทำนาย"}
          </p>
        </div>

        {/* 3D Card Display */}
        <DailyCardReveal
          cardId={record?.card?.cardId || "fool"}
          cardName={cardName}
          orientation={record?.card?.orientation || "upright"}
          isRevealed={isRevealed}
          onReveal={handleDraw}
          isDrawing={isDrawing}
        />

        {/* If not revealed: Prompt with "ฉันพร้อมแล้ว" ritual button */}
        {!isRevealed && (
          <div className="flex flex-col items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDraw}
              disabled={isDrawing}
              className="group relative inline-flex items-center gap-2.5 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-500/20 via-emerald-500/30 to-emerald-500/20 px-8 py-3 text-sm font-semibold text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.25)] backdrop-blur-md transition-all hover:scale-105 hover:border-emerald-300 hover:bg-emerald-500/35 hover:text-white hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] active:scale-95 disabled:pointer-events-none disabled:opacity-60 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-emerald-400 transition-transform group-hover:rotate-12" />
              <span>{isDrawing ? "กำลังเปิดไพ่และอ่านคำทำนาย..." : "ฉันพร้อมแล้ว"}</span>
            </button>
            <p className="text-[11px] text-zinc-500">
              ตั้งจิตสงบนิ่งแล้วแตะไพ่หรือกดปุ่มเมื่อพร้อมเปิดรับคำทำนาย
            </p>
          </div>
        )}

        {/* If revealed: Render detailed interpretation result */}
        {isRevealed && record && (
          <DailyCardResult
            record={record}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        )}
      </section>

      {/* History Modal */}
      <DailyHistoryCalendar
        history={historyList}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto text-center pt-8 text-[11px] text-zinc-500">
        Arcanfractal • Mindful Tarot & Archetypal Reflection
      </footer>
    </main>
  );
}
