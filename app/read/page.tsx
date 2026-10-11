"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SpreadSelection } from "@/components/reading/SpreadSelection";
import { BreatheShuffle } from "@/components/reading/BreatheShuffle";
import { CardSelection } from "@/components/reading/CardSelection";
import { ReadingResult } from "@/components/reading/ReadingResult";
import { getReadingSession } from "@/lib/storage/reading-session";
import { validateStepAccess } from "@/lib/validation/route-guard";

function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-zinc-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        <p className="text-xs tracking-wider uppercase">Entering sacred space...</p>
      </div>
    </div>
  );
}

function ReadStepRouter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = searchParams.get("step") || "spread";

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Enforce Route Protection (SDD §6.2, §7)
  useEffect(() => {
    const session = getReadingSession();
    const guard = validateStepAccess(step, session);

    if (!guard.allowed && guard.redirectUrl) {
      router.replace(guard.redirectUrl);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthorized(true);
    }
  }, [step, router]);

  if (isAuthorized === null) {
    return <LoadingFallback />;
  }

  switch (step) {
    case "shuffle":
      return <BreatheShuffle />;
    case "select":
      return <CardSelection />;
    case "result":
      return <ReadingResult />;
    case "spread":
    default:
      return <SpreadSelection />;
  }
}

export default function ReadPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReadStepRouter />
    </Suspense>
  );
}
