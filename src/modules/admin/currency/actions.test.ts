import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// listCurrencies schema validation
// ---------------------------------------------------------------------------

const listCurrenciesSchema = z.object({
  keyword: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

describe("listCurrenciesSchema", () => {
  it("accepts default pagination with no params", () => {
    const result = listCurrenciesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts custom pagination params", () => {
    const result = listCurrenciesSchema.safeParse({ page: 3, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts keyword search", () => {
    const result = listCurrenciesSchema.safeParse({ keyword: "USD" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.keyword).toBe("USD");
    }
  });

  it("rejects negative page", () => {
    const result = listCurrenciesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listCurrenciesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listCurrenciesSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("accepts string-coercible page", () => {
    const result = listCurrenciesSchema.safeParse({ page: "2", limit: "15" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(15);
    }
  });
});

// ---------------------------------------------------------------------------
// getCurrency schema validation
// ---------------------------------------------------------------------------

const getCurrencySchema = z.object({
  id: z.coerce.number().int().positive("Currency ID must be a positive integer"),
});

describe("getCurrencySchema", () => {
  it("accepts a valid currency ID", () => {
    const result = getCurrencySchema.safeParse({ id: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(1);
    }
  });

  it("rejects zero ID", () => {
    const result = getCurrencySchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative ID", () => {
    const result = getCurrencySchema.safeParse({ id: -5 });
    expect(result.success).toBe(false);
  });

  it("accepts string-coercible ID", () => {
    const result = getCurrencySchema.safeParse({ id: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(42);
    }
  });

  it("rejects missing ID", () => {
    const result = getCurrencySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCurrency schema validation
// ---------------------------------------------------------------------------

const createCurrencySchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  code: z.string().min(1, "Code is required").max(255),
  currencySymbol: z.string().max(255).optional(),
  rate: z.coerce.number().min(0).optional(),
  decimalPlace: z.coerce.number().int().min(0).max(1).optional(),
  sortOrder: z.coerce.number().int().optional(),
  status: z.coerce.number().int().min(0).max(1).optional().default(1),
});

describe("createCurrencySchema", () => {
  it("accepts valid currency data with required fields only", () => {
    const result = createCurrencySchema.safeParse({
      title: "US Dollar",
      code: "USD",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("US Dollar");
      expect(result.data.code).toBe("USD");
      expect(result.data.status).toBe(1); // default
    }
  });

  it("accepts all optional fields", () => {
    const result = createCurrencySchema.safeParse({
      title: "Euro",
      code: "EUR",
      currencySymbol: "€",
      rate: 1.18,
      decimalPlace: 1,
      sortOrder: 1,
      status: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currencySymbol).toBe("€");
      expect(result.data.rate).toBe(1.18);
    }
  });

  it("rejects empty title", () => {
    const result = createCurrencySchema.safeParse({ title: "", code: "USD" });
    expect(result.success).toBe(false);
  });

  it("rejects empty code", () => {
    const result = createCurrencySchema.safeParse({ title: "Dollar", code: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing title", () => {
    const result = createCurrencySchema.safeParse({ code: "USD" });
    expect(result.success).toBe(false);
  });

  it("rejects missing code", () => {
    const result = createCurrencySchema.safeParse({ title: "Dollar" });
    expect(result.success).toBe(false);
  });

  it("rejects title exceeding 255 chars", () => {
    const result = createCurrencySchema.safeParse({
      title: "x".repeat(256),
      code: "USD",
    });
    expect(result.success).toBe(false);
  });

  it("accepts title at exactly 255 chars", () => {
    const result = createCurrencySchema.safeParse({
      title: "x".repeat(255),
      code: "USD",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative rate", () => {
    const result = createCurrencySchema.safeParse({
      title: "Test",
      code: "TST",
      rate: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects decimal_place > 1", () => {
    const result = createCurrencySchema.safeParse({
      title: "Test",
      code: "TST",
      decimalPlace: 2,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type CurrencyItem = {
  currency_id: number;
  title: string;
  code: string;
  currency_symbol: string | null;
  rate: number | null;
  decimal_place: boolean | null;
  sort_order: number | null;
  status: boolean | null;
  datetime: Date | null;
};

type ListCurrenciesResult = {
  currencies: CurrencyItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("CurrencyItem shape", () => {
  it("defines the expected fields", () => {
    const mock: CurrencyItem = {
      currency_id: 1,
      title: "Kuwaiti Dinar",
      code: "KWD",
      currency_symbol: "KD",
      rate: 0.31,
      decimal_place: true,
      sort_order: 1,
      status: true,
      datetime: new Date(),
    };
    expect(mock.currency_id).toBe(1);
    expect(mock.title).toBe("Kuwaiti Dinar");
    expect(mock.code).toBe("KWD");
  });

  it("accepts null fields", () => {
    const mock: CurrencyItem = {
      currency_id: 2,
      title: "US Dollar",
      code: "USD",
      currency_symbol: null,
      rate: null,
      decimal_place: null,
      sort_order: null,
      status: null,
      datetime: null,
    };
    expect(mock.currency_symbol).toBeNull();
    expect(mock.rate).toBeNull();
  });
});

describe("ListCurrenciesResult shape", () => {
  it("accepts an empty result set", () => {
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

  it("accepts a result with items", () => {
    const result: ListCurrenciesResult = {
      currencies: [
        {
          currency_id: 1,
          title: "KWD",
          code: "KWD",
          currency_symbol: "KD",
          rate: 1,
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
    };
    expect(result.currencies).toHaveLength(1);
    expect(result.totalPages).toBe(1);
  });
});
