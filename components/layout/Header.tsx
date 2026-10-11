"use client";

import Link from "next/link";
import { History, Moon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { resetReadingSession } from "@/lib/storage/reading-session";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070b0e]/70 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <Link
          href="/"
          onClick={() => resetReadingSession()}
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-emerald-300 transition-colors group-hover:border-emerald-400 group-hover:bg-emerald-500/20">
            <Moon className="h-4 w-4 fill-emerald-300/30 text-emerald-300" />
          </div>
          <span className="font-heading font-serif text-base font-medium tracking-wide text-zinc-100 sm:text-lg">
            Tarot Tajai
          </span>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden items-center gap-6 text-xs font-medium text-zinc-400 md:flex">
          <Link href="/" className="transition-colors hover:text-zinc-100">
            {t.nav.inquiry}
          </Link>
          <Link href="/read?step=spread" className="transition-colors hover:text-zinc-100">
            {t.nav.spreads}
          </Link>
          <Link href="/history" className="transition-colors hover:text-zinc-100">
            {t.nav.history}
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/history"
            className="flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-100 md:hidden"
          >
            <History className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">{t.nav.history}</span>
          </Link>

          <Link
            href="/"
            onClick={() => resetReadingSession()}
            className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-md transition-all hover:border-emerald-400/50 hover:bg-white/[0.08] hover:text-white sm:px-4"
          >
            {t.nav.newReading}
          </Link>
        </div>
      </div>
    </header>
  );
}
