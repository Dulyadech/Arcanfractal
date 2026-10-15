import { getCardById } from "@/data/cards";
import { getThaiCardDetail } from "@/data/cards/thai-meanings";
import { callKKUIntelSphere } from "@/lib/ai/providers/kku";
import { callGemini } from "@/lib/ai/providers/gemini";
import type { CardOrientation, DrawnCard, TarotCard } from "@/types/tarot";
import type { DailyCardInterpretation } from "@/types/daily";

interface DualDailyInterpretation {
  th: DailyCardInterpretation;
  en: DailyCardInterpretation;
}

/**
 * Curated Major Arcana micro-interpretations for daily reflection (Cards 0–21).
 */
const MAJOR_INTERPRETATIONS: Record<
  string,
  {
    upright: DualDailyInterpretation;
    reversed: DualDailyInterpretation;
  }
> = {
  fool: {
    upright: {
      en: {
        theme: "New Horizons & Untamed Trust",
        affirmation: "I welcome new beginnings with pure curiosity and an open heart.",
        advice: "Take a courageous leap into something unfamiliar today without overanalyzing.",
      },
      th: {
        theme: "จุดเริ่มต้นใหม่และความไว้วางใจ",
        affirmation: "ฉันเปิดรับการเริ่มต้นใหม่ด้วยความอยากรู้และหัวใจที่เปิดกว้าง",
        advice: "ลองกล้าก้าวออกจากกรอบความคุ้นเคยเดิมๆ สักหนึ่งอย่างในวันนี้",
      },
    },
    reversed: {
      en: {
        theme: "Mindful Grounding & Prudence",
        affirmation: "I honor my boundaries and act with deliberate awareness.",
        advice: "Look carefully before you leap; ensure your enthusiasm is paired with practical reality.",
      },
      th: {
        theme: "การตั้งหลักอย่างมีสติและความรอบคอบ",
        affirmation: "ฉันเคารพขอบเขตของตนเองและลงมือทำอย่างมีสติสัมปชัญญะ",
        advice: "หยุดคิดและตรวจสอบรายละเอียดให้ถี่ถ้วนก่อนตัดสินใจทำสิ่งใดแบบหุนหันพลันแล่น",
      },
    },
  },
  magician: {
    upright: {
      en: {
        theme: "Creative Mastery & Active Will",
        affirmation: "I possess all the inner resources needed to manifest my intention.",
        advice: "Focus your skills on a single high-priority goal and execute with conviction.",
      },
      th: {
        theme: "พลังแห่งการสร้างสรรค์และความมุ่งมั่น",
        affirmation: "ฉันมีศักยภาพและทรัพยากรพร้อมอยู่ภายในตัว เพื่อสร้างสรรค์เป้าหมายให้เป็นจริง",
        advice: "รวบรวมทักษะที่มีและลงมือทำเป้าหมายสำคัญอันดับหนึ่งด้วยความเชื่อมั่น",
      },
    },
    reversed: {
      en: {
        theme: "Inner Alignment & Reclaiming Focus",
        affirmation: "I channel my gifts toward sincere and constructive purposes.",
        advice: "Beware of scattering your energy or deceiving yourself about what truly matters.",
      },
      th: {
        theme: "การจัดระเบียบสมาธิและการดึงพลังกลับมา",
        affirmation: "ฉันใช้พลังและความสามารถเพื่อความจริงใจและเป้าหมายที่สร้างสรรค์",
        advice: "หลีกเลี่ยงการทำหลายอย่างพร้อมกันจนพลังงานกระจัดกระจาย หรือหลงทางกับสิ่งล่อใจ",
      },
    },
  },
  "high-priestess": {
    upright: {
      en: {
        theme: "Intuitive Knowing & Sacred Silence",
        affirmation: "I trust the quiet, steady whispers of my inner wisdom.",
        advice: "Spend time in quiet reflection today; the answers you seek reside beneath the surface noise.",
      },
      th: {
        theme: "ญาณหยั่งรู้และความสงบนิ่ง",
        affirmation: "ฉันไว้วางใจในเสียงกระซิบอันเงียบสงบแต่ชัดเจนของปัญญาญาณภายใน",
        advice: "หาเวลาอยู่กับความเงียบและฟังเสียงหัวใจตนเอง คำตอบที่ตามหาซ่อนอยู่ใต้ความวุ่นวายภายนอก",
      },
    },
    reversed: {
      en: {
        theme: "Reconnecting to Your Inner Compass",
        affirmation: "I tune out external chatter and honor my inner truth.",
        advice: "Do not dismiss your gut feelings just to satisfy others' opinions.",
      },
      th: {
        theme: "การเชื่อมต่อเข็มทิศภายในตนเองอีกครั้ง",
        affirmation: "ฉันลดเสียงรบกวนภายนอกลง และหันมาเคารพความจริงในใจของตนเอง",
        advice: "อย่ามองข้ามสัญชาตญาณหรือความรู้สึกลึกๆ เพียงเพื่อเอาใจความเห็นของคนรอบข้าง",
      },
    },
  },
  empress: {
    upright: {
      en: {
        theme: "Abundant Nurturing & Sensorial Grace",
        affirmation: "I am worthy of receiving abundance, ease, and gentle care.",
        advice: "Nurture yourself and those around you with warmth, beauty, and patience.",
      },
      th: {
        theme: "ความอุดมสมบูรณ์และการโอบอุ้มดูแล",
        affirmation: "ฉันคู่ควรกับการเปิดรับความอุดมสมบูรณ์ ความสุขสบาย และการดูแลอย่างอ่อนโยน",
        advice: "เติมเต็มพลังใจให้ตนเองและแบ่งปันความอบอุ่น ความเอื้ออาทรให้แก่คนรอบข้าง",
      },
    },
    reversed: {
      en: {
        theme: "Restoring Self-Care & Boundaries",
        affirmation: "I refill my own cup before attempting to pour for the world.",
        advice: "Step back from overextending yourself; prioritize quiet restorative rest.",
      },
      th: {
        theme: "การฟื้นฟูตนเองและการจัดสมดุล",
        affirmation: "ฉันเติมพลังใจให้ตนเองเต็มเปี่ยม ก่อนที่จะออกไปแบกรับเรื่องราวของผู้อื่น",
        advice: "ถอยออกมาจากการดูแลคนอื่นจนลืมดูแลตัวเอง ให้เวลากับการพักผ่อนเพื่อฟื้นคืนพลัง",
      },
    },
  },
  emperor: {
    upright: {
      en: {
        theme: "Steadfast Structure & Noble Discipline",
        affirmation: "I cultivate steady discipline and establish clear, healthy order.",
        advice: "Build structured clarity in your routine and stand firm in your leadership.",
      },
      th: {
        theme: "ความมั่นคง วินัย และโครงสร้างที่ชัดเจน",
        affirmation: "ฉันสร้างวินัยที่สม่ำเสมอและวางรากฐานชีวิตด้วยความชัดเจน",
        advice: "จัดระเบียบตารางชีวิตให้เป็นระบบ และกล้าตัดสินใจในฐานะผู้นำชีวิตตนเอง",
      },
    },
    reversed: {
      en: {
        theme: "Softening Control & Embracing Flexibility",
        affirmation: "I release the urge to control every outcome and flow with grace.",
        advice: "Loosen rigid expectations; true strength adapts where stiffness breaks.",
      },
      th: {
        theme: "การผ่อนคลายการควบคุมและยืดหยุ่น",
        affirmation: "ฉันปลดปล่อยความอยากควบคุมทุกสิ่ง และยอมรับการลื่นไหลตามจังหวะเวลา",
        advice: "ลดความตึงเครียดหรือความเข้มงวดเกินไป ความยืดหยุ่นคือความเข้มแข็งที่แท้จริง",
      },
    },
  },
  hierophant: {
    upright: {
      en: {
        theme: "Timeless Wisdom & Community Learning",
        affirmation: "I honor shared knowledge while staying true to my evolving values.",
        advice: "Seek counsel from trusted mentors or reflect on enduring principles.",
      },
      th: {
        theme: "ภูมิปัญญาดั้งเดิมและการเรียนรู้ร่วมกัน",
        affirmation: "ฉันเคารพปัญญาความรู้ที่สืบทอดมา ควบคู่ไปกับการเติบโตของค่านิยมในใจฉัน",
        advice: "เปิดรับคำแนะนำจากผู้มีประสบการณ์ หรือทบทวนหลักการพื้นฐานที่ใช้ยึดเหนี่ยวจิตใจ",
      },
    },
    reversed: {
      en: {
        theme: "Authentic Path & Personal Truth",
        affirmation: "I forge my own sacred path with courage and personal integrity.",
        advice: "Question conventional dogmas that no longer serve your genuine well-being.",
      },
      th: {
        theme: "เส้นทางของตนเองและความจริงแท้",
        affirmation: "ฉันกล้าหาญที่จะเลือกเส้นทางชีวิตของตนเองด้วยความซื่อสัตย์ต่อใจ",
        advice: "กล้าตั้งคำถามกับกฎเกณฑ์เดิมๆ หรือความคาดหวังของสังคมที่ไม่ตอบโจทย์ตัวตนคุณอีกต่อไป",
      },
    },
  },
  lovers: {
    upright: {
      en: {
        theme: "Harmonious Union & Value-Driven Choice",
        affirmation: "I choose relationships and decisions that align with my core values.",
        advice: "Make choices from love and mutual respect rather than fear or scarcity.",
      },
      th: {
        theme: "ความกลมเกลียวและการเลือกตามหัวใจ",
        affirmation: "ฉันเลือกความสัมพันธ์และการตัดสินใจที่สอดคล้องกับคุณค่าที่แท้จริงในใจ",
        advice: "ตัดสินใจในเรื่องสำคัญด้วยความรักและความเคารพซึ่งกันและกัน แทนที่จะขับเคลื่อนด้วยความกลัว",
      },
    },
    reversed: {
      en: {
        theme: "Inner Reconciliation & Self-Alignment",
        affirmation: "I heal inner conflicts by making peace with all facets of who I am.",
        advice: "Address misunderstandings with honesty; realign with your own moral compass first.",
      },
      th: {
        theme: "การคืนดีกับตนเองและความปรองดองภายใน",
        affirmation: "ฉันคลี่คลายความขัดแย้งในใจด้วยการยอมรับและโอบกอดทุกด้านของตนเอง",
        advice: "ปรับความเข้าใจในสิ่งที่ค้างคาด้วยความจริงใจ และเริ่มต้นจากการรักและยอมรับตัวเองก่อน",
      },
    },
  },
  chariot: {
    upright: {
      en: {
        theme: "Determined Focus & Victorious Momentum",
        affirmation: "I steer my willpower toward purposeful triumph through inner discipline.",
        advice: "Channel opposing forces into a unified direction; press forward with poise.",
      },
      th: {
        theme: "ความมุ่งมั่น แรงขับเคลื่อน และชัยชนะ",
        affirmation: "ฉันบังคับทิศทางชีวิตสู่ชัยชนะด้วยวินัยและเจตจำนงอันแน่วแน่",
        advice: "รวบรวมสมาธิ มุ่งตรงไปข้างหน้า และควบคุมอารมณ์ให้เป็นพลังในการก้าวข้ามอุปสรรค",
      },
    },
    reversed: {
      en: {
        theme: "Pacing Your Momentum & Reassessing Route",
        affirmation: "I pause to recalibrate my direction before expending further energy.",
        advice: "If you feel pushed or stalled, do not force the pace; pause to steady the reins.",
      },
      th: {
        theme: "การชะลอจังหวะและการปรับเส้นทาง",
        affirmation: "ฉันหยุดพักเพื่อจัดทิศทางใหม่ ก่อนที่จะทุ่มเทพลังงานไปอย่างเปล่าประโยชน์",
        advice: "อย่าฝืนดันไปข้างหน้าเมื่อรู้สึกติดขัด การหยุดพักประเมินสถานการณ์จะช่วยเซฟพลังคุณได้มาก",
      },
    },
  },
  strength: {
    upright: {
      en: {
        theme: "Compassionate Courage & Calm Resilience",
        affirmation: "My gentleness is my greatest power; I meet adversity with composure.",
        advice: "Tame difficult emotions with patience and love rather than harsh confrontation.",
      },
      th: {
        theme: "ความกล้าหาญอันอ่อนโยนและความอดทน",
        affirmation: "ความอ่อนโยนคือพลังที่ยิ่งใหญ่ที่สุดของฉัน ฉันเผชิญหน้ากับความท้าทายด้วยความสงบ",
        advice: "เอาชนะความยากลำบากและอารมณ์ที่พลุ่งพล่านด้วยความเมตตาและความอดทน",
      },
    },
    reversed: {
      en: {
        theme: "Self-Kindness & Restoring Inner Faith",
        affirmation: "I am patient with my vulnerabilities; my worth is unshakable.",
        advice: "Forgive yourself for moments of doubt; quiet reassurance will replenish your strength.",
      },
      th: {
        theme: "ความเมตตาต่อตนเองและการฟื้นฟูศรัทธา",
        affirmation: "ฉันอดทนกับความเปราะบางของตนเอง คุณค่าในตัวฉันมั่นคงไม่สั่นคลอน",
        advice: "ให้อภัยตนเองในวันที่เหนื่อยล้า พักผ่อนและเตือนตัวเองว่าคุณเข้มแข็งกว่าที่คิดเสมอ",
      },
    },
  },
  hermit: {
    upright: {
      en: {
        theme: "Soulful Introspection & Guiding Light",
        affirmation: "In the quiet stillness of solitude, my inner lantern burns bright.",
        advice: "Carve out sacred personal time to ponder what truly feeds your soul.",
      },
      th: {
        theme: "การสำรวจจิตวิญญาณและแสงสว่างนำทาง",
        affirmation: "ในความสงบเงียบของความสันโดษ ตะเกียงแห่งปัญญาภายในตัวฉันส่องสว่างเสมอ",
        advice: "จัดเวลาอยู่กับตัวเองเงียบๆ เพื่อทบทวนสิ่งที่มีความหมายต่อจิตใจอย่างแท้จริง",
      },
    },
    reversed: {
      en: {
        theme: "Re-emerging into Connection",
        affirmation: "I open my heart to the warmth of meaningful connection.",
        advice: "Avoid isolating yourself into stagnation; reach out to a trusted companion.",
      },
      th: {
        theme: "การเปิดใจเชื่อมต่อกับโลกภายนอก",
        affirmation: "ฉันเปิดใจรับความอบอุ่นและการเชื่อมโยงที่มีความหมายกับผู้คน",
        advice: "อย่าเก็บตัวอยู่คนเดียวนานจนกลายเป็นความโดดเดี่ยว ลองพูดคุยกับเพื่อนที่ไว้ใจได้",
      },
    },
  },
  "wheel-of-fortune": {
    upright: {
      en: {
        theme: "Serendipity & Embracing Cycles",
        affirmation: "I welcome the ever-turning wheel of life with trust and agility.",
        advice: "Seize unexpected opportunities today; when fortune smiles, step forward.",
      },
      th: {
        theme: "วัฏจักรแห่งชีวิตและจังหวะโอกาส",
        affirmation: "ฉันโอบรับการหมุนเวียนของกงล้อแห่งชีวิตด้วยความไว้วางใจและความพร้อมปรับตัว",
        advice: "เปิดรับโอกาสที่ไม่คาดคิดในวันนี้ จังหวะเวลาที่ดีกำลังเปิดประตูให้คุณ",
      },
    },
    reversed: {
      en: {
        theme: "Accepting Transience & Steady Grounding",
        affirmation: "This phase too shall pass; I anchor myself in what is unchanging within.",
        advice: "Do not resist temporary flux; focus your energy solely on what is within your control.",
      },
      th: {
        theme: "การยอมรับความเปลี่ยนแปลงและการตั้งมั่น",
        affirmation: "ช่วงเวลานี้จะผ่านพ้นไป ฉันยึดมั่นกับความสงบภายในที่ไม่แปรเปลี่ยน",
        advice: "อย่าฝืนสิ่งที่อยู่นอกเหนือการควบคุม โฟกัสเฉพาะสิ่งที่คุณจัดการได้ในปัจจุบัน",
      },
    },
  },
  justice: {
    upright: {
      en: {
        theme: "Fair Balance & Unwavering Truth",
        affirmation: "I speak and act with integrity, honoring truth and balanced judgment.",
        advice: "Weigh decisions objectively; take responsibility for your choices with quiet dignity.",
      },
      th: {
        theme: "ความยุติธรรม ความสมดุล และความจริงแท้",
        affirmation: "ฉันพูดและลงมือทำด้วยความซื่อตรง เคารพความจริงและความสมดุลในทุกมิติ",
        advice: "ชั่งน้ำหนักข้อเท็จจริงอย่างเป็นกลาง และกล้ารับผิดชอบต่อการตัดสินใจของตนเองอย่างสง่างาม",
      },
    },
    reversed: {
      en: {
        theme: "Restoring Self-Honesty & Amends",
        affirmation: "I release harsh self-judgment and choose honest accountability.",
        advice: "Examine where bias or rationalization has entered; make amends where appropriate.",
      },
      th: {
        theme: "ความซื่อสัตย์ต่อตนเองและการเยียวยาความผิดพลาด",
        affirmation: "ฉันปล่อยวางการตัดสินตัวเองอย่างรุนแรง และเลือกที่จะซื่อสัตย์กับความเป็นจริง",
        advice: "ทบทวนว่ามีสิ่งใดที่ลำเอียงหรือหลอกตัวเองอยู่หรือไม่ แก้ไขให้ถูกต้องเพื่อความสบายใจ",
      },
    },
  },
  "hanged-man": {
    upright: {
      en: {
        theme: "Enlightened Surrender & Fresh Perspectives",
        affirmation: "I surrender the need to rush, welcoming wisdom from a novel perspective.",
        advice: "Pause and look at your current challenge from the opposite viewpoint.",
      },
      th: {
        theme: "การปล่อยวางมุมมองเดิมและการสลับมุมคิด",
        affirmation: "ฉันสละความรีบร้อนและเปิดรับปัญญาจากมุมมองใหม่ที่ไม่คุ้นเคย",
        advice: "หยุดพักสักครู่แล้วลองมองปัญหาเดิมจากมุมมองที่ตรงกันข้าม คุณจะเห็นทางออกที่มองข้ามไป",
      },
    },
    reversed: {
      en: {
        theme: "Breaking Free from Stagnation",
        affirmation: "I step out of unnecessary sacrifice and claim forward movement.",
        advice: "Do not remain stuck in waiting mode out of habit; take a conscious step to move on.",
      },
      th: {
        theme: "การหลุดพ้นจากความชะงักงัน",
        affirmation: "ฉันก้าวออกจากความเสียสละที่สูญเปล่า และเริ่มขยับชีวิตไปข้างหน้า",
        advice: "หยุดผัดวันประกันพรุ่งหรือรอคอยอย่างไร้จุดหมาย ถึงเวลาตัดสินใจเดินหน้าต่อได้แล้ว",
      },
    },
  },
  death: {
    upright: {
      en: {
        theme: "Sacred Rebirth & Transformative Closure",
        affirmation: "I gracefully release the old to make sacred space for radiant new growth.",
        advice: "Let go of an outdated habit, thought, or attachment that has completed its season.",
      },
      th: {
        theme: "การสิ้นสุดเพื่อเกิดใหม่และการเปลี่ยนแปลง",
        affirmation: "ฉันปล่อยวางสิ่งเก่าๆ อย่างสง่างาม เพื่อเปิดพื้นที่ให้สิ่งใหม่ที่สดใสเติบโต",
        advice: "บอกลาความเคยชิน ความคิด หรือความผูกพันที่หมดเวลาลง เพื่อต้อนรับบทใหม่ของชีวิต",
      },
    },
    reversed: {
      en: {
        theme: "Overcoming Resistance to Change",
        affirmation: "I loosen my grip on what has expired; I am safe to evolve.",
        advice: "Notice where fear of the unknown is holding you back; take one small step toward closure.",
      },
      th: {
        theme: "การคลายความกลัวต่อความเปลี่ยนแปลง",
        affirmation: "ฉันคลายมือจากสิ่งที่หมดเวลาแล้ว ฉันปลอดภัยและพร้อมที่จะเติบโตต่อไป",
        advice: "สังเกตความกลัวที่รั้งคุณไว้ ค่อยๆ ปล่อยวางทีละน้อยเพื่อไม่ให้แบกรับอดีตหนักเกินไป",
      },
    },
  },
  temperance: {
    upright: {
      en: {
        theme: "Alchemical Harmony & Gentle Moderation",
        affirmation: "I blend diverse elements of my life into a peaceful, flowing synthesis.",
        advice: "Practice moderation in actions and emotions today; seek the golden middle path.",
      },
      th: {
        theme: "ความกลมกลืน ความพอดี และความสมดุลอันประณีต",
        affirmation: "ฉันผสมผสานทุกแง่มุมของชีวิตให้หลอมรวมเป็นความสงบและลื่นไหล",
        advice: "รักษาสายกลางในอารมณ์และการกระทำ ไม่ตึงและไม่หย่อนจนเกินไป",
      },
    },
    reversed: {
      en: {
        theme: "Re-centering After Extremes",
        affirmation: "I return to my sacred center and restore gentle equilibrium.",
        advice: "Identify where you have swung into excess or fatigue; bring yourself gently back to baseline.",
      },
      th: {
        theme: "การกลับคืนสู่จุดกึ่งกลาง",
        affirmation: "ฉันกลับคืนสู่จุดศูนย์กลางอันสงบและฟื้นฟูสมดุลของชีวิต",
        advice: "สังเกตจุดที่คุณใช้แรงหรืออารมณ์มากเกินไป พักฟื้นและปรับจังหวะชีวิตให้กลับมาพอดี",
      },
    },
  },
  devil: {
    upright: {
      en: {
        theme: "Unmasking Shadow & Conscious Liberation",
        affirmation: "I acknowledge hidden attachments and consciously choose my freedom.",
        advice: "Examine patterns where you surrender power to compulsion, fear, or external validation.",
      },
      th: {
        theme: "การรู้เท่าทันเงามืดและอิสรภาพแห่งใจ",
        affirmation: "ฉันตระหนักรู้ถึงพันธนาการที่ซ่อนอยู่ และเลือกอิสรภาพของตนเองอย่างมีสติ",
        advice: "สังเกตพฤติกรรมหรือความอยากที่ทำให้คุณตกเป็นทาสของมัน แล้วเลือกที่จะก้าวถอยออกมา",
      },
    },
    reversed: {
      en: {
        theme: "Breaking Free & Reclaiming Autonomy",
        affirmation: "The chains fall away; I step joyfully into sovereignty and light.",
        advice: "Celebrate a recent breakthrough in self-discipline or freedom from an old crutch.",
      },
      th: {
        theme: "การปลดแอกและทวงคืนอิสรภาพ",
        affirmation: "โซ่ตรวนแห่งความกลัวคลายออก ฉันก้าวสู่ความมีอำนาจในตนเองอย่างสง่างาม",
        advice: "ชื่นชมตนเองที่เอาชนะนิสัยหรือความคิดแย่ๆ ในอดีตได้ เดินหน้าสู่ความสุขที่แท้จริง",
      },
    },
  },
  tower: {
    upright: {
      en: {
        theme: "Illuminating Breakthrough & Breakthrough Truth",
        affirmation: "I welcome liberating revelations that shatter false assumptions.",
        advice: "Let unstable illusions collapse; clear the ground for authentic foundations.",
      },
      th: {
        theme: "การพังทลายของสิ่งลวงตาสู่ความจริงแท้",
        affirmation: "ฉันเปิดรับความจริงที่ช่วยปลดปล่อยฉัน แม้จะสั่นคลอนความเชื่อเดิมๆ",
        advice: "ยอมรับความจริงที่เปิดเผยออกมา ปล่อยให้สิ่งที่ไม่มั่นคงพังทลาย เพื่อสร้างสิ่งใหม่ที่แข็งแรงกว่า",
      },
    },
    reversed: {
      en: {
        theme: "Averting Crisis & Deep Rebuilding",
        affirmation: "I rebuild my inner sanctuary upon unshakeable truth.",
        advice: "Do not cling to crumbling structures out of fear; initiate the necessary repairs yourself.",
      },
      th: {
        theme: "การฟื้นตัวและการรื้อสร้างอย่างปลอดภัย",
        affirmation: "ฉันสร้างวิหารแห่งจิตใจขึ้นใหม่บนรากฐานของความจริงที่ไม่อาจสั่นคลอน",
        advice: "อย่ารอให้สถานการณ์บีบคั้นจนระเบิด ชิงลงมือแก้ไขจุดบกพร่องด้วยความสุขุมเสียแต่วันนี้",
      },
    },
  },
  star: {
    upright: {
      en: {
        theme: "Serene Hope & Celestial Healing",
        affirmation: "Hope flows abundantly into my spirit; the universe guides my path.",
        advice: "Pour your pure inspiration into the world; trust that tranquil blessings are unfolding.",
      },
      th: {
        theme: "ความหวัง แสงสว่างนำทาง และการเยียวยาใจ",
        affirmation: "ความหวังไหลรินสู่จิตใจฉัน จักรวาลคอยชี้แนะและโอบอุ้มการเดินทางของฉันเสมอ",
        advice: "เชื่อมั่นในอนาคตอันสดใส มอบกำลังใจให้ผู้อื่น และเปิดใจรับการเยียวยาจิตวิญญาณ",
      },
    },
    reversed: {
      en: {
        theme: "Rekindling Faith & Inner Spark",
        affirmation: "Even in moments of gloom, my guiding star is always present above.",
        advice: "Do not lose faith when progress feels quiet; look for subtle miracles in the present.",
      },
      th: {
        theme: "การจุดประกายศรัทธาและความหวังอีกครั้ง",
        affirmation: "แม้ในวันที่มืดมิด ดวงดาวนำทางของฉันยังคงส่องสว่างอยู่เสมอในใจ",
        advice: "อย่าเพิ่งท้อแท้ในยามที่มองไม่เห็นผลลัพธ์ชัดเจน มองหาเรื่องดีๆ เล็กๆ รอบตัวในวันนี้",
      },
    },
  },
  moon: {
    upright: {
      en: {
        theme: "Mystical Dreams & Piercing the Veil",
        affirmation: "I navigate the depths of the unknown with calm, intuitive clarity.",
        advice: "Do not rush to conclusions when things appear murky; allow hidden truths to unveil themselves.",
      },
      th: {
        theme: "ความลึกลับ จิตใต้สำนึก และความคลุมเครือ",
        affirmation: "ฉันเดินทางผ่านความไม่แน่นอนด้วยความสงบนิ่งและปัญญาญาณหยั่งรู้",
        advice: "อย่าเพิ่งด่วนตัดสินสิ่งใดในขณะที่ข้อมูลยังไม่ชัดเจน ให้เวลาความจริงเผยตัวออกมา",
      },
    },
    reversed: {
      en: {
        theme: "Dispersing Fog & Clarity of Mind",
        affirmation: "Illusion recedes; clarity and confidence illuminate my path.",
        advice: "Acknowledge where anxiety exaggerated your worries; focus on verified facts.",
      },
      th: {
        theme: "หมอกควันจางหายสู่ความกระจ่างแจ้ง",
        affirmation: "ภาพลวงตาและจินตนาการด้านลบจางหายไป ความชัดเจนกลับคืนสู่ใจฉัน",
        advice: "แยกแยะความจริงออกจากความวิตกกังวล สิ่งที่คุณกลัวมักไม่ได้ร้ายแรงอย่างที่คิด",
      },
    },
  },
  sun: {
    upright: {
      en: {
        theme: "Radiant Vitality & Pure Joy",
        affirmation: "I radiate warmth, vitality, and authentic joy wherever I go.",
        advice: "Step boldly into the sunlight; celebrate your accomplishments and share your light generously.",
      },
      th: {
        theme: "ความสดใส พลังชีวิต และความสุขเปี่ยมล้น",
        affirmation: "ฉันเปล่งประกายความอบอุ่น พลังชีวิต และความสุขที่แท้จริงในทุกย่างก้าว",
        advice: "ยิ้มรับวันใหม่อย่างสดใส ภูมิใจในตนเอง และแบ่งปันพลังบวกให้กับทุกคนรอบข้าง",
      },
    },
    reversed: {
      en: {
        theme: "Uncovering Hidden Sunshine",
        affirmation: "My joy lives within me, independent of fleeting outer conditions.",
        advice: "If feelings feel overcast, remember the sun remains behind the clouds; nurture your inner child.",
      },
      th: {
        theme: "การค้นหาความสุขที่ซ่อนอยู่ภายใน",
        affirmation: "ความสุขมีอยู่เสมอในใจฉัน ไม่ได้ขึ้นอยู่กับสถานการณ์ภายนอก",
        advice: "หากวันนี้รู้สึกหม่นหมอง ให้จำไว้ว่าพระอาทิตย์ยังอยู่หลังก้อนเมฆ ทำสิ่งที่ทำให้ยิ้มได้สักเรื่อง",
      },
    },
  },
  judgement: {
    upright: {
      en: {
        theme: "Awakening Calling & Clear Evaluation",
        affirmation: "I answer the call to step into my highest potential with clarity.",
        advice: "Heed the promptings of your higher self; shed past regrets and step into renewal.",
      },
      th: {
        theme: "การตื่นรู้ การตัดสินใจครั้งสำคัญ และการเกิดใหม่",
        affirmation: "ฉันตอบรับเสียงเรียกเพื่อก้าวสู่ศักยภาพสูงสุดของตนเองด้วยความตื่นรู้",
        advice: "ทบทวนบทเรียนในอดีต ปล่อยวางความเสียดาย แล้วกล้าเริ่มต้นบทใหม่ที่คู่ควรกับคุณ",
      },
    },
    reversed: {
      en: {
        theme: "Silencing Self-Doubt & Forgiveness",
        affirmation: "I release harsh self-criticism and grant myself absolute grace.",
        advice: "Stop second-guessing past choices; forgive yourself so you can hear today's guidance.",
      },
      th: {
        theme: "การให้อภัยตนเองและการหยุดตัดสิน",
        affirmation: "ฉันปล่อยวางการตำหนิตนเอง และมอบความรักความเมตตาให้อย่างหมดหัวใจ",
        advice: "เลิกจมอยู่กับความผิดพลาดในอดีต ให้อภัยตัวเองแล้วเริ่มต้นใหม่ด้วยใจที่เบาสบาย",
      },
    },
  },
  world: {
    upright: {
      en: {
        theme: "Sacred Wholeness & Radiant Completion",
        affirmation: "I celebrate this cycle of fulfillment and stand complete in my being.",
        advice: "Acknowledge how far you have journeyed; savor this moment of integration and triumph.",
      },
      th: {
        theme: "ความสมบูรณ์แบบ ความสำเร็จ และการบรรลุเป้าหมาย",
        affirmation: "ฉันเฉลิมฉลองการเดินทางที่เดินทางมาถึงความสำเร็จ ฉันสมบูรณ์พร้อมในตัวเอง",
        advice: "ชื่นชมการเดินทางของตนเอง ดื่มด่ำกับความสำเร็จที่ได้ทุ่มเท และพร้อมก้าวสู่รอบใหม่ของชีวิต",
      },
    },
    reversed: {
      en: {
        theme: "Closing Lingering Loops & Gentle Completion",
        affirmation: "I tie up remaining threads with patience, knowing fulfillment is near.",
        advice: "Complete that one unfinished detail that is preventing you from stepping fully into the next phase.",
      },
      th: {
        theme: "การสะสางสิ่งที่คั่งค้างสู่ความลงตัว",
        affirmation: "ฉันเก็บรายละเอียดที่ค้างคาด้วยความอดทน ความสำเร็จรออยู่เบื้องหน้า",
        advice: "สะสางงานหรือความรู้สึกที่ยังค้างคาอีกเพียงนิดเดียว เพื่อให้ทุกอย่างจบลงอย่างงดงาม",
      },
    },
  },
};

