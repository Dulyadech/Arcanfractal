import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/draw/route";
import type { DrawApiResponse, ApiErrorResponse } from "@/types/api";

describe("POST /api/draw API Route (SDD §9.1, Q-004)", () => {
  it("successfully creates a 78-card shuffled deck with analysis for valid spread", async () => {
    const request = new Request("http://localhost:3000/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spreadId: "three-timeline",
        reversedEnabled: false,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = (await response.json()) as DrawApiResponse;

    // Check UUID format
    expect(data.drawId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(data.spreadId).toBe("three-timeline");

    // Check deck contains all 78 cards
    expect(data.deck).toHaveLength(78);
    const uniqueCardIds = new Set(data.deck.map((c) => c.cardId));
    expect(uniqueCardIds.size).toBe(78);

    // Reversed is disabled, all cards must be upright
    for (const card of data.deck) {
      expect(card.orientation).toBe("upright");
    }

    // Check analysis object
    expect(data.analysis).toBeDefined();
    expect(typeof data.analysis.majorCount).toBe("number");
    expect(typeof data.analysis.majorRatio).toBe("number");
    expect(Array.isArray(data.analysis.repeatedRanks)).toBe(true);
    expect(Array.isArray(data.analysis.courtCards)).toBe(true);
  });

  it("handles reversedEnabled: true and returns cards with orientations", async () => {
    const request = new Request("http://localhost:3000/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spreadId: "five-path",
        reversedEnabled: true,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = (await response.json()) as DrawApiResponse;
    expect(data.deck).toHaveLength(78);

    const hasUpright = data.deck.some((c) => c.orientation === "upright");
    const hasReversed = data.deck.some((c) => c.orientation === "reversed");

    // Across 78 cards with 50% probability, virtually guaranteed to have both
    expect(hasUpright).toBe(true);
    expect(hasReversed).toBe(true);
  });

  it("returns 400 when spreadId is missing", async () => {
    const request = new Request("http://localhost:3000/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = (await response.json()) as ApiErrorResponse;
    expect(data.code).toBe("INVALID_SPREAD_ID");
    expect(data.error).toContain("Invalid or missing 'spreadId'");
  });

  it("returns 400 when spreadId is invalid", async () => {
    const request = new Request("http://localhost:3000/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spreadId: "celtic-cross-not-in-mvp" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = (await response.json()) as ApiErrorResponse;
    expect(data.code).toBe("INVALID_SPREAD_ID");
  });

  it("returns 400 when reversedEnabled is not a boolean", async () => {
    const request = new Request("http://localhost:3000/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spreadId: "single",
        reversedEnabled: "yes-please",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = (await response.json()) as ApiErrorResponse;
    expect(data.code).toBe("INVALID_REVERSED_ENABLED");
  });

  it("returns 400 on malformed JSON body", async () => {
    const request = new Request("http://localhost:3000/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ broken json",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = (await response.json()) as ApiErrorResponse;
    expect(data.code).toBe("INVALID_JSON");
  });
});
