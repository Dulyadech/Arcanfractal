import type {
  QuestionIntent,
  QuestionResolutionType,
  PrimaryQuestionAnalysis,
  FollowUpQuestion,
  QuestionResolution,
  StructuredQuestionAnalysis,
} from "@/types/ai";

export interface PriorContext {
  priorQuestion?: string;
  subject?: string;
  topic?: string;
  intent?: QuestionIntent;
}

export interface QuestionAnalysis extends StructuredQuestionAnalysis {
  originalQuestion: string;
  primaryQuestion: string;
  intent: QuestionIntent;
  scope: string;
  isMultiQuestion: boolean;
  subQuestions?: string[];
  scopeNotice?: string;
}

/**
 * Patterns indicating intent category of inquiry.
 */
const INTENT_PATTERNS: { intent: QuestionIntent; regex: RegExp }[] = [
  {
    intent: "feelings",
    regex: /(?:รู้สึก|คิดถึง|ชอบ|รัก|ในใจ|ความรู้สึก|feel|feeling|think\s+of\s+me|love|affection|attracted)/i,
  },
  {
    intent: "relationship",
    regex: /(?:ความสัมพันธ์|คบ|เลิก|แฟน|คืนดี|กลับมา|คนรัก|หย่า|มือที่สาม|relationship|partner|ex\b|breakup|reunite|dating|together)/i,
  },
  {
    intent: "decision",
    regex: /(?:ควร|เลือก|ทางไหน|ตัดสินใจ|ดีไหม|should\s+i|choose|choice|decide|decision|which\s+(?:path|one)|better\s+to)/i,
  },
  {
    intent: "career",
    regex: /(?:การงาน|ทำงาน|เรื่องงาน|ส่งงาน|เสร็จทัน|งาน(?!\s*แต่ง)|สัมภาษณ์|ย้ายงาน|ตกงาน|ธุรกิจ|โปรเจกต์|โปรเจก|เลื่อนขั้น|เรียน|สอบ|career|job|work|business|project|interview|promotion|study|exam)/i,
  },
  {
    intent: "yes_no",
    regex: /(?:จะได้ไหม|สำเร็จไหม|ผ่านไหม|ทันไหม|เสร็จไหม|ใช่ไหม|หรือเปล่า|ไหมครับ|ไหมคะ|รอดไหม|will\s+i|can\s+i|is\s+it|yes\s+or\s+no)/i,
  },
  {
    intent: "future",
    regex: /(?:อนาคต|เดือนหน้า|ปีนี้|ต่อไป|จะเป็นอย่างไร|ทิศทาง|แนวโน้ม|future|next\s+(?:month|year)|outlook|trend|ahead|upcoming)/i,
  },
];

/**
 * Extracts timeframe indicator if present in the question.
 */
function extractTimeframe(text: string): string | undefined {
  const match = text.match(
    /(?:พรุ่งนี้|วันนี้|เมื่อวาน|สัปดาห์นี้|อาทิตย์นี้|เดือนนี้|เดือนหน้า|ปีนี้|ปีหน้า|เร็วๆ\s*นี้|ช่วงนี้|tomorrow|today|yesterday|this\s+week|next\s+week|this\s+month|next\s+month|this\s+year|next\s+year|soon)/i
  );
  return match ? match[0].trim() : undefined;
}

/**
 * Extracts a concise description of the inquiry's core thematic scope.
 */
