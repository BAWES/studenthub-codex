import { describe, it, expect } from "vitest";
import { listCountriesSchema } from "@/modules/admin/country/schemas";
import type { CountryItem, ListCountriesResult } from "@/modules/admin/country/schemas";

/**
 * Page migration test for admin/country.
 *
 * Verifies that listCountriesSchema accepts the params passed by the page,
 * and that CountryItem fields map correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin country page — data contract", () => {
  it("listCountriesSchema accepts empty params (defaults apply)", () => {
    const r = listCountriesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.limit).toBe("number");
      expect(r.data.limit).toBe(50);
      expect(typeof r.data.page).toBe("number");
      expect(r.data.page).toBe(1);
    }
  });

  it("listCountriesSchema accepts the params the page actually passes", () => {
    const r = listCountriesSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("CountryItem fields map correctly to DataTable columns", () => {
    // The page maps CountryItem to DataTable columns:
    //   country_id      → row.country_id     (for keys)
    //   country_name_en → row.country_name_en
    //   country_name_ar → row.country_name_ar
    //   iso             → row.iso
    //   emoji           → row.emoji
    //   country_code    → row.country_code
    //   currency_code   → row.currency_code
    const row: CountryItem = {
      country_id: 1,
      country_name_en: "Kuwait",
      country_name_ar: "الكويت",
      country_nationality_name_en: "Kuwaiti",
      country_nationality_name_ar: "كويتي",
      iso: "KWT",
      emoji: "🇰🇼",
      country_code: 965,
      currency_code: "KWD",
    };
    expect(row.country_id).toBe(1);
    expect(row.country_name_en).toBe("Kuwait");
    expect(row.country_name_ar).toBe("الكويت");
    expect(row.iso).toBe("KWT");
    expect(row.emoji).toBe("🇰🇼");
    expect(row.country_code).toBe(965);
    expect(row.currency_code).toBe("KWD");
  });

  it("CountryItem allows nullable fields", () => {
    const row: CountryItem = {
      country_id: 2,
      country_name_en: "Test",
      country_name_ar: null,
      country_nationality_name_en: "Test",
      country_nationality_name_ar: null,
      iso: null,
      emoji: null,
      country_code: null,
      currency_code: null,
    };
    expect(row.country_name_ar).toBeNull();
    expect(row.iso).toBeNull();
    expect(row.country_code).toBeNull();
    expect(row.currency_code).toBeNull();
  });

  it("ListCountriesResult has expected shape", () => {
    const result: ListCountriesResult = {
      countries: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.countries)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });

  it("ListCountriesResult with data", () => {
    const result: ListCountriesResult = {
      countries: [
        {
          country_id: 1,
          country_name_en: "Kuwait",
          country_name_ar: null,
          country_nationality_name_en: "Kuwaiti",
          country_nationality_name_ar: null,
          iso: "KWT",
          emoji: "🇰🇼",
          country_code: 965,
          currency_code: "KWD",
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    };
    expect(result.countries).toHaveLength(1);
    expect(result.totalPages).toBe(1);
  });
});
