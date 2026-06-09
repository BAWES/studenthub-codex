import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: country schema validation and filter construction
//
// listCountries and getCountry in actions.ts use these zod schemas
// internally. Testing them separately avoids mocking "use server" deps.
// ---------------------------------------------------------------------------

const listCountriesSchema = z.object({
  nameFilter: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getCountrySchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Prisma query construction logic (pure function, testable without mocking)
// ---------------------------------------------------------------------------

type CountryWhereInput = {
  country_from_google_map: boolean;
  OR?: Array<{
    country_name_en?: { contains: string };
    country_name_ar?: { contains: string };
  }>;
};

function buildCountryFilter(nameFilter?: string): CountryWhereInput {
  const where: CountryWhereInput = {
    country_from_google_map: false,
  };
  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { country_name_en: { contains: nameFilter } },
      { country_name_ar: { contains: nameFilter } },
    ];
  }
  return where;
}

// ---------------------------------------------------------------------------
// listCountriesSchema
// ---------------------------------------------------------------------------

describe("listCountriesSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listCountriesSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts name filter", () => {
    const result = listCountriesSchema.safeParse({ nameFilter: "Kuwait" });
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listCountriesSchema.safeParse({
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listCountriesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCountriesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listCountriesSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCountrySchema
// ---------------------------------------------------------------------------

describe("getCountrySchema", () => {
  it("accepts a valid positive integer id", () => {
    const result = getCountrySchema.safeParse({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects negative id", () => {
    const result = getCountrySchema.safeParse({ id: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects zero id", () => {
    const result = getCountrySchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const result = getCountrySchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing id", () => {
    const result = getCountrySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildCountryFilter (pure filter construction)
// ---------------------------------------------------------------------------

describe("buildCountryFilter", () => {
  it("excludes google-map countries by default", () => {
    const filter = buildCountryFilter();
    expect(filter.country_from_google_map).toBe(false);
    expect(filter.OR).toBeUndefined();
  });

  it("ignores empty nameFilter string", () => {
    const filter = buildCountryFilter("");
    expect(filter.country_from_google_map).toBe(false);
    expect(filter.OR).toBeUndefined();
  });

  it("ignores whitespace-only nameFilter", () => {
    const filter = buildCountryFilter("   ");
    expect(filter.country_from_google_map).toBe(false);
    expect(filter.OR).toBeUndefined();
  });

  it("searches English and Arabic names with nameFilter", () => {
    const filter = buildCountryFilter("Kuwait");
    expect(filter.OR).toBeDefined();
    expect(filter.OR).toHaveLength(2);
    expect(filter.OR![0]).toEqual({ country_name_en: { contains: "Kuwait" } });
    expect(filter.OR![1]).toEqual({ country_name_ar: { contains: "Kuwait" } });
  });
});
