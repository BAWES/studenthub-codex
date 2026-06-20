import { describe, it, expect } from "vitest";
import {
  listDegreesSchema,
  createDegreeSchema,
  updateDegreeSchema,
  deleteDegreeSchema,
  degreeItemSchema,
  listDegreesResultSchema,
  degreeActionResponseSchema,
} from "./schemas";
import type { DegreeItem, ListDegreesResult } from "./schemas";

// ---------------------------------------------------------------------------
// listDegreesSchema
// ---------------------------------------------------------------------------
describe("listDegreesSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listDegreesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(listDegreesSchema.safeParse({ page: 2, limit: 100 }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listDegreesSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 200", () => {
    expect(listDegreesSchema.safeParse({ limit: 201 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listDegreesSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createDegreeSchema
// ---------------------------------------------------------------------------
describe("createDegreeSchema", () => {
  it("accepts valid input with required only", () => {
    expect(createDegreeSchema.safeParse({ degree_name_en: "Bachelor of Science" }).success).toBe(true);
  });

  it("accepts input with all fields", () => {
    expect(createDegreeSchema.safeParse({
      degree_name_en: "Bachelor of Science",
      degree_name_ar: "بكالوريوس العلوم",
      degree_sort_order: 1,
      degree_group_uuid: "uuid-123",
    }).success).toBe(true);
  });

  it("rejects missing degree_name_en", () => {
    expect(createDegreeSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty degree_name_en", () => {
    expect(createDegreeSchema.safeParse({ degree_name_en: "" }).success).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    expect(createDegreeSchema.safeParse({ degree_name_en: "x".repeat(256) }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateDegreeSchema
// ---------------------------------------------------------------------------
describe("updateDegreeSchema", () => {
  it("accepts valid update", () => {
    expect(updateDegreeSchema.safeParse({
      degree_uuid: "abc-123",
      degree_name_en: "Updated Degree",
    }).success).toBe(true);
  });

  it("rejects missing degree_uuid", () => {
    expect(updateDegreeSchema.safeParse({ degree_name_en: "Test" }).success).toBe(false);
  });

  it("rejects empty degree_name_en", () => {
    expect(updateDegreeSchema.safeParse({ degree_uuid: "abc", degree_name_en: "" }).success).toBe(false);
  });

  it("accepts nullable optional fields", () => {
    expect(updateDegreeSchema.safeParse({
      degree_uuid: "abc",
      degree_name_en: "Test",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_group_uuid: null,
    }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// deleteDegreeSchema
// ---------------------------------------------------------------------------
describe("deleteDegreeSchema", () => {
  it("accepts valid UUID", () => {
    expect(deleteDegreeSchema.safeParse({ degree_uuid: "abc-123" }).success).toBe(true);
  });

  it("rejects missing UUID", () => {
    expect(deleteDegreeSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// degreeItemSchema
// ---------------------------------------------------------------------------
describe("degreeItemSchema (output validation)", () => {
  it("accepts a valid degree item", () => {
    expect(degreeItemSchema.safeParse({
      degree_uuid: "uuid-1",
      degree_group_uuid: "group-uuid-1",
      degree_name_en: "Bachelor of Science",
      degree_name_ar: null,
      degree_sort_order: 1,
      degree_created_at: new Date("2026-01-01"),
      degree_updated_at: null,
    }).success).toBe(true);
  });

  it("rejects missing degree_name_en", () => {
    expect(degreeItemSchema.safeParse({
      degree_uuid: "uuid-1",
      degree_name_en: undefined,
    }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listDegreesResultSchema
// ---------------------------------------------------------------------------
describe("listDegreesResultSchema", () => {
  it("accepts empty results", () => {
    expect(listDegreesResultSchema.safeParse({
      degrees: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    }).success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(listDegreesResultSchema.safeParse({
      degrees: [],
      total: -1,
      page: 1,
      limit: 50,
      totalPages: 0,
    }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// degreeActionResponseSchema
// ---------------------------------------------------------------------------
describe("degreeActionResponseSchema", () => {
  it("accepts success response", () => {
    expect(degreeActionResponseSchema.safeParse({
      operation: "success",
      message: "Degree created",
    }).success).toBe(true);
  });

  it("rejects empty message", () => {
    expect(degreeActionResponseSchema.safeParse({
      operation: "error",
      message: "",
    }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type checks
// ---------------------------------------------------------------------------
describe("DegreeItem type", () => {
  it("has required shape", () => {
    const i: DegreeItem = {
      degree_uuid: "uuid-1",
      degree_group_uuid: null,
      degree_name_en: "BSc",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_created_at: new Date(),
      degree_updated_at: null,
    };
    expect(i.degree_name_en).toBe("BSc");
  });

  it("accepts all-null optionals", () => {
    const i: DegreeItem = {
      degree_uuid: "uuid-2",
      degree_group_uuid: null,
      degree_name_en: "BA",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_created_at: null,
      degree_updated_at: null,
    };
    expect(i.degree_name_en).toBe("BA");
    expect(i.degree_created_at).toBeNull();
  });
});

describe("ListDegreesResult type", () => {
  it("has correct shape", () => {
    const r: ListDegreesResult = {
      degrees: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(r.degrees).toHaveLength(0);
    expect(r.totalPages).toBe(0);
  });
});
