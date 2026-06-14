import { describe, it, expect } from "vitest";
import {
  currencyItemSchema,
  listCurrenciesResultSchema,
  createCurrencyResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// currencyItemSchema
// ---------------------------------------------------------------------------
describe("currencyItemSchema", () => {
  const valid = {
    currency_id: 1,
    title: "Kuwaiti Dinar",
    code: "KWD",
    currency_symbol: "د.ك",
    rate: 3.29,
    decimal_place: true,
    sort_order: 1,
    status: true,
    datetime: new Date("2026-06-14"),
  };

  it("accepts a valid currency item", () => {
    expect(currencyItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      currencyItemSchema.safeParse({
        ...valid,
        currency_symbol: null,
        rate: null,
        decimal_place: null,
        sort_order: null,
        status: null,
        datetime: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing currency_id", () => {
    const { currency_id: _, ...rest } = valid;
    expect(currencyItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-positive currency_id", () => {
    expect(currencyItemSchema.safeParse({ ...valid, currency_id: 0 }).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = valid;
    expect(currencyItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing code", () => {
    const { code: _, ...rest } = valid;
    expect(currencyItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCurrenciesResultSchema
// ---------------------------------------------------------------------------
describe("listCurrenciesResultSchema", () => {
  const valid = {
    currencies: [
      {
        currency_id: 1,
        title: "KWD",
        code: "KWD",
        currency_symbol: null,
        rate: null,
        decimal_place: null,
        sort_order: null,
        status: null,
        datetime: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    expect(listCurrenciesResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty currencies array", () => {
    expect(
      listCurrenciesResultSchema.safeParse({ ...valid, currencies: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing currencies", () => {
    const { currencies: _, ...rest } = valid;
    expect(listCurrenciesResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listCurrenciesResultSchema.safeParse({ ...valid, total: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCurrencyResultSchema
// ---------------------------------------------------------------------------
describe("createCurrencyResultSchema", () => {
  it("accepts valid create result", () => {
    expect(createCurrencyResultSchema.safeParse({ currency_id: 5 }).success).toBe(true);
  });

  it("rejects missing currency_id", () => {
    expect(createCurrencyResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive currency_id", () => {
    expect(createCurrencyResultSchema.safeParse({ currency_id: 0 }).success).toBe(false);
  });
});
