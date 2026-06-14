import { describe, it, expect } from "vitest";
import {
  degreeItemSchema,
  listDegreesResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// degreeItemSchema
// ---------------------------------------------------------------------------
describe("degreeItemSchema", () => {
  const valid = {
    degree_uuid: "deg-uuid-1",
    degree_group_uuid: "dg-uuid-1",
    degree_name_en: "Computer Science",
    degree_name_ar: "علوم الحاسب",
    degree_sort_order: 1,
    degree_created_at: new Date("2026-01-01"),
    degree_updated_at: new Date("2026-06-01"),
  };

  it("accepts a valid degree item", () => {
    expect(degreeItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      degreeItemSchema.safeParse({
        ...valid,
        degree_group_uuid: null,
        degree_name_ar: null,
        degree_sort_order: null,
        degree_created_at: null,
        degree_updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects empty degree_uuid", () => {
    expect(
      degreeItemSchema.safeParse({ ...valid, degree_uuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing degree_uuid", () => {
    const { degree_uuid: _, ...rest } = valid;
    expect(degreeItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty degree_name_en", () => {
    expect(
      degreeItemSchema.safeParse({ ...valid, degree_name_en: "" }).success,
    ).toBe(false);
  });

  it("rejects non-number degree_sort_order", () => {
    expect(
      degreeItemSchema.safeParse({ ...valid, degree_sort_order: "abc" }).success,
    ).toBe(false);
  });

  it("rejects non-date degree_created_at", () => {
    expect(
      degreeItemSchema.safeParse({ ...valid, degree_created_at: "2026-01-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listDegreesResultSchema
// ---------------------------------------------------------------------------
describe("listDegreesResultSchema", () => {
  const valid = () => ({
    degrees: [
      {
        degree_uuid: "deg-uuid-1",
        degree_group_uuid: null,
        degree_name_en: "CS",
        degree_name_ar: null,
        degree_sort_order: null,
        degree_created_at: null,
        degree_updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  it("accepts a valid paginated result", () => {
    expect(listDegreesResultSchema.safeParse(valid()).success).toBe(true);
  });

  it("accepts empty degrees array", () => {
    expect(
      listDegreesResultSchema.safeParse({ ...valid(), degrees: [] }).success,
    ).toBe(true);
  });

  it("rejects missing degrees", () => {
    const { degrees: _, ...rest } = valid();
    expect(listDegreesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listDegreesResultSchema.safeParse({ ...valid(), total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listDegreesResultSchema.safeParse({ ...valid(), page: 0 }).success,
    ).toBe(false);
  });

  it("rejects non-array degrees", () => {
    expect(
      listDegreesResultSchema.safeParse({ ...valid(), degrees: "not-array" }).success,
    ).toBe(false);
  });
});
