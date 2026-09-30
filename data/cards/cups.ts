import type { TarotCard } from "@/types/tarot";

export const CUPS_CARDS: TarotCard[] = [
  {
    id: "cups-01",
    slug: "ace-of-cups",
    name: "Ace of Cups",
    arcana: "minor",
    suit: "cups",
    number: 1,
    element: "water",
    keywords: {
      upright: ["love", "new feelings", "emotional awakening", "compassion", "intuition"],
      reversed: ["emotional block", "repressed feelings", "heartbreak", "emptiness", "wasted love"],
    },
    meaning: {
      short: {
        upright:
          "A fountain of pure love, deep emotional connection, and spiritual renewal overflows.",
        reversed: "Emotional blockage, unreciprocated feelings, or draining emotional reserves.",
      },
      full: {
        upright:
          "A chalice overflows with five streams of water into a lily pond while a dove carries a communion host. The Ace of Cups heralds the dawn of profound love, artistic inspiration, emotional healing, and intuitive awakening. Open your heart wide; allow boundless affection and compassion to wash away past grievances.",
        reversed:
          "Reversed, the cup turns downward and spills its sacred contents. You may be repressing deep emotions, nursing emotional wounds in isolation, or giving so much to others that your own spirit feels parched. Turn compassion inward to replenish yourself.",
      },
    },
  },
  {
    id: "cups-02",
    slug: "two-of-cups",
    name: "Two of Cups",
    arcana: "minor",
    suit: "cups",
    number: 2,
    element: "water",
    keywords: {
      upright: ["partnership", "mutual attraction", "unity", "harmony", "connection", "equality"],
      reversed: ["imbalance", "breakup", "disharmony", "misunderstanding", "distrust"],
    },
    meaning: {
      short: {
        upright: "Harmonious union, mutual respect, and deep mutual understanding blossom.",
        reversed: "Misaligned expectations, emotional friction, or broken trust in a close bond.",
      },
      full: {
        upright:
          "A youth and maiden pledge their vows, raising two cups beneath the winged caduceus of healing. The Two of Cups celebrates genuine soul connection, deep romantic harmony, mutual respect, or fruitful partnership. Two independent hearts meet as equals in open vulnerability.",
        reversed:
          "Reversed, misunderstanding and resentment strain a close bond. Unequal emotional investment, poor communication, or conflicting values create distance. Re-establish honest dialogue or reassess whether the partnership remains mutually supportive.",
      },
    },
  },
  {
    id: "cups-03",
    slug: "three-of-cups",
    name: "Three of Cups",
    arcana: "minor",
    suit: "cups",
    number: 3,
    element: "water",
    keywords: {
      upright: ["celebration", "friendship", "community", "gathering", "collaboration", "joy"],
      reversed: ["gossip", "isolation", "overindulgence", "third-party interference", "exclusion"],
    },
    meaning: {
      short: {
        upright:
          "Joyous celebration with cherished friends, creative collaboration, and warm camaraderie.",
        reversed: "Feelings of exclusion, petty social drama, or destructive overindulgence.",
      },
      full: {
        upright:
          "Three maidens raise their golden cups in a joyous circle surrounded by harvest fruits. The Three of Cups represents sisterhood, friendship, collaborative triumph, and social celebrations. Share your happiness with your community and revel in heartfelt togetherness.",
        reversed:
          "Reversed, social gatherings become fraught with gossip, cliquish exclusion, or jealousy. You might feel lonely in a crowded room or suffer consequences from late-night hedonism. Step away from toxic drama and cherish true, steadfast allies.",
      },
    },
  },
  {
    id: "cups-04",
    slug: "four-of-cups",
    name: "Four of Cups",
    arcana: "minor",
    suit: "cups",
    number: 4,
    element: "water",
    keywords: {
      upright: ["apathy", "contemplation", "discontent", "boredom", "missed opportunity"],
      reversed: ["renewed interest", "acceptance", "seizing opportunities", "fresh perspective"],
    },
    meaning: {
      short: {
        upright:
          "Absorbed in discontent and boredom, overlooking a precious gift offered right beside you.",
        reversed: "Snapping out of apathy, embracing gratitude, and seizing overlooked blessings.",
      },
      full: {
        upright:
          "Sitting cross-legged under a tree with folded arms, a youth ignores three cups before him while a fourth is offered by a cloud. The Four of Cups mirrors stagnation, disillusionment, and self-absorbed indifference. Lift your gaze; unexamined blessings and fresh chances await your recognition.",
        reversed:
          "Reversed, the fog of apathy dissipates. You shake off withdrawal, accept emotional help, and appreciate everyday gifts with renewed enthusiasm. An exciting realization sparks active engagement with life.",
      },
    },
  },
  {
    id: "cups-05",
    slug: "five-of-cups",
    name: "Five of Cups",
    arcana: "minor",
    suit: "cups",
    number: 5,
    element: "water",
    keywords: {
      upright: ["grief", "sorrow", "regret", "loss", "disappointment", "mourning"],
      reversed: ["acceptance", "moving on", "healing", "forgiveness", "finding hope"],
    },
    meaning: {
      short: {
        upright:
          "Mourning spilled cups and past losses, yet two upright vessels stand waiting behind you.",
        reversed:
          "Grief gives way to healing, acceptance, and gentle steps toward a hopeful future.",
      },
      full: {
        upright:
          "Cloaked in black, a weeping figure gazes down at three spilled cups of red wine, oblivious to two full chalices behind him across the bridge to safety. The Five of Cups acknowledges deep grief, regret, and sorrow. Honor your pain, but do not let it blind you to the love and possibilities that still endure.",
        reversed:
          "Reversed, sorrow reaches its turning point. You stop looking solely at what was lost and turn to pick up the remaining vessels. Healing begins through forgiveness, self-acceptance, and moving forward across the bridge of renewal.",
      },
    },
  },
  {
    id: "cups-06",
    slug: "six-of-cups",
    name: "Six of Cups",
    arcana: "minor",
    suit: "cups",
    number: 6,
    element: "water",
    keywords: {
      upright: ["nostalgia", "childhood memories", "innocence", "joy", "reunion", "sweetness"],
      reversed: ["stuck in the past", "unrealistic nostalgia", "growing up", "letting go of youth"],
    },
    meaning: {
      short: {
        upright:
          "Sweet nostalgia, pure childhood innocence, or a heartwarming reunion with the past.",
        reversed:
          "Romanticizing the past to avoid current realities or clinging to outdated memories.",
      },
      full: {
        upright:
          "In a storybook village courtyard, a child offers a cup filled with white flowers to a younger friend. The Six of Cups evokes heartwarming innocence, nostalgic warmth, and reunions with childhood friends or past loves. Reconnect with the simple, unpretentious joys that make your inner child smile.",
        reversed:
          "Reversed, pleasant nostalgia becomes an escapist trap. Looking through rose-colored glasses makes the present seem bleak and discourages mature growth. Cherish fond memories, but dedicate your energy to building your present life.",
      },
    },
  },
  {
    id: "cups-07",
    slug: "seven-of-cups",
    name: "Seven of Cups",
    arcana: "minor",
    suit: "cups",
    number: 7,
    element: "water",
    keywords: {
      upright: ["illusions", "daydreaming", "choices", "wishful thinking", "fantasy", "temptation"],
      reversed: ["clarity", "decisiveness", "reality check", "focus", "grounded purpose"],
    },
    meaning: {
      short: {
        upright:
          "Dazzling array of choices and fantasies; discern genuine gold from shimmering mirages.",
        reversed:
          "Cutting through confusion, abandoning castle-in-the-air dreams, and making realistic choices.",
      },
      full: {
        upright:
          "A silhouette contemplates seven floating cups filled with jewels, serpents, castles, and laurels. The Seven of Cups warns of alluring fantasies, indecision, and option overload. Daydreaming is pleasant, but building dreams into reality requires discerning truth from illusion and committing decisively.",
        reversed:
          "Reversed, smoke and mirrors dissipate. A healthy reality check grounds your ambitions. You discard impractical fantasies, narrow down choices with sober clarity, and focus on practical steps toward tangible goals.",
      },
    },
  },
  {
    id: "cups-08",
    slug: "eight-of-cups",
    name: "Eight of Cups",
    arcana: "minor",
    suit: "cups",
    number: 8,
    element: "water",
    keywords: {
      upright: [
        "walking away",
        "abandonment",
        "search for truth",
        "leaving the familiar",
        "disillusion",
      ],
      reversed: ["fear of change", "staying in bad situation", "aimless wandering", "reluctance"],
    },
    meaning: {
      short: {
        upright: "A courageous soul journey: walking away from what no longer feeds your spirit.",
        reversed: "Clinging to dead relationships or feeling torn between departure and safety.",
      },
      full: {
        upright:
          "Beneath a combined moon and eclipse, a traveler clad in red turns his back on eight neatly stacked cups to journey into rocky mountains. The Eight of Cups marks the poignant courage to walk away from situations that look fine externally but have grown spiritually empty. Seek deeper truth.",
        reversed:
          "Reversed, you know in your heart that a situation is finished, yet fear of loneliness or the unknown keeps you trapped. Alternatively, you wander restlessly from person to project without ever putting down roots. Face what you are running from.",
      },
    },
  },
  {
    id: "cups-09",
    slug: "nine-of-cups",
    name: "Nine of Cups",
    arcana: "minor",
    suit: "cups",
    number: 9,
    element: "water",
    keywords: {
      upright: ["contentment", "satisfaction", "wishes granted", "gratitude", "luxury", "pleasure"],
      reversed: ["smugness", "greed", "overindulgence", "hollow wishes", "dissatisfaction"],
    },
    meaning: {
      short: {
        upright:
          "The 'Wish Card': profound personal satisfaction, emotional comfort, and dreams fulfilled.",
        reversed:
          "Superficial indulgence, feeling empty despite material success, or smug complacency.",
      },
      full: {
        upright:
          "A well-fed merchant sits with crossed arms and a beaming smile before nine overflowing golden chalices. Traditionally known as the 'Wish Card,' the Nine of Cups heralds contentment, emotional fulfillment, physical comfort, and good fortune. Celebrate your blessings with genuine gratitude.",
        reversed:
          "Reversed, achieving a long-sought goal leaves an unexpected sense of emptiness. Chasing shallow pleasures, bragging, or gluttony cannot substitute for true spiritual fulfillment. Align wishes with soul values rather than ego.",
      },
    },
  },
  {
    id: "cups-10",
    slug: "ten-of-cups",
    name: "Ten of Cups",
    arcana: "minor",
    suit: "cups",
    number: 10,
    element: "water",
    keywords: {
      upright: [
        "divine love",
        "blissful harmony",
        "family happiness",
        "emotional alignment",
        "peace",
      ],
      reversed: [
        "broken home",
        "family conflict",
        "unrealistic ideals",
        "misalignment",
        "isolation",
      ],
    },
    meaning: {
      short: {
        upright:
          "Lasting emotional harmony, domestic bliss, and radiant shared happiness under the rainbow.",
        reversed: "Domestic strife, clashing family values, or feeling detached from loved ones.",
      },
      full: {
        upright:
          "A loving couple rejoices with their dancing children under a shimmering rainbow of ten golden cups spanning their peaceful country home. The Ten of Cups is the pinnacle of emotional fulfillment, enduring love, family harmony, and serene domestic bliss. Cherish this radiant sense of belonging.",
        reversed:
          "Reversed, idyllic harmony fractures under the weight of unresolved family tensions, unrealistic expectations, or domestic disputes. Stop pretending everything is perfect; address emotional rifts with patience and authentic vulnerability.",
      },
    },
  },
  {
    id: "cups-page",
    slug: "page-of-cups",
    name: "Page of Cups",
    arcana: "minor",
    suit: "cups",
    number: 11,
    element: "water",
    keywords: {
      upright: [
        "creative intuition",
        "gentle curiosity",
        "sweet message",
        "dreamer",
        "sensitivity",
      ],
      reversed: ["emotional immaturity", "insecurity", "creative block", "moodiness", "drama"],
    },
    meaning: {
      short: {
        upright:
          "A gentle messenger brings imaginative surprises, intuitive insights, and tender affection.",
        reversed:
          "Hypersensitivity, mood swings, or using emotional drama as a shield against reality.",
      },
      full: {
        upright:
          "Standing by a wavy sea, a playful youth in flowered doublet gazes with gentle wonder at a fish emerging from his golden cup. The Page of Cups embodies intuitive innocence, poetic imagination, and sweet romantic messages. Listen to spontaneous hunches and express heartfelt feelings freely.",
        reversed:
          "Reversed, emotional sensitivity turns into sulking moodiness, childish tantrums, or avoidance of responsibility. You may become swept away in escapist daydreams or feel terrified of emotional vulnerability. Ground your feelings in reality.",
      },
    },
  },
  {
    id: "cups-knight",
    slug: "knight-of-cups",
    name: "Knight of Cups",
    arcana: "minor",
    suit: "cups",
    number: 12,
    element: "water",
    keywords: {
      upright: ["romance", "charm", "idealism", "poetic imagination", "invitation", "grace"],
      reversed: ["jealousy", "manipulation", "moodiness", "unrealistic romance", "disappointment"],
    },
    meaning: {
      short: {
        upright:
          "A charming, poetic soul brings romantic gestures, artistic invitations, and heartfelt grace.",
        reversed:
          "Deceptive charm, love-bombing, or escaping hard realities through romantic fantasy.",
      },
      full: {
        upright:
          "Riding a gentle, graceful steed in winged helmet and cloak of fish, the Knight of Cups journeys on a quest of the heart. He brings artistic inspiration, charming proposals, and chivalrous romance. Follow your poetic vision and express compassion with romantic elegance.",
        reversed:
          "Reversed, romantic charm turns into fickle manipulation, love-bombing, or brooding mood swings. The lover who seemed ideal proves evasive or unreliable when mundane challenges arise. Look beyond flowery promises to assess actions.",
      },
    },
  },
  {
    id: "cups-queen",
    slug: "queen-of-cups",
    name: "Queen of Cups",
    arcana: "minor",
    suit: "cups",
    number: 13,
    element: "water",
    keywords: {
      upright: ["compassion", "calm empathy", "deep intuition", "emotional security", "nurturing"],
      reversed: ["codependency", "martyrdom", "emotional overwhelm", "manipulation", "insecurity"],
    },
    meaning: {
      short: {
        upright:
          "Unconditional empathy, emotional wisdom, and intuitive nurturing create a safe harbor.",
        reversed:
          "Emotional burnout from absorbing others' distress, or passive-aggressive guilt trips.",
      },
      full: {
        upright:
          "Sitting on a throne carved with cherubs and sea nymphs, the Queen of Cups cradles an ornate chalice at the water's edge. She is the empathetic healer and intuitive mystic who listens with unconditional warmth. Hold sacred space for others without losing your own centered peace.",
        reversed:
          "Reversed, boundless empathy becomes draining codependency. You absorb toxic emotions like a sponge, losing yourself in others' problems or resorting to guilt trips when unappreciated. Establish firm energetic boundaries and practice self-tending.",
      },
    },
  },
  {
    id: "cups-king",
    slug: "king-of-cups",
    name: "King of Cups",
    arcana: "minor",
    suit: "cups",
    number: 14,
    element: "water",
    keywords: {
      upright: ["emotional balance", "compassionate wisdom", "diplomacy", "composure", "counsel"],
      reversed: ["emotional volatility", "cold detachment", "manipulation", "turbulent moods"],
    },
    meaning: {
      short: {
        upright:
          "Mastery over feelings: calm composure, diplomatic wisdom, and grounded compassion amidst storm.",
        reversed:
          "Repressed turmoil erupting unexpectedly, emotional blackmail, or callous detachment.",
      },
      full: {
        upright:
          "Seated upon a stone throne floating steadily amidst tossing ocean waves, the King of Cups embodies emotional maturity and diplomatic mastery. He balances head and heart with serene poise, offering compassionate counsel without being swayed by drama. Lead with gentle, steadfast empathy.",
        reversed:
          "Reversed, the calm facade conceals stormy turmoil. You may oscillate between cold, cynical detachment and passive-aggressive manipulation. Alternatively, excessive substance use or emotional outbursts undermine your authority. Restore emotional equilibrium.",
      },
    },
  },
];
