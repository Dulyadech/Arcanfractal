import { NextResponse } from "next/server";
import { callGemini } from "@/lib/ai/providers/gemini";
import { callKKUIntelliShare } from "@/lib/ai/providers/kku";
import { detectSafety } from "@/lib/ai/safety";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, bestSpread, firedSignals, locale = "th" } = body;

    if (!question || typeof question !== "string" || question.trim().length < 5) {
      return NextResponse.json(
        { error: "Question must be at least 5 characters." },
        { status: 400 }
      );
    }

    // Crisis Safety Guard: Never generate creative reasons for crisis questions
    const safetyStatus = detectSafety(question);
    if (safetyStatus === "crisis") {
      return NextResponse.json({
        reason:
          locale === "en"
            ? "Your emotional wellbeing is the utmost priority right now."
            : "ความปลอดภัยและความรู้สึกของคุณคือสิ่งที่สำคัญที่สุดในตอนนี้",
      });
    }

    const isEn = locale === "en";

    const systemPrompt = `You are an expert Tarot consultant assisting a client in selecting the optimal tarot spread.
Strict Rules:
1. Provide a single concise sentence (under 120 characters) explaining why spread "${bestSpread}" specifically fits the user's inquiry.
2. DO NOT predict the future or reveal fortune answers.
3. DO NOT change or question the chosen spread.
4. Respond strictly in valid JSON format: { "reason": "your explanation" }.
5. Language: ${isEn ? "English" : "Thai"}.`;

    const userPrompt = `User question: "${question.trim()}"
Selected spread: ${bestSpread}
Detected intent signals: ${Array.isArray(firedSignals) ? firedSignals.join(", ") : "none"}`;

    // Call AI with short timeout (1.5 seconds)
    let aiResponseText: string | null = null;
    try {
      if (process.env.GEMINI_API_KEY) {
        aiResponseText = await callGemini(systemPrompt, userPrompt, 1500);
      } else if (
        process.env.KKU_INTELSPHERE_API_KEY ||
        process.env.KKU_INTELLISHARE_API_KEY
      ) {
        aiResponseText = await callKKUIntelliShare(systemPrompt, userPrompt, 1500);
      }
    } catch {
      // Timeout or offline - will return empty to let client use fallback template
      return NextResponse.json({ reason: null });
    }

    if (!aiResponseText) {
      return NextResponse.json({ reason: null });
    }

    // Parse JSON
    try {
      const parsed = JSON.parse(aiResponseText);
      if (parsed && typeof parsed.reason === "string" && parsed.reason.trim().length > 0) {
        return NextResponse.json({ reason: parsed.reason.trim() });
      }
    } catch {
      // Fallback if not valid JSON
    }

    return NextResponse.json({ reason: null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
