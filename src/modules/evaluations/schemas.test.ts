import { describe, it, expect } from "vitest";
import {
  evaluationDetailOutputSchema,
  evaluationAnswerOutputSchema,
  evaluationAnswersOutputSchema,
  getEvaluationParamsSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getEvaluationParamsSchema (input)
// ---------------------------------------------------------------------------
describe("getEvaluationParamsSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getEvaluationParamsSchema.safeParse({
        uuid: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(getEvaluationParamsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-UUID string", () => {
    expect(getEvaluationParamsSchema.safeParse({ uuid: "not-a-uuid" }).success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(getEvaluationParamsSchema.safeParse({ uuid: "" }).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(getEvaluationParamsSchema.safeParse({ uuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluationDetailOutputSchema
// ---------------------------------------------------------------------------
describe("evaluationDetailOutputSchema", () => {
  const validDetail = {
    uuid: "550e8400-e29b-41d4-a716-446655440000",
    candidateId: 42,
    staffId: 7,
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-06-01"),
    createdAt: new Date("2026-01-01"),
    candidateName: "Alice Smith",
    candidateEmail: "alice@example.com",
    staffName: "Bob Reviewer",
  };

  it("accepts a valid evaluation detail", () => {
    expect(evaluationDetailOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts all-null fields", () => {
    expect(
      evaluationDetailOutputSchema.safeParse({
        uuid: "550e8400-e29b-41d4-a716-446655440000",
        candidateId: null,
        staffId: null,
        startDate: null,
        endDate: null,
        createdAt: null,
        candidateName: null,
        candidateEmail: null,
        staffName: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = validDetail;
    expect(evaluationDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for uuid", () => {
    expect(
      evaluationDetailOutputSchema.safeParse({ ...validDetail, uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for candidateId", () => {
    expect(
      evaluationDetailOutputSchema.safeParse({ ...validDetail, candidateId: "not-a-number" })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for candidateName", () => {
    expect(
      evaluationDetailOutputSchema.safeParse({ ...validDetail, candidateName: 456 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for startDate", () => {
    expect(
      evaluationDetailOutputSchema.safeParse({ ...validDetail, startDate: "2026-01-01" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for createdAt", () => {
    expect(
      evaluationDetailOutputSchema.safeParse({ ...validDetail, createdAt: "2026-01-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluationAnswerOutputSchema
// ---------------------------------------------------------------------------
describe("evaluationAnswerOutputSchema", () => {
  const validAnswer = {
    ceqUuid: "550e8400-e29b-41d4-a716-446655440000",
    question: "How was performance?",
    answer: "Excellent",
    rating: 5,
  };

  it("accepts a valid answer", () => {
    expect(evaluationAnswerOutputSchema.safeParse(validAnswer).success).toBe(true);
  });

  it("accepts all-null fields", () => {
    expect(
      evaluationAnswerOutputSchema.safeParse({
        ceqUuid: null,
        question: null,
        answer: null,
        rating: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing ceqUuid", () => {
    const { ceqUuid: _, ...rest } = validAnswer;
    expect(evaluationAnswerOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing question", () => {
    const { question: _, ...rest } = validAnswer;
    expect(evaluationAnswerOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing answer", () => {
    const { answer: _, ...rest } = validAnswer;
    expect(evaluationAnswerOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing rating", () => {
    const { rating: _, ...rest } = validAnswer;
    expect(evaluationAnswerOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for rating", () => {
    expect(
      evaluationAnswerOutputSchema.safeParse({ ...validAnswer, rating: "high" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for question", () => {
    expect(
      evaluationAnswerOutputSchema.safeParse({ ...validAnswer, question: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluationAnswersOutputSchema (array)
// ---------------------------------------------------------------------------
describe("evaluationAnswersOutputSchema", () => {
  const validAnswers = [
    { ceqUuid: "uuid-1", question: "Q1", answer: "A1", rating: 5 },
    { ceqUuid: "uuid-2", question: "Q2", answer: "A2", rating: 3 },
  ];

  it("accepts a valid array of answers", () => {
    expect(evaluationAnswersOutputSchema.safeParse(validAnswers).success).toBe(true);
  });

  it("accepts an empty array", () => {
    expect(evaluationAnswersOutputSchema.safeParse([]).success).toBe(true);
  });

  it("rejects non-array", () => {
    expect(evaluationAnswersOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects array with invalid items", () => {
    expect(evaluationAnswersOutputSchema.safeParse([{ ceqUuid: "orphan" }]).success).toBe(false);
  });
});
