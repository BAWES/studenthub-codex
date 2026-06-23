import { describe, it, expect } from "vitest";
import {
  designationItemSchema,
  listDesignationsResultSchema,
  listDesignationsSchema,
  getDesignationSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema validation tests for Designation server actions
//
// Tests avoid mocking "use server" dependencies (prisma, session) by
// testing Zod schemas — the pure validation layer — in isolation.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// listDesignationsSchema tests
// ---------------------------------------------------------------------------

describe("listDesignationsSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listDesignationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.nameFilter).toBeUndefined();
    }
  });

  it("accepts explicit page and limit", () => {
    const result = listDesignationsSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts nameFilter", () => {
    const result = listDesignationsSchema.safeParse({ nameFilter: "Manager" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBe("Manager");
    }
  });

  it("rejects page less than 1", () => {
    const result = listDesignationsSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDesignationsSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = listDesignationsSchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    const result = listDesignationsSchema.safeParse({ limit: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listDesignationsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listDesignationsSchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });
});

// ---------------------------------------------------------------------------
// getDesignationSchema tests
// ---------------------------------------------------------------------------

describe("getDesignationSchema", () => {
  it("accepts valid UUID string", () => {
    const result = getDesignationSchema.safeParse({
      uuid: "desig-001-uuid-string",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("desig-001-uuid-string");
    }
  });

  it("rejects empty UUID string", () => {
    const result = getDesignationSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getDesignationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("designationItemSchema", () => {
  it("accepts a valid designation item", () => {
    const result = designationItemSchema.safeParse({
      designation_uuid: "abc-123",
      designation_name_en: "Manager",
      designation_name_ar: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts Arabic name as string", () => {
    const result = designationItemSchema.safeParse({
      designation_uuid: "abc-123",
      designation_name_en: "Manager",
      designation_name_ar: "مدير",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.designation_name_ar).toBe("مدير");
    }
  });

  it("rejects missing designation_uuid", () => {
    const result = designationItemSchema.safeParse({
      designation_name_en: "Manager",
      designation_name_ar: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing designation_name_en", () => {
    const result = designationItemSchema.safeParse({
      designation_uuid: "abc-123",
      designation_name_ar: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty uuid", () => {
    const result = designationItemSchema.safeParse({
      designation_uuid: "",
      designation_name_en: "Manager",
      designation_name_ar: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name_en", () => {
    const result = designationItemSchema.safeParse({
      designation_uuid: "abc-123",
      designation_name_en: "",
      designation_name_ar: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("listDesignationsResultSchema", () => {
  it("accepts a valid list result", () => {
    const result = listDesignationsResultSchema.safeParse({
      designations: [
        {
          designation_uuid: "abc-123",
          designation_name_en: "Manager",
          designation_name_ar: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty designation list", () => {
    const result = listDesignationsResultSchema.safeParse({
      designations: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listDesignationsResultSchema.safeParse({
      designations: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing designations field", () => {
    const result = listDesignationsResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDesignationsResultSchema.safeParse({
      designations: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});
