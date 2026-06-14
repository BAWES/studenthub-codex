import { describe, it, expect } from "vitest";
import {
  nationalityItemSchema,
  listNationalitiesResultSchema,
  listNationalitiesSchema,
  getNationalitySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validNationalityItem = () => ({
  country_id: 1,
  country_nationality_name_en: "Kuwaiti",
  country_nationality_name_ar: "كويتي",
  country_name_en: "Kuwait",
  country_name_ar: "الكويت",
  iso: "KW",
  emoji: "🇰🇼",
});

// ---------------------------------------------------------------------------
// listNationalitiesSchema (input)
// ---------------------------------------------------------------------------

describe("listNationalitiesSchema", () => {
  it("accepts empty params (no filters)", () => {
    const r = listNationalitiesSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts name filter", () => {
    const r = listNationalitiesSchema.safeParse({ nameFilter: "Kuwaiti" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.nameFilter).toBe("Kuwaiti");
    }
  });

  it("accepts pagination params", () => {
    const r = listNationalitiesSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    const r = listNationalitiesSchema.safeParse({ limit: 999 });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listNationalitiesSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative page", () => {
    const r = listNationalitiesSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listNationalitiesSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const r = listNationalitiesSchema.safeParse({ page: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    const r = listNationalitiesSchema.safeParse({ limit: "abc" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getNationalitySchema (input)
// ---------------------------------------------------------------------------

describe("getNationalitySchema", () => {
  it("accepts a valid positive integer id", () => {
    const r = getNationalitySchema.safeParse({ id: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe(42);
    }
  });

  it("rejects zero id", () => {
    const r = getNationalitySchema.safeParse({ id: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative id", () => {
    const r = getNationalitySchema.safeParse({ id: -5 });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const r = getNationalitySchema.safeParse({ id: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects float id", () => {
    const r = getNationalitySchema.safeParse({ id: 1.5 });
    expect(r.success).toBe(false);
  });

  it("rejects missing id", () => {
    const r = getNationalitySchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// nationalityItemSchema (output)
// ---------------------------------------------------------------------------

describe("nationalityItemSchema", () => {
  it("accepts a valid nationality item with all fields", () => {
    const r = nationalityItemSchema.safeParse(validNationalityItem());
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.country_id).toBe(1);
      expect(r.data.country_nationality_name_en).toBe("Kuwaiti");
    }
  });

  it("accepts nullable fields as null", () => {
    const r = nationalityItemSchema.safeParse({
      ...validNationalityItem(),
      country_nationality_name_ar: null,
      country_name_ar: null,
      iso: null,
      emoji: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.country_nationality_name_ar).toBeNull();
      expect(r.data.country_name_ar).toBeNull();
      expect(r.data.iso).toBeNull();
      expect(r.data.emoji).toBeNull();
    }
  });

  it("rejects missing required field (country_id)", () => {
    const { country_id, ...rest } = validNationalityItem();
    const r = nationalityItemSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing required field (country_nationality_name_en)", () => {
    const { country_nationality_name_en, ...rest } = validNationalityItem();
    const r = nationalityItemSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing required field (country_name_en)", () => {
    const { country_name_en, ...rest } = validNationalityItem();
    const r = nationalityItemSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for country_id (string instead of number)", () => {
    const r = nationalityItemSchema.safeParse({
      ...validNationalityItem(),
      country_id: "abc",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for country_nationality_name_en (number instead of string)", () => {
    const r = nationalityItemSchema.safeParse({
      ...validNationalityItem(),
      country_nationality_name_en: 123,
    });
    expect(r.success).toBe(false);
  });

  it("accepts extra fields gracefully (Zod strips unknown by default)", () => {
    const r = nationalityItemSchema.safeParse({
      ...validNationalityItem(),
      extraField: "should be stripped",
    });
    expect(r.success).toBe(true);
  });

  it("rejects undefined input", () => {
    const r = nationalityItemSchema.safeParse(undefined);
    expect(r.success).toBe(false);
  });

  it("rejects null input (not nullable schema)", () => {
    const r = nationalityItemSchema.safeParse(null);
    expect(r.success).toBe(false);
  });

  it("rejects non-object input (string)", () => {
    const r = nationalityItemSchema.safeParse("not an object");
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listNationalitiesResultSchema (output)
// ---------------------------------------------------------------------------

describe("listNationalitiesResultSchema", () => {
  it("accepts a valid paginated result with one item", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [validNationalityItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.nationalities).toHaveLength(1);
      expect(r.data.total).toBe(1);
    }
  });

  it("accepts a valid paginated result with multiple items", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [validNationalityItem(), { ...validNationalityItem(), country_id: 2, country_nationality_name_en: "Egyptian" }],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.nationalities).toHaveLength(2);
    }
  });

  it("accepts empty nationalities array", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.nationalities).toHaveLength(0);
    }
  });

  it("accepts max limit (100)", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("accepts min limit (1)", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: 1,
      limit: 1,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing nationalities field", () => {
    const r = listNationalitiesResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing total field", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing page field", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing limit field", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-array nationalities (null)", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: null,
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-array nationalities (object)", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: {},
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid element in nationalities array", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [{ invalid: "data" }],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative total", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative page", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page (must be positive)", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: 1,
      limit: 200,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer page (float)", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 0,
      page: 1.5,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer total (float)", () => {
    const r = listNationalitiesResultSchema.safeParse({
      nationalities: [],
      total: 1.5,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects undefined input", () => {
    const r = listNationalitiesResultSchema.safeParse(undefined);
    expect(r.success).toBe(false);
  });

  it("rejects null input", () => {
    const r = listNationalitiesResultSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});
