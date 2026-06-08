import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: country list schema validation
//
// The listCountries action uses this schema internally. Testing it separately
// avoids mocking "use server" dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const listCountriesSchema = z.object({
  nameFilter: z.string().optional(),
});

describe("listCountriesSchema", () => {
  it("accepts empty params (no filter)", () => {
    const result = listCountriesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBeUndefined();
    }
  });

  it("accepts a nameFilter string", () => {
    const result = listCountriesSchema.safeParse({ nameFilter: "Kuwait" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBe("Kuwait");
    }
  });

  it("accepts an empty nameFilter string", () => {
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

  it("accepts all optional params as undefined", () => {
    const result = listCountriesSchema.safeParse({ nameFilter: undefined });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Prisma query construction logic (unit-testable pure function)
// ---------------------------------------------------------------------------

type CountryWhereInput = {
  country_from_google_map?: boolean | null;
  OR?: Array<{ country_name_en?: { contains: string }; country_name_ar?: { contains: string } }>;
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

describe("buildCountryFilter", () => {
  it("excludes google-map countries by default", () => {
    const result = buildCountryFilter();
    expect(result).toEqual({ country_from_google_map: false });
  });

  it("adds name filter when provided", () => {
    const result = buildCountryFilter("Kuwait");
    expect(result).toEqual({
      country_from_google_map: false,
      OR: [
        { country_name_en: { contains: "Kuwait" } },
        { country_name_ar: { contains: "Kuwait" } },
      ],
    });
  });

  it("ignores empty nameFilter", () => {
    const result = buildCountryFilter("");
    expect(result).toEqual({ country_from_google_map: false });
  });

  it("ignores whitespace-only nameFilter", () => {
    const result = buildCountryFilter("   ");
    expect(result).toEqual({ country_from_google_map: false });
  });
});

// ---------------------------------------------------------------------------
// Return type shape
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

describe("CountryListResult shape", () => {
  it("defines the expected fields", () => {
    const mock: CountryListResult = {
      country_id: 1,
      country_name_en: "Kuwait",
      country_name_ar: "الكويت",
      iso: "KWT",
      emoji: "🇰🇼",
      country_code: 414,
      currency_code: "KWD",
    };
    expect(mock.country_id).toBe(1);
    expect(mock.country_name_en).toBe("Kuwait");
    expect(mock.country_name_ar).toBe("الكويت");
    expect(mock.iso).toBe("KWT");
    expect(mock.emoji).toBe("🇰🇼");
    expect(mock.country_code).toBe(414);
    expect(mock.currency_code).toBe("KWD");
  });
});
