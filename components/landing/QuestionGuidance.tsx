"use client";

import { useState } from "react";
import { ChevronDown, Check, X, Compass, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";

export function QuestionGuidance() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0f19]/60 shadow-lg backdrop-blur-xl transition-colors hover:border-emerald-500/25">
      {/* Header / Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/[0.02] sm:p-5"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading font-serif text-sm font-semibold tracking-wide text-zinc-100 sm:text-base">
              {t.guidance.title}
            </h3>
            <p className="text-xs text-zinc-400">{t.guidance.subtitle}</p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] text-zinc-400"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.div>
      </button>

      {/* Expandable Guidance Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="guidance-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/[0.06] bg-black/20 px-4 pt-4 pb-5 text-xs leading-relaxed text-zinc-300 sm:px-5 sm:text-sm"
          >
            <p className="mb-4 text-zinc-400">{t.guidance.intro}</p>

            {/* Clean Comparison Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-rose-500/20 bg-rose-950/15 p-3.5">
                <div className="flex items-center gap-1.5 font-medium text-rose-300">
                  <X className="h-3.5 w-3.5 text-rose-400" />
                  <span>{t.guidance.closedTitle}</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-xs text-rose-200/70">
                  <li>&bull; &quot;{t.guidance.closedExample1}&quot;</li>
                  <li>&bull; &quot;{t.guidance.closedExample2}&quot;</li>
                  <li>&bull; &quot;{t.guidance.closedExample3}&quot;</li>
                </ul>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-3.5">
                <div className="flex items-center gap-1.5 font-medium text-emerald-300">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{t.guidance.openTitle}</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-xs text-emerald-200/80">
                  <li>&bull; &quot;{t.guidance.openExample1}&quot;</li>
                  <li>&bull; &quot;{t.guidance.openExample2}&quot;</li>
                  <li>&bull; &quot;{t.guidance.openExample3}&quot;</li>
                </ul>
              </div>
            </div>

            {/* Sacred Invariant Note */}
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-200/90">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                <strong className="text-emerald-300">{t.guidance.invariantTitle}:</strong>{" "}
                {t.guidance.invariantDesc}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
