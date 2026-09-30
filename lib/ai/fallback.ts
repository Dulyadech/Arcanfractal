import { getSpreadDefinition } from "@/data/spreads";
import { getCardById } from "@/data/cards";
import { detectSafety } from "./safety";
import { analyzeQuestion, type QuestionAnalysis } from "./intent";
import type { SpreadId } from "@/types/spread";
import type { DrawnCard } from "@/types/tarot";
import type { ReadingAnalysis } from "@/types/reading";
import type {
  AIInterpretationPayload,
  ContextualCardInterpretation,
  AnswerDirection,
  PrimaryAnswerPayload,
  FollowUpAnswerPayload,
  StructuredAnswerPayload,
} from "@/types/ai";

export interface GenerateFallbackParams {
  question: string;
  spreadId: SpreadId;
  cards: DrawnCard[];
  analysis: ReadingAnalysis;
  locale?: string;
  questionAnalysis?: QuestionAnalysis;
}

/**
 * Synthesizes directional answer and evidence cards deterministically.
 */
function synthesizeDirectionalAnswer(
  qAnalysis: QuestionAnalysis,
  analysis: ReadingAnalysis,
  cards: DrawnCard[],
  isEn: boolean
): {
  direction: AnswerDirection;
  primaryText: string;
  evidenceCardIds: string[];
  followUpAnswers?: FollowUpAnswerPayload[];
  directAnswerText: string;
} {
  const { primary, followUps, resolution } = qAnalysis;
  const { reversedRatio, dominantElement, majorRatio } = analysis;
  const primaryTextLower = primary.text.toLowerCase();

  // 1. Determine Direction
  let direction: AnswerDirection = "mixed";
  if (reversedRatio >= 0.5) {
    direction = "likely_no";
  } else if (reversedRatio <= 0.35 && (dominantElement === "fire" || dominantElement === "earth" || majorRatio >= 0.3)) {
    direction = "likely_yes";
  } else if (dominantElement === "water" || dominantElement === "air") {
    direction = "mixed";
  } else {
    direction = "unclear";
  }

  // 2. Determine Primary Answer Text based on question phrasing
  let primaryText = "";
  const isDeadlineQuestion = /(?:ทันไหม|เสร็จทัน|on\s+time|finish\s+on\s+time)/i.test(primaryTextLower);
  const isContactQuestion = /(?:ทักมา|ติดต่อ|text|message|reach\s+out)/i.test(primaryTextLower);
  const isPassQuestion = /(?:ผ่านไหม|สำเร็จไหม|pass|succeed)/i.test(primaryTextLower);

  if (isEn) {
    if (isDeadlineQuestion) {
      if (direction === "likely_no") {
        primaryText = "It is likely that it will not be finished on time according to the current schedule.";
      } else if (direction === "likely_yes") {
        primaryText = "It is likely to be completed on time as planned.";
      } else if (direction === "mixed") {
        primaryText = "The outcome is mixed; completion on time depends on immediate adjustments and addressing bottlenecks.";
      } else {
        primaryText = "The timing remains unclear due to shifting external variables.";
      }
    } else if (isContactQuestion) {
      if (direction === "likely_no") {
        primaryText = "It is likely that they will not reach out in the immediate timeframe.";
      } else if (direction === "likely_yes") {
        primaryText = "It is likely that they will reach out or open communication.";
      } else {
        primaryText = "Communication is currently mixed or hesitant; they may hold back for now.";
      }
    } else if (isPassQuestion) {
      if (direction === "likely_no") {
        primaryText = "It is likely to face notable hurdles rather than an immediate pass.";
      } else if (direction === "likely_yes") {
        primaryText = "It is likely to pass and achieve a favorable result.";
      } else {
        primaryText = "The result is borderline; success requires actively resolving existing friction.";
      }
    } else {
      if (direction === "likely_no") {
        primaryText = "Current energies indicate notable challenges and delays rather than a straightforward outcome.";
      } else if (direction === "likely_yes") {
        primaryText = "Current energies lean affirmatively toward constructive progress.";
      } else {
        primaryText = "The situation presents balanced opportunities alongside factors requiring careful handling.";
      }
    }
  } else {
    // Thai directional answers
    if (isDeadlineQuestion) {
      if (direction === "likely_no") {
        primaryText = "มีแนวโน้มว่าจะไม่ทันตามกำหนดเดิม";
      } else if (direction === "likely_yes") {
        primaryText = "มีแนวโน้มว่าจะเสร็จทันตามกำหนด";
      } else if (direction === "mixed") {
        primaryText = "ผลลัพธ์มีแนวโน้มก้ำกึ่ง มีทั้งจุดที่คืบหน้าและอุปสรรคที่ต้องเร่งจัดการเฉพาะหน้า";
      } else {
        primaryText = "สถานการณ์ยังมีความไม่แน่นอนสูง ยังไม่สามารถชี้ชัดเรื่องเวลาได้";
      }
    } else if (isContactQuestion) {
      if (direction === "likely_no") {
        primaryText = "มีแนวโน้มว่าอีกฝ่ายอาจจะยังไม่ทักมาหาในระยะนี้";
      } else if (direction === "likely_yes") {
        primaryText = "มีแนวโน้มว่าจะทักมาหาหรือเปิดการสนทนา";
      } else {
        primaryText = "มีความลังเลอยู่ภายใน อีกฝ่ายอาจกำลังรอดูจังหวะหรือชั่งน้ำหนักอยู่";
      }
    } else if (isPassQuestion) {
      if (direction === "likely_no") {
        primaryText = "มีแนวโน้มว่าจะยังไม่ผ่านหรือติดขัดอุปสรรคสำคัญ";
      } else if (direction === "likely_yes") {
        primaryText = "มีแนวโน้มว่าจะผ่านและประสบผลสำเร็จตามที่หวัง";
      } else {
        primaryText = "ผลลัพธ์ก้ำกึ่ง มีโอกาสผ่านแต่ต้องเร่งแก้ไขจุดบกพร่องโดยด่วน";
      }
    } else {
      if (direction === "likely_no") {
        primaryText = "แนวโน้มยังมีอุปสรรคหรือความไม่แน่นอนอยู่พอสมควร จึงยังไม่แนะนำให้คาดหวังผลลัพธ์แบบฉับพลัน";
      } else if (direction === "likely_yes") {
        primaryText = "แนวโน้มมีน้ำหนักไปในทิศทางบวกและมีความเป็นไปได้สูงที่จะสำเร็จ";
      } else {
        primaryText = "สถานการณ์ยังเปิดกว้าง มีทั้งโอกาสและจุดที่ต้องใช้ความระมัดระวังควบคู่กัน";
      }
    }
  }

  // 3. Evidence Card IDs (Present & Future cards)
  const evidenceCardIds = cards.slice(Math.max(0, cards.length - 2)).map((c) => c.cardId);

  // 4. Conditional Follow-up Answers
  const followUpAnswers: FollowUpAnswerPayload[] = [];
  if (resolution.type === "conditional_follow_up" && followUps.length > 0) {
    const followUp = followUps[0];
    const outcomeCard = cards[cards.length - 1];
    const outcomeCardData = outcomeCard ? getCardById(outcomeCard.cardId) : null;
    const outcomeCardName = outcomeCardData ? outcomeCardData.name : outcomeCard?.cardId;

    let followUpAnswerText = "";
    if (isEn) {
      followUpAnswerText = `If ${followUp.condition ? followUp.condition.replace(/^if\s*/i, "") : "it is not completed on time"}: The outcome card (${outcomeCardName}) reflects temporary tension, frustration, or stalled momentum, but it remains a manageable hurdle if you communicate proactively and negotiate expectations early.`;
    } else {
      followUpAnswerText = `หาก${followUp.condition ? followUp.condition.replace(/^ถ้า/, "") : "งานไม่เสร็จทันตามกำหนด"}: ไพ่ในตำแหน่งอนาคต (${outcomeCardName}) ชี้ว่าจะเกิดความรู้สึกติดขัด ภาวะตึงเครียด หรือความไม่พึงพอใจเฉพาะหน้า แต่ยังคงสามารถคลี่คลายและลดผลกระทบได้ หากรีบสื่อสารแจ้งล่วงหน้าและขอความช่วยเหลือจากผู้เกี่ยวข้อง`;
    }

    followUpAnswers.push({
      id: followUp.id,
      text: followUp.text || followUp.normalizedQuestion,
      answer: followUpAnswerText,
      evidenceCardIds: outcomeCard ? [outcomeCard.cardId] : [],
    });
  }

  // 5. Direct Answer Combined Text
  let directAnswerText = "";
  if (resolution.type === "clarify") {
    directAnswerText = isEn
      ? `Clarification needed: The inquiry refers to an antecedent without sufficient context (${resolution.missingContext || "unclear reference"}). Please provide more background for an accurate reading.`
      : `คำถามยังขาดบริบทตั้งต้นที่ชัดเจน: กรุณาระบุรายละเอียดเพิ่มเติม (${resolution.missingContext || "ไม่ระบุเรื่องที่ชัดเจน"}) เพื่อให้ไพ่สะท้อนคำตอบได้ตรงจุดที่สุดครับ`;
  } else if (resolution.type === "conditional_follow_up" && followUpAnswers.length > 0) {
    const fAnswer = followUpAnswers[0];
    directAnswerText = isEn
      ? `Primary Answer: ${primaryText}\n\nConditional Follow-up: ${fAnswer.answer}`
      : `คำตอบหลัก: ${primaryText}\n\nข้อพิจารณาต่อเนื่อง: ${fAnswer.answer}`;
  } else {
    directAnswerText = isEn
      ? `Primary Answer: ${primaryText}`
      : `คำตอบหลัก: ${primaryText}`;
  }

  return {
    direction,
    primaryText,
    evidenceCardIds,
    followUpAnswers: followUpAnswers.length > 0 ? followUpAnswers : undefined,
    directAnswerText,
  };
}

