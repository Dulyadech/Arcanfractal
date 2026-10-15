"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Calendar, ChevronRight, X, Sparkles } from "lucide-react";
import type { DailyCardRecord } from "@/types/daily";
import { getCardById } from "@/data/cards";
import { getCardImageUrl } from "@/lib/tarot/card-images";

interface DailyHistoryCalendarProps {
  history: DailyCardRecord[];
  onClose?: () => void;
  isOpen?: boolean;
}

export function DailyHistoryCalendar({
  history,
  onClose,
  isOpen = true,
}: DailyHistoryCalendarProps) {
  const [selectedRecord, setSelectedRecord] = useState<DailyCardRecord | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-white/[0.12] bg-[#0e1320] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#14181d]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-serif font-bold text-white">
              Daily Reading Journey
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content list or detail view */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {selectedRecord ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                ← Back to full list
              </button>

              <div className="flex gap-4 items-start bg-[#14181d]/90 p-4 rounded-xl border border-white/[0.1]">
                <div className="relative w-20 h-32 rounded-lg overflow-hidden flex-shrink-0 border border-emerald-500/30">
                  <Image
                    src={getCardImageUrl(selectedRecord.card.cardId)}
                    alt={selectedRecord.card.cardId}
                    fill
                    sizes="80px"
                    className={`object-cover ${
                      selectedRecord.card.orientation === "reversed" ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <div className="space-y-2 text-sm flex-1">
                  <div className="text-xs text-zinc-400 font-mono">
                    {selectedRecord.date}
                  </div>
                  <div className="font-serif font-bold text-white">
                    {getCardById(selectedRecord.card.cardId)?.name || selectedRecord.card.cardId}{" "}
                    <span className="text-xs text-zinc-400 font-sans font-normal">
                      ({selectedRecord.card.orientation})
                    </span>
                  </div>
                  <div className="text-xs text-emerald-300 font-medium">
                    {selectedRecord.theme}
                  </div>
                  <p className="text-xs italic text-emerald-100 border-l-2 border-emerald-500/40 pl-2">
                    "{selectedRecord.affirmation}"
                  </p>
                  <p className="text-xs text-zinc-300 pt-1">
                    {selectedRecord.advice}
                  </p>
                </div>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-sm space-y-2">
              <Sparkles className="w-8 h-8 text-zinc-600 mx-auto" />
              <p>No past daily cards recorded yet.</p>
              <p className="text-xs text-zinc-500">
                Draw your daily card each day to build your reflection streak!
              </p>
            </div>
          ) : (
            history.map((record) => {
              const card = getCardById(record.card.cardId);
              const cardName = card ? card.name : record.card.cardId;

              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#14181d]/80 hover:bg-[#18202a] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition"
                >
                  <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0 border border-white/[0.1]">
                    <Image
                      src={getCardImageUrl(record.card.cardId)}
                      alt={cardName}
                      fill
                      sizes="40px"
                      className={`object-cover ${
                        record.card.orientation === "reversed" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>{record.date}</span>
                      <span className="capitalize text-[11px] text-zinc-500">
                        {record.card.orientation}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white truncate">
                      {cardName}
                    </div>
                    <div className="text-xs text-emerald-300/90 truncate">
                      {record.theme}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
