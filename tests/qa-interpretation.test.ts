import { describe, it, expect } from "vitest";
import { analyzeQuestion } from "@/lib/ai/intent";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompt";
import { generateDeterministicFallback } from "@/lib/ai/fallback";
import { validateAIInterpretation } from "@/lib/ai/validation";
import type { DrawnCard } from "@/types/tarot";
import type { ReadingAnalysis } from "@/types/reading";

describe("Question Resolution & Context-Aware Analysis", () => {
  it("Test 1: Single question ('งานพรุ่งนี้จะเสร็จทันไหม') resolves to 'single'", () => {
    const q = "งานพรุ่งนี้จะเสร็จทันไหม";
    const result = analyzeQuestion(q, "th");

    expect(result.resolution.type).toBe("single");
    expect(result.primary.text).toBe("งานพรุ่งนี้จะเสร็จทันไหม");
    expect(result.primary.intent).toBe("career");
    expect(result.primary.timeframe).toBe("พรุ่งนี้");
    expect(result.followUps).toHaveLength(0);
    expect(result.isMultiQuestion).toBe(false);
    expect(result.original).toBe(q);
  });

  it("Test 2: Conditional follow-up ('งานพรุ่งนี้จะเสร็จทันไหม ถ้าไม่ทันจะเกิดอะไรขึ้น') resolves in single reading", () => {
    const q = "งานพรุ่งนี้จะเสร็จทันไหม ถ้าไม่ทันจะเกิดอะไรขึ้น";
    const result = analyzeQuestion(q, "th");

    expect(result.resolution.type).toBe("conditional_follow_up");
    expect(result.primary.text).toBe("งานพรุ่งนี้จะเสร็จทันไหม");
    expect(result.primary.intent).toBe("career");
    expect(result.primary.timeframe).toBe("พรุ่งนี้");
    expect(result.followUps).toHaveLength(1);
    expect(result.followUps[0].type).toBe("conditional");
    expect(result.followUps[0].condition).toContain("งานพรุ่งนี้ไม่เสร็จทัน");
    expect(result.followUps[0].normalizedQuestion).toContain("งานพรุ่งนี้ไม่เสร็จทัน");
    // Crucial: Must be single reading, NOT split into independent spreads!
    expect(result.isMultiQuestion).toBe(false);
    expect(result.original).toBe(q);
  });

  it("Test 3: Clarifying follow-up ('เขาจะทักมาหาไหม ถ้าทักมาจะคุยกันเรื่องอะไร') resolves in single reading", () => {
    const q = "เขาจะทักมาหาไหม ถ้าทักมาจะคุยกันเรื่องอะไร";
    const result = analyzeQuestion(q, "th");

    expect(["conditional_follow_up", "clarifying_follow_up"]).toContain(result.resolution.type);
    expect(result.primary.text).toBe("เขาจะทักมาหาไหม");
    expect(result.followUps).toHaveLength(1);
    expect(result.followUps[0].condition).toContain("เขาทักมาหา");
    expect(result.followUps[0].normalizedQuestion).toContain("เขาทักมาหา");
    // Crucial: Single reading, one draw
    expect(result.isMultiQuestion).toBe(false);
  });

  it("Test 4: Context resolution ('ถ้าเขาไม่ทักมา ฉันควรทำอย่างไร') clarifies if context missing, answers if present", () => {
    // 4A: Without prior context -> clarify
    const noContext = analyzeQuestion("ถ้าเขาไม่ทักมา ฉันควรทำอย่างไร", "th");
    expect(noContext.resolution.type).toBe("clarify");
    expect(noContext.resolution.missingContext).toBeDefined();

    // 4B: With prior context -> antecedent resolved
    const withContext = analyzeQuestion("ถ้าเขาไม่ทักมา ฉันควรทำอย่างไร", "th", {
      priorQuestion: "เขาจะทักมาไหม",
      subject: "คนคุย",
    });
    expect(withContext.resolution.type).not.toBe("clarify");
  });

  it("Test 5: Independent multi-question ('งานพรุ่งนี้จะเสร็จทันไหม แล้วเดือนหน้าความรักจะเป็นอย่างไร')", () => {
    const q = "งานพรุ่งนี้จะเสร็จทันไหม แล้วเดือนหน้าความรักจะเป็นอย่างไร";
    const result = analyzeQuestion(q, "th");

    expect(result.resolution.type).toBe("independent_multi_question");
    expect(result.primary.text).toBe("งานพรุ่งนี้จะเสร็จทันไหม");
    expect(result.primary.intent).toBe("career");
    expect(result.isMultiQuestion).toBe(true);
    expect(result.scopeNotice).toContain("คำถามนี้มีมากกว่าหนึ่งประเด็นที่ไม่เกี่ยวข้องกัน");
  });

  it("Test 6: Dangling conditional ('ถ้าไม่ทันจะเกิดอะไรขึ้น') triggers clarify without guessing", () => {
    const q = "ถ้าไม่ทันจะเกิดอะไรขึ้น";
    const result = analyzeQuestion(q, "th");

    expect(result.resolution.type).toBe("clarify");
    expect(result.resolution.missingContext).toContain("ไม่ทัน");
    expect(result.resolution.reason).toContain("without an antecedent");
  });
});

