import { describe, it, expect } from "vitest";
import { generateDeterministicFallback } from "@/lib/ai/fallback";
import { calculateReadingAnalysis } from "@/lib/tarot/analysis";
import type { DrawnCard } from "@/types/tarot";

describe("Deterministic Fallback Engine (SDD §3, §5, D6)", () => {
  const sampleCards: DrawnCard[] = [
    {
      positionIndex: 0,
      positionKey: "past",
      cardId: "fool",
      orientation: "upright",
    },
    {
      positionIndex: 1,
      positionKey: "present",
      cardId: "wands-01",
      orientation: "upright",
    },
    {
      positionIndex: 2,
      positionKey: "future",
      cardId: "swords-10",
      orientation: "reversed",
    },
  ];

  const analysis = calculateReadingAnalysis(sampleCards);

  it("generates structured interpretation adhering to AIInterpretationPayload schema", () => {
    const payload = generateDeterministicFallback({
      question: "What does this new venture hold for me?",
      spreadId: "three-timeline",
      cards: sampleCards,
      analysis,
      locale: "th",
    });

    expect(payload.safety).toBe("none");
    expect(payload.status).toBe("fallback");
    expect(payload.overview).toBeTruthy();
    expect(payload.cards).toHaveLength(3);
    expect(payload.cards[0].cardId).toBe("fool");
    expect(payload.cards[0].positionKey).toBe("past");
    expect(payload.cards[0].interpretation).toContain("The Fool");
    expect(payload.cards[1].cardId).toBe("wands-01");
    expect(payload.cards[2].cardId).toBe("swords-10");
    expect(payload.synthesis).toBeTruthy();
    expect(payload.advice).toBeTruthy();
    expect(payload.reflectionQuestion).toBeTruthy();
  });

  it("generates English interpretation when locale is 'en'", () => {
    const payload = generateDeterministicFallback({
      question: "How can I balance work and creative projects?",
      spreadId: "three-timeline",
      cards: sampleCards,
      analysis,
      locale: "en",
    });

    expect(payload.status).toBe("fallback");
    expect(payload.overview).toContain("Reading for your question");
    expect(payload.cards[0].interpretation).toContain("The Fool");
    expect(payload.cards[0].interpretation).toContain("upright");
    expect(payload.advice).toBeTruthy();
    expect(payload.reflectionQuestion).toBeTruthy();
  });

  it("detects crisis question and sets safety to 'crisis' with supportive advice", () => {
    const payload = generateDeterministicFallback({
      question: "ผมรู้สึกท้อแท้มากจนไม่อยากมีชีวิตอยู่ต่อไปแล้ว",
      spreadId: "three-timeline",
      cards: sampleCards,
      analysis,
      locale: "th",
    });

    expect(payload.safety).toBe("crisis");
    expect(payload.overview).toContain("1323");
    expect(payload.advice).toContain("1323");
  });
});
