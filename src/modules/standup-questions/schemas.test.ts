import { describe, it, expect } from "vitest";
import {
  standupQuestionItemSchema,
  listStandupQuestionsResultSchema,
  mutateResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// standupQuestionItemSchema
// ---------------------------------------------------------------------------

describe("standupQuestionItemSchema", () => {
  it("accepts a valid standup question item", () => {
    const input = {
      question_uuid: "abc-123-def",
      question: "What did you work on yesterday?",
      created_at: new Date("2026-01-15"),
      updated_at: new Date("2026-01-15"),
    };
    const result = standupQuestionItemSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts a question with null question text", () => {
    const input = {
      question_uuid: "abc-456-def",
      question: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = standupQuestionItemSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects missing question_uuid", () => {
    const input = {
      question: "What did you do?",
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = standupQuestionItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-string question_uuid", () => {
    const input = {
      question_uuid: 123,
      question: "Test?",
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = standupQuestionItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-date created_at", () => {
    const input = {
      question_uuid: "abc-789-def",
      question: "Test?",
      created_at: "not-a-date",
      updated_at: new Date(),
    };
    const result = standupQuestionItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects missing updated_at", () => {
    const input = {
      question_uuid: "abc-789-def",
      question: "Test?",
      created_at: new Date(),
    };
    const result = standupQuestionItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStandupQuestionsResultSchema
// ---------------------------------------------------------------------------

describe("listStandupQuestionsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const input = {
      standupQuestions: [
        {
          question_uuid: "abc-111",
          question: "Question 1",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          question_uuid: "abc-222",
          question: "Question 2",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const result = listStandupQuestionsResultSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.standupQuestions).toHaveLength(2);
    }
  });

  it("accepts an empty standupQuestions array", () => {
    const input = {
      standupQuestions: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listStandupQuestionsResultSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.standupQuestions).toHaveLength(0);
    }
  });

  it("rejects negative total", () => {
    const input = {
      standupQuestions: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listStandupQuestionsResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-positive page", () => {
    const input = {
      standupQuestions: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    };
    const result = listStandupQuestionsResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects limit exceeding 100", () => {
    const input = {
      standupQuestions: [],
      total: 0,
      page: 1,
      limit: 200,
      totalPages: 0,
    };
    const result = listStandupQuestionsResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-array standupQuestions", () => {
    const input = {
      standupQuestions: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listStandupQuestionsResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const input = {};
    const result = listStandupQuestionsResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// mutateResultSchema
// ---------------------------------------------------------------------------

describe("mutateResultSchema", () => {
  it("accepts a valid mutation result", () => {
    const result = mutateResultSchema.safeParse({
      operation: "create",
      message: "Standup question created successfully",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty message", () => {
    const result = mutateResultSchema.safeParse({
      operation: "delete",
      message: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const result = mutateResultSchema.safeParse({
      message: "Success",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const result = mutateResultSchema.safeParse({
      operation: "create",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string operation", () => {
    const result = mutateResultSchema.safeParse({
      operation: 42,
      message: "Done",
    });
    expect(result.success).toBe(false);
  });

  it("strips unknown extra fields", () => {
    const result = mutateResultSchema.safeParse({
      operation: "update",
      message: "Updated",
      extraField: "should be stripped",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).extraField).toBeUndefined();
    }
  });
});
