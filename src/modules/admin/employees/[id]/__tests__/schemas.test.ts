import { describe, it, expect } from "vitest";
import {
  getEmployeeByIdSchema,
  employeeDetailSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Input schema tests: getEmployeeByIdSchema
// ---------------------------------------------------------------------------

describe("getEmployeeByIdSchema", () => {
  it("accepts a valid uuid", () => {
    const result = getEmployeeByIdSchema.parse({ uuid: "emp-uuid-123" });
    expect(result.uuid).toBe("emp-uuid-123");
  });

  it("rejects empty string uuid", () => {
    expect(() => getEmployeeByIdSchema.parse({ uuid: "" })).toThrow();
  });

  it("rejects missing uuid", () => {
    expect(() => getEmployeeByIdSchema.parse({})).toThrow();
  });

  it("rejects non-string uuid", () => {
    expect(() => getEmployeeByIdSchema.parse({ uuid: 123 })).toThrow();
  });

  it("strips extra fields via .parse", () => {
    const result = getEmployeeByIdSchema.parse({
      uuid: "emp-uuid-1",
      extraField: "should be stripped",
    });
    expect(result).toEqual({ uuid: "emp-uuid-1" });
    expect((result as any).extraField).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: employeeDetailSchema
// ---------------------------------------------------------------------------

describe("employeeDetailSchema", () => {
  const validDetail = {
    employee_uuid: "emp-uuid-1",
    employee_name: "Ahmed Al-Mutawa",
    employee_email: "ahmed@example.com",
    employee_phone: "+965 5555 1234",
    employee_salary: 1500,
    employee_status: 10,
    employee_created_at: new Date("2024-01-01"),
    employee_updated_at: new Date("2026-06-01"),
    designation_uuid: "des-uuid-1",
    department_uuid: "dep-uuid-1",
    designation_name_en: "Software Engineer",
    department_name_en: "Engineering",
  };

  it("accepts a valid employee detail", () => {
    const result = employeeDetailSchema.parse(validDetail);
    expect(result.employee_uuid).toBe("emp-uuid-1");
    expect(result.employee_name).toBe("Ahmed Al-Mutawa");
    expect(result.employee_email).toBe("ahmed@example.com");
    expect(result.employee_status).toBe(10);
    expect(result.designation_name_en).toBe("Software Engineer");
    expect(result.department_name_en).toBe("Engineering");
  });

  it("accepts nullable fields as null", () => {
    const result = employeeDetailSchema.parse({
      ...validDetail,
      employee_phone: null,
      employee_salary: null,
      designation_uuid: null,
      department_uuid: null,
      designation_name_en: null,
      department_name_en: null,
    });
    expect(result.employee_phone).toBeNull();
    expect(result.employee_salary).toBeNull();
    expect(result.designation_uuid).toBeNull();
    expect(result.department_uuid).toBeNull();
    expect(result.designation_name_en).toBeNull();
    expect(result.department_name_en).toBeNull();
  });

  it("rejects missing required employee_uuid", () => {
    const { employee_uuid, ...rest } = validDetail;
    expect(() => employeeDetailSchema.parse(rest)).toThrow();
  });

  it("rejects missing required employee_name", () => {
    const { employee_name, ...rest } = validDetail;
    expect(() => employeeDetailSchema.parse(rest)).toThrow();
  });

  it("rejects missing required employee_email", () => {
    const { employee_email, ...rest } = validDetail;
    expect(() => employeeDetailSchema.parse(rest)).toThrow();
  });

  it("rejects missing required employee_status", () => {
    const { employee_status, ...rest } = validDetail;
    expect(() => employeeDetailSchema.parse(rest)).toThrow();
  });

  it("rejects non-integer employee_status", () => {
    expect(() =>
      employeeDetailSchema.parse({ ...validDetail, employee_status: 10.5 }),
    ).toThrow();
  });

  it("rejects wrong type for employee_name (number instead of string)", () => {
    expect(() =>
      employeeDetailSchema.parse({ ...validDetail, employee_name: 123 }),
    ).toThrow();
  });

  it("rejects wrong type for employee_email (number instead of string)", () => {
    expect(() =>
      employeeDetailSchema.parse({ ...validDetail, employee_email: true }),
    ).toThrow();
  });

  it("accepts employee_phone as string", () => {
    const result = employeeDetailSchema.parse(validDetail);
    expect(typeof result.employee_phone).toBe("string");
  });

  it("accepts employee_salary as number", () => {
    const result = employeeDetailSchema.parse(validDetail);
    expect(typeof result.employee_salary).toBe("number");
  });

  it("accepts dates as Date instances", () => {
    const result = employeeDetailSchema.parse(validDetail);
    expect(result.employee_created_at).toBeInstanceOf(Date);
    expect(result.employee_updated_at).toBeInstanceOf(Date);
  });

  it("rejects non-date for employee_created_at", () => {
    expect(() =>
      employeeDetailSchema.parse({
        ...validDetail,
        employee_created_at: "not-a-date",
      }),
    ).toThrow();
  });

  it("strips extra fields", () => {
    const result = employeeDetailSchema.parse({
      ...validDetail,
      extra_field: "should be stripped",
    });
    expect(result.employee_uuid).toBe("emp-uuid-1");
    expect((result as any).extra_field).toBeUndefined();
  });
});
