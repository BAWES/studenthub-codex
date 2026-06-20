import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Schemas imported from schemas.ts for contract testing
// ---------------------------------------------------------------------------

import {
  listDepartmentsSchema,
  getDepartmentSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
  departmentListResponseSchema,
  departmentDetailSchema,
  departmentActionResponseSchema,
  type DepartmentRow,
  type DepartmentDetail,
  type DepartmentActionResponse,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema: listDepartmentsSchema
// ---------------------------------------------------------------------------

describe("listDepartmentsSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listDepartmentsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.q).toBeUndefined();
    }
  });

  it("accepts explicit page and limit", () => {
    const result = listDepartmentsSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts a search query (q)", () => {
    const result = listDepartmentsSchema.safeParse({ q: "IT" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("IT");
    }
  });

  it("rejects page less than 1", () => {
    expect(listDepartmentsSchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listDepartmentsSchema.safeParse({ page: "-1" }).success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    expect(listDepartmentsSchema.safeParse({ limit: "101" }).success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    expect(listDepartmentsSchema.safeParse({ limit: "0" }).success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listDepartmentsSchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });
});

// ---------------------------------------------------------------------------
// Input schema: getDepartmentSchema
// ---------------------------------------------------------------------------

describe("getDepartmentSchema", () => {
  it("accepts a valid departmentUuid", () => {
    const result = getDepartmentSchema.safeParse({ departmentUuid: "dept-001-uuid" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.departmentUuid).toBe("dept-001-uuid");
    }
  });

  it("rejects empty departmentUuid", () => {
    expect(getDepartmentSchema.safeParse({ departmentUuid: "" }).success).toBe(false);
  });

  it("rejects missing departmentUuid", () => {
    expect(getDepartmentSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: createDepartmentSchema
// ---------------------------------------------------------------------------

describe("createDepartmentSchema", () => {
  it("accepts valid input with English and Arabic names", () => {
    const result = createDepartmentSchema.safeParse({
      departmentNameEn: "Information Technology",
      departmentNameAr: "تقنية المعلومات",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.departmentNameEn).toBe("Information Technology");
      expect(result.data.departmentNameAr).toBe("تقنية المعلومات");
    }
  });

  it("accepts input without Arabic name", () => {
    const result = createDepartmentSchema.safeParse({
      departmentNameEn: "Human Resources",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.departmentNameEn).toBe("Human Resources");
      expect(result.data.departmentNameAr).toBeUndefined();
    }
  });

  it("rejects empty English name", () => {
    expect(
      createDepartmentSchema.safeParse({ departmentNameEn: "" }).success,
    ).toBe(false);
  });

  it("rejects missing English name", () => {
    expect(createDepartmentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects name exceeding 255 characters", () => {
    const longName = "A".repeat(256);
    expect(
      createDepartmentSchema.safeParse({ departmentNameEn: longName }).success,
    ).toBe(false);
  });

  it("accepts name at exactly 255 characters", () => {
    const exactName = "A".repeat(255);
    const result = createDepartmentSchema.safeParse({ departmentNameEn: exactName });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Input schema: updateDepartmentSchema
// ---------------------------------------------------------------------------

describe("updateDepartmentSchema", () => {
  it("accepts full update with all fields", () => {
    const result = updateDepartmentSchema.safeParse({
      departmentUuid: "dept-001",
      departmentNameEn: "IT",
      departmentNameAr: "تقنية المعلومات",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.departmentUuid).toBe("dept-001");
      expect(result.data.departmentNameEn).toBe("IT");
      expect(result.data.departmentNameAr).toBe("تقنية المعلومات");
    }
  });

  it("accepts update with only UUID and one field", () => {
    const result = updateDepartmentSchema.safeParse({
      departmentUuid: "dept-001",
      departmentNameEn: "Updated Name",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.departmentNameAr).toBeUndefined();
    }
  });

  it("rejects missing departmentUuid", () => {
    expect(
      updateDepartmentSchema.safeParse({ departmentNameEn: "Test" }).success,
    ).toBe(false);
  });

  it("rejects empty departmentUuid", () => {
    expect(
      updateDepartmentSchema.safeParse({
        departmentUuid: "",
        departmentNameEn: "Test",
      }).success,
    ).toBe(false);
  });

  it("accepts empty optional Arabic name update", () => {
    const result = updateDepartmentSchema.safeParse({
      departmentUuid: "dept-001",
      departmentNameAr: "قسم جديد",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Input schema: deleteDepartmentSchema
// ---------------------------------------------------------------------------

describe("deleteDepartmentSchema", () => {
  it("accepts valid departmentUuid", () => {
    const result = deleteDepartmentSchema.safeParse({ departmentUuid: "dept-001" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.departmentUuid).toBe("dept-001");
    }
  });

  it("rejects empty departmentUuid", () => {
    expect(deleteDepartmentSchema.safeParse({ departmentUuid: "" }).success).toBe(false);
  });

  it("rejects missing departmentUuid", () => {
    expect(deleteDepartmentSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: departmentListResponseSchema
// ---------------------------------------------------------------------------

const validDepartmentRow: DepartmentRow = {
  department_uuid: "dept-123",
  department_name_en: "Information Technology",
  department_name_ar: "تقنية المعلومات",
  employee_count: 5,
  created_at: "2024-01-15T10:00:00.000Z",
  updated_at: "2024-06-01T12:00:00.000Z",
};

describe("departmentListResponseSchema", () => {
  it("accepts a valid list response", () => {
    const result = departmentListResponseSchema.safeParse({
      items: [validDepartmentRow],
      total: 1,
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
    }
  });

  it("accepts an empty list response", () => {
    const result = departmentListResponseSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(0);
      expect(result.data.total).toBe(0);
    }
  });

  it("rejects negative total", () => {
    expect(
      departmentListResponseSchema.safeParse({
        items: [],
        total: -1,
        page: 1,
        limit: 20,
      }).success,
    ).toBe(false);
  });

  it("rejects missing departments array", () => {
    expect(
      departmentListResponseSchema.safeParse({
        total: 0,
        page: 1,
        limit: 20,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      departmentListResponseSchema.safeParse({
        items: [],
        total: 0,
        page: 0,
        limit: 20,
      }).success,
    ).toBe(false);
  });

  it("rejects zero limit", () => {
    expect(
      departmentListResponseSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-array departments", () => {
    expect(
      departmentListResponseSchema.safeParse({
        departments: "not-an-array",
        total: 0,
        page: 1,
        limit: 20,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: departmentRowSchema (tested via DepartmentRow type)
// ---------------------------------------------------------------------------

describe("DepartmentRow type shape (/admin/departments)", () => {
  it("conforms to expected structure", () => {
    const row: DepartmentRow = {
      department_uuid: "dept-001",
      department_name_en: "HR",
      department_name_ar: null,
      employee_count: 0,
      created_at: null,
      updated_at: null,
    };
    expect(row.department_uuid).toBe("dept-001");
    expect(row.department_name_en).toBe("HR");
    expect(row.department_name_ar).toBeNull();
    expect(row.employee_count).toBe(0);
  });

  it("supports Arabic name as string", () => {
    const row: DepartmentRow = {
      department_uuid: "dept-001",
      department_name_en: "HR",
      department_name_ar: "الموارد البشرية",
      employee_count: 3,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: null,
    };
    expect(row.department_name_ar).toBe("الموارد البشرية");
    expect(row.employee_count).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Output schema: departmentDetailSchema
// ---------------------------------------------------------------------------

describe("departmentDetailSchema", () => {
  it("accepts a department detail with all fields", () => {
    const result = departmentDetailSchema.safeParse({
      department: {
        department_uuid: "dept-001",
        department_name_en: "IT",
        department_name_ar: null,
        department_created_at: "2024-01-01T00:00:00.000Z",
        department_updated_at: "2024-06-01T00:00:00.000Z",
      },
      employee_count: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.department?.department_name_en).toBe("IT");
    }
  });

  it("accepts department as null (not found)", () => {
    const result = departmentDetailSchema.safeParse({
      department: null,
      employee_count: 0,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.department).toBeNull();
      expect(result.data.employee_count).toBe(0);
    }
  });

  it("rejects negative employee_count", () => {
    expect(
      departmentDetailSchema.safeParse({
        department: null,
        employee_count: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing employee_count", () => {
    expect(
      departmentDetailSchema.safeParse({
        department: null,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: departmentActionResponseSchema
// ---------------------------------------------------------------------------

describe("departmentActionResponseSchema", () => {
  it("accepts a success response with data", () => {
    const result = departmentActionResponseSchema.safeParse({
      operation: "success",
      message: "Department created",
      data: validDepartmentRow,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a success response without data", () => {
    const result = departmentActionResponseSchema.safeParse({
      operation: "success",
      message: "Department deleted",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an error response", () => {
    const result = departmentActionResponseSchema.safeParse({
      operation: "error",
      message: "Department not found",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid operation value", () => {
    expect(
      departmentActionResponseSchema.safeParse({
        operation: "invalid",
        message: "Something",
      }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      departmentActionResponseSchema.safeParse({
        operation: "error",
        message: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      departmentActionResponseSchema.safeParse({
        operation: "success",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape verification — TypeScript compile-time check
// ---------------------------------------------------------------------------

describe("DepartmentDetail type shape", () => {
  it("conforms to expected structure", () => {
    const found: DepartmentDetail = {
      department: {
        department_uuid: "dept-001",
        department_name_en: "IT",
        department_name_ar: null,
        department_created_at: null,
        department_updated_at: null,
      },
      employee_count: 3,
    };
    expect(found.department?.department_uuid).toBe("dept-001");
    expect(found.employee_count).toBe(3);
  });

  it("supports null department (not found)", () => {
    const notFound: DepartmentDetail = {
      department: null,
      employee_count: 0,
    };
    expect(notFound.department).toBeNull();
  });
});

describe("DepartmentActionResponse type shape", () => {
  it("supports success with data", () => {
    const response: DepartmentActionResponse = {
      operation: "success",
      message: "Created",
      data: validDepartmentRow,
    };
    expect(response.operation).toBe("success");
    expect(response.data?.department_uuid).toBe("dept-123");
  });

  it("supports error without data", () => {
    const response: DepartmentActionResponse = {
      operation: "error",
      message: "Something went wrong",
    };
    expect(response.operation).toBe("error");
    expect(response.data).toBeUndefined();
  });
});
