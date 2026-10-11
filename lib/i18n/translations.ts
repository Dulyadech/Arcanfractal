export type Locale = "en";

export interface Translations {
  nav: {
    inquiry: string;
    spreads: string;
    history: string;
    newReading: string;
  };
  landing: {
    stepBadge: string;
    headlinePart1: string;
    headlineAccent: string;
    subtitle: string;
    inputPlaceholder: string;
    promptIdeas: string;
    guidance: string;
    random: string;
    clear: string;
    continueBtn: string;
    minCharsRequired: string;
    maxCharsExceeded: string;
    readyToDraw: string;
  };
  guidance: {
    title: string;
    subtitle: string;
    badge: string;
    intro: string;
    closedTitle: string;
    closedExample1: string;
    closedExample2: string;
    closedExample3: string;
    openTitle: string;
    openExample1: string;
    openExample2: string;
    openExample3: string;
    invariantTitle: string;
    invariantDesc: string;
  };
  spreads: {
    stepBadge: string;
    headline: string;
    subtitle: string;
    focusedInquiry: string;
    editQuestion: string;
    positionMeanings: string;
    dynamicFlow: string;
    reversedLabel: string;
    reversedActive: string;
    reversedOff: string;
    reversedDesc: string;
    beginBtn: string;
    preparing: string;
  };
  shuffle: {
    stepBadge: string;
    breatheTitle: string;
    breatheSubtitle: string;
    shufflingTitle: string;
    shufflingSubtitle: string;
    skipBtn: string;
    preparingDeck: string;
    readyTitle: string;
    errorTitle: string;
    retryBtn: string;
    backBtn: string;
    inhale: string;
    exhale: string;
  };
  select: {
    stepBadge: string;
    headline: string;
    subtitle: string;
    selectedCount: string;
    cardsRemaining: string;
    tapToReveal: string;
    interpretingTitle: string;
    interpretingSubtitle: string;
    detailPrompt: string;
    revealed: string;
    tapDeckPrompt: string;
    interpretBtn: string;
    interpretBtnSub: string;
  };
  result: {
    headline: string;
    subtitle: string;
    overview: string;
    cardsTitle: string;
    synthesis: string;
    advice: string;
    reflection: string;
    copyBtn: string;
    copied: string;
    newReadingBtn: string;
    aiStatus: string;
    fallbackStatus: string;
    disclaimer: string;
    viewCardDetails: string;
  };
  history: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    startNewReading: string;
    clearAll: string;
    clearConfirm: string;
    delete: string;
    viewFullReading: string;
    recordsCount: string;
    cardsCount: string;
    aiGenerated: string;
    offlineFallback: string;
  };
}

