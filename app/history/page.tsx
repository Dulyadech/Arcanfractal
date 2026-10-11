"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Trash2,
  Sparkles,
  Calendar,
  Compass,
  ArrowRight,
  ShieldAlert,
  BookOpen,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import {
  getReadingHistory,
  deleteReadingRecord,
  clearReadingHistory,
} from "@/lib/storage/history";
import { saveReadingSession } from "@/lib/storage/reading-session";
import { SPREADS } from "@/data/spreads";
import { getCardById } from "@/data/cards";
import { getCardImageUrl } from "@/lib/tarot/card-images";
import { useLanguage } from "@/lib/i18n/context";
import type { ReadingRecord } from "@/types/reading";

export default function HistoryPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [history, setHistory] = useState<ReadingRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ReadingRecord | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(getReadingHistory());
    setIsLoaded(true);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteReadingRecord(id);
    setHistory(updated);
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm(t.history.clearConfirm)) {
      clearReadingHistory();
      setHistory([]);
      setSelectedRecord(null);
    }
  };

  const handleOpenReadingInResult = (record: ReadingRecord) => {
    if (!record.interpretation) return;

    // Load record back into active session and route to /read?step=result
    saveReadingSession({
      drawId: record.id,
      question: record.question,
      spreadId: record.spreadId,
      reversedEnabled: record.reversedEnabled,
      drawnCards: record.cards,
      analysis: record.analysis,
      interpretation: record.interpretation,
      readingStatus: record.status,
      lifecycleState: "RESULT",
      step: "result",
    });

    router.push("/read?step=result");
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-xs uppercase">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-start pt-2 pb-24 sm:pt-6">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 w-full text-center"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md">
          <History className="h-3.5 w-3.5 text-emerald-400" />
          <span>
            {history.length} {t.history.recordsCount} (Max 100)
          </span>
        </div>

        <h1 className="font-heading font-serif text-3xl font-normal text-white sm:text-4xl">
          {t.history.title}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-400 sm:text-sm">
          {t.history.subtitle}
        </p>

        {history.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-950/20 px-3 py-1 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-900/40"
            >
              <Trash2 className="h-3 w-3" />
              <span>{t.history.clearAll}</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Empty State */}
      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex w-full max-w-md flex-col items-center rounded-2xl border border-white/[0.08] bg-[#0c1017]/80 p-8 text-center backdrop-blur-xl"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-500">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="font-heading mt-4 font-serif text-lg font-medium text-zinc-100">
            {t.history.emptyTitle}
          </h3>
          <p className="mt-1 text-xs text-zinc-400">{t.history.emptySubtitle}</p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#39977f] to-emerald-500 px-5 py-2.5 text-xs font-semibold text-black shadow-[0_0_20px_rgba(57,151,127,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            <span>{t.history.startNewReading}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      ) : (
        /* History Timeline List */
        <div className="w-full space-y-4">
          {history.map((record, index) => {
            const spread = SPREADS[record.spreadId] || SPREADS["three-timeline"];
            const isFallback = record.status === "fallback";

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(0.2, index * 0.05) }}
                onClick={() => handleOpenReadingInResult(record)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1017]/85 p-5 shadow-lg backdrop-blur-xl transition-all hover:scale-[1.01] hover:border-emerald-500/40 hover:bg-[#12161e]"
              >
                {/* Header row: Spread Name & Date & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-300">{spread.name}</span>
                    <span className="text-zinc-500">&bull;</span>
                    <span className="text-zinc-400">
                      {record.cards.length} {t.history.cardsCount}
                    </span>
                    {record.reversedEnabled && (
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">
                        Rev
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(record.createdAt)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(record.id, e)}
                      title={t.history.delete}
                      className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-rose-500/20 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question */}
                <p className="mt-3 font-serif text-sm font-medium text-zinc-100 italic group-hover:text-emerald-100 sm:text-base">
                  &ldquo;{record.question}&rdquo;
                </p>

                {/* Cards Mini Thumbnails */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  {record.cards.map((c, cIdx) => {
                    const cardData = getCardById(c.cardId);
                    return (
                      <div
                        key={cIdx}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-zinc-300"
                      >
                        <div className="relative h-6 w-4 overflow-hidden rounded">
                          {cardData && (
                            <Image
                              src={getCardImageUrl(cardData.id)}
                              alt={cardData.name}
                              fill
                              sizes="16px"
                              className={`object-cover ${
                                c.orientation === "reversed" ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </div>
                        <span className="text-[11px] font-medium">
                          {cardData?.name || c.cardId}
                        </span>
                        {c.orientation === "reversed" && (
                          <span className="font-mono text-[9px] text-amber-400">(Rev)</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Overview preview snippet */}
                {record.interpretation && (
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                    {record.interpretation.overview}
                  </p>
                )}

                {/* Card footer: status & Action */}
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {isFallback ? (
                      <span className="flex items-center gap-1 text-amber-400">
                        <ShieldAlert className="h-3 w-3" />
                        <span>{t.history.offlineFallback}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Sparkles className="h-3 w-3" />
                        <span>{t.history.aiGenerated}</span>
                      </span>
                    )}
                  </div>

                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-300 group-hover:translate-x-1 transition-transform">
                    <span>{t.history.viewFullReading}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
