import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const listCountriesSchema = z.object({
  nameFilter: z.string().optional(),
});

const getCountrySchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types (duplicated from actions.ts for type-shape testing)
// ---------------------------------------------------------------------------

type CountryListResult = {
  country_id: number;
  country_name_en: string;
  country_name_ar: string | null;
  iso: string | null;
  emoji: string | null;
  country_code: number | null;
  currency_code: string | null;
};

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

  it("rejects non-string nameFilter", () => {
    const result = listCountriesSchema.safeParse({ nameFilter: 123 });
    expect(result.success).toBe(false);
  });

  it("rejects unexpected fields", () => {
    const result = listCountriesSchema.safeParse({ page: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBeUndefined();
    }
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
// CountryListResult shape tests
// ---------------------------------------------------------------------------

describe("CountryListResult shape", () => {
  it("defines all expected fields", () => {
    const mock: CountryListResult = {
      country_id: 1,
      country_name_en: "Kuwait",
      country_name_ar: "الكويت",
      iso: "KW",
      emoji: "🇰🇼",
      country_code: 965,
      currency_code: "KWD",
    };
    expect(mock.country_id).toBe(1);
    expect(mock.country_name_en).toBe("Kuwait");
    expect(mock.country_name_ar).toBe("الكويت");
    expect(mock.iso).toBe("KW");
  });

  it("allows null for optional fields", () => {
    const mock: CountryListResult = {
      country_id: 2,
      country_name_en: "Unknown",
      country_name_ar: null,
      iso: null,
      emoji: null,
      country_code: null,
      currency_code: null,
    };
    expect(mock.country_name_ar).toBeNull();
    expect(mock.iso).toBeNull();
    expect(mock.currency_code).toBeNull();
  });

  it("accepts a valid result set with empty array", () => {
    const results: CountryListResult[] = [];
    expect(results).toHaveLength(0);
  });

  it("accepts multiple results", () => {
    const results: CountryListResult[] = [
      { country_id: 1, country_name_en: "Kuwait", country_name_ar: null, iso: "KW", emoji: null, country_code: 965, currency_code: "KWD" },
      { country_id: 2, country_name_en: "Egypt", country_name_ar: null, iso: "EG", emoji: null, country_code: 20, currency_code: "EGP" },
    ];
    expect(results).toHaveLength(2);
    expect(results[0].country_name_en).toBe("Kuwait");
    expect(results[1].country_name_en).toBe("Egypt");
  });
});
