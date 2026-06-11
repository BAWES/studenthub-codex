import { describe, it, expect } from "vitest";
import {
  nationalityItemSchema,
  listNationalitiesResultSchema,
  listNationalitiesSchema,
  getNationalitySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure logic: nationalities schema validation
//
// listNationalities in actions.ts uses schemas from schemas.ts.
// Testing them separately avoids mocking "use server" dependencies.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// listNationalitiesSchema
// ---------------------------------------------------------------------------

describe("listNationalitiesSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listNationalitiesSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts name filter", () => {
    const result = listNationalitiesSchema.safeParse({ nameFilter: "Kuwaiti" });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listNationalitiesSchema.safeParse({
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listNationalitiesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listNationalitiesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listNationalitiesSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getNationalitySchema
// ---------------------------------------------------------------------------

describe("getNationalitySchema", () => {
  it("accepts a valid positive integer id", () => {
    const result = getNationalitySchema.safeParse({ id: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects zero id", () => {
    const result = getNationalitySchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = getNationalitySchema.safeParse({ id: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const result = getNationalitySchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("nationalityItemSchema", () => {
  it("accepts a valid nationality item with all fields", () => {
    const result = nationalityItemSchema.safeParse({
      country_id: 1,
      country_nationality_name_en: "Kuwaiti",
      country_nationality_name_ar: "كويتي",
      country_name_en: "Kuwait",
      country_name_ar: "الكويت",
      iso: "KW",
      emoji: "🇰🇼",
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const result = nationalityItemSchema.safeParse({
      country_id: 2,
      country_nationality_name_en: "Egyptian",
      country_nationality_name_ar: null,
      country_name_en: "Egypt",
      country_name_ar: null,
      iso: null,
      emoji: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing country_id", () => {
    const result = nationalityItemSchema.safeParse({
      country_nationality_name_en: "Test",
      country_nationality_name_ar: null,
      country_name_en: "Test",
      country_name_ar: null,
      iso: null,
      emoji: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing country_nationality_name_en", () => {
    const result = nationalityItemSchema.safeParse({
      country_id: 1,
      country_nationality_name_ar: null,
      country_name_en: "Test",
      country_name_ar: null,
      iso: null,
      emoji: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for country_id", () => {
    const result = nationalityItemSchema.safeParse({
      country_id: "abc",
      country_nationality_name_en: "Test",
      country_nationality_name_ar: null,
      country_name_en: "Test",
      country_name_ar: null,
      iso: null,
      emoji: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("listNationalitiesResultSchema", () => {
  it("accepts a valid list result", () => {
    const result = listNationalitiesResultSchema.safeParse({
      nationalities: [
        {
          country_id: 1,
          country_nationality_name_en: "Kuwaiti",
          country_nationality_name_ar: null,
          country_name_en: "Kuwait",
          country_name_ar: null,
          iso: null,
          emoji: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty nationalities array", () => {
    const result = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing total field", () => {
    const result = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: 1,
      limit: 200,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});
