import { describe, it, expect } from "vitest";
import {
  employeeRowSchema,
  listEmployeesResultSchema,
  actionResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema tests: employeeRowSchema
// ---------------------------------------------------------------------------

describe("employeeRowSchema", () => {
  const validRow = {
    employee_uuid: "emp-001",
    employee_name: "John Doe",
    employee_email: "john@example.com",
    employee_phone: "+96550001234",
    employee_salary: 1500,
    employee_status: 10,
    employee_created_at: new Date("2026-06-01"),
    employee_updated_at: new Date("2026-06-10"),
    designation_uuid: "des-001",
    department_uuid: "dep-001",
  };

  it("accepts a valid employee row", () => {
    const result = employeeRowSchema.parse(validRow);
    expect(result.employee_uuid).toBe("emp-001");
    expect(result.employee_name).toBe("John Doe");
    expect(result.employee_status).toBe(10);
  });

  it("accepts nullable fields as null", () => {
    const result = employeeRowSchema.parse({
      ...validRow,
      employee_phone: null,
      employee_salary: null,
      designation_uuid: null,
      department_uuid: null,
    });
    expect(result.employee_phone).toBeNull();
    expect(result.employee_salary).toBeNull();
    expect(result.designation_uuid).toBeNull();
    expect(result.department_uuid).toBeNull();
  });

  it("rejects missing required string field", () => {
    const { employee_name, ...rest } = validRow;
    expect(() => employeeRowSchema.parse(rest)).toThrow();
  });

  it("rejects missing required uuid field", () => {
    const { employee_uuid, ...rest } = validRow;
    expect(() => employeeRowSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for numeric field", () => {
    expect(() =>
      employeeRowSchema.parse({ ...validRow, employee_status: "not-a-number" }),
    ).toThrow();
  });

  it("rejects wrong type for date field", () => {
    expect(() =>
      employeeRowSchema.parse({
        ...validRow,
        employee_created_at: "not-a-date",
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listEmployeesResultSchema
// ---------------------------------------------------------------------------

describe("listEmployeesResultSchema", () => {
  const sampleEmployee = {
    employee_uuid: "emp-001",
    employee_name: "John Doe",
    employee_email: "john@example.com",
    employee_phone: null,
    employee_salary: null,
    employee_status: 10,
    employee_created_at: new Date(),
    employee_updated_at: new Date(),
    designation_uuid: null,
    department_uuid: null,
  };

  it("accepts a valid result with employees", () => {
    const result = listEmployeesResultSchema.parse({
      employees: [sampleEmployee],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.employees.length).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("accepts an empty list", () => {
    const result = listEmployeesResultSchema.parse({
      employees: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.employees.length).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("rejects negative page", () => {
    expect(() =>
      listEmployeesResultSchema.parse({
        employees: [],
        total: 0,
        page: -1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });

  it("rejects missing total field", () => {
    expect(() =>
      listEmployeesResultSchema.parse({
        employees: [],
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });

  it("rejects wrong type for total field", () => {
    expect(() =>
      listEmployeesResultSchema.parse({
        employees: [],
        total: "not-a-number",
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: actionResponseSchema
// ---------------------------------------------------------------------------

describe("actionResponseSchema", () => {
  it("accepts a success response", () => {
    const result = actionResponseSchema.parse({
      operation: "success",
      message: "Employee created",
    });
    expect(result.operation).toBe("success");
    expect(result.message).toBe("Employee created");
  });

  it("accepts an error response", () => {
    const result = actionResponseSchema.parse({
      operation: "error",
      message: "Failed to create employee",
    });
    expect(result.operation).toBe("error");
  });

  it("rejects unknown operation value", () => {
    expect(() =>
      actionResponseSchema.parse({
        operation: "invalid",
        message: "test",
      }),
    ).toThrow();
  });

  it("rejects missing message", () => {
    expect(() =>
      actionResponseSchema.parse({ operation: "success" }),
    ).toThrow();
  });

  it("rejects missing operation", () => {
    expect(() =>
      actionResponseSchema.parse({ message: "test" }),
    ).toThrow();
  });
});
