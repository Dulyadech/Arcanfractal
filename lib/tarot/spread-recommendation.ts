import type { SpreadId } from "@/types/spread";
import { SPREADS } from "@/data/spreads";

export interface SpreadRecommendation {
  spreadId: SpreadId;
  spreadName: string;
  badgeText: string;
  reason: string;
  keyThemes: string[];
}

/**
 * Intelligent Mapping of User Questions to Optimal Tarot Spreads (SDD §4.5, §6.2)
 *
 * Analyzes question phrasing, keywords, temporal horizon, and intent to recommend
 * the most insightful spread configuration.
 */
export function getSpreadRecommendation(
  question: string,
  locale: "th" | "en" = "th"
): SpreadRecommendation {
  const isEn = locale === "en";
  const trimmed = (question || "").trim().toLowerCase();

  // 1. Situation · Challenge · Guidance Pattern: Decisions, dilemmas, conflicts, choices, problem-solving
  const isGuidanceOrChoice =
    /(?:ควร(?!ระวัง)|เลือก|ตัดสินใจ|ดีไหม|ทางไหน|ดีกว่า|ทำอย่างไร|แก้ปัญหา|ติดขัด|อุปสรรค|ทางออก|ข้อแนะนำ|รับมือ|ขัดแย้ง|should\s+i|choose|decide|decision|dilemma|obstacle|challenge|how\s+to\s+handle|resolve|solution|advice|better\s+to)/i.test(
      trimmed
    );

  // 2. Single Card Pattern: Daily, quick message, snapshot inquiry
  const isDailyOrQuick =
    /(?:สารนำทาง|สารประจำวัน|พลังงานประจำวัน|ข้อความสำหรับวันนี้|ไพ่ประจำวัน|พลังงานอะไร|ควรระวัง|daily\s+guidance|daily\s+message|card\s+of\s+the\s+day|snapshot|today's\s+message)/i.test(
      trimmed
    ) || (/(?:วันนี้|today|วันใหม่)/i.test(trimmed) && !/(?:decision|ตัดสินใจ|เลือก|ดีไหม|should\s+i)/i.test(trimmed));

  // 3. Five-Card Path Pattern: Deep exploration, crossroads, holistic journey, multi-part, long complex inquiry
  const isDeepPath =
    /(?:เส้นทางชีวิต|ภาพรวม|ทางแยก|เปลี่ยนผ่านชีวิต|อนาคตระยะยาว|ภาพรวมใหญ่|รอบด้าน|ลึกซึ้ง|ย้ายสายงาน|ชีวิตคู่|crossroad|crossroads|life\s+path|deep\s+dive|holistic|comprehensive|transformation|pivot|long\s+term)/i.test(
      trimmed
    ) || (trimmed.length >= 100 && (trimmed.includes("?") || trimmed.includes("ไหม") || trimmed.includes("อย่างไร")));

  // 4. Past · Present · Future Pattern: Timeline, progression, evolution, future outlook
  const isTimeline =
    /(?:อนาคต|ต่อไป|แนวโน้ม|ทิศทาง|เดือนหน้า|ปีนี้|ข้างหน้า|พัฒนา|จะเป็นอย่างไร|จะเป็นไง|ก้าวหน้า|future|next\s+month|next\s+year|upcoming|timeline|ahead|evolve|develop|progress|outlook)/i.test(
      trimmed
    );

  // Resolution hierarchy
  if (isDeepPath) {
    const spread = SPREADS["five-path"];
    return {
      spreadId: "five-path",
      spreadName: spread.name,
      badgeText: isEn ? "Deep Exploration" : "วิเคราะห์เจาะลึกรอบด้าน",
      reason: isEn
        ? "Your inquiry explores a multifaceted crossroads. The 5-Card Path maps the core heart, foundation, obstacle, guidance, and ultimate direction."
        : "คำถามของคุณมีมิติที่ลึกซึ้งและต้องการมุมมองรอบด้าน ผัง 5 ใบจะช่วยวิเคราะห์ตั้งแต่แก่นของเรื่อง รากฐาน อุปสรรค คำแนะนำ จนถึงปลายทางที่เป็นไปได้",
      keyThemes: isEn
        ? ["Holistic Scope", "Root Foundation", "Long-term Trajectory"]
        : ["มุมมองรอบด้าน", "รากฐานเบื้องลึก", "ทิศทางระยะยาว"],
    };
  }

  if (isGuidanceOrChoice) {
    const spread = SPREADS["three-guidance"];
    return {
      spreadId: "three-guidance",
      spreadName: spread.name,
      badgeText: isEn ? "Decision & Clarity" : "ทางเลือก & คำแนะนำปฏิบัติ",
      reason: isEn
        ? "Your question focuses on a decision or overcoming friction. This spread cleanly separates the facts, the obstacle in your way, and actionable guidance."
        : "คำถามของคุณเกี่ยวข้องกับการตัดสินใจหรือการแก้ปัญหา ผังนี้ช่วยแยกแยะระหว่างสถานการณ์จริง สิ่งที่ขัดขวาง และคำแนะนำรูปธรรมที่นำไปใช้ได้ทันที",
      keyThemes: isEn
        ? ["Clear Situation", "Identified Obstacle", "Actionable Guidance"]
        : ["ข้อเท็จจริง", "สิ่งที่ขวางอยู่", "ทางออกรูปธรรม"],
    };
  }

  if (isDailyOrQuick) {
    const spread = SPREADS["single"];
    return {
      spreadId: "single",
      spreadName: spread.name,
      badgeText: isEn ? "Direct Essence" : "แก่นสารตรงประเด็น",
      reason: isEn
        ? "Ideal for concise clarity, daily focus, or a direct essence message for this present moment."
        : "เหมาะสำหรับคำถามที่ต้องการสารสั้นกระชับ คำตอบตรงประเด็น หรือสารนำทางสำหรับสถานการณ์เฉพาะหน้า",
      keyThemes: isEn
        ? ["Focused Message", "Daily Energy", "Immediate Clarity"]
        : ["สารนำทางชัดเจน", "พลังงานประจำวัน", "เข้าใจทันที"],
    };
  }

  if (isTimeline) {
    const spread = SPREADS["three-timeline"];
    return {
      spreadId: "three-timeline",
      spreadName: spread.name,
      badgeText: isEn ? "Timeline Progression" : "ไทม์ไลน์ & พัฒนาการ",
      reason: isEn
        ? "Your inquiry highlights how things will unfold over time. This 3-card timeline illuminates past momentum, present reality, and future potential."
        : "คำถามของคุณเน้นพัฒนาการและช่วงเวลา ผังอดีต-ปัจจุบัน-อนาคต ช่วยให้เห็นสายธารพลังงานจากจุดเริ่มต้น สถานการณ์ปัจจุบัน สู่แนวโน้มข้างหน้า",
      keyThemes: isEn
        ? ["Past Roots", "Present Energy", "Future Potential"]
        : ["รากเหง้าอดีต", "แกนกลางปัจจุบัน", "แนวโน้มอนาคต"],
    };
  }

  // Default balanced recommendation: Past · Present · Future
  const defaultSpread = SPREADS["three-timeline"];
  return {
    spreadId: "three-timeline",
    spreadName: defaultSpread.name,
    badgeText: isEn ? "Recommended Spread" : "ผังแนะนำสมดุล",
    reason: isEn
      ? "A balanced 3-card narrative that provides rich context without overwhelming complexity, perfect for most questions."
      : "ผังไพ่ 3 ใบมาตรฐานที่ให้ความสมดุลสูงสุด ช่วยให้เห็นภาพรวมทั้งที่มา สถานการณ์ปัจจุบัน และแนวโน้มอย่างชัดเจน",
    keyThemes: isEn
      ? ["Balanced Context", "Actionable Flow", "Clear Storyline"]
      : ["สมดุลรอบด้าน", "เห็นพัฒนาการ", "เรื่องราวชัดเจน"],
  };
}