/**
 * Minor Arcana Suit Theme and Affirmation Fallback Generators.
 */
function getMinorArcanaInterpretation(
  card: TarotCard,
  orientation: CardOrientation
): DualDailyInterpretation {
  const isUpright = orientation === "upright";
  const suit = card.suit || "wands";
  const num = card.number;

  const thaiCard = getThaiCardDetail(card.id);
  const thaiName = thaiCard ? thaiCard.name : card.name;
  const thaiKeywords = thaiCard ? thaiCard.keywords[orientation] : [];
  const primaryThaiKeyword =
    thaiKeywords[0] || (isUpright ? "การพัฒนาและการเติบโต" : "การปรับสมดุลและตั้งสติ");

  // Semantic characteristics per suit
  const suitConfig = {
    wands: {
      themeEn: isUpright ? "Inspiration & Action" : "Pacing Your Fire",
      themeTh: isUpright ? "แรงบันดาลใจและการลงมือทำ" : "การผ่อนความร้อนแรงและตั้งสติ",
      elementTh: "ธาตุไฟ (พลังงาน, ความมุ่งมั่น, ความคิดริเริ่ม)",
    },
    cups: {
      themeEn: isUpright ? "Emotional Harmony & Connection" : "Nurturing the Inner Well",
      themeTh: isUpright ? "ความกลมเกลียวทางอารมณ์และความรู้สึก" : "การเติมเต็มพลังใจจากภายใน",
      elementTh: "ธาตุน้ำ (ความรัก, จินตนาการ, ความผูกพัน)",
    },
    swords: {
      themeEn: isUpright ? "Mental Clarity & Truth" : "Calming Mental Turbulence",
      themeTh: isUpright ? "ความกระจ่างทางความคิดและความจริง" : "การลดความกังวลและคลายความคิด",
      elementTh: "ธาตุลม (สติปัญญา, การสื่อสาร, การตัดสินใจ)",
    },
    pentacles: {
      themeEn: isUpright ? "Practical Grounding & Growth" : "Re-aligning Resources",
      themeTh: isUpright ? "ความมั่นคงทางกายภาพและการเติบโต" : "การจัดสมดุลทรัพยากรและความคุ้มค่า",
      elementTh: "ธาตุดิน (การงาน, สุขภาพ, ความเป็นจริง)",
    },
  }[suit];

  const primaryKeywordEn =
    (isUpright ? card.keywords.upright[0] : card.keywords.reversed[0]) || card.name;

  const adviceEn = card.meaning.short[orientation];
  const adviceTh =
    thaiCard?.meaning.short[orientation] ||
    (isUpright
      ? `นำพลังงานด้าน ${primaryThaiKeyword} มาปรับใช้ในการสร้างสรรค์สิ่งดีๆ ในวันนี้`
      : `ระวังจุดติดขัดในเรื่อง ${primaryThaiKeyword} และค่อยๆ จัดการด้วยความรอบคอบ`);

  const overviewEn = card.meaning.full[orientation];
  const overviewTh =
    thaiCard?.meaning.full[orientation] ||
    `วันนี้พลังงานของ ${thaiName} โดดเด่นเป็นพิเศษ สะท้อนถึง ${suitConfig.themeTh} โดยมอบข้อคิดในการโฟกัสกับเป้าหมายสำคัญและการรักษาสมดุลของชีวิต`;

  // Court cards special handling
  if (num >= 11) {
    const courtTitles: Record<number, { en: string; th: string }> = {
      11: { en: "The Curious Student", th: "ผู้เรียนรู้ด้วยความอยากรู้" },
      12: { en: "The Dynamic Pursuer", th: "ผู้ขับเคลื่อนด้วยพลังงาน" },
      13: { en: "The Gracious Nurturer", th: "ผู้ดูแลด้วยปัญญาและความเมตตา" },
      14: { en: "The Sovereign Guide", th: "ผู้นำด้วยความมั่นคงและบารมี" },
    };
    const court = courtTitles[num] || { en: "The Archetype", th: "พลังตัวแทน" };

    return {
      en: {
        theme: `${card.name}: ${suitConfig.themeEn}`,
        overview: overviewEn,
        affirmation: isUpright
          ? `I embody the wisdom and strengths of ${card.name} in my endeavors today.`
          : `I balance my inner ${court.en} with self-awareness and gentle restraint.`,
        advice: adviceEn,
      },
      th: {
        theme: `${thaiName}: ${suitConfig.themeTh}`,
        overview: overviewTh,
        affirmation: isUpright
          ? `ฉันนำจุดเด่นและปัญญาของ ${thaiName} มาขับเคลื่อนสิ่งดีๆ ในวันนี้`
          : `ฉันตระหนักรู้และปรับสมดุลพลังงานของ ${court.th} เพื่อความลงตัว`,
        advice: adviceTh,
      },
    };
  }

  // Numbered cards (Aces to 10)
  return {
    en: {
      theme: `${card.name}: ${suitConfig.themeEn}`,
      overview: overviewEn,
      affirmation: isUpright
        ? `I channel ${primaryKeywordEn} into my daily life with quiet confidence.`
        : `I bring compassion and clarity to moments of ${primaryKeywordEn}.`,
      advice: adviceEn,
    },
    th: {
      theme: `${thaiName}: ${suitConfig.themeTh}`,
      overview: overviewTh,
      affirmation: isUpright
        ? `ฉันเปิดรับพลังงานแห่ง ${primaryThaiKeyword} สู่การใช้ชีวิตประจำวันด้วยความมั่นใจ`
        : `ฉันโอบกอดและคลี่คลายภาวะ ${primaryThaiKeyword} ด้วยความเข้าใจและสติ`,
      advice: adviceTh,
    },
  };
}

