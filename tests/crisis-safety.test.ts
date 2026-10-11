import { describe, it, expect } from "vitest";
import { detectCrisisIntent, CRISIS_RESOURCES } from "@/lib/safety/crisis";

describe("Crisis Safety Detection & Hotline Support (SDD §3, Q-003)", () => {
  describe("detectCrisisIntent (Client-side privacy preserved)", () => {
    it("returns false for regular tarot questions", () => {
      const normalQuestions = [
        "What strengths should I bring forward in my interview?",
        "How can I bring healing and clarity to this connection?",
        "แนวทางการพัฒนาสายงานในอีก 6 เดือนข้างหน้าเป็นอย่างไร?",
        "ฉันควรปรับทัศนคติอย่างไรกับเพื่อนร่วมงาน?",
      ];

      for (const q of normalQuestions) {
        const result = detectCrisisIntent(q);
        expect(result.isCrisis).toBe(false);
      }
    });

    it("detects Thai self-harm/suicide crisis keywords", () => {
      const crisisQuestions = [
        "รู้สึกหมดหวังอยากตาย ทำอย่างไรดี",
        "ถ้าอยากจบชีวิต ไพ่จะบอกอะไร",
        "เครียดจนอยากทำร้ายตัวเอง",
        "คิดเรื่องฆ่าตัวตายบ่อยมาก",
      ];

      for (const q of crisisQuestions) {
        const result = detectCrisisIntent(q);
        expect(result.isCrisis).toBe(true);
        expect(result.matchedKeyword).toBeDefined();
      }
    });

    it("detects English self-harm/suicide crisis keywords", () => {
      const englishCrisis = [
        "I feel like I want to die tonight",
        "Contemplating suicide what do cards say?",
        "How can I stop wanting to end my life?",
        "Suffering from severe self harm urges",
      ];

      for (const q of englishCrisis) {
        const result = detectCrisisIntent(q);
        expect(result.isCrisis).toBe(true);
        expect(result.matchedKeyword).toBeDefined();
      }
    });

    it("handles null, undefined, and empty string safely", () => {
      expect(detectCrisisIntent("").isCrisis).toBe(false);
      expect(detectCrisisIntent(null).isCrisis).toBe(false);
      expect(detectCrisisIntent(undefined).isCrisis).toBe(false);
    });
  });

  describe("CRISIS_RESOURCES configuration (SDD §3, Q-003)", () => {
    it("contains Thai hotline 1323 and Samaritans", () => {
      const thResources = CRISIS_RESOURCES.th;
      expect(thResources.length).toBeGreaterThanOrEqual(2);

      const hotline1323 = thResources.find((r) => r.phone === "1323");
      expect(hotline1323).toBeDefined();
      expect(hotline1323?.name).toContain("สุขภาพจิต");

      const samaritans = thResources.find((r) => r.phone.includes("113-6789"));
      expect(samaritans).toBeDefined();
    });

    it("contains English hotline resources", () => {
      const enResources = CRISIS_RESOURCES.en;
      expect(enResources.length).toBeGreaterThanOrEqual(2);
      expect(enResources.some((r) => r.phone === "1323")).toBe(true);
    });
  });
});
