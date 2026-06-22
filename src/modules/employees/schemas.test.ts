import { describe, it, expect } from "vitest";
import {
  employeeItemSchema,
  employeeDetailSchema,
  listEmployeesResultSchema,
  createEmployeeResultSchema,
  updateEmployeeResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validEmployeeItem = () => ({
  employee_uuid: "550e8400-e29b-41d4-a716-446655440000",
  employee_name: "Ahmed Al-Sabah",
  employee_email: "ahmed@company.com",
  employee_phone: "+965 5555 1234",
  employee_salary: 1500,
  employee_status: 10,
  employee_created_at: new Date("2026-06-14"),
  employee_updated_at: new Date("2026-06-14"),
  designation_uuid: "660e8400-e29b-41d4-a716-446655440001",
  department_uuid: "770e8400-e29b-41d4-a716-446655440002",
});

const validEmployeeItemMinimal = () => ({
  employee_uuid: "550e8400-e29b-41d4-a716-446655440000",
  employee_name: "Ahmed Al-Sabah",
  employee_email: "ahmed@company.com",
  employee_phone: null,
  employee_salary: null,
  employee_status: 10,
  employee_created_at: new Date("2026-06-14"),
  employee_updated_at: new Date("2026-06-14"),
  designation_uuid: null,
  department_uuid: null,
});

// ---------------------------------------------------------------------------
// employeeItemSchema
// ---------------------------------------------------------------------------

describe("employeeItemSchema", () => {
  it("accepts a full employee item", () => {
    const r = employeeItemSchema.safeParse(validEmployeeItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal employee item (nullable fields set to null)", () => {
    const r = employeeItemSchema.safeParse(validEmployeeItemMinimal());
    expect(r.success).toBe(true);
  });

  it("accepts a Date object for timestamps", () => {
    const r = employeeItemSchema.safeParse({
      ...validEmployeeItem(),
      employee_created_at: new Date("2026-06-14"),
      employee_updated_at: new Date("2026-06-14"),
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = employeeItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = employeeItemSchema.safeParse({
      ...validEmployeeItem(),
      employee_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing employee_uuid", () => {
    const r = employeeItemSchema.safeParse({
      ...validEmployeeItem(),
      employee_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing employee_name", () => {
    const r = employeeItemSchema.safeParse({
      ...validEmployeeItem(),
      employee_name: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing employee_email", () => {
    const r = employeeItemSchema.safeParse({
      ...validEmployeeItem(),
      employee_email: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string employee_name when provided", () => {
    const r = employeeItemSchema.safeParse({
      ...validEmployeeItem(),
      employee_name: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number employee_status when provided", () => {
    const r = employeeItemSchema.safeParse({
      ...validEmployeeItem(),
      employee_status: "active",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// employeeDetailSchema
// ---------------------------------------------------------------------------

describe("employeeDetailSchema", () => {
  it("accepts a full employee item", () => {
    const r = employeeDetailSchema.safeParse(validEmployeeItem());
    expect(r.success).toBe(true);
  });

  it("accepts null (employee not found)", () => {
    const r = employeeDetailSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = employeeDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listEmployeesResultSchema
// ---------------------------------------------------------------------------

describe("listEmployeesResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listEmployeesResultSchema.safeParse({
      employees: [validEmployeeItem(), validEmployeeItemMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty employees array", () => {
    const r = listEmployeesResultSchema.safeParse({
      employees: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = listEmployeesResultSchema.safeParse({ employees: [] });
    expect(r.success).toBe(false);
  });

  it("rejects non-number total", () => {
    const r = listEmployeesResultSchema.safeParse({
      employees: [],
      total: "not-a-number",
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number page", () => {
    const r = listEmployeesResultSchema.safeParse({
      employees: [],
      total: 0,
      page: "first",
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid employee items in the array", () => {
    const r = listEmployeesResultSchema.safeParse({
      employees: [{ employee_uuid: 123 }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative total", () => {
    const r = listEmployeesResultSchema.safeParse({
      employees: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createEmployeeResultSchema
// ---------------------------------------------------------------------------

describe("createEmployeeResultSchema", () => {
  it("accepts a valid create result", () => {
    const r = createEmployeeResultSchema.safeParse({
      employee_uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing employee_uuid", () => {
    const r = createEmployeeResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string employee_uuid", () => {
    const r = createEmployeeResultSchema.safeParse({
      employee_uuid: 123,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateEmployeeResultSchema
// ---------------------------------------------------------------------------

describe("updateEmployeeResultSchema", () => {
  it("accepts a valid update result", () => {
    const r = updateEmployeeResultSchema.safeParse({
      employee_uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing employee_uuid", () => {
    const r = updateEmployeeResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string employee_uuid", () => {
    const r = updateEmployeeResultSchema.safeParse({
      employee_uuid: 123,
    });
    expect(r.success).toBe(false);
  });
});
