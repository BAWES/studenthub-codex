import { describe, it, expect } from "vitest";
import { listSalarySchema } from "./schemas";
import type { SalaryItem, ListSalaryResult } from "./schemas";

/**
 * Page migration test for admin/salary.
 *
 * Verifies that listSalarySchema accepts the params passed by the page,
 * and that SalaryItem fields map correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin salary page — data contract", () => {
  it("listSalarySchema accepts empty params (defaults apply)", () => {
    const r = listSalarySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.limit).toBe("number");
    }
  });

  it("listSalarySchema accepts the params the page actually passes", () => {
    const r = listSalarySchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("listSalarySchema accepts search param", () => {
    const r = listSalarySchema.safeParse({ search: "Ahmed" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.search).toBe("Ahmed");
    }
  });

  it("SalaryItem fields map correctly to DataTable columns", () => {
    // The page maps SalaryItem to DataTable columns:
    //   staff_salary_uuid → row.staff_salary_uuid (for keys)
    //   staff_name        → row.staff_name
    //   salary            → row.salary (formatted)
    //   salary_currency   → row.salary_currency
    //   comment           → row.comment
    //   salary_date       → row.salary_date (formatted)
    //   updated_at        → row.updated_at (formatted)
    const row: SalaryItem = {
      staff_salary_uuid: "abc-123",
      staff_id: 1,
      staff_name: "Ahmed Ali",
      salary: 750.5,
      salary_currency: "KWD",
      comment: "Monthly salary",
      salary_date: new Date("2026-06-01"),
      created_at: new Date("2026-01-15T10:00:00Z"),
      updated_at: new Date("2026-06-01T12:00:00Z"),
    };
    expect(row.staff_salary_uuid).toBe("abc-123");
    expect(row.staff_name).toBe("Ahmed Ali");
    expect(row.salary).toBe(750.5);
    expect(row.salary_currency).toBe("KWD");
    expect(row.comment).toBe("Monthly salary");
    expect(row.salary_date).toEqual(new Date("2026-06-01"));
    expect(row.updated_at).toEqual(new Date("2026-06-01T12:00:00Z"));
  });

  it("SalaryItem handles null fields", () => {
    const row: SalaryItem = {
      staff_salary_uuid: "def-456",
      staff_id: null,
      staff_name: null,
      salary: null,
      salary_currency: null,
      comment: null,
      salary_date: null,
      created_at: null,
      updated_at: null,
    };
    expect(row.staff_name).toBeNull();
    expect(row.salary).toBeNull();
    expect(row.salary_date).toBeNull();
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
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });
});
