"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FastForward,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { getReadingSession, saveDrawResult } from "@/lib/storage/reading-session";
import { SPREADS } from "@/data/spreads";
import { useLanguage } from "@/lib/i18n/context";
import type { DrawApiResponse } from "@/types/api";

type RitualPhase = "breathe" | "shuffle" | "ready" | "error";

export function BreatheShuffle() {
  const router = useRouter();
  const { t } = useLanguage();

  const [phase, setPhase] = useState<RitualPhase>("breathe");
  const [breatheStage, setBreatheStage] = useState<"inhale" | "exhale">("inhale");
  const [shuffleProgress, setShuffleProgress] = useState<number>(0);
  const [question, setQuestion] = useState<string>("");
  const [spreadName, setSpreadName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiReady, setIsApiReady] = useState<boolean>(false);

  // References to track API response and skip requests across timeouts
  const apiResultRef = useRef<DrawApiResponse | null>(null);
  const isSkippedRef = useRef<boolean>(false);
  const isNavigatingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const navigateToSelection = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    router.push("/read?step=select");
  }, [router]);

  // Execute POST /api/draw (SDD §4.2, §6.2 row 3, §9.1)
  const triggerDrawApi = useCallback(async () => {
    const session = getReadingSession();
    if (!session || !session.question || !session.spreadId) {
      router.replace("/");
      return;
    }

    setErrorMessage(null);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadId: session.spreadId,
          reversedEnabled: session.reversedEnabled,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate shuffled deck.");
      }

      const data: DrawApiResponse = await response.json();
      console.log(data);

      apiResultRef.current = data;
      setIsApiReady(true);

      // Persist shuffled deck and initial analysis in sessionStorage (SDD §7)
      saveDrawResult(data.drawId, data.deck, data.analysis);

      // If user clicked skip while API was pending, navigate immediately
      if (isSkippedRef.current) {
        navigateToSelection();
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("Draw API error:", err);
      setErrorMessage((err as Error).message || "An unexpected error occurred.");
      setPhase("error");
    }
  }, [router, navigateToSelection]);

  // Initial mount: validate session and kick off API & animations
  useEffect(() => {
    const session = getReadingSession();
    if (!session || !session.question || session.question.trim().length < 5) {
      router.replace("/");
      return;
    }
    if (!session.spreadId || !(session.spreadId in SPREADS)) {
      router.replace("/read?step=spread");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestion(session.question);
    setSpreadName(SPREADS[session.spreadId].name);

    // Call POST /api/draw concurrently with the ritual
    triggerDrawApi();

    // 1. Breathe Phase (~1.5s total: 750ms Inhale + 750ms Exhale)
    const exhaleTimer = setTimeout(() => {
      setBreatheStage("exhale");
    }, 750);

    const shufflePhaseTimer = setTimeout(() => {
      setPhase("shuffle");
    }, 1500);

    return () => {
      clearTimeout(exhaleTimer);
      clearTimeout(shufflePhaseTimer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [router, triggerDrawApi]);

  // 2. Shuffle Progress Animation Loop (~2.4s)
  useEffect(() => {
    if (phase !== "shuffle") return;

    const startTime = Date.now();
    const duration = 2400; // 2.4 seconds for shuffle animation

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setShuffleProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setPhase("ready");

        // If API is already resolved, wait a brief 400ms for smooth transition then navigate
        setTimeout(() => {
          if (apiResultRef.current) {
            navigateToSelection();
          }
        }, 400);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [phase, navigateToSelection]);

  // Watch for API completion if ready phase was reached before API finished
  useEffect(() => {
    if (phase === "ready" && apiResultRef.current) {
      const timer = setTimeout(() => {
        navigateToSelection();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, navigateToSelection]);

  // Handle User Skip Action
  const handleSkip = () => {
    isSkippedRef.current = true;
    if (apiResultRef.current) {
      navigateToSelection();
    } else {
      // Show loading transition state while API completes
      setPhase("ready");
    }
  };

  const handleRetry = () => {
    setPhase("breathe");
    setBreatheStage("inhale");
    setShuffleProgress(0);
    isSkippedRef.current = false;
    setIsApiReady(false);
    triggerDrawApi();
  };

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center pt-2 pb-16 sm:pt-6">
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
          <span className="text-[11px] font-medium text-zinc-400">{spreadName}</span>
        </div>
        <p className="mt-3 font-serif text-sm leading-relaxed text-zinc-100 italic sm:text-base">
          &ldquo;{question}&rdquo;
        </p>
      </motion.div>

      {/* Top Controls: Step Badge + Skip Button */}
      <div className="mb-6 flex w-full items-center justify-between px-1">
        {/* Step Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium tracking-wide text-emerald-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
          <span>{t.shuffle.stepBadge}</span>
        </div>

        {/* Skip Button */}
        {phase !== "error" && (
          <button
            type="button"
            onClick={handleSkip}
            className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1 text-xs font-medium text-zinc-300 backdrop-blur-md transition-all hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-300 active:scale-95"
            aria-label="Skip shuffle animation"
          >
            <span>{t.shuffle.skipBtn}</span>
            <FastForward className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Central Interactive Animation Stage */}
      <div className="relative flex min-h-[380px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c1017]/85 p-6 shadow-2xl backdrop-blur-2xl sm:min-h-[440px] sm:p-10">
        {/* Ambient Aurora Radial Glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-72 w-72 rounded-full bg-gradient-to-tr from-[#39977f]/20 via-[#3d276f]/25 to-[#b4dac3]/15 blur-3xl sm:h-96 sm:w-96" />
        </div>

        <AnimatePresence mode="wait">
          {/* Phase 1: Breathe / สมาธิ Animation (~1.5s) */}
          {phase === "breathe" && (
            <motion.div
              key="phase-breathe"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              {/* Concentric Pulsing Breathing Rings */}
              <div className="relative flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
                {/* Outer Breathing Aura */}
                <motion.div
                  animate={{
                    scale: breatheStage === "inhale" ? [1, 1.25] : [1.25, 0.95],
                    opacity: breatheStage === "inhale" ? [0.2, 0.5] : [0.5, 0.2],
                  }}
                  transition={{ duration: 0.75, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full border border-emerald-400/40 bg-emerald-500/10 blur-sm"
                />

                {/* Middle Ring */}
                <motion.div
                  animate={{
                    scale: breatheStage === "inhale" ? [1, 1.15] : [1.15, 1],
                  }}
                  transition={{ duration: 0.75, ease: "easeInOut" }}
                  className="absolute inset-4 rounded-full border border-white/20 bg-white/[0.02]"
                />

                {/* Inner Glowing Core */}
                <motion.div
                  animate={{
                    scale: breatheStage === "inhale" ? [0.85, 1.05] : [1.05, 0.85],
                  }}
                  transition={{ duration: 0.75, ease: "easeInOut" }}
                  className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-[#39977f] via-emerald-400 to-[#b4dac3] shadow-[0_0_35px_rgba(57,151,127,0.5)] sm:h-32 sm:w-32"
                >
                  <Sparkles className="h-8 w-8 text-black sm:h-10 sm:w-10" />
                </motion.div>
              </div>

              {/* Breath Instruction Text */}
              <motion.div
                key={breatheStage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <h2 className="font-heading font-serif text-xl font-normal text-white sm:text-2xl">
                  {breatheStage === "inhale" ? t.shuffle.inhale : t.shuffle.exhale}
                </h2>
                <p className="mt-1.5 text-xs text-zinc-400 sm:text-sm">
                  {t.shuffle.breatheSubtitle}
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Phase 2: Shuffle Animation (Showing Deck Split & Riffle) */}
          {phase === "shuffle" && (
            <motion.div
              key="phase-shuffle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex w-full flex-col items-center text-center"
            >
              {/* 3D Perspective Card Deck Stage */}
              <div className="relative mb-6 flex h-48 w-56 items-center justify-center sm:h-56 sm:w-64">
                {/* 5 Stacked Cards with dynamic interleaving shuffle motion */}
                {[0, 1, 2, 3, 4].map((index) => {
                  const isLeft = index % 2 === 0;
                  return (
                    <motion.div
                      key={index}
                      animate={{
                        x: isLeft ? [-25, -60, 0] : [25, 60, 0],
                        y: [index * -2, (index - 2) * 4, index * -2],
                        rotate: isLeft ? [-6, -14, -2] : [6, 14, 2],
                        scale: [0.96, 1, 0.96],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        delay: index * 0.08,
                      }}
                      className="absolute h-36 w-24 rounded-xl border border-[#39977f]/40 bg-gradient-to-b from-[#1d1640] via-[#0e1320] to-[#070b0e] p-2 shadow-2xl backdrop-blur-md sm:h-44 sm:w-28"
                      style={{
                        zIndex: 10 + index,
                      }}
                    >
                      {/* Mystical Card Back Texture */}
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.02]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                          <Sparkles className="h-4 w-4" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Shuffling Headline */}
              <h2 className="font-heading font-serif text-lg font-normal text-white sm:text-xl">
                {t.shuffle.shufflingTitle}
              </h2>
              <p className="mt-1 text-xs text-zinc-400">{t.shuffle.shufflingSubtitle}</p>

              {/* Smooth Progress Bar */}
              <div className="mt-5 w-full max-w-xs">
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Entropy</span>
                  <span className="font-mono text-emerald-400">{shuffleProgress}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#39977f] to-emerald-400"
                    style={{ width: `${shuffleProgress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase 3: Ready / Transitioning State */}
          {phase === "ready" && (
            <motion.div
              key="phase-ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#39977f]/40 bg-[#39977f]/15 text-emerald-300 shadow-[0_0_30px_rgba(57,151,127,0.3)]">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="font-heading mt-5 font-serif text-lg font-normal text-white sm:text-xl">
                {isApiReady ? t.shuffle.readyTitle : t.shuffle.preparingDeck}
              </h2>
              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                <span>Entering selection sanctuary...</span>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {phase === "error" && (
            <motion.div
              key="phase-error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex max-w-sm flex-col items-center text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h2 className="font-heading mt-4 font-serif text-base font-semibold text-rose-200">
                {t.shuffle.errorTitle}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {errorMessage || "Unable to complete deck randomization."}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex items-center gap-2 rounded-full bg-[#39977f] px-5 py-2 text-xs font-semibold text-black shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{t.shuffle.retryBtn}</span>
                </button>
                <Link
                  href="/read?step=spread"
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.05]"
                >
                  {t.shuffle.backBtn}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sacred Invariant Note at Bottom */}
      <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <span>Fisher-Yates Shuffle Once &bull; 78-Card Deck &bull; Zero Biased Replacement</span>
      </div>
    </div>
  );
}