/**
 * Returns deterministic micro-interpretation (both TH and EN) for any of the 78 Tarot cards.
 */
export function getDeterministicDailyInterpretation(
  cardId: string,
  orientation: CardOrientation = "upright"
): DualDailyInterpretation {
  const card = getCardById(cardId);
  const thaiCard = getThaiCardDetail(cardId);

  // 1. Check curated Major Arcana catalog
  const majorEntry = MAJOR_INTERPRETATIONS[cardId];
  if (majorEntry) {
    const entry = majorEntry[orientation];
    return {
      en: {
        ...entry.en,
        overview:
          entry.en.overview ||
          card?.meaning.full[orientation] ||
          `Today's energy reflects ${entry.en.theme}. Meditate upon this archetypal force to guide your day.`,
      },
      th: {
        ...entry.th,
        overview:
          entry.th.overview ||
          thaiCard?.meaning.full[orientation] ||
          `พลังงานหลักของวันนี้สะท้อนถึง ${entry.th.theme} จงนำข้อคิดและปัญญาญาณของไพ่มาปรับใช้ในการดำเนินชีวิตอย่างมีสติ`,
      },
    };
  }

  // 2. Lookup in standard deck catalog
  if (card) {
    return getMinorArcanaInterpretation(card, orientation);
  }

  // 3. Fallback for unexpected or missing ID
  return {
    en: {
      theme: "Present Moment Awareness",
      overview:
        "Center your awareness on the present moment. Observe your thoughts and emotions without judgment, allowing clarity to emerge naturally.",
      affirmation: "I am centered, calm, and aligned with my inner truth today.",
      advice: "Take each hour as it comes, moving with clarity and mindful grace.",
    },
    th: {
      theme: "การอยู่กับปัจจุบันขณะ",
      overview:
        "ตั้งสติอยู่กับช่วงเวลาปัจจุบัน สังเกตความคิดและอารมณ์ที่ผ่านเข้ามาโดยไม่ด่วนตัดสิน ให้ความสงบนิ่งภายในนำทางความชัดเจนของวัน",
      affirmation: "ฉันตั้งมั่น สงบ และสอดคล้องกับความจริงแท้ในใจของตนเองในวันนี้",
      advice: "ก้าวไปทีละขณะจิต ลงมือทำด้วยความกระจ่างชัดและสติอันมั่นคง",
    },
  };
}

