import { describe, it, expect } from "vitest";
import {
  validateQuestion,
  MIN_QUESTION_LENGTH,
  MAX_QUESTION_LENGTH,
} from "@/lib/validation/question";

describe("Question Validation (SDD §2, §6.2)", () => {
  it("rejects undefined, null, or empty string", () => {
    expect(validateQuestion(undefined).isValid).toBe(false);
    expect(validateQuestion(null).isValid).toBe(false);
    expect(validateQuestion("").isValid).toBe(false);
    expect(validateQuestion("   ").isValid).toBe(false);
  });

  it(`rejects questions shorter than ${MIN_QUESTION_LENGTH} characters`, () => {
    const tooShort1 = "Four";
    const res1 = validateQuestion(tooShort1);
    expect(res1.isValid).toBe(false);
    expect(res1.error).toContain(`too short`);

    const whitespaceShort = "  ab  ";
    const res2 = validateQuestion(whitespaceShort);
    expect(res2.isValid).toBe(false);
  });

  it(`accepts questions with exactly ${MIN_QUESTION_LENGTH} characters`, () => {
    const exactlyMin = "12345";
    const res = validateQuestion(exactlyMin);
    expect(res.isValid).toBe(true);
    expect(res.error).toBeNull();
    expect(res.trimmedLength).toBe(5);
  });

  it(`accepts valid questions within 5 and ${MAX_QUESTION_LENGTH} characters`, () => {
    const validQuestion = "What guidance should I hold as I transition to my new career?";
    const res = validateQuestion(validQuestion);
    expect(res.isValid).toBe(true);
    expect(res.error).toBeNull();
    expect(res.charCount).toBe(validQuestion.length);
  });

  it(`accepts questions with exactly ${MAX_QUESTION_LENGTH} characters`, () => {
    const maxQuestion = "A".repeat(MAX_QUESTION_LENGTH);
    const res = validateQuestion(maxQuestion);
    expect(res.isValid).toBe(true);
    expect(res.error).toBeNull();
    expect(res.charCount).toBe(MAX_QUESTION_LENGTH);
  });

  it(`rejects questions longer than ${MAX_QUESTION_LENGTH} characters`, () => {
    const overMaxQuestion = "A".repeat(MAX_QUESTION_LENGTH + 1);
    const res = validateQuestion(overMaxQuestion);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain(`exceeds the maximum limit`);
  });
});
