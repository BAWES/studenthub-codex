import { describe, it, expect } from "vitest";
import {
  designationRowSchema,
  listDesignationsResultSchema,
  actionResponseSchema,
  listDesignationsSchema,
  createDesignationSchema,
  updateDesignationSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// designationRowSchema
// ---------------------------------------------------------------------------
describe("designationRowSchema", () => {
  const validRow = {
    designation_uuid: "des-123",
    designation_name_en: "Software Engineer",
    designation_name_ar: null,
    designation_created_at: null,
    designation_updated_at: null,
  };

  it("accepts a valid designation row", () => {
    expect(designationRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null nullable fields", () => {
    expect(
      designationRowSchema.safeParse({
        ...validRow,
        designation_name_ar: null,
        designation_created_at: null,
        designation_updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing designation_uuid", () => {
    const { designation_uuid: _, ...rest } = validRow;
    expect(designationRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing designation_name_en", () => {
    const { designation_name_en: _, ...rest } = validRow;
    expect(designationRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for designation_uuid", () => {
    expect(designationRowSchema.safeParse({ ...validRow, designation_uuid: 123 }).success).toBe(false);
  });

  it("rejects wrong type for designation_name_en", () => {
    expect(designationRowSchema.safeParse({ ...validRow, designation_name_en: 456 }).success).toBe(false);
  });

  it("rejects wrong type for designation_name_ar (non-nullable string)", () => {
    expect(designationRowSchema.safeParse({ ...validRow, designation_name_ar: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listDesignationsResultSchema (paginated)
// ---------------------------------------------------------------------------
describe("listDesignationsResultSchema", () => {
  const validResult = {
    designations: [
      {
        designation_uuid: "des-1",
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
  };

  it("accepts a valid result", () => {
    expect(listDesignationsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty designations array", () => {
    expect(
      listDesignationsResultSchema.safeParse({ ...validResult, designations: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing designations", () => {
    const { designations: _, ...rest } = validResult;
    expect(listDesignationsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listDesignationsResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listDesignationsResultSchema.safeParse({ ...validResult, page: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(listDesignationsResultSchema.safeParse({ ...validResult, totalPages: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// actionResponseSchema
// ---------------------------------------------------------------------------
describe("actionResponseSchema", () => {
  it("accepts success response", () => {
    expect(actionResponseSchema.safeParse({ operation: "success", message: "Done" }).success).toBe(true);
  });

  it("accepts error response", () => {
    expect(actionResponseSchema.safeParse({ operation: "error", message: "Failed" }).success).toBe(true);
  });

  it("rejects invalid operation", () => {
    expect(actionResponseSchema.safeParse({ operation: "invalid", message: "Nope" }).success).toBe(false);
  });

  it("rejects missing operation", () => {
    expect(actionResponseSchema.safeParse({ message: "Nope" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(actionResponseSchema.safeParse({ operation: "success" }).success).toBe(false);
  });

  it("accepts empty message", () => {
    expect(actionResponseSchema.safeParse({ operation: "success", message: "" }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listDesignationsSchema
// ---------------------------------------------------------------------------
describe("listDesignationsSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listDesignationsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(listDesignationsSchema.safeParse({ page: 2, limit: 25, nameFilter: "engineer" }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listDesignationsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listDesignationsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listDesignationsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createDesignationSchema
// ---------------------------------------------------------------------------
describe("createDesignationSchema", () => {
  it("accepts valid input", () => {
    expect(createDesignationSchema.safeParse({ nameEn: "Software Engineer" }).success).toBe(true);
  });

  it("accepts with Arabic name", () => {
    expect(createDesignationSchema.safeParse({ nameEn: "Engineer", nameAr: "مهندس" }).success).toBe(true);
  });

  it("rejects missing nameEn", () => {
    expect(createDesignationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty nameEn", () => {
    expect(createDesignationSchema.safeParse({ nameEn: "" }).success).toBe(false);
  });

  it("rejects nameEn exceeding 255 chars", () => {
    expect(createDesignationSchema.safeParse({ nameEn: "x".repeat(256) }).success).toBe(false);
  });

  it("rejects nameAr exceeding 255 chars", () => {
    expect(createDesignationSchema.safeParse({ nameEn: "Eng", nameAr: "x".repeat(256) }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateDesignationSchema
// ---------------------------------------------------------------------------
describe("updateDesignationSchema", () => {
  it("accepts minimal input", () => {
    expect(updateDesignationSchema.safeParse({ uuid: "des-1" }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      updateDesignationSchema.safeParse({ uuid: "des-1", nameEn: "Senior Engineer", nameAr: "مهندس أول" }).success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(updateDesignationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(updateDesignationSchema.safeParse({ uuid: "" }).success).toBe(false);
  });

  it("rejects empty nameEn when provided", () => {
    expect(updateDesignationSchema.safeParse({ uuid: "des-1", nameEn: "" }).success).toBe(false);
  });

  it("rejects nameEn exceeding 255 chars", () => {
    expect(updateDesignationSchema.safeParse({ uuid: "des-1", nameEn: "x".repeat(256) }).success).toBe(false);
  });
});
