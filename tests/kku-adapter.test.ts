import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { callKKUIntelliShare } from "@/lib/ai/providers/kku";
import { interpretTarotSpread } from "@/lib/ai/adapter";
import { calculateReadingAnalysis } from "@/lib/tarot";
import type { DrawnCard } from "@/types/tarot";

describe("KKU IntelliShare Provider Adapter (SDD §7, §7.1)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

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

  const analysis = calculateReadingAnalysis(sampleCards);

  describe("callKKUIntelliShare direct calls", () => {
    it("throws an error when KKU_INTELLISHARE_API_KEY is missing", async () => {
      delete process.env.KKU_INTELLISHARE_API_KEY;

      await expect(callKKUIntelliShare("system", "user")).rejects.toThrow(
        "KKU_INTELLISHARE_API_KEY is not configured"
      );
    });

    it("sends request with OpenAI-compatible headers and payload", async () => {
      process.env.KKU_INTELLISHARE_API_KEY = "test-kku-secret-key";
      process.env.KKU_INTELLISHARE_BASE_URL = "https://intellishare.kku.ac.th/v1";
      process.env.KKU_INTELLISHARE_MODEL = "gpt-4o-mini";

      let capturedUrl = "";
      let capturedHeaders: HeadersInit | undefined;
      let capturedBody: string | undefined;

      vi.spyOn(globalThis, "fetch").mockImplementationOnce(async (url, init) => {
        capturedUrl = String(url);
        capturedHeaders = init?.headers;
        capturedBody = init?.body as string;

        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{ message: { content: '{"status":"ok"}' } }],
          }),
        } as Response;
      });

      const result = await callKKUIntelliShare("System instruction", "User query");

      expect(result).toBe('{"status":"ok"}');
      expect(capturedUrl).toBe("https://intellishare.kku.ac.th/v1/chat/completions");
      expect((capturedHeaders as Record<string, string>)["Authorization"]).toBe(
        "Bearer test-kku-secret-key"
      );
      expect((capturedHeaders as Record<string, string>)["Content-Type"]).toBe(
        "application/json"
      );

      const parsedBody = JSON.parse(capturedBody || "{}");
      expect(parsedBody.model).toBe("gpt-4o-mini");
      expect(parsedBody.messages).toHaveLength(2);
      expect(parsedBody.messages[0].content).toBe("System instruction");
      expect(parsedBody.messages[1].content).toBe("User query");
      expect(parsedBody.response_format).toEqual({ type: "json_object" });
    });

    it("retries without response_format if the gateway rejects it with 400", async () => {
      process.env.KKU_INTELLISHARE_API_KEY = "test-kku-key";

      const fetchSpy = vi.spyOn(globalThis, "fetch");

      // First attempt: 400 error indicating response_format not supported
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 400,
        clone: () => ({
          text: async () => "error: response_format is not supported by this model",
        }),
        text: async () => "error: response_format is not supported by this model",
      } as Response);

      // Second attempt: 200 success without response_format
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: '{"recovered":true}' } }],
        }),
      } as Response);

      const result = await callKKUIntelliShare("System", "User");
      expect(result).toBe('{"recovered":true}');
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      // Check second request did not have response_format
      const secondCallBody = JSON.parse(fetchSpy.mock.calls[1][1]?.body as string);
      expect(secondCallBody.response_format).toBeUndefined();
    });

    it("throws when gateway returns 500 error", async () => {
      process.env.KKU_INTELLISHARE_API_KEY = "test-kku-key";

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error in KKU cluster",
      } as Response);

      await expect(callKKUIntelliShare("System", "User")).rejects.toThrow(
        "KKU IntelliShare responded with status 500: Internal Server Error in KKU cluster"
      );
    });
  });

  describe("interpretTarotSpread integration with KKU IntelliShare", () => {
    it("successfully receives structured JSON and returns complete payload", async () => {
      process.env.KKU_INTELLISHARE_API_KEY = "mock-key";
      delete process.env.GEMINI_API_KEY;

      const validJsonResponse = {
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

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(validJsonResponse) } }],
        }),
      } as Response);

      const payload = await interpretTarotSpread({
        question: "How will my next career step unfold?",
        spreadId: "three-timeline",
        cards: sampleCards,
        analysis,
        locale: "th",
      });

      expect(payload.status).toBe("complete");
      expect(payload.overview).toBe(validJsonResponse.overview);
      expect(payload.cards).toHaveLength(3);
      expect(payload.cards[0].cardId).toBe("fool");
      expect(payload.cards[1].cardId).toBe("magician");
      expect(payload.cards[2].cardId).toBe("wands-01");
      expect(payload.synthesis).toBe(validJsonResponse.synthesis);
      expect(payload.advice).toBe(validJsonResponse.advice);
      expect(payload.reflectionQuestion).toBe(validJsonResponse.reflectionQuestion);
    });

    it("correctly extracts JSON when KKU model wraps response in markdown code blocks", async () => {
      process.env.KKU_INTELLISHARE_API_KEY = "mock-key";
      delete process.env.GEMINI_API_KEY;

      const wrappedResponse = `Here is your interpretation:
\`\`\`json
{
  "safety": "none",
  "overview": "Clear overview.",
  "cards": [
    { "cardId": "fool", "positionKey": "past", "interpretation": "Fool card." },
    { "cardId": "magician", "positionKey": "present", "interpretation": "Magician card." },
    { "cardId": "wands-01", "positionKey": "future", "interpretation": "Wands card." }
  ],
  "synthesis": "Strong synthesis.",
  "advice": "Clear advice.",
  "reflectionQuestion": "Deep question?"
}
\`\`\``;

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: wrappedResponse } }],
        }),
      } as Response);

      const payload = await interpretTarotSpread({
        question: "How will my project go?",
        spreadId: "three-timeline",
        cards: sampleCards,
        analysis,
        locale: "th",
      });

      expect(payload.status).toBe("complete");
      expect(payload.overview).toBe("Clear overview.");
      expect(payload.cards).toHaveLength(3);
    });

    it("triggers self-repair when initial output mentions an undrawn card", async () => {
      process.env.KKU_INTELLISHARE_API_KEY = "mock-key";
      delete process.env.GEMINI_API_KEY;

      const fetchSpy = vi.spyOn(globalThis, "fetch");

      // 1. Initial output has hallucinated "The Tower" (undrawn)
      const hallucinatedOutput = {
        safety: "none",
        overview: "The Fool starts your journey, but The Tower brings sudden ruin.", // The Tower is undrawn!
        cards: [
          { "cardId": "fool", "positionKey": "past", "interpretation": "Fool card." },
          { "cardId": "magician", "positionKey": "present", "interpretation": "Magician card." },
          { "cardId": "wands-01", "positionKey": "future", "interpretation": "Wands card." }
        ],
        synthesis: "Chaos and order.",
        advice: "Be prepared.",
        reflectionQuestion: "What must you let go of?"
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(hallucinatedOutput) } }],
        }),
      } as Response);

      // 2. Self-repair output corrects the hallucination
      const repairedOutput = {
        safety: "none",
        overview: "The Fool starts your journey with pure optimism and trust.",
        cards: [
          { "cardId": "fool", "positionKey": "past", "interpretation": "Fool card." },
          { "cardId": "magician", "positionKey": "present", "interpretation": "Magician card." },
          { "cardId": "wands-01", "positionKey": "future", "interpretation": "Wands card." }
        ],
        synthesis: "Creative alignment.",
        advice: "Step forward.",
        reflectionQuestion: "What is your intention?"
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(repairedOutput) } }],
        }),
      } as Response);

      const payload = await interpretTarotSpread({
        question: "How will my project go?",
        spreadId: "three-timeline",
        cards: sampleCards,
        analysis,
        locale: "th",
      });

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(payload.status).toBe("complete");
      expect(payload.overview).toBe(repairedOutput.overview);
    });
  });

  // Optional Live Test against real KKU IntelliShare API if key is present in environment
  it.runIf(Boolean(process.env.KKU_INTELLISHARE_API_KEY))(
    "LIVE: connects to actual KKU IntelliShare and returns structured JSON",
    async () => {
      const payload = await interpretTarotSpread({
        question: "What lesson does this moment offer?",
        spreadId: "three-timeline",
        cards: sampleCards,
        analysis,
        locale: "th",
      });

      expect(payload.overview).toBeTruthy();
      expect(payload.cards).toHaveLength(3);
      expect(payload.synthesis).toBeTruthy();
      expect(payload.advice).toBeTruthy();
      expect(payload.reflectionQuestion).toBeTruthy();
      expect(["complete", "fallback"]).toContain(payload.status);
    },
    15000
  );
});
