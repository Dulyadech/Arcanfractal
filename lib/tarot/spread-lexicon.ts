// spread-lexicon.ts — Lexicon + signal extractor for the Spread recommender (draft, untested)

export type Signal = 'quick' | 'timeline' | 'obstacle' | 'decision';
export type Domain = 'work' | 'love' | 'money' | 'family' | 'study' | 'self';

export interface Entry {
  t: string | RegExp;
  w: number;                 // 0.8-1.0 strong, 0.4-0.6 medium, 0.2-0.3 weak
  m?: 'sub' | 'token';       // string only. default 'sub' (substring on whitespace-free text); 'token' = exact Intl.Segmenter token
  on?: 'spaced' | 'compact'; // RegExp only. default 'compact'
  neg?: boolean;             // false = negation does NOT cancel this entry (e.g. "ไม่ควร...ไหม" is still a decision)
}

// Latin strings are auto-matched with \b word boundaries on the spaced text.
// Thai text: strip whitespace and "ๆ" before matching (see normalize()).

export const LEXICON: Record<Signal, Entry[]> = {
  quick: [
    { t: 'ใบเดียว', w: 1.0 }, { t: 'ไพ่ใบเดียว', w: 1.0 }, { t: 'หนึ่งใบ', w: 0.9 },
    { t: 'ข้อความจากไพ่', w: 0.9 }, { t: 'พลังงานวันนี้', w: 0.9 }, { t: 'ไพ่ประจำวัน', w: 0.9 },
    { t: 'ขอสั้น', w: 0.8 }, { t: 'สั้น', w: 0.6 }, { t: 'ควรระวังอะไร', w: 0.7 },
    { t: 'วันนี้', w: 0.6 }, { t: 'เช้านี้', w: 0.6 }, { t: 'คืนนี้', w: 0.6 },
    { t: 'ตอนนี้', w: 0.4 }, { t: 'พรุ่งนี้', w: 0.4 }, { t: 'คำแนะนำ', w: 0.2 },
    { t: 'one card', w: 1.0 }, { t: 'single card', w: 1.0 }, { t: 'daily', w: 0.8 },
    { t: 'quick', w: 0.7 }, { t: 'today', w: 0.6 }, { t: 'tonight', w: 0.6 },
    { t: 'this morning', w: 0.6 }, { t: 'message for me', w: 0.6 },
  ],
  timeline: [
    { t: 'จะเป็นยังไงต่อ', w: 0.9 }, { t: 'จะเป็นอย่างไรต่อ', w: 0.9 }, { t: 'แนวโน้ม', w: 0.9 },
    { t: 'อดีต', w: 0.9 }, { t: 'อนาคต', w: 0.9 }, { t: 'ปัจจุบัน', w: 0.8 },
    { t: 'ที่ผ่านมา', w: 0.8 }, { t: 'ต่อจากนี้', w: 0.8 }, { t: 'ระยะยาว', w: 0.8 },
    { t: 'เดือนหน้า', w: 0.8 }, { t: 'ปีหน้า', w: 0.8 }, { t: 'สัปดาห์หน้า', w: 0.8 }, { t: 'อาทิตย์หน้า', w: 0.8 },
    { t: 'เมื่อไหร่', w: 0.7 }, { t: 'เมื่อไร', w: 0.7 }, { t: 'จะเกิดอะไรขึ้น', w: 0.7 },
    { t: 'ที่มาที่ไป', w: 0.7 }, { t: 'ย้อนกลับไป', w: 0.7 },
    { t: /(?:ภายใน|อีก)\d+(?:วัน|สัปดาห์|เดือน|ปี)/, w: 0.8 },
    { t: 'ช่วงนี้', w: 0.5 }, { t: 'เมื่อก่อน', w: 0.5 }, { t: 'ต้นเหตุ', w: 0.5 },
    { t: 'ต่อไป', w: 0.4 }, { t: 'เส้นทาง', w: 0.4 }, { t: 'ตั้งแต่', w: 0.3 }, { t: 'พรุ่งนี้', w: 0.3 },
    { t: 'timeline', w: 0.9 }, { t: 'future', w: 0.9 }, { t: 'past', w: 0.8 },
    { t: 'going forward', w: 0.8 }, { t: 'next month', w: 0.8 }, { t: 'next year', w: 0.8 },
    { t: "what's next", w: 0.8 }, { t: 'when will', w: 0.8 }, { t: 'where is this heading', w: 0.9 },
    { t: 'trend', w: 0.6 }, { t: 'how long', w: 0.6 }, { t: 'so far', w: 0.5 }, { t: 'lately', w: 0.4 },
  ],
  obstacle: [
    { t: 'แก้ปัญหา', w: 1.0 }, { t: 'ติดขัด', w: 0.9 }, { t: 'อุปสรรค', w: 0.9 }, { t: 'รับมือ', w: 0.9 },
    { t: 'ทางออก', w: 0.9 }, { t: 'ข้ามผ่าน', w: 0.8 }, { t: 'ไปต่อไม่ได้', w: 0.9 }, { t: 'จะผ่านไปได้ยังไง', w: 0.9 },
    { t: 'ทำยังไงดี', w: 0.8 }, { t: 'ทำอย่างไรดี', w: 0.8 }, { t: 'ควรทำอย่างไร', w: 0.8 }, { t: 'ควรทำยังไง', w: 0.8 },
    { t: 'ปัญหา', w: 0.7 }, { t: 'ขัดแย้ง', w: 0.7 }, { t: 'ทะเลาะ', w: 0.7 }, { t: 'ท้อ', w: 0.6, m: 'token' },
    { t: 'ทำไมถึง', w: 0.5 }, { t: 'ทำไมต้อง', w: 0.5 }, { t: 'เครียด', w: 0.5 }, { t: 'กังวล', w: 0.5 },
    { t: 'คำแนะนำ', w: 0.4 }, { t: 'สับสน', w: 0.4 }, { t: 'เหนื่อย', w: 0.4 }, { t: 'แก้ไข', w: 0.4 },
    { t: 'ไม่รู้จะ', w: 0.6, neg: false }, { t: 'ไม่สบายใจ', w: 0.5, neg: false }, { t: 'ไม่เข้าใจ', w: 0.4, neg: false },
    // NOTE: "ไม่ไหว" / hopeless phrasing belongs to the Crisis/Safety classifier, not here. Do not score it.
    { t: 'stuck', w: 0.9 }, { t: 'obstacle', w: 0.9 }, { t: 'overcome', w: 0.9 }, { t: 'how to handle', w: 0.9 },
    { t: 'how do i deal', w: 0.9 }, { t: "what's blocking", w: 0.9 }, { t: 'struggling', w: 0.7 },
    { t: 'problem', w: 0.6 }, { t: 'challenge', w: 0.6 }, { t: 'guidance', w: 0.6 }, { t: 'advice', w: 0.4 }, { t: 'why does', w: 0.4 },
  ],
  decision: [
    { t: 'ตัดสินใจ', w: 0.9 }, { t: 'ชั่งใจ', w: 0.9 }, { t: 'ทางไหนดี', w: 0.9 }, { t: 'ไปทางไหน', w: 0.8 },
    { t: 'ระหว่าง', w: 0.8 }, { t: 'ทางเลือก', w: 0.8 }, { t: 'ตัวเลือก', w: 0.8 }, { t: 'สองทาง', w: 0.8 }, { t: 'ทางแยก', w: 0.8 },
    { t: 'ภาพรวมทุกด้าน', w: 0.8 }, { t: 'ภาพรวม', w: 0.6 }, { t: 'รอบด้าน', w: 0.7 }, { t: 'holistic', w: 0.8 },
    { t: 'ลังเล', w: 0.8, neg: false }, { t: 'ไม่แน่ใจว่าควร', w: 0.9, neg: false },
    { t: 'เปลี่ยนงาน', w: 0.7 }, { t: 'เลือก', w: 0.6 }, { t: 'ลาออก', w: 0.6 }, { t: 'ดีกว่า', w: 0.6 },
    { t: 'เลิก', w: 0.5 }, { t: 'คบต่อ', w: 0.5 }, { t: 'แยกทาง', w: 0.5 }, { t: 'ย้าย', w: 0.4 },
    // "ควร...ไหม" stays a decision even after "ไม่" ("ไม่ควรลาออกไหม")
    { t: /ควร[ก-๙a-z0-9]{0,15}(?:ไหม|มั้ย|หรือไม่|ดีไหม)/, w: 0.7, neg: false },
    // "A หรือ B" but not yes/no endings ("ใช่หรือไม่", "ดีหรือเปล่า")
    { t: /[ก-๙a-z0-9]{2,}หรือ(?!ไม่|เปล่า)[ก-๙a-z0-9]{2,}/, w: 0.7 },
    { t: /(?:ใช่|ดี|จริง|ได้)?(?:หรือไม่|หรือเปล่า)/, w: 0.3, neg: false },
    { t: 'should i', w: 0.7, neg: false }, { t: 'whether to', w: 0.9 }, { t: 'which path', w: 0.9 },
    { t: 'decision', w: 0.9 }, { t: 'decide', w: 0.9 }, { t: 'torn', w: 0.8 }, { t: 'choose', w: 0.8 },
    { t: 'option', w: 0.7 }, { t: 'between', w: 0.6 }, { t: 'better to', w: 0.6 }, { t: 'quit', w: 0.5 },
    { t: /\b[a-z]{2,}(?: [a-z]+){0,3} or [a-z]{2,}/i, w: 0.5, on: 'spaced' },
  ],
};

