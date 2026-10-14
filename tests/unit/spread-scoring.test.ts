import { describe, it, expect } from "vitest";
import { extractSignals } from "@/lib/tarot/spread-lexicon";
import { scoreSpreads } from "@/lib/tarot/spread-scoring";

describe("Spread Recommender Scoring Engine", () => {
  describe("Mathematical properties", () => {
    it("shares always sum to ~100% and never produce NaN", () => {
      const inputs = [
        "",
        "   ",
        "?",
        "งาน",
        "วันนี้ควรทำอย่างไรดี",
        "Should I quit my job or stay in this company?",
        "ความรัก การงาน การเงิน สุขภาพชีวิตในอนาคตข้างหน้าจะเป็นอย่างไรต่อไป มีอุปสรรคอะไรบ้างไหม",
      ];

      for (const input of inputs) {
        const res = scoreSpreads(input);
        expect(Number.isNaN(res.gap)).toBe(false);
        expect(Number.isNaN(res.signalStrength)).toBe(false);
        const sumShare = res.ranked.reduce((s, r) => s + r.share, 0);
        expect(sumShare).toBeGreaterThanOrEqual(99.8);
        expect(sumShare).toBeLessThanOrEqual(100.2);
        res.ranked.forEach((r) => {
          expect(Number.isNaN(r.score)).toBe(false);
          expect(Number.isNaN(r.share)).toBe(false);
          expect(r.share).toBeGreaterThanOrEqual(0);
          expect(r.share).toBeLessThanOrEqual(100);
        });
      }
    });

    it("empty or very short input defaults to three-timeline and is marked ambiguous", () => {
      const res = scoreSpreads("");
      expect(res.best).toBe("three-timeline");
      expect(res.ambiguous).toBe(true);
      expect(res.signalStrength).toBeLessThan(0.3);
    });
  });

  describe("Signal Extraction & Lexicon Tests", () => {
    it("extracts quick signal for single-card requests", () => {
      const s = extractSignals("วันนี้ควรระวังอะไรเป็นพิเศษ");
      expect(s.quick).toBeGreaterThan(0.5);
    });

    it("handles negation correctly - doesn't count negated obstacles", () => {
      const s = extractSignals("ไม่ติดขัดอะไรหรอก แค่อยากรู้ภาพรวม");
      expect(s.obstacle).toBeLessThan(0.3);
    });

    it("handles whitelisted negation (neg: false) like 'ไม่ควร...ไหม'", () => {
      const s = extractSignals("ฉันไม่ควรลาออกไหม");
      expect(s.decision).toBeGreaterThan(0.5);
    });

    it("detects decision and high complexity on multi-domain questions", () => {
      const s = extractSignals(
        "ควรลาออกไปทำธุรกิจหรืออยู่ต่อ แล้วเงินเก็บพอไหม แฟนก็อยากให้ย้าย"
      );
      expect(s.decision).toBeGreaterThan(0.5);
      expect(s.complexity).toBeGreaterThan(0.4);
    });

    it("detects English decision questions", () => {
      const s = extractSignals("should I quit my job or stay");
      expect(s.decision).toBeGreaterThan(0.5);
    });

    it("does not false-positive single token domain words like 'ลูกค้า'", () => {
      const s = extractSignals("ลูกค้าไม่พอใจสินค้า");
      // "ลูกค้า" contains "ลูก" which is family, but m: 'token' should prevent substring matching
      expect(s.complexity).toBeLessThan(0.4);
    });
  });

  describe("Golden Benchmark Test Suite (30+ Real Cases)", () => {
    const cases: Array<{
      q: string;
      expectedBest?: string;
      expectedAmbiguous?: boolean;
      description: string;
    }> = [
      // --- Single Card (quick) ---
      {
        q: "ไพ่ประจำวันสำหรับวันนี้",
        expectedBest: "single",
        description: "Direct daily card request",
      },
      {
        q: "ขอข้อความสั้นๆ ใบเดียวสำหรับตอนนี้",
        expectedBest: "single",
        description: "Explicit one card request",
      },
      {
        q: "one card snapshot for today please",
        expectedBest: "single",
        description: "English single card",
      },
      {
        q: "เช้านี้มีพลังงานอะไรที่ควรระวังบ้าง",
        expectedBest: "single",
        description: "Morning daily focus",
      },

      // --- Three Guidance (Situation · Challenge · Guidance) ---
      {
        q: "ตอนนี้มีปัญหาเรื่องงานติดขัดมาก แก้ไขอย่างไรดี",
        expectedBest: "three-guidance",
        description: "Work obstacle and how to solve",
      },
      {
        q: "ทะเลาะกับเพื่อนร่วมงานบ่อยมาก มีทางออกหรือคำแนะนำยังไง",
        expectedBest: "three-guidance",
        description: "Interpersonal conflict and guidance",
      },
      {
        q: "รู้สึกไปต่อไม่ได้กับโปรเจกต์นี้ ควรรับมือยังไง",
        expectedBest: "three-guidance",
        description: "Stuck in project, seeking coping strategy",
      },
      {
        q: "I feel stuck in my career and need actionable advice",
        expectedBest: "three-guidance",
        description: "English obstacle & advice",
      },
      {
        q: "ทำไมช่วงนี้ถึงเครียดและมีอุปสรรคเยอะจัง จะผ่านไปได้ยังไง",
        expectedBest: "three-guidance",
        description: "Stress & overcoming obstacles",
      },

      // --- Three Timeline (Past · Present · Future) ---
      {
        q: "แนวโน้มความสัมพันธ์ในอีก 3 เดือนข้างหน้าจะเป็นยังไงต่อไป",
        expectedBest: "three-timeline",
        description: "Relationship timeline & future outlook",
      },
      {
        q: "การเงินปีหน้าจะมีทิศทางเป็นอย่างไร",
        expectedBest: "three-timeline",
        description: "Financial direction next year",
      },
      {
        q: "อนาคตของธุรกิจนี้มีแนวโน้มจะพัฒนาไปทางไหน",
        expectedBest: "three-timeline",
        description: "Business evolution trajectory",
      },
      {
        q: "Where is my relationship heading in the next few months?",
        expectedBest: "three-timeline",
        description: "English timeline progression",
      },
      {
        q: "ที่ผ่านมาทำเต็มที่แล้ว ต่อจากนี้จะมีอะไรเกิดขึ้นบ้าง",
        expectedBest: "three-timeline",
        description: "Past efforts to future unfolding",
      },

      // --- Five Path (Deep, complex, crossroads, multi-domain) ---
      {
        q: "ควรลาออกไปทำธุรกิจส่วนตัวหรืออยู่ที่เดิมดี แล้วครอบครัวกับเงินเก็บจะไหวไหม",
        expectedBest: "five-path",
        description: "Major life decision across work, family, money",
      },
      {
        q: "สับสนกับชีวิตมาก ทั้งเรื่องความรักที่คาราคาซัง งานก็หมดไฟ เงินก็ติดลบ อยากเห็นภาพรวมทุกด้าน",
        expectedBest: "five-path",
        description: "Holistic multi-domain crisis across love, work, money",
      },
      {
        q: "กำลังอยู่ที่ทางแยกของชีวิต จะเปลี่ยนสายงานดีไหม หรือเรียนต่อปริญญาโทดี มีทางเลือกหลายทาง",
        expectedBest: "five-path",
        description: "Crossroads with multiple paths and future directions",
      },
      {
        q: "Should I relocate abroad or stay? Weighing career, family obligations, and savings for the long term.",
        expectedBest: "five-path",
        description: "English deep multi-domain crossroad",
      },

      // --- Ambiguous / Boundary Cases ---
      {
        q: "สวัสดีครับ อยากดูดวง",
        expectedAmbiguous: true,
        description: "Very generic greeting with no intent",
      },
      {
        q: "มีเรื่องอยากถาม",
        expectedAmbiguous: true,
        description: "Short phrase with no topic",
      },
      {
        q: "ควรทำยังไงต่อไปในอนาคต",
        expectedBest: "three-timeline",
        description: "Contains strong future/timeline context ('ในอนาคต', 'ต่อไป')",
      },
      {
        q: "เรื่องความรัก",
        expectedAmbiguous: true,
        description: "Broad single-domain topic without question verb",
      },
    ];

    cases.forEach(({ q, expectedBest, expectedAmbiguous, description }) => {
      it(`Case: "${q}" -> ${description}`, () => {
        const res = scoreSpreads(q);
        if (expectedBest) {
          expect(res.best).toBe(expectedBest);
        }
        if (expectedAmbiguous !== undefined) {
          expect(res.ambiguous).toBe(expectedAmbiguous);
        }
      });
    });
  });

  describe("Guided Chip Overrides", () => {
    it("overriding a signal via chip resolves ambiguity immediately", () => {
      const ambiguousQuery = "ความรักกับการงาน";
      const before = scoreSpreads(ambiguousQuery);
      expect(before.ambiguous).toBe(true);

      // User clicks "อยากได้ทางออกแก้ปัญหา" chip (obstacle = 1.0)
      const after = scoreSpreads(ambiguousQuery, { obstacle: 1.0 });

      expect(after.best).toBe("three-guidance");
      expect(after.gap).toBeGreaterThan(15);
      expect(after.ambiguous).toBe(false);
    });

    it("user selecting timeline chip boosts three-timeline", () => {
      const query = "เรื่องงาน";
      const after = scoreSpreads(query, { timeline: 1.0 });

      expect(after.best).toBe("three-timeline");
      expect(after.gap).toBeGreaterThan(15);
    });
  });
});
