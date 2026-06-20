import { describe, it, expect } from "vitest";
import {
  majorItemSchema,
  listMajorsResultSchema,
  majorActionResponseSchema,
  majorDetailSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// majorItemSchema
// ---------------------------------------------------------------------------
describe("majorItemSchema", () => {
  const validItem = {
    major_uuid: "abc-123",
    major_name_en: "Computer Science",
    major_name_ar: "علوم الحاسوب",
    data_source: 1,
    major_created_at: new Date("2026-01-01"),
    major_updated_at: new Date("2026-06-01"),
  };

  it("accepts a valid major item", () => {
    expect(majorItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null data_source", () => {
    expect(
      majorItemSchema.safeParse({ ...validItem, data_source: null }).success,
    ).toBe(true);
  });

  it("accepts null dates", () => {
    expect(
      majorItemSchema.safeParse({
        ...validItem,
        major_created_at: null,
        major_updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing major_uuid", () => {
    const { major_uuid: _, ...rest } = validItem;
    expect(majorItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing major_name_en", () => {
    const { major_name_en: _, ...rest } = validItem;
    expect(majorItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty major_name_en", () => {
    expect(
      majorItemSchema.safeParse({ ...validItem, major_name_en: "" }).success,
    ).toBe(false);
  });

  it("rejects empty major_name_ar", () => {
    expect(
      majorItemSchema.safeParse({ ...validItem, major_name_ar: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listMajorsResultSchema
// ---------------------------------------------------------------------------
describe("listMajorsResultSchema", () => {
  const validResult = {
    majors: [
      {
        major_uuid: "abc-123",
        major_name_en: "Computer Science",
        major_name_ar: "علوم الحاسوب",
        data_source: null,
        major_created_at: new Date("2026-01-01"),
        major_updated_at: null,
      },
    ],
    total: 10,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid list majors result", () => {
    expect(listMajorsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty majors array", () => {
    expect(
      listMajorsResultSchema.safeParse({
        ...validResult,
        majors: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing majors", () => {
    const { majors: _, ...rest } = validResult;
    expect(listMajorsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listMajorsResultSchema.safeParse({ ...validResult, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects page 0", () => {
    expect(
      listMajorsResultSchema.safeParse({ ...validResult, page: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listMajorsResultSchema.safeParse({
        ...validResult,
        totalPages: -1,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// majorActionResponseSchema
// ---------------------------------------------------------------------------
describe("majorActionResponseSchema", () => {
  it("accepts a success response", () => {
    expect(
      majorActionResponseSchema.safeParse({
        operation: "success",
        message: "Major created",
      }).success,
    ).toBe(true);
  });

  it("accepts an error response", () => {
    expect(
      majorActionResponseSchema.safeParse({
        operation: "error",
        message: "Major not found",
      }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(
      majorActionResponseSchema.safeParse({ message: "Done" }).success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      majorActionResponseSchema.safeParse({ operation: "success" }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      majorActionResponseSchema.safeParse({
        operation: "success",
        message: "",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// majorDetailSchema
// ---------------------------------------------------------------------------
describe("majorDetailSchema", () => {
  it("accepts a valid major detail", () => {
    expect(
      majorDetailSchema.safeParse({
        major: {
          major_uuid: "abc-123",
          major_name_en: "Computer Science",
          major_name_ar: "علوم الحاسوب",
          data_source: null,
          major_created_at: null,
          major_updated_at: null,
        },
        candidate_count: 42,
      }).success,
    ).toBe(true);
  });

  it("rejects negative candidate_count", () => {
    expect(
      majorDetailSchema.safeParse({
        major: {
          major_uuid: "abc-123",
          major_name_en: "CS",
          major_name_ar: "cs",
          data_source: null,
          major_created_at: null,
          major_updated_at: null,
        },
        candidate_count: -1,
      }).success,
    ).toBe(false);
  });
});
