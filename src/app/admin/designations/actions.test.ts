import { describe, it, expect } from "vitest";
import {
  listDesignationsSchema,
  createDesignationSchema,
  updateDesignationSchema,
  designationRowSchema,
  listDesignationsResultSchema,
  actionResponseSchema,
} from "./schemas";

describe("listDesignationsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listDesignationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(50);
    }
  });

  it("accepts name filter", () => {
    const r = listDesignationsSchema.safeParse({ nameFilter: "Engineer", page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.nameFilter).toBe("Engineer");
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listDesignationsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listDesignationsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

describe("createDesignationSchema", () => {
  it("accepts valid input with both languages", () => {
    const r = createDesignationSchema.safeParse({
      nameEn: "Software Engineer",
      nameAr: "مهندس برمجيات",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.nameEn).toBe("Software Engineer");
      expect(r.data.nameAr).toBe("مهندس برمجيات");
    }
  });

  it("accepts English-only input", () => {
    expect(createDesignationSchema.safeParse({ nameEn: "Manager" }).success).toBe(true);
  });

  it("rejects empty English name", () => {
    expect(createDesignationSchema.safeParse({ nameEn: "" }).success).toBe(false);
  });

  it("rejects missing English name", () => {
    expect(createDesignationSchema.safeParse({ nameAr: "مدير" }).success).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    expect(createDesignationSchema.safeParse({ nameEn: "x".repeat(256) }).success).toBe(false);
  });
});

describe("updateDesignationSchema", () => {
  it("requires uuid", () => {
    expect(updateDesignationSchema.safeParse({}).success).toBe(false);
  });

  it("accepts uuid with optional name fields", () => {
    const r = updateDesignationSchema.safeParse({
      uuid: "550e8400-e29b-41d4-a716-446655440000",
      nameEn: "Updated Name",
    });
    expect(r.success).toBe(true);
  });

  it("accepts uuid with no changes", () => {
    const r = updateDesignationSchema.safeParse({
      uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });
});

describe("designationRowSchema", () => {
  it("accepts valid designation row", () => {
    const r = designationRowSchema.safeParse({
      designation_uuid: "550e8400-e29b-41d4-a716-446655440000",
      designation_name_en: "Engineer",
      designation_name_ar: null,
      designation_created_at: new Date(),
      designation_updated_at: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(
      designationRowSchema.safeParse({
        designation_name_en: "Engineer",
        designation_name_ar: null,
        designation_created_at: null,
        designation_updated_at: null,
      }).success,
    ).toBe(false);
  });
});

describe("listDesignationsResultSchema", () => {
  it("accepts valid result", () => {
    const r = listDesignationsResultSchema.safeParse({
      designations: [
        {
          designation_uuid: "550e8400-e29b-41d4-a716-446655440000",
          designation_name_en: "Engineer",
          designation_name_ar: null,
          designation_created_at: null,
          designation_updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listDesignationsResultSchema.safeParse({
        designations: [],
        total: -1,
        page: 1,
        limit: 50,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });
});

describe("actionResponseSchema", () => {
  it("accepts success response", () => {
    expect(actionResponseSchema.safeParse({ operation: "success", message: "Done" }).success).toBe(
      true,
    );
  });

  it("accepts error response", () => {
    expect(actionResponseSchema.safeParse({ operation: "error", message: "Failed" }).success).toBe(
      true,
    );
  });

  it("rejects unknown operation", () => {
    expect(
      actionResponseSchema.safeParse({ operation: "invalid", message: "Oops" }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(actionResponseSchema.safeParse({ operation: "success" }).success).toBe(false);
  });
});
