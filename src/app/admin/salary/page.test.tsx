import { describe, it, expect } from "vitest";
import {
  listSalarySchema,
  createSalarySchema,
  updateSalarySchema,
  deleteSalarySchema,
  salaryItemSchema,
  listSalaryResultSchema,
} from "@/modules/admin/salary/schemas";
import type {
  SalaryItem,
  ListSalaryResult,
} from "@/modules/admin/salary/schemas";

describe("admin salary — data contract", () => {
  it("SalaryItem fields map correctly to DataTable columns", () => {
    const row: SalaryItem = {
      staff_salary_uuid: "sal-123",
      staff_id: 42,
      staff_name: "Ahmed Ali",
      salary: 1500.5,
      salary_currency: "KWD",
      comment: "Monthly salary",
      salary_date: new Date("2026-06-01"),
      created_at: new Date("2026-06-01T08:00:00Z"),
      updated_at: new Date("2026-06-20T12:00:00Z"),
    };
    expect(row.staff_salary_uuid).toBe("sal-123");
    expect(row.staff_id).toBe(42);
    expect(row.staff_name).toBe("Ahmed Ali");
    expect(row.salary).toBe(1500.5);
    expect(row.salary_currency).toBe("KWD");
    expect(row.comment).toBe("Monthly salary");
  });

  it("SalaryItem allows nullable fields", () => {
    const row: SalaryItem = {
      staff_salary_uuid: "nullable-test",
      staff_id: null,
      staff_name: null,
      salary: null,
      salary_currency: null,
      comment: null,
      salary_date: null,
      created_at: null,
      updated_at: null,
    };
    expect(row.staff_id).toBeNull();
    expect(row.staff_name).toBeNull();
    expect(row.salary).toBeNull();
    expect(row.comment).toBeNull();
  });

  it("ListSalaryResult has expected shape", () => {
    const result: ListSalaryResult = {
      salaries: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.salaries)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
  });
});

describe("admin salary — listSalarySchema", () => {
  it("accepts empty params (default pagination)", () => {
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

describe("admin salary — createSalarySchema", () => {
  it("requires staffId", () => {
    const result = createSalarySchema.safeParse({
      salary: "500",
      salaryDate: "2026-06-20",
    });
    expect(result.success).toBe(false);
  });

  it("requires salaryDate", () => {
    const result = createSalarySchema.safeParse({ staffId: "1", salary: "500" });
    expect(result.success).toBe(false);
  });

  it("coerces staffId and salary to number", () => {
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

describe("admin salary — updateSalarySchema", () => {
  it("requires salaryUuid", () => {
    const result = updateSalarySchema.safeParse({
      salary: "500",
      salaryDate: "2026-06-20",
    });
    expect(result.success).toBe(false);
  });
});

describe("admin salary — deleteSalarySchema", () => {
  it("requires salaryUuid", () => {
    const result = deleteSalarySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
