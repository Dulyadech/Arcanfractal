/**
 * Crisis Hotline Information & Configuration (SDD §3, Q-003)
 */
export interface CrisisResource {
  name: string;
  phone: string;
  description: string;
  availableHours: string;
}

export const CRISIS_RESOURCES: Record<"th" | "en", CrisisResource[]> = {
  th: [
    {
      name: "สายด่วนสุขภาพจิต (Mental Health Hotline)",
      phone: "1323",
      description: "โทรฟรี ปรึกษาปัญหาสุขภาพจิต ความเครียด และภาวะวิกฤตตลอด 24 ชั่วโมง",
      availableHours: "24 ชั่วโมง (โทรฟรี)",
    },
    {
      name: "สมาคมสะมาริตันส์แห่งประเทศไทย (Samaritans of Thailand)",
      phone: "02-113-6789",
      description: "บริการรับฟังด้วยใจ เพื่อป้องกันการฆ่าตัวตายและบรรเทาความทุกข์ใจ",
      availableHours: "12:00 - 22:00 น. ทุกวัน",
    },
    {
      name: "ศูนย์ช่วยเหลือสังคม สายด่วน พม.",
      phone: "1300",
      description: "รับแจ้งเหตุฉุกเฉินและวิกฤตทางสังคม ปัญหาครอบครัว และความรุนแรง",
      availableHours: "24 ชั่วโมง",
    },
  ],
  en: [
    {
      name: "Thailand Mental Health Hotline",
      phone: "1323",
      description: "Free mental health and crisis support hotline (Thai/English).",
      availableHours: "24/7 (Toll-free)",
    },
    {
      name: "The Samaritans of Thailand",
      phone: "02-113-6789",
      description: "Confidential emotional support and suicide prevention listening service.",
      availableHours: "12:00 - 22:00 Daily",
    },
    {
      name: "International Emergency & SOS",
      phone: "1155",
      description: "Tourist Police & Emergency assistance in Thailand.",
      availableHours: "24/7",
    },
  ],
};

/**
 * High-risk keywords for client-side crisis detection (SDD §3).
 * Evaluated strictly client-side to protect user privacy.
 */
const CRISIS_KEYWORDS = [
  // Thai
  "ฆ่าตัวตาย",
  "อยากตาย",
  "ไม่อยากมีชีวิต",
  "ไม่อยากอยู่",
  "ทำร้ายตัวเอง",
  "หมดหวังในชีวิต",
  "จบชีวิต",
  "ฆ่าตัว",
  "กรีดแขน",
  "กินยาตาย",
  "กระโดดตึก",
  "ตายไปเลย",
  "ลาโลก",

  // English
  "suicide",
  "kill myself",
  "want to die",
  "end my life",
  "self harm",
  "self-harm",
  "commit suicide",
  "cutting myself",
  "take my own life",
  "no reason to live",
  "better off dead",
];

export interface CrisisDetectionResult {
  isCrisis: boolean;
  matchedKeyword?: string;
}

/**
 * Evaluates whether a question or text contains crisis/self-harm keywords.
 * Returns true if crisis indicators are detected.
 */
export function detectCrisisIntent(text: string | null | undefined): CrisisDetectionResult {
  if (!text || typeof text !== "string") {
    return { isCrisis: false };
  }

  const normalized = text.toLowerCase();

  for (const keyword of CRISIS_KEYWORDS) {
    if (normalized.includes(keyword.toLowerCase())) {
      return {
        isCrisis: true,
        matchedKeyword: keyword,
      };
    }
  }

  return { isCrisis: false };
}