export const TRANSLATIONS: Record<Locale, Translations> = {
  en: {
    nav: {
      inquiry: "Inquiry",
      spreads: "Spreads",
      history: "History",
      newReading: "New Reading",
    },
    landing: {
      stepBadge: "Step 1 of 4 • Set Your Intention",
      headlinePart1: "Inquire into life and destiny",
      headlineAccent: "with AI-powered Tarot",
      subtitle: "Turn life crossroads into grounded wisdom — in moments — no superstition needed",
      inputPlaceholder:
        "Focus your intention... e.g. What guidance should I embrace for my next career crossroads?",
      promptIdeas: "Prompt Ideas",
      guidance: "Guidance",
      random: "Random",
      clear: "Clear",
      continueBtn: "Continue to Spread Selection",
      minCharsRequired: "Minimum 5 characters required",
      maxCharsExceeded: "Maximum 500 characters exceeded",
      readyToDraw: "Ready to draw from the 78-card deck",
    },
    guidance: {
      title: "Question Guidance: Framing Open Inquiries",
      subtitle: "Open-ended questions invite reflection rather than passive prediction.",
      badge: "Reflection Anchor",
      intro:
        "Tarot acts as a mirror for your inner clarity. Inquiries starting with How or What illuminate pathways and self-agency, while closed Yes/No questions assume a fatalistic outcome.",
      closedTitle: "Closed & Passive (Avoid)",
      closedExample1: '"Will I pass my interview tomorrow?"',
      closedExample2: '"Does my ex still care about me?"',
      closedExample3: '"Will things get better on their own?"',
      openTitle: "Open & Empowered (Recommended)",
      openExample1: '"What strengths should I bring forward in my interview?"',
      openExample2: '"How can I bring healing and clarity to this connection?"',
      openExample3: '"What mindset will help me navigate this crossroads?"',
      invariantTitle: "Sacred Invariant:",
      invariantDesc:
        "The cards are randomized purely by chance (Fisher-Yates via Web Crypto API). Your question does not manipulate the draw; it serves as thoughtful context for the AI synthesis.",
    },
    spreads: {
      stepBadge: "Step 2 of 4 • Choose Spread",
      headline: "Select Your Spread",
      subtitle: "Choose the architectural depth of your reading to map out your inquiry.",
      focusedInquiry: "Focused Inquiry",
      editQuestion: "Edit Question",
      positionMeanings: "Position Meanings",
      dynamicFlow: "Dynamic flow:",
      reversedLabel: "Reversed Cards (Inverted Orientations)",
      reversedActive: "Active (50% per card)",
      reversedOff: "Off (Default)",
      reversedDesc:
        "When enabled, cards have an independent 50% chance of appearing inverted, revealing internal friction and shadow aspects (SDD §3, Q-002).",
      beginBtn: "Begin Ritual with",
      preparing: "Entering Cavern...",
    },
    shuffle: {
      stepBadge: "Step 3 of 4 • Breathe & Shuffle",
      breatheTitle: "Take a deep, calming breath",
      breatheSubtitle: "Center your mind and hold your intention in focus",
      shufflingTitle: "Shuffling the 78-Card Deck",
      shufflingSubtitle: "Randomizing via Fisher-Yates cryptographic entropy",
      skipBtn: "Skip",
      preparingDeck: "Preparing your deck...",
      readyTitle: "The deck is poised. Choose your path.",
      errorTitle: "Failed to shuffle deck",
      retryBtn: "Try Again",
      backBtn: "Back to Spreads",
      inhale: "Inhale Clarity",
      exhale: "Exhale Tension",
    },
    select: {
      stepBadge: "Step 4 of 4 • Select Your Cards",
      headline: "Draw Your Cards",
      subtitle: "Focus your intention and select cards from the 78-card deck.",
      selectedCount: "Selected",
      cardsRemaining: "cards needed",
      tapToReveal: "Tap card to reveal",
      interpretingTitle: "Synthesizing Sacred Wisdom...",
      interpretingSubtitle: "The AI is interpreting archetypal patterns and relationships",
      detailPrompt: "Tap any card to view full lore and keywords",
      revealed: "Revealed",
      tapDeckPrompt: "Tap a card below to draw into position",
      interpretBtn: "Reveal Reading Interpretation",
      interpretBtnSub: "All cards are revealed. Click to synthesize insights & actionable wisdom.",
    },
    result: {
      headline: "Your Reading Synthesis",
      subtitle: "Grounded guidance through archetypal wisdom & AI reflection",
      overview: "Overview",
      cardsTitle: "Drawn Cards in Spread",
      synthesis: "Holistic Synthesis",
      advice: "Guidance & Actionable Advice",
      reflection: "Reflective Inquiry",
      copyBtn: "Copy Reading",
      copied: "Copied to Clipboard!",
      newReadingBtn: "Begin New Reading",
      aiStatus: "AI Synthesized",
      fallbackStatus: "Deterministic Wisdom (Offline)",
      disclaimer:
        "Tarot acts as an empowering mirror for contemplation, not fatalistic fortune telling.",
      viewCardDetails: "View Lore",
    },
    history: {
      title: "Reading History",
      subtitle: "Your past inquiries and archetypal guidance stored locally on this device.",
      emptyTitle: "No Readings Recorded Yet",
      emptySubtitle: "Your sacred journey begins with your first question.",
      startNewReading: "Begin a Reading",
      clearAll: "Clear All History",
      clearConfirm: "Are you sure you want to remove all saved readings?",
      delete: "Delete",
      viewFullReading: "View Full Reading",
      recordsCount: "Saved Readings",
      cardsCount: "cards",
      aiGenerated: "AI Synthesized",
      offlineFallback: "Classic Wisdom",
    },
  },
};
