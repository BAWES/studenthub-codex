import { describe, it, expect } from "vitest";
import {
  employeeRowSchema,
  listEmployeesResultSchema,
  actionResponseSchema,
  listEmployeesSchema,
  createEmployeeSchema,
  updateEmployeeRoleSchema,
  ROLES,
} from "./schemas";

// ---------------------------------------------------------------------------
// employeeRowSchema
// ---------------------------------------------------------------------------
describe("employeeRowSchema", () => {
  const validRow = {
    employee_uuid: "emp-123",
    employee_name: "John Doe",
    employee_email: "john@example.com",
    employee_phone: null,
    employee_salary: null,
    employee_status: 10,
    employee_role: "staff",
    employee_created_at: new Date(),
    employee_updated_at: new Date(),
    designation_uuid: null,
    department_uuid: null,
  };

  it("accepts a valid employee row", () => {
    expect(employeeRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts admin role", () => {
    expect(
      employeeRowSchema.safeParse({ ...validRow, employee_role: "admin" }).success,
    ).toBe(true);
  });

  it("accepts null role", () => {
    expect(
      employeeRowSchema.safeParse({ ...validRow, employee_role: null }).success,
    ).toBe(true);
  });

  it("accepts null nullable fields", () => {
    expect(
      employeeRowSchema.safeParse({
        ...validRow,
        employee_phone: null,
        employee_salary: null,
        employee_role: null,
        designation_uuid: null,
        department_uuid: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing employee_uuid", () => {
    const { employee_uuid: _, ...rest } = validRow;
    expect(employeeRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for employee_uuid", () => {
    expect(employeeRowSchema.safeParse({ ...validRow, employee_uuid: 123 }).success).toBe(false);
  });

  it("rejects wrong type for employee_status", () => {
    expect(employeeRowSchema.safeParse({ ...validRow, employee_status: "active" }).success).toBe(false);
  });

  it("rejects wrong type for employee_created_at", () => {
    expect(employeeRowSchema.safeParse({ ...validRow, employee_created_at: "not-a-date" }).success).toBe(false);
  });

  it("rejects wrong type for employee_salary", () => {
    expect(employeeRowSchema.safeParse({ ...validRow, employee_salary: "high" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listEmployeesResultSchema (paginated)
// ---------------------------------------------------------------------------
describe("listEmployeesResultSchema", () => {
  const validResult = {
    employees: [
      {
        employee_uuid: "emp-1",
        employee_name: "John",
        employee_email: "john@test.com",
        employee_phone: null,
        employee_salary: null,
        employee_status: 10,
        employee_role: "staff",
        employee_created_at: new Date(),
        employee_updated_at: new Date(),
        designation_uuid: null,
        department_uuid: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listEmployeesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty employees array", () => {
    expect(
      listEmployeesResultSchema.safeParse({ ...validResult, employees: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing employees", () => {
    const { employees: _, ...rest } = validResult;
    expect(listEmployeesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listEmployeesResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listEmployeesResultSchema.safeParse({ ...validResult, page: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(listEmployeesResultSchema.safeParse({ ...validResult, totalPages: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// actionResponseSchema
// ---------------------------------------------------------------------------
describe("actionResponseSchema", () => {
  it("accepts success response", () => {
    expect(actionResponseSchema.safeParse({ operation: "success", message: "Created" }).success).toBe(true);
  });

  it("accepts error response", () => {
    expect(actionResponseSchema.safeParse({ operation: "error", message: "Failed" }).success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(actionResponseSchema.safeParse({ operation: "invalid", message: "Nope" }).success).toBe(false);
  });

  it("rejects missing operation", () => {
    expect(actionResponseSchema.safeParse({ message: "Nope" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(actionResponseSchema.safeParse({ operation: "success" }).success).toBe(false);
  });

  it("accepts empty message", () => {
    expect(actionResponseSchema.safeParse({ operation: "success", message: "" }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listEmployeesSchema
// ---------------------------------------------------------------------------
describe("listEmployeesSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listEmployeesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(listEmployeesSchema.safeParse({ name: "John", page: 2, limit: 25 }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listEmployeesSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listEmployeesSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listEmployeesSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createEmployeeSchema
// ---------------------------------------------------------------------------
describe("createEmployeeSchema", () => {
  const validMinimal = {
    employeeName: "John Doe",
    employeeEmail: "john@example.com",
  };

  it("accepts minimal input", () => {
    expect(createEmployeeSchema.safeParse(validMinimal).success).toBe(true);
  });

  it("defaults role to staff", () => {
    const r = createEmployeeSchema.safeParse(validMinimal);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.employeeRole).toBe("staff");
    }
  });

  it("accepts explicit admin role", () => {
    const r = createEmployeeSchema.safeParse({
      ...validMinimal,
      employeeRole: "admin",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.employeeRole).toBe("admin");
    }
  });

  it("accepts full input", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "John Doe",
        employeeEmail: "john@example.com",
        employeePhone: "+965****5678",
        employeeSalary: 50000,
        employeeStatus: 10,
        employeeRole: "admin",
        designationUuid: "des-1",
        departmentUuid: "dept-1",
      }).success,
    ).toBe(true);
  });

  it("accepts default employeeStatus", () => {
    expect(
      createEmployeeSchema.safeParse({ employeeName: "Jane", employeeEmail: "jane@test.com" }).success,
    ).toBe(true);
  });

  it("rejects missing employeeName", () => {
    expect(createEmployeeSchema.safeParse({ employeeEmail: "john@test.com" }).success).toBe(false);
  });

  it("rejects empty employeeName", () => {
    expect(createEmployeeSchema.safeParse({ employeeName: "", employeeEmail: "john@test.com" }).success).toBe(false);
  });

  it("rejects employeeName exceeding 255 chars", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "x".repeat(256),
        employeeEmail: "john@test.com",
      }).success,
    ).toBe(false);
  });

  it("rejects missing employeeEmail", () => {
    expect(createEmployeeSchema.safeParse({ employeeName: "John" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createEmployeeSchema.safeParse({ employeeName: "John", employeeEmail: "not-email" }).success,
    ).toBe(false);
  });

  it("rejects employeeEmail exceeding 255 chars", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "John",
        employeeEmail: "x".repeat(256) + "@test.com",
      }).success,
    ).toBe(false);
  });

  it("rejects employeePhone exceeding 45 chars", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "John",
        employeeEmail: "john@test.com",
        employeePhone: "x".repeat(46),
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive employeeSalary", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "John",
        employeeEmail: "john@test.com",
        employeeSalary: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative employeeSalary", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "John",
        employeeEmail: "john@test.com",
        employeeSalary: -500,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ROLES constant
// ---------------------------------------------------------------------------
describe("ROLES", () => {
  it("contains staff and admin", () => {
    expect(ROLES).toEqual(["staff", "admin"]);
  });
});

// ---------------------------------------------------------------------------
// updateEmployeeRoleSchema
// ---------------------------------------------------------------------------
describe("updateEmployeeRoleSchema", () => {
  it("accepts valid staff role", () => {
    expect(
      updateEmployeeRoleSchema.safeParse({ uuid: "emp-1", role: "staff" }).success,
    ).toBe(true);
  });

  it("accepts valid admin role", () => {
    expect(
      updateEmployeeRoleSchema.safeParse({ uuid: "emp-1", role: "admin" }).success,
    ).toBe(true);
  });

  it("rejects empty uuid", () => {
    expect(
      updateEmployeeRoleSchema.safeParse({ uuid: "", role: "staff" }).success,
    ).toBe(false);
  });

  it("rejects invalid role", () => {
    expect(
      updateEmployeeRoleSchema.safeParse({ uuid: "emp-1", role: "manager" }).success,
    ).toBe(false);
  });

  it("rejects missing uuid", () => {
    expect(
      updateEmployeeRoleSchema.safeParse({ role: "staff" }).success,
    ).toBe(false);
  });

  it("rejects missing role", () => {
    expect(
      updateEmployeeRoleSchema.safeParse({ uuid: "emp-1" }).success,
    ).toBe(false);
  });

  it("provides clear error message for invalid role", () => {
    const r = updateEmployeeRoleSchema.safeParse({ uuid: "emp-1", role: "superadmin" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.message).toContain("staff");
    }
  });
});
