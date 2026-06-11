import { describe, it, expect } from "vitest";

import {
  listCurrenciesSchema,
  listCurrenciesOutputSchema,
  getCurrencySchema,
  getCurrencyOutputSchema,
  currencyListItemSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema: listCurrenciesSchema
// ---------------------------------------------------------------------------

describe("listCurrenciesSchema", () => {
  it("accepts empty params (no pagination)", () => {
    const result = listCurrenciesSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listCurrenciesSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts status filter", () => {
    const result = listCurrenciesSchema.safeParse({ status: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(true);
    }
  });

  it("rejects limit over 100", () => {
    const result = listCurrenciesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCurrenciesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    const result = listCurrenciesSchema.safeParse({ limit: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: getCurrencySchema
// ---------------------------------------------------------------------------

describe("getCurrencySchema", () => {
  it("accepts a valid currency id", () => {
    const result = getCurrencySchema.safeParse({ id: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(1);
    }
  });

  it("rejects zero id", () => {
    const result = getCurrencySchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = getCurrencySchema.safeParse({ id: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric id", () => {
    const result = getCurrencySchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: currencyListItemSchema
// ---------------------------------------------------------------------------

describe("currencyListItemSchema", () => {
  it("accepts a valid currency item", () => {
    const result = currencyListItemSchema.safeParse({
      currency_id: 1,
      title: "Kuwaiti Dinar",
      code: "KWD",
      currency_symbol: "د.ك",
      rate: 3.29,
      sort_order: 1,
      status: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const result = currencyListItemSchema.safeParse({
      currency_id: 2,
      title: "US Dollar",
      code: "USD",
      currency_symbol: null,
      rate: null,
      sort_order: null,
      status: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = currencyListItemSchema.safeParse({
      currency_id: 1,
      code: "KWD",
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type for currency_id", () => {
    const result = currencyListItemSchema.safeParse({
      currency_id: "abc",
      title: "KWD",
      code: "KWD",
      currency_symbol: null,
      rate: null,
      sort_order: null,
      status: null,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: listCurrenciesOutputSchema
// ---------------------------------------------------------------------------

describe("listCurrenciesOutputSchema", () => {
  it("accepts a valid result with currencies", () => {
    const result = listCurrenciesOutputSchema.safeParse({
      currencies: [
        {
          currency_id: 1,
          title: "KWD",
          code: "KWD",
          currency_symbol: "د.ك",
          rate: 3.29,
          sort_order: 1,
          status: true,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid empty result", () => {
    const result = listCurrenciesOutputSchema.safeParse({
      currencies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing currencies field", () => {
    const result = listCurrenciesOutputSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-array currencies", () => {
    const result = listCurrenciesOutputSchema.safeParse({
      currencies: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: getCurrencyOutputSchema (nullable CurrencyListItem)
// ---------------------------------------------------------------------------

describe("getCurrencyOutputSchema", () => {
  it("accepts a valid currency item", () => {
    const result = getCurrencyOutputSchema.safeParse({
      currency_id: 1,
      title: "KWD",
      code: "KWD",
      currency_symbol: null,
      rate: null,
      sort_order: null,
      status: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null (currency not found)", () => {
    const result = getCurrencyOutputSchema.safeParse(null);
    expect(result.success).toBe(true);
  });

  it("rejects undefined", () => {
    const result = getCurrencyOutputSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Pure function: build query filter (optional status filter)
// ---------------------------------------------------------------------------

type CurrencyWhereInput = {
  status?: boolean;
};

function buildCurrencyListFilter(status?: boolean): CurrencyWhereInput {
  return status !== undefined ? { status } : {};
}

describe("buildCurrencyListFilter", () => {
  it("returns empty filter when no status provided", () => {
    const result = buildCurrencyListFilter();
    expect(result).toEqual({});
  });

  it("filters by active status", () => {
    const result = buildCurrencyListFilter(true);
    expect(result).toEqual({ status: true });
  });

  it("filters by inactive status", () => {
    const result = buildCurrencyListFilter(false);
    expect(result).toEqual({ status: false });
  });
});
