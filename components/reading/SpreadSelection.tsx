"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpreadId } from "@/types/spread";
import { SPREAD_LIST, SPREADS } from "@/data/spreads";
import { getReadingSession, saveSpreadSelection } from "@/lib/storage/reading-session";
import { useLanguage } from "@/lib/i18n/context";
import { getSpreadRecommendation } from "@/lib/tarot/spread-recommendation";

export function SpreadSelection() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { t, locale } = useLanguage();

  const [question, setQuestion] = useState<string>("");
  const [selectedSpreadId, setSelectedSpreadId] = useState<SpreadId>("three-timeline");
  const [reversedEnabled, setReversedEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from sessionStorage or redirect to landing if no question
  useEffect(() => {
    const session = getReadingSession();
    if (!session || !session.question || session.question.trim().length < 5) {
      router.replace("/");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestion(session.question);
    if (session.spreadId && session.spreadId in SPREADS) {
      setSelectedSpreadId(session.spreadId);
    } else {
      // Auto-default to the intelligent recommendation
      const rec = getSpreadRecommendation(session.question, locale);
      setSelectedSpreadId(rec.spreadId);
    }
    if (typeof session.reversedEnabled === "boolean") {
      setReversedEnabled(session.reversedEnabled);
    }
    setIsLoading(false);
  }, [router, locale]);

  const recommendation = getSpreadRecommendation(question, locale);
  const selectedSpread = SPREADS[selectedSpreadId];

  const handleBegin = () => {
    saveSpreadSelection(selectedSpreadId, reversedEnabled);
    startTransition(() => {
      router.push("/read?step=shuffle");
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-xs tracking-wider uppercase">Loading sacred spreads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-start pt-2 pb-20 sm:pt-6">
      {/* Question Intention Anchor Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 w-full rounded-2xl border border-white/[0.08] bg-[#14181d]/80 p-4 shadow-xl backdrop-blur-xl sm:p-5"
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-300 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t.spreads.focusedInquiry}</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-[11px] text-zinc-400 transition-colors hover:text-emerald-300"
          >
            <span>{t.spreads.editQuestion}</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <p className="mt-3 font-serif text-sm leading-relaxed text-zinc-100 italic sm:text-base">
          &ldquo;{question}&rdquo;
        </p>
      </motion.div>

      {/* Intelligent Question-to-Spread Recommendation Banner */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-8 w-full rounded-2xl border border-emerald-500/35 bg-gradient-to-r from-emerald-500/15 via-[#14181d]/90 to-teal-500/10 p-4 shadow-[0_10px_30px_rgba(57,151,127,0.15)] backdrop-blur-xl sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="text-xs font-semibold tracking-wider text-emerald-300 uppercase">
              {locale === "en" ? "Intelligent Spread Match" : "ระบบแนะนำผังไพ่สำหรับคำถามของคุณ"}
            </span>
          </div>
          <span className="rounded-full border border-emerald-400/35 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
            {recommendation.badgeText}
          </span>
        </div>

        <p className="mt-2.5 text-xs leading-relaxed text-zinc-200 sm:text-sm">
          {recommendation.reason}
        </p>

        {/* Theme Pills & Direct Switch Button */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-1">
          {recommendation.keyThemes.map((theme, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-zinc-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {theme}
            </span>
          ))}

          {selectedSpreadId !== recommendation.spreadId && (
            <button
              type="button"
              onClick={() => setSelectedSpreadId(recommendation.spreadId)}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 underline underline-offset-4 transition-colors hover:text-emerald-200"
            >
              <span>
                {locale === "en"
                  ? `Select Recommended (${recommendation.spreadName})`
                  : `เลือกตามที่แนะนำ (${recommendation.spreadName})`}
              </span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full pb-6 text-center"
      >
        {/* Step Badge */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium tracking-wide text-emerald-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
          <span>{t.spreads.stepBadge}</span>
        </div>
        <h1 className="font-heading font-serif text-2xl font-normal text-white sm:text-4xl">
          {t.spreads.headline}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-xs text-zinc-400 sm:text-sm">
          {t.spreads.subtitle}
        </p>
      </motion.div>

      {/* Spreads Grid (1, 3, 5 cards) */}
      <div className="grid w-full gap-4 sm:grid-cols-2">
        {SPREAD_LIST.map((spread, idx) => {
          const isSelected = selectedSpreadId === spread.id;
          const isRecommended = spread.id === recommendation.spreadId;

          return (
            <motion.div
              key={spread.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.05 }}
              onClick={() => setSelectedSpreadId(spread.id)}
              className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all sm:p-5 ${
                isSelected
                  ? "border-[#39977f] bg-gradient-to-b from-[#39977f]/15 via-[#14181d]/90 to-[#14181d] shadow-[0_10px_30px_rgba(57,151,127,0.25)]"
                  : "border-white/[0.08] bg-[#14181d]/60 hover:border-white/[0.2] hover:bg-[#14181d]/80"
              }`}
            >
              <div>
                {/* Top Badge & Radio */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        isSelected
                          ? "bg-[#39977f] font-semibold text-black"
                          : "bg-white/[0.06] text-zinc-400"
                      }`}
                    >
                      <Layers className="h-3 w-3" />
                      <span>
                        {spread.cardCount} {spread.cardCount === 1 ? "Card" : "Cards"}
                      </span>
                    </span>

                    {/* AI Recommendation Glow Tag */}
                    {isRecommended && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 shadow-[0_0_10px_rgba(57,151,127,0.3)]">
                        <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
                        <span>{locale === "en" ? "Recommended" : "แนะนำ"}</span>
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? "border-[#39977f] bg-[#39977f] text-black"
                        : "border-white/20 bg-transparent"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Spread Name */}
                <h3 className="font-heading mt-3 font-serif text-lg font-medium text-zinc-100 transition-colors group-hover:text-emerald-200">
                  {spread.name}
                </h3>

                {/* Description */}
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">{spread.description}</p>
              </div>

              {/* Miniature Layout Diagram */}
              <div className="mt-4 border-t border-white/[0.05] pt-3">
                <div className="flex items-center justify-start gap-1.5">
                  {spread.positions.map((pos) => (
                    <div
                      key={pos.key}
                      className={`flex h-8 w-6 items-center justify-center rounded border font-mono text-[9px] transition-colors ${
                        isSelected
                          ? "border-[#39977f]/60 bg-[#39977f]/20 text-emerald-200"
                          : "border-white/10 bg-white/[0.02] text-zinc-500"
                      }`}
                      title={`${pos.name}: ${pos.description}`}
                    >
                      {pos.index + 1}
                    </div>
                  ))}
                  <span className="ml-2 text-[10px] text-zinc-500">
                    {spread.positions.map((p) => p.name).join(" · ")}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Spread Position Meanings Inspector (SDD §4.5) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSpread.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mt-6 w-full rounded-2xl border border-white/[0.08] bg-[#14181d]/80 p-4 shadow-lg backdrop-blur-xl sm:p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-400" />
            <h4 className="font-heading font-serif text-sm font-semibold tracking-wide text-zinc-200">
              {t.spreads.positionMeanings} &bull; {selectedSpread.name}
            </h4>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {selectedSpread.positions.map((pos) => (
              <div
                key={pos.key}
                className="rounded-xl border border-white/[0.05] bg-black/25 p-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#39977f]/20 font-mono text-[10px] font-bold text-[#b4dac3]">
                    {pos.index + 1}
                  </span>
                  <span className="font-medium text-zinc-200">{pos.name}</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
                  {pos.description}
                </p>
              </div>
            ))}
          </div>

          {selectedSpread.relationshipSummary && (
            <p className="mt-3 border-t border-white/[0.05] pt-2 text-[11px] text-emerald-300/80 italic">
              <strong>{t.spreads.dynamicFlow}:</strong> {selectedSpread.relationshipSummary}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Reversed Cards Toggle Switch (SDD §3 "Reversed Cards", Q-002) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-6 w-full rounded-2xl border border-white/[0.08] bg-[#14181d]/80 p-4 shadow-lg backdrop-blur-xl sm:p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="reversed-toggle"
                  className="font-heading cursor-pointer font-serif text-sm font-semibold tracking-wide text-zinc-100"
                >
                  {t.spreads.reversedLabel}
                </label>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    reversedEnabled
                      ? "border border-[#39977f]/40 bg-[#39977f]/20 text-emerald-300"
                      : "bg-white/[0.06] text-zinc-400"
                  }`}
                >
                  {reversedEnabled ? t.spreads.reversedActive : t.spreads.reversedOff}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">{t.spreads.reversedDesc}</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            id="reversed-toggle"
            type="button"
            role="switch"
            aria-checked={reversedEnabled}
            onClick={() => setReversedEnabled((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              reversedEnabled ? "bg-[#39977f]" : "bg-white/15"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                reversedEnabled ? "translate-x-5 bg-black" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Begin Button & Thumb Zone Action */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="thumb-zone mt-8 w-full sm:static sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
      >
        <button
          type="button"
          onClick={handleBegin}
          disabled={isPending}
          className="thumb-btn group cursor-pointer bg-gradient-to-r from-[#39977f] via-emerald-500 to-teal-400 font-semibold text-black shadow-[0_0_30px_rgba(57,151,127,0.45)] transition-all hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(57,151,127,0.6)] active:scale-[0.99]"
        >
          <span>
            {isPending ? t.spreads.preparing : `${t.spreads.beginBtn} (${selectedSpread.name})`}
          </span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  );
}
