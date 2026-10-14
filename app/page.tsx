"use client";

import { QuestionForm } from "@/components/landing/QuestionForm";
import { useLanguage } from "@/lib/i18n/context";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center">
      {/* Proportional top spacing to position chat box at middle-lower area */}
      <div className="min-h-6 flex-[3] sm:min-h-10" />

      {/* AI Chatbot-style Single-Sentence Heading */}
      <h1 className="font-heading mb-6 text-center font-serif text-2xl font-normal tracking-tight text-zinc-100 sm:mb-8 sm:text-3xl md:text-4xl">
        {t.landing.headline}
      </h1>

      {/* Centerpiece: The Cinematic Capsule Prompt Box */}
      <div className="w-full">
        <QuestionForm />
      </div>

      {/* Proportional bottom spacing */}
      <div className="min-h-6 flex-[2] sm:min-h-8" />
    </div>
  );
}
