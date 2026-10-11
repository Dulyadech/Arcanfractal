"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Sparkles, Flame, Droplets, Wind, Mountain, Compass, RotateCcw } from "lucide-react";
import type { TarotCard, CardOrientation } from "@/types/tarot";
import { getCardImageUrl } from "@/lib/tarot/card-images";

interface CardDetailModalProps {
  card: TarotCard | null;
  orientation?: CardOrientation;
  positionName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CardDetailModal({
  card,
  orientation = "upright",
  positionName,
  isOpen,
  onClose,
}: CardDetailModalProps) {
  if (!card) return null;

  const imageUrl = getCardImageUrl(card.id);

  const renderElementIcon = () => {
    switch (card.element) {
      case "fire":
        return <Flame className="h-3.5 w-3.5 text-amber-400" />;
      case "water":
        return <Droplets className="h-3.5 w-3.5 text-blue-400" />;
      case "air":
        return <Wind className="h-3.5 w-3.5 text-teal-300" />;
      case "earth":
        return <Mountain className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <Compass className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop Overlay */}
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity" />

        {/* Modal Content Dialog */}
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0c1017] p-0 shadow-[0_25px_60px_rgba(0,0,0,0.85)] duration-200">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5 sm:px-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <Dialog.Title className="font-heading font-serif text-base font-semibold text-zinc-100 sm:text-lg">
                {card.name}
              </Dialog.Title>
              {positionName && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  {positionName}
                </span>
              )}
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close card details"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-6 md:grid-cols-12">
              {/* Left Column: Card Artwork */}
              <div className="flex flex-col items-center justify-start md:col-span-5">
                <div
                  className={`relative aspect-[2/3] w-48 overflow-hidden rounded-xl border border-[#39977f]/40 bg-[#14181d] shadow-[0_10px_30px_rgba(0,0,0,0.6)] sm:w-56 ${
                    orientation === "reversed" ? "rotate-180" : ""
                  }`}
                >
                  <Image
                    src={imageUrl}
                    alt={card.name}
                    fill
                    sizes="(max-width: 768px) 192px, 224px"
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Orientation Badge below card */}
                <div className="mt-3 flex items-center gap-1.5">
                  {orientation === "reversed" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                      <RotateCcw className="h-3 w-3" />
                      <span>Reversed Aspect</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                      <Sparkles className="h-3 w-3" />
                      <span>Upright Aspect</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Metadata & Detailed Lore */}
              <div className="flex flex-col gap-4 md:col-span-7">
                {/* Badges Strip */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300 capitalize">
                    {card.arcana} Arcana
                  </span>
                  {card.suit && (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300 capitalize">
                      {card.suit}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300 capitalize">
                    {renderElementIcon()}
                    <span>{card.element}</span>
                  </span>
                </div>

                {/* Keywords */}
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                  <div className="text-[11px] font-semibold tracking-wider text-emerald-300 uppercase">
                    Keywords
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(orientation === "reversed"
                      ? card.keywords.reversed
                      : card.keywords.upright
                    ).map((kw) => (
                      <span
                        key={kw}
                        className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-xs text-zinc-200"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Short Essence */}
                <div>
                  <h4 className="font-heading font-serif text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                    Core Essence
                  </h4>
                  <p className="mt-1 font-serif text-sm leading-relaxed text-zinc-200 italic">
                    &ldquo;
                    {orientation === "reversed"
                      ? card.meaning.short.reversed
                      : card.meaning.short.upright}
                    &rdquo;
                  </p>
                </div>

                {/* Full Narrative Lore */}
                <div className="border-t border-white/[0.06] pt-3">
                  <h4 className="font-heading font-serif text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                    Full Interpretation Lore
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-300 sm:text-sm">
                    {orientation === "reversed"
                      ? card.meaning.full.reversed
                      : card.meaning.full.upright}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
