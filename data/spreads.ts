import type { SpreadDefinition, SpreadId } from "@/types/spread";

/**
 * Position definitions and metadata for the 4 core Tarot spreads (SDD §4.5).
 */
export const SPREADS: Record<SpreadId, SpreadDefinition> = {
  single: {
    id: "single",
    name: "Single Card",
    cardCount: 1,
    description:
      "A focused reading delivering a direct core energy or primary message for reflection.",
    relationshipSummary: "Single card synthesis.",
    positions: [
      {
        key: "message",
        index: 0,
        name: "Message",
        description: "Core energy, theme, or primary guidance for your inquiry.",
      },
    ],
  },

  "three-timeline": {
    id: "three-timeline",
    name: "Past · Present · Future",
    cardCount: 3,
    description:
      "A dynamic chronological spread mapping how past influences shape current reality and lead toward future potential.",
    relationshipSummary: "Past shapes Present → Present leads into Future.",
    positions: [
      {
        key: "past",
        index: 0,
        name: "Past",
        description:
          "Past experiences, subconscious patterns, or prior events influencing the situation.",
      },
      {
        key: "present",
        index: 1,
        name: "Present",
        description: "The current state of affairs, active energies, and focal reality.",
      },
      {
        key: "future",
        index: 2,
        name: "Future",
        description:
          "The probable outcome or emerging trajectory if current course remains unchanged.",
      },
    ],
  },

  "three-guidance": {
    id: "three-guidance",
    name: "Situation · Challenge · Guidance",
    cardCount: 3,
    description:
      "A problem-solving spread identifying underlying facts, confronting friction, and illuminating constructive action.",
    relationshipSummary: "Challenge obstructs Situation → Guidance answers and resolves Challenge.",
    positions: [
      {
        key: "situation",
        index: 0,
        name: "Situation",
        description: "The objective truth and core facts of your current circumstances.",
      },
      {
        key: "challenge",
        index: 1,
        name: "Challenge",
        description: "The primary obstacle, conflict, internal tension, or test you are facing.",
      },
      {
        key: "guidance",
        index: 2,
        name: "Guidance",
        description:
          "The optimal mindset, perspective, and constructive path to navigate the challenge.",
      },
    ],
  },

  "five-path": {
    id: "five-path",
    name: "Five-Card Path",
    cardCount: 5,
    description:
      "A comprehensive in-depth spread examining the heart of the matter, subconscious roots, confronting hurdles, actionable counsel, and future culmination.",
    relationshipSummary:
      "Obstacle confronts Heart; Foundation anchors Heart; Guidance navigates Obstacle; Direction reveals culmination.",
    positions: [
      {
        key: "heart",
        index: 0,
        name: "Heart",
        description:
          "The central essence, core motivation, or fundamental reality of your inquiry.",
      },
      {
        key: "obstacle",
        index: 1,
        name: "Obstacle",
        description:
          "The immediate hurdle, friction, or external/internal blockage standing in your way.",
      },
      {
        key: "foundation",
        index: 2,
        name: "Foundation",
        description:
          "Deep subconscious influences, underlying roots, and historical causes anchoring the inquiry.",
      },
      {
        key: "guidance",
        index: 3,
        name: "Guidance",
        description:
          "Practical wisdom, tactical attitude, and recommended mindset to overcome obstacles.",
      },
      {
        key: "direction",
        index: 4,
        name: "Direction",
        description: "The emerging trajectory, probable destination, and potential resolution.",
      },
    ],
  },
};

/**
 * Array of all supported spread definitions for convenient iteration in UI selection.
 */
export const SPREAD_LIST: SpreadDefinition[] = Object.values(SPREADS);

/**
 * Lookup helper to retrieve a spread definition by its ID.
 */
export function getSpreadDefinition(spreadId: SpreadId): SpreadDefinition {
  return SPREADS[spreadId];
}

/**
 * Type guard to validate whether an unknown string is a valid SpreadId.
 */
export function isValidSpreadId(id: string): id is SpreadId {
  return id in SPREADS;
}
