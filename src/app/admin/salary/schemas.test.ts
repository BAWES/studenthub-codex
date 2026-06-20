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
import type { SalaryItem, ListSalaryResult } from "./schemas";

// ---------------------------------------------------------------------------
// listSalarySchema
// ---------------------------------------------------------------------------
describe("listSalarySchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listSalarySchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listSalarySchema.safeParse({ page: 2, limit: 100 }).success,
    ).toBe(true);
  });

  it("accepts search param", () => {
    expect(
      listSalarySchema.safeParse({ search: "Ahmed" }).success,
    ).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listSalarySchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 200", () => {
    expect(listSalarySchema.safeParse({ limit: 201 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listSalarySchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createSalarySchema
// ---------------------------------------------------------------------------
describe("createSalarySchema", () => {
  it("accepts valid input", () => {
    expect(
      createSalarySchema.safeParse({
        staffId: 1,
        salary: 750.5,
        salaryCurrency: "KWD",
        salaryDate: "2026-06-01",
      }).success,
    ).toBe(true);
  });

  it("accepts optional comment", () => {
    expect(
      createSalarySchema.safeParse({
        staffId: 1,
        salary: 500,
        salaryCurrency: "KWD",
        comment: "Bonus",
        salaryDate: "2026-06-01",
      }).success,
    ).toBe(true);
  });

  it("rejects missing staffId", () => {
    expect(
      createSalarySchema.safeParse({
        salary: 500,
        salaryDate: "2026-06-01",
      }).success,
    ).toBe(false);
  });

  it("rejects missing salary", () => {
    expect(
      createSalarySchema.safeParse({
        staffId: 1,
        salaryDate: "2026-06-01",
      }).success,
    ).toBe(false);
  });

  it("rejects negative salary", () => {
    expect(
      createSalarySchema.safeParse({
        staffId: 1,
        salary: -100,
        salaryDate: "2026-06-01",
      }).success,
    ).toBe(false);
  });

  it("rejects missing salaryDate", () => {
    expect(
      createSalarySchema.safeParse({
        staffId: 1,
        salary: 500,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateSalarySchema
// ---------------------------------------------------------------------------
describe("updateSalarySchema", () => {
  it("accepts valid input", () => {
    expect(
      updateSalarySchema.safeParse({
        salaryUuid: "abc-123",
        salary: 800,
        salaryCurrency: "KWD",
        salaryDate: "2026-07-01",
      }).success,
    ).toBe(true);
  });

  it("rejects missing salaryUuid", () => {
    expect(
      updateSalarySchema.safeParse({
        salary: 800,
        salaryDate: "2026-07-01",
      }).success,
    ).toBe(false);
  });

  it("rejects empty salaryUuid", () => {
    expect(
      updateSalarySchema.safeParse({
        salaryUuid: "",
        salary: 800,
        salaryDate: "2026-07-01",
      }).success,
    ).toBe(false);
  });

  it("rejects negative salary", () => {
    expect(
      updateSalarySchema.safeParse({
        salaryUuid: "abc-123",
        salary: -1,
        salaryDate: "2026-07-01",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteSalarySchema
// ---------------------------------------------------------------------------
describe("deleteSalarySchema", () => {
  it("accepts valid input", () => {
    expect(
      deleteSalarySchema.safeParse({ salaryUuid: "abc-123" }).success,
    ).toBe(true);
  });

  it("rejects missing salaryUuid", () => {
    expect(deleteSalarySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty salaryUuid", () => {
    expect(deleteSalarySchema.safeParse({ salaryUuid: "" }).success).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// salaryItemSchema
// ---------------------------------------------------------------------------
describe("salaryItemSchema", () => {
  const validItem = {
    staff_salary_uuid: "abc-123",
    staff_id: 1,
    staff_name: "Ahmed",
    salary: 750.5,
    salary_currency: "KWD",
    comment: "Monthly",
    salary_date: null,
    created_at: null,
    updated_at: null,
  };

  it("accepts a valid salary item", () => {
    expect(salaryItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null nullable fields", () => {
    expect(
      salaryItemSchema.safeParse({
        ...validItem,
        salary: null,
        staff_id: null,
        staff_name: null,
        comment: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing staff_salary_uuid", () => {
    const { staff_salary_uuid: _, ...rest } = validItem;
    expect(salaryItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty staff_salary_uuid", () => {
    expect(
      salaryItemSchema.safeParse({
        ...validItem,
        staff_salary_uuid: "",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listSalaryResultSchema (paginated)
// ---------------------------------------------------------------------------
describe("listSalaryResultSchema", () => {
  const validResult = {
    salaries: [
      {
        staff_salary_uuid: "abc-123",
        staff_id: 1,
        staff_name: "Ahmed",
        salary: 750.5,
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
  };

  it("accepts a valid result", () => {
    expect(listSalaryResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty salaries array", () => {
    expect(
      listSalaryResultSchema.safeParse({
        ...validResult,
        salaries: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing salaries", () => {
    const { salaries: _, ...rest } = validResult;
    expect(listSalaryResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listSalaryResultSchema.safeParse({
        ...validResult,
        total: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listSalaryResultSchema.safeParse({
        ...validResult,
        page: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listSalaryResultSchema.safeParse({
        ...validResult,
        totalPages: -1,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// salaryActionResponseSchema
// ---------------------------------------------------------------------------
describe("salaryActionResponseSchema", () => {
  it("accepts valid response", () => {
    expect(
      salaryActionResponseSchema.safeParse({
        operation: "created",
        message: "Salary record created",
      }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(
      salaryActionResponseSchema.safeParse({ message: "Done" }).success,
    ).toBe(false);
  });

  it("rejects empty operation", () => {
    expect(
      salaryActionResponseSchema.safeParse({
        operation: "",
        message: "Done",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      salaryActionResponseSchema.safeParse({ operation: "created" }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      salaryActionResponseSchema.safeParse({
        operation: "created",
        message: "",
      }).success,
    ).toBe(false);
  });
});
