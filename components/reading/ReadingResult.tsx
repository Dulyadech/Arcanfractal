"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Compass,
  Lightbulb,
  HelpCircle,
  ShieldAlert,
  Info,
  Layers,
  ArrowRight,
} from "lucide-react";
import { getReadingSession, resetReadingSession } from "@/lib/storage/reading-session";
import { saveReadingToHistory } from "@/lib/storage/history";
import { CrisisPanel } from "@/components/safety/CrisisPanel";
import { SPREADS } from "@/data/spreads";
import { getCardById } from "@/data/cards";
import { getCardImageUrl } from "@/lib/tarot/card-images";
import { useLanguage } from "@/lib/i18n/context";
import { CardDetailModal } from "./CardDetailModal";
import type { DrawnCard, TarotCard } from "@/types/tarot";
import type { AIInterpretationPayload, ContextualCardInterpretation } from "@/types/ai";
import type { ReadingStatus, ReadingRecord } from "@/types/reading";
import type { SpreadId } from "@/types/spread";

export function ReadingResult() {
  const router = useRouter();
  const { t } = useLanguage();

  const [question, setQuestion] = useState<string>("");
  const [spreadId, setSpreadId] = useState<SpreadId>("three-timeline");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState<AIInterpretationPayload | null>(null);
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>("complete");
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCardForModal, setActiveCardForModal] = useState<TarotCard | null>(null);
  const [activeModalOrientation, setActiveModalOrientation] = useState<"upright" | "reversed">(
    "upright"
  );
  const [activeModalPosition, setActiveModalPosition] = useState<string>("");

  useEffect(() => {
    const session = getReadingSession();
    if (!session || !session.question || !session.spreadId || !session.drawnCards) {
      router.replace("/read?step=spread");
      return;
    }
    if (!session.interpretation) {
      router.replace("/read?step=select");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestion(session.question);
    setSpreadId(session.spreadId as SpreadId);
    setDrawnCards(session.drawnCards);
    setInterpretation(session.interpretation);
    const resolvedStatus: ReadingStatus = session.readingStatus || "complete";
    if (session.readingStatus) {
      setReadingStatus(resolvedStatus);
    }

    // Auto-save ReadingRecord to Local Reading History (SDD §3, §8)
    if (session.drawId && session.analysis) {
      const record: ReadingRecord = {
        id: session.drawId,
        createdAt: session.updatedAt || new Date().toISOString(),
        question: session.question,
        spreadId: session.spreadId as SpreadId,
        reversedEnabled: session.reversedEnabled,
        cards: session.drawnCards,
        analysis: session.analysis,
        interpretation: session.interpretation,
        status: resolvedStatus,
      };
      saveReadingToHistory(record);
    }
  }, [router]);

  const currentSpread = SPREADS[spreadId] || SPREADS["three-timeline"];

  const handleOpenDetailModal = (drawnCard: DrawnCard) => {
    const cardData = getCardById(drawnCard.cardId);
    if (!cardData) return;

    const positionDef = currentSpread.positions[drawnCard.positionIndex];
    setActiveCardForModal(cardData);
    setActiveModalOrientation(drawnCard.orientation);
    setActiveModalPosition(positionDef ? positionDef.name : "");
  };

  const handleCopyText = async () => {
    if (!interpretation) return;

    const lines: string[] = [];
    lines.push(`✨ Tarot Tajai Reading ✨`);
    lines.push(`Question: ${question}`);
    lines.push(`Spread: ${currentSpread.name}`);
    lines.push(``);
    lines.push(`--- Drawn Cards ---`);
    drawnCards.forEach((c) => {
      const card = getCardById(c.cardId);
      const pos = currentSpread.positions[c.positionIndex];
      lines.push(
        `${c.positionIndex + 1}. ${pos ? pos.name : "Card"}: ${card ? card.name : c.cardId} (${c.orientation})`
      );
    });
    lines.push(``);
    lines.push(`--- Overview ---`);
    lines.push(interpretation.overview);
    lines.push(``);
    if (interpretation.cards && interpretation.cards.length > 0) {
      lines.push(`--- Card Meanings ---`);
      interpretation.cards.forEach((cm) => {
        const card = getCardById(cm.cardId);
        const cardTitle = cm.cardName || card?.name || cm.cardId;
        const posDef = currentSpread.positions.find((p) => p.key === cm.positionKey);
        const posTitle = posDef?.name || cm.positionKey;
        lines.push(`• ${cardTitle} (${posTitle}): ${cm.interpretation || cm.meaningInContext}`);
      });
      lines.push(``);
    }
    lines.push(`--- Holistic Synthesis ---`);
    lines.push(interpretation.synthesis);
    lines.push(``);
    lines.push(`--- Actionable Advice ---`);
    lines.push(interpretation.advice);
    lines.push(``);
    lines.push(`--- Reflective Question ---`);
    lines.push(interpretation.reflectionQuestion);
    lines.push(``);
    lines.push(`Generated by Tarot Tajai • ${new Date().toLocaleDateString()}`);

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleNewReading = () => {
    resetReadingSession();
    router.replace("/");
  };

  if (!interpretation) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-xs uppercase">Preparing reading synthesis...</p>
        </div>
      </div>
    );
  }

  const isFallback = readingStatus === "fallback" || interpretation.status === "fallback";

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-start pt-2 pb-24 sm:pt-6">
      {/* Top Header & Status Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 w-full text-center"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium backdrop-blur-md">
          {isFallback ? (
            <span className="flex items-center gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-300">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>{t.result.fallbackStatus}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>{t.result.aiStatus}</span>
            </span>
          )}
        </div>

        <h1 className="font-heading font-serif text-3xl font-normal text-white sm:text-4xl">
          {t.result.headline}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-zinc-400 sm:text-sm">
          {t.result.subtitle}
        </p>
      </motion.div>

      {/* AI Safety Handling: Crisis Support Panel or Sensitive Guidance Banner (SDD §3, §5.2) */}
      {interpretation.safety === "crisis" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 w-full"
        >
          <CrisisPanel reason="ai_safety" />
        </motion.div>
      )}

      {interpretation.safety === "sensitive" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex w-full items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="leading-relaxed">
            {t.result.disclaimer} • Please treat this interpretation as an empowering mirror for self-reflection rather than deterministic fate.
          </p>
        </motion.div>
      )}

      {/* Question Anchor Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8 w-full rounded-2xl border border-white/[0.08] bg-[#14181d]/85 p-5 shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 text-xs">
          <div className="flex items-center gap-2 font-semibold tracking-wider text-emerald-300 uppercase">
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t.spreads.focusedInquiry}</span>
          </div>
          <span className="text-zinc-400">{currentSpread.name}</span>
        </div>
        <p className="mt-3 font-serif text-base leading-relaxed text-zinc-100 italic sm:text-lg">
          &ldquo;{question}&rdquo;
        </p>
      </motion.div>

      {/* Drawn Cards Showcase Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-10 w-full"
      >
        <div className="mb-4 flex items-center justify-between px-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-medium tracking-wide text-zinc-200 uppercase">
              {t.result.cardsTitle}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">Tap card to inspect lore</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {drawnCards.map((drawnCard) => {
            const cardData = getCardById(drawnCard.cardId);
            const pos = currentSpread.positions[drawnCard.positionIndex];
            if (!cardData) return null;

            return (
              <div
                key={drawnCard.positionIndex}
                onClick={() => handleOpenDetailModal(drawnCard)}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1017]/80 p-3.5 shadow-lg backdrop-blur-md transition-all hover:scale-[1.02] hover:border-emerald-400/50 hover:bg-[#14181d]"
              >
                {/* Position Title & Index Badge */}
                <div className="mb-2.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#39977f]/20 font-mono text-[9px] font-bold text-[#b4dac3]">
                      {drawnCard.positionIndex + 1}
                    </span>
                    <span>{pos ? pos.name : `Card #${drawnCard.positionIndex + 1}`}</span>
                  </span>

                  {drawnCard.orientation === "reversed" ? (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                      Reversed
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      Upright
                    </span>
                  )}
                </div>

                {/* Card Artwork Face */}
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/10 bg-[#14181d]">
                  <Image
                    src={getCardImageUrl(cardData.id)}
                    alt={cardData.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className={`object-cover transition-transform group-hover:scale-105 ${
                      drawnCard.orientation === "reversed" ? "rotate-180" : ""
                    }`}
                    unoptimized
                  />
                </div>

                {/* Card Name & Lore Prompt */}
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-serif text-sm font-medium text-zinc-100 group-hover:text-emerald-200">
                      {cardData.name}
                    </h3>
                    <span className="text-[10px] text-zinc-500 capitalize">
                      {cardData.arcana} Arcana
                    </span>
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-zinc-400 group-hover:border-emerald-400 group-hover:text-emerald-300">
                    <Info className="h-3 w-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Main Narrative Synthesis & Meaning Sections */}
      <div className="w-full space-y-6">
        {/* 1. Overview */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-white/[0.08] bg-[#0c1017]/90 p-5 shadow-xl backdrop-blur-xl sm:p-7"
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider text-emerald-300 uppercase">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <span>{t.result.overview}</span>
          </div>
          <p className="mt-3 font-serif text-sm leading-relaxed text-zinc-100 sm:text-base">
            {interpretation.overview}
          </p>
        </motion.div>

        {/* 2. Card-by-Card Tailored Meanings */}
        {interpretation.cards && interpretation.cards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="rounded-2xl border border-white/[0.08] bg-[#0c1017]/90 p-5 shadow-xl backdrop-blur-xl sm:p-7"
          >
            <div className="mb-4 flex items-center gap-2.5 text-xs font-semibold tracking-wider text-emerald-300 uppercase">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>Card-by-Card Context</span>
            </div>

            <div className="space-y-4 divide-y divide-white/[0.05]">
              {interpretation.cards.map((cm: ContextualCardInterpretation, idx: number) => {
                const card = getCardById(cm.cardId);
                const cardTitle = cm.cardName || card?.name || cm.cardId;
                const posDef = currentSpread.positions.find((p) => p.key === cm.positionKey);
                const posTitle = posDef?.name || cm.positionKey;
                return (
                  <div key={cm.cardId || idx} className={idx > 0 ? "pt-4" : ""}>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-serif text-sm font-semibold text-emerald-200">
                        {cardTitle}
                      </span>
                      <span className="text-xs text-zinc-400">({posTitle})</span>
                      {cm.orientation === "reversed" && (
                        <span className="py-0.2 rounded bg-amber-500/20 px-1.5 text-[10px] text-amber-300">
                          Reversed
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-300 sm:text-sm">
                      {cm.interpretation || cm.meaningInContext}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 3. Holistic Synthesis */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl border border-white/[0.08] bg-[#0c1017]/90 p-5 shadow-xl backdrop-blur-xl sm:p-7"
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider text-emerald-300 uppercase">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>{t.result.synthesis}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-300 sm:text-sm">
            {interpretation.synthesis}
          </p>
        </motion.div>

        {/* 4. Actionable Advice & Guidance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-xl backdrop-blur-xl sm:p-7"
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider text-emerald-300 uppercase">
            <Lightbulb className="h-4 w-4 text-emerald-400" />
            <span>{t.result.advice}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-emerald-100/90 sm:text-sm">
            {interpretation.advice}
          </p>
        </motion.div>

        {/* 5. Reflective Question for Contemplation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-2xl border border-white/[0.08] bg-[#0c1017]/90 p-5 shadow-xl backdrop-blur-xl sm:p-7"
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider text-emerald-300 uppercase">
            <HelpCircle className="h-4 w-4 text-emerald-400" />
            <span>{t.result.reflection}</span>
          </div>
          <p className="mt-3 font-serif text-sm leading-relaxed text-zinc-100 italic sm:text-base">
            &ldquo;{interpretation.reflectionQuestion}&rdquo;
          </p>
        </motion.div>
      </div>

      {/* Action Bar: Copy as Text & New Reading (Thumb Zone Ergonomics) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="thumb-zone mt-10 flex w-full flex-col gap-3 sm:static sm:flex-row sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
      >
        {/* Copy as Text Button */}
        <button
          type="button"
          onClick={handleCopyText}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] py-3 text-xs font-medium text-zinc-200 backdrop-blur-md transition-all hover:border-emerald-400 hover:bg-white/10 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-emerald-300">{t.result.copied}</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-zinc-400" />
              <span>{t.result.copyBtn}</span>
            </>
          )}
        </button>

        {/* Begin New Reading Button */}
        <button
          type="button"
          onClick={handleNewReading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#39977f] to-emerald-500 py-3 text-xs font-semibold text-black shadow-[0_0_25px_rgba(57,151,127,0.4)] transition-all hover:scale-[1.01] active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{t.result.newReadingBtn}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </motion.div>

      {/* Disclaimer */}
      <div className="mt-8 text-center text-[11px] leading-relaxed text-zinc-500">
        <p>{t.result.disclaimer}</p>
      </div>

      {/* Card Detail Modal */}
      <CardDetailModal
        card={activeCardForModal}
        orientation={activeModalOrientation}
        positionName={activeModalPosition}
        isOpen={Boolean(activeCardForModal)}
        onClose={() => setActiveCardForModal(null)}
      />
    </div>
  );
}
