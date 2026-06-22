import { describe, it, expect } from "vitest";
import {
  departmentItemSchema,
  listDepartmentsResultSchema,
} from "./schemas";

const validDepartmentItem = () => ({
  department_uuid: "d1e2f3a4-b5c6-7890-abcd-ef1234567890",
  department_name_en: "Engineering",
  department_name_ar: "الهندسة",
});

const validDepartmentItemMinimal = () => ({
  department_uuid: "e2f3a4b5-c6d7-8901-bcde-f12345678901",
  department_name_en: "Design",
  department_name_ar: null,
});

// ---------------------------------------------------------------------------
// departmentItemSchema
// ---------------------------------------------------------------------------

describe("departmentItemSchema", () => {
  it("accepts a full department item (with Arabic name)", () => {
    const r = departmentItemSchema.safeParse(validDepartmentItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal department item (nullable Arabic name set to null)", () => {
    const r = departmentItemSchema.safeParse(validDepartmentItemMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = departmentItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = departmentItemSchema.safeParse({
      ...validDepartmentItem(),
      department_uuid: 12345,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing department_uuid", () => {
    const r = departmentItemSchema.safeParse({
      ...validDepartmentItem(),
      department_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing department_name_en", () => {
    const r = departmentItemSchema.safeParse({
      ...validDepartmentItem(),
      department_name_en: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("accepts department_name_ar as empty string", () => {
    const r = departmentItemSchema.safeParse({
      ...validDepartmentItem(),
      department_name_ar: "",
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listDepartmentsResultSchema
// ---------------------------------------------------------------------------

describe("listDepartmentsResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listDepartmentsResultSchema.safeParse({
      departments: [validDepartmentItem(), validDepartmentItemMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty departments array", () => {
    const r = listDepartmentsResultSchema.safeParse({
      departments: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listDepartmentsResultSchema.safeParse({
      departments: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listDepartmentsResultSchema.safeParse({
      departments: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listDepartmentsResultSchema.safeParse({ departments: [] });
    expect(r.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const r = listDepartmentsResultSchema.safeParse({
      departments: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("validates nested department items within paginated result", () => {
    const r = listDepartmentsResultSchema.safeParse({
      departments: [{ ...validDepartmentItem(), department_name_en: 12345 }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });
});