/**
 * Synthesizes a deep, personalized Daily Tarot reading via LLM (KKU IntelSphere / Gemini).
 * When no API keys or when offline, seamlessly returns deterministic fallback.
 */
export async function generateAiDailyInterpretation(
  card: DrawnCard
): Promise<DualDailyInterpretation> {
  const hasKKU =
    Boolean(process.env.KKU_INTELSPHERE_API_KEY) ||
    Boolean(process.env.KKU_INTELLISHARE_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  if (!hasKKU && !hasGemini) {
    return getDeterministicDailyInterpretation(card.cardId, card.orientation);
  }

  const cardObj = card.card || getCardById(card.cardId);
  const cardName = cardObj ? cardObj.name : card.cardId;
  const thaiDetail = getThaiCardDetail(card.cardId);
  const thaiName = thaiDetail ? thaiDetail.name : cardName;

  const systemPrompt = `You are Arcanfractal, an intuitive Tarot master and spiritual psychologist.
Your sacred task is to interpret a single Daily Tarot card for mindful reflection and spiritual empowerment for today.

Strict Guidelines:
1. NO USER QUESTION: The user has not asked a question; deliver a deep, flowing archetypal reflection for the day ahead.
2. Produce BOTH Thai and English interpretations in a single valid JSON object.
3. Language Quality:
   - For 'th': Use elegant, fluent, natural Thai prose with rich psychological and spiritual depth. ABSOLUTELY NO English words or untranslated jargon in Thai text.
   - For 'en': Eloquent, reflective, and empowering prose.
4. Schema Requirements:
{
  "th": {
    "theme": "ธีมหรือพลังงานหลักของวันสั้นกระชับ (1 บรรทัด)",
    "overview": "บทวิเคราะห์และภาพสะท้อนจิตวิญญาณประจำวันแบบเจาะลึกและประณีต (1-2 ย่อหน้า ประมาณ 120-200 คำ) ตีความพลังงานของไพ่ ความคิด อารมณ์ โอกาส และข้อคิดเตือนใจสำหรับการใช้ชีวิตในวันนี้",
    "affirmation": "ประโยคพลังใจสำหรับการเริ่มต้นวันเพื่อการตั้งจิต (Affirmation สั้นและมีพลัง)",
    "advice": "คำแนะนำการปฏิบัติตัวและทัศนคติที่ควรมีในวันนี้ (สิ่งที่ควรทำ หรือข้อควรระวัง)"
  },
  "en": {
    "theme": "Concise theme or core energy of the day (under 10 words)",
    "overview": "In-depth, eloquent daily reflection (1-2 paragraphs, ~120-200 words) interpreting the card's archetype, psychological symbolism, emotional resonance, and how to mindfully navigate today's experiences.",
    "affirmation": "An empowering 1-sentence mindful affirmation to anchor one's spirit today.",
    "advice": "Grounded, actionable advice on mindset to adopt and practical steps to take today."
  }
}
5. Return ONLY raw JSON without markdown code fences.`;

  const userPrompt = `Drawn Daily Card: ${cardName} (${thaiName})
Orientation: ${card.orientation} (${card.orientation === "reversed" ? "Reversed / กลับหัว" : "Upright / ตำแหน่งตั้ง"})
Arcana: ${cardObj?.arcana || "tarot"}
${cardObj?.suit ? `Suit: ${cardObj.suit}` : ""}
Keywords: ${cardObj?.keywords[card.orientation].join(", ") || ""}
Full Archetypal Lore: ${cardObj?.meaning.full[card.orientation] || ""}`;

  let rawJson = "";

  try {
    if (hasKKU) {
      try {
        rawJson = await callKKUIntelSphere(systemPrompt, userPrompt, 20000);
      } catch (e) {
        console.warn("KKU IntelSphere failed for daily interpretation, trying Gemini...", e);
      }
    }

    if (!rawJson && hasGemini) {
      rawJson = await callGemini(systemPrompt, userPrompt, 20000);
    }

    if (rawJson) {
      const cleaned = rawJson.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, "$1").trim();
      const parsed = JSON.parse(cleaned);
      if (
        parsed?.th?.theme &&
        parsed?.th?.affirmation &&
        parsed?.th?.advice &&
        parsed?.en?.theme &&
        parsed?.en?.affirmation &&
        parsed?.en?.advice
      ) {
        return {
          th: {
            theme: String(parsed.th.theme).trim(),
            overview: parsed.th.overview ? String(parsed.th.overview).trim() : undefined,
            affirmation: String(parsed.th.affirmation).trim(),
            advice: String(parsed.th.advice).trim(),
          },
          en: {
            theme: String(parsed.en.theme).trim(),
            overview: parsed.en.overview ? String(parsed.en.overview).trim() : undefined,
            affirmation: String(parsed.en.affirmation).trim(),
            advice: String(parsed.en.advice).trim(),
          },
        };
      }
    }
  } catch (error) {
    console.error("AI daily interpretation error, using deterministic fallback:", error);
  }

  return getDeterministicDailyInterpretation(card.cardId, card.orientation);
}

/**
 * Synthesizes the daily card interpretation.
 * Uses AI by default when available, with immediate deterministic fallback.
 */
export async function generateDailyInterpretation(
  card: DrawnCard,
  options?: { useAi?: boolean }
): Promise<DualDailyInterpretation> {
  const allowAi = options?.useAi !== false;
  const hasKey =
    Boolean(process.env.KKU_INTELSPHERE_API_KEY) ||
    Boolean(process.env.KKU_INTELLISHARE_API_KEY) ||
    Boolean(process.env.GEMINI_API_KEY);

  if (allowAi && hasKey) {
    return generateAiDailyInterpretation(card);
  }

  return getDeterministicDailyInterpretation(card.cardId, card.orientation);
}
