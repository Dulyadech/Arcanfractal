import type { SpreadId } from "@/types/spread";
import { SPREADS } from "@/data/spreads";
import { scoreSpreads, type ScoreResult, type GuidedChip } from "./spread-scoring";
import type { Signal } from "./spread-lexicon";

export interface SpreadRecommendation {
  spreadId: SpreadId;
  spreadName: string;
  badgeText: string;
  reason: string;
  keyThemes: string[];
  alternativeSpreadId?: SpreadId;
  alternativeSpreadName?: string;
  topShare: number;
  gap: number;
  ambiguous: boolean;
  chips: GuidedChip[];
  scoreResult: ScoreResult;
}

const TEMPLATE_METADATA: Record<
  SpreadId,
  {
    badgeTextTh: string;
    badgeTextEn: string;
    reasonTh: string;
    reasonEn: string;
    keyThemesTh: string[];
    keyThemesEn: string[];
  }
> = {
  "five-path": {
    badgeTextTh: "วิเคราะห์เจาะลึกรอบด้าน",
    badgeTextEn: "Deep Exploration",
    reasonTh:
      "คำถามของคุณมีมิติที่ลึกซึ้งและต้องการมุมมองรอบด้าน ผัง 5 ใบจะช่วยวิเคราะห์ตั้งแต่แก่นของเรื่อง รากฐาน อุปสรรค คำแนะนำ จนถึงปลายทางที่เป็นไปได้",
    reasonEn:
      "Your inquiry explores a multifaceted crossroads. The 5-Card Path maps the core heart, foundation, obstacle, guidance, and ultimate direction.",
    keyThemesTh: ["มุมมองรอบด้าน", "รากฐานเบื้องลึก", "ทิศทางระยะยาว"],
    keyThemesEn: ["Holistic Scope", "Root Foundation", "Long-term Trajectory"],
  },
  "three-guidance": {
    badgeTextTh: "ทางเลือก & คำแนะนำปฏิบัติ",
    badgeTextEn: "Decision & Clarity",
    reasonTh:
      "คำถามของคุณเกี่ยวข้องกับการตัดสินใจหรือการแก้ปัญหา ผังนี้ช่วยแยกแยะระหว่างสถานการณ์จริง สิ่งที่ขัดขวาง และคำแนะนำรูปธรรมที่นำไปใช้ได้ทันที",
    reasonEn:
      "Your question focuses on a decision or overcoming friction. This spread cleanly separates the facts, the obstacle in your way, and actionable guidance.",
    keyThemesTh: ["ข้อเท็จจริง", "สิ่งที่ขวางอยู่", "ทางออกรูปธรรม"],
    keyThemesEn: ["Clear Situation", "Identified Obstacle", "Actionable Guidance"],
  },
  single: {
    badgeTextTh: "แก่นสารตรงประเด็น",
    badgeTextEn: "Direct Essence",
    reasonTh:
      "เหมาะสำหรับคำถามที่ต้องการสารสั้นกระชับ คำตอบตรงประเด็น หรือสารนำทางสำหรับสถานการณ์เฉพาะหน้า",
    reasonEn:
      "Ideal for concise clarity, daily focus, or a direct essence message for this present moment.",
    keyThemesTh: ["สารนำทางชัดเจน", "พลังงานประจำวัน", "เข้าใจทันที"],
    keyThemesEn: ["Focused Message", "Daily Energy", "Immediate Clarity"],
  },
  "three-timeline": {
    badgeTextTh: "ไทม์ไลน์ & พัฒนาการ",
    badgeTextEn: "Timeline Progression",
    reasonTh:
      "คำถามของคุณเน้นพัฒนาการและช่วงเวลา ผังอดีต-ปัจจุบัน-อนาคต ช่วยให้เห็นสายธารพลังงานจากจุดเริ่มต้น สถานการณ์ปัจจุบัน สู่แนวโน้มข้างหน้า",
    reasonEn:
      "Your inquiry highlights how things will unfold over time. This 3-card timeline illuminates past momentum, present reality, and future potential.",
    keyThemesTh: ["รากเหง้าอดีต", "แกนกลางปัจจุบัน", "แนวโน้มอนาคต"],
    keyThemesEn: ["Past Roots", "Present Energy", "Future Potential"],
  },
};

/**
 * Intelligent Mapping of User Questions to Optimal Tarot Spreads (SDD §4.5, §6.2)
 * Powered by Multi-Criteria Scoring & Lexicon Extraction Engine (0ms response).
 */
export function getSpreadRecommendation(
  question: string,
  locale: "th" | "en" = "th",
  overrides?: Partial<Record<Signal, number>>
): SpreadRecommendation {
  const isEn = locale === "en";
  const scoreResult = scoreSpreads(question, overrides);
  const bestSpreadId = scoreResult.best;
  const bestSpread = SPREADS[bestSpreadId];
  const meta = TEMPLATE_METADATA[bestSpreadId];

  const altSpreadId = scoreResult.alternative;
  const altSpread = SPREADS[altSpreadId];

  return {
    spreadId: bestSpreadId,
    spreadName: bestSpread.name,
    badgeText: isEn ? meta.badgeTextEn : meta.badgeTextTh,
    reason: isEn ? meta.reasonEn : meta.reasonTh,
    keyThemes: isEn ? meta.keyThemesEn : meta.keyThemesTh,
    alternativeSpreadId: altSpreadId,
    alternativeSpreadName: altSpread.name,
    topShare: scoreResult.ranked[0]?.share ?? 25,
    gap: scoreResult.gap,
    ambiguous: scoreResult.ambiguous,
    chips: scoreResult.chips,
    scoreResult,
  };
}
