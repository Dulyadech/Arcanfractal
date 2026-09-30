import type { ReadingStatus } from "./reading";

/**
 * Safety flag detected in the AI interpretation (SDD §5.2).
 */
export type ReadingSafety = "none" | "sensitive" | "crisis";

/**
 * Categorized intent of the user's inquiry.
 */
export type QuestionIntent =
  | "feelings"
  | "relationship"
  | "career"
  | "decision"
  | "future"
  | "general"
  | "yes_no";

/**
 * Card interpretation specifically framed by its position and role in answering the question.
 */
export interface ContextualCardInterpretation {
  cardId: string;
  positionKey: string;
  cardName?: string;
  orientation?: "upright" | "reversed";
  /** Meaning contextualized specifically to the question and position */
  meaningInContext: string;
  /** How this card specifically acts as evidence supporting the direct answer */
  contributionToAnswer: string;
  /** Complete textual interpretation (backward-compatible) */
  interpretation: string;
}

/**
 * Classification of question relationships and follow-ups.
 */
export type QuestionResolutionType =
  | "single"
  | "conditional_follow_up"
  | "clarifying_follow_up"
  | "independent_multi_question"
  | "clarify";

/**
 * Directional interpretation summary derived from cards (not a fake probability).
 */
export type AnswerDirection = "likely_yes" | "likely_no" | "mixed" | "unclear";

/**
 * Structured analysis of primary question.
 */
export interface PrimaryQuestionAnalysis {
  text: string;
  intent: QuestionIntent;
  scope: string;
  timeframe?: string;
}

/**
 * Structured representation of a follow-up clause.
 */
export interface FollowUpQuestion {
  id: string;
  type: "conditional" | "clarifying";
  condition?: string;
  text?: string;
  normalizedQuestion: string;
}

/**
 * Overall resolution of the question relationship.
 */
export interface QuestionResolution {
  type: QuestionResolutionType;
  reason: string;
  missingContext?: string;
}

/**
 * Required internal question analysis structure.
 */
export interface StructuredQuestionAnalysis {
  original: string;
  primary: PrimaryQuestionAnalysis;
  followUps: FollowUpQuestion[];
  resolution: QuestionResolution;
}

/**
 * Directional primary answer payload.
 */
export interface PrimaryAnswerPayload {
  direction: AnswerDirection;
  text: string;
  evidenceCardIds: string[];
}

/**
 * Follow-up answer payload using the same card spread.
 */
export interface FollowUpAnswerPayload {
  id: string;
  text: string;
  answer: string;
  evidenceCardIds: string[];
}

/**
 * Structured answer representation.
 */
export interface StructuredAnswerPayload {
  primary: PrimaryAnswerPayload;
  followUps?: FollowUpAnswerPayload[];
}

/**
 * Structured output payload returned by the AI interpretation engine (SDD §5.2 + Question-Answer Architecture).
 */
export interface AIInterpretationPayload {
  safety: ReadingSafety;
  /** The user's exact original question */
  originalQuestion?: string;
  /** Detected intent of the question */
  questionIntent?: QuestionIntent;
  /** Core thematic scope of the question (Scope Lock) */
  questionScope?: string;
  /** Direct, unambiguous answer to the user's question before detailed explanations */
  directAnswer?: string;
  /** Nuanced confidence / uncertainty statement without fatalism */
  confidence?: string;
  /** Overview summary connecting question and overarching energy (backward-compatible) */
  overview: string;
  /** Position-specific contextual card interpretations */
  cards: ContextualCardInterpretation[];
  /** How the cards interact as a cohesive narrative answering the question */
  synthesis: string;
  /** Practical, empowering, and grounded action steps */
  advice: string;
  /** Introspective open-ended reflection question */
  reflectionQuestion: string;
  /** Concise concluding answer summary */
  conclusion?: string;
  /** Status indicator: "complete" (AI) or "fallback" (deterministic engine) */
  status?: ReadingStatus;
  /** Whether multiple distinct questions were detected */
  isMultiQuestion?: boolean;
  /** List of detected distinct sub-questions if multi-question was identified */
  subQuestions?: string[];
  /** Scope guidance or notice regarding question focus */
  scopeNotice?: string;
  /** Structured question analysis including primary, follow-ups, and resolution */
  questionAnalysis?: StructuredQuestionAnalysis;
  /** Directional answer structure with evidence cards and follow-up answers */
  answer?: StructuredAnswerPayload;
  /** Clarification request when antecedent/context is ambiguous */
  clarificationPrompt?: string;
}