function extractQuestionScope(question: string, intent: QuestionIntent, locale: string): string {
  const isEn = locale.toLowerCase().startsWith("en");

  // Specific scope extractions if explicitly present
  if (/(?:งานพรุ่งนี้|work\s+tomorrow)/i.test(question)) {
    return isEn ? "Tomorrow's work and deadline" : "งานพรุ่งนี้และการจัดการเดดไลน์";
  }
  if (/(?:ความรัก|love\s+life)/i.test(question)) {
    return isEn ? "Love life and romantic dynamics" : "ความรักและความสัมพันธ์";
  }
  if (/(?:การงาน|เรื่องงาน|career|job)/i.test(question)) {
    return isEn ? "Career progress and professional opportunities" : "ความก้าวหน้าและการจัดการงาน";
  }

  switch (intent) {
    case "feelings":
      return isEn ? "Emotional state and internal feelings" : "สภาวะอารมณ์และความรู้สึกภายในของอีกฝ่าย";
    case "relationship":
      return isEn ? "Relationship dynamics and mutual connection" : "พลวัตและความเชื่อมโยงในความสัมพันธ์";
    case "career":
      return isEn ? "Career progress, work environment, and opportunities" : "ความก้าวหน้า การงาน และการจัดการโอกาสที่เป็นรูปธรรม";
    case "decision":
      return isEn ? "Evaluating choices and constructive direction" : "การพิจารณาทางเลือกและทิศทางที่สอดคล้องกับเป้าหมาย";
    case "future":
      return isEn ? "Emerging trajectory and upcoming trends" : "แนวโน้มและทิศทางความเป็นไปในอนาคต";
    case "yes_no":
      return isEn ? "Evaluating likelihood and underlying factors" : "การประเมินแนวโน้มความเป็นไปได้และปัจจัยเบื้องลึก";
    default:
      return isEn ? "General life reflection and archetypal energy" : "ภาพรวมพลังงานและการทบทวนสถานการณ์ในชีวิต";
  }
}

/**
 * Identifies potential multi-question splits using punctuation and conjunction markers.
 */
function splitMultiQuestions(text: string): string[] {
  // First split by question marks if multiple
  const qMarkSplits = text
    .split(/[?？]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3);

  if (qMarkSplits.length > 1) {
    return qMarkSplits.map((q) => (q.endsWith("?") ? q : `${q}?`));
  }

  // Split on transition keywords when preceded by space or question particle:
  // e.g. "งานพรุ่งนี้จะเสร็จทันไหม ถ้าไม่ทันจะเกิดอะไรขึ้น"
  // e.g. "เขาจะทักมาหาไหม ถ้าทักมาจะคุยกันเรื่องอะไร"
  // e.g. "งานพรุ่งนี้จะเสร็จทันไหม แล้วเดือนหน้าความรักจะเป็นอย่างไร"
  const transitionSplitRegex =
    /(?<=[ไหม|หรือเปล่า|ครับ|คะ|\?|!|\.|\w])\s+(?=(?:ถ้า|หาก|แล้วถ้า|แล้วจะ|แล้ว|และ|or\b|and\b|if\b))/i;
  let parts = text.split(transitionSplitRegex).map((s) => s.trim()).filter((s) => s.length >= 5);

  if (parts.length > 1) {
    return parts;
  }

  // Fallback conjunction splitters: "ไหม แล้ว...", "และ..."
  const conjunctionRegex =
    /(?<=[^\s])\s+(?:แล้ว(?:เรา)?|และ(?:เรา)?|หรือว่า|แล้วถ้า|ถ้า(?:หาก)?|and\s+(?:will|can|is|do|are|how|should))\s*/i;
  parts = text.split(conjunctionRegex).map((s) => s.trim()).filter((s) => s.length >= 5);

  if (parts.length > 1) {
    return parts;
  }

  return [text];
}

/**
 * Detects whether an inquiry is a dangling conditional/referential fragment
 * that lacks an antecedent context in the prompt itself.
 */
