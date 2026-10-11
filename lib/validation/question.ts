export const MIN_QUESTION_LENGTH = 5;
export const MAX_QUESTION_LENGTH = 500;

export interface QuestionValidationResult {
  isValid: boolean;
  error: string | null;
  charCount: number;
  trimmedLength: number;
}

/**
 * Validates a tarot inquiry question according to SDD §2 and §6.2:
 * - Must be between 5 and 500 characters after trimming leading/trailing whitespace.
 */
export function validateQuestion(question: string | null | undefined): QuestionValidationResult {
  if (typeof question !== "string") {
    return {
      isValid: false,
      error: "Please enter a question to begin your reading.",
      charCount: 0,
      trimmedLength: 0,
    };
  }

  const rawLength = question.length;
  const trimmed = question.trim();
  const trimmedLength = trimmed.length;

  if (trimmedLength === 0) {
    return {
      isValid: false,
      error: "Please enter a question to begin your reading.",
      charCount: rawLength,
      trimmedLength: 0,
    };
  }

  if (trimmedLength < MIN_QUESTION_LENGTH) {
    return {
      isValid: false,
      error: `Question is too short (${trimmedLength}/${MIN_QUESTION_LENGTH} characters minimum).`,
      charCount: rawLength,
      trimmedLength,
    };
  }

  if (rawLength > MAX_QUESTION_LENGTH || trimmedLength > MAX_QUESTION_LENGTH) {
    return {
      isValid: false,
      error: `Question exceeds the maximum limit of ${MAX_QUESTION_LENGTH} characters.`,
      charCount: rawLength,
      trimmedLength,
    };
  }

  return {
    isValid: true,
    error: null,
    charCount: rawLength,
    trimmedLength,
  };
}
