import { describe, it, expect } from "vitest";
import {
  listEmployeesSchema,
  createEmployeeSchema,
  employeeRowSchema,
  listEmployeesResultSchema,
  actionResponseSchema,
} from "./schemas";

describe("listEmployeesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listEmployeesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(50);
    }
  });

  it("accepts name filter", () => {
    const r = listEmployeesSchema.safeParse({ name: "Ahmed", page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Ahmed");
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listEmployeesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listEmployeesSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

describe("createEmployeeSchema", () => {
  it("accepts valid input with all fields", () => {
    const r = createEmployeeSchema.safeParse({
      employeeName: "Ahmed Al-Kuwaiti",
      employeeEmail: "ahmed@studenthub.com",
      employeePhone: "+96550000000",
      employeeSalary: 1500,
      employeeStatus: 10,
      designationUuid: "550e8400-e29b-41d4-a716-446655440000",
      departmentUuid: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.employeeName).toBe("Ahmed Al-Kuwaiti");
      expect(r.data.employeeEmail).toBe("ahmed@studenthub.com");
    }
  });

  it("accepts minimum required fields", () => {
    const r = createEmployeeSchema.safeParse({
      employeeName: "Test User",
      employeeEmail: "test@studenthub.com",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.employeeStatus).toBe(10); // default
    }
  });

  it("rejects empty name", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "",
        employeeEmail: "test@studenthub.com",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "Test",
        employeeEmail: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects missing name", () => {
    expect(
      createEmployeeSchema.safeParse({ employeeEmail: "test@studenthub.com" }).success,
    ).toBe(false);
  });

  it("rejects missing email", () => {
    expect(createEmployeeSchema.safeParse({ employeeName: "Test" }).success).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    expect(
      createEmployeeSchema.safeParse({
        employeeName: "x".repeat(256),
        employeeEmail: "test@studenthub.com",
      }).success,
    ).toBe(false);
  });
});

describe("employeeRowSchema", () => {
  it("accepts valid employee row", () => {
    const r = employeeRowSchema.safeParse({
      employee_uuid: "550e8400-e29b-41d4-a716-446655440000",
      employee_name: "Ahmed",
      employee_email: "ahmed@studenthub.com",
      employee_phone: null,
      employee_salary: null,
      employee_status: 10,
      employee_role: null,
      employee_created_at: new Date(),
      employee_updated_at: new Date(),
      designation_uuid: null,
      department_uuid: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(
      employeeRowSchema.safeParse({
        employee_name: "Ahmed",
      }).success,
    ).toBe(false);
  });
});

describe("listEmployeesResultSchema", () => {
  it("accepts valid result", () => {
    const r = listEmployeesResultSchema.safeParse({
      employees: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
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
});

describe("actionResponseSchema", () => {
  it("accepts success response", () => {
    expect(actionResponseSchema.safeParse({ operation: "success", message: "Done" }).success).toBe(
      true,
    );
  });

  it("accepts error response", () => {
    expect(actionResponseSchema.safeParse({ operation: "error", message: "Failed" }).success).toBe(
      true,
    );
  });

  it("rejects unknown operation", () => {
    expect(
      actionResponseSchema.safeParse({ operation: "invalid", message: "Oops" }).success,
    ).toBe(false);
  });
});
