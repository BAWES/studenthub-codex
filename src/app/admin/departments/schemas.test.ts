import { describe, it, expect } from "vitest";
import {
  listDepartmentsSchema,
  getDepartmentSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
  departmentListResponseSchema,
  departmentDetailSchema,
  departmentActionResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listDepartmentsSchema
// ---------------------------------------------------------------------------
describe("listDepartmentsSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listDepartmentsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(listDepartmentsSchema.safeParse({ page: 2, limit: 50, q: "engineering" }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listDepartmentsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listDepartmentsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listDepartmentsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getDepartmentSchema
// ---------------------------------------------------------------------------
describe("getDepartmentSchema", () => {
  it("accepts valid input", () => {
    expect(getDepartmentSchema.safeParse({ departmentUuid: "dept-123" }).success).toBe(true);
  });

  it("rejects missing departmentUuid", () => {
    expect(getDepartmentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty departmentUuid", () => {
    expect(getDepartmentSchema.safeParse({ departmentUuid: "" }).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(getDepartmentSchema.safeParse({ departmentUuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createDepartmentSchema
// ---------------------------------------------------------------------------
describe("createDepartmentSchema", () => {
  it("accepts valid input", () => {
    expect(createDepartmentSchema.safeParse({ departmentNameEn: "Engineering" }).success).toBe(true);
  });

  it("accepts with Arabic name", () => {
    expect(
      createDepartmentSchema.safeParse({ departmentNameEn: "Engineering", departmentNameAr: "هندسة" }).success,
    ).toBe(true);
  });

  it("rejects missing departmentNameEn", () => {
    expect(createDepartmentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty departmentNameEn", () => {
    expect(createDepartmentSchema.safeParse({ departmentNameEn: "" }).success).toBe(false);
  });

  it("rejects departmentNameEn exceeding 255 chars", () => {
    expect(createDepartmentSchema.safeParse({ departmentNameEn: "x".repeat(256) }).success).toBe(false);
  });

  it("rejects departmentNameAr exceeding 255 chars", () => {
    expect(
      createDepartmentSchema.safeParse({
        departmentNameEn: "Eng",
        departmentNameAr: "x".repeat(256),
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateDepartmentSchema
// ---------------------------------------------------------------------------
describe("updateDepartmentSchema", () => {
  it("accepts minimal input", () => {
    expect(updateDepartmentSchema.safeParse({ departmentUuid: "dept-1" }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      updateDepartmentSchema.safeParse({
        departmentUuid: "dept-1",
        departmentNameEn: "Engineering",
        departmentNameAr: "هندسة",
      }).success,
    ).toBe(true);
  });

  it("rejects missing departmentUuid", () => {
    expect(updateDepartmentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty departmentUuid", () => {
    expect(updateDepartmentSchema.safeParse({ departmentUuid: "" }).success).toBe(false);
  });

  it("rejects departmentNameEn exceeding 255 chars", () => {
    expect(
      updateDepartmentSchema.safeParse({ departmentUuid: "d-1", departmentNameEn: "x".repeat(256) }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteDepartmentSchema
// ---------------------------------------------------------------------------
describe("deleteDepartmentSchema", () => {
  it("accepts valid input", () => {
    expect(deleteDepartmentSchema.safeParse({ departmentUuid: "dept-1" }).success).toBe(true);
  });

  it("rejects missing departmentUuid", () => {
    expect(deleteDepartmentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty departmentUuid", () => {
    expect(deleteDepartmentSchema.safeParse({ departmentUuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// departmentListResponseSchema (paginated)
// ---------------------------------------------------------------------------
describe("departmentListResponseSchema", () => {
  const validResponse = {
    items: [
      {
        department_uuid: "dept-1",
        department_name_en: "Engineering",
        department_name_ar: null,
        employee_count: 10,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
  };

  it("accepts a valid response", () => {
    expect(departmentListResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it("accepts empty departments array", () => {
    expect(
      departmentListResponseSchema.safeParse({ ...validResponse, items: [], total: 0 }).success,
    ).toBe(true);
  });

  it("accepts null nullable fields in department row", () => {
    expect(
      departmentListResponseSchema.safeParse(validResponse).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResponse;
    expect(departmentListResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(departmentListResponseSchema.safeParse({ ...validResponse, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(departmentListResponseSchema.safeParse({ ...validResponse, page: 0 }).success).toBe(false);
  });

  it("rejects empty department name", () => {
    expect(
      departmentListResponseSchema.safeParse({
        ...validResponse,
        items: [{ department_uuid: "d-1", department_name_en: "", department_name_ar: null, employee_count: 0, created_at: null, updated_at: null }],
      }).success,
    ).toBe(false);
  });

  it("rejects negative employee_count", () => {
    expect(
      departmentListResponseSchema.safeParse({
        ...validResponse,
        items: [{ department_uuid: "d-1", department_name_en: "Eng", department_name_ar: null, employee_count: -1, created_at: null, updated_at: null }],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// departmentDetailSchema
// ---------------------------------------------------------------------------
describe("departmentDetailSchema", () => {
  const validDetail = {
    department: {
      department_uuid: "dept-1",
      department_name_en: "Engineering",
      department_name_ar: null,
      department_created_at: null,
      department_updated_at: null,
    },
    employee_count: 10,
  };

  it("accepts a valid detail", () => {
    expect(departmentDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null department", () => {
    expect(departmentDetailSchema.safeParse({ ...validDetail, department: null }).success).toBe(true);
  });

  it("rejects missing employee_count", () => {
    const { employee_count: _, ...rest } = validDetail;
    expect(departmentDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative employee_count", () => {
    expect(departmentDetailSchema.safeParse({ ...validDetail, employee_count: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// departmentActionResponseSchema
// ---------------------------------------------------------------------------
describe("departmentActionResponseSchema", () => {
  const validSuccess = { operation: "success" as const, message: "Department created" };
  const validError = { operation: "error" as const, message: "Not found" };

  it("accepts success response", () => {
    expect(departmentActionResponseSchema.safeParse(validSuccess).success).toBe(true);
  });

  it("accepts error response", () => {
    expect(departmentActionResponseSchema.safeParse(validError).success).toBe(true);
  });

  it("accepts response with optional data", () => {
    expect(
      departmentActionResponseSchema.safeParse({
        ...validSuccess,
        data: {
          department_uuid: "dept-1",
          department_name_en: "Engineering",
          department_name_ar: null,
          employee_count: 5,
          created_at: null,
          updated_at: null,
        },
      }).success,
    ).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      departmentActionResponseSchema.safeParse({ operation: "invalid", message: "Nope" }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(departmentActionResponseSchema.safeParse({ operation: "success" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(departmentActionResponseSchema.safeParse({ operation: "success", message: "" }).success).toBe(false);
  });
});
