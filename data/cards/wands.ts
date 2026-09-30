import type { TarotCard } from "@/types/tarot";

export const WANDS_CARDS: TarotCard[] = [
  {
    id: "wands-01",
    slug: "ace-of-wands",
    name: "Ace of Wands",
    arcana: "minor",
    suit: "wands",
    number: 1,
    element: "fire",
    keywords: {
      upright: ["inspiration", "new passion", "creative spark", "potential", "bold initiative"],
      reversed: ["delays", "lack of spark", "creative block", "hesitation", "wasted energy"],
    },
    meaning: {
      short: {
        upright: "A burst of creative inspiration and fiery potential sparks an exciting venture.",
        reversed:
          "Creative burnout, lack of motivation, or difficulty getting a project off the ground.",
      },
      full: {
        upright:
          "A hand emerges from the clouds clasping a sprouting wooden wand. The Ace of Wands brings unbridled creative spark, entrepreneurial drive, and passion. An inspiring idea ignites within you; seize this raw momentum and channel it into courageous action.",
        reversed:
          "Reversed, the flame flickers. You might encounter false starts, creative exhaustion, or doubts that extinguish your enthusiasm. Step back and reconnect with your genuine purpose before forcing a project forward.",
      },
    },
  },
  {
    id: "wands-02",
    slug: "two-of-wands",
    name: "Two of Wands",
    arcana: "minor",
    suit: "wands",
    number: 2,
    element: "fire",
    keywords: {
      upright: ["future planning", "progress", "decisions", "discovery", "leaving comfort zone"],
      reversed: ["fear of unknown", "lack of planning", "playing safe", "paralyzing choices"],
    },
    meaning: {
      short: {
        upright:
          "Standing on the terrace of progress, formulate grand plans and look to future horizons.",
        reversed: "Fear of taking bold steps or poor planning hindering long-range visions.",
      },
      full: {
        upright:
          "Holding a globe while gazing over distant waters from your castle battlement, the Two of Wands invites expansive long-term planning. You have achieved initial stability; now contemplate how to broaden your reach, form strategic partnerships, and explore uncharted territory.",
        reversed:
          "Reversed, anxiety over the unknown keeps you clinging timidly to safe routines. Alternatively, overconfident planning without practical grounding leads to costly logistical oversights. Refocus your strategy.",
      },
    },
  },
  {
    id: "wands-03",
    slug: "three-of-wands",
    name: "Three of Wands",
    arcana: "minor",
    suit: "wands",
    number: 3,
    element: "fire",
    keywords: {
      upright: ["expansion", "foresight", "overseas opportunities", "momentum", "enterprise"],
      reversed: ["delays", "frustration", "obstacles to progress", "disappointing returns"],
    },
    meaning: {
      short: {
        upright:
          "Your ships are returning; ventures expand and foresight yields rewarding progress.",
        reversed:
          "Frustrating setbacks, supply chain delays, or ventures falling short of expectations.",
      },
      full: {
        upright:
          "Watching ships sail across golden waters, the Three of Wands signals that your initial investments and plans are gathering tangible momentum. Expand your enterprise, embrace international or cross-disciplinary horizons, and step confidently into leadership.",
        reversed:
          "Reversed, you face agonizing delays and stalled shipments. Miscommunications or bureaucratic roadblocks test your patience. Reassess your timeline without abandoning hope; adjust your sails to changing winds.",
      },
    },
  },
  {
    id: "wands-04",
    slug: "four-of-wands",
    name: "Four of Wands",
    arcana: "minor",
    suit: "wands",
    number: 4,
    element: "fire",
    keywords: {
      upright: ["celebration", "homecoming", "harmony", "milestone", "community", "joy"],
      reversed: ["family tension", "cancelled celebration", "instability", "feeling unwelcome"],
    },
    meaning: {
      short: {
        upright: "A joyful milestone, celebratory gathering, and harmonious sense of home.",
        reversed: "Interpersonal friction, domestic discord, or a delayed homecoming.",
      },
      full: {
        upright:
          "Two joyous figures dance under a flowered bower crowned by four sturdy wands. The Four of Wands marks a celebrated milestone: a wedding, housewarming, successful project launch, or communal reunion. Savor this well-earned pause of peace, belonging, and shared warmth.",
        reversed:
          "Reversed, domestic tension or family squabbles dampen what should be a happy gathering. You may feel out of place among peers or struggle with unstable domestic arrangements. Prioritize peace over petty disagreements.",
      },
    },
  },
  {
    id: "wands-05",
    slug: "five-of-wands",
    name: "Five of Wands",
    arcana: "minor",
    suit: "wands",
    number: 5,
    element: "fire",
    keywords: {
      upright: ["conflict", "competition", "rivalry", "differing opinions", "creative tension"],
      reversed: ["avoiding conflict", "reconciliation", "cooperation", "destructive infighting"],
    },
    meaning: {
      short: {
        upright: "Spirited competition, clashing viewpoints, and healthy creative friction.",
        reversed: "Resolving disputes peacefully, or letting bitter rivalry tear a group apart.",
      },
      full: {
        upright:
          "Five youths spar with wands in chaotic rivalry. The Five of Wands represents competitive friction, conflicting agendas, and brainstorming battles. While noisy, this turbulence is rarely malicious; view it as an opportunity to sharpen your arguments and earn your place in the arena.",
        reversed:
          "Reversed, you are either finding peaceful common ground after an exhausting dispute, or running from essential confrontations out of fear. Alternatively, destructive infighting turns toxic; know when to lay down your staff.",
      },
    },
  },
  {
    id: "wands-06",
    slug: "six-of-wands",
    name: "Six of Wands",
    arcana: "minor",
    suit: "wands",
    number: 6,
    element: "fire",
    keywords: {
      upright: ["victory", "success", "public recognition", "pride", "triumph", "acclaim"],
      reversed: ["fall from grace", "arrogance", "lack of recognition", "egotism", "defeat"],
    },
    meaning: {
      short: {
        upright: "Public acclaim, hard-won victory, and proud celebration of your achievements.",
        reversed: "Ignored efforts, wounded pride, or resting complacently on past laurels.",
      },
      full: {
        upright:
          "A triumphant horseman crowned with laurel rides through an applauding crowd. The Six of Wands rewards your perseverance with public recognition, validation, and success. Hold your head high, accept honors graciously, and inspire others through your victory.",
        reversed:
          "Reversed, you may feel overlooked despite exhausting effort, or experience a humbling fall from grace caused by arrogance. Do not let external praise dictate your self-worth; validate yourself from within and learn from humility.",
      },
    },
  },
  {
    id: "wands-07",
    slug: "seven-of-wands",
    name: "Seven of Wands",
    arcana: "minor",
    suit: "wands",
    number: 7,
    element: "fire",
    keywords: {
      upright: ["perseverance", "defending ground", "courage", "standing firm", "challenge"],
      reversed: ["giving up", "overwhelmed", "exhaustion", "conceding defeat", "yielding"],
    },
    meaning: {
      short: {
        upright: "Hold the high ground courageously against rising odds and vocal opposition.",
        reversed: "Exhaustion from relentless attacks or knowing when to strategically yield.",
      },
      full: {
        upright:
          "Standing on a hilltop with mismatched shoes, a brave defender fends off six hostile wands from below. The Seven of Wands calls on you to stand resolute for your convictions. Though challenged by rivals or critics, you occupy the higher ground; maintain your boundaries with unshakable grit.",
        reversed:
          "Reversed, constant defensive battles have pushed you to the brink of burnout. You feel bombarded from all sides and tempted to throw in the towel. Distinguish between battles worth fighting and needless martyrdom; preserve your vitality.",
      },
    },
  },
  {
    id: "wands-08",
    slug: "eight-of-wands",
    name: "Eight of Wands",
    arcana: "minor",
    suit: "wands",
    number: 8,
    element: "fire",
    keywords: {
      upright: ["swift action", "speed", "travel", "rapid news", "momentum", "alignment"],
      reversed: ["delays", "frustration", "hasty panic", "scattered energy", "miscommunication"],
    },
    meaning: {
      short: {
        upright: "Swift momentum, clear trajectories, and rapid incoming messages.",
        reversed: "Impatience, communication snarls, or chaotic rushing into uncalculated risks.",
      },
      full: {
        upright:
          "Eight wands hurtle through a clear sky toward their target. The Eight of Wands signals rapid velocity: stagnation breaks, pending messages arrive, and projects accelerate dramatically. Ride this tailwind with decisive clarity and stay prepared for fast-moving developments.",
        reversed:
          "Reversed, speed curdles into chaotic haste and rash decisions. Messages get lost, travel suffers cancellations, and scattered focus produces careless errors. Slow down: hasty panic creates far more delays than thoughtful pacing.",
      },
    },
  },
  {
    id: "wands-09",
    slug: "nine-of-wands",
    name: "Nine of Wands",
    arcana: "minor",
    suit: "wands",
    number: 9,
    element: "fire",
    keywords: {
      upright: ["resilience", "grit", "last stand", "cautious vigilance", "persistence"],
      reversed: ["exhaustion", "paranoia", "defensiveness", "giving up at the threshold"],
    },
    meaning: {
      short: {
        upright: "Wounded but undefeated; muster your final reserves to pass this last hurdle.",
        reversed:
          "Hypervigilance turning into paranoia, or total physical and emotional depletion.",
      },
      full: {
        upright:
          "Bandaged around his brow and clutching his staff, a weary sentinel stands guard before eight barricaded wands. The Nine of Wands acknowledges that past battles have left scars, but the finish line is in sight. Draw upon deep reserves of inner resilience; you will endure this final test.",
        reversed:
          "Reversed, legitimate vigilance has devolved into chronic paranoia and defensive barricades against imaginary enemies. You are physically and mentally drained from anticipating phantom threats. Lower your guard and let trusted allies assist you.",
      },
    },
  },
  {
    id: "wands-10",
    slug: "ten-of-wands",
    name: "Ten of Wands",
    arcana: "minor",
    suit: "wands",
    number: 10,
    element: "fire",
    keywords: {
      upright: ["burden", "overload", "hard work", "responsibility", "approaching finish"],
      reversed: ["burnout", "dropping burdens", "delegation", "crushed by duty"],
    },
    meaning: {
      short: {
        upright: "Heavy burdens and overwhelming responsibilities; delegate before you break.",
        reversed: "Releasing unmanageable obligations or collapsing under self-imposed pressure.",
      },
      full: {
        upright:
          "Bent double under the crushing weight of ten heavy wooden staves, a laborer struggles toward the distant town. The Ten of Wands warns that taking on all duties alone has become unsustainable. You are near the goal, but you must prioritize, delegate, and lay down non-essential loads.",
        reversed:
          "Reversed, you are reaching a breaking point or finally learning the wisdom of letting go. Relinquish obligations that belong to others. Shed unnecessary duties so you can stand upright and breathe freely once more.",
      },
    },
  },
  {
    id: "wands-page",
    slug: "page-of-wands",
    name: "Page of Wands",
    arcana: "minor",
    suit: "wands",
    number: 11,
    element: "fire",
    keywords: {
      upright: ["enthusiasm", "exploration", "discovery", "creative ideas", "free-spirited"],
      reversed: ["procrastination", "restlessness", "scattered energy", "lack of follow-through"],
    },
    meaning: {
      short: {
        upright:
          "A youthful messenger of excitement brings inspiring ideas and a thirst for adventure.",
        reversed: "Flighty impatience, half-baked projects, or discouraging creative setbacks.",
      },
      full: {
        upright:
          "Standing in a desert landscape gazing with wonder at a sprouting staff, the Page of Wands embodies playful curiosity, passionate exploration, and inspiring news. Say yes to creative invitations, experiment without fear of failure, and let your enthusiasm lead the way.",
        reversed:
          "Reversed, child-like passion becomes fickle distraction. You launch into a dozen hobbies only to drop them when real discipline is required. Tame your restlessness and finish what you begin.",
      },
    },
  },
  {
    id: "wands-knight",
    slug: "knight-of-wands",
    name: "Knight of Wands",
    arcana: "minor",
    suit: "wands",
    number: 12,
    element: "fire",
    keywords: {
      upright: ["energy", "passion", "daring action", "adventure", "fearlessness", "haste"],
      reversed: ["recklessness", "short temper", "unreliability", "impatience", "chaos"],
    },
    meaning: {
      short: {
        upright:
          "Charging boldly ahead with fierce determination, charismatic charm, and daring passion.",
        reversed: "Volatile temper, erratic unreliability, and burning bridges in reckless haste.",
      },
      full: {
        upright:
          "A fiery knight on a rearing steed charges through the desert sands. The Knight of Wands is the champion of daring quests, charismatic energy, and bold ventures. When inspiration strikes, you move with ferocious speed and fearless magnetism.",
        reversed:
          "Reversed, fiery boldness morphs into aggressive arrogance, short-fused tantrums, and reckless impulsiveness. You rush in without considering consequences, leaving behind a trail of unfinished projects and ruffled feathers. Practice temperance.",
      },
    },
  },
  {
    id: "wands-queen",
    slug: "queen-of-wands",
    name: "Queen of Wands",
    arcana: "minor",
    suit: "wands",
    number: 13,
    element: "fire",
    keywords: {
      upright: ["courage", "confidence", "warmth", "charisma", "independence", "creativity"],
      reversed: ["jealousy", "insecurity", "demanding", "vindictiveness", "burnout"],
    },
    meaning: {
      short: {
        upright: "Radiant self-assurance, vibrant charisma, and generous, magnetic leadership.",
        reversed: "Insecurity masking as domineering drama, jealousy, or theatrical temper.",
      },
      full: {
        upright:
          "Sitting regally with a sunflower and a black cat at her feet, the Queen of Wands radiates vibrant confidence, magnetic warmth, and fierce independence. She champions her dreams unapologetically and uplifts those around her with contagious vitality. Radiate your authentic brilliance.",
        reversed:
          "Reversed, inner insecurity triggers manipulative jealousy, passive-aggressive drama, or demanding outbursts. You might feel unappreciated and lash out, or feel your creative fire choked by chronic stress. Regain your poise through self-compassion.",
      },
    },
  },
  {
    id: "wands-king",
    slug: "king-of-wands",
    name: "King of Wands",
    arcana: "minor",
    suit: "wands",
    number: 14,
    element: "fire",
    keywords: {
      upright: ["visionary", "leadership", "mastery", "honor", "entrepreneurship", "drive"],
      reversed: ["impulsiveness", "overbearing", "unrealistic expectations", "tyrannical pride"],
    },
    meaning: {
      short: {
        upright:
          "A natural visionary and decisive leader who turns creative concepts into empires.",
        reversed:
          "Autocratic arrogance, dictatorial demands, and impatience with slower teammates.",
      },
      full: {
        upright:
          "Crowned with leaping flames on his carved throne, the King of Wands represents mature visionary leadership, courageous entrepreneurship, and inspirational drive. You not only conceive bold blueprints, but possess the practical authority and charisma to guide others to execute them.",
        reversed:
          "Reversed, strong leadership deteriorates into overbearing dictatorship and unreasonable expectations. You dismiss other perspectives, blame underlings for mistakes, or jump prematurely from one grandiose scheme to the next. Lead with humility.",
      },
    },
  },
];
