"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Layers,
  Info,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  getReadingSession,
  saveDrawnCards,
  saveInterpretation,
} from "@/lib/storage/reading-session";
import { SPREADS } from "@/data/spreads";
import { getCardById } from "@/data/cards";
import { getCardImageUrl, getCardBackImageUrl } from "@/lib/tarot/card-images";
import { useLanguage } from "@/lib/i18n/context";
import { CardDetailModal } from "./CardDetailModal";
import type { DrawnCard, ShuffledCard, TarotCard } from "@/types/tarot";
import type { SpreadId, SpreadPosition } from "@/types/spread";
import type { AIInterpretationPayload } from "@/types/ai";

export function CardSelection() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const [question, setQuestion] = useState<string>("");
  const [spreadId, setSpreadId] = useState<SpreadId>("three-timeline");
  const [deck, setDeck] = useState<ShuffledCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<DrawnCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [activeCardForModal, setActiveCardForModal] = useState<TarotCard | null>(null);
  const [activeModalOrientation, setActiveModalOrientation] = useState<"upright" | "reversed">(
    "upright"
  );
  const [activeModalPosition, setActiveModalPosition] = useState<string>("");
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);
  const [interpretError, setInterpretError] = useState<string | null>(null);
  const [interpretErrorCode, setInterpretErrorCode] = useState<string | null>(null);

  // New state: Tracks how many cards have been revealed progressively (0, 1, 2, ...).
  // Starts at 0: all picked cards remain face-down until user clicks Begin Reading.
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [isRevealingSequence, setIsRevealingSequence] = useState<boolean>(false);

  const hasTriggeredInterpretRef = useRef(false);

  // Restore and initialize session
  useEffect(() => {
    const session = getReadingSession();
    if (!session || !session.question || !session.spreadId || !session.deck || !session.drawId) {
      router.replace("/read?step=shuffle");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestion(session.question);
    setSpreadId(session.spreadId as SpreadId);
    setDeck(session.deck);

    if (session.drawnCards && session.drawnCards.length > 0) {
      setSelectedCards(session.drawnCards);
    }
    if (session.selectedIndices && session.selectedIndices.length > 0) {
      setSelectedIndices(session.selectedIndices);
    }
  }, [router]);

  const currentSpread = SPREADS[spreadId] || SPREADS["three-timeline"];
  const targetCount = currentSpread.cardCount;
  const isSelectionComplete = selectedCards.length === targetCount;

  // Trigger POST /api/interpret when all cards are selected (SDD §2 step 5, §9.2)
  const triggerInterpretation = useCallback(
    async (finalDrawnCards: DrawnCard[]) => {
      if (hasTriggeredInterpretRef.current) return;
      hasTriggeredInterpretRef.current = true;

      setIsInterpreting(true);
      setInterpretError(null);
      setInterpretErrorCode(null);

      const session = getReadingSession();
      if (!session) return;

      try {
        const response = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            drawId: session.drawId || `draw-${Date.now()}`,
            question: session.question,
            spreadId: session.spreadId,
            cards: finalDrawnCards,
            analysis: session.analysis,
            locale: locale || "en",
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          setInterpretErrorCode(errData.code || null);
          throw new Error(errData.error || "Failed to interpret reading. Please try again.");
        }

        const data: AIInterpretationPayload = await response.json();

        // Determine if interpretation was AI-generated or fallback
        const status = data.status === "fallback" ? "fallback" : "complete";

        saveInterpretation(data, status);
        router.push("/read?step=result");
      } catch (err) {
        console.error("Interpret error:", err);
        setInterpretError((err as Error).message || "Interpretation service failed.");
        setIsInterpreting(false);
        hasTriggeredInterpretRef.current = false;
      }
    },
    [locale, router]
  );

  // Sequential Progressive Revelation: Flip card 1, then card 2, then card 3, then proceed to result
  const handleStartRevealAndInterpret = async () => {
    if (!isSelectionComplete || isRevealingSequence || isInterpreting) return;
    setIsRevealingSequence(true);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Progressively reveal cards one by one (1, 2, 3...) with dramatic flip timing
    for (let i = 1; i <= selectedCards.length; i++) {
      setRevealedCount(i);
      await delay(900); // 900ms per card reveal
    }

    // Brief pause to admire the fully revealed spread, then proceed to interpretation
    await delay(600);
    saveDrawnCards(selectedCards, selectedIndices, true);
    triggerInterpretation(selectedCards);
  };

  // Handle User selecting a card from the 78-card deck (True Index Selection)
  const handleSelectDeckCard = (deckIndex: number) => {
    if (selectedCards.length >= targetCount) return;
    if (selectedIndices.includes(deckIndex)) return; // No Re-pick (SDD §4.2)

    const chosenCard = deck[deckIndex];
    if (!chosenCard) return;

    const nextPositionIndex = selectedCards.length;
    const positionDef = currentSpread.positions[nextPositionIndex];

    const newDrawnCard: DrawnCard = {
      positionIndex: nextPositionIndex,
      positionKey: positionDef ? positionDef.key : `pos-${nextPositionIndex}`,
      cardId: chosenCard.cardId,
      orientation: chosenCard.orientation,
    };

    const nextSelectedCards = [...selectedCards, newDrawnCard];
    const nextSelectedIndices = [...selectedIndices, deckIndex];

    setSelectedCards(nextSelectedCards);
    setSelectedIndices(nextSelectedIndices);

    // Keep session in SELECTING state until cards are revealed and interpretation is started
    saveDrawnCards(nextSelectedCards, nextSelectedIndices, false);
  };

  const handleOpenDetailModal = (drawnCard: DrawnCard) => {
    const cardData = getCardById(drawnCard.cardId);
    if (!cardData) return;

    const positionDef = currentSpread.positions[drawnCard.positionIndex];
    setActiveCardForModal(cardData);
    setActiveModalOrientation(drawnCard.orientation);
    setActiveModalPosition(positionDef ? positionDef.name : "");
  };

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-start pt-2 pb-24 sm:pt-6">
      {/* Question Intention Anchor Card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 w-full rounded-2xl border border-white/[0.08] bg-[#14181d]/80 p-4 shadow-lg backdrop-blur-xl sm:p-5"
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-300 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t.spreads.focusedInquiry}</span>
          </div>
          <span className="text-[11px] font-medium text-zinc-400">{currentSpread.name}</span>
        </div>
        <p className="mt-3 font-serif text-sm leading-relaxed text-zinc-100 italic sm:text-base">
          &ldquo;{question}&rdquo;
        </p>
      </motion.div>

      {/* Header & Selection Progress Counter */}
      <div className="mb-6 flex w-full flex-col items-center text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium tracking-wide text-emerald-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
          <span>{t.select.stepBadge}</span>
        </div>

        <h1 className="font-heading font-serif text-2xl font-normal text-white sm:text-3xl">
          {t.select.headline}
        </h1>
        <p className="mt-1 max-w-md text-xs text-zinc-400 sm:text-sm">{t.select.subtitle}</p>

        {/* Progress Tracker Pill */}
        <div className="mt-4 flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs">
          <span className="font-medium text-zinc-300">
            {t.select.selectedCount}:{" "}
            <strong className="text-emerald-400">
              {selectedCards.length} / {targetCount}
            </strong>
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: targetCount }).map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${
                  i < selectedCards.length
                    ? "bg-emerald-400 shadow-[0_0_6px_#10b981]"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Top Active Spread Slots (Target Placement) */}
      <div className="mb-10 w-full">
        <div className="flex flex-wrap items-stretch justify-center gap-4 sm:gap-6">
          {currentSpread.positions.map((pos: SpreadPosition, index: number) => {
            const drawnCard = selectedCards[index];
            const cardData = drawnCard ? getCardById(drawnCard.cardId) : null;
            const isChosen = Boolean(drawnCard && cardData);
            // Card is revealed only if sequential revealing has reached or passed this index
            const isRevealed = isChosen && index < revealedCount;

            return (
              <div key={pos.key} className="flex flex-col items-center justify-between">
                {/* Position Title & Index Badge */}
                <div className="mb-2 flex items-center gap-1.5 text-center">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#39977f]/20 font-mono text-[9px] font-bold text-[#b4dac3]">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium text-zinc-300">{pos.name}</span>
                </div>

                {/* Card Container with 3D Flip */}
                <div
                  className="relative aspect-[2/3] w-28 overflow-hidden rounded-xl border sm:w-36 md:w-40"
                  style={{
                    perspective: "1000px",
                  }}
                >
                  {isChosen && cardData && drawnCard ? (
                    <div
                      className="group relative h-full w-full cursor-pointer rounded-xl [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{
                        transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                      onClick={() => isRevealed && handleOpenDetailModal(drawnCard)}
                      title={
                        isRevealed
                          ? `${cardData.name} (${drawnCard.orientation}) — ${t.select.detailPrompt}`
                          : `Card #${index + 1} Selected`
                      }
                    >
                      {/* Face-Down Back of Card (Shown when rotateY is 0) */}
                      <div className="absolute inset-0 h-full w-full overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-b from-[#1d1640] via-[#0e1320] to-[#070b0e] shadow-[0_8px_20px_rgba(0,0,0,0.6)] [backface-visibility:hidden]">
                        <Image
                          src={getCardBackImageUrl()}
                          alt="Card Face Down"
                          fill
                          sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
                          className="object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-emerald-500/10" />
                        <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/80 text-[10px] font-bold text-black shadow">
                          ✓
                        </div>
                      </div>

                      {/* Face-Up Front of Card (Shown when rotateY is 180) */}
                      <div
                        className={`absolute inset-0 h-full w-full overflow-hidden rounded-xl border border-[#39977f]/50 bg-[#14181d] shadow-[0_10px_25px_rgba(0,0,0,0.7)] [backface-visibility:hidden] hover:border-emerald-400 [transform:rotateY(180deg)] ${
                          drawnCard.orientation === "reversed" ? "rotate-180" : ""
                        }`}
                      >
                        <Image
                          src={getCardImageUrl(cardData.id)}
                          alt={cardData.name}
                          fill
                          sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
                          className="object-cover"
                        />

                        {/* Information Pill overlay */}
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/60 py-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                          <span className="flex items-center gap-1 text-[10px] text-zinc-200">
                            <Info className="h-3 w-3" />
                            <span>{t.result.viewCardDetails}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Empty Slot Waiting for Selection */
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] p-2 text-center transition-colors">
                      <Layers className="h-5 w-5 text-zinc-600 sm:h-6 sm:w-6" />
                      <span className="mt-2 text-[10px] text-zinc-500 sm:text-xs">
                        {index === selectedCards.length ? "Pick Next Card" : `Card #${index + 1}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Subtext below slot */}
                <div className="mt-2 min-h-[20px] text-center">
                  {isChosen && isRevealed && cardData && drawnCard ? (
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[11px] font-medium text-emerald-300">
                        {cardData.name}
                      </span>
                      {drawnCard.orientation === "reversed" && (
                        <span className="py-0.2 rounded bg-amber-500/20 px-1 font-mono text-[9px] text-amber-300">
                          Rev
                        </span>
                      )}
                    </div>
                  ) : isChosen && !isRevealed ? (
                    <span className="text-[10px] font-medium text-emerald-400">
                      Card #{index + 1} Selected
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 italic">{pos.description}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Interpretation CTA Trigger */}
      {isSelectionComplete && !isInterpreting && !isRevealingSequence && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 flex w-full max-w-md flex-col items-center text-center"
        >
          <button
            type="button"
            onClick={handleStartRevealAndInterpret}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#22c55e] via-[#39977f] to-[#10b981] px-8 py-4 text-base font-semibold text-black shadow-[0_0_35px_rgba(34,197,94,0.45)] transition-all hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(34,197,94,0.65)] active:scale-[0.98]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            <Sparkles className="h-5 w-5 text-black" />
            <span className="tracking-wide">เริ่มเปิดไพ่ &amp; ทำนาย</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="mt-2.5 text-xs text-zinc-400">
            เลือกไพ่ครบแล้ว คลิกเพื่อเปิดไพ่ทีละใบและเริ่มการสังเคราะห์คำทำนาย
          </p>
        </motion.div>
      )}

      {/* Sequential Revealing Animation Indicator */}
      {isRevealingSequence && !isInterpreting && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center rounded-2xl border border-emerald-500/30 bg-[#0c1017]/90 px-6 py-4 text-center shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-emerald-300 font-medium text-sm">
            <Sparkles className="h-4 w-4 animate-spin text-emerald-400" />
            <span>กำลังเปิดไพ่ใบที่ {Math.min(revealedCount > 0 ? revealedCount : 1, targetCount)} / {targetCount}...</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">รวบรวมพลังงานและเปิดเผยข้อความแห่งโชคชะตา</p>
        </motion.div>
      )}

      {/* Luminous Interpreting / Synthesis Loading State */}
      {isInterpreting && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 flex w-full max-w-lg flex-col items-center rounded-2xl border border-emerald-500/30 bg-[#0c1017]/95 p-6 text-center shadow-[0_0_40px_rgba(57,151,127,0.25)] backdrop-blur-xl"
        >
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_#10b981]">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
          </div>
          <h3 className="font-heading mt-4 font-serif text-lg font-normal text-white">
            {t.select.interpretingTitle}
          </h3>
          <p className="mt-1.5 text-xs text-zinc-400">{t.select.interpretingSubtitle}</p>
        </motion.div>
      )}

      {/* Error state if interpretation failed */}
      {interpretError && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{interpretError}</span>
          </div>

          <div className="flex items-center gap-2">
            {interpretErrorCode === "DRAW_SESSION_NOT_FOUND" ? (
              <button
                type="button"
                onClick={() => router.push("/read?step=shuffle")}
                className="rounded-full bg-emerald-500 px-3.5 py-1 text-xs font-semibold text-black hover:bg-emerald-400 active:scale-95"
              >
                Re-shuffle Deck
              </button>
            ) : (
              <button
                type="button"
                onClick={() => triggerInterpretation(selectedCards)}
                className="rounded-full bg-rose-500 px-3.5 py-1 text-xs font-semibold text-black hover:bg-rose-400 active:scale-95"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Section: 78-Card Shuffled Deck (True Index Selection) */}
      {!isSelectionComplete && (
        <div className="w-full">
          {/* Deck Prompt Header */}
          <div className="mb-3 flex items-center justify-between px-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <ChevronDown className="h-4 w-4 text-emerald-400" />
              <span>{t.select.tapDeckPrompt}</span>
            </div>
            <span className="font-mono text-[11px] text-zinc-500">
              78-Card Deck ({78 - selectedIndices.length} available)
            </span>
          </div>

          {/* Elegant Multi-Row Fanned Deck Grid (No horizontal scrolling) */}
          <div className="relative w-full rounded-2xl border border-white/[0.08] bg-[#0c1017]/85 p-3 shadow-2xl backdrop-blur-xl sm:p-5">
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9 sm:gap-2 md:grid-cols-11 md:gap-2 lg:grid-cols-13">
              {deck.map((_, index) => {
                const isSelected = selectedIndices.includes(index);

                return (
                  <motion.button
                    key={index}
                    type="button"
                    disabled={isSelected || isInterpreting}
                    onClick={() => handleSelectDeckCard(index)}
                    whileHover={!isSelected && !isInterpreting ? { y: -8, scale: 1.08, zIndex: 10 } : {}}
                    whileTap={!isSelected && !isInterpreting ? { scale: 0.95 } : {}}
                    className={`group relative aspect-[2/3] w-full overflow-hidden rounded-md border text-left transition-all ${
                      isSelected
                        ? "cursor-not-allowed border-white/5 opacity-20 grayscale"
                        : "cursor-pointer border-[#39977f]/40 bg-gradient-to-b from-[#1d1640] via-[#0e1320] to-[#070b0e] shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:border-emerald-400 hover:shadow-[0_0_16px_rgba(57,151,127,0.5)]"
                    }`}
                    aria-label={`Draw card #${index + 1}`}
                  >
                    {/* Mystical Card Back Image */}
                    <Image
                      src={getCardBackImageUrl()}
                      alt="Tarot Card Back"
                      fill
                      sizes="(max-width: 640px) 16vw, (max-width: 1024px) 10vw, 8vw"
                      className="object-cover"
                    />

                    {/* Selected checkmark indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      </div>
                    )}

                    {/* Card Number Index */}
                    <div className="absolute top-0.5 left-0.5 rounded bg-black/60 px-1 py-0.2 font-mono text-[7px] text-zinc-400 sm:text-[8px]">
                      {index + 1}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Card Detail Dialog Modal */}
      <CardDetailModal
        card={activeCardForModal}
        orientation={activeModalOrientation}
        positionName={activeModalPosition}
        isOpen={Boolean(activeCardForModal)}
        onClose={() => setActiveCardForModal(null)}
      />

      {/* Sacred Invariant Note */}
      <div className="mt-8 flex items-center gap-2 text-xs text-zinc-500">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <span>True Index Selection &bull; 100% Client Picked &bull; Zero Predetermined Slots</span>
      </div>
    </div>
  );
}
