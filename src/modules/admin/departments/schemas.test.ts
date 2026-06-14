import { describe, it, expect } from "vitest";
import {
  departmentListResponseSchema,
  departmentDetailSchema,
  departmentActionResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// departmentListResponseSchema
// ---------------------------------------------------------------------------
describe("departmentListResponseSchema", () => {
  const validDepartment = {
    department_uuid: "d47a2e10-9b8f-4c3d-a1e2-f5a6b7c8d9e0",
    department_name_en: "Engineering",
    department_name_ar: "الهندسة",
    employee_count: 12,
    created_at: "2026-06-14T10:00:00.000Z",
    updated_at: "2026-06-14T12:00:00.000Z",
  };

  const validResponse = {
    departments: [validDepartment],
    total: 1,
    page: 1,
    limit: 20,
  };

  it("accepts a valid list response with one department", () => {
    expect(departmentListResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it("accepts an empty departments array", () => {
    expect(
      departmentListResponseSchema.safeParse({ ...validResponse, departments: [], total: 0 }).success,
    ).toBe(true);
  });

  it("accepts multiple departments", () => {
    const dept2 = { ...validDepartment, department_uuid: "e5b3f2d1-0c9e-4d7a-b6c3-2a1b0d9e8f7c", department_name_en: "Design" };
    expect(
      departmentListResponseSchema.safeParse({ ...validResponse, departments: [validDepartment, dept2], total: 2 }).success,
    ).toBe(true);
  });

  it("accepts null arabic name", () => {
    const deptNoAr = { ...validDepartment, department_name_ar: null };
    expect(
      departmentListResponseSchema.safeParse({ ...validResponse, departments: [deptNoAr] }).success,
    ).toBe(true);
  });

  it("accepts null timestamps", () => {
    const deptNullDates = { ...validDepartment, created_at: null, updated_at: null };
    expect(
      departmentListResponseSchema.safeParse({ ...validResponse, departments: [deptNullDates] }).success,
    ).toBe(true);
  });

  it("accepts zero employee count", () => {
    const deptZero = { ...validDepartment, employee_count: 0 };
    expect(
      departmentListResponseSchema.safeParse({ ...validResponse, departments: [deptZero] }).success,
    ).toBe(true);
  });

  it("rejects missing departments field", () => {
    const { departments: _, ...rest } = validResponse;
    expect(departmentListResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array departments", () => {
    expect(departmentListResponseSchema.safeParse({ ...validResponse, departments: "not-array" }).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validResponse;
    expect(departmentListResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(departmentListResponseSchema.safeParse({ ...validResponse, total: -1 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(departmentListResponseSchema.safeParse({ ...validResponse, page: 0 }).success).toBe(false);
  });

  it("rejects negative limit", () => {
    expect(departmentListResponseSchema.safeParse({ ...validResponse, limit: -5 }).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validResponse;
    expect(departmentListResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = validResponse;
    expect(departmentListResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty department uuid", () => {
    expect(
      departmentListResponseSchema.safeParse({
        ...validResponse,
        departments: [{ ...validDepartment, department_uuid: "" }],
      }).success,
    ).toBe(false);
  });

  it("rejects empty english name", () => {
    expect(
      departmentListResponseSchema.safeParse({
        ...validResponse,
        departments: [{ ...validDepartment, department_name_en: "" }],
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer employee_count", () => {
    expect(
      departmentListResponseSchema.safeParse({
        ...validResponse,
        departments: [{ ...validDepartment, employee_count: 12.5 }],
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer total", () => {
    expect(departmentListResponseSchema.safeParse({ ...validResponse, total: 1.5 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// departmentDetailSchema
// ---------------------------------------------------------------------------
describe("departmentDetailSchema", () => {
  const validDepartmentDetail = {
    department: {
      department_uuid: "d47a2e10-9b8f-4c3d-a1e2-f5a6b7c8d9e0",
      department_name_en: "Engineering",
      department_name_ar: "الهندسة",
      department_created_at: "2026-06-14T10:00:00.000Z",
      department_updated_at: "2026-06-14T12:00:00.000Z",
    },
    employee_count: 12,
  };

  it("accepts a valid department detail", () => {
    expect(departmentDetailSchema.safeParse(validDepartmentDetail).success).toBe(true);
  });

  it("accepts null department (not found case)", () => {
    expect(departmentDetailSchema.safeParse({ department: null, employee_count: 0 }).success).toBe(true);
  });

  it("accepts null arabic name in department object", () => {
    expect(
      departmentDetailSchema.safeParse({
        ...validDepartmentDetail,
        department: { ...validDepartmentDetail.department, department_name_ar: null },
      }).success,
    ).toBe(true);
  });

  it("accepts null timestamps in department object", () => {
    const deptNullDates = {
      ...validDepartmentDetail.department,
      department_created_at: null,
      department_updated_at: null,
    };
    expect(
      departmentDetailSchema.safeParse({ ...validDepartmentDetail, department: deptNullDates }).success,
    ).toBe(true);
  });

  it("accepts zero employee count", () => {
    expect(departmentDetailSchema.safeParse({ ...validDepartmentDetail, employee_count: 0 }).success).toBe(true);
  });

  it("rejects missing employee_count", () => {
    const { employee_count: _, ...rest } = validDepartmentDetail;
    expect(departmentDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative employee_count", () => {
    expect(departmentDetailSchema.safeParse({ ...validDepartmentDetail, employee_count: -1 }).success).toBe(false);
  });

  it("rejects missing department field", () => {
    const { department: _, ...rest } = validDepartmentDetail;
    expect(departmentDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty english name in department object", () => {
    expect(
      departmentDetailSchema.safeParse({
        ...validDepartmentDetail,
        department: { ...validDepartmentDetail.department, department_name_en: "" },
      }).success,
    ).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(
      departmentDetailSchema.safeParse({
        ...validDepartmentDetail,
        department: { ...validDepartmentDetail.department, department_uuid: "" },
      }).success,
    ).toBe(false);
  });

  it("rejects non-object for department field", () => {
    expect(departmentDetailSchema.safeParse({ department: "invalid", employee_count: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// departmentActionResponseSchema
// ---------------------------------------------------------------------------
describe("departmentActionResponseSchema", () => {
  const validDepartment = {
    department_uuid: "d47a2e10-9b8f-4c3d-a1e2-f5a6b7c8d9e0",
    department_name_en: "Engineering",
    department_name_ar: "الهندسة",
    employee_count: 12,
    created_at: "2026-06-14T10:00:00.000Z",
    updated_at: "2026-06-14T12:00:00.000Z",
  };

  it("accepts success response with data", () => {
    expect(
      departmentActionResponseSchema.safeParse({
        operation: "success",
        message: "Department created successfully",
        data: validDepartment,
      }).success,
    ).toBe(true);
  });

  it("accepts error response without data", () => {
    expect(
      departmentActionResponseSchema.safeParse({
        operation: "error",
        message: "Department not found",
      }).success,
    ).toBe(true);
  });

  it("accepts success response without data", () => {
    expect(
      departmentActionResponseSchema.safeParse({
        operation: "success",
        message: "Department deleted",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid operation value", () => {
    expect(
      departmentActionResponseSchema.safeParse({
        operation: "invalid",
        message: "Something went wrong",
      }).success,
    ).toBe(false);
  });

  it("rejects missing operation", () => {
    expect(
      departmentActionResponseSchema.safeParse({ message: "Test" }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      departmentActionResponseSchema.safeParse({ operation: "success" }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      departmentActionResponseSchema.safeParse({ operation: "error", message: "" }).success,
    ).toBe(false);
  });

  it("rejects non-string message", () => {
    expect(
      departmentActionResponseSchema.safeParse({ operation: "success", message: 123 }).success,
    ).toBe(false);
  });

  it("accepts success response with partial data (optional fields nullable)", () => {
    const deptPartial = { ...validDepartment, department_name_ar: null, created_at: null, updated_at: null };
    expect(
      departmentActionResponseSchema.safeParse({
        operation: "success",
        message: "Department updated",
        data: deptPartial,
      }).success,
    ).toBe(true);
  });
});
