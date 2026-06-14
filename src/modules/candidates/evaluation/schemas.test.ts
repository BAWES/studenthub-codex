import { describe, it, expect } from "vitest";
import {
  evalQuestionItemSchema,
  evaluationListItemSchema,
  evaluationAnswerSchema,
  evaluationDetailSchema,
  createEvaluationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// evalQuestionItemSchema
// ---------------------------------------------------------------------------

describe("evalQuestionItemSchema", () => {
  const validItem = () => ({
    ceq_uuid: "q-001",
    question: "Rate communication skills",
  });

  it("accepts a valid question item", () => {
    const r = evalQuestionItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable question", () => {
    const r = evalQuestionItemSchema.safeParse({ ...validItem(), question: null });
    expect(r.success).toBe(true);
  });

  it("rejects missing ceq_uuid", () => {
    const { ceq_uuid: _, ...rest } = validItem();
    expect(evalQuestionItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluationListItemSchema
// ---------------------------------------------------------------------------

describe("evaluationListItemSchema", () => {
  const validItem = () => ({
    can_eval_uuid: "eval-001",
    candidate_id: 123,
    dept_id: 456,
    start_date: "2026-01-01",
    end_date: "2026-06-01",
    staff_id: 789,
    created_at: new Date("2026-01-01"),
  });

  it("accepts a valid evaluation list item", () => {
    const r = evaluationListItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = evaluationListItemSchema.safeParse({
      ...validItem(),
      candidate_id: null,
      dept_id: null,
      start_date: null,
      end_date: null,
      staff_id: null,
      created_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing can_eval_uuid", () => {
    const { can_eval_uuid: _, ...rest } = validItem();
    expect(evaluationListItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluationAnswerSchema
// ---------------------------------------------------------------------------

describe("evaluationAnswerSchema", () => {
  const validItem = () => ({
    ceq_uuid: "q-001",
    question: "Skill rating",
    answer: "Good",
    rating: 4,
  });

  it("accepts a valid answer", () => {
    const r = evaluationAnswerSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts all-null fields", () => {
    const r = evaluationAnswerSchema.safeParse({
      ceq_uuid: null, question: null, answer: null, rating: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-integer rating", () => {
    const r = evaluationAnswerSchema.safeParse({ ...validItem(), rating: "high" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluationDetailSchema (extended)
// ---------------------------------------------------------------------------

describe("evaluationDetailSchema", () => {
  it("accepts detail with answers", () => {
    const r = evaluationDetailSchema.safeParse({
      can_eval_uuid: "eval-001",
      candidate_id: 123,
      dept_id: 456,
      start_date: null,
      end_date: null,
      staff_id: null,
      created_at: new Date(),
      answers: [{ ceq_uuid: "q-1", question: "Q", answer: "A", rating: 5 }],
    });
    expect(r.success).toBe(true);
  });

  it("accepts detail without answers", () => {
    const r = evaluationDetailSchema.safeParse({
      can_eval_uuid: "eval-001",
      candidate_id: null,
      dept_id: null,
      start_date: null,
      end_date: null,
      staff_id: null,
      created_at: null,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createEvaluationResultSchema
// ---------------------------------------------------------------------------

describe("createEvaluationResultSchema", () => {
  it("accepts valid result", () => {
    const r = createEvaluationResultSchema.safeParse({
      can_eval_uuid: "eval-new",
      operation: "created",
      message: "Evaluation created",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing can_eval_uuid", () => {
    const r = createEvaluationResultSchema.safeParse({ operation: "created", message: "OK" });
    expect(r.success).toBe(false);
  });

  it("rejects missing operation", () => {
    const r = createEvaluationResultSchema.safeParse({ can_eval_uuid: "e-1", message: "OK" });
    expect(r.success).toBe(false);
  });
});
