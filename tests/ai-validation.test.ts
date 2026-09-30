import { describe, it, expect } from "vitest";
import { validateAIInterpretation, extractJsonFromText } from "@/lib/ai/validation";
import type { DrawnCard } from "@/types/tarot";

describe("AI Output Validation & Zero Hallucination Guard (SDD §5, §5.1)", () => {
  const drawnCards: DrawnCard[] = [
    {
      positionIndex: 0,
      positionKey: "past",
      cardId: "fool",
      orientation: "upright",
    },
    {
      positionIndex: 1,
      positionKey: "present",
      cardId: "magician",
      orientation: "upright",
    },
    {
      positionIndex: 2,
      positionKey: "future",
      cardId: "wands-01",
      orientation: "upright",
    },
  ];

  it("passes valid structured AI interpretation", () => {
    const validData = {
      safety: "none",
      overview: "A journey of pure potential beginning with The Fool.",
      cards: [
        {
          cardId: "fool",
          positionKey: "past",
          interpretation: "The Fool marks a brave leap of faith.",
        },
        {
          cardId: "magician",
          positionKey: "present",
          interpretation: "The Magician provides mastery and agency.",
        },
        {
          cardId: "wands-01",
          positionKey: "future",
          interpretation: "Ace of Wands ignites a fiery new spark.",
        },
      ],
      synthesis: "A powerful combination moving from innocence to creation.",
      advice: "Take practical action while staying open to the unknown.",
      reflectionQuestion: "What is your next bold step?",
    };

    const result = validateAIInterpretation(validData, drawnCards);
    expect(result.valid).toBe(true);
  });

  it("fails when an undrawn Minor Arcana card is hallucinated into text", () => {
    const hallucinatedData = {
      safety: "none",
      overview: "A journey beginning with The Fool.",
      cards: [
        {
          cardId: "fool",
          positionKey: "past",
          interpretation: "The Fool marks a brave leap of faith.",
        },
        {
          cardId: "magician",
          positionKey: "present",
          interpretation:
            "The Magician reminds us of the Three of Swords which brings heartbreak.", // Three of Swords was NOT drawn!
        },
        {
          cardId: "wands-01",
          positionKey: "future",
          interpretation: "Ace of Wands ignites a fiery new spark.",
        },
      ],
      synthesis: "Creation and intention.",
      advice: "Stay grounded.",
      reflectionQuestion: "How will you direct this spark?",
    };

    const result = validateAIInterpretation(hallucinatedData, drawnCards);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("Zero Hallucination");
      expect(result.reason).toContain("Three of Swords");
    }
  });

  it("fails when an undrawn Major Arcana card is hallucinated into text", () => {
    const hallucinatedData = {
      safety: "none",
      overview: "A journey beginning with The Fool and The Tower brings sudden collapse.", // The Tower was NOT drawn!
      cards: [
        {
          cardId: "fool",
          positionKey: "past",
          interpretation: "The Fool marks a brave leap.",
        },
        {
          cardId: "magician",
          positionKey: "present",
          interpretation: "The Magician channels energy.",
        },
        {
          cardId: "wands-01",
          positionKey: "future",
          interpretation: "Ace of Wands brings inspiration.",
        },
      ],
      synthesis: "Great power.",
      advice: "Be vigilant.",
      reflectionQuestion: "What foundation needs attention?",
    };

    const result = validateAIInterpretation(hallucinatedData, drawnCards);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("Zero Hallucination");
      expect(result.reason).toContain("The Tower");
    }
  });

  it("does not false-trigger on regular English words like 'strength'", () => {
    const naturalTextData = {
      safety: "none",
      overview: "You possess remarkable inner strength to overcome current obstacles.", // word "strength", NOT "The Strength" card
      cards: [
        {
          cardId: "fool",
          positionKey: "past",
          interpretation: "The Fool brings trust.",
        },
        {
          cardId: "magician",
          positionKey: "present",
          interpretation: "The Magician focuses your will.",
        },
        {
          cardId: "wands-01",
          positionKey: "future",
          interpretation: "Ace of Wands fuels your drive.",
        },
      ],
      synthesis: "Courage and will.",
      advice: "Rely on your inner resilience.",
      reflectionQuestion: "Where do you draw your courage from?",
    };

    const result = validateAIInterpretation(naturalTextData, drawnCards);
    expect(result.valid).toBe(true);
  });

  it("extracts JSON correctly from markdown code fences", () => {
    const fenced = "```json\n{\"safety\": \"none\", \"overview\": \"test\"}\n```";
    const parsed = extractJsonFromText(fenced) as Record<string, string>;
    expect(parsed?.safety).toBe("none");
    expect(parsed?.overview).toBe("test");
  });
});
