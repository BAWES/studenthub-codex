import { describe, it, expect } from "vitest";
import {
  listEvaluationsSchema,
  getEvaluationSchema,
  createEvaluationSchema,
  updateEvaluationSchema,
  evaluationRowSchema,
  listEvaluationsResultSchema,
  evaluationDetailSchema,
  getEvaluationResultSchema,
  evaluationActionResultSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// listEvaluationsSchema
// ---------------------------------------------------------------------------
describe("listEvaluationsSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listEvaluationsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(listEvaluationsSchema.safeParse({ page: 2, limit: 50, search: "Ahmed" }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listEvaluationsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listEvaluationsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listEvaluationsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getEvaluationSchema
// ---------------------------------------------------------------------------
describe("getEvaluationSchema", () => {
  it("accepts valid input", () => {
    expect(getEvaluationSchema.safeParse({ canEvalUuid: "eval-123" }).success).toBe(true);
  });

  it("rejects missing canEvalUuid", () => {
    expect(getEvaluationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty canEvalUuid", () => {
    expect(getEvaluationSchema.safeParse({ canEvalUuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createEvaluationSchema
// ---------------------------------------------------------------------------
describe("createEvaluationSchema", () => {
  it("accepts valid minimal input", () => {
    expect(
      createEvaluationSchema.safeParse({ candidateId: 42, startDate: "2026-06-01", endDate: "2026-06-30", staffId: 1 }).success,
    ).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      createEvaluationSchema.safeParse({
        candidateId: 42,
        deptId: 5,
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        staffId: 1,
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(createEvaluationSchema.safeParse({ startDate: "2026-06-01", endDate: "2026-06-30", staffId: 1 }).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(createEvaluationSchema.safeParse({ candidateId: 0, startDate: "2026-06-01", endDate: "2026-06-30", staffId: 1 }).success).toBe(false);
  });

  it("rejects missing startDate", () => {
    expect(createEvaluationSchema.safeParse({ candidateId: 42, endDate: "2026-06-30", staffId: 1 }).success).toBe(false);
  });

  it("rejects empty startDate", () => {
    expect(createEvaluationSchema.safeParse({ candidateId: 42, startDate: "", endDate: "2026-06-30", staffId: 1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateEvaluationSchema
// ---------------------------------------------------------------------------
describe("updateEvaluationSchema", () => {
  it("accepts valid input", () => {
    expect(
      updateEvaluationSchema.safeParse({ canEvalUuid: "eval-1", candidateId: 42, staffId: 1 }).success,
    ).toBe(true);
  });

  it("accepts partial update with only required field", () => {
    expect(updateEvaluationSchema.safeParse({ canEvalUuid: "eval-1" }).success).toBe(true);
  });

  it("rejects missing canEvalUuid", () => {
    expect(updateEvaluationSchema.safeParse({ candidateId: 42 }).success).toBe(false);
  });

  it("rejects empty canEvalUuid", () => {
    expect(updateEvaluationSchema.safeParse({ canEvalUuid: "" }).success).toBe(false);
  });

  it("rejects zero staffId", () => {
    expect(updateEvaluationSchema.safeParse({ canEvalUuid: "eval-1", staffId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluationRowSchema
// ---------------------------------------------------------------------------
describe("evaluationRowSchema", () => {
  const validRow = {
    can_eval_uuid: "eval-1",
    candidate_id: 42,
    candidate_name: "Ahmed",
    dept_id: 5,
    start_date: "2026-06-01",
    end_date: "2026-06-30",
    staff_id: 1,
    staff_name: "Staff 1",
    created_at: new Date("2026-06-01"),
    updated_at: new Date("2026-06-02"),
  };

  it("accepts a valid evaluation row", () => {
    expect(evaluationRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      evaluationRowSchema.safeParse({
        ...validRow,
        candidate_id: null,
        candidate_name: null,
        dept_id: null,
        start_date: null,
        end_date: null,
        staff_id: null,
        staff_name: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing can_eval_uuid", () => {
    const { can_eval_uuid: _, ...rest } = validRow;
    expect(evaluationRowSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listEvaluationsResultSchema
// ---------------------------------------------------------------------------
describe("listEvaluationsResultSchema", () => {
  const validResult = {
    items: [
      {
        can_eval_uuid: "eval-1",
        candidate_id: 42,
        candidate_name: "Ahmed",
        dept_id: 5,
        start_date: "2026-06-01",
        end_date: "2026-06-30",
        staff_id: 1,
        staff_name: "Staff 1",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listEvaluationsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listEvaluationsResultSchema.safeParse({ ...validResult, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listEvaluationsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listEvaluationsResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listEvaluationsResultSchema.safeParse({ ...validResult, page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluationDetailSchema
// ---------------------------------------------------------------------------
describe("evaluationDetailSchema", () => {
  const validDetail = {
    can_eval_uuid: "eval-1",
    candidate_id: 42,
    candidate_name: "Ahmed",
    dept_id: 5,
    start_date: "2026-06-01",
    end_date: "2026-06-30",
    staff_id: 1,
    staff_name: "Staff 1",
    created_at: new Date("2026-06-01"),
    updated_at: new Date("2026-06-02"),
  };

  it("accepts a valid detail", () => {
    expect(evaluationDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      evaluationDetailSchema.safeParse({
        ...validDetail,
        candidate_id: null,
        candidate_name: null,
        dept_id: null,
        start_date: null,
        end_date: null,
        staff_id: null,
        staff_name: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing can_eval_uuid", () => {
    const { can_eval_uuid: _, ...rest } = validDetail;
    expect(evaluationDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getEvaluationResultSchema
// ---------------------------------------------------------------------------
describe("getEvaluationResultSchema", () => {
  it("accepts a valid evaluation", () => {
    expect(
      getEvaluationResultSchema.safeParse({
        evaluation: {
          can_eval_uuid: "eval-1",
          candidate_id: null,
          candidate_name: null,
          dept_id: null,
          start_date: null,
          end_date: null,
          staff_id: null,
          staff_name: null,
          created_at: null,
          updated_at: null,
        },
      }).success,
    ).toBe(true);
  });

  it("accepts null evaluation", () => {
    expect(getEvaluationResultSchema.safeParse({ evaluation: null }).success).toBe(true);
  });

  it("rejects missing evaluation field", () => {
    expect(getEvaluationResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluationActionResultSchema
// ---------------------------------------------------------------------------
describe("evaluationActionResultSchema", () => {
  it("accepts success without optional fields", () => {
    expect(evaluationActionResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts success with canEvalUuid", () => {
    expect(evaluationActionResultSchema.safeParse({ success: true, canEvalUuid: "eval-1" }).success).toBe(true);
  });

  it("accepts failure with error", () => {
    expect(evaluationActionResultSchema.safeParse({ success: false, error: "Not found" }).success).toBe(true);
  });

  it("rejects missing success", () => {
    expect(evaluationActionResultSchema.safeParse({}).success).toBe(false);
  });
});
