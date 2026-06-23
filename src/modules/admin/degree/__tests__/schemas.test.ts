import { describe, it, expect } from "vitest";
import {
  degreeListItemSchema,
  listDegreeResultSchema,
  degreeIdResultSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Pure logic: degree schema validation
// ---------------------------------------------------------------------------

const validDegree = {
  degree_uuid: "550e8400-e29b-41d4-a716-446655440000",
  degree_name_en: "Bachelor of Science",
  degree_name_ar: "بكالوريوس علوم",
  degree_sort_order: 1,
  degree_group_uuid: "660e8400-e29b-41d4-a716-446655440001",
  group_name_en: "Science",
};

describe("degreeListItemSchema", () => {
  it("accepts a valid degree with all fields", () => {
    const result = degreeListItemSchema.safeParse(validDegree);
    expect(result.success).toBe(true);
  });

  it("accepts a degree with minimal fields (nulls for optionals)", () => {
    const minimal = {
      degree_uuid: "550e8400-e29b-41d4-a716-446655440002",
      degree_name_en: "Bachelor",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_group_uuid: null,
      group_name_en: null,
    };
    const result = degreeListItemSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = degreeListItemSchema.safeParse({
      degree_name_en: "Bachelor",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string degree_name_en", () => {
    const result = degreeListItemSchema.safeParse({
      ...validDegree,
      degree_name_en: 123,
    });
    expect(result.success).toBe(false);
  });
});

describe("listDegreeResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const result = listDegreeResultSchema.safeParse({
      records: [validDegree],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty records array", () => {
    const result = listDegreeResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listDegreeResultSchema.safeParse({
      records: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("degreeIdResultSchema", () => {
  it("accepts a valid uuid result", () => {
    const result = degreeIdResultSchema.safeParse({
      degree_uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.degree_uuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    }
  });

  it("rejects non-uuid string", () => {
    const result = degreeIdResultSchema.safeParse({
      degree_uuid: "not-a-uuid-at-all",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing degree_uuid", () => {
    const result = degreeIdResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
