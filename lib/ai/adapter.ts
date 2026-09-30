import { buildSystemPrompt, buildUserPrompt, buildSelfRepairPrompt } from "./prompt";
import { validateAIInterpretation, extractJsonFromText } from "./validation";
import { generateDeterministicFallback } from "./fallback";
import { callKKUIntelliShare } from "./providers/kku";
import { callGemini } from "./providers/gemini";
import type { SpreadId } from "@/types/spread";
import type { DrawnCard } from "@/types/tarot";
import type { ReadingAnalysis } from "@/types/reading";
import type { AIInterpretationPayload } from "@/types/ai";

export interface InterpretTarotSpreadParams {
  question: string;
  spreadId: SpreadId;
  cards: DrawnCard[];
  analysis: ReadingAnalysis;
  locale?: string;
}

/**
 * Executes a call to the active AI provider, trying Primary (KKU) then Backup (Gemini).
 */
async function callAvailableProvider(
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; provider: "kku" | "gemini" } | null> {
  const hasKKU = Boolean(process.env.KKU_INTELLISHARE_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  // 1. Try Primary: KKU IntelliShare
  if (hasKKU) {
    try {
      const text = await callKKUIntelliShare(systemPrompt, userPrompt);
      return { text, provider: "kku" };
    } catch (kkuError) {
      console.warn("KKU IntelliShare call failed, falling back to backup provider:", kkuError);
    }
  }

  // 2. Try Backup: Google Gemini
  if (hasGemini) {
    try {
      const text = await callGemini(systemPrompt, userPrompt);
      return { text, provider: "gemini" };
    } catch (geminiError) {
      console.warn("Gemini call failed:", geminiError);
    }
  }

  return null;
}

/**
 * Tarot AI Adapter & Orchestration Engine (SDD §5, §7).
 *
 * Implements the complete multi-tier interpretation lifecycle:
 * 1. AI Call (KKU IntelliShare Primary -> Gemini Backup)
 * 2. Output Schema Validation & Zero Hallucination Guard
 * 3. One-Shot Self-Repair if initial response violates constraints
 * 4. Deterministic Fallback Engine if AI is unavailable, times out, or fails repair
 */
export async function interpretTarotSpread(
  params: InterpretTarotSpreadParams
): Promise<AIInterpretationPayload> {
  const { question, spreadId, cards, analysis, locale = "th" } = params;

  const hasAnyKey =
    Boolean(process.env.KKU_INTELLISHARE_API_KEY) || Boolean(process.env.GEMINI_API_KEY);

  // If no AI keys configured, immediately use deterministic fallback engine (D6)
  if (!hasAnyKey) {
    return generateDeterministicFallback({
      question,
      spreadId,
      cards,
      analysis,
      locale,
    });
  }

  const systemPrompt = buildSystemPrompt(locale);
  const userPrompt = buildUserPrompt({
    question,
    spreadId,
    cards,
    analysis,
    locale,
  });

  try {
    // Step 1: Initial AI Call
    const initialCallResult = await callAvailableProvider(systemPrompt, userPrompt);
    if (!initialCallResult) {
      return generateDeterministicFallback({ question, spreadId, cards, analysis, locale });
    }

    // Step 2: Output Validation & Hallucination Guard
    const initialJson = extractJsonFromText(initialCallResult.text);
    const initialValidation = validateAIInterpretation(initialJson, cards);

    if (initialValidation.valid) {
      return initialValidation.payload;
    }

    console.warn(
      `Initial AI output validation failed (${initialValidation.reason}). Attempting one-shot self-repair...`
    );

    // Step 3: One-shot Self-Repair Request
    const selfRepairPrompt = buildSelfRepairPrompt(
      initialCallResult.text,
      initialValidation.reason,
      cards.map((c) => c.cardId)
    );

    let repairedText: string | null = null;
    if (initialCallResult.provider === "kku") {
      repairedText = await callKKUIntelliShare(systemPrompt, selfRepairPrompt).catch(() => null);
    } else {
      repairedText = await callGemini(systemPrompt, selfRepairPrompt).catch(() => null);
    }

    if (repairedText) {
      const repairedJson = extractJsonFromText(repairedText);
      const repairedValidation = validateAIInterpretation(repairedJson, cards);

      if (repairedValidation.valid) {
        return repairedValidation.payload;
      }

      console.warn(
        `Self-repair also failed validation (${repairedValidation.reason}). Switching to deterministic fallback.`
      );
    }
  } catch (error) {
    console.error("Tarot AI Adapter encountered an unexpected error:", error);
  }

  // Step 4: Deterministic Fallback Engine (SDD D6)
  return generateDeterministicFallback({
    question,
    spreadId,
    cards,
    analysis,
    locale,
  });
}
