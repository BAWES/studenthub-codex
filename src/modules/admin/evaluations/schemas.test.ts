import { describe, it, expect } from "vitest";
import {
  listEvaluationsSchema,
  getEvaluationSchema,
  createEvaluationSchema,
  updateEvaluationSchema,
  evaluationRowSchema,
  listEvaluationsResultSchema,
  getEvaluationResultSchema,
  evaluationActionResultSchema,
  type EvaluationRow,
  type ListEvaluationsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema validation
// ---------------------------------------------------------------------------

describe("listEvaluationsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listEvaluationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listEvaluationsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listEvaluationsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listEvaluationsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listEvaluationsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listEvaluationsSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it("accepts search string", () => {
    const result = listEvaluationsSchema.safeParse({ search: "Ahmed" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("Ahmed");
    }
  });
});

describe("getEvaluationSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getEvaluationSchema.safeParse({ canEvalUuid: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.canEvalUuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    }
  });

  it("rejects missing canEvalUuid", () => {
    const result = getEvaluationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = getEvaluationSchema.safeParse({ canEvalUuid: "" });
    expect(result.success).toBe(false);
  });
});

describe("createEvaluationSchema", () => {
  it("accepts valid input with all required fields", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 123,
      startDate: "2026-01-01",
      endDate: "2026-06-30",
      staffId: 456,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(123);
      expect(result.data.staffId).toBe(456);
    }
  });

  it("accepts optional deptId", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 123,
      startDate: "2026-01-01",
      endDate: "2026-06-30",
      staffId: 456,
      deptId: 789,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    const result = createEvaluationSchema.safeParse({
      startDate: "2026-01-01",
      endDate: "2026-06-30",
      staffId: 456,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing startDate", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 123,
      endDate: "2026-06-30",
      staffId: 456,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing staffId", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 123,
      startDate: "2026-01-01",
      endDate: "2026-06-30",
    });
    expect(result.success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: "123",
      startDate: "2026-01-01",
      endDate: "2026-06-30",
      staffId: "456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(123);
      expect(result.data.staffId).toBe(456);
    }
  });

  it("rejects zero candidateId", () => {
    const result = createEvaluationSchema.safeParse({
      candidateId: 0,
      startDate: "2026-01-01",
      endDate: "2026-06-30",
      staffId: 456,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateEvaluationSchema", () => {
  it("accepts valid update with canEvalUuid only (partial update)", () => {
    const result = updateEvaluationSchema.safeParse({
      canEvalUuid: "550e8400-e29b-41d4-a716-446655440000",
      startDate: "2026-07-01",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = updateEvaluationSchema.safeParse({
      canEvalUuid: "550e8400-e29b-41d4-a716-446655440000",
      candidateId: 123,
      deptId: 789,
      startDate: "2026-01-01",
      endDate: "2026-06-30",
      staffId: 456,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing canEvalUuid", () => {
    const result = updateEvaluationSchema.safeParse({ startDate: "2026-01-01" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("evaluationRowSchema", () => {
  it("accepts a valid evaluation row", () => {
    const row: EvaluationRow = {
      can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
      candidate_id: 123,
      candidate_name: "Ahmed",
      dept_id: 789,
      start_date: "2026-01-01T00:00:00.000Z",
      end_date: "2026-06-30T00:00:00.000Z",
      staff_id: 456,
      staff_name: "Dr. Fatima",
      created_at: new Date("2026-01-01"),
      updated_at: new Date("2026-01-15"),
    };
    const result = evaluationRowSchema.safeParse(row);
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const row: EvaluationRow = {
      can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
      candidate_id: null,
      candidate_name: null,
      dept_id: null,
      start_date: null,
      end_date: null,
      staff_id: null,
      staff_name: null,
      created_at: null,
      updated_at: null,
    };
    const result = evaluationRowSchema.safeParse(row);
    expect(result.success).toBe(true);
  });

  it("rejects missing can_eval_uuid", () => {
    const result = evaluationRowSchema.safeParse({ candidate_id: 123 });
    expect(result.success).toBe(false);
  });
});

describe("listEvaluationsResultSchema", () => {
  it("accepts a valid list result with items", () => {
    const result: ListEvaluationsResult = {
      items: [
        {
          can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
          candidate_id: 123,
          candidate_name: "Ahmed",
          dept_id: null,
          start_date: null,
          end_date: null,
          staff_id: 456,
          staff_name: "Dr. Fatima",
          created_at: new Date("2026-01-01"),
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const parsed = listEvaluationsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const result: ListEvaluationsResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const parsed = listEvaluationsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects non-array items", () => {
    const result = {
      items: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const parsed = listEvaluationsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it("rejects negative total", () => {
    const result = {
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const parsed = listEvaluationsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

describe("getEvaluationResultSchema", () => {
  it("accepts evaluation present", () => {
    const result = {
      evaluation: {
        can_eval_uuid: "550e8400-e29b-41d4-a716-446655440000",
        candidate_id: 123,
        candidate_name: "Ahmed",
        dept_id: null,
        start_date: null,
        end_date: null,
        staff_id: 456,
        staff_name: "Dr. Fatima",
        created_at: new Date("2026-01-01"),
        updated_at: null,
      },
    };
    const parsed = getEvaluationResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts evaluation null (not found)", () => {
    const result = { evaluation: null };
    const parsed = getEvaluationResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });
});

describe("evaluationActionResultSchema", () => {
  it("accepts a success response with uuid", () => {
    const result = { success: true, canEvalUuid: "550e8400-e29b-41d4-a716-446655440000" };
    const parsed = evaluationActionResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts an error response", () => {
    const result = { success: false, error: "Evaluation not found" };
    const parsed = evaluationActionResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing success field", () => {
    const result = { canEvalUuid: "some-uuid" };
    const parsed = evaluationActionResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});
