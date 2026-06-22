import { describe, it, expect } from "vitest";
import {
  listDepartmentsSchema,
  getDepartmentSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
  departmentListResponseSchema,
  departmentActionResponseSchema,
} from "./schemas";

describe("admin departments — data contracts", () => {
  it("listDepartmentsSchema defaults page and limit", () => {
    const r = listDepartmentsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listDepartmentsSchema accepts query params", () => {
    const r = listDepartmentsSchema.safeParse({ q: "IT", page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("IT");
    }
  });

  it("getDepartmentSchema requires uuid", () => {
    const r = getDepartmentSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getDepartmentSchema accepts valid uuid", () => {
    const r = getDepartmentSchema.safeParse({ departmentUuid: "dept-uuid-1" });
    expect(r.success).toBe(true);
  });

  it("createDepartmentSchema requires English name", () => {
    const r = createDepartmentSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("createDepartmentSchema accepts valid input", () => {
    const r = createDepartmentSchema.safeParse({
      departmentNameEn: "Engineering",
      departmentNameAr: "الهندسة",
    });
    expect(r.success).toBe(true);
  });

  it("deleteDepartmentSchema requires uuid", () => {
    const r = deleteDepartmentSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("departmentListResponseSchema validates response", () => {
    const r = departmentListResponseSchema.safeParse({
      items: [
        {
          department_uuid: "dept-1",
          department_name_en: "Engineering",
          department_name_ar: "الهندسة",
          employee_count: 12,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    });
    expect(r.success).toBe(true);
  });

  it("departmentActionResponseSchema validates action response", () => {
    const r = departmentActionResponseSchema.safeParse({
      operation: "success",
      message: "Department created",
    });
    expect(r.success).toBe(true);
  });
});
