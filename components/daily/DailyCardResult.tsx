"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Quote,
  Compass,
  Copy,
  Check,
  Clock,
  Calendar,
  BookOpen,
} from "lucide-react";
import type { DailyCardRecord } from "@/types/daily";
import { getTimeUntilMidnight } from "@/lib/storage/daily-card";
import { getCardById } from "@/data/cards";
import { getThaiCardDetail } from "@/data/cards/thai-meanings";

interface DailyCardResultProps {
  record: DailyCardRecord;
  onOpenHistory?: () => void;
}

export function DailyCardResult({ record, onOpenHistory }: DailyCardResultProps) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  // Countdown timer updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const thaiCardDetail = getThaiCardDetail(record.card.cardId);
  const fallbackCard = record.card.card || getCardById(record.card.cardId);
  const cardDisplayName = thaiCardDetail ? thaiCardDetail.name : fallbackCard?.name || record.card.cardId;
  const orientationText = record.card.orientation === "reversed" ? "กลับหัว" : "ตำแหน่งตั้ง";

  // Use Thai interpretation exclusively
  const activeInterpretation =
    record.interpretations?.th || {
      theme: record.theme,
      overview: record.overview,
      affirmation: record.affirmation,
      advice: record.advice,
    };

  const handleCopy = async () => {
    const textToCopy = `✨ Arcanfractal ไพ่ประจำวัน (${record.date})
ไพ่: ${cardDisplayName} (${orientationText})
ธีม: ${activeInterpretation.theme}
${activeInterpretation.overview ? `\nบทสะท้อนประจำวัน:\n${activeInterpretation.overview}\n` : ""}
ประโยคพลังใจ: "${activeInterpretation.affirmation}"
ข้อคิดแนวทาง: ${activeInterpretation.advice}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy guidance to clipboard:", e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-xl mx-auto space-y-5 text-left"
    >
      {/* Top action row: History & Countdown */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5 bg-[#14181d]/85 border border-white/[0.1] px-2.5 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span>ไพ่ใบถัดไปในอีก:</span>
          <span className="font-mono text-emerald-200 font-medium">
            {String(countdown.hours).padStart(2, "0")}:
            {String(countdown.minutes).padStart(2, "0")}:
            {String(countdown.seconds).padStart(2, "0")}
          </span>
        </div>

        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14181d]/80 hover:bg-[#1a2027] text-zinc-300 border border-white/[0.1] transition cursor-pointer"
            title="ดูประวัติไพ่ประจำวันในอดีต"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>ประวัติไพ่</span>
          </button>
        )}
      </div>

      {/* Main Insight Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#14181d]/85 p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        {/* Ambient Corner Flare */}
        <div className="pointer-events-none absolute top-0 right-0 -mr-12 -mt-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Theme of the Day */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ธีมพลังงานประจำวัน</span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
            {activeInterpretation.theme}
          </h3>
        </div>

        {/* Affirmation Box */}
        <div className="relative my-4 rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-4 sm:p-5">
          <Quote className="pointer-events-none absolute top-3 left-3 w-6 h-6 text-emerald-400/20 -scale-x-100" />
          <p className="relative pl-6 text-base sm:text-lg font-serif italic text-emerald-100 leading-relaxed">
            &ldquo;{activeInterpretation.affirmation}&rdquo;
          </p>
        </div>

        {/* In-depth Daily Reflection (Overview) */}
        {activeInterpretation.overview && (
          <div className="mt-4 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-emerald-300 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>บทสะท้อนและพลังงานประจำวัน</span>
            </div>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed whitespace-pre-line">
              {activeInterpretation.overview}
            </p>
          </div>
        )}

        {/* Mindset Guidance */}
        <div className="mt-4 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-teal-400 mb-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>แนวทางและข้อคิดในการใช้ชีวิต</span>
          </div>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            {activeInterpretation.advice}
          </p>
        </div>

        {/* Copy as Text button */}
        <div className="mt-5 pt-3 flex justify-end">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] transition shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">คัดลอกเรียบร้อยแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>คัดลอกคำทำนาย</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
