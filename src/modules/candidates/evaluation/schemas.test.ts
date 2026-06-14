import { describe, it, expect } from "vitest";
import {
  evalQuestionItemSchema,
  evaluationListItemSchema,
  evaluationAnswerSchema,
  evaluationDetailSchema,
  createEvaluationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests — candidates/evaluation
// ---------------------------------------------------------------------------

describe("evalQuestionItemSchema", () => {
  const validItem = {
    ceq_uuid: "ceq-001",
    question: "How was the candidate's communication?",
  };

  it("accepts a valid question item", () => {
    expect(evalQuestionItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null for question", () => {
    expect(
      evalQuestionItemSchema.safeParse({
        ...validItem,
        question: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing ceq_uuid", () => {
    const { ceq_uuid: _, ...rest } = validItem;
    expect(evalQuestionItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for ceq_uuid", () => {
    expect(
      evalQuestionItemSchema.safeParse({
        ...validItem,
        ceq_uuid: 123,
      }).success,
    ).toBe(false);
  });
});

describe("evaluationListItemSchema", () => {
  const validItem = {
    can_eval_uuid: "eval-001",
    candidate_id: 42,
    dept_id: 5,
    start_date: "2026-06-01",
    end_date: "2026-06-30",
    staff_id: 99,
    created_at: new Date("2026-06-14T10:00:00"),
  };

  it("accepts a valid list item", () => {
    expect(evaluationListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null for nullable fields", () => {
    expect(
      evaluationListItemSchema.safeParse({
        ...validItem,
        candidate_id: null,
        dept_id: null,
        start_date: null,
        end_date: null,
        staff_id: null,
        created_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing can_eval_uuid", () => {
    const { can_eval_uuid: _, ...rest } = validItem;
    expect(evaluationListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidate_id", () => {
    expect(
      evaluationListItemSchema.safeParse({
        ...validItem,
        candidate_id: "42",
      }).success,
    ).toBe(false);
  });

  it("rejects string for created_at (not coerced)", () => {
    expect(
      evaluationListItemSchema.safeParse({
        ...validItem,
        created_at: "2026-06-14T10:00:00",
      }).success,
    ).toBe(false);
  });
});

describe("evaluationAnswerSchema", () => {
  const validAnswer = {
    ceq_uuid: "ceq-001",
    question: "How was communication?",
    answer: "Excellent",
    rating: 5,
  };

  it("accepts a valid answer", () => {
    expect(evaluationAnswerSchema.safeParse(validAnswer).success).toBe(true);
  });

  it("accepts null for all nullable fields", () => {
    expect(
      evaluationAnswerSchema.safeParse({
        ceq_uuid: null,
        question: null,
        answer: null,
        rating: null,
      }).success,
    ).toBe(true);
  });

  it("rejects wrong type for rating", () => {
    expect(
      evaluationAnswerSchema.safeParse({
        ...validAnswer,
        rating: "5",
      }).success,
    ).toBe(false);
  });
});

describe("evaluationDetailSchema", () => {
  const validDetail = {
    can_eval_uuid: "eval-001",
    candidate_id: 42,
    dept_id: 5,
    start_date: "2026-06-01",
    end_date: null,
    staff_id: null,
    created_at: null,
    answers: [
      {
        ceq_uuid: "ceq-001",
        question: "How was communication?",
        answer: "Excellent",
        rating: 5,
      },
    ],
  };

  it("accepts a valid detail with answers", () => {
    expect(evaluationDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts a detail without answers", () => {
    expect(
      evaluationDetailSchema.safeParse({
        ...validDetail,
        answers: undefined,
      }).success,
    ).toBe(true);
  });

  it("accepts empty answers array", () => {
    expect(
      evaluationDetailSchema.safeParse({
        ...validDetail,
        answers: [],
      }).success,
    ).toBe(true);
  });

  it("rejects invalid answer in answers array", () => {
    expect(
      evaluationDetailSchema.safeParse({
        ...validDetail,
        answers: [{ ceq_uuid: 123 }],
      }).success,
    ).toBe(false);
  });
});

describe("createEvaluationResultSchema", () => {
  const validResult = {
    can_eval_uuid: "eval-001",
    operation: "created",
    message: "Evaluation created successfully",
  };

  it("accepts a valid result", () => {
    expect(createEvaluationResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("rejects missing can_eval_uuid", () => {
    const { can_eval_uuid: _, ...rest } = validResult;
    expect(createEvaluationResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for operation", () => {
    expect(
      createEvaluationResultSchema.safeParse({
        ...validResult,
        operation: 123,
      }).success,
    ).toBe(false);
  });
});
