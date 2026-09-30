import { getSpreadDefinition } from "@/data/spreads";
import { getCardById } from "@/data/cards";
import { detectSafety } from "./safety";
import type { SpreadId } from "@/types/spread";
import type { DrawnCard } from "@/types/tarot";
import type { ReadingAnalysis } from "@/types/reading";
import type { AIInterpretationPayload } from "@/types/ai";

export interface GenerateFallbackParams {
  question: string;
  spreadId: SpreadId;
  cards: DrawnCard[];
  analysis: ReadingAnalysis;
  locale?: string;
}

/**
 * Deterministic Fallback Engine (SDD §3, §5, D6).
 *
 * Constructs a comprehensive, structured Tarot interpretation strictly
 * from the master deck catalog meanings and deterministic analysis facts
 * whenever external AI services are unavailable, timeout, or fail validation.
 *
 * Golden Rule D6: "Deterministic Fallback must always succeed."
 */
export function generateDeterministicFallback(
  params: GenerateFallbackParams
): AIInterpretationPayload {
  const { question, spreadId, cards, analysis, locale = "th" } = params;
  const spreadDef = getSpreadDefinition(spreadId);
  const isEn = locale.toLowerCase().startsWith("en");
  const safety = detectSafety(question);

  // 1. Generate per-card interpretation from master catalog meanings
  const cardInterpretations = cards.map((drawn) => {
    const card = getCardById(drawn.cardId);
    const position = spreadDef.positions[drawn.positionIndex];
    const isReversed = drawn.orientation === "reversed";

    const cardName = card ? card.name : drawn.cardId;
    const positionTitle = position ? position.name : `Card ${drawn.positionIndex + 1}`;
    const positionRole = position ? position.description : "";

    let meaningText = "";
    let keywords = "";

    if (card) {
      meaningText = isReversed
        ? card.meaning.full.reversed || card.meaning.short.reversed
        : card.meaning.full.upright || card.meaning.short.upright;
      keywords = isReversed
        ? card.keywords.reversed.join(", ")
        : card.keywords.upright.join(", ");
    } else {
      meaningText = isEn
        ? "Universal archetypal guidance for your current journey."
        : "พลังงานสากลที่ชี้ทางในการเดินทางของคุณในขณะนี้";
      keywords = isEn ? "Insight, Transformation" : "ความเข้าใจ, การเปลี่ยนแปลง";
    }

    const interpretation = isEn
      ? `${cardName} (${drawn.orientation}) in the position of '${positionTitle}' (${positionRole}): ${meaningText} Key themes: ${keywords}.`
      : `ไพ่ ${cardName} (${isReversed ? "กลับหัว / Reversed" : "ตำแหน่งตั้ง / Upright"}) ในตำแหน่ง '${positionTitle}' (${positionRole}): ${meaningText} (ประเด็นสำคัญ: ${keywords})`;

    return {
      cardId: drawn.cardId,
      positionKey: drawn.positionKey,
      interpretation,
    };
  });

  // 2. Synthesize facts into a cohesive synthesis
  const synthesisPoints: string[] = [];

  if (isEn) {
    // English Synthesis
    if (analysis.majorRatio >= 0.6) {
      synthesisPoints.push(
        `Major Arcana cards are strongly prominent (${analysis.majorCount}/${cards.length}, ${(analysis.majorRatio * 100).toFixed(0)}%), indicating structural life lessons shaping long-term trajectories.`
      );
    } else if (analysis.majorRatio === 0) {
      synthesisPoints.push(
        "All drawn cards are Minor Arcana, suggesting this matter centers on everyday management, practical actions, and tangible choices."
      );
    } else {
      synthesisPoints.push(
        `A balanced mix of Major (${analysis.majorCount}/${cards.length}) and Minor Arcana cards reflects deep soul lessons meeting practical reality.`
      );
    }

    if (analysis.dominantElement === "fire") {
      synthesisPoints.push("Fire is the dominant element, fueling passion, action, and purposeful initiative.");
    } else if (analysis.dominantElement === "water") {
      synthesisPoints.push("Water is the dominant element, highlighting emotional depth, relationships, and intuitive awareness.");
    } else if (analysis.dominantElement === "air") {
      synthesisPoints.push("Air is the dominant element, emphasizing intellectual clarity, communication, and decisive perspective.");
    } else if (analysis.dominantElement === "earth") {
      synthesisPoints.push("Earth is the dominant element, grounding this query in stability, practical resources, and tangible outcomes.");
    }

    if (analysis.reversedRatio > 0.5) {
      synthesisPoints.push("The majority of cards are reversed, pointing toward internal processing, unexpressed feelings, or areas calling for release.");
    }
  } else {
    // Thai Synthesis
    if (analysis.majorRatio >= 0.6) {
      synthesisPoints.push(
        `ไพ่กลุ่ม Major Arcana โดดเด่นอย่างยิ่ง (${analysis.majorCount}/${cards.length} ใบ, ${(analysis.majorRatio * 100).toFixed(0)}%) บ่งบอกว่าสถานการณ์นี้เป็นบทเรียนชีวิตระดับโครงสร้างที่มีอิทธิพลต่อเส้นทางชีวิตในระยะยาว`
      );
    } else if (analysis.majorRatio === 0) {
      synthesisPoints.push(
        "ไพ่ทั้งหมดเป็น Minor Arcana บ่งบอกว่าสถานการณ์นี้เกี่ยวข้องกับการจัดการเรื่องราวในชีวิตประจำวัน ปฏิสัมพันธ์ และการตัดสินใจเชิงรูปธรรมเฉพาะหน้า"
      );
    } else {
      synthesisPoints.push(
        `ไพ่มีส่วนผสมที่สมดุลระหว่างบทเรียนชีวิตหลักและการลงมือจัดการเรื่องราวในชีวิตประจำวัน (${analysis.majorCount}/${cards.length} ใบในกลุ่ม Major Arcana)`
      );
    }

    if (analysis.dominantElement === "fire") {
      synthesisPoints.push("พลังงานหลักโดดเด่นด้วยธาตุไฟ สะท้อนถึงแรงบันดาลใจ ความมุ่งมั่น และการลงมือปฏิบัติ");
    } else if (analysis.dominantElement === "water") {
      synthesisPoints.push("พลังงานหลักโดดเด่นด้วยธาตุน้ำ สะท้อนถึงโลกของอารมณ์ ความรู้สึก ความสัมพันธ์ และสัญชาตญาณภายใน");
    } else if (analysis.dominantElement === "air") {
      synthesisPoints.push("พลังงานหลักโดดเด่นด้วยธาตุลม สะท้อนถึงความคิด การสื่อสาร การวิเคราะห์ และการตัดสินใจที่ต้องอาศัยความกระจ่างแจ้ง");
    } else if (analysis.dominantElement === "earth") {
      synthesisPoints.push("พลังงานหลักโดดเด่นด้วยธาตุดิน สะท้อนถึงความมั่นคง การงาน การเงิน และผลลัพธ์ที่เป็นรูปธรรมจับต้องได้");
    }

    if (analysis.reversedRatio > 0.5) {
      synthesisPoints.push("มีไพ่กลับหัวเป็นส่วนใหญ่ ชี้ให้เห็นถึงพลังงานที่ต้องอาศัยการทบทวนภายใน หรือสิ่งที่อาจยังติดขัดและรอการปลดล็อก");
    }

    if (analysis.repeatedRanks.length > 0) {
      synthesisPoints.push(`พบเลขไพ่ที่เชื่อมโยงกัน (${analysis.repeatedRanks.join(", ")}) ซึ่งเน้นย้ำความต่อเนื่องของธีมนี้`);
    }

    if (analysis.courtCards.length > 0) {
      synthesisPoints.push(`มีไพ่บุคคล (${analysis.courtCards.join(", ")}) ปรากฏ บ่งชี้ถึงอิทธิพลของบุคคลสำคัญหรือบุคลิกภาพที่คุณต้องดึงมาใช้`);
    }
  }

  const synthesis = synthesisPoints.join(" ");

  // 3. Overview
  let overview = "";
  if (isEn) {
    overview = `Reading for your question: "${question}" using the ${spreadDef.name} spread. The cards provide clear reflective energy, helping you navigate this moment with clarity and purpose.`;
    if (safety === "crisis") {
      overview += " Please remember that during deeply difficult moments, you do not have to carry everything alone (Mental Health Hotline: 1323).";
    }
  } else {
    overview = `การอ่านไพ่สำหรับคำถาม: "${question}" ในรูปแบบ ${spreadDef.name} พลังงานของไพ่สะท้อนเรื่องราวและความเป็นไปที่กำลังดำเนินอยู่ โดยมุ่งเน้นการสร้างความเข้าใจและการตระหนักรู้ในตนเอง`;
    if (safety === "crisis") {
      overview += " หากคุณกำลังเผชิญกับช่วงเวลาที่ยากลำบาก โปรดจำไว้ว่าคุณไม่ได้อยู่เพียงลำพัง สามารถติดต่อสายด่วนสุขภาพจิต 1323 (โทรฟรีตลอด 24 ชั่วโมง) ได้เสมอ";
    }
  }

  // 4. Actionable Advice
  let advice = "";
  if (isEn) {
    if (safety === "crisis") {
      advice =
        "Be gentle with yourself right now. Rest, reach out to trusted loved ones, and consider connecting with support professionals who care (Thailand Mental Health Hotline: 1323, available 24/7). Take things one breath at a time.";
    } else {
      advice =
        "Focus on grounded mindfulness. Embrace the wisdom of your cards by taking clear, deliberate steps rather than rushing into conclusions. Trust your internal resilience and align actions with your core values.";
    }
  } else {
    if (safety === "crisis") {
      advice =
        "ขอให้คุณใจดีกับตนเองในเวลานี้ พักผ่อนและพูดคุยกับคนที่คุณไว้ใจ หากรู้สึกหนักหน่วงเกินไป สามารถติดต่อสายด่วนสุขภาพจิต 1323 (โทรฟรีตลอด 24 ชั่วโมง) ได้เสมอ ขอให้ก้าวไปทีละก้าวอย่างอ่อนโยน";
    } else {
      advice =
        "ขอให้รับมือสถานการณ์นี้ด้วยสติและความมั่นคง นำสารจากไพ่มาปรับใช้โดยเน้นการลงมือทำทีละก้าวอย่างรอบคอบ แทนที่จะรีบตัดสินใจด้วยความกังวล จงเชื่อมั่นในศักยภาพของตนเองและรักษาความสมดุลทั้งความคิดและอารมณ์";
    }
  }

  // 5. Reflection Question
  let reflectionQuestion = "";
  if (isEn) {
    reflectionQuestion =
      "What is one small, kind action you can take for yourself today to bring clarity and peace to this situation?";
  } else {
    reflectionQuestion =
      "อะไรคือสิ่งเล็กๆ ที่คุณสามารถลงมือทำหรือปรับมุมมองในวันนี้ เพื่อนำพาความสงบและความกระจ่างชัดมาสู่ตนเอง?";
  }

  return {
    safety,
    overview,
    cards: cardInterpretations,
    synthesis,
    advice,
    reflectionQuestion,
    status: "fallback",
  };
}
