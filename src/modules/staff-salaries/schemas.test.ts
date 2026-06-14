import { describe, it, expect } from "vitest";
import {
  staffSalaryItemSchema,
  listStaffSalariesResultSchema,
  salaryActionResultSchema,
} from "./schemas";

const validItem = () => ({
  staff_salary_uuid: "ss-001",
  staff_id: null,
  salary: 1500.0,
  salary_currency: "KWD",
  comment: null,
  salary_date: new Date("2026-06-01"),
  created_at: null,
  updated_at: null,
});

// ---------------------------------------------------------------------------
// staffSalaryItemSchema
// ---------------------------------------------------------------------------

describe("staffSalaryItemSchema", () => {
  it("accepts a valid item", () => {
    const r = staffSalaryItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = staffSalaryItemSchema.safeParse({
      ...validItem(),
      staff_id: null,
      salary: null,
      salary_currency: null,
      comment: null,
      salary_date: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing staff_salary_uuid", () => {
    const { staff_salary_uuid: _, ...rest } = validItem();
    expect(staffSalaryItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStaffSalariesResultSchema
// ---------------------------------------------------------------------------

describe("listStaffSalariesResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listStaffSalariesResultSchema.safeParse({
      salaries: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty salaries array", () => {
    expect(
      listStaffSalariesResultSchema.safeParse({ salaries: [], total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// salaryActionResultSchema
// ---------------------------------------------------------------------------

describe("salaryActionResultSchema", () => {
  const valid = () => ({ operation: "create", message: "Salary created" });

  it("accepts a valid action result", () => {
    expect(salaryActionResultSchema.safeParse(valid()).success).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(salaryActionResultSchema.safeParse({ message: "Ok" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(salaryActionResultSchema.safeParse({ operation: "create" }).success).toBe(false);
  });
});
