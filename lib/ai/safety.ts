import type { ReadingSafety } from "@/types/ai";

/**
 * Crisis keywords indicating imminent self-harm or severe distress (SDD §3, §5.2).
 */
const CRISIS_PATTERNS = [
  /ฆ่าตัวตาย/i,
  /อยากตาย/i,
  /ไม่อยากอยู่แล้ว/i,
  /ไม่อยากมีชีวิต/i,
  /ทำร้ายตัวเอง/i,
  /จบชีวิต/i,
  /ตายไปให้พ้น/i,
  /ไม่อยากตื่น/i,
  /suicide/i,
  /kill\s+myself/i,
  /end\s+my\s+life/i,
  /want\s+to\s+die/i,
  /self[- ]harm/i,
  /hurt\s+myself/i,
  /take\s+my\s+(own\s+)?life/i,
];

/**
 * Sensitive patterns that require extra care and grounding without fatalistic claims (SDD §5.1).
 */
const SENSITIVE_PATTERNS = [
  /ความตาย/i,
  /โรคร้าย/i,
  /จะรอดไหม/i,
  /ติดคุก/i,
  /คดีความ/i,
  /terminal\s+illness/i,
  /fatal/i,
  /cancer/i,
  /lawsuit/i,
  /prison/i,
];

/**
 * Evaluates a question or text for safety classification.
 * Returns "crisis" | "sensitive" | "none".
 */
export function detectSafety(text: string): ReadingSafety {
  if (!text || typeof text !== "string") {
    return "none";
  }

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(text)) {
      return "crisis";
    }
  }

  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(text)) {
      return "sensitive";
    }
  }

  return "none";
}
