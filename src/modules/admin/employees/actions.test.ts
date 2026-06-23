import { describe, it, expect } from "vitest";

import {
  listEmployeesSchema,
  createEmployeeSchema,
  listEmployeesResultSchema,
  actionResponseSchema,
  employeeRowSchema,
  type EmployeeRow,
  type ListEmployeesResult,
  type ActionResponse,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema: listEmployeesSchema
// ---------------------------------------------------------------------------

describe("listEmployeesSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listEmployeesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
      expect(result.data.name).toBeUndefined();
    }
  });

  it("accepts explicit name, page, and limit", () => {
    const result = listEmployeesSchema.safeParse({
      name: "John",
      page: "2",
      limit: "25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John");
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });

  it("accepts empty name filter", () => {
    const result = listEmployeesSchema.safeParse({ name: "" });
    expect(result.success).toBe(true);
  });

  it("rejects page less than 1", () => {
    expect(listEmployeesSchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    expect(listEmployeesSchema.safeParse({ limit: "101" }).success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    expect(listEmployeesSchema.safeParse({ limit: "0" }).success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listEmployeesSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Input schema: createEmployeeSchema
// ---------------------------------------------------------------------------

describe("createEmployeeSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = createEmployeeSchema.safeParse({
      employeeName: "John Doe",
      employeeEmail: "john@example.com",
      employeePhone: "+96550000000",
      employeeSalary: "2500",
      employeeStatus: "10",
      designationUuid: "dept-uuid-1",
      departmentUuid: "dept-uuid-2",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employeeName).toBe("John Doe");
      expect(result.data.employeeEmail).toBe("john@example.com");
      expect(result.data.employeePhone).toBe("+96550000000");
      expect(result.data.employeeSalary).toBe(2500);
      expect(result.data.employeeStatus).toBe(10);
    }
  });

  it("accepts minimal input with defaults", () => {
    const result = createEmployeeSchema.safeParse({
      employeeName: "Jane",
      employeeEmail: "jane@test.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employeeStatus).toBe(10);
      expect(result.data.employeePhone).toBeUndefined();
      expect(result.data.employeeSalary).toBeUndefined();
    }
  });

  it("rejects empty name", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "",
        employeeEmail: "test@test.com",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "Test",
        employeeEmail: "not-email",
      }).success,
    ).toBe(false);
  });

  it("rejects name exceeding 255 chars", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "A".repeat(256),
        employeeEmail: "test@test.com",
      }).success,
    ).toBe(false);
  });

  it("rejects missing email", () => {
    expect(
      createEmployeeSchema.safeParse({ employeeName: "Test" }).success,
    ).toBe(false);
  });

  it("rejects non-positive salary", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "Test",
        employeeEmail: "test@test.com",
        employeeSalary: "0",
      }).success,
    ).toBe(false);
  });

  it("rejects phone exceeding 45 chars", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "Test",
        employeeEmail: "test@test.com",
        employeePhone: "X".repeat(46),
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: employeeRowSchema
// ---------------------------------------------------------------------------

describe("employeeRowSchema", () => {
  const validDate = new Date("2024-01-01");

  it("accepts a valid employee row", () => {
    const result = employeeRowSchema.safeParse({
      employee_uuid: "emp-001",
      employee_name: "John Doe",
      employee_email: "john@example.com",
      employee_phone: "+965****0000",
      employee_salary: 2500,
      employee_status: 10,
      employee_role: "staff",
      employee_created_at: validDate,
      employee_updated_at: validDate,
      designation_uuid: "des-001",
      department_uuid: "dept-001",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null phone and salary", () => {
    const result = employeeRowSchema.safeParse({
      employee_uuid: "emp-002",
      employee_name: "Jane",
      employee_email: "jane@test.com",
      employee_phone: null,
      employee_salary: null,
      employee_status: 0,
      employee_role: null,
      employee_created_at: validDate,
      employee_updated_at: validDate,
      designation_uuid: null,
      department_uuid: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing employee_uuid", () => {
    expect(
      employeeRowSchema.safeParse({
        employee_name: "Test",
        employee_email: "test@test.com",
        employee_status: 1,
        employee_created_at: validDate,
        employee_updated_at: validDate,
        designation_uuid: null,
        department_uuid: null,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: listEmployeesResultSchema
// ---------------------------------------------------------------------------

describe("listEmployeesResultSchema", () => {
  const validRow = {
    employee_uuid: "emp-001",
    employee_name: "John",
    employee_email: "john@test.com",
    employee_phone: null,
    employee_salary: null,
    employee_status: 10,
    employee_role: null,
    employee_created_at: new Date("2024-01-01"),
    employee_updated_at: new Date("2024-01-01"),
    designation_uuid: null,
    department_uuid: null,
  };

  it("accepts a valid result", () => {
    const result = listEmployeesResultSchema.safeParse({
      employees: [validRow],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.employees).toHaveLength(1);
  });

  it("accepts empty result", () => {
    const result = listEmployeesResultSchema.safeParse({
      employees: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listEmployeesResultSchema.safeParse({
        employees: [],
        total: -1,
        page: 1,
        limit: 50,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects missing employees array", () => {
    expect(
      listEmployeesResultSchema.safeParse({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: actionResponseSchema
// ---------------------------------------------------------------------------

describe("actionResponseSchema", () => {
  it("accepts a success response", () => {
    const result = actionResponseSchema.safeParse({
      operation: "success",
      message: "Employee created",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an error response", () => {
    const result = actionResponseSchema.safeParse({
      operation: "error",
      message: "Failed to create",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      actionResponseSchema.safeParse({
        operation: "invalid",
        message: "test",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      actionResponseSchema.safeParse({ operation: "success" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape verification
// ---------------------------------------------------------------------------

describe("EmployeeRow type shape", () => {
  it("conforms to expected structure", () => {
    const row: EmployeeRow = {
      employee_uuid: "emp-001",
      employee_name: "John",
      employee_email: "john@test.com",
      employee_phone: null,
      employee_salary: null,
      employee_status: 10,
      employee_role: null,
      employee_created_at: new Date(),
      employee_updated_at: new Date(),
      designation_uuid: null,
      department_uuid: null,
    };
    expect(row.employee_uuid).toBe("emp-001");
    expect(row.employee_status).toBe(10);
  });
});

describe("ListEmployeesResult type shape", () => {
  it("conforms to expected structure", () => {
    const result: ListEmployeesResult = {
      employees: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
  });
});

describe("ActionResponse type shape", () => {
  it("supports success", () => {
    const r: ActionResponse = { operation: "success", message: "OK" };
    expect(r.operation).toBe("success");
  });

  it("supports error", () => {
    const r: ActionResponse = { operation: "error", message: "Fail" };
    expect(r.operation).toBe("error");
  });
});
