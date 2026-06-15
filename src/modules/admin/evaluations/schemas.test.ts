import { describe, it, expect } from "vitest";
import {
  listEvaluationsSchema,
  getEvaluationInputSchema,
  createEvaluationSchema,
  updateEvaluationSchema,
  evaluationRowSchema,
  evaluationDetailSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listEvaluationsSchema
// ---------------------------------------------------------------------------
describe("listEvaluationsSchema", () => {
  it("accepts valid input with defaults", () => {
    const result = listEvaluationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.search).toBeUndefined();
    }
  });

  it("accepts custom page and limit", () => {
    const result = listEvaluationsSchema.safeParse({ page: "3", limit: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects zero and negative page", () => {
    expect(listEvaluationsSchema.safeParse({ page: "0" }).success).toBe(false);
    expect(listEvaluationsSchema.safeParse({ page: "-1" }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listEvaluationsSchema.safeParse({ limit: "101" }).success).toBe(false);
  });

  it("accepts search string", () => {
    const result = listEvaluationsSchema.safeParse({ search: "Ahmed" });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getEvaluationInputSchema
// ---------------------------------------------------------------------------
describe("getEvaluationInputSchema", () => {
  it("accepts valid UUID", () => {
    const result = getEvaluationInputSchema.safeParse({ uuid: "abc-123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    expect(getEvaluationInputSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createEvaluationSchema
// ---------------------------------------------------------------------------
describe("createEvaluationSchema", () => {
  const validInput = {
    candidateId: 1,
    deptId: 2,
    staffId: 3,
    startDate: "2026-01-01",
    endDate: "2026-06-01",
  };

  it("accepts valid input", () => {
    const result = createEvaluationSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    const { candidateId, ...rest } = validInput;
    expect(createEvaluationSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-positive IDs", () => {
    expect(
      createEvaluationSchema.safeParse({ ...validInput, candidateId: 0 }).success,
    ).toBe(false);
    expect(
      createEvaluationSchema.safeParse({ ...validInput, candidateId: -1 }).success,
    ).toBe(false);
  });

  it("rejects empty dates", () => {
    expect(
      createEvaluationSchema.safeParse({ ...validInput, startDate: "" }).success,
    ).toBe(false);
    expect(
      createEvaluationSchema.safeParse({ ...validInput, endDate: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateEvaluationSchema
// ---------------------------------------------------------------------------
describe("updateEvaluationSchema", () => {
  it("accepts uuid only (partial update)", () => {
    const result = updateEvaluationSchema.safeParse({ uuid: "abc-123" });
    expect(result.success).toBe(true);
  });

  it("accepts uuid with all optional fields", () => {
    const result = updateEvaluationSchema.safeParse({
      uuid: "abc-123",
      candidateId: 1,
      staffId: 2,
      startDate: "2026-01-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    expect(updateEvaluationSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evaluationRowSchema
// ---------------------------------------------------------------------------
describe("evaluationRowSchema", () => {
  it("accepts valid row shape", () => {
    const result = evaluationRowSchema.safeParse({
      uuid: "abc",
      candidateId: 1,
      candidateName: "Ahmed",
      deptId: 2,
      staffId: 3,
      staffName: "Staff",
      startDate: new Date(),
      endDate: new Date(),
      createdAt: new Date(),
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// evaluationDetailSchema
// ---------------------------------------------------------------------------
describe("evaluationDetailSchema", () => {
  it("accepts valid detail shape with updatedAt", () => {
    const result = evaluationDetailSchema.safeParse({
      uuid: "abc",
      candidateId: 1,
      candidateName: "Ahmed",
      deptId: 2,
      staffId: 3,
      staffName: "Staff",
      startDate: new Date(),
      endDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });
});
