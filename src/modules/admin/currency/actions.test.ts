import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import {
  currencyItemSchema,
  listCurrenciesResultSchema,
  createCurrencyResultSchema,
} from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockFindMany,
  mockCount,
  mockFindUnique,
  mockCreate,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
}));

// ── Mock session ────────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    currency: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  },
}));

import { listCurrencies, getCurrency, createCurrency } from "./actions";

// =========================================================================
// listCurrencies
// =========================================================================
describe("listCurrencies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
  });

  it("requires admin.read capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Forbidden"));
    await expect(listCurrencies({})).rejects.toThrow("Forbidden");
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
  });

  it("passes default pagination when no params given", async () => {
    await listCurrencies({});
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
    expect(mockCount).toHaveBeenCalled();
  });

  it("passes custom page and limit", async () => {
    await listCurrencies({ page: 3, limit: 10 });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it("filters by keyword on title/code OR", async () => {
    await listCurrencies({ keyword: "USD" });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { title: { contains: "USD" } },
            { code: { contains: "USD" } },
          ],
        },
      }),
    );
    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { title: { contains: "USD" } },
            { code: { contains: "USD" } },
          ],
        },
      }),
    );
  });

  it("orders by sort_order ascending", async () => {
    await listCurrencies({});
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { sort_order: "asc" },
      }),
    );
  });

  it("selects the expected fields", async () => {
    await listCurrencies({});
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: {
          currency_id: true,
          title: true,
          code: true,
          currency_symbol: true,
          rate: true,
          decimal_place: true,
          sort_order: true,
          status: true,
          datetime: true,
        },
      }),
    );
  });

  it("returns paginated result with correct shape", async () => {
    const mockCurrency = {
      currency_id: 1,
      title: "US Dollar",
      code: "USD",
      currency_symbol: "$",
      rate: 1.0,
      decimal_place: true,
      sort_order: 1,
      status: true,
      datetime: new Date("2026-06-14"),
    };
    mockFindMany.mockResolvedValue([mockCurrency]);
    mockCount.mockResolvedValue(1);

    const result = await listCurrencies({ page: 1, limit: 20 });

    expect(result).toEqual({
      currencies: [mockCurrency],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    // Output should pass schema validation
    expect(listCurrenciesResultSchema.safeParse(result).success).toBe(true);
  });

  it("handles empty result set", async () => {
    const result = await listCurrencies({ page: 2, limit: 50 });

    expect(result).toEqual({
      currencies: [],
      total: 0,
      page: 2,
      limit: 50,
      totalPages: 0,
    });

    expect(listCurrenciesResultSchema.safeParse(result).success).toBe(true);
  });

  it("does not throw on output validation failure (just logs)", async () => {
    // Mock returns data that fails output schema (missing title)
    mockFindMany.mockResolvedValue([{ currency_id: 1 }]);
    mockCount.mockResolvedValue(1);

    // Should not throw despite invalid output shape
    const result = await listCurrencies({});
    expect(result.currencies).toHaveLength(1);
  });
});

// =========================================================================
// getCurrency
// =========================================================================
describe("getCurrency", () => {
  const mockCurrency = {
    currency_id: 5,
    title: "Euro",
    code: "EUR",
    currency_symbol: "€",
    rate: 1.18,
    decimal_place: true,
    sort_order: 2,
    status: true,
    datetime: new Date("2026-06-14"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(mockCurrency);
  });

  it("requires admin.read capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Forbidden"));
    await expect(getCurrency({ id: 1 })).rejects.toThrow("Forbidden");
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
  });

  it("calls findUnique with correct currency_id", async () => {
    await getCurrency({ id: 5 });
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { currency_id: 5 },
      select: {
        currency_id: true,
        title: true,
        code: true,
        currency_symbol: true,
        rate: true,
        decimal_place: true,
        sort_order: true,
        status: true,
        datetime: true,
      },
    });
  });

  it("returns the currency item on success", async () => {
    const result = await getCurrency({ id: 5 });
    expect(result).toEqual(mockCurrency);
    expect(currencyItemSchema.safeParse(result).success).toBe(true);
  });

  it("throws when currency is not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(getCurrency({ id: 999 })).rejects.toThrow(
      "Currency with ID 999 not found",
    );
  });

  it("rejects invalid params (zero ID)", async () => {
    await expect(getCurrency({ id: 0 })).rejects.toThrow();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("rejects missing id param", async () => {
    await expect(getCurrency({} as any)).rejects.toThrow();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

// =========================================================================
// createCurrency
// =========================================================================
describe("createCurrency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue({ currency_id: 10 });
  });

  it("requires admin.write capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Forbidden"));
    await expect(
      createCurrency({ title: "Test", code: "TST" }),
    ).rejects.toThrow("Forbidden");
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("creates a currency with required fields only", async () => {
    const result = await createCurrency({ title: "Test Currency", code: "TST" });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        title: "Test Currency",
        code: "TST",
        currency_symbol: null,
        rate: null,
        decimal_place: null,
        sort_order: null,
        status: true,
        datetime: expect.any(Date),
      },
      select: { currency_id: true },
    });

    expect(result).toEqual({ currency_id: 10 });
    expect(createCurrencyResultSchema.safeParse(result).success).toBe(true);
  });

  it("creates a currency with all optional fields", async () => {
    const result = await createCurrency({
      title: "Euro",
      code: "EUR",
      currencySymbol: "€",
      rate: 1.18,
      decimalPlace: 1,
      sortOrder: 2,
      status: 1,
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        title: "Euro",
        code: "EUR",
        currency_symbol: "€",
        rate: 1.18,
        decimal_place: true,
        sort_order: 2,
        status: true,
        datetime: expect.any(Date),
      },
      select: { currency_id: true },
    });

    expect(result).toEqual({ currency_id: 10 });
  });

  it("rejects empty title", async () => {
    await expect(
      createCurrency({ title: "", code: "USD" }),
    ).rejects.toThrow("Title is required");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects empty code", async () => {
    await expect(
      createCurrency({ title: "Dollar", code: "" }),
    ).rejects.toThrow("Code is required");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects missing title", async () => {
    await expect(
      createCurrency({ code: "USD" } as any),
    ).rejects.toThrow();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects missing code", async () => {
    await expect(
      createCurrency({ title: "Dollar" } as any),
    ).rejects.toThrow();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects negative rate", async () => {
    await expect(
      createCurrency({ title: "Test", code: "TST", rate: -1 }),
    ).rejects.toThrow();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("maps decimalPlace=0 to false", async () => {
    await createCurrency({ title: "Test", code: "TST", decimalPlace: 0 });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ decimal_place: false }),
      }),
    );
  });

  it("maps decimalPlace=1 to true", async () => {
    await createCurrency({ title: "Test", code: "TST", decimalPlace: 1 });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ decimal_place: true }),
      }),
    );
  });

  it("maps status=1 to true", async () => {
    await createCurrency({ title: "Test", code: "TST", status: 1 });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: true }),
      }),
    );
  });

  it("maps status=0 to false", async () => {
    await createCurrency({ title: "Test", code: "TST", status: 0 });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: false }),
      }),
    );
  });
});

// =========================================================================
// Schema validation tests (input parsing)
// =========================================================================

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
// getCurrencySchema validation
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
// createCurrencySchema validation
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

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("currencyItemSchema", () => {
  it("parses a valid currency item", () => {
    const r = currencyItemSchema.safeParse({
      currency_id: 1,
      title: "Kuwaiti Dinar",
      code: "KWD",
      currency_symbol: "KD",
      rate: 0.31,
      decimal_place: true,
      sort_order: 1,
      status: true,
      datetime: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("accepts null nullable fields", () => {
    const r = currencyItemSchema.safeParse({
      currency_id: 2,
      title: "US Dollar",
      code: "USD",
      currency_symbol: null,
      rate: null,
      decimal_place: null,
      sort_order: null,
      status: null,
      datetime: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing title", () => {
    const r = currencyItemSchema.safeParse({
      currency_id: 1,
      code: "USD",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer currency_id", () => {
    const r = currencyItemSchema.safeParse({
      currency_id: 1.5,
      title: "Test",
      code: "TST",
    });
    expect(r.success).toBe(false);
  });
});

describe("listCurrenciesResultSchema", () => {
  it("parses a valid paginated result", () => {
    const r = listCurrenciesResultSchema.safeParse({
      currencies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
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
});

describe("createCurrencyResultSchema", () => {
  it("parses a valid result", () => {
    const r = createCurrencyResultSchema.safeParse({ currency_id: 1 });
    expect(r.success).toBe(true);
  });

  it("rejects zero currency_id", () => {
    const r = createCurrencyResultSchema.safeParse({ currency_id: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects missing currency_id", () => {
    const r = createCurrencyResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
