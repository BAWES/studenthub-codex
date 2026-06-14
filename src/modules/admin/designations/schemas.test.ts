import { describe, it, expect } from "vitest";
import {
  designationRowSchema,
  listDesignationsResultSchema,
  actionResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("designationRowSchema", () => {
  const validRow = {
    designation_uuid: "des-001",
    designation_name_en: "Software Engineer",
    designation_name_ar: "مهندس برمجيات",
    designation_created_at: new Date("2026-01-01T00:00:00"),
    designation_updated_at: new Date("2026-06-01T12:00:00"),
  };

  it("accepts a valid designation row", () => {
    expect(designationRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null for all nullable fields", () => {
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

  it("rejects wrong type for designation_uuid", () => {
    expect(
      designationRowSchema.safeParse({
        ...validRow,
        designation_uuid: 123,
      }).success,
    ).toBe(false);
  });

  it("rejects ISO string for designation_created_at (z.date(), not z.coerce.date())", () => {
    expect(
      designationRowSchema.safeParse({
        ...validRow,
        designation_created_at: "2026-01-01T00:00:00",
      }).success,
    ).toBe(false);
  });
});

describe("listDesignationsResultSchema", () => {
  const validResult = {
    designations: [
      {
        designation_uuid: "des-001",
        designation_name_en: "Software Engineer",
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

  it("accepts a valid paginated result", () => {
    expect(listDesignationsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty designations array", () => {
    expect(
      listDesignationsResultSchema.safeParse({
        ...validResult,
        designations: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listDesignationsResultSchema.safeParse({
        ...validResult,
        total: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listDesignationsResultSchema.safeParse({
        ...validResult,
        page: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects string instead of number for page", () => {
    expect(
      listDesignationsResultSchema.safeParse({
        ...validResult,
        page: "1",
      }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listDesignationsResultSchema.safeParse({
        ...validResult,
        totalPages: -1,
      }).success,
    ).toBe(false);
  });
});

describe("actionResponseSchema", () => {
  it("accepts success operation", () => {
    const r = actionResponseSchema.safeParse({
      operation: "success",
      message: "Designation created successfully",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error operation", () => {
    const r = actionResponseSchema.safeParse({
      operation: "error",
      message: "Designation already exists",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing message", () => {
    expect(
      actionResponseSchema.safeParse({ operation: "success" }).success,
    ).toBe(false);
  });

  it("rejects invalid operation value", () => {
    expect(
      actionResponseSchema.safeParse({
        operation: "invalid",
        message: "blah",
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for message", () => {
    expect(
      actionResponseSchema.safeParse({
        operation: "success",
        message: 123,
      }).success,
    ).toBe(false);
  });
});
