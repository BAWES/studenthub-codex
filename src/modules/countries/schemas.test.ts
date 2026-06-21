import { describe, it, expect } from "vitest";
import {
  countryItemSchema,
  listCountriesResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// countryItemSchema
// ---------------------------------------------------------------------------
describe("countryItemSchema", () => {
  const valid = {
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
  };

  it("accepts a valid country item", () => {
    expect(countryItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      countryItemSchema.safeParse({
        ...valid,
        country_name_ar: null,
        country_nationality_name_ar: null,
        country_from_google_map: null,
        iso: null,
        emoji: null,
        country_code: null,
        currency_code: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing country_id", () => {
    const { country_id: _, ...rest } = valid;
    expect(countryItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing country_name_en", () => {
    const { country_name_en: _, ...rest } = valid;
    expect(countryItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing country_nationality_name_en", () => {
    const { country_nationality_name_en: _, ...rest } = valid;
    expect(countryItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string iso", () => {
    expect(
      countryItemSchema.safeParse({ ...valid, iso: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-number country_id", () => {
    expect(
      countryItemSchema.safeParse({ ...valid, country_id: "one" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCountriesResultSchema
// ---------------------------------------------------------------------------
describe("listCountriesResultSchema", () => {
  const valid = () => ({
    countries: [
      {
        country_id: 1,
        country_name_en: "Kuwait",
        country_name_ar: null,
        country_nationality_name_en: "Kuwaiti",
        country_nationality_name_ar: null,
        country_from_google_map: null,
        iso: null,
        emoji: null,
        country_code: null,
        currency_code: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  it("accepts a valid paginated result", () => {
    expect(listCountriesResultSchema.safeParse(valid()).success).toBe(true);
  });

  it("accepts empty countries array", () => {
    expect(
      listCountriesResultSchema.safeParse({ ...valid(), countries: [] }).success,
    ).toBe(true);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid();
    expect(listCountriesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listCountriesResultSchema.safeParse({ ...valid(), totalPages: -1 }).success,
    ).toBe(false);
  });
});
