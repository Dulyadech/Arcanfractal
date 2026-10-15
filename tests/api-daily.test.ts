import { describe, it, expect } from "vitest";
import { GET, POST } from "@/app/api/daily/route";
import type { DailyCardRecord } from "@/types/daily";

describe("Daily Card API Route (/api/daily)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.KKU_INTELSPHERE_API_KEY;
    delete process.env.KKU_INTELLISHARE_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("GET /api/daily", () => {
    it("returns a random daily card with Thai interpretation by default", async () => {
      const request = new Request("http://localhost:3000/api/daily", {
        method: "GET",
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = (await response.json()) as DailyCardRecord;
      expect(data.id).toMatch(/^daily-\d{4}-\d{2}-\d{2}-/);
      expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(data.card).toBeDefined();
      expect(data.card.cardId).toBeDefined();
      expect(data.theme.length).toBeGreaterThan(0);
      expect(data.affirmation.length).toBeGreaterThan(0);
      expect(data.advice.length).toBeGreaterThan(0);
      expect(data.locale).toBe("th");
      expect(data.interpretations?.th).toBeDefined();
      expect(data.interpretations?.en).toBeDefined();
    });

    it("supports locale=en query parameter", async () => {
      const request = new Request("http://localhost:3000/api/daily?locale=en", {
        method: "GET",
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = (await response.json()) as DailyCardRecord;
      expect(data.locale).toBe("en");
      expect(data.theme).toBe(data.interpretations?.en.theme);
    });

    it("allows requesting a specific card and orientation", async () => {
      const request = new Request(
        "http://localhost:3000/api/daily?cardId=fool&orientation=upright&locale=th",
        { method: "GET" }
      );

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = (await response.json()) as DailyCardRecord;
      expect(data.card.cardId).toBe("fool");
      expect(data.card.orientation).toBe("upright");
      expect(data.theme).toBe("จุดเริ่มต้นใหม่และความไว้วางใจ");
      expect(data.affirmation).toBe("ฉันเปิดรับการเริ่มต้นใหม่ด้วยความอยากรู้และหัวใจที่เปิดกว้าง");
    });

    it("returns 400 when an invalid cardId is requested", async () => {
      const request = new Request("http://localhost:3000/api/daily?cardId=invalid-card", {
        method: "GET",
      });

      const response = await GET(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.code).toBe("INVALID_CARD_ID");
    });
  });

  describe("POST /api/daily", () => {
    it("returns daily card interpretation for valid body payload", async () => {
      const request = new Request("http://localhost:3000/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: "sun",
          orientation: "upright",
          locale: "th",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = (await response.json()) as DailyCardRecord;
      expect(data.card.cardId).toBe("sun");
      expect(data.theme).toBe("ความสดใส พลังชีวิต และความสุขเปี่ยมล้น");
      expect(data.affirmation).toBe("ฉันเปล่งประกายความอบอุ่น พลังชีวิต และความสุขที่แท้จริงในทุกย่างก้าว");
    });

    it("handles reversed card orientation properly", async () => {
      const request = new Request("http://localhost:3000/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: "tower",
          orientation: "reversed",
          locale: "th",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const data = (await response.json()) as DailyCardRecord;
      expect(data.card.cardId).toBe("tower");
      expect(data.card.orientation).toBe("reversed");
      expect(data.theme).toBe("การฟื้นตัวและการรื้อสร้างอย่างปลอดภัย");
    });
  });
});