describe("Deterministic Fallback Engine - Directional Answers & Follow-Ups", () => {
  const dummyCards: DrawnCard[] = [
    {
      cardId: "hermit", // The Hermit
      positionKey: "past",
      positionIndex: 0,
      orientation: "reversed",
    },
    {
      cardId: "cups-02", // Two of Cups
      positionKey: "present",
      positionIndex: 1,
      orientation: "reversed",
    },
    {
      cardId: "wands-06", // Six of Wands
      positionKey: "future",
      positionIndex: 2,
      orientation: "reversed",
    },
  ];

  const dummyAnalysis: ReadingAnalysis = {
    majorCount: 1,
    majorRatio: 1 / 3,
    dominantElement: "water",
    repeatedRanks: [],
    courtCards: [],
    reversedRatio: 1.0, // all reversed -> likely_no
  };

  it("answers primary question directly with direction first (e.g. 'มีแนวโน้มว่าจะไม่ทันตามกำหนดเดิม')", () => {
    const question = "งานพรุ่งนี้จะเสร็จทันไหม ถ้าไม่ทันจะเกิดอะไรขึ้น";
    const result = generateDeterministicFallback({
      question,
      spreadId: "three-timeline",
      cards: dummyCards,
      analysis: dummyAnalysis,
      locale: "th",
    });

    // 1. Direct answer must be directional, NOT just generic advice
    expect(result.answer).toBeDefined();
    expect(result.answer?.primary.direction).toBe("likely_no");
    expect(result.answer?.primary.text).toBe("มีแนวโน้มว่าจะไม่ทันตามกำหนดเดิม");
    expect(result.answer?.primary.evidenceCardIds).toContain("wands-06");

    // 2. Conditional follow-up answered using the SAME card spread (no new draw)
    expect(result.answer?.followUps).toHaveLength(1);
    expect(result.answer?.followUps?.[0].answer).toContain("หากงานพรุ่งนี้ไม่เสร็จทัน");
    expect(result.answer?.followUps?.[0].evidenceCardIds).toContain("wands-06");

    // 3. directAnswer string combines primary direction then conditional answer
    expect(result.directAnswer).toContain("มีแนวโน้มว่าจะไม่ทันตามกำหนดเดิม");
    expect(result.directAnswer).toContain("หากงานพรุ่งนี้ไม่เสร็จทัน");

    // 4. Advice is distinct from directAnswer
    expect(result.advice).toBeDefined();
    expect(result.advice).not.toBe(result.directAnswer);

    // 5. Structure preserves original question
    expect(result.originalQuestion).toBe(question);
    expect(result.questionAnalysis?.original).toBe(question);
    expect(result.questionAnalysis?.resolution.type).toBe("conditional_follow_up");
  });

  it("handles dangling inquiry with clarification prompt without guessing", () => {
    const question = "ถ้าไม่ทันจะเกิดอะไรขึ้น";
    const result = generateDeterministicFallback({
      question,
      spreadId: "three-timeline",
      cards: dummyCards,
      analysis: dummyAnalysis,
      locale: "th",
    });

    expect(result.questionAnalysis?.resolution.type).toBe("clarify");
    expect(result.clarificationPrompt).toBeDefined();
    expect(result.directAnswer).toContain("คำถามยังขาดบริบทตั้งต้นที่ชัดเจน");
  });

  it("delivers English directional answer and follow-up correctly", () => {
    const question = "Will the work be finished tomorrow on time? If not, what will happen?";
    const result = generateDeterministicFallback({
      question,
      spreadId: "three-timeline",
      cards: dummyCards,
      analysis: dummyAnalysis,
      locale: "en",
    });

    expect(result.answer?.primary.direction).toBe("likely_no");
    expect(result.answer?.primary.text).toContain("It is likely that it will not be finished on time");
    expect(result.answer?.followUps?.[0].answer).toContain("If the work tomorrow is not finished on time");
    expect(result.directAnswer).toContain("Primary Answer:");
    expect(result.directAnswer).toContain("Conditional Follow-up");
  });
});

