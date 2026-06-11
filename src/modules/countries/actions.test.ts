import { describe, it, expect } from "vitest";
import {
  countryItemSchema,
  listCountriesResultSchema,
  listCountriesSchema,
  getCountrySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema validation tests for CountryController server actions
//
// Tests avoid mocking "use server" dependencies (prisma, session) by
// testing Zod schemas — the pure validation layer — in isolation.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// listCountriesSchema tests
// ---------------------------------------------------------------------------

describe("listCountriesSchema", () => {
  it("accepts empty params (no filter)", () => {
    const result = listCountriesSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a name filter string", () => {
    const result = listCountriesSchema.safeParse({ nameFilter: "kuwait" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBe("kuwait");
    }
  });

  it("accepts an empty string name filter", () => {
    const result = listCountriesSchema.safeParse({ nameFilter: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBe("");
    }
  });

  it("accepts pagination params", () => {
    const result = listCountriesSchema.safeParse({
      nameFilter: "test",
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects non-string nameFilter", () => {
    const result = listCountriesSchema.safeParse({ nameFilter: 123 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listCountriesSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCountriesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listCountriesSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listCountriesSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCountrySchema tests
// ---------------------------------------------------------------------------

describe("getCountrySchema", () => {
  it("accepts a valid positive integer id", () => {
    const result = getCountrySchema.safeParse({ id: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(1);
    }
  });

  it("rejects zero id", () => {
    const result = getCountrySchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = getCountrySchema.safeParse({ id: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const result = getCountrySchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects float id", () => {
    const result = getCountrySchema.safeParse({ id: 3.14 });
    expect(result.success).toBe(false);
  });

  it("rejects missing id", () => {
    const result = getCountrySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: countryItemSchema tests
// ---------------------------------------------------------------------------

describe("countryItemSchema", () => {
  it("accepts a valid country item with all fields", () => {
    const result = countryItemSchema.safeParse({
      country_id: 1,
      country_name_en: "Kuwait",
      country_name_ar: "الكويت",
      country_nationality_name_en: "Kuwaiti",
      country_nationality_name_ar: "كويتي",
      country_from_google_map: false,
      iso: "KW",
      emoji: "🇰🇼",
      country_code: 965,
      currency_code: "KWD",
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const result = countryItemSchema.safeParse({
      country_id: 2,
      country_name_en: "Unknown",
      country_name_ar: null,
      country_nationality_name_en: "Unknown",
      country_nationality_name_ar: null,
      country_from_google_map: null,
      iso: null,
      emoji: null,
      country_code: null,
      currency_code: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing country_id", () => {
    const result = countryItemSchema.safeParse({
      country_name_en: "Test",
      country_nationality_name_en: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing country_name_en", () => {
    const result = countryItemSchema.safeParse({
      country_id: 1,
      country_nationality_name_en: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing country_nationality_name_en", () => {
    const result = countryItemSchema.safeParse({
      country_id: 1,
      country_name_en: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for country_code", () => {
    const result = countryItemSchema.safeParse({
      country_id: 1,
      country_name_en: "Test",
      country_nationality_name_en: "Test",
      country_name_ar: null,
      country_nationality_name_ar: null,
      country_from_google_map: null,
      iso: null,
      emoji: null,
      country_code: "abc",
      currency_code: null,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: listCountriesResultSchema tests
// ---------------------------------------------------------------------------

describe("listCountriesResultSchema", () => {
  it("accepts a valid list result with one country", () => {
    const result = listCountriesResultSchema.safeParse({
      countries: [
        {
          country_id: 1,
          country_name_en: "Kuwait",
          country_name_ar: "الكويت",
          country_nationality_name_en: "Kuwaiti",
          country_nationality_name_ar: "كويتي",
          country_from_google_map: false,
          iso: "KW",
          emoji: "🇰🇼",
          country_code: 965,
          currency_code: "KWD",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty countries array", () => {
    const result = listCountriesResultSchema.safeParse({
      countries: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing total field", () => {
    const result = listCountriesResultSchema.safeParse({
      countries: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCountriesResultSchema.safeParse({
      countries: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative total", () => {
    const result = listCountriesResultSchema.safeParse({
      countries: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listCountriesResultSchema.safeParse({
      countries: [],
      total: 0,
      page: 1,
      limit: 200,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});
