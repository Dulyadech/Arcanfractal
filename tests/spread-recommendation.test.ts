import { describe, it, expect } from "vitest";
import { getSpreadRecommendation } from "@/lib/tarot/spread-recommendation";

describe("Question to Spread Recommendation Engine (SDD §4.5, §6.2)", () => {
  it("maps timeline / future evolution questions to 'three-timeline'", () => {
    const questions = [
      "อนาคตการงานของฉันจะเป็นอย่างไรต่อไป?",
      "ความสัมพันธ์ของเราจะมีแนวโน้มพัฒนาอย่างไรในเดือนหน้า?",
      "What does the future hold for my startup ahead?",
    ];

    questions.forEach((q) => {
      const rec = getSpreadRecommendation(q, "th");
      expect(rec.spreadId).toBe("three-timeline");
      expect(rec.keyThemes.length).toBeGreaterThan(0);
    });
  });

  it("maps decisions, dilemmas, and obstacle handling to 'three-guidance'", () => {
    const questions = [
      "ฉันควรลาออกจากงานประจำมาทำธุรกิจดีไหม?",
      "ตอนนี้ติดปัญหาเรื่องการสื่อสารกับทีม ควรแก้ปัญหาอย่างไร?",
      "Should I accept the new job offer or stay in my current position?",
    ];

    questions.forEach((q) => {
      const rec = getSpreadRecommendation(q, "th");
      expect(rec.spreadId).toBe("three-guidance");
      expect(rec.keyThemes.length).toBeGreaterThan(0);
    });
  });

  it("maps daily / quick essence inquiries to 'single'", () => {
    const questions = [
      "สารนำทางสำหรับวันนี้คืออะไร?",
      "วันนี้มีพลังงานอะไรที่ควรระวัง?",
      "What is my daily guidance snapshot for today?",
    ];

    questions.forEach((q) => {
      const rec = getSpreadRecommendation(q, "th");
      expect(rec.spreadId).toBe("single");
      expect(rec.keyThemes.length).toBeGreaterThan(0);
    });
  });

  it("maps multifaceted / deep crossroads inquiries to 'five-path'", () => {
    const questions = [
      "การเปลี่ยนผ่านชีวิตและเส้นทางชีวิตในระยะยาวของฉันกำลังมุ่งหน้าไปในทิศทางใด?",
      "ฉันกำลังอยู่ที่ทางแยกชีวิตเรื่องความสัมพันธ์และครอบครัว อยากวิเคราะห์ภาพรวมรอบด้านอย่างลึกซึ้ง",
      "I am at a deep crossroad regarding my holistic life path, career transformation and purpose?",
    ];

    questions.forEach((q) => {
      const rec = getSpreadRecommendation(q, "th");
      expect(rec.spreadId).toBe("five-path");
      expect(rec.keyThemes.length).toBeGreaterThan(0);
    });
  });

  it("provides localized reasons in English when locale is 'en'", () => {
    const rec = getSpreadRecommendation("Should I make this decision today?", "en");
    expect(rec.spreadId).toBe("three-guidance");
    expect(rec.badgeText).toBe("Decision & Clarity");
    expect(rec.reason).toContain("decision");
  });
});
