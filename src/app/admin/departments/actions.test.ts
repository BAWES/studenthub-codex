import { describe, it, expect } from "vitest";
import {
  listDepartmentsSchema,
  getDepartmentSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
} from "./schemas";

describe("listDepartmentsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listDepartmentsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts search query", () => {
    const r = listDepartmentsSchema.safeParse({ q: "Engineering", page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("Engineering");
      expect(r.data.page).toBe(2);
    }
  });

  it("rejects limit over 100", () => {
    expect(listDepartmentsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });
});

describe("getDepartmentSchema", () => {
  it("accepts a valid UUID", () => {
    const r = getDepartmentSchema.safeParse({ departmentUuid: "550e8400-e29b-41d4-a716-446655440000" });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getDepartmentSchema.safeParse({ departmentUuid: "" }).success).toBe(false);
  });
});

describe("createDepartmentSchema", () => {
  it("accepts valid input", () => {
    const r = createDepartmentSchema.safeParse({
      departmentNameEn: "Engineering",
      departmentNameAr: "الهندسة",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.departmentNameEn).toBe("Engineering");
      expect(r.data.departmentNameAr).toBe("الهندسة");
    }
  });

  it("accepts English-only input", () => {
    expect(createDepartmentSchema.safeParse({ departmentNameEn: "HR" }).success).toBe(true);
  });

  it("rejects empty English name", () => {
    expect(createDepartmentSchema.safeParse({ departmentNameEn: "" }).success).toBe(false);
  });

  it("rejects missing English name", () => {
    expect(createDepartmentSchema.safeParse({ departmentNameAr: "الموارد" }).success).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    expect(
      createDepartmentSchema.safeParse({ departmentNameEn: "x".repeat(256) }).success,
    ).toBe(false);
  });
});

describe("updateDepartmentSchema", () => {
  it("requires departmentUuid", () => {
    expect(updateDepartmentSchema.safeParse({}).success).toBe(false);
  });

  it("accepts UUID with optional fields", () => {
    const r = updateDepartmentSchema.safeParse({
      departmentUuid: "550e8400-e29b-41d4-a716-446655440000",
      departmentNameEn: "Engineering (Updated)",
    });
    expect(r.success).toBe(true);
  });

  it("accepts only UUID (no changes)", () => {
    const r = updateDepartmentSchema.safeParse({
      departmentUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });
});

describe("deleteDepartmentSchema", () => {
  it("requires departmentUuid", () => {
    expect(deleteDepartmentSchema.safeParse({}).success).toBe(false);
  });

  it("accepts valid UUID", () => {
    const r = deleteDepartmentSchema.safeParse({ departmentUuid: "550e8400-e29b-41d4-a716-446655440000" });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(deleteDepartmentSchema.safeParse({ departmentUuid: "" }).success).toBe(false);
  });
});
