import type { TarotCard } from "@/types/tarot";

export const PENTACLES_CARDS: TarotCard[] = [
  {
    id: "pentacles-01",
    slug: "ace-of-pentacles",
    name: "Ace of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 1,
    element: "earth",
    keywords: {
      upright: [
        "tangible opportunity",
        "prosperity",
        "new venture",
        "abundance",
        "financial security",
      ],
      reversed: ["missed chance", "bad investment", "financial insecurity", "scarcity mindset"],
    },
    meaning: {
      short: {
        upright:
          "A tangible seed of physical prosperity, new financial opportunity, and grounded abundance.",
        reversed:
          "A missed business opportunity, financial instability, or poor material planning.",
      },
      full: {
        upright:
          "A radiant hand emerges from the clouds holding a golden coin over a lush, blooming garden with a flowered archway. The Ace of Pentacles offers a grounded, tangible gift: a promising career opportunity, business opening, or resource for security. Plant this seed in fertile soil and nurture it patiently.",
        reversed:
          "Reversed, an opportunity slips through your fingers due to hesitation, poor budgeting, or reckless financial gambles. Beware of get-rich-quick mirages or living beyond your means. Rebuild solid, dependable material foundations.",
      },
    },
  },
  {
    id: "pentacles-02",
    slug: "two-of-pentacles",
    name: "Two of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 2,
    element: "earth",
    keywords: {
      upright: [
        "balance",
        "adaptability",
        "juggling priorities",
        "resourcefulness",
        "multitasking",
      ],
      reversed: ["overwhelmed", "dropped balls", "financial disarray", "imbalance", "chaos"],
    },
    meaning: {
      short: {
        upright: "Juggling multiple priorities with playful agility and flexible adaptability.",
        reversed:
          "Overstretched commitments, financial disarray, or dropping critical responsibilities.",
      },
      full: {
        upright:
          "A nimble youth juggles two golden pentacles framed by an infinity sign as ocean waves toss ships in the background. The Two of Pentacles reminds you that life's demands require fluid adaptability rather than rigid resistance. Balance work, health, and finances with good humor and steady grace.",
        reversed:
          "Reversed, juggling too many balls at once leads to inevitable drops. Stress and disorganization spiral out of control, threatening commitments and budgets. Cut back on peripheral tasks, consolidate your energy, and simplify your schedule.",
      },
    },
  },
  {
    id: "pentacles-03",
    slug: "three-of-pentacles",
    name: "Three of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 3,
    element: "earth",
    keywords: {
      upright: [
        "teamwork",
        "collaboration",
        "craftsmanship",
        "competence",
        "quality",
        "recognition",
      ],
      reversed: ["lack of teamwork", "poor quality", "clashing egos", "disorganization"],
    },
    meaning: {
      short: {
        upright:
          "Masterful craftsmanship, collaborative teamwork, and mutual respect among skilled peers.",
        reversed: "Ego clashes, lack of coordination, or substandard workmanship in a team effort.",
      },
      full: {
        upright:
          "A young stonemason confers with a monk and architect inside a magnificent stone cathedral. The Three of Pentacles celebrates collaborative craftsmanship where diverse talents unite to build something enduring. Value feedback, honor each person's expertise, and take pride in exceptional quality.",
        reversed:
          "Reversed, collaborative friction derails progress. Misaligned expectations, condescending critiques, or lack of dedication result in sloppy execution. Clarify roles, check egos at the door, and realign on core project standards.",
      },
    },
  },
  {
    id: "pentacles-04",
    slug: "four-of-pentacles",
    name: "Four of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 4,
    element: "earth",
    keywords: {
      upright: [
        "conservation",
        "security",
        "frugality",
        "scarcity fear",
        "possessiveness",
        "control",
      ],
      reversed: ["greed", "letting go", "generosity", "reckless spending", "financial openness"],
    },
    meaning: {
      short: {
        upright:
          "Guarding resources closely; balance prudent saving against stingy scarcity fears.",
        reversed:
          "Opening closed fists, practicing generosity, or swinging into irresponsible spending.",
      },
      full: {
        upright:
          "A figure sits outside a bustling city, clutching one coin to his chest, balancing one on his head, and pinning two beneath his feet. The Four of Pentacles emphasizes financial prudence, but warns against hoarding driven by fear. Money and energy must flow; do not choke your own abundance with paranoia.",
        reversed:
          "Reversed, you either release your fearful grip to invest generously in life, or swing into reckless extravagance that threatens hard-earned savings. Strive for balanced stewardship without either compulsive clutching or carelessness.",
      },
    },
  },
  {
    id: "pentacles-05",
    slug: "five-of-pentacles",
    name: "Five of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 5,
    element: "earth",
    keywords: {
      upright: ["hardship", "financial loss", "poverty", "isolation", "feeling left out"],
      reversed: ["recovery", "finding help", "end of hardship", "spiritual renewal", "relief"],
    },
    meaning: {
      short: {
        upright:
          "Weathering financial or emotional cold; look up to see the warm sanctuary window right above.",
        reversed:
          "Emerging from the blizzard, receiving assistance, and rebuilding material well-being.",
      },
      full: {
        upright:
          "Two impoverished travelers trudge through snow, blind to the glowing stained-glass window of a sanctuary right beside them. The Five of Pentacles speaks to material hardship, isolation, or loss. Do not let pride prevent you from seeking help; sanctuary and warmth are closer than despair suggests.",
        reversed:
          "Reversed, the blizzard subsides. Help arrives, debts are managed, and employment or health turns a corner. You realize you are not alone in the cold. Step through the doors of renewal with newfound resilience and gratitude.",
      },
    },
  },
  {
    id: "pentacles-06",
    slug: "six-of-pentacles",
    name: "Six of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 6,
    element: "earth",
    keywords: {
      upright: [
        "generosity",
        "charity",
        "fair distribution",
        "reciprocity",
        "giving and receiving",
      ],
      reversed: [
        "strings attached",
        "debt",
        "unequal power",
        "selfishness",
        "exploitative charity",
      ],
    },
    meaning: {
      short: {
        upright:
          "Balanced flow of generosity: giving generously or gratefully receiving support without shame.",
        reversed:
          "Charity with strings attached, power imbalances, or taking advantage of generosity.",
      },
      full: {
        upright:
          "A prosperous merchant holding balanced scales gives coins to two kneeling supplicants. The Six of Pentacles governs the ethical flow of resources: when blessed, share wealth; when struggling, accept assistance with dignity. Maintain reciprocity and fair exchange in all dealings.",
        reversed:
          "Reversed, gifts carry hidden strings or breed humiliating indebtedness. One party lords financial superiority over another, or a recipient becomes dependent and resentful. Ensure agreements are transparent, respectful, and free of emotional leverage.",
      },
    },
  },
  {
    id: "pentacles-07",
    slug: "seven-of-pentacles",
    name: "Seven of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 7,
    element: "earth",
    keywords: {
      upright: ["patience", "long-term investment", "assessment", "hard work", "awaiting harvest"],
      reversed: ["impatience", "wasted effort", "poor return", "lack of reward", "giving up"],
    },
    meaning: {
      short: {
        upright:
          "Leaning on your hoe to assess growth; trust patient cultivation as harvest nears.",
        reversed:
          "Impatience causing premature picking, or realizing effort was invested in infertile soil.",
      },
      full: {
        upright:
          "A gardener leans upon his tool, thoughtfully contemplating seven golden pentacles hanging from lush vines. The Seven of Pentacles acknowledges hard labor already invested and counsel's patient persistence. Real growth takes time; pause to assess your progress without digging up seeds to see if they are growing.",
        reversed:
          "Reversed, you grow frustrated by slow returns and consider abandoning a venture just before fruition. Alternatively, an objective audit reveals you have been watering weeds. Cut your losses where effort yields zero return, or double down on viable soil.",
      },
    },
  },
  {
    id: "pentacles-08",
    slug: "eight-of-pentacles",
    name: "Eight of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 8,
    element: "earth",
    keywords: {
      upright: [
        "apprenticeship",
        "mastery",
        "craftsmanship",
        "diligence",
        "skill building",
        "focus",
      ],
      reversed: ["perfectionism", "monotony", "shoddy work", "lack of ambition", "burnout"],
    },
    meaning: {
      short: {
        upright:
          "Dedicated devotion to craft, honing fine skills through repetition and meticulous focus.",
        reversed: "Mindless busywork, cutting corners on quality, or paralyzing perfectionism.",
      },
      full: {
        upright:
          "An artisan diligently carves golden pentacles, displaying finished work proudly along a wooden post. The Eight of Pentacles represents dedication to mastery, continual self-improvement, and meticulous craftsmanship. Hone your expertise; genuine skill opens doors to long-term success.",
        reversed:
          "Reversed, meticulous effort devolves into tedious busywork or obsessive perfectionism that prevents finishing projects. Alternatively, you take lazy shortcuts that compromise quality. Rekindle pride in your craft and find joyful flow in daily tasks.",
      },
    },
  },
  {
    id: "pentacles-09",
    slug: "nine-of-pentacles",
    name: "Nine of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 9,
    element: "earth",
    keywords: {
      upright: ["self-sufficiency", "luxury", "financial independence", "grace", "accomplishment"],
      reversed: [
        "over-investment in work",
        "material superficiality",
        "financial setback",
        "loneliness",
      ],
    },
    meaning: {
      short: {
        upright:
          "Serene self-sufficiency, refined luxury, and enjoying the fruits of independent labor.",
        reversed:
          "Trapped in a gilded cage, sacrificing personal connections for cold material status.",
      },
      full: {
        upright:
          "An elegant woman in flowing robes strolls through her abundant vineyard with a hooded falcon perched on her hand. The Nine of Pentacles is the hallmark of financial independence, self-reliance, and refined peace. You have cultivated your garden through discipline; now savor your accomplishments with quiet elegance.",
        reversed:
          "Reversed, material luxury conceals deep loneliness or a gilded cage. You may have sacrificed intimate connections, integrity, or health on the altar of status. Remember that true wealth encompasses emotional intimacy as well as comfortable surroundings.",
      },
    },
  },
  {
    id: "pentacles-10",
    slug: "ten-of-pentacles",
    name: "Ten of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 10,
    element: "earth",
    keywords: {
      upright: [
        "legacy",
        "generational wealth",
        "family traditions",
        "long-term security",
        "ancestry",
      ],
      reversed: ["family dispute", "financial ruin", "disputed inheritance", "broken legacy"],
    },
    meaning: {
      short: {
        upright:
          "Enduring wealth, multigenerational stability, and honoring family legacy and heritage.",
        reversed: "Squabbling over inheritance, crumbling family security, or traditional burdens.",
      },
      full: {
        upright:
          "Three generations gather in a castle courtyard with pet hounds beneath a stone archway adorned with ten pentacles arranged as the Tree of Life. The Ten of Pentacles represents lasting legacy, financial security, and generational abundance. Build foundations that will shelter and enrich future generations.",
        reversed:
          "Reversed, family disputes erupt over estates, wills, or financial obligations. Traditions feel suffocating rather than supportive, or risky investments threaten generational stability. Communicate openly to resolve financial rifts.",
      },
    },
  },
  {
    id: "pentacles-page",
    slug: "page-of-pentacles",
    name: "Page of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 11,
    element: "earth",
    keywords: {
      upright: [
        "manifestation",
        "financial opportunity",
        "study",
        "diligence",
        "ambition",
        "grounded",
      ],
      reversed: [
        "procrastination",
        "lack of focus",
        "lazy habits",
        "unrealistic dreams",
        "short-sighted",
      ],
    },
    meaning: {
      short: {
        upright:
          "A grounded student bringing practical opportunities, scholarship, and seeds of success.",
        reversed:
          "Daydreaming without studying, procrastination, or neglecting real-world responsibilities.",
      },
      full: {
        upright:
          "A youth stands in a lush green meadow, holding a golden coin aloft with reverent concentration. The Page of Pentacles embodies grounded ambition, dedicated study, and the birth of practical ventures. Commit to diligent learning, master fundamentals, and invest in tangible future goals.",
        reversed:
          "Reversed, ambition lacks discipline. You buy textbooks you never read or procrastinate on crucial assignments. Unrealistic get-rich-quick fantasies replace diligent effort. Roll up your sleeves and do the foundational work.",
      },
    },
  },
  {
    id: "pentacles-knight",
    slug: "knight-of-pentacles",
    name: "Knight of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 12,
    element: "earth",
    keywords: {
      upright: ["hard work", "productivity", "routine", "reliability", "perseverance", "patience"],
      reversed: ["stubbornness", "laziness", "monotony", "perfectionism", "stagnant routine"],
    },
    meaning: {
      short: {
        upright:
          "Methodical perseverance, unflagging reliability, and steady step-by-step progress.",
        reversed: "Stubborn inflexibility, grind culture burnout, or tedious, uninspired routine.",
      },
      full: {
        upright:
          "Mounted atop a stout, motionless draft horse in a freshly plowed field, the Knight of Pentacles gazes thoughtfully upon his coin. He is the ultimate worker: methodical, dependable, patient, and unswerving. Progress may feel slow, but your thorough craftsmanship guarantees unassailable success.",
        reversed:
          "Reversed, dependable routine calcifies into soul-crushing monotony. You become stubborn, resistant to innovation, or so hyper-focused on trivial details that projects grind to a halt. Lift your head from the plow and welcome fresh perspective.",
      },
    },
  },
  {
    id: "pentacles-queen",
    slug: "queen-of-pentacles",
    name: "Queen of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 13,
    element: "earth",
    keywords: {
      upright: [
        "nurturing",
        "practical care",
        "financial security",
        "hospitality",
        "grounded grace",
      ],
      reversed: ["work-life imbalance", "smothering", "material worry", "neglected self-care"],
    },
    meaning: {
      short: {
        upright:
          "Abundant hospitality, loving domestic stewardship, and practical, grounded warmth.",
        reversed:
          "Anxious financial fretting, neglecting your health, or smothering domestic control.",
      },
      full: {
        upright:
          "Sitting on a throne surrounded by carved beasts, fruit trees, and a darting hare, the Queen of Pentacles cradles a golden coin with maternal devotion. She is the archetype of grounded abundance, nourishing both hearth and business with practical wisdom and generous hospitality.",
        reversed:
          "Reversed, domestic caretaking leads to self-neglect and chronic fatigue. Alternatively, anxiety over money manifests as controlling micromanagement over household affairs. Make time to nourish yourself as lovingly as you care for others.",
      },
    },
  },
  {
    id: "pentacles-king",
    slug: "king-of-pentacles",
    name: "King of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    number: 14,
    element: "earth",
    keywords: {
      upright: ["wealth", "business acumen", "leadership", "security", "abundance", "discipline"],
      reversed: ["greed", "materialism", "bad investments", "stubborn miser", "corrupt leadership"],
    },
    meaning: {
      short: {
        upright:
          "Pinnacle of material success: seasoned business acumen, solid security, and wise stewardship.",
        reversed:
          "Mercenary greed, ruthless materialism, or risking enterprise on reckless gambles.",
      },
      full: {
        upright:
          "Robed in carved grapevines with a golden sceptre and a foot resting on a bull's head, the King of Pentacles presides over a flourishing kingdom. He embodies financial mastery, enterprising stability, and generous patronage. Lead with pragmatic competence and protect what you have built.",
        reversed:
          "Reversed, prosperity curdles into corrupt greed, ruthless exploitation, or miserly hoarding. You judge everything solely by financial return and ignore emotional and ethical dimensions. Re-align wealth with genuine human values.",
      },
    },
  },
];