// Used only for `complexity` (multi-domain count). Short/ambiguous words use token match.
export const DOMAINS: Record<Domain, Entry[]> = {
  work:   [{ t: 'งาน', w: 1, m: 'token' }, { t: 'ลาออก', w: 1 }, { t: 'เจ้านาย', w: 1 }, { t: 'บริษัท', w: 1 }, { t: 'ธุรกิจ', w: 1 }, { t: 'อาชีพ', w: 1 }, { t: 'career', w: 1 }, { t: 'job', w: 1 }, { t: 'boss', w: 1 }],
  love:   [{ t: 'ความรัก', w: 1 }, { t: 'แฟน', w: 1 }, { t: 'คนรัก', w: 1 }, { t: 'คนคุย', w: 1 }, { t: 'แต่งงาน', w: 1 }, { t: 'love', w: 1 }, { t: 'partner', w: 1 }, { t: 'relationship', w: 1 }],
  money:  [{ t: 'เงิน', w: 1, m: 'token' }, { t: 'หนี้', w: 1, m: 'token' }, { t: 'ลงทุน', w: 1 }, { t: 'รายได้', w: 1 }, { t: 'การเงิน', w: 1 }, { t: 'money', w: 1 }, { t: 'debt', w: 1 }, { t: 'invest', w: 1 }],
  family: [{ t: 'ครอบครัว', w: 1 }, { t: 'พ่อ', w: 1, m: 'token' }, { t: 'แม่', w: 1, m: 'token' }, { t: 'ลูก', w: 1, m: 'token' }, { t: 'พี่น้อง', w: 1 }, { t: 'family', w: 1 }, { t: 'parents', w: 1 }],
  study:  [{ t: 'เรียน', w: 1, m: 'token' }, { t: 'สอบ', w: 1, m: 'token' }, { t: 'มหาวิทยาลัย', w: 1 }, { t: 'ฝึกงาน', w: 1 }, { t: 'study', w: 1 }, { t: 'exam', w: 1 }],
  self:   [{ t: 'ตัวเอง', w: 1 }, { t: 'เป้าหมาย', w: 1 }, { t: 'สุขภาพใจ', w: 1 }, { t: 'myself', w: 1 }, { t: 'goal', w: 1 }],
};

