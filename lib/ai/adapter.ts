import { buildSystemPrompt, buildUserPrompt, buildSelfRepairPrompt } from "./prompt";
import { validateAIInterpretation, extractJsonFromText } from "./validation";
import { generateDeterministicFallback } from "./fallback";
import { analyzeQuestion } from "./intent";
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
  model?: string;
}

/**
 * Executes a call to the active AI provider, trying Primary (KKU) then Backup (Gemini).
 */
async function callAvailableProvider(
  systemPrompt: string,
  userPrompt: string,
  overrideModel?: string
): Promise<{ text: string; provider: "kku" | "gemini" } | null> {
  const hasKKU = Boolean(process.env.KKU_INTELLISHARE_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  // 1. Try Primary: KKU IntelliShare
  if (hasKKU) {
    try {
      const text = await callKKUIntelliShare(systemPrompt, userPrompt, 30000, overrideModel);
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
 * Tarot AI Adapter & Orchestration Engine (SDD §5, §7, §11, §12).
 *
 * Implements the complete multi-tier interpretation lifecycle:
 * 1. Question Analysis & Scope Lock (intent, sub-questions, primary question)
 * 2. AI Call (KKU IntelliShare Primary -> Gemini Backup)
 * 3. Output Schema Validation & Zero Hallucination Guard
 * 4. One-Shot Self-Repair if initial response violates constraints
 * 5. Deterministic Fallback Engine if AI is unavailable, times out, or fails repair
 */
export async function interpretTarotSpread(
  params: InterpretTarotSpreadParams
): Promise<AIInterpretationPayload> {
  const { question, spreadId, cards, analysis, locale = "th" } = params;
  const qAnalysis = analyzeQuestion(question, locale);

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
      questionAnalysis: qAnalysis,
    });
  }

  const systemPrompt = buildSystemPrompt(locale);
  const userPrompt = buildUserPrompt({
    question,
    spreadId,
    cards,
    analysis,
    locale,
    questionAnalysis: qAnalysis,
  });

  try {
    // Step 1: Initial AI Call
    const initialCallResult = await callAvailableProvider(systemPrompt, userPrompt, params.model);
    if (!initialCallResult) {
      return generateDeterministicFallback({
        question,
        spreadId,
        cards,
        analysis,
        locale,
        questionAnalysis: qAnalysis,
      });
    }

    // Step 2: Output Validation & Hallucination Guard
    const initialJson = extractJsonFromText(initialCallResult.text);
    const initialValidation = validateAIInterpretation(initialJson, cards);

    if (initialValidation.valid) {
      return {
        ...initialValidation.payload,
        originalQuestion: initialValidation.payload.originalQuestion || qAnalysis.original,
        questionIntent: initialValidation.payload.questionIntent || qAnalysis.intent,
        questionScope: initialValidation.payload.questionScope || qAnalysis.scope,
        isMultiQuestion:
          initialValidation.payload.isMultiQuestion ??
          (qAnalysis.resolution.type === "independent_multi_question"),
        subQuestions: initialValidation.payload.subQuestions ?? qAnalysis.subQuestions,
        scopeNotice: initialValidation.payload.scopeNotice ?? qAnalysis.scopeNotice,
        questionAnalysis: initialValidation.payload.questionAnalysis || {
          original: qAnalysis.original,
          primary: qAnalysis.primary,
          followUps: qAnalysis.followUps,
          resolution: qAnalysis.resolution,
        },
        answer: initialValidation.payload.answer,
        clarificationPrompt:
          initialValidation.payload.clarificationPrompt ||
          (qAnalysis.resolution.type === "clarify" ? initialValidation.payload.directAnswer : undefined),
      };
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
        return {
          ...repairedValidation.payload,
          originalQuestion: repairedValidation.payload.originalQuestion || qAnalysis.original,
          questionIntent: repairedValidation.payload.questionIntent || qAnalysis.intent,
          questionScope: repairedValidation.payload.questionScope || qAnalysis.scope,
          isMultiQuestion:
            repairedValidation.payload.isMultiQuestion ??
            (qAnalysis.resolution.type === "independent_multi_question"),
          subQuestions: repairedValidation.payload.subQuestions ?? qAnalysis.subQuestions,
          scopeNotice: repairedValidation.payload.scopeNotice ?? qAnalysis.scopeNotice,
          questionAnalysis: repairedValidation.payload.questionAnalysis || {
            original: qAnalysis.original,
            primary: qAnalysis.primary,
            followUps: qAnalysis.followUps,
            resolution: qAnalysis.resolution,
          },
          answer: repairedValidation.payload.answer,
          clarificationPrompt:
            repairedValidation.payload.clarificationPrompt ||
            (qAnalysis.resolution.type === "clarify" ? repairedValidation.payload.directAnswer : undefined),
        };
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
    questionAnalysis: qAnalysis,
  });
}
