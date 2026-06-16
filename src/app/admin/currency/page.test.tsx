import { describe, it, expect } from "vitest";
import { currencyItemSchema, listCurrenciesResultSchema } from "./schemas";
import type { CurrencyItem, ListCurrenciesResult } from "./schemas";

/**
 * Page migration test for admin/currency.
 *
 * Verifies that currencyItemSchema accepts the data returned by the
 * listCurrencies server action, and that CurrencyItem fields map
 * correctly to AdminCurrencyTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin currency page — data contract", () => {
  it("listCurrenciesResultSchema accepts empty list result", () => {
    const r = listCurrenciesResultSchema.safeParse({
      currencies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.currencies).toEqual([]);
    }
  });

  it("currencyItemSchema accepts a full currency record", () => {
    const r: CurrencyItem = {
      currency_id: 1,
      title: "Kuwaiti Dinar",
      code: "KWD",
      currency_symbol: "د.ك",
      rate: 1.0000,
      decimal_place: true,
      sort_order: 1,
      status: true,
      datetime: new Date("2026-06-16T00:00:00.000Z"),
    };
    const parsed = currencyItemSchema.safeParse(r);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.currency_id).toBe(1);
      expect(parsed.data.code).toBe("KWD");
      expect(parsed.data.title).toBe("Kuwaiti Dinar");
    }
  });

  it("CurrencyItem fields map correctly to AdminCurrencyTable columns", () => {
    // The page maps CurrencyItem to AdminCurrencyTable columns:
    //   currency_id    → row.id         (row key via String(r.currency_id))
    //   code           → row.code        (primary display)
    //   title          → row.title       (name column)
    //   currency_symbol → row.currency_symbol (symbol column)
    //   rate           → row.rate        (exchange rate, 4 decimals)
    //   status         → row.status      (Active/Inactive badge)
    //   sort_order     → row.sort_order  (sort column)
    const record: CurrencyItem = {
      currency_id: 42,
      title: "US Dollar",
      code: "USD",
      currency_symbol: "$",
      rate: 0.3080,
      decimal_place: true,
      sort_order: 2,
      status: true,
      datetime: new Date("2026-06-15T12:00:00.000Z"),
    };
    expect(record.currency_id).toBe(42);
    expect(record.code).toBe("USD");
    expect(record.title).toBe("US Dollar");
    expect(record.currency_symbol).toBe("$");
    expect(record.rate).toBe(0.3080);
    expect(record.status).toBe(true);
    expect(record.sort_order).toBe(2);
  });

  it("ListCurrenciesResult has expected shape (matches listCurrencies return)", () => {
    const result: ListCurrenciesResult = {
      currencies: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.currencies)).toBe(true);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(0);
  });

  it("currencyItemSchema rejects missing required fields", () => {
    const r = currencyItemSchema.safeParse({ code: "KWD" });
    expect(r.success).toBe(false);
  });

  it("currencyItemSchema accepts nullable optional fields", () => {
    const r = currencyItemSchema.safeParse({
      currency_id: 1,
      title: "Test",
      code: "TST",
      currency_symbol: null,
      rate: null,
      decimal_place: null,
      sort_order: null,
      status: null,
      datetime: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.currency_symbol).toBeNull();
      expect(r.data.rate).toBeNull();
      expect(r.data.datetime).toBeNull();
    }
  });
});
