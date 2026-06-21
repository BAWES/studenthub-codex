import { describe, it, expect } from "vitest";
import {
  currencyItemSchema,
  listCurrenciesResultSchema,
  createCurrencyResultSchema,
} from "./schemas";

/**
 * Page migration test for admin/currency.
 *
 * Verifies the data contract between page and action.
 */
describe("admin currency page — data contract", () => {
  it("currencyItemSchema validates a full currency entry", () => {
    const r = currencyItemSchema.safeParse({
      currency_id: 1,
      title: "US Dollar",
      code: "USD",
      currency_symbol: "$",
      rate: 1.0,
      decimal_place: true,
      sort_order: 1,
      status: true,
      datetime: new Date("2026-06-14"),
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.code).toBe("USD");
      expect(r.data.title).toBe("US Dollar");
    }
  });

  it("currencyItemSchema accepts nullable fields", () => {
    const r = currencyItemSchema.safeParse({
      currency_id: 2,
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
  });

  it("currencyItemSchema rejects missing required fields", () => {
    const r = currencyItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("currencyItemSchema rejects negative currency_id", () => {
    const r = currencyItemSchema.safeParse({
      currency_id: -1,
      title: "Bad",
      code: "BAD",
      currency_symbol: null,
      rate: null,
      decimal_place: null,
      sort_order: null,
      status: null,
      datetime: null,
    });
    expect(r.success).toBe(false);
  });

  it("listCurrenciesResultSchema validates paginated result", () => {
    const r = listCurrenciesResultSchema.safeParse({
      currencies: [
        {
          currency_id: 1,
          title: "KWD",
          code: "KWD",
          currency_symbol: null,
          rate: 0.309,
          decimal_place: true,
          sort_order: 1,
          status: true,
          datetime: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("listCurrenciesResultSchema rejects negative total", () => {
    const r = listCurrenciesResultSchema.safeParse({
      currencies: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("listCurrenciesResultSchema rejects empty currencies", () => {
    const r = listCurrenciesResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("createCurrencyResultSchema validates result", () => {
    const r = createCurrencyResultSchema.safeParse({
      currency_id: 10,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.currency_id).toBe(10);
    }
  });

  it("createCurrencyResultSchema rejects missing currency_id", () => {
    const r = createCurrencyResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
