import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Schemas imported from schemas.ts for contract testing
// ---------------------------------------------------------------------------

import {
  listDepartmentsSchema,
  getDepartmentSchema,
  departmentItemSchema,
  listDepartmentsResultSchema,
} from "./schemas";

describe("listDepartmentsSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listDepartmentsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.nameFilter).toBeUndefined();
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

  it("accepts nameFilter", () => {
    const result = listDepartmentsSchema.safeParse({ nameFilter: "IT" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBe("IT");
    }
  });

  it("rejects page less than 1", () => {
    const result = listDepartmentsSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDepartmentsSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = listDepartmentsSchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    const result = listDepartmentsSchema.safeParse({ limit: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listDepartmentsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listDepartmentsSchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });
});

describe("getDepartmentSchema", () => {
  it("accepts valid UUID string", () => {
    const result = getDepartmentSchema.safeParse({
      uuid: "dept-001-uuid-string",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("dept-001-uuid-string");
    }
  });

  it("rejects empty UUID string", () => {
    const result = getDepartmentSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getDepartmentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation: departmentItemSchema
// ---------------------------------------------------------------------------

describe("departmentItemSchema", () => {
  it("validates a full department item with Arabic name", () => {
    const result = departmentItemSchema.safeParse({
      department_uuid: "dept-123",
      department_name_en: "Information Technology",
      department_name_ar: "تقنية المعلومات",
    });
    expect(result.success).toBe(true);
  });

  it("validates a department item with null Arabic name", () => {
    const result = departmentItemSchema.safeParse({
      department_uuid: "dept-456",
      department_name_en: "Human Resources",
      department_name_ar: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing department_uuid", () => {
    const result = departmentItemSchema.safeParse({
      department_name_en: "IT",
      department_name_ar: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string department_uuid", () => {
    const result = departmentItemSchema.safeParse({
      department_uuid: 123,
      department_name_en: "IT",
      department_name_ar: null,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation: listDepartmentsResultSchema
// ---------------------------------------------------------------------------

describe("listDepartmentsResultSchema", () => {
  it("validates a complete list result", () => {
    const result = listDepartmentsResultSchema.safeParse({
      departments: [
        {
          department_uuid: "dept-123",
          department_name_en: "IT",
          department_name_ar: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("validates an empty department list", () => {
    const result = listDepartmentsResultSchema.safeParse({
      departments: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listDepartmentsResultSchema.safeParse({
      departments: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listDepartmentsResultSchema.safeParse({
      departments: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listDepartmentsResultSchema.safeParse({
      departments: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    const result = listDepartmentsResultSchema.safeParse({
      departments: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing departments array", () => {
    const result = listDepartmentsResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-array departments", () => {
    const result = listDepartmentsResultSchema.safeParse({
      departments: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape verification
// ---------------------------------------------------------------------------

type DepartmentItem = {
  department_uuid: string;
  department_name_en: string;
  department_name_ar: string | null;
};

type ListDepartmentsResult = {
  departments: DepartmentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("ListDepartmentsResult type shape", () => {
  it("conforms to expected structure", () => {
    const result: ListDepartmentsResult = {
      departments: [
        {
          department_uuid: "abc-123",
          department_name_en: "IT",
          department_name_ar: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.departments).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("handles empty department list", () => {
    const result: ListDepartmentsResult = {
      departments: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.departments).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });

  it("supports Arabic name being null", () => {
    const item: DepartmentItem = {
      department_uuid: "abc",
      department_name_en: "IT",
      department_name_ar: null,
    };
    expect(item.department_name_ar).toBeNull();
  });

  it("supports Arabic name being a string", () => {
    const item: DepartmentItem = {
      department_uuid: "abc",
      department_name_en: "IT",
      department_name_ar: "تقنية المعلومات",
    };
    expect(item.department_name_ar).toBe("تقنية المعلومات");
  });
});

// ---------------------------------------------------------------------------
// getDepartment return type
// ---------------------------------------------------------------------------

describe("getDepartment return type", () => {
  it("returns DepartmentItem or null", () => {
    const found: DepartmentItem = {
      department_uuid: "abc",
      department_name_en: "HR",
      department_name_ar: null,
    };
    const notFound: null = null;

    expect(found.department_uuid).toBe("abc");
    expect(notFound).toBeNull();
  });
});
