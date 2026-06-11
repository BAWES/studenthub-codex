import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  listAreasSchema,
  getAreaSchema,
  listAreasResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure logic: schema validation tests (no DB dependency)
// ---------------------------------------------------------------------------

describe("listAreasSchema", () => {
  it("accepts empty params", () => {
    const result = listAreasSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listAreasSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    const result = listAreasSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("accepts name filter", () => {
    const result = listAreasSchema.safeParse({ nameFilter: "Kuwait" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBe("Kuwait");
    }
  });

  it("accepts country ID filter", () => {
    const result = listAreasSchema.safeParse({ countryId: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.countryId).toBe(1);
    }
  });

  it("rejects negative page", () => {
    const result = listAreasSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listAreasSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listAreasSchema.safeParse({ page: 1.5 });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listAreasSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });
});

describe("getAreaSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getAreaSchema.safeParse({ areaUuid: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.areaUuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    }
  });

  it("rejects empty string", () => {
    const result = getAreaSchema.safeParse({ areaUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects non-string", () => {
    const result = getAreaSchema.safeParse({ areaUuid: 123 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation: listAreasResultSchema
// ---------------------------------------------------------------------------

describe("listAreasResultSchema", () => {
  it("accepts a valid result with one area", () => {
    const result = listAreasResultSchema.safeParse({
      areas: [
        {
          area_uuid: "550e8400-e29b-41d4-a716-446655440000",
          country_id: 1,
          area_name_en: "Kuwait City",
          area_name_ar: "مدينة الكويت",
          area_latitude: 29.3759,
          area_longitude: 47.9774,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a result with nullable fields", () => {
    const result = listAreasResultSchema.safeParse({
      areas: [
        {
          area_uuid: "550e8400-e29b-41d4-a716-446655440000",
          country_id: 1,
          area_name_en: "Test Area",
          area_name_ar: null,
          area_latitude: null,
          area_longitude: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty areas array", () => {
    const result = listAreasResultSchema.safeParse({
      areas: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields in area item", () => {
    const result = listAreasResultSchema.safeParse({
      areas: [
        {
          area_uuid: "550e8400-e29b-41d4-a716-446655440000",
          // country_id missing
          area_name_en: "Kuwait City",
          area_name_ar: null,
          area_latitude: null,
          area_longitude: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative total", () => {
    const result = listAreasResultSchema.safeParse({
      areas: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listAreasResultSchema.safeParse({
      areas: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    const result = listAreasResultSchema.safeParse({
      areas: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer country_id", () => {
    const result = listAreasResultSchema.safeParse({
      areas: [
        {
          area_uuid: "550e8400-e29b-41d4-a716-446655440000",
          country_id: 1.5,
          area_name_en: "Test",
          area_name_ar: null,
          area_latitude: null,
          area_longitude: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(false);
  });
});
