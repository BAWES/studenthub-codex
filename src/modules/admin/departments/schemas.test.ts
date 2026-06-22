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
    const r = listDepartmentsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts explicit values", () => {
    const r = listDepartmentsSchema.safeParse({ page: 2, limit: 10, q: "eng" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.q).toBe("eng");
    }
  });

  it("rejects negative page", () => {
    expect(listDepartmentsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listDepartmentsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getDepartmentSchema
// ---------------------------------------------------------------------------
describe("getDepartmentSchema", () => {
  it("accepts valid department UUID", () => {
    const r = getDepartmentSchema.safeParse({ departmentUuid: "abc-123" });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getDepartmentSchema.safeParse({ departmentUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getDepartmentSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createDepartmentSchema
// ---------------------------------------------------------------------------
describe("createDepartmentSchema", () => {
  const valid = { departmentNameEn: "Engineering" };

  it("accepts valid input", () => {
    expect(createDepartmentSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts with Arabic name", () => {
    const r = createDepartmentSchema.safeParse({ departmentNameEn: "Engineering", departmentNameAr: "هندسة" });
    expect(r.success).toBe(true);
  });

  it("rejects missing English name", () => {
    expect(createDepartmentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty English name", () => {
    expect(createDepartmentSchema.safeParse({ departmentNameEn: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateDepartmentSchema
// ---------------------------------------------------------------------------
describe("updateDepartmentSchema", () => {
  const valid = { departmentUuid: "abc-123", departmentNameEn: "Engineering" };

  it("accepts valid input", () => {
    expect(updateDepartmentSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional fields", () => {
    const r = updateDepartmentSchema.safeParse({ departmentUuid: "abc-123" });
    expect(r.success).toBe(true);
  });

  it("rejects missing departmentUuid", () => {
    expect(updateDepartmentSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteDepartmentSchema
// ---------------------------------------------------------------------------
describe("deleteDepartmentSchema", () => {
  it("accepts valid UUID", () => {
    expect(deleteDepartmentSchema.safeParse({ departmentUuid: "abc-123" }).success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(deleteDepartmentSchema.safeParse({ departmentUuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// departmentListResponseSchema
// ---------------------------------------------------------------------------
describe("departmentListResponseSchema", () => {
  const valid = {
    items: [
      {
        department_uuid: "abc-123",
        department_name_en: "Engineering",
        department_name_ar: null,
        employee_count: 10,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
  };

  it("accepts valid response", () => {
    expect(departmentListResponseSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(departmentListResponseSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(departmentListResponseSchema.safeParse({ ...valid, total: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// departmentDetailSchema
// ---------------------------------------------------------------------------
describe("departmentDetailSchema", () => {
  it("accepts valid department detail", () => {
    const r = departmentDetailSchema.safeParse({
      department: {
        department_uuid: "abc-123",
        department_name_en: "Engineering",
        department_name_ar: null,
        department_created_at: "2026-01-01T00:00:00Z",
        department_updated_at: null,
      },
      employee_count: 10,
    });
    expect(r.success).toBe(true);
  });

  it("accepts null department", () => {
    const r = departmentDetailSchema.safeParse({ department: null, employee_count: 0 });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// departmentActionResponseSchema
// ---------------------------------------------------------------------------
describe("departmentActionResponseSchema", () => {
  it("accepts success response", () => {
    const r = departmentActionResponseSchema.safeParse({
      operation: "success",
      message: "Department created",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error response", () => {
    const r = departmentActionResponseSchema.safeParse({
      operation: "error",
      message: "Department not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(
      departmentActionResponseSchema.safeParse({
        operation: "invalid",
        message: "test",
      }).success
    ).toBe(false);
  });

  it("accepts response with optional data", () => {
    const r = departmentActionResponseSchema.safeParse({
      operation: "success",
      message: "Created",
      data: {
        department_uuid: "abc-123",
        department_name_en: "Engineering",
        department_name_ar: null,
        employee_count: 1,
        created_at: null,
        updated_at: null,
      },
    });
    expect(r.success).toBe(true);
  });
});