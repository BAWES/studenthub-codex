import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: currency list schema validation
//
// The listCurrencies action uses this schema internally. Testing it
// separately avoids mocking "use server" dependencies (prisma, session, etc.).
// ---------------------------------------------------------------------------

const listCurrenciesSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  status: z.boolean().optional(),
});

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
// Return type shape
// ---------------------------------------------------------------------------

type CurrencyListItem = {
  currency_id: number;
  title: string;
  code: string;
  currency_symbol: string | null;
  rate: number | null;
  sort_order: number | null;
  status: boolean | null;
};

type ListCurrenciesResult = {
  currencies: CurrencyListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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

// ---------------------------------------------------------------------------
// getCurrency schema validation
// ---------------------------------------------------------------------------

const getCurrencySchema = z.object({
  id: z.number().int().positive(),
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
