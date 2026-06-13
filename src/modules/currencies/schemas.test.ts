import { describe, it, expect } from "vitest";
import {
  listCurrenciesSchema,
  getCurrencySchema,
  currencyItemSchema,
  currencyDetailSchema,
  listCurrenciesResultSchema,
} from "./schemas";

const validCurrencyItem = () => ({
  currency_id: 1,
  title: "Kuwaiti Dinar",
  code: "KWD",
  currency_symbol: "د.ك",
  rate: 3.29,
  sort_order: 1,
  status: true,
});

// ---------------------------------------------------------------------------
// listCurrenciesSchema (input)
// ---------------------------------------------------------------------------

describe("listCurrenciesSchema", () => {
  it("accepts empty params", () => {
    const r = listCurrenciesSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listCurrenciesSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts status filter", () => {
    const r = listCurrenciesSchema.safeParse({ status: true });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe(true);
    }
  });

  it("accepts keyword filter", () => {
    const r = listCurrenciesSchema.safeParse({ keyword: "KWD" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.keyword).toBe("KWD");
    }
  });

  it("rejects limit over 100", () => {
    const r = listCurrenciesSchema.safeParse({ limit: 999 });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listCurrenciesSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative page", () => {
    const r = listCurrenciesSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCurrencySchema (input)
// ---------------------------------------------------------------------------

describe("getCurrencySchema", () => {
  it("accepts a valid id", () => {
    const r = getCurrencySchema.safeParse({ id: 1 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe(1);
    }
  });

  it("rejects zero id", () => {
    const r = getCurrencySchema.safeParse({ id: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative id", () => {
    const r = getCurrencySchema.safeParse({ id: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric id", () => {
    const r = getCurrencySchema.safeParse({ id: "abc" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// currencyItemSchema (output)
// ---------------------------------------------------------------------------

describe("currencyItemSchema", () => {
  it("accepts a full currency item", () => {
    const r = currencyItemSchema.safeParse(validCurrencyItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields set to null", () => {
    const r = currencyItemSchema.safeParse({
      ...validCurrencyItem(),
      currency_symbol: null,
      rate: null,
      sort_order: null,
      status: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.currency_symbol).toBeNull();
      expect(r.data.rate).toBeNull();
      expect(r.data.sort_order).toBeNull();
      expect(r.data.status).toBeNull();
    }
  });

  it("rejects missing required field", () => {
    const { title, ...rest } = validCurrencyItem();
    const r = currencyItemSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for rate", () => {
    const r = currencyItemSchema.safeParse({ ...validCurrencyItem(), rate: "not-a-number" });
    expect(r.success).toBe(false);
  });

  it("rejects negative currency_id", () => {
    const r = currencyItemSchema.safeParse({ ...validCurrencyItem(), currency_id: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects zero currency_id", () => {
    const r = currencyItemSchema.safeParse({ ...validCurrencyItem(), currency_id: 0 });
    expect(r.success).toBe(false);
  });

  it("handles extra fields gracefully (Zod strips by default)", () => {
    const r = currencyItemSchema.safeParse({ ...validCurrencyItem(), extraField: "extra" });
    expect(r.success).toBe(true);
    if (r.success && "extraField" in r.data) {
      // If extra fields are NOT stripped (zod default strips unknown keys)
      // this assertion passes only if stripUnknown is off
    }
  });
});

// ---------------------------------------------------------------------------
// currencyDetailSchema (output)
// ---------------------------------------------------------------------------

describe("currencyDetailSchema", () => {
  it("accepts a valid currency item", () => {
    const r = currencyDetailSchema.safeParse(validCurrencyItem());
    expect(r.success).toBe(true);
    expect(r.data).not.toBeNull();
  });

  it("accepts null", () => {
    const r = currencyDetailSchema.safeParse(null);
    expect(r.success).toBe(true);
    expect(r.data).toBeNull();
  });

  it("rejects undefined", () => {
    const r = currencyDetailSchema.safeParse(undefined);
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCurrenciesResultSchema (output)
// ---------------------------------------------------------------------------

describe("listCurrenciesResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listCurrenciesResultSchema.safeParse({
      currencies: [validCurrencyItem()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty list", () => {
    const r = listCurrenciesResultSchema.safeParse({
      currencies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("accepts a single-page result", () => {
    const r = listCurrenciesResultSchema.safeParse({
      currencies: [validCurrencyItem()],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listCurrenciesResultSchema.safeParse({
      currencies: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listCurrenciesResultSchema.safeParse({
      currencies: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative page", () => {
    const r = listCurrenciesResultSchema.safeParse({
      currencies: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listCurrenciesResultSchema.safeParse({ currencies: [] });
    expect(r.success).toBe(false);
  });

  it("rejects null currencies", () => {
    const r = listCurrenciesResultSchema.safeParse({
      currencies: null,
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});
