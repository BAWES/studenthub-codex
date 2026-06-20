import { describe, it, expect } from "vitest";
import {
  listSalarySchema,
  createSalarySchema,
  updateSalarySchema,
  deleteSalarySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema-level validation tests for salary actions
// Actions themselves (listSalaries, createSalary, etc.) use Prisma against
// a real DB and are tested by the E2E/integration test suite.
// ---------------------------------------------------------------------------

describe("listSalaries input validation", () => {
  it("defaults page to 1 and limit to 50", () => {
    const result = listSalarySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it("coerces string numbers", () => {
    const result = listSalarySchema.safeParse({ page: "2", limit: "25" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });
});

describe("createSalary input validation", () => {
  it("requires staffId", () => {
    const result = createSalarySchema.safeParse({ salary: "500", salaryDate: "2026-06-20" });
    expect(result.success).toBe(false);
  });

  it("requires salaryDate", () => {
    const result = createSalarySchema.safeParse({ staffId: "1", salary: "500" });
    expect(result.success).toBe(false);
  });

  it("coerces staffId to number", () => {
    const result = createSalarySchema.safeParse({
      staffId: "1",
      salary: "500",
      salaryDate: "2026-06-20",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(1);
      expect(result.data.salary).toBe(500);
    }
  });
});

describe("updateSalary input validation", () => {
  it("requires salaryUuid", () => {
    const result = updateSalarySchema.safeParse({ salary: "500", salaryDate: "2026-06-20" });
    expect(result.success).toBe(false);
  });
});

describe("deleteSalary input validation", () => {
  it("requires salaryUuid", () => {
    const result = deleteSalarySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
