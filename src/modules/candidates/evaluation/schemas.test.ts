import { describe, it, expect } from "vitest";
import {
  listQuestionsSchema,
  createEvaluationSchema,
  listReportsSchema,
  viewReportSchema,
  evalQuestionItemSchema,
  evaluationListItemSchema,
  evaluationAnswerSchema,
  evaluationDetailSchema,
  createEvaluationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

describe("listQuestionsSchema", () => {
  it("accepts valid deptId", () => {
    const r = listQuestionsSchema.safeParse({ deptId: 5 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.deptId).toBe(5);
  });

  it("rejects missing deptId", () => {
    expect(listQuestionsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative deptId", () => {
    expect(listQuestionsSchema.safeParse({ deptId: -1 }).success).toBe(false);
  });

  it("rejects non-integer deptId", () => {
    expect(listQuestionsSchema.safeParse({ deptId: "abc" }).success).toBe(false);
  });
});

describe("createEvaluationSchema", () => {
  const valid = {
    candidateId: 1,
    deptId: 3,
    questionAnswers: [{ ceqUuid: "q1", question: "Performance?", answer: "Good", rating: 4 }],
  };

  it("accepts valid input with question answers", () => {
    const r = createEvaluationSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(1);
  });

  it("accepts optional fields", () => {
    const r = createEvaluationSchema.safeParse({
      ...valid,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable answer in question", () => {
    const r = createEvaluationSchema.safeParse({
      ...valid,
      questionAnswers: [{ ceqUuid: "q1", question: "Test?", answer: null, rating: 3 }],
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty questionAnswers", () => {
    expect(
      createEvaluationSchema.safeParse({ candidateId: 1, deptId: 3, questionAnswers: [] }).success,
    ).toBe(false);
  });

  it("rejects missing questionAnswers", () => {
    expect(createEvaluationSchema.safeParse({ candidateId: 1, deptId: 3 }).success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    const { candidateId: _, ...rest } = valid;
    expect(createEvaluationSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects rating over 5", () => {
    expect(
      createEvaluationSchema.safeParse({
        ...valid,
        questionAnswers: [{ rating: 99 }],
      }).success,
    ).toBe(false);
  });
});

describe("listReportsSchema", () => {
  it("accepts valid candidateId", () => {
    expect(listReportsSchema.safeParse({ candidateId: 1 }).success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(listReportsSchema.safeParse({}).success).toBe(false);
  });
});

describe("viewReportSchema", () => {
  it("accepts valid evaluationUuid", () => {
    expect(viewReportSchema.safeParse({ evaluationUuid: "eval_abc" }).success).toBe(true);
  });

  it("rejects empty evaluationUuid", () => {
    expect(viewReportSchema.safeParse({ evaluationUuid: "" }).success).toBe(false);
  });

  it("rejects missing evaluationUuid", () => {
    expect(viewReportSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("evalQuestionItemSchema", () => {
  it("accepts a valid question item", () => {
    const r = evalQuestionItemSchema.safeParse({ ceq_uuid: "q1", question: "Performance?" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.ceq_uuid).toBe("q1");
  });

  it("accepts nullable question", () => {
    expect(
      evalQuestionItemSchema.safeParse({ ceq_uuid: "q1", question: null }).success,
    ).toBe(true);
  });

  it("rejects missing ceq_uuid", () => {
    expect(evalQuestionItemSchema.safeParse({ question: "Test?" }).success).toBe(false);
  });
});

describe("evaluationListItemSchema", () => {
  const valid = {
    can_eval_uuid: "eval_abc",
    candidate_id: 1,
    dept_id: 3,
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    staff_id: 5,
    created_at: new Date("2024-01-15"),
  };

  it("accepts a valid evaluation list item", () => {
    expect(evaluationListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all nullable fields", () => {
    expect(
      evaluationListItemSchema.safeParse({
        can_eval_uuid: "eval_xyz",
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
    const { can_eval_uuid: _, ...rest } = valid;
    expect(evaluationListItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("evaluationAnswerSchema", () => {
  it("accepts a valid answer", () => {
    const r = evaluationAnswerSchema.safeParse({
      ceq_uuid: "q1",
      question: "Rate your experience?",
      answer: "Good",
      rating: 4,
    });
    expect(r.success).toBe(true);
  });

  it("accepts all nullable fields", () => {
    expect(
      evaluationAnswerSchema.safeParse({
        ceq_uuid: null,
        question: null,
        answer: null,
        rating: null,
      }).success,
    ).toBe(true);
  });
});

describe("evaluationDetailSchema", () => {
  const valid = {
    can_eval_uuid: "eval_abc",
    candidate_id: 1,
    dept_id: 3,
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    staff_id: 5,
    created_at: new Date("2024-01-15"),
    answers: [{ ceq_uuid: "q1", question: "Test?", answer: "Yes", rating: 5 }],
  };

  it("accepts evaluation detail with answers", () => {
    expect(evaluationDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts without answers (optional)", () => {
    const { answers: _, ...rest } = valid;
    expect(evaluationDetailSchema.safeParse(rest).success).toBe(true);
  });
});

describe("createEvaluationResultSchema", () => {
  it("accepts valid result", () => {
    const r = createEvaluationResultSchema.safeParse({
      can_eval_uuid: "eval_new",
      operation: "create",
      message: "Evaluation created successfully.",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing can_eval_uuid", () => {
    expect(
      createEvaluationResultSchema.safeParse({ operation: "create", message: "OK" }).success,
    ).toBe(false);
  });

  it("rejects missing operation", () => {
    expect(
      createEvaluationResultSchema.safeParse({ can_eval_uuid: "e1", message: "OK" }).success,
    ).toBe(false);
  });
});
