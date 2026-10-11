"use client";

import { QuestionForm } from "@/components/landing/QuestionForm";
import { ShieldCheck, Shuffle, Eye, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-start pt-6 pb-16 sm:pt-14">
      {/* Hero Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-full flex-col items-center pb-8 text-center sm:pb-10"
      >
        {/* Main Headline (Serif + Italic Accent like reference image) */}
        <h1 className="font-heading max-w-2xl font-serif text-3xl leading-[1.15] font-normal tracking-tight text-white sm:text-5xl md:text-6xl">
          {t.landing.headlinePart1} <br />
          with{" "}
          <span className="font-serif text-emerald-200 italic">{t.landing.headlineAccent}</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-lg text-xs leading-relaxed text-zinc-400 sm:text-sm md:text-base">
          {t.landing.subtitle}
        </p>
      </motion.div>

      {/* Centerpiece: The Cinematic Capsule Prompt Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full"
      >
        <QuestionForm />
      </motion.div>

      {/* Floating Sacred Invariant Badges (Mirrors the reference image's sponsor/proof strip) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-zinc-400 sm:mt-12"
      >
        <div className="flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100">
          <Shuffle className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-medium">Fisher-Yates Crypto RNG</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100">
          <Layers className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-medium">78-Card Complete Deck</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-medium">Zero Hallucination Guard</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100">
          <Eye className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-medium">True Index Selection</span>
        </div>
      </motion.div>

      {/* Subtle Second Section Preview (Like "CORE CAPABILITIES" in reference image) */}
      <div className="mt-20 w-full border-t border-white/[0.06] pt-12 text-center sm:mt-28">
        <span className="text-[10px] font-semibold tracking-[0.25em] text-emerald-400 uppercase">
          Ritual Sequence
        </span>
        <h2 className="font-heading mt-3 font-serif text-2xl text-zinc-100 sm:text-3xl">
          Transform questions into actionable clarity
        </h2>
        <p className="mx-auto mt-2 max-w-md text-xs text-zinc-400 sm:text-sm">
          From setting an intention to shuffling once and revealing cards one by one.
        </p>
      </div>
    </div>
  );
}
