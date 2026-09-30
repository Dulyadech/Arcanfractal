import type { TarotCard } from "@/types/tarot";

export const SWORDS_CARDS: TarotCard[] = [
  {
    id: "swords-01",
    slug: "ace-of-swords",
    name: "Ace of Swords",
    arcana: "minor",
    suit: "swords",
    number: 1,
    element: "air",
    keywords: {
      upright: [
        "breakthrough",
        "clarity",
        "sharp intellect",
        "truth",
        "justice",
        "new perspective",
      ],
      reversed: ["confusion", "brutality", "clouded judgment", "hostility", "miscommunication"],
    },
    meaning: {
      short: {
        upright:
          "A flash of mental clarity and incisive truth cuts through confusion and illusions.",
        reversed: "Sharp words causing cruelty, clouded thinking, or weaponized misinformation.",
      },
      full: {
        upright:
          "A hand emerges from the clouds wielding an upright sword crowned with laurel and palm. The Ace of Swords brings sudden intellectual breakthroughs, razor-sharp focus, and absolute truth. Cut away ambiguity, champion justice, and perceive reality with pristine clarity.",
        reversed:
          "Reversed, intellectual sharp edges become cruel or deceptive. You may lash out with stinging remarks, distort facts, or become paralyzed by circular overthinking. Re-center in compassionate objectivity before speaking.",
      },
    },
  },
  {
    id: "swords-02",
    slug: "two-of-swords",
    name: "Two of Swords",
    arcana: "minor",
    suit: "swords",
    number: 2,
    element: "air",
    keywords: {
      upright: [
        "difficult decisions",
        "stalemate",
        "blindfolded truce",
        "weighing options",
        "denial",
      ],
      reversed: ["information overload", "lifting blindfold", "decision made", "seeing truth"],
    },
    meaning: {
      short: {
        upright:
          "A defensive stalemate: avoiding a difficult choice between two equally daunting paths.",
        reversed:
          "Removing the blindfold, confronting uncomfortable facts, and breaking the deadlock.",
      },
      full: {
        upright:
          "A blindfolded woman sits before a rocky sea, holding two crossed swords in tense equilibrium. The Two of Swords indicates a stalemate caused by refusal to face difficult truths. Ignoring the problem will not resolve it; remove the blindfold and make the necessary decision.",
        reversed:
          "Reversed, the deadlock breaks. New information arrives, the blindfold falls away, and you see the situation for what it truly is. Make your choice with courage and accept the consequences of moving forward.",
      },
    },
  },
  {
    id: "swords-03",
    slug: "three-of-swords",
    name: "Three of Swords",
    arcana: "minor",
    suit: "swords",
    number: 3,
    element: "air",
    keywords: {
      upright: ["heartbreak", "emotional pain", "sorrow", "grief", "painful truth", "betrayal"],
      reversed: ["healing", "forgiveness", "releasing pain", "recovery", "reconciliation"],
    },
    meaning: {
      short: {
        upright:
          "Piercing heartbreak and painful sorrow; release tears so the healing process can begin.",
        reversed:
          "Recovering from emotional wounding, practicing forgiveness, and emerging from storm clouds.",
      },
      full: {
        upright:
          "Three swords pierce a weeping heart beneath torrential storm clouds. The Three of Swords brings acute emotional pain, painful realizations, heartbreak, or painful separation. Allow yourself to feel the grief fully; suppressing sorrow only prolongs its sharp bite.",
        reversed:
          "Reversed, the rain subsides. You are gently pulling the swords from your heart and entering a phase of convalescence and forgiveness. Release lingering bitterness, let old scars finish healing, and open yourself once more to peace.",
      },
    },
  },
  {
    id: "swords-04",
    slug: "four-of-swords",
    name: "Four of Swords",
    arcana: "minor",
    suit: "swords",
    number: 4,
    element: "air",
    keywords: {
      upright: ["rest", "recovery", "contemplation", "retreat", "sanctuary", "mental stillness"],
      reversed: ["burnout", "restlessness", "forced exile", "re-entering the world"],
    },
    meaning: {
      short: {
        upright:
          "Retreat into peaceful sanctuary to recharge mental batteries and heal exhausted nerves.",
        reversed:
          "Exiting necessary convalescence too early, or suffering burnout from resisting rest.",
      },
      full: {
        upright:
          "A knight reclines serenely upon a tomb beneath stained glass, hands clasped in prayer with three swords above and one beneath. The Four of Swords commands non-negotiable mental respite. Step back from the battlefield, silence the noise, and restore equilibrium in quiet sanctuary.",
        reversed:
          "Reversed, chronic refusal to rest triggers complete exhaustion or mental collapse. Alternatively, a period of quiet recuperation is complete and it is time to re-enter the world with refreshed purpose. Listen to your body's limits.",
      },
    },
  },
  {
    id: "swords-05",
    slug: "five-of-swords",
    name: "Five of Swords",
    arcana: "minor",
    suit: "swords",
    number: 5,
    element: "air",
    keywords: {
      upright: ["conflict", "pyrrhic victory", "defeat", "hostility", "ego battles", "pride"],
      reversed: ["reconciliation", "cutting losses", "past resentment", "ending conflict"],
    },
    meaning: {
      short: {
        upright: "A hollow victory won at too high a cost; ego conflicts leave everyone defeated.",
        reversed:
          "Laying down swords, walking away from toxic arguments, and seeking reconciliation.",
      },
      full: {
        upright:
          "A smirking man gathers swords while his defeated companions retreat weeping beneath a stormy sky. The Five of Swords represents a pyrrhic victory where winning the argument destroys the relationship. Examine whether feeding your ego was worth the bitter cost in trust and goodwill.",
        reversed:
          "Reversed, exhaustion with petty spite leads to laying down arms. You recognize that continued fighting serves no constructive purpose, apologize for your part, and choose peace over proving you were right.",
      },
    },
  },
  {
    id: "swords-06",
    slug: "six-of-swords",
    name: "Six of Swords",
    arcana: "minor",
    suit: "swords",
    number: 6,
    element: "air",
    keywords: {
      upright: ["transition", "moving on", "calmer waters", "departure", "healing journey"],
      reversed: ["carrying baggage", "stalled transition", "unresolved issues", "rough waters"],
    },
    meaning: {
      short: {
        upright: "Journeying away from turbulent turmoil toward serene, calmer emotional shores.",
        reversed:
          "Dragging painful emotional baggage along or encountering roadblocks in transition.",
      },
      full: {
        upright:
          "A ferryman steers a mother and child across rippled water toward peaceful shores, six upright swords planted in their boat. The Six of Swords marks a quiet rite of passage: leaving strife behind and steering toward calm healing. Though sorrow lingers, smoother waters lie ahead.",
        reversed:
          "Reversed, you try to transition to a new chapter while stubbornly clinging to old grievances and emotional baggage. The boat rocks in choppy currents. Lighten your load and resolve past issues before starting anew.",
      },
    },
  },
  {
    id: "swords-07",
    slug: "seven-of-swords",
    name: "Seven of Swords",
    arcana: "minor",
    suit: "swords",
    number: 7,
    element: "air",
    keywords: {
      upright: ["strategy", "stealth", "cunning", "sneakiness", "solo initiative", "deception"],
      reversed: ["confession", "exposed lies", "conscience", "dropping the disguise"],
    },
    meaning: {
      short: {
        upright:
          "Tactical cunning and clever evasion; beware of deceit or cutting ethical corners.",
        reversed: "Secrets come to light; unburden your conscience and face truth transparently.",
      },
      full: {
        upright:
          "A rogue sneaks tiptoeing from an enemy camp carrying five swords, glancing back at two left behind. The Seven of Swords reflects stealthy strategy, clever workarounds, or deceptive behavior. Choose your tactics wisely: shortcuts and secrecy often carry unforeseen consequences.",
        reversed:
          "Reversed, deceptive schemes unravel under scrutiny. Guilt catches up, secrets are exposed, or you finally choose transparency over deception. Confess your mistakes and realign with straightforward honesty.",
      },
    },
  },
  {
    id: "swords-08",
    slug: "eight-of-swords",
    name: "Eight of Swords",
    arcana: "minor",
    suit: "swords",
    number: 8,
    element: "air",
    keywords: {
      upright: [
        "imprisonment",
        "self-imposed limitation",
        "victim mentality",
        "paralysis",
        "anxiety",
      ],
      reversed: ["self-liberation", "new empowerment", "stepping out of fear", "clarity"],
    },
    meaning: {
      short: {
        upright:
          "Feeling trapped by self-limiting beliefs; the loose bindings can be stepped out of at will.",
        reversed:
          "Opening your eyes, casting off self-doubt, and claiming freedom from mental prisons.",
      },
      full: {
        upright:
          "A bound and blindfolded woman stands encircled by eight swords stuck in muddy ground, yet her bindings are loose and space exists to walk free. The Eight of Swords depicts self-imposed helplessness. Your prison is constructed of anxious thoughts; realize your agency and walk out of the circle.",
        reversed:
          "Reversed, the blindfold slips. You recognize that the limitations imprisoning you were largely mental illusions. Reclaim personal power, reject victimhood, and step boldly into open territory.",
      },
    },
  },
  {
    id: "swords-09",
    slug: "nine-of-swords",
    name: "Nine of Swords",
    arcana: "minor",
    suit: "swords",
    number: 9,
    element: "air",
    keywords: {
      upright: ["anxiety", "nightmares", "anguish", "sleeplessness", "mental torment", "worry"],
      reversed: ["recovery", "release of dread", "seeking help", "dawn of perspective"],
    },
    meaning: {
      short: {
        upright: "Late-night anxiety and catastrophic worry; mind-made phantoms tormenting sleep.",
        reversed:
          "Realizing fears were exaggerated, seeking support, and recovering peace of mind.",
      },
      full: {
        upright:
          "Sitting upright in bed with face buried in weeping hands, a figure suffers in the dark beneath nine hanging swords. The Nine of Swords captures 3 a.m. panic, insomnia, and catastrophic mental spirals. Remember that nighttime worries magnify problems tenfold; seek comfort, breath, and daylight.",
        reversed:
          "Reversed, the nightmare breaks. Morning light reveals that catastrophic worst-case scenarios are unlikely to occur. You begin sharing your burdens with trusted counselors or friends and regain mental calm.",
      },
    },
  },
  {
    id: "swords-10",
    slug: "ten-of-swords",
    name: "Ten of Swords",
    arcana: "minor",
    suit: "swords",
    number: 10,
    element: "air",
    keywords: {
      upright: ["rock bottom", "painful ending", "defeat", "betrayal", "inevitable dawn"],
      reversed: ["recovery", "regeneration", "worst is over", "rising from ashes"],
    },
    meaning: {
      short: {
        upright:
          "Hitting rock bottom with dramatic finality; the worst is over and dawn rises on the horizon.",
        reversed:
          "Rising from the ashes, surviving the ordeal, and beginning patient rehabilitation.",
      },
      full: {
        upright:
          "A fallen figure lies pinned by ten swords upon a desolate shore, yet in the distance the dark clouds part for a golden dawn. The Ten of Swords marks rock bottom: a painful cycle has definitively crashed and ended. Do not resist the finale; the pain cannot worsen, and sunrise has already begun.",
        reversed:
          "Reversed, you pull yourself up from the ground. The catastrophic crisis is past, lessons are integrated, and slow recovery begins. You survived what you thought would destroy you; walk into the new dawn stronger than before.",
      },
    },
  },
  {
    id: "swords-page",
    slug: "page-of-swords",
    name: "Page of Swords",
    arcana: "minor",
    suit: "swords",
    number: 11,
    element: "air",
    keywords: {
      upright: ["curiosity", "sharp intellect", "mental agility", "truth-seeking", "vigilance"],
      reversed: ["deceit", "spying", "cynicism", "all talk no action", "defensiveness"],
    },
    meaning: {
      short: {
        upright:
          "An inquisitive mind hungry for knowledge, mental exploration, and candid communication.",
        reversed:
          "Petty gossip, eavesdropping, argumentative cynicism, or sharp-tongued arrogance.",
      },
      full: {
        upright:
          "A nimble youth stands upon windy ground, holding an upright sword ready for intellectual battle. The Page of Swords represents inquisitive curiosity, keen perception, and fearless pursuit of facts. Speak honestly, question dogma, and harness your sharp intellect for good.",
        reversed:
          "Reversed, inquisitive intellect devolves into snooping, vicious online rumors, or endless argumentative bickering. You boast about theories without backing them with practical deeds. Guard your tongue and respect boundaries.",
      },
    },
  },
  {
    id: "swords-knight",
    slug: "knight-of-swords",
    name: "Knight of Swords",
    arcana: "minor",
    suit: "swords",
    number: 12,
    element: "air",
    keywords: {
      upright: ["ambition", "haste", "direct action", "intellectual drive", "determination"],
      reversed: ["recklessness", "blunt cruelty", "tactlessness", "steamrolling others", "haste"],
    },
    meaning: {
      short: {
        upright:
          "Charging fearlessly toward mental objectives with razor-sharp ambition and focus.",
        reversed:
          "Blunt insensitivity, bulldozing others' feelings, and rushing blindly into traps.",
      },
      full: {
        upright:
          "A fierce knight charges headlong across wind-swept plains on a gallop, sword raised high into oncoming gale. The Knight of Swords is the intellectual warrior: resolute, ambitious, fast-moving, and unyielding. Harness this immense drive, but temper velocity with foresight.",
        reversed:
          "Reversed, ferocious speed becomes reckless cruelty. You charge into situations without strategic understanding, cutting down allies with tactless remarks and creating chaos in your wake. Pause, breathe, and evaluate your direction.",
      },
    },
  },
  {
    id: "swords-queen",
    slug: "queen-of-swords",
    name: "Queen of Swords",
    arcana: "minor",
    suit: "swords",
    number: 13,
    element: "air",
    keywords: {
      upright: ["clear boundaries", "objective truth", "intellect", "independence", "perceptive"],
      reversed: ["coldness", "cynicism", "bitterness", "sharp cruelty", "emotional distance"],
    },
    meaning: {
      short: {
        upright:
          "Razor-sharp clarity, fair judgment, and immaculate boundaries born of hard experience.",
        reversed:
          "Icy bitterness, unfeeling cynicism, and isolating yourself behind a wall of armor.",
      },
      full: {
        upright:
          "Sitting upright on a stone throne decorated with cherubs and butterflies, the Queen of Swords raises an upright blade with one hand open to truth. Having weathered great sorrow, she cuts through fluff to see situations with lucid objectivity. Enforce healthy boundaries and speak truth with poise.",
        reversed:
          "Reversed, healthy boundaries harden into icy cruelty and defensive isolation. Past trauma breeds cynical mistrust, leading you to condemn others preemptively. Allow warmth to touch your intellect without compromising truth.",
      },
    },
  },
  {
    id: "swords-king",
    slug: "king-of-swords",
    name: "King of Swords",
    arcana: "minor",
    suit: "swords",
    number: 14,
    element: "air",
    keywords: {
      upright: ["mental clarity", "intellectual authority", "truth", "justice", "logic", "ethics"],
      reversed: ["tyranny", "manipulation", "cruel intellect", "rigid dogmatism", "cold logic"],
    },
    meaning: {
      short: {
        upright:
          "Sovereign intellect, ethical justice, and impartial wisdom govern high-stakes decisions.",
        reversed:
          "Intellectual bullying, rigid dogmatism, or cold calculations stripped of humanity.",
      },
      full: {
        upright:
          "Seated upon his throne crowned with airborne spirits, the King of Swords commands through impartial logic, principled justice, and seasoned intellect. He evaluates complex dilemmas without emotional bias, setting ethical standards that ensure fairness for all. Lead with reasoned clarity.",
        reversed:
          "Reversed, intellectual authority becomes tyrannical and merciless. You use superior intellect to demean, manipulate, or gaslight others. Alternatively, obsession with rigid logic causes you to dismiss vital human emotional realities.",
      },
    },
  },
];