export const CONJUNCTIONS = ['แต่', 'และ', 'แล้ว', 'เพราะ', 'ถ้า', 'หาก', 'ในขณะที่', 'เนื่องจาก', 'ดังนั้น', 'ส่วน', 'นอกจากนี้',
  'but', 'and', 'because', 'if', 'while', 'so', 'however'];

// ---------- extractor ----------
const NEG_TH = /(?:ไม่|อย่า|ห้าม)(?:ต้อง|อยาก|ได้|มี|ค่อย|เคย)*(?:รู้|ถาม|ดู|สนใจ)?(?:เรื่อง|เกี่ยวกับ)?(?:ที่|ใน)?$/;
const NEG_EN = /\b(?:no|not|never|without|don't|dont|doesn't)\s+(?:\w+\s+){0,2}$/i;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isLatin = (s: string) => /^[a-z0-9' ]+$/i.test(s);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = new Intl.Segmenter('th', { granularity: 'word' });

interface Ctx { spaced: string; compact: string; tokens: Set<string>; tokenList: string[] }

export function normalize(raw: string): Ctx {
  const spaced = raw.normalize('NFC').toLowerCase().replace(/ๆ/g, '').replace(/\s+/g, ' ').trim();
  const tokenList = [...seg.segment(spaced)].filter(s => s.isWordLike).map(s => s.segment);
  return { spaced, compact: spaced.replace(/\s+/g, ''), tokens: new Set(tokenList), tokenList };
}

function matches(e: Entry, c: Ctx): boolean {
  let hay = c.compact, idx = -1;
  if (typeof e.t !== 'string') {
    hay = e.on === 'spaced' ? c.spaced : c.compact;
    const r = e.t.exec(hay); if (!r) return false; idx = r.index;
  } else if (isLatin(e.t)) {
    hay = c.spaced;
    const r = new RegExp(`\\b${esc(e.t)}\\b`, 'i').exec(hay); if (!r) return false; idx = r.index;
  } else if (e.m === 'token') {
    return c.tokens.has(e.t);                       // no negation check for token matches
  } else {
    idx = hay.indexOf(e.t); if (idx < 0) return false;
  }
  if (e.neg === false) return true;
  const before = hay.slice(Math.max(0, idx - 16), idx);
  const negated = (hay === c.spaced ? NEG_EN : NEG_TH).test(before);
  return !negated;                                  // negated hit contributes nothing
}

const noisyOr = (ws: number[]) => 1 - ws.reduce((p, w) => p * (1 - w), 1);   // many weak hits saturate toward 1, never exceed it

export function countChars(s: string) {
  return [...s.replace(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\s]/g, '')].length;  // drop Thai combining marks + spaces
}

