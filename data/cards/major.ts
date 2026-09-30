import type { TarotCard } from "@/types/tarot";

export const MAJOR_ARCANA_CARDS: TarotCard[] = [
  {
    id: "fool",
    slug: "the-fool",
    name: "The Fool",
    arcana: "major",
    suit: null,
    number: 0,
    element: "air",
    keywords: {
      upright: ["beginnings", "innocence", "spontaneity", "free spirit", "leap of faith"],
      reversed: ["recklessness", "hesitation", "risk-taking", "naivety", "foolishness"],
    },
    meaning: {
      short: {
        upright: "A new journey begins with optimism, trust, and untamed potential.",
        reversed: "Careless risks or holding back from taking an essential leap.",
      },
      full: {
        upright:
          "The Fool stands at the edge of the cliff, ready to step into the unknown. It calls you to embrace new adventures with pure trust, openhearted curiosity, and an unburdened spirit. Shed preconceived expectations and leap courageously into fresh horizons.",
        reversed:
          "Reversed, The Fool cautions against foolish impulsiveness or reckless abandon without regard for consequences. Alternatively, it signifies paralyzing hesitation, where fear of making a mistake prevents you from starting an exciting new chapter.",
      },
    },
  },
  {
    id: "magician",
    slug: "the-magician",
    name: "The Magician",
    arcana: "major",
    suit: null,
    number: 1,
    element: "air",
    keywords: {
      upright: ["manifestation", "resourcefulness", "power", "inspired action", "skill"],
      reversed: ["manipulation", "illusion", "latent talent", "wasted potential", "deception"],
    },
    meaning: {
      short: {
        upright: "You possess all necessary resources and focused will to manifest your intent.",
        reversed: "Misdirected energy, unexpressed potential, or deceptive motives.",
      },
      full: {
        upright:
          "The Magician bridges heaven and earth, channeling divine inspiration into physical creation. You currently hold all tools—intellect, passion, emotions, and practical means—required to achieve your aspirations. Channel your focus into deliberate, inspired action.",
        reversed:
          "When reversed, The Magician warns against trickery, manipulation, or superficial charm masking ill intentions. It can also point to untapped gifts and creative blockages where brilliant ideas fail to materialize due to lack of discipline.",
      },
    },
  },
  {
    id: "high-priestess",
    slug: "the-high-priestess",
    name: "The High Priestess",
    arcana: "major",
    suit: null,
    number: 2,
    element: "water",
    keywords: {
      upright: ["intuition", "sacred knowledge", "divine feminine", "subconscious", "mystery"],
      reversed: [
        "secrets",
        "disconnected intuition",
        "superficiality",
        "repressed feelings",
        "silence",
      ],
    },
    meaning: {
      short: {
        upright: "Look within; your intuition and subconscious hold the hidden answers.",
        reversed: "Ignoring your inner voice or keeping hidden agendas that breed distrust.",
      },
      full: {
        upright:
          "Sitting between the dark and light pillars of mystery, The High Priestess invites you to retreat from external noise and honor your quiet inner wisdom. Trust your gut feelings, lucid dreams, and intuitive insights; truths are unfolding beneath the visible surface.",
        reversed:
          "Reversed, you may be disconnected from your intuition, relying excessively on external validation or logical overthinking. Be cautious of deceit, hidden motives, or keeping secrets that separate you from genuine emotional clarity.",
      },
    },
  },
  {
    id: "empress",
    slug: "the-empress",
    name: "The Empress",
    arcana: "major",
    suit: null,
    number: 3,
    element: "earth",
    keywords: {
      upright: ["fertility", "abundance", "nurturing", "creativity", "nature", "sensuality"],
      reversed: ["creative block", "dependence", "emptiness", "smothering", "disharmony"],
    },
    meaning: {
      short: {
        upright: "Abundant growth, creative fruition, and loving vitality flourish around you.",
        reversed: "Overbearing attachment, neglected self-care, or blocked creative expression.",
      },
      full: {
        upright:
          "The Empress represents maternal warmth, bountiful nature, and creative manifestation. Projects, relationships, and ideas enter a phase of fertile expansion. Surround yourself with beauty, cultivate gratitude, and generously nurture what you wish to see thrive.",
        reversed:
          "In reverse, The Empress highlights feelings of creative drought, smothering behavior, or neglect of personal boundaries. You may be giving endlessly until your own reserves run dry; prioritize gentle self-nourishment and reconnect with the natural world.",
      },
    },
  },
  {
    id: "emperor",
    slug: "the-emperor",
    name: "The Emperor",
    arcana: "major",
    suit: null,
    number: 4,
    element: "fire",
    keywords: {
      upright: ["authority", "structure", "stability", "leadership", "discipline", "protection"],
      reversed: ["tyranny", "rigidity", "loss of control", "domination", "inflexibility"],
    },
    meaning: {
      short: {
        upright: "Establish clear structures, disciplined boundaries, and resolute leadership.",
        reversed: "Excessive control, autocratic rigidity, or crumbling authority.",
      },
      full: {
        upright:
          "Seated firmly on a stone throne, The Emperor embodies disciplined order, strategic foresight, and sovereign protection. It is time to create stability through systemization, accountability, and dependable action. Stand tall in your authority and govern your endeavors with clarity.",
        reversed:
          "Reversed, The Emperor signals micromanagement, tyrannical pride, or stubborn resistance to change. Alternatively, it reflects chaotic disorganization where a lack of discipline causes plans to unravel under pressure.",
      },
    },
  },
  {
    id: "hierophant",
    slug: "the-hierophant",
    name: "The Hierophant",
    arcana: "major",
    suit: null,
    number: 5,
    element: "earth",
    keywords: {
      upright: ["tradition", "spiritual wisdom", "institutions", "mentorship", "belief systems"],
      reversed: ["rebellion", "unconventionality", "dogma", "new beliefs", "restriction"],
    },
    meaning: {
      short: {
        upright: "Draw wisdom from time-tested traditions, trusted mentors, and core principles.",
        reversed: "Challenging outmoded dogma and forging your own authentic philosophy.",
      },
      full: {
        upright:
          "The Hierophant governs sacred traditions, formal learning, and collective wisdom. Seek guidance from respected elders, seasoned advisors, or established frameworks. There is strength in honoring lineage, shared rituals, and grounded moral ethics.",
        reversed:
          "Reversed, The Hierophant urges you to question outdated institutional dogma and blind conformity. Shed restrictive orthodoxies that no longer serve your evolution, and discover your own unique spiritual and personal truths.",
      },
    },
  },
  {
    id: "lovers",
    slug: "the-lovers",
    name: "The Lovers",
    arcana: "major",
    suit: null,
    number: 6,
    element: "air",
    keywords: {
      upright: ["love", "harmony", "relationships", "values alignment", "meaningful choices"],
      reversed: ["disharmony", "imbalance", "conflict of values", "misalignment", "indecision"],
    },
    meaning: {
      short: {
        upright:
          "Harmonious union and pivotal decisions made from genuine alignment with core values.",
        reversed: "Friction in relationships or inner conflict between opposing moral paths.",
      },
      full: {
        upright:
          "The Lovers represents sacred duality coming into profound union. Beyond romantic devotion, it symbolizes crucial crossroads where decisions must be made in strict alignment with personal integrity. When heart and intellect harmonize, deep connection blossoms.",
        reversed:
          "Reversed, The Lovers indicates inner disunion, broken communication, or misaligned priorities with a partner. You may be making compromises that violate your authentic beliefs; examine what true reciprocity requires.",
      },
    },
  },
  {
    id: "chariot",
    slug: "the-chariot",
    name: "The Chariot",
    arcana: "major",
    suit: null,
    number: 7,
    element: "water",
    keywords: {
      upright: ["determination", "willpower", "drive", "victory", "triumph", "focus"],
      reversed: ["lack of direction", "aggression", "loss of control", "obstacles", "burnout"],
    },
    meaning: {
      short: {
        upright: "Harness opposing forces with unwavering focus to drive steadily toward victory.",
        reversed: "Erratic pacing, aggressive impatience, or losing your grip on direction.",
      },
      full: {
        upright:
          "Steering two sphinxes pulling in opposite directions, The Chariot represents mastery over internal conflicts through disciplined will. Maintain resolute concentration on your objective. Confidence, endurance, and purpose-driven momentum conquer every obstacle.",
        reversed:
          "Reversed, The Chariot cautions against forcing outcomes through reckless brute force or road rage. Alternatively, it mirrors feelings of aimless drift, where conflicting priorities pull you apart without making meaningful headway.",
      },
    },
  },
  {
    id: "strength",
    slug: "strength",
    name: "Strength",
    arcana: "major",
    suit: null,
    number: 8,
    element: "fire",
    keywords: {
      upright: ["courage", "compassion", "inner strength", "patience", "gentle mastery"],
      reversed: ["self-doubt", "raw emotion", "weakness", "insecurity", "impatience"],
    },
    meaning: {
      short: {
        upright: "True power lies in gentle patience, quiet courage, and compassionate mastery.",
        reversed: "Overcoming self-doubt, volatile temper, or feeling spiritually depleted.",
      },
      full: {
        upright:
          "Gently closing the lion's jaws without armor or weapons, Strength demonstrates that compassion conquers where force fails. Master your primal instincts, anxieties, and anger through love, resilience, and calm endurance. You are far more resilient than you realize.",
        reversed:
          "Reversed, Strength indicates that self-doubt or runaway passions are eroding your confidence. You might be lashing out defensively or succumbing to inner defeatism. Reconnect with self-forgiveness and steady your emotional ground.",
      },
    },
  },
  {
    id: "hermit",
    slug: "the-hermit",
    name: "The Hermit",
    arcana: "major",
    suit: null,
    number: 9,
    element: "earth",
    keywords: {
      upright: ["introspection", "solitude", "inner guidance", "soul-searching", "wisdom"],
      reversed: ["isolation", "loneliness", "withdrawal", "rejection", "paranoia"],
    },
    meaning: {
      short: {
        upright: "Withdraw into quiet reflection to illuminate your path through inner wisdom.",
        reversed:
          "Excessive withdrawal turning into bitter isolation or fear of returning to life.",
      },
      full: {
        upright:
          "Holding aloft the lantern of truth atop a snowy mountain, The Hermit invites intentional retreat from worldly distractions. Solitude is your sanctuary now; examine your values, seek clarity within, and allow your inner light to reveal the next step.",
        reversed:
          "Reversed, contemplation has curdled into unhealthy seclusion, loneliness, or anti-social detachment. Do not hide from the world out of fear or resentment; know when contemplation has accomplished its task and step back into community.",
      },
    },
  },
  {
    id: "wheel-of-fortune",
    slug: "wheel-of-fortune",
    name: "Wheel of Fortune",
    arcana: "major",
    suit: null,
    number: 10,
    element: "fire",
    keywords: {
      upright: ["change", "cycles", "fate", "destiny", "turning point", "good luck"],
      reversed: ["bad luck", "resisting change", "setbacks", "breaking cycles", "turbulence"],
    },
    meaning: {
      short: {
        upright: "A cosmic turning point brings fortunate shifts; accept life's eternal cycles.",
        reversed:
          "Resisting inevitable transitions or experiencing temporary setbacks in momentum.",
      },
      full: {
        upright:
          "The Wheel of Fortune reminds us that life exists in perpetual motion. Fortune turns in your favor, bringing sudden opportunities, synchronicities, and breakthroughs. Align with the cosmic rhythm, stay grounded at the still center, and ride the rising wave.",
        reversed:
          "Reversed, the wheel brings temporary friction, delay, or bad timing. Remember that downturns are as natural as ascents. Rather than fighting inevitable shifts, seek the lesson, break old compulsive habits, and prepare for the cycle to renew.",
      },
    },
  },
  {
    id: "justice",
    slug: "justice",
    name: "Justice",
    arcana: "major",
    suit: null,
    number: 11,
    element: "air",
    keywords: {
      upright: ["fairness", "truth", "cause and effect", "law", "accountability", "clarity"],
      reversed: ["unfairness", "dishonesty", "lack of accountability", "bias", "blame"],
    },
    meaning: {
      short: {
        upright:
          "Truth, fairness, and accountability govern outcomes; examine decisions with objective eyes.",
        reversed: "Dishonesty, unfair treatment, or refusing to take responsibility for your part.",
      },
      full: {
        upright:
          "Holding the scales of truth and the double-edged sword of insight, Justice demands total impartiality and intellectual honesty. Actions bear karmic fruit; accept past choices and proceed with unflinching ethical integrity. Clear, fair resolutions are at hand.",
        reversed:
          "Reversed, Justice reveals prejudice, unresolved guilt, or attempts to dodge accountability. You may feel unjustly judged by others, or find yourself rationalizing deceitful actions. Confront truth head-on to restore balance.",
      },
    },
  },
  {
    id: "hanged-man",
    slug: "the-hanged-man",
    name: "The Hanged Man",
    arcana: "major",
    suit: null,
    number: 12,
    element: "water",
    keywords: {
      upright: ["surrender", "new perspective", "letting go", "pause", "sacrifice", "patience"],
      reversed: ["martyrdom", "resistance", "stalling", "needless sacrifice", "indecision"],
    },
    meaning: {
      short: {
        upright:
          "Pause deliberate striving; surrender control to perceive the situation upside-down.",
        reversed: "Dragging your feet in indecision or playing the helpless martyr.",
      },
      full: {
        upright:
          "Suspended calmly by one foot with a serene halo of illumination, The Hanged Man willingly halts all striving. What appears as a delay is sacred gestation. Surrender the need to force outcomes, release stubborn attachments, and watch an unexpected insight turn reality upside-down.",
        reversed:
          "Reversed, you may be resisting a necessary pause, thrashing fruitlessly against circumstances beyond your control. Beware of self-inflicted martyrdom or staying stagnant out of stubbornness. Surrender what must go so movement can resume.",
      },
    },
  },
  {
    id: "death",
    slug: "death",
    name: "Death",
    arcana: "major",
    suit: null,
    number: 13,
    element: "water",
    keywords: {
      upright: ["transformation", "endings", "transition", "letting go", "rebirth", "closure"],
      reversed: ["fear of change", "holding on", "stagnation", "decay", "prolonged grief"],
    },
    meaning: {
      short: {
        upright: "A definitive ending sweeps away outworn forms to make sacred room for rebirth.",
        reversed: "Clinging to dead habits, relationships, or obsolete chapters out of fear.",
      },
      full: {
        upright:
          "Death is not physical demise, but the solemn herald of absolute metamorphosis. An era, belief, or lifestyle has completed its life cycle. Release it gracefully without remorse; pruning the withered branch allows vibrant, radiant new growth to emerge.",
        reversed:
          "Reversed, you are clinging tightly to that which has already expired. Clinging to the corpse of the past creates stagnation and unnecessary suffering. Breathe deep, uncurl your fists, and permit the natural transition to finish its sacred work.",
      },
    },
  },
  {
    id: "temperance",
    slug: "temperance",
    name: "Temperance",
    arcana: "major",
    suit: null,
    number: 14,
    element: "fire",
    keywords: {
      upright: ["balance", "moderation", "patience", "alchemy", "harmony", "purpose"],
      reversed: ["imbalance", "extremes", "excess", "haste", "discord", "clashing"],
    },
    meaning: {
      short: {
        upright: "Blend diverse elements with patience and moderation to cultivate inner alchemy.",
        reversed: "Swinging between extremes, indulging in excess, or forcing impatient results.",
      },
      full: {
        upright:
          "Pouring liquid smoothly between two golden vessels with one foot in water and one on earth, Temperance embodies harmonious alchemy. Practice the middle way: avoid knee-jerk extremes, synthesize opposing views, and allow patience to transmute discord into tranquil gold.",
        reversed:
          "Reversed, Temperance points to overindulgence, hectic schedules, or volatile emotional outbursts. You are pouring from a chaotic angle and spilling your energy. Step back, moderate your appetites, and restore calm equilibrium.",
      },
    },
  },
  {
    id: "devil",
    slug: "the-devil",
    name: "The Devil",
    arcana: "major",
    suit: null,
    number: 15,
    element: "earth",
    keywords: {
      upright: ["shadow self", "attachment", "addiction", "restriction", "materialism", "illusion"],
      reversed: ["liberation", "reclaiming power", "breaking chains", "awareness", "freedom"],
    },
    meaning: {
      short: {
        upright: "Acknowledge toxic dependencies, compulsive patterns, and self-imposed cages.",
        reversed: "Awakening to your bondage, shedding illusions, and stepping into freedom.",
      },
      full: {
        upright:
          "The figures chained before The Devil wear loose collars they could lift off at any moment. This card reflects voluntary enslavement to material cravings, toxic relationships, addictions, or limiting beliefs. Shed light on your shadow: acknowledge the cage you helped build.",
        reversed:
          "Reversed, the scales fall from your eyes. You recognize the cost of self-destructive patterns and muster the courage to break free. Reclaim sovereignty over your desires, shatter false obligations, and walk out of the cell.",
      },
    },
  },
  {
    id: "tower",
    slug: "the-tower",
    name: "The Tower",
    arcana: "major",
    suit: null,
    number: 16,
    element: "fire",
    keywords: {
      upright: ["sudden change", "upheaval", "awakening", "collapse of illusion", "revelation"],
      reversed: ["disaster averted", "delaying inevitable", "fear of suffering", "inner storm"],
    },
    meaning: {
      short: {
        upright: "A lightning bolt of truth shatters false foundations to liberate your soul.",
        reversed: "Struggling to hold up a crumbling facade or quietly weathering internal shock.",
      },
      full: {
        upright:
          "Lightning strikes the stone crown of arrogance, toppling structures built on faulty premises. Though sudden and shocking, The Tower's destruction is ultimately redemptive: it obliterates comfortable lies so that only immutable truth remains. Surrender the ruins.",
        reversed:
          "Reversed, you sense disaster looming and attempt to patch a doomed foundation. Propping up a rotting structure only postpones the inevitable. Accept the collapse gracefully; the sooner the false falls away, the sooner rebuilding begins.",
      },
    },
  },
  {
    id: "star",
    slug: "the-star",
    name: "The Star",
    arcana: "major",
    suit: null,
    number: 17,
    element: "air",
    keywords: {
      upright: ["hope", "faith", "healing", "inspiration", "serenity", "renewal"],
      reversed: ["hopelessness", "despair", "discouragement", "insecurity", "cynicism"],
    },
    meaning: {
      short: {
        upright: "Peace, renewed hope, and spiritual healing pour effortlessly into your life.",
        reversed: "Temporary loss of faith, self-doubt, or cynical exhaustion.",
      },
      full: {
        upright:
          "Under a glittering night sky, the maiden pours water upon both earth and pool. Following the upheaval of The Tower, The Star brings sublime peace, divine hope, and restorative clarity. Your faith is rewarded; open your heart to inspiration and trust that you are deeply guided.",
        reversed:
          "Reversed, dark clouds obscure your guiding star, leading to cynicism, despair, or lack of inspiration. You are looking at the mud rather than the heavens. Reconnect with gentle daily gratitude and remember that the light has not died; it simply awaits your gaze.",
      },
    },
  },
  {
    id: "moon",
    slug: "the-moon",
    name: "The Moon",
    arcana: "major",
    suit: null,
    number: 18,
    element: "water",
    keywords: {
      upright: ["illusion", "fear", "anxiety", "subconscious", "intuition", "dreams"],
      reversed: ["clarity", "release of fear", "unveiling truth", "subsiding anxiety"],
    },
    meaning: {
      short: {
        upright:
          "Navigate shadowy illusions and deceptive fears by trusting quiet inner instincts.",
        reversed: "Morning light dissipates confusion, revealing truth behind nocturnal fears.",
      },
      full: {
        upright:
          "A dog and wolf bay at the enigmatic moon as a crayfish crawls from dark waters. The Moon takes you through the hazy landscape of the subconscious where illusions, unexamined anxieties, and phantoms distort reality. Walk carefully; appearances deceive, and dreams carry coded warnings.",
        reversed:
          "Reversed, the dense mist lifts. Phobias and misunderstandings unravel in the dawn light. Secrets are revealed, clarity returns to unsettled thoughts, and you can separate real intuition from irrational projections.",
      },
    },
  },
  {
    id: "sun",
    slug: "the-sun",
    name: "The Sun",
    arcana: "major",
    suit: null,
    number: 19,
    element: "fire",
    keywords: {
      upright: ["joy", "vitality", "success", "radiance", "warmth", "celebration"],
      reversed: ["diminished joy", "temporary sadness", "overoptimism", "unrealistic dreams"],
    },
    meaning: {
      short: {
        upright: "Radiant joy, vitality, and triumph shine brightly across all your endeavors.",
        reversed: "Clouded enthusiasm or struggling to appreciate current blessings.",
      },
      full: {
        upright:
          "A radiant child rides a white horse beneath a blazing, benevolent sun. This is the supreme card of vitality, unadulterated joy, clarity, and celebration. Your authenticity shines with irresistible warmth. Bask in success, share your happiness, and embrace exuberant life.",
        reversed:
          "Reversed, The Sun remains fundamentally positive, but its rays are temporarily shielded by gray clouds. You may feel low energy, take blessings for granted, or struggle with unrealistic expectations. Rest assured: daylight will soon disperse the shadows.",
      },
    },
  },
  {
    id: "judgement",
    slug: "judgement",
    name: "Judgement",
    arcana: "major",
    suit: null,
    number: 20,
    element: "fire",
    keywords: {
      upright: ["rebirth", "inner calling", "absolution", "reckoning", "awakening"],
      reversed: ["self-doubt", "harsh judgment", "ignoring the call", "regret", "guilt"],
    },
    meaning: {
      short: {
        upright: "Answering a profound inner calling; evaluate your life with loving forgiveness.",
        reversed: "Paralyzing self-blame or ignoring the urgent trumpet of transformation.",
      },
      full: {
        upright:
          "An angel sounds the golden trumpet, and figures rise from their graves with outstretched arms. You are called to a higher purpose and spiritual reckoning. Forgive past shortcomings, step into elevated consciousness, and answer your true soul calling with decisive clarity.",
        reversed:
          "Reversed, you are tormenting yourself with harsh self-judgment, regret, and hypercritical blame. Alternatively, you hear the awakening call clearly but refuse to answer out of fear. Grant yourself absolution and take responsibility for starting anew.",
      },
    },
  },
  {
    id: "world",
    slug: "the-world",
    name: "The World",
    arcana: "major",
    suit: null,
    number: 21,
    element: "earth",
    keywords: {
      upright: ["completion", "wholeness", "accomplishment", "integration", "travel", "harmony"],
      reversed: ["lack of closure", "unfinished business", "delays", "stagnant finale"],
    },
    meaning: {
      short: {
        upright: "A major cycle reaches triumphant completion and holistic integration.",
        reversed: "Missing the final piece of closure or delaying a well-deserved milestone.",
      },
      full: {
        upright:
          "Dancing inside the laurel wreath surrounded by the four sacred guardians, The World celebrates the triumphant culmination of your spiritual voyage. You have integrated fragmented parts into harmonious wholeness. Celebrate your fulfillment before the next glorious circle begins.",
        reversed:
          "Reversed, a significant project or emotional chapter drags on, hovering just shy of true closure. Identify what remaining loose thread or unsaid apology prevents complete resolution, tie it up cleanly, and step into graduation.",
      },
    },
  },
];
