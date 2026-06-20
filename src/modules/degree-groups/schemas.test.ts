import { describe, it, expect } from "vitest";
import {
  degreeGroupItemSchema,
  listDegreeGroupsResultSchema,
  mutationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// degreeGroupItemSchema
// ---------------------------------------------------------------------------
describe("degreeGroupItemSchema", () => {
  const valid = {
    degree_group_uuid: "dg-uuid-1",
    degree_group_name_en: "Science",
    degree_group_name_ar: "علوم",
    degree_group_sort_order: 1,
    skip_major: 0,
    degree_group_created_at: new Date("2026-01-01"),
    degree_group_updated_at: new Date("2026-06-01"),
  };

  it("accepts a valid degree group item", () => {
    expect(degreeGroupItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      degreeGroupItemSchema.safeParse({
        ...valid,
        degree_group_name_ar: null,
        degree_group_sort_order: null,
        skip_major: null,
        degree_group_created_at: null,
        degree_group_updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing degree_group_uuid", () => {
    const { degree_group_uuid: _, ...rest } = valid;
    expect(degreeGroupItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing degree_group_name_en", () => {
    const { degree_group_name_en: _, ...rest } = valid;
    expect(degreeGroupItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string degree_group_uuid", () => {
    expect(
      degreeGroupItemSchema.safeParse({ ...valid, degree_group_uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-integer sort_order", () => {
    expect(
      degreeGroupItemSchema.safeParse({ ...valid, degree_group_sort_order: "first" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listDegreeGroupsResultSchema
// ---------------------------------------------------------------------------
describe("listDegreeGroupsResultSchema", () => {
  const valid = () => ({
    degreeGroups: [
      {
        degree_group_uuid: "dg-uuid-1",
        degree_group_name_en: "Science",
        degree_group_name_ar: null,
        degree_group_sort_order: null,
        skip_major: null,
        degree_group_created_at: null,
        degree_group_updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  it("accepts a valid paginated result", () => {
    expect(listDegreeGroupsResultSchema.safeParse(valid()).success).toBe(true);
  });

  it("accepts empty degreeGroups array", () => {
    expect(
      listDegreeGroupsResultSchema.safeParse({ ...valid(), degreeGroups: [] }).success,
    ).toBe(true);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid();
    expect(listDegreeGroupsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(
      listDegreeGroupsResultSchema.safeParse({ ...valid(), limit: 200 }).success,
    ).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(
      listDegreeGroupsResultSchema.safeParse({ ...valid(), limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects non-array degreeGroups", () => {
    expect(
      listDegreeGroupsResultSchema.safeParse({ ...valid(), degreeGroups: "not-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// mutationResultSchema
// ---------------------------------------------------------------------------
describe("mutationResultSchema", () => {
  it("accepts success operation", () => {
    expect(
      mutationResultSchema.safeParse({ operation: "success", message: "Done" }).success,
    ).toBe(true);
  });

  it("accepts error operation", () => {
    expect(
      mutationResultSchema.safeParse({ operation: "error", message: "Failed" }).success,
    ).toBe(true);
  });

  it("rejects unknown operation", () => {
    expect(
      mutationResultSchema.safeParse({ operation: "unknown", message: "?" }).success,
    ).toBe(false);
  });

  it("rejects missing operation", () => {
    expect(mutationResultSchema.safeParse({ message: "Done" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(mutationResultSchema.safeParse({ operation: "success" }).success).toBe(false);
  });

  it("rejects non-string message", () => {
    expect(
      mutationResultSchema.safeParse({ operation: "error", message: 42 }).success,
    ).toBe(false);
  });
});
