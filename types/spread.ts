/**
 * Supported Spread identifiers (SDD §4.5).
 */
export type SpreadId = "single" | "three-timeline" | "three-guidance" | "five-path";

/**
 * Valid position keys for the Single Card spread.
 */
export type SingleSpreadPositionKey = "message";

/**
 * Valid position keys for the Past · Present · Future spread.
 */
export type ThreeTimelinePositionKey = "past" | "present" | "future";

/**
 * Valid position keys for the Situation · Challenge · Guidance spread.
 */
export type ThreeGuidancePositionKey = "situation" | "challenge" | "guidance";

/**
 * Valid position keys for the Five-Card Path spread.
 */
export type FivePathPositionKey = "heart" | "obstacle" | "foundation" | "guidance" | "direction";

/**
 * Union of all supported spread position keys.
 */
export type SpreadPositionKey =
  | SingleSpreadPositionKey
  | ThreeTimelinePositionKey
  | ThreeGuidancePositionKey
  | FivePathPositionKey;

/**
 * Specific position within a Tarot spread.
 */
export interface SpreadPosition {
  key: SpreadPositionKey;
  index: number;
  name: string;
  description: string;
}

/**
 * Definition of a Tarot spread layout (SDD §4.5).
 */
export interface SpreadDefinition {
  id: SpreadId;
  name: string;
  cardCount: number;
  description: string;
  relationshipSummary?: string;
  positions: SpreadPosition[];
}