export function extractSignals(raw: string) {
  const c = normalize(raw);
  const out = { quick: 0, timeline: 0, obstacle: 0, decision: 0, complexity: 0 };
  (Object.keys(LEXICON) as Signal[]).forEach(s => {
    out[s] = clamp(noisyOr(LEXICON[s].filter(e => matches(e, c)).map(e => e.w)));
  });

  const chars = countChars(raw);
  if (chars >= 1 && chars <= 25 && out.quick > 0 && out.timeline < 0.3 && out.obstacle < 0.3 && out.decision < 0.3) {
    out.quick = Math.max(out.quick, 0.5);
  }

  const domains = (Object.keys(DOMAINS) as Domain[]).filter(d => DOMAINS[d].some(e => matches(e, c))).length;
  const clauses = c.tokenList.filter(t => CONJUNCTIONS.includes(t)).length + (raw.match(/[,;\n]/g)?.length ?? 0);
  const lenScore = clamp((chars - 40) / 160);
  const clauseScore = clamp((clauses - 1) / 4);
  const domainScore = [0, 0, 0.5, 1][Math.min(domains, 3)];
  out.complexity = chars < 20 ? 0 : clamp(0.3 * lenScore + 0.25 * clauseScore + 0.45 * domainScore);
  return out;
}

// ---------- golden cases to start the Vitest suite ----------
export const GOLDEN: { q: string; expect: Partial<Record<Signal | 'complexity', 'high' | 'low'>> }[] = [
  { q: 'วันนี้ควรระวังอะไรเป็นพิเศษ', expect: { quick: 'high', decision: 'low' } },
  { q: 'ไม่ติดขัดอะไรหรอก แค่อยากรู้ภาพรวม', expect: { obstacle: 'low' } },
  { q: 'ไม่อยากรู้เรื่องอนาคต ขอดูปัจจุบันอย่างเดียว', expect: { timeline: 'low' } },   // "อนาคต" negated; "ปัจจุบัน" is still a hit, so tune this case
  { q: 'ฉันไม่ควรลาออกไหม', expect: { decision: 'high' } },
  { q: 'ไม่รู้จะทำยังไงดีกับเรื่องนี้', expect: { obstacle: 'high' } },
  { q: 'ควรลาออกไปทำธุรกิจหรืออยู่ต่อ แล้วเงินเก็บพอไหม แฟนก็อยากให้ย้าย', expect: { decision: 'high', complexity: 'high' } },
  { q: 'should I quit my job or stay', expect: { decision: 'high' } },
];