/**
 * Deterministic Fallback Engine (SDD §3, §5, §11, D6).
 *
 * Constructs a question-centric, structured Tarot interpretation strictly
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
  const qAnalysis = params.questionAnalysis || analyzeQuestion(question, locale);

  // 1. Synthesize directional answer, evidence cards, and follow-ups
  const directional = synthesizeDirectionalAnswer(qAnalysis, analysis, cards, isEn);

  const structuredAnswer: StructuredAnswerPayload = {
    primary: {
      direction: directional.direction,
      text: directional.primaryText,
      evidenceCardIds: directional.evidenceCardIds,
    },
    followUps: directional.followUpAnswers,
  };

  // 2. Generate per-card interpretation contextualized to position and question
  const cardInterpretations: ContextualCardInterpretation[] = cards.map((drawn) => {
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

    const meaningInContext = isEn
      ? `In the position of '${positionTitle}' (${positionRole}) regarding "${qAnalysis.primary.text}": ${cardName} (${drawn.orientation}) signifies ${meaningText}`
      : `ในตำแหน่ง '${positionTitle}' (${positionRole}) สำหรับคำถามเรื่อง "${qAnalysis.primary.text}": ไพ่ ${cardName} (${isReversed ? "กลับหัว" : "ตำแหน่งตั้ง"}) สื่อถึง ${meaningText}`;

    const contributionToAnswer = isEn
      ? `This card acts as supporting evidence: reflecting key themes of ${keywords}, directly highlighting why the outcome leans ${directional.direction}.`
      : `ไพ่ใบนี้ทำหน้าที่เป็นหลักฐานสนับสนุน: สะท้อนประเด็นสำคัญ (${keywords}) ซึ่งชี้ให้เห็นว่าปัจจัยในตำแหน่งนี้ส่งผลโดยตรงต่อคำตอบ (${directional.direction})`;

    const interpretation = isEn
      ? `${meaningInContext} Evidence for the answer: ${contributionToAnswer}`
      : `${meaningInContext} ${contributionToAnswer}`;

    return {
      cardId: drawn.cardId,
      positionKey: drawn.positionKey,
      cardName,
      orientation: drawn.orientation,
      meaningInContext,
      contributionToAnswer,
      interpretation,
    };
  });

  // 3. Cohesive Synthesis
  const synthesisPoints: string[] = [];
  if (isEn) {
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

  // 4. Overview & Direct Answer Integration
  let overview = "";
  if (isEn) {
    overview = `Reading for your question: "${qAnalysis.primary.text}" using the ${spreadDef.name} spread. Direct Answer: ${directional.directAnswerText}`;
    if (safety === "crisis") {
      overview += " Please remember that during deeply difficult moments, you do not have to carry everything alone (Mental Health Hotline: 1323).";
    }
  } else {
    overview = `การอ่านไพ่สำหรับคำถาม: "${qAnalysis.primary.text}" ในรูปแบบ ${spreadDef.name} คำตอบโดยตรง: ${directional.directAnswerText}`;
    if (safety === "crisis") {
      overview += " หากคุณกำลังเผชิญกับช่วงเวลาที่ยากลำบาก โปรดจำไว้ว่าคุณไม่ได้อยู่เพียงลำพัง สามารถติดต่อสายด่วนสุขภาพจิต 1323 (โทรฟรีตลอด 24 ชั่วโมง) ได้เสมอ";
    }
  }

  // 5. Nuanced Confidence (No Overclaiming)
  const confidence = isEn
    ? "This reading reflects current energetic tendencies, mindsets, and likelihoods rather than fixed fate. Future outcomes remain responsive to your conscious decisions."
    : "การอ่านไพ่นี้สะท้อนแนวโน้ม ทัศนคติ และสภาวะพลังงานในปัจจุบัน มิใช่การกำหนดชะตาชีวิตตายตัว ผลลัพธ์ในอนาคตยังคงเปิดกว้างต่อการตัดสินใจและการลงมือทำของคุณ";

  // 6. Actionable Advice (Comes after explanation, distinct from direct answer)
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

  // 7. Reflection Question
  const reflectionQuestion = isEn
    ? "What is one small, kind action you can take for yourself today to bring clarity and peace to this situation?"
    : "อะไรคือสิ่งเล็กๆ ที่คุณสามารถลงมือทำหรือปรับมุมมองในวันนี้ เพื่อนำพาความสงบและความกระจ่างชัดมาสู่ตนเอง?";

  // 8. Conclusion
  const conclusion = isEn
    ? `In summary, regarding "${qAnalysis.primary.text}", the cards highlight: ${directional.primaryText} Proceed with awareness and confidence.`
    : `โดยสรุป สำหรับคำถามเรื่อง "${qAnalysis.primary.text}" ไพ่สะท้อนว่า: ${directional.primaryText} ขอให้นำความเข้าใจนี้ไปปรับใช้อย่างมีสติและความมั่นใจ`;

  return {
    safety,
    originalQuestion: qAnalysis.original,
    questionIntent: qAnalysis.intent,
    questionScope: qAnalysis.scope,
    directAnswer: directional.directAnswerText,
    confidence,
    overview,
    cards: cardInterpretations,
    synthesis,
    advice,
    reflectionQuestion,
    conclusion,
    status: "fallback",
    isMultiQuestion: qAnalysis.resolution.type === "independent_multi_question",
    subQuestions: qAnalysis.subQuestions,
    scopeNotice: qAnalysis.scopeNotice,
    questionAnalysis: {
      original: qAnalysis.original,
      primary: qAnalysis.primary,
      followUps: qAnalysis.followUps,
      resolution: qAnalysis.resolution,
    },
    answer: structuredAnswer,
    clarificationPrompt:
      qAnalysis.resolution.type === "clarify" ? directional.directAnswerText : undefined,
  };
}
