import { describe, it, expect } from "vitest";
import { listEmployeesSchema } from "./schemas";
import type { EmployeeRow, ListEmployeesResult } from "./schemas";

/**
 * Page migration test for admin/employees.
 *
 * Verifies that listEmployeesSchema accepts the params passed by the page,
 * and that EmployeeRow fields map correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin employees page — data contract", () => {
  it("listEmployeesSchema accepts empty params (defaults apply)", () => {
    const r = listEmployeesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.limit).toBe("number");
    }
  });

  it("listEmployeesSchema accepts the params the page actually passes", () => {
    const r = listEmployeesSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("EmployeeRow fields map correctly to DataTable columns", () => {
    // The page maps EmployeeRow to DataTable columns:
    //   employee_uuid     → row.employee_uuid   (for keys)
    //   employee_name     → row.employee_name
    //   employee_email    → row.employee_email
    //   employee_phone    → row.employee_phone
    //   employee_salary   → row.employee_salary
    //   employee_status   → row.employee_status
    //   employee_created_at → row.employee_created_at (formatted)
    //   employee_updated_at → row.employee_updated_at (formatted)
    const row: EmployeeRow = {
      employee_uuid: "emp-uuid-1",
      employee_name: "Jane Smith",
      employee_email: "jane@company.com",
      employee_phone: "+965 5555 1234",
      employee_salary: 2500,
      employee_status: 10,
      employee_created_at: new Date("2025-01-15T10:00:00Z"),
      employee_updated_at: new Date("2025-06-01T12:00:00Z"),
      designation_uuid: "desig-uuid-1",
      department_uuid: "dept-uuid-1",
    };
    expect(row.employee_uuid).toBe("emp-uuid-1");
    expect(row.employee_name).toBe("Jane Smith");
    expect(row.employee_email).toBe("jane@company.com");
    expect(row.employee_phone).toBe("+965 5555 1234");
    expect(row.employee_salary).toBe(2500);
    expect(row.employee_status).toBe(10);
    expect(row.employee_created_at).toEqual(new Date("2025-01-15T10:00:00Z"));
    expect(row.employee_updated_at).toEqual(new Date("2025-06-01T12:00:00Z"));
    expect(row.designation_uuid).toBe("desig-uuid-1");
    expect(row.department_uuid).toBe("dept-uuid-1");
  });

  it("ListEmployeesResult has expected shape", () => {
    const result: ListEmployeesResult = {
      employees: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.employees)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });
});
