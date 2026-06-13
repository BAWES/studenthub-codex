import { describe, it, expect } from "vitest";
import {
  listAreasSchema,
  getAreaSchema,
  areaItemSchema,
  listAreasResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validAreaItem = () => ({
  area_uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  country_id: 1,
  area_name_en: "Kuwait City",
  area_name_ar: "مدينة الكويت",
  area_latitude: 29.3759,
  area_longitude: 47.9774,
});

const validAreaItemNullCoords = () => ({
  area_uuid: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  country_id: 2,
  area_name_en: "Al Ahmadi",
  area_name_ar: "الأحمدي",
  area_latitude: null,
  area_longitude: null,
});

// ---------------------------------------------------------------------------
// Input: listAreasSchema
// ---------------------------------------------------------------------------

describe("listAreasSchema (input)", () => {
  it("accepts empty params", () => {
    const r = listAreasSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts valid name filter and country ID", () => {
    const r = listAreasSchema.safeParse({
      nameFilter: "Kuwait",
      countryId: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts valid page and limit", () => {
    const r = listAreasSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
  });

  it("rejects negative page", () => {
    const r = listAreasSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listAreasSchema.safeParse({ limit: 101 });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listAreasSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer countryId", () => {
    const r = listAreasSchema.safeParse({ countryId: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects zero countryId", () => {
    const r = listAreasSchema.safeParse({ countryId: 0 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input: getAreaSchema
// ---------------------------------------------------------------------------

describe("getAreaSchema (input)", () => {
  it("accepts a valid area UUID", () => {
    const r = getAreaSchema.safeParse({
      areaUuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty areaUuid", () => {
    const r = getAreaSchema.safeParse({ areaUuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing areaUuid", () => {
    const r = getAreaSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// areaItemSchema (output)
// ---------------------------------------------------------------------------

describe("areaItemSchema", () => {
  it("accepts a full area item with coordinates", () => {
    const r = areaItemSchema.safeParse(validAreaItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal area item (nullable coords set to null)", () => {
    const r = areaItemSchema.safeParse(validAreaItemNullCoords());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = areaItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = areaItemSchema.safeParse({
      ...validAreaItem(),
      country_id: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing area_name_en", () => {
    const r = areaItemSchema.safeParse({
      ...validAreaItem(),
      area_name_en: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing area_name_ar", () => {
    const r = areaItemSchema.safeParse({
      ...validAreaItem(),
      area_name_ar: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number latitude", () => {
    const r = areaItemSchema.safeParse({
      ...validAreaItem(),
      area_latitude: "bad",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listAreasResultSchema (output)
// ---------------------------------------------------------------------------

describe("listAreasResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listAreasResultSchema.safeParse({
      areas: [validAreaItem(), validAreaItemNullCoords()],
      total: 15,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty areas array", () => {
    const r = listAreasResultSchema.safeParse({
      areas: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listAreasResultSchema.safeParse({
      areas: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listAreasResultSchema.safeParse({
      areas: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listAreasResultSchema.safeParse({ areas: [] });
    expect(r.success).toBe(false);
  });

  it("rejects non-array areas", () => {
    const r = listAreasResultSchema.safeParse({
      areas: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});
