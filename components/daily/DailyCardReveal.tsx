"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getCardImageUrl, getCardBackImageUrl } from "@/lib/tarot/card-images";
import type { CardOrientation } from "@/types/tarot";

interface DailyCardRevealProps {
  cardId: string;
  cardName: string;
  orientation: CardOrientation;
  isRevealed: boolean;
  onReveal?: () => void;
  isDrawing?: boolean;
}

export function DailyCardReveal({
  cardId,
  cardName,
  orientation,
  isRevealed,
  onReveal,
  isDrawing = false,
}: DailyCardRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Outer ambient glow based on reveal state */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-3xl blur-2xl transition-all duration-700 ${
          isRevealed
            ? "bg-emerald-500/20 scale-105"
            : "bg-teal-500/10 scale-95"
        }`}
      />

      <div
        className="relative h-[320px] w-[200px] sm:h-[380px] sm:w-[230px] cursor-pointer [perspective:1000px]"
        onClick={!isRevealed && !isDrawing ? onReveal : undefined}
      >
        <motion.div
          className="relative h-full w-full rounded-2xl [transform-style:preserve-3d]"
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : {
                  rotateY: isRevealed ? 180 : 0,
                  scale: isDrawing ? 0.96 : 1,
                }
          }
          transition={{
            duration: shouldReduceMotion ? 0.3 : 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* Back of Card (Face Down) */}
          <div className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-b from-[#1d1640] via-[#0e1320] to-[#070b0e] shadow-[0_12px_32px_rgba(0,0,0,0.7)] [backface-visibility:hidden]">
            <Image
              src={getCardBackImageUrl()}
              alt="Tarot Card Face Down"
              fill
              sizes="(max-width: 640px) 200px, 230px"
              className="object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-emerald-500/10" />

            {!isRevealed && (
              <div className="absolute inset-x-0 bottom-4 flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-xs text-emerald-200 border border-emerald-500/40 shadow-lg animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Tap to Reveal
                </span>
              </div>
            )}
          </div>

          {/* Front of Card (Face Up) */}
          <div
            className={`absolute inset-0 h-full w-full overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-[#14181d] shadow-[0_16px_36px_rgba(0,0,0,0.8)] [backface-visibility:hidden] [transform:rotateY(180deg)] ${
              orientation === "reversed" ? "rotate-180" : ""
            }`}
          >
            <Image
              src={getCardImageUrl(cardId)}
              alt={`${cardName} (${orientation})`}
              fill
              sizes="(max-width: 640px) 200px, 230px"
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* Orientation badge when revealed */}
      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex items-center gap-2"
        >
          <span className="text-base sm:text-lg font-serif font-medium text-emerald-100 tracking-wide">
            {cardName}
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
              orientation === "reversed"
                ? "bg-rose-950/50 text-rose-300 border-rose-600/40"
                : "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
            }`}
          >
            {orientation === "reversed" ? "Reversed" : "Upright"}
          </span>
        </motion.div>
      )}
    </div>
  );
}