function detectDanglingInquiry(
  text: string,
  priorContext?: PriorContext
): { isDangling: boolean; missingContext?: string } {
  // If prior context already provides antecedent, it is not dangling
  if (priorContext?.subject || priorContext?.priorQuestion) {
    return { isDangling: false };
  }

  const trimmed = text.trim();

  // 1. "ถ้าไม่ทันจะเกิดอะไรขึ้น" / "ถ้าไม่ทัน..."
  if (/^(?:แล้ว)?(?:ถ้า|หาก|ถ้าหาก|แล้วถ้า|และถ้า)\s*ไม่ทัน/i.test(trimmed)) {
    return {
      isDangling: true,
      missingContext: "what task, event, or deadline is not on time ('ไม่ทัน')",
    };
  }

  // 2. "ถ้าเขาไม่ทักมา ฉันควรทำอย่างไร" / "ถ้าเขาไม่..."
  if (/^(?:แล้ว)?(?:ถ้า|หาก|ถ้าหาก|แล้วถ้า|และถ้า)\s*เขา(?:ไม่ทัก|ไม่ตอบ|ไม่คุย|ไม่มา)?/i.test(trimmed)) {
    return {
      isDangling: true,
      missingContext: "who 'เขา' refers to and the background of the expected message",
    };
  }

  // 3. "ถ้าเลือกทางนี้จะเกิดอะไรขึ้น" / "แล้วผลจะเป็นอย่างไร" / "แล้วเรื่องนี้จะเป็นยังไง"
  if (/^(?:แล้ว)?(?:ถ้า|หาก)\s*เลือกทางนี้/i.test(trimmed) || /^(?:แล้ว|และ)?\s*(?:ผล|เรื่องนี้|ทางนี้)จะเป็นอย่างไร/i.test(trimmed)) {
    return {
      isDangling: true,
      missingContext: "what choice, path, or matter is being referred to",
    };
  }

  // English equivalents: "If not, what will happen?" / "What if he doesn't text me?"
  if (/^(?:and\s+)?if\s+not\b/i.test(trimmed)) {
    return {
      isDangling: true,
      missingContext: "what condition or event 'if not' refers to",
    };
  }
  if (/^(?:and\s+)?if\s+\b(?:he|she|they)\b\s+(?:doesn't|don't)\s+(?:text|call|reach\s+out)\b/i.test(trimmed)) {
    return {
      isDangling: true,
      missingContext: "who is being referred to and the context of the communication",
    };
  }

  return { isDangling: false };
}

/**
 * Resolves referential antecedent from the primary question into a normalized follow-up question.
 */
function resolveFollowUpAntecedent(
  primaryText: string,
  followUpText: string,
  locale: string
): {
  type: "conditional" | "clarifying";
  condition?: string;
  normalizedQuestion: string;
} {
  const isEn = locale.toLowerCase().startsWith("en");

  // Extract Subject from primary text
  let subject = "";
  if (/(?:งานพรุ่งนี้|work.*tomorrow)/i.test(primaryText)) {
    subject = isEn ? "the work tomorrow" : "งานพรุ่งนี้";
  } else if (/(?:งานนี้|เรื่องงาน|\bwork\b|\bjob\b)/i.test(primaryText)) {
    subject = isEn ? "this work" : "งานนี้";
  } else if (/(?:เขา|\bhe\b|\bshe\b)/i.test(primaryText)) {
    subject = isEn ? "they" : "เขา";
  } else if (/(?:โปรเจกต์|project)/i.test(primaryText)) {
    subject = isEn ? "the project" : "โปรเจกต์นี้";
  } else {
    subject = isEn ? "this matter" : "สถานการณ์นี้";
  }

  // Extract Action / Predicate from primary text
  const hasOnTime = /(?:เสร็จทัน|ทัน|on\s+time|finish)/i.test(primaryText);
  const hasContact = /(?:ทักมา|ติดต่อ|text|message|reach\s+out)/i.test(primaryText);
  const hasPass = /(?:ผ่าน|สำเร็จ|pass|succeed)/i.test(primaryText);

  // Check for conditional indicator in followUp
  const isConditional = /(?:ถ้า|หาก|ถ้าหาก|แล้วถ้า|และถ้า|if\b|what\s+if\b)/i.test(followUpText);

  if (isConditional) {
    // Check if followUp is a negative condition: e.g. "ถ้าไม่ทัน", "if not"
    const isNegative = /(?:ไม่ทัน|ไม่ทัก|ไม่ผ่าน|ไม่สำเร็จ|if\s+not|doesn't|don't)/i.test(followUpText);

    let condition = "";
    if (hasOnTime) {
      condition = isNegative
        ? (isEn ? `If ${subject} is not finished on time` : `ถ้า${subject}ไม่เสร็จทัน`)
        : (isEn ? `If ${subject} is finished on time` : `ถ้า${subject}เสร็จทัน`);
    } else if (hasContact) {
      condition = isNegative
        ? (isEn ? `If ${subject} does not reach out` : `ถ้า${subject}ไม่ทักมา`)
        : (isEn ? `If ${subject} reaches out` : `ถ้า${subject}ทักมาหา`);
    } else if (hasPass) {
      condition = isNegative
        ? (isEn ? `If ${subject} does not succeed` : `ถ้า${subject}ไม่ผ่าน`)
        : (isEn ? `If ${subject} succeeds` : `ถ้า${subject}ผ่าน`);
    } else {
      condition = isNegative
        ? (isEn ? `If ${subject} does not happen` : `ถ้า${subject}ไม่เป็นไปตามคาด`)
        : (isEn ? `If ${subject} happens` : `ถ้า${subject}เป็นไปตามนั้น`);
    }

    // Replace relative condition in followUpText with normalized condition
    let normalizedQuestion = followUpText;
    if (/(?:ถ้าไม่ทัน|หากไม่ทัน)/i.test(followUpText)) {
      normalizedQuestion = followUpText.replace(/(?:ถ้าไม่ทัน|หากไม่ทัน)/i, condition);
    } else if (/(?:ถ้าทักมา|หากทักมา)/i.test(followUpText)) {
      normalizedQuestion = followUpText.replace(/(?:ถ้าทักมา|หากทักมา)/i, condition);
    } else if (/^if\s+not\b/i.test(followUpText)) {
      normalizedQuestion = followUpText.replace(/^if\s+not\b/i, condition);
    } else {
      normalizedQuestion = `${condition} ${followUpText.replace(/^(?:ถ้า|หาก|แล้วถ้า|if)\s*/i, "")}`.trim();
    }

    return {
      type: "conditional",
      condition,
      normalizedQuestion,
    };
  }

  // Clarifying follow-up (e.g. "แล้วจะคุยกันในลักษณะไหน", "เรื่องอะไร")
  const condition = hasContact
    ? (isEn ? `If ${subject} reaches out` : `ถ้า${subject}ทักมาหา`)
    : (isEn ? `Regarding ${subject}` : `เกี่ยวกับ${subject}`);

  const normalizedQuestion = isEn
    ? `${condition}, ${followUpText}`
    : `${condition} ${followUpText}`;

  return {
    type: "clarifying",
    condition,
    normalizedQuestion,
  };
}

