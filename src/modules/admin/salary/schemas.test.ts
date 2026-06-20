import { describe, it, expect } from "vitest";
import {
  listSalarySchema,
  createSalarySchema,
  updateSalarySchema,
  deleteSalarySchema,
  salaryItemSchema,
  listSalaryResultSchema,
  salaryActionResponseSchema,
} from "./schemas";

describe("listSalarySchema", () => {
  it("accepts valid input with defaults", () => {
    const result = listSalarySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts page and limit", () => {
    const result = listSalarySchema.safeParse({ page: 2, limit: 25 });
    expect(result.success).toBe(true);
  });

  it("rejects zero limit", () => {
    const result = listSalarySchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listSalarySchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts search string", () => {
    const result = listSalarySchema.safeParse({ search: "Ahmed" });
    expect(result.success).toBe(true);
  });
});

describe("createSalarySchema", () => {
  it("accepts valid input", () => {
    const result = createSalarySchema.safeParse({
      staffId: "1",
      salary: "500.000",
      salaryCurrency: "KWD",
      salaryDate: "2026-06-20",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional comment", () => {
    const result = createSalarySchema.safeParse({
      staffId: "1",
      salary: "500",
      salaryDate: "2026-06-20",
      comment: "Monthly salary",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty staffId", () => {
    const result = createSalarySchema.safeParse({
      staffId: "",
      salary: "500",
      salaryDate: "2026-06-20",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative salary", () => {
    const result = createSalarySchema.safeParse({
      staffId: "1",
      salary: "-100",
      salaryDate: "2026-06-20",
    });
    expect(result.success).toBe(false);
  });

  it("defaults currency to KWD", () => {
    const result = createSalarySchema.safeParse({
      staffId: "1",
      salary: "500",
      salaryDate: "2026-06-20",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salaryCurrency).toBe("KWD");
    }
  });
});

describe("updateSalarySchema", () => {
  it("accepts valid update", () => {
    const result = updateSalarySchema.safeParse({
      salaryUuid: "abc-123",
      salary: "600",
      salaryDate: "2026-07-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing salaryUuid", () => {
    const result = updateSalarySchema.safeParse({
      salary: "600",
      salaryDate: "2026-07-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteSalarySchema", () => {
  it("accepts valid UUID", () => {
    const result = deleteSalarySchema.safeParse({ salaryUuid: "abc-123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = deleteSalarySchema.safeParse({ salaryUuid: "" });
    expect(result.success).toBe(false);
  });
});

describe("salaryItemSchema", () => {
  it("accepts a full salary item", () => {
    const result = salaryItemSchema.safeParse({
      staff_salary_uuid: "abc-123",
      staff_id: 1,
      staff_name: "Ahmed",
      salary: 500,
      salary_currency: "KWD",
      comment: "Test",
      salary_date: new Date("2026-06-20"),
      created_at: new Date("2026-06-20"),
      updated_at: new Date("2026-06-20"),
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const result = salaryItemSchema.safeParse({
      staff_salary_uuid: "abc-123",
      staff_id: null,
      staff_name: null,
      salary: null,
      salary_currency: null,
      comment: null,
      salary_date: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("listSalaryResultSchema", () => {
  it("accepts valid list result", () => {
    const result = listSalaryResultSchema.safeParse({
      salaries: [
        {
          staff_salary_uuid: "abc",
          staff_id: 1,
          staff_name: "Ahmed",
          salary: 500,
          salary_currency: "KWD",
          comment: null,
          salary_date: null,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe("salaryActionResponseSchema", () => {
  it("accepts success response", () => {
    const result = salaryActionResponseSchema.safeParse({
      operation: "success",
      message: "Salary record created",
    });
    expect(result.success).toBe(true);
  });

  it("accepts error response", () => {
    const result = salaryActionResponseSchema.safeParse({
      operation: "error",
      message: "Invalid input",
    });
    expect(result.success).toBe(true);
  });
});
