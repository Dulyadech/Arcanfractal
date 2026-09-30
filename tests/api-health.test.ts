import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GET as healthHandler } from "@/app/api/health/route";
import { saveDrawSession, clearDrawSessions, createShuffledDeck } from "@/lib/tarot";
import type { HealthApiResponse } from "@/types/api";

describe("GET /api/health (SDD §9.3)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    clearDrawSessions();
    delete process.env.KKU_INTELLISHARE_API_KEY;
    delete process.env.GEMINI_API_KEY;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("returns 200 and reports correct health payload structure when AI keys are unconfigured", async () => {
    const req = new Request("http://localhost:3000/api/health?quick=true");
    const res = await healthHandler(req);

    expect(res.status).toBe(200);
    const data = (await res.json()) as HealthApiResponse;

    expect(data.status).toBe("degraded");
    expect(data.services.tarotEngine.status).toBe("ok");
    expect(data.services.tarotEngine.catalogCardsCount).toBe(78);
    expect(data.services.tarotEngine.activeDrawSessions).toBe(0);

    expect(data.services.aiProviders.primary.status).toBe("unconfigured");
    expect(data.services.aiProviders.primary.name).toBe("KKU IntelliShare");
    expect(data.services.aiProviders.backup.status).toBe("unconfigured");
    expect(data.services.aiProviders.backup.name).toBe("Google Gemini");
    expect(data.services.aiProviders.fallbackEngine.status).toBe("ok");
  });

  it("reflects active draw sessions count correctly", async () => {
    const deck = createShuffledDeck({ reversedEnabled: false });
    saveDrawSession({
      drawId: "health-test-draw-1",
      spreadId: "single",
      reversedEnabled: false,
      deck,
      createdAt: Date.now(),
    });

    const req = new Request("http://localhost:3000/api/health?quick=true");
    const res = await healthHandler(req);
    const data = (await res.json()) as HealthApiResponse;

    expect(data.services.tarotEngine.activeDrawSessions).toBe(1);
  });

  it("reports 'ok' overall status when an AI provider is healthy", async () => {
    process.env.KKU_INTELLISHARE_API_KEY = "test-kku-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    } as Response);

    const req = new Request("http://localhost:3000/api/health");
    const res = await healthHandler(req);
    const data = (await res.json()) as HealthApiResponse;

    expect(res.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.services.aiProviders.primary.status).toBe("healthy");
    expect(data.services.aiProviders.primary.latencyMs).toBeTypeOf("number");
  });

  it("skips live network check when quick=true query param is passed", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";

    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const req = new Request("http://localhost:3000/api/health?quick=true");
    const res = await healthHandler(req);
    const data = (await res.json()) as HealthApiResponse;

    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(data.status).toBe("ok");
    expect(data.services.aiProviders.backup.status).toBe("healthy");
  });
});
