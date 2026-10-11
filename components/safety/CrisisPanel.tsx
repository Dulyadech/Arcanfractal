"use client";

import { Phone, HeartHandshake, ShieldAlert } from "lucide-react";
import { CRISIS_RESOURCES } from "@/lib/safety/crisis";

interface CrisisPanelProps {
  reason?: "keyword" | "ai_safety";
  className?: string;
}

export function CrisisPanel({ reason = "keyword", className = "" }: CrisisPanelProps) {
  const resources = CRISIS_RESOURCES.en;

  const title = "You Are Not Alone — Help and Support Are Available";
  const message =
    "If you or someone you care about is experiencing overwhelming stress, emotional pain, or thoughts of self-harm, please reach out to these free, confidential support services.";

  return (
    <div
      role="alert"
      className={`relative overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-[#180d13] to-[#0c0d12] p-5 shadow-[0_0_35px_rgba(244,63,94,0.18)] backdrop-blur-xl ${className}`}
    >
      {/* Top Banner Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
          <HeartHandshake className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-rose-300 uppercase">
            <ShieldAlert className="h-3 w-3" />
            <span>Crisis Support • Confidential Assistance</span>
          </div>
          <h3 className="mt-1 font-serif text-base font-semibold text-rose-100 sm:text-lg">
            {title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-zinc-300 sm:text-sm">{message}</p>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {resources.map((item) => (
          <div
            key={item.phone}
            className="flex flex-col justify-between rounded-xl border border-rose-500/20 bg-black/40 p-3.5 transition-colors hover:border-rose-400/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs text-rose-200">{item.name}</span>
                <span className="text-[10px] text-zinc-400">{item.availableHours}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{item.description}</p>
            </div>

            <a
              href={`tel:${item.phone.replace(/[^0-9]/g, "")}`}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600/30 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/40 active:scale-98 transition-all"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Call {item.phone}</span>
            </a>
          </div>
        ))}
      </div>

      <div className="mt-3 text-center text-[10px] text-zinc-500">
        * Safety indicators are evaluated locally in your browser to maintain strict privacy.
      </div>
    </div>
  );
}
