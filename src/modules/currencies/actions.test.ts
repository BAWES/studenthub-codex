import { describe, it, expect } from "vitest";
import {
  listCurrenciesSchema,
  getCurrencySchema,
  currencyItemSchema,
  currencyDetailSchema,
  listCurrenciesResultSchema,
  type CurrencyListItem,
  type ListCurrenciesResult,
} from "./schemas";

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

describe("CurrencyListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: CurrencyListItem = {
      currency_id: 1,
      title: "Kuwaiti Dinar",
      code: "KWD",
      currency_symbol: "د.ك",
      rate: 3.29,
      sort_order: 1,
      status: true,
    };
    expect(mock.currency_id).toBe(1);
    expect(mock.title).toBe("Kuwaiti Dinar");
    expect(mock.code).toBe("KWD");
    expect(mock.currency_symbol).toBe("د.ك");
    expect(mock.rate).toBe(3.29);
    expect(mock.sort_order).toBe(1);
    expect(mock.status).toBe(true);
  });
});

describe("ListCurrenciesResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListCurrenciesResult = {
      currencies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.currencies).toHaveLength(0);
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
// Output schema tests: currencyItemSchema
// ---------------------------------------------------------------------------

const validCurrencyItem = {
  currency_id: 1,
  title: "Kuwaiti Dinar",
  code: "KWD",
  currency_symbol: "د.ك",
  rate: 3.29,
  sort_order: 1,
  status: true,
};

describe("currencyItemSchema", () => {
  it("accepts a valid currency item", () => {
    const result = currencyItemSchema.parse(validCurrencyItem);
    expect(result.currency_id).toBe(1);
    expect(result.title).toBe("Kuwaiti Dinar");
    expect(result.code).toBe("KWD");
  });

  it("accepts nullable fields as null", () => {
    const result = currencyItemSchema.parse({
      ...validCurrencyItem,
      currency_symbol: null,
      rate: null,
      sort_order: null,
      status: null,
    });
    expect(result.currency_symbol).toBeNull();
    expect(result.rate).toBeNull();
    expect(result.sort_order).toBeNull();
    expect(result.status).toBeNull();
  });

  it("rejects missing required string field", () => {
    const { title, ...rest } = validCurrencyItem;
    expect(() => currencyItemSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for rate field", () => {
    expect(() =>
      currencyItemSchema.parse({ ...validCurrencyItem, rate: "not-a-number" }),
    ).toThrow();
  });

  it("rejects negative currency_id", () => {
    expect(() =>
      currencyItemSchema.parse({ ...validCurrencyItem, currency_id: -1 }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: currencyDetailSchema
// ---------------------------------------------------------------------------

describe("currencyDetailSchema", () => {
  it("accepts a valid currency item", () => {
    const result = currencyDetailSchema.parse(validCurrencyItem);
    expect(result).not.toBeNull();
  });

  it("accepts null", () => {
    const result = currencyDetailSchema.parse(null);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listCurrenciesResultSchema
// ---------------------------------------------------------------------------

describe("listCurrenciesResultSchema", () => {
  it("accepts a valid result with currencies", () => {
    const result = listCurrenciesResultSchema.parse({
      currencies: [validCurrencyItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.currencies.length).toBe(1);
  });

  it("accepts an empty list", () => {
    const result = listCurrenciesResultSchema.parse({
      currencies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.currencies.length).toBe(0);
  });

  it("rejects negative page", () => {
    expect(() =>
      listCurrenciesResultSchema.parse({
        currencies: [],
        total: 0,
        page: -1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });

  it("rejects negative total", () => {
    expect(() =>
      listCurrenciesResultSchema.parse({
        currencies: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});