describe("AI Interpretation Validation with Directional Schema", () => {
  const drawnCards: DrawnCard[] = [
    { cardId: "fool", positionKey: "message", positionIndex: 0, orientation: "upright" },
  ];

  it("validates valid payload containing answer.primary with evidence cards", () => {
    const validJson = {
      safety: "none",
      originalQuestion: "งานจะเสร็จไหม",
      questionIntent: "career",
      questionScope: "งานและการจัดการ",
      directAnswer: "คำตอบหลัก: มีแนวโน้มว่าจะเสร็จทันตามกำหนด",
      answer: {
        primary: {
          direction: "likely_yes",
          text: "มีแนวโน้มว่าจะเสร็จทันตามกำหนด",
          evidenceCardIds: ["fool"],
        },
      },
      confidence: "ไพ่สะท้อนแนวโน้มพลังงานในปัจจุบัน",
      overview: "การอ่านไพ่สำหรับงานจะเสร็จไหม",
      cards: [
        {
          cardId: "fool",
          positionKey: "message",
          meaningInContext: "The Fool ชี้ถึงการเริ่มต้นที่สดใส",
          contributionToAnswer: "เป็นหลักฐานว่ามีโอกาสสำเร็จ",
          interpretation: "ไพ่ The Fool ชี้ถึงการเริ่มต้นที่สดใสและสำเร็จ",
        },
      ],
      synthesis: "พลังงานสอดคล้องกับการเริ่มต้น",
      advice: "ก้าวไปข้างหน้าอย่างมั่นใจ",
      reflectionQuestion: "อะไรคือเป้าหมายสำคัญ?",
      conclusion: "โดยสรุป งานมีแนวโน้มสำเร็จ",
    };

    const validation = validateAIInterpretation(validJson, drawnCards);
    expect(validation.valid).toBe(true);
    if (validation.valid) {
      expect(validation.payload.answer?.primary.direction).toBe("likely_yes");
      expect(validation.payload.answer?.primary.evidenceCardIds).toEqual(["fool"]);
    }
  });

  it("rejects payload if evidenceCardIds references an undrawn card", () => {
    const invalidJson = {
      safety: "none",
      originalQuestion: "งานจะเสร็จไหม",
      directAnswer: "คำตอบหลัก: สำเร็จ",
      answer: {
        primary: {
          direction: "likely_yes",
          text: "สำเร็จ",
          evidenceCardIds: ["the-tower"], // Undrawn!
        },
      },
      overview: "ภาพรวม",
      cards: [
        {
          cardId: "fool",
          positionKey: "message",
          interpretation: "The Fool",
        },
      ],
      synthesis: "สังเคราะห์",
      advice: "คำแนะนำ",
      reflectionQuestion: "คำถาม",
    };

    const validation = validateAIInterpretation(invalidJson, drawnCards);
    expect(validation.valid).toBe(false);
    if (!validation.valid) {
      expect(validation.reason).toContain("Evidence card ID 'the-tower' is not among the drawn cards");
    }
  });
});
