import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST as drawHandler } from "@/app/api/draw/route";
import { POST as interpretHandler } from "@/app/api/interpret/route";
import { clearDrawSessions } from "@/lib/tarot";
import { getSpreadDefinition } from "@/data/spreads";
import type { DrawApiResponse, ApiErrorResponse } from "@/types/api";
import type { AIInterpretationPayload } from "@/types/ai";
import type { DrawnCard } from "@/types/tarot";

describe("POST /api/interpret (SDD §9.2, §5)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    clearDrawSessions();
    // Isolate tests from external network calls by default
    delete process.env.KKU_INTELLISHARE_API_KEY;
    delete process.env.GEMINI_API_KEY;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  async function performDraw(spreadId: string = "three-timeline", reversedEnabled: boolean = true) {
    const drawReq = new Request("http://localhost:3000/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spreadId, reversedEnabled }),
    });

    const drawRes = await drawHandler(drawReq);
    expect(drawRes.status).toBe(200);
    return (await drawRes.json()) as DrawApiResponse;
  }

  it("successfully interprets a valid reading session and returns AIInterpretationPayload (Fallback Engine)", async () => {
    const drawData = await performDraw("three-timeline", true);
    const spreadDef = getSpreadDefinition("three-timeline");

    const cards: DrawnCard[] = drawData.deck.slice(0, spreadDef.cardCount).map((card, idx) => ({
      positionIndex: idx,
      positionKey: spreadDef.positions[idx].key,
      cardId: card.cardId,
      orientation: card.orientation,
    }));

    const interpretReq = new Request("http://localhost:3000/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drawId: drawData.drawId,
        question: "What mindset should I cultivate during my career transition?",
        spreadId: "three-timeline",
        cards,
        analysis: drawData.analysis,
        locale: "th",
      }),
    });

    const interpretRes = await interpretHandler(interpretReq);
    expect(interpretRes.status).toBe(200);

    const payload = (await interpretRes.json()) as AIInterpretationPayload;
    expect(payload.overview).toBeTruthy();
    expect(payload.cards).toHaveLength(3);
    expect(payload.cards[0].cardId).toBe(cards[0].cardId);
    expect(payload.cards[0].positionKey).toBe("past");
    expect(payload.synthesis).toBeTruthy();
    expect(payload.advice).toBeTruthy();
    expect(payload.reflectionQuestion).toBeTruthy();
    expect(["none", "sensitive", "crisis"]).toContain(payload.safety);
  });

  it("successfully interprets via simulated AI provider when structured JSON is returned", async () => {
    process.env.KKU_INTELLISHARE_API_KEY = "mock-kku-key";

    const drawData = await performDraw("single", false);
    const cardId = drawData.deck[0].cardId;

    const mockAiResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              safety: "none",
              overview: "Empowering breakthrough energy for your current journey.",
              cards: [
                {
                  cardId,
                  positionKey: "message",
                  interpretation: "This card invites you to act with clarity and focused purpose.",
                },
              ],
              synthesis: "Action-oriented alignment with personal goals.",
              advice: "Take one clear, decisive step today.",
              reflectionQuestion: "What is your main priority right now?",
            }),
          },
        },
      ],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockAiResponse,
    } as Response);

    const cards: DrawnCard[] = [
      {
        positionIndex: 0,
        positionKey: "message",
        cardId,
        orientation: drawData.deck[0].orientation,
      },
    ];

    const interpretReq = new Request("http://localhost:3000/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drawId: drawData.drawId,
        question: "How can I succeed in my next milestone?",
        spreadId: "single",
        cards,
        analysis: drawData.analysis,
        locale: "en",
      }),
    });

    const interpretRes = await interpretHandler(interpretReq);
    expect(interpretRes.status).toBe(200);

    const payload = (await interpretRes.json()) as AIInterpretationPayload;
    expect(payload.status).toBe("complete");
    expect(payload.overview).toBe("Empowering breakthrough energy for your current journey.");
    expect(payload.cards[0].cardId).toBe(cardId);
  });

  it("successfully generates English interpretation when locale is 'en'", async () => {
    const drawData = await performDraw("single", false);
    const spreadDef = getSpreadDefinition("single");

    const cards: DrawnCard[] = [
      {
        positionIndex: 0,
        positionKey: spreadDef.positions[0].key,
        cardId: drawData.deck[0].cardId,
        orientation: drawData.deck[0].orientation,
      },
    ];

    const interpretReq = new Request("http://localhost:3000/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drawId: drawData.drawId,
        question: "What is the primary message for today?",
        spreadId: "single",
        cards,
        analysis: drawData.analysis,
        locale: "en",
      }),
    });

    const interpretRes = await interpretHandler(interpretReq);
    expect(interpretRes.status).toBe(200);

    const payload = (await interpretRes.json()) as AIInterpretationPayload;
    expect(payload.cards).toHaveLength(1);
    expect(payload.overview).toContain("Reading for your question");
  });

  it("rejects request when question is too short (< 5 chars)", async () => {
    const drawData = await performDraw("single", false);
    const cards: DrawnCard[] = [
      {
        positionIndex: 0,
        positionKey: "message",
        cardId: drawData.deck[0].cardId,
        orientation: drawData.deck[0].orientation,
      },
    ];

    const interpretReq = new Request("http://localhost:3000/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drawId: drawData.drawId,
        question: "Hi?", // 3 chars
        spreadId: "single",
        cards,
      }),
    });

    const interpretRes = await interpretHandler(interpretReq);
    expect(interpretRes.status).toBe(400);

    const err = (await interpretRes.json()) as ApiErrorResponse;
    expect(err.code).toBe("INVALID_QUESTION_LENGTH");
  });

  it("rejects request when card orientation is forged (Server Invariant Guard)", async () => {
    const drawData = await performDraw("single", true);
    const originalOrientation = drawData.deck[0].orientation;
    const forgedOrientation = originalOrientation === "upright" ? "reversed" : "upright";

    const cards: DrawnCard[] = [
      {
        positionIndex: 0,
        positionKey: "message",
        cardId: drawData.deck[0].cardId,
        orientation: forgedOrientation,
      },
    ];

    const interpretReq = new Request("http://localhost:3000/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drawId: drawData.drawId,
        question: "Will my project succeed?",
        spreadId: "single",
        cards,
      }),
    });

    const interpretRes = await interpretHandler(interpretReq);
    expect(interpretRes.status).toBe(400);

    const err = (await interpretRes.json()) as ApiErrorResponse;
    expect(err.code).toBe("CARD_ORIENTATION_MISMATCH");
  });

  it("returns 400 on malformed JSON body", async () => {
    const req = new Request("http://localhost:3000/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ not valid json",
    });

    const res = await interpretHandler(req);
    expect(res.status).toBe(400);
    const err = (await res.json()) as ApiErrorResponse;
    expect(err.code).toBe("INVALID_JSON");
  });
});
