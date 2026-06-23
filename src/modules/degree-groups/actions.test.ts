import { describe, it, expect } from "vitest";
import {
  degreeGroupItemSchema,
  listDegreeGroupsResultSchema,
  mutationResultSchema,
  listDegreeGroupsSchema,
  getDegreeGroupSchema,
  createDegreeGroupSchema,
  updateDegreeGroupSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("createDegreeGroupSchema", () => {
  it("accepts valid create params with required fields only", () => {
    const result = createDegreeGroupSchema.safeParse({ nameEn: "Science" });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = createDegreeGroupSchema.safeParse({
      nameEn: "Science",
      nameAr: "علوم",
      sortOrder: 1,
      skipMajor: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty English name", () => {
    const result = createDegreeGroupSchema.safeParse({ nameEn: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing English name", () => {
    const result = createDegreeGroupSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-integer sortOrder", () => {
    const result = createDegreeGroupSchema.safeParse({
      nameEn: "Science",
      sortOrder: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateDegreeGroupSchema", () => {
  it("accepts valid update params with all fields", () => {
    const result = updateDegreeGroupSchema.safeParse({
      uuid: "degree_group_abc",
      nameEn: "Science Updated",
      nameAr: "علوم محدثة",
      sortOrder: 2,
      skipMajor: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with only uuid", () => {
    const result = updateDegreeGroupSchema.safeParse({
      uuid: "degree_group_abc",
    });
    expect(result.success).toBe(true);
  });

  it("accepts single field update", () => {
    const result = updateDegreeGroupSchema.safeParse({
      uuid: "degree_group_abc",
      nameEn: "Updated Name",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = updateDegreeGroupSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateDegreeGroupSchema.safeParse({ nameEn: "Science" });
    expect(result.success).toBe(false);
  });
});

describe("listDegreeGroupsSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listDegreeGroupsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts name filter", () => {
    const result = listDegreeGroupsSchema.safeParse({ nameFilter: "Science" });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listDegreeGroupsSchema.safeParse({
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listDegreeGroupsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDegreeGroupsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listDegreeGroupsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("getDegreeGroupSchema", () => {
  it("accepts valid UUID", () => {
    const result = getDegreeGroupSchema.safeParse({
      uuid: "degree_group_abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getDegreeGroupSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getDegreeGroupSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("degreeGroupItemSchema (output)", () => {
  const validItem = {
    degree_group_uuid: "degree_group_uuid_123",
    degree_group_name_en: "Science",
    degree_group_name_ar: "علوم",
    degree_group_sort_order: 1,
    skip_major: 0,
    degree_group_created_at: new Date("2024-01-01"),
    degree_group_updated_at: new Date("2024-06-01"),
  };

  it("accepts a fully populated degree group item", () => {
    const result = degreeGroupItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const result = degreeGroupItemSchema.safeParse({
      ...validItem,
      degree_group_name_ar: null,
      degree_group_sort_order: null,
      skip_major: null,
      degree_group_created_at: null,
      degree_group_updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = degreeGroupItemSchema.safeParse({
      degree_group_uuid: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects string where number expected for sort_order", () => {
    const result = degreeGroupItemSchema.safeParse({
      ...validItem,
      degree_group_sort_order: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("listDegreeGroupsResultSchema (output)", () => {
  const validResult = {
    degreeGroups: [
      {
        degree_group_uuid: "uuid_1",
        degree_group_name_en: "Science",
        degree_group_name_ar: null,
        degree_group_sort_order: 1,
        skip_major: null,
        degree_group_created_at: null,
        degree_group_updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid list result", () => {
    const result = listDegreeGroupsResultSchema.safeParse(validResult);
    expect(result.success).toBe(true);
  });

  it("accepts an empty list", () => {
    const result = listDegreeGroupsResultSchema.safeParse({
      degreeGroups: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listDegreeGroupsResultSchema.safeParse({
      ...validResult,
      total: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive page", () => {
    const result = listDegreeGroupsResultSchema.safeParse({
      ...validResult,
      page: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listDegreeGroupsResultSchema.safeParse({
      ...validResult,
      limit: 200,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    const result = listDegreeGroupsResultSchema.safeParse({
      ...validResult,
      totalPages: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("mutationResultSchema (output)", () => {
  it("accepts success operation", () => {
    const result = mutationResultSchema.safeParse({
      operation: "success",
      message: "Degree group created successfully",
    });
    expect(result.success).toBe(true);
  });

  it("accepts error operation", () => {
    const result = mutationResultSchema.safeParse({
      operation: "error",
      message: "Something went wrong",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown operation value", () => {
    const result = mutationResultSchema.safeParse({
      operation: "invalid",
      message: "test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const result = mutationResultSchema.safeParse({
      operation: "success",
    });
    expect(result.success).toBe(false);
  });
});
