import { isValidSpreadId } from "@/data/spreads";
import type { ActiveReadingSession } from "@/lib/storage/reading-session";
import { MIN_QUESTION_LENGTH, MAX_QUESTION_LENGTH } from "@/lib/validation/question";

export type ReadingStep = "spread" | "shuffle" | "select" | "result";

export interface RouteProtectionResult {
  allowed: boolean;
  redirectUrl?: string;
  reason?: string;
}

/**
 * Validates whether a user can access a specific reading step (SDD §6.2, §7).
 * Prevents step-skipping (e.g. going directly to select without shuffling, or shuffle without spread/question).
 */
export function validateStepAccess(
  targetStep: string | null | undefined,
  session: ActiveReadingSession | null
): RouteProtectionResult {
  // 1. Question invariant: A valid question (5-500 chars) is strictly required for all reading steps
  if (
    !session ||
    !session.question ||
    session.question.trim().length < MIN_QUESTION_LENGTH ||
    session.question.trim().length > MAX_QUESTION_LENGTH
  ) {
    return {
      allowed: false,
      redirectUrl: "/",
      reason: "A valid question (5-500 characters) is required to start a reading.",
    };
  }

  const normalizedStep = (targetStep || "spread").toLowerCase();

  // 2. Step: spread
  if (normalizedStep === "spread") {
    return { allowed: true };
  }

  // 3. Step: shuffle (Requires valid spreadId)
  if (normalizedStep === "shuffle") {
    if (!session.spreadId || !isValidSpreadId(session.spreadId)) {
      return {
        allowed: false,
        redirectUrl: "/read?step=spread",
        reason: "A valid spread must be selected before shuffling.",
      };
    }
    return { allowed: true };
  }

  // 4. Step: select (Requires valid spreadId and shuffled deck from POST /api/draw)
  if (normalizedStep === "select") {
    if (!session.spreadId || !isValidSpreadId(session.spreadId)) {
      return {
        allowed: false,
        redirectUrl: "/read?step=spread",
        reason: "A valid spread must be selected before selecting cards.",
      };
    }

    const hasShuffledDeck =
      Boolean(session.drawId) &&
      Array.isArray(session.deck) &&
      session.deck.length === 78;

    if (!hasShuffledDeck) {
      return {
        allowed: false,
        redirectUrl: "/read?step=shuffle",
        reason: "The sacred deck must be shuffled before cards can be selected.",
      };
    }

    return { allowed: true };
  }

  // 5. Step: result (Requires complete reading)
  if (normalizedStep === "result") {
    if (!session.spreadId || !isValidSpreadId(session.spreadId)) {
      return {
        allowed: false,
        redirectUrl: "/read?step=spread",
        reason: "A valid spread must be selected.",
      };
    }

    const hasShuffledDeck =
      Boolean(session.drawId) &&
      Array.isArray(session.deck) &&
      session.deck.length === 78;

    if (!hasShuffledDeck) {
      return {
        allowed: false,
        redirectUrl: "/read?step=shuffle",
        reason: "The deck must be shuffled first.",
      };
    }

    if (session.lifecycleState !== "COMPLETE" && session.lifecycleState !== "RESULT") {
      return {
        allowed: false,
        redirectUrl: "/read?step=select",
        reason: "All cards in the spread must be selected and revealed before viewing results.",
      };
    }

    return { allowed: true };
  }

  // Fallback for unknown step
  return {
    allowed: false,
    redirectUrl: "/read?step=spread",
    reason: "Unknown reading step.",
  };
}
