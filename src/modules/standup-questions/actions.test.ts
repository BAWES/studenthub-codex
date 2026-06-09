import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: standup-question schema validation
//
// The server actions in actions.ts use these zod schemas internally.
// Testing them separately avoids mocking "use server" deps.
// ---------------------------------------------------------------------------

const listStandupQuestionsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getStandupQuestionSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
});

const createStandupQuestionSchema = z.object({
  question: z.string().min(1, "Question text is required").max(255),
});

const updateStandupQuestionSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
  question: z.string().min(1, "Question text is required").max(255),
});

// ---------------------------------------------------------------------------
// listStandupQuestionsSchema
// ---------------------------------------------------------------------------

describe("listStandupQuestionsSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listStandupQuestionsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listStandupQuestionsSchema.safeParse({
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listStandupQuestionsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listStandupQuestionsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listStandupQuestionsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getStandupQuestionSchema
// ---------------------------------------------------------------------------

describe("getStandupQuestionSchema", () => {
  it("accepts valid UUID", () => {
    const result = getStandupQuestionSchema.safeParse({
      uuid: "question_abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getStandupQuestionSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getStandupQuestionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createStandupQuestionSchema
// ---------------------------------------------------------------------------

describe("createStandupQuestionSchema", () => {
  it("accepts valid question text", () => {
    const result = createStandupQuestionSchema.safeParse({
      question: "What did you work on yesterday?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty question", () => {
    const result = createStandupQuestionSchema.safeParse({ question: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing question", () => {
    const result = createStandupQuestionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects question over 255 characters", () => {
    const result = createStandupQuestionSchema.safeParse({
      question: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateStandupQuestionSchema
// ---------------------------------------------------------------------------

describe("updateStandupQuestionSchema", () => {
  it("accepts valid UUID and question", () => {
    const result = updateStandupQuestionSchema.safeParse({
      uuid: "question_abc123",
      question: "Updated question text",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = updateStandupQuestionSchema.safeParse({
      uuid: "",
      question: "Some question",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing question", () => {
    const result = updateStandupQuestionSchema.safeParse({
      uuid: "question_abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects over-255 question", () => {
    const result = updateStandupQuestionSchema.safeParse({
      uuid: "question_abc123",
      question: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });
});
