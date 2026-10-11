"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Sparkles, HelpCircle, Dices, RotateCcw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  validateQuestion,
  MIN_QUESTION_LENGTH,
  MAX_QUESTION_LENGTH,
} from "@/lib/validation/question";
import {
  getReadingSession,
  saveQuestion,
  clearReadingSession,
} from "@/lib/storage/reading-session";
import { EXAMPLE_PROMPTS } from "@/data/prompts";
import { QuestionGuidance } from "./QuestionGuidance";
import { useLanguage } from "@/lib/i18n/context";
import { getSpreadRecommendation } from "@/lib/tarot/spread-recommendation";
import { detectCrisisIntent } from "@/lib/safety/crisis";
import { CrisisPanel } from "@/components/safety/CrisisPanel";

export function QuestionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { t, locale } = useLanguage();

  const [question, setQuestion] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const session = getReadingSession();
    if (session?.question && session.lifecycleState !== "RESULT") {
      return session.question;
    }
    if (session?.lifecycleState === "RESULT") {
      clearReadingSession();
    }
    return "";
  });

  const [hasInteracted, setHasInteracted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const session = getReadingSession();
    return Boolean(session?.question && session.lifecycleState !== "RESULT");
  });

  const [activeCategory, setActiveCategory] = useState<string>("general");
  const [showPromptsDropdown, setShowPromptsDropdown] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  // Subscribe to session reset events from other components (e.g. New Reading)
  useEffect(() => {
    const handleSessionReset = () => {
      setQuestion("");
      setHasInteracted(false);
    };

    window.addEventListener("tarot_session_reset", handleSessionReset);
    return () => window.removeEventListener("tarot_session_reset", handleSessionReset);
  }, []);

  const validation = validateQuestion(question);
  const crisisCheck = detectCrisisIntent(question);
  const charCount = question.length;
  const isTooShort =
    hasInteracted && question.trim().length > 0 && question.trim().length < MIN_QUESTION_LENGTH;
  const isTooLong = charCount > MAX_QUESTION_LENGTH;

  const currentCategory =
    EXAMPLE_PROMPTS.find((c) => c.id === activeCategory) || EXAMPLE_PROMPTS[0];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleSelectPrompt = (promptText: string) => {
    setQuestion(promptText);
    setHasInteracted(true);
    setShowPromptsDropdown(false);
  };

  const handleRandomPrompt = () => {
    const allPrompts = EXAMPLE_PROMPTS.flatMap((c) => c.prompts);
    const randomIndex = Math.floor(Math.random() * allPrompts.length);
    setQuestion(allPrompts[randomIndex]);
    setHasInteracted(true);
  };

  const handleClear = () => {
    setQuestion("");
    setHasInteracted(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasInteracted(true);

    if (!validation.isValid) {
      return;
    }

    // Persist question in sessionStorage (SDD §7 Flow State Machine)
    saveQuestion(question);

    // Proceed to Step 2: Spread Selection (SDD §6.2 row 2)
    startTransition(() => {
      router.push("/read?step=spread");
    });
  };

  return (
    <div className="w-full space-y-5">
      {/* Crisis Safety Support Banner (SDD §3, Q-003) */}
      <AnimatePresence>
        {crisisCheck.isCrisis && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <CrisisPanel reason="keyword" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Floating Capsule Card */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full rounded-2xl border border-white/[0.12] bg-[#14181d]/85 p-3 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all focus-within:border-emerald-500/50 focus-within:shadow-[0_15px_45px_rgba(16,185,129,0.15)] sm:rounded-3xl sm:p-4"
      >
        {/* Top Textarea Area */}
        <div className="relative min-h-[56px] sm:min-h-[68px]">
          <textarea
            id="tarot-question"
            rows={2}
            value={question}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && validation.isValid) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={t.landing.inputPlaceholder}
            className="w-full resize-none bg-transparent p-1 text-sm leading-normal text-zinc-100 placeholder:text-zinc-500 focus:outline-none sm:p-1.5 sm:text-base"
          />
        </div>

        {/* Validation and Character Counter Sub-bar */}
        <div className="mb-2 flex items-center justify-between px-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            {isTooShort && (
              <span className="flex items-center gap-1 text-rose-400">
                <AlertCircle className="h-3 w-3" />
                {t.landing.minCharsRequired} ({question.trim().length}/{MIN_QUESTION_LENGTH})
              </span>
            )}
            {isTooLong && (
              <span className="flex items-center gap-1 text-rose-400">
                <AlertCircle className="h-3 w-3" />
                {t.landing.maxCharsExceeded}
              </span>
            )}
            {validation.isValid && (
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <Sparkles className="h-3 w-3 shrink-0" />
                <span>{t.landing.readyToDraw}</span>
                <span className="hidden text-zinc-500 sm:inline">&bull;</span>
                <span className="hidden text-emerald-300/80 sm:inline">
                  Recommended: {getSpreadRecommendation(question, "en").spreadName}
                </span>
              </span>
            )}
          </div>

          <span
            className={`font-mono ${
              charCount > MAX_QUESTION_LENGTH
                ? "font-bold text-rose-400"
                : charCount >= 480
                  ? "text-amber-400"
                  : "text-zinc-500"
            }`}
          >
            {charCount}/{MAX_QUESTION_LENGTH}
          </span>
        </div>

        {/* Bottom Action Bar inside Capsule */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] pt-2 sm:pt-2.5">
          {/* Left: Interactive Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Quick Inspiration Button */}
            <button
              type="button"
              onClick={() => setShowPromptsDropdown((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                showPromptsDropdown
                  ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                  : "border border-white/[0.08] bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>{t.landing.promptIdeas}</span>
            </button>

            {/* Category Quick Chips */}
            {EXAMPLE_PROMPTS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setShowPromptsDropdown(true);
                }}
                className={`hidden rounded-full px-2.5 py-1 text-xs font-medium transition-all md:inline-flex ${
                  activeCategory === cat.id && showPromptsDropdown
                    ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                    : "border border-white/[0.06] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200"
                }`}
              >
                {cat.name}
              </button>
            ))}

            {/* Question Guidance Toggle */}
            <button
              type="button"
              onClick={() => setShowGuidance((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                showGuidance
                  ? "border border-teal-500/40 bg-teal-500/20 text-teal-300"
                  : "border border-white/[0.06] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200"
              }`}
              title={t.landing.guidance}
            >
              <HelpCircle className="h-3.5 w-3.5 text-teal-400" />
              <span className="hidden sm:inline">{t.landing.guidance}</span>
            </button>

            {/* Surprise Me (Random) */}
            <button
              type="button"
              onClick={handleRandomPrompt}
              className="flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-xs font-medium text-zinc-400 transition-all hover:bg-white/[0.08] hover:text-zinc-200"
              title={t.landing.random}
            >
              <Dices className="h-3.5 w-3.5 text-zinc-400" />
              <span className="hidden lg:inline">{t.landing.random}</span>
            </button>

            {question && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300"
                title={t.landing.clear}
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Right: The Iconic Vibrant Emerald Circular Continue Button */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="submit"
              disabled={!validation.isValid || isPending}
              aria-label={t.landing.continueBtn}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all sm:h-10 sm:w-10 ${
                validation.isValid && !isPending
                  ? "cursor-pointer bg-[#22c55e] text-black shadow-[0_0_20px_rgba(34,197,94,0.45)] hover:scale-105 hover:bg-[#16a34a] active:scale-95"
                  : "cursor-not-allowed border border-white/[0.05] bg-white/[0.06] text-zinc-600"
              }`}
            >
              <ArrowUp className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </form>

      {/* Expandable Prompts Dropdown Drawer */}
      <AnimatePresence>
        {showPromptsDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full rounded-2xl border border-white/[0.1] bg-[#11151a]/95 p-4 shadow-2xl backdrop-blur-xl"
          >
            {/* Category tabs */}
            <div className="mb-3 flex scrollbar-none gap-1.5 overflow-x-auto pb-1">
              {EXAMPLE_PROMPTS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeCategory === cat.id
                      ? "bg-emerald-500 font-semibold text-zinc-950"
                      : "bg-white/[0.05] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Prompts list */}
            <div className="grid gap-2">
              {currentCategory.prompts.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPrompt(promptText)}
                  className="group flex items-start gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5 text-left text-xs leading-relaxed text-zinc-300 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/[0.06] hover:text-white"
                >
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400 opacity-60 group-hover:opacity-100" />
                  <span>{promptText}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Question Guidance Drawer */}
      <AnimatePresence>
        {showGuidance && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <QuestionGuidance />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