/**
 * Analyzes the user question for intent, primary scope, timeframe,
 * follow-up relationships, and context resolution (SDD §11, §12).
 */
export function analyzeQuestion(
  question: string,
  locale: string = "th",
  priorContext?: PriorContext
): QuestionAnalysis {
  const trimmed = (question || "").trim();
  const isEn = locale.toLowerCase().startsWith("en");

  // 1. Detect dangling inquiry lacking antecedent context
  const danglingCheck = detectDanglingInquiry(trimmed, priorContext);
  if (danglingCheck.isDangling) {
    const detectedIntent = detectIntent(trimmed);
    const scope = extractQuestionScope(trimmed, detectedIntent, locale);
    const resolution: QuestionResolution = {
      type: "clarify",
      reason: `The question refers to a conditional or relative clause without an antecedent context (${danglingCheck.missingContext}).`,
      missingContext: danglingCheck.missingContext,
    };

    return {
      originalQuestion: trimmed,
      primaryQuestion: trimmed,
      intent: detectedIntent,
      scope,
      isMultiQuestion: false,
      scopeNotice: isEn
        ? `Clarification needed: Please provide more details regarding ${danglingCheck.missingContext}.`
        : `คำถามขาดบริบทตั้งต้นที่ชัดเจน (${danglingCheck.missingContext}) เพื่อความแม่นยำโปรดระบุรายละเอียดเพิ่มเติมครับ`,
      original: trimmed,
      primary: {
        text: trimmed,
        intent: detectedIntent,
        scope,
      },
      followUps: [],
      resolution,
    };
  }

  // 2. Clause splitting
  const parts = splitMultiQuestions(trimmed);
  const primaryClause = parts[0] || trimmed;
  const detectedIntent = detectIntent(primaryClause);
  const primaryTimeframe = extractTimeframe(primaryClause);
  const scope = extractQuestionScope(primaryClause, detectedIntent, locale);

  const primary: PrimaryQuestionAnalysis = {
    text: primaryClause,
    intent: detectedIntent,
    scope,
    timeframe: primaryTimeframe,
  };

  // Case A: Single question (no follow-ups)
  if (parts.length === 1) {
    const resolution: QuestionResolution = {
      type: "single",
      reason: "Single focused inquiry without follow-up questions.",
    };

    return {
      originalQuestion: trimmed,
      primaryQuestion: primaryClause,
      intent: detectedIntent,
      scope,
      isMultiQuestion: false,
      original: trimmed,
      primary,
      followUps: [],
      resolution,
    };
  }

  // Case B: Multiple clauses — evaluate relationship between primary and follow-ups
  const followUpClauses = parts.slice(1);
  const followUpIntent = detectIntent(followUpClauses[0]);

  // Check if independent multi-question (e.g. career + romance with distinct domains)
  const isConditionalFollowUp = /(?:ถ้า|หาก|ถ้าหาก|แล้วถ้า|และถ้า|if\b|what\s+if\b)/i.test(followUpClauses[0]);
  const hasDistinctDomain =
    !isConditionalFollowUp &&
    detectedIntent !== "general" &&
    followUpIntent !== "general" &&
    detectedIntent !== followUpIntent;

  if (hasDistinctDomain) {
    const resolution: QuestionResolution = {
      type: "independent_multi_question",
      reason: `The two questions belong to distinct domains (${detectedIntent} vs ${followUpIntent}) without dependency.`,
    };

    const scopeNotice = isEn
      ? `This inquiry contains multiple distinct aspects. The interpretation is locked onto your primary question: "${primaryClause}". For the remaining aspects, a separate spread is recommended for maximum clarity.`
      : `คำถามนี้มีมากกว่าหนึ่งประเด็นที่ไม่เกี่ยวข้องกัน ระบบได้ล็อกการตีความเพื่อตอบประเด็นหลักคือ: "${primaryClause}" อย่างตรงจุดที่สุด สำหรับประเด็นอื่นแนะนำให้แยกเปิดไพ่อีกรอบเพื่อความกระจ่างแจ้งครับ`;

    const followUps: FollowUpQuestion[] = followUpClauses.map((clause, idx) => ({
      id: `followup-${idx + 1}`,
      type: "clarifying",
      text: clause,
      normalizedQuestion: clause,
    }));

    return {
      originalQuestion: trimmed,
      primaryQuestion: primaryClause,
      intent: detectedIntent,
      scope,
      isMultiQuestion: true,
      subQuestions: parts,
      scopeNotice,
      original: trimmed,
      primary,
      followUps,
      resolution,
    };
  }

  // Case C: Follow-ups sharing context (conditional_follow_up or clarifying_follow_up)
  const followUps: FollowUpQuestion[] = followUpClauses.map((clause, idx) => {
    const resolved = resolveFollowUpAntecedent(primaryClause, clause, locale);
    return {
      id: `followup-${idx + 1}`,
      type: resolved.type,
      condition: resolved.condition,
      text: clause,
      normalizedQuestion: resolved.normalizedQuestion,
    };
  });

  const isConditional = followUps.some((f) => f.type === "conditional");
  const resolutionType: QuestionResolutionType = isConditional
    ? "conditional_follow_up"
    : "clarifying_follow_up";

  const resolutionReason = isConditional
    ? "The follow-up depends on the outcome of the primary question and shares the same context."
    : "The follow-up requests additional clarification or detail about the primary event.";

  return {
    originalQuestion: trimmed,
    primaryQuestion: primaryClause,
    intent: detectedIntent,
    scope,
    // Conditional/clarifying follow-up is answered in the SAME single reading
    isMultiQuestion: false,
    subQuestions: parts,
    original: trimmed,
    primary,
    followUps,
    resolution: {
      type: resolutionType,
      reason: resolutionReason,
    },
  };
}

/**
 * Helper to detect intent from text.
 */
function detectIntent(text: string): QuestionIntent {
  for (const { intent, regex } of INTENT_PATTERNS) {
    if (regex.test(text)) {
      return intent;
    }
  }
  return "general";
}
