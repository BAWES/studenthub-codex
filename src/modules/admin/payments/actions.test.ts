import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listPaymentsSchema,
  getPaymentSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit, no mocking required
// ---------------------------------------------------------------------------

describe("listPaymentsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listPaymentsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listPaymentsSchema.safeParse({ page: 3, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(10);
    }
  });

  it("coerces string page and limit", () => {
    const r = listPaymentsSchema.safeParse({ page: "2", limit: "50" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listPaymentsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listPaymentsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listPaymentsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("accepts status filter", () => {
    const r = listPaymentsSchema.safeParse({ status: "ACTIVE" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("ACTIVE");
    }
  });

  it("accepts type filter", () => {
    const r = listPaymentsSchema.safeParse({ type: "RECEIVE" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe("RECEIVE");
    }
  });

  it("accepts date range", () => {
    const r = listPaymentsSchema.safeParse({
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.dateFrom).toBe("2026-01-01");
      expect(r.data.dateTo).toBe("2026-06-30");
    }
  });
});

describe("getPaymentSchema", () => {
  it("accepts a valid payment ID", () => {
    const r = getPaymentSchema.safeParse({ paymentId: "txn-12345" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.paymentId).toBe("txn-12345");
    }
  });

  it("rejects empty payment ID", () => {
    expect(getPaymentSchema.safeParse({ paymentId: "" }).success).toBe(false);
  });

  it("rejects missing payment ID", () => {
    expect(getPaymentSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

import {
  paymentRowOutputSchema,
  listPaymentsOutputSchema,
  lineItemOutputSchema,
  paymentContactOutputSchema,
  paymentNestedOutputSchema,
  paymentDetailOutputSchema,
  metricOutputSchema,
} from "./schemas";

describe("paymentRowOutputSchema", () => {
  it("accepts a valid payment row", () => {
    const row = {
      bank_transaction_id: "txn-001",
      reference: "REF-001",
      status: "ACTIVE",
      type: "RECEIVE",
      total: 1000.0,
      currency_code: "KWD",
      contact_name: "Test Co",
      date: "2026-06-10T00:00:00.000Z",
      is_reconciled: false,
      line_items_count: 3,
    };
    expect(paymentRowOutputSchema.safeParse(row).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const row = {
      bank_transaction_id: "txn-001",
      reference: null,
      status: null,
      type: null,
      total: null,
      currency_code: null,
      contact_name: null,
      date: "2026-06-10T00:00:00.000Z",
      is_reconciled: null,
      line_items_count: 0,
    };
    expect(paymentRowOutputSchema.safeParse(row).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(paymentRowOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects missing bank_transaction_id", () => {
    const row = {
      reference: null,
      status: null,
      type: null,
      total: null,
      currency_code: null,
      contact_name: null,
      date: "2026-06-10T00:00:00.000Z",
      is_reconciled: null,
      line_items_count: 0,
    };
    expect(paymentRowOutputSchema.safeParse(row).success).toBe(false);
  });
});

describe("listPaymentsOutputSchema", () => {
  const validItem = {
    bank_transaction_id: "txn-001",
    reference: null,
    status: null,
    type: null,
    total: null,
    currency_code: null,
    contact_name: null,
    date: "2026-06-10T00:00:00.000Z",
    is_reconciled: null,
    line_items_count: 0,
  };

  it("accepts a valid list result", () => {
    const result = {
      items: [validItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(listPaymentsOutputSchema.safeParse(result).success).toBe(true);
  });

  it("accepts empty items", () => {
    const result = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(listPaymentsOutputSchema.safeParse(result).success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = {
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(listPaymentsOutputSchema.safeParse(result).success).toBe(false);
  });
});

describe("lineItemOutputSchema", () => {
  it("accepts a valid line item", () => {
    const li = {
      line_item_id: "li-1",
      account_code: "200",
      description: "Service fee",
      line_amount: 500.0,
      quantity: 1,
      unit_amount: 500.0,
    };
    expect(lineItemOutputSchema.safeParse(li).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const li = {
      line_item_id: "li-1",
      account_code: null,
      description: null,
      line_amount: null,
      quantity: null,
      unit_amount: null,
    };
    expect(lineItemOutputSchema.safeParse(li).success).toBe(true);
  });

  it("rejects missing line_item_id", () => {
    const li = {
      account_code: null,
      description: null,
      line_amount: null,
      quantity: null,
      unit_amount: null,
    };
    expect(lineItemOutputSchema.safeParse(li).success).toBe(false);
  });
});

describe("paymentContactOutputSchema", () => {
  it("accepts a valid contact", () => {
    expect(paymentContactOutputSchema.safeParse({ contact_id: "c-1", name: "Test Co" }).success).toBe(true);
  });

  it("accepts null name", () => {
    expect(paymentContactOutputSchema.safeParse({ contact_id: "c-1", name: null }).success).toBe(true);
  });

  it("rejects missing contact_id", () => {
    expect(paymentContactOutputSchema.safeParse({ name: null }).success).toBe(false);
  });
});

describe("paymentNestedOutputSchema", () => {
  it("accepts a valid nested payment with contact", () => {
    const p = {
      bank_transaction_id: "txn-001",
      reference: "REF-001",
      status: "ACTIVE",
      type: "RECEIVE",
      total: 1000.0,
      sub_total: 900.0,
      total_tax: 100.0,
      currency_rate: 1.0,
      currency_code: "KWD",
      line_amount_types: "Exclusive",
      has_attachments: false,
      is_reconciled: false,
      date: "2026-06-10T00:00:00.000Z",
      created_at: "2026-06-10T10:00:00.000Z",
      updated_at: "2026-06-10T12:00:00.000Z",
      contact: { contact_id: "c-1", name: "Test Co" },
    };
    expect(paymentNestedOutputSchema.safeParse(p).success).toBe(true);
  });

  it("accepts null contact", () => {
    const p = {
      bank_transaction_id: "txn-001",
      reference: null,
      status: null,
      type: null,
      total: null,
      sub_total: null,
      total_tax: null,
      currency_rate: null,
      currency_code: null,
      line_amount_types: null,
      has_attachments: null,
      is_reconciled: null,
      date: null,
      created_at: null,
      updated_at: null,
      contact: null,
    };
    expect(paymentNestedOutputSchema.safeParse(p).success).toBe(true);
  });

  it("rejects missing bank_transaction_id", () => {
    const p = {
      reference: null,
      status: null,
      type: null,
      total: null,
      sub_total: null,
      total_tax: null,
      currency_rate: null,
      currency_code: null,
      line_amount_types: null,
      has_attachments: null,
      is_reconciled: null,
      date: null,
      created_at: null,
      updated_at: null,
      contact: null,
    };
    expect(paymentNestedOutputSchema.safeParse(p).success).toBe(false);
  });
});

describe("paymentDetailOutputSchema", () => {
  it("accepts a valid detail result", () => {
    const result = {
      payment: {
        bank_transaction_id: "txn-001",
        reference: null,
        status: null,
        type: null,
        total: null,
        sub_total: null,
        total_tax: null,
        currency_rate: null,
        currency_code: null,
        line_amount_types: null,
        has_attachments: null,
        is_reconciled: null,
        date: null,
        created_at: null,
        updated_at: null,
        contact: null,
      },
      line_items: [],
      metrics: [],
    };
    expect(paymentDetailOutputSchema.safeParse(result).success).toBe(true);
  });

  it("accepts null payment (not found)", () => {
    const result = { payment: null, line_items: [], metrics: [] };
    expect(paymentDetailOutputSchema.safeParse(result).success).toBe(true);
  });

  it("rejects missing line_items", () => {
    const result = { payment: null, metrics: [] };
    expect(paymentDetailOutputSchema.safeParse(result).success).toBe(false);
  });
});

describe("metricOutputSchema", () => {
  it("accepts string value", () => {
    const m = { label: "Status", value: "ACTIVE", note: "" };
    expect(metricOutputSchema.safeParse(m).success).toBe(true);
  });

  it("accepts number value", () => {
    const m = { label: "Count", value: 42, note: "Line items" };
    expect(metricOutputSchema.safeParse(m).success).toBe(true);
  });

  it("rejects missing label", () => {
    expect(metricOutputSchema.safeParse({ value: "x", note: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action tests — mock Prisma + auth
// ---------------------------------------------------------------------------

const mockFindMany = vi.fn();
const mockFindFirst = vi.fn();
const mockCount = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    bank_transaction: {
      findMany: mockFindMany,
      findFirst: mockFindFirst,
      count: mockCount,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
}));

const { requireCapability } = await import("@/modules/auth/session");
const { prisma } = await import("@/lib/prisma");
const payments = await import("./actions");

const mockUser = {
  role: "admin" as const,
  id: "user-1",
  name: "Admin User",
  email: "admin@studenthub.local",
  issuedAt: Date.now(),
};

function makeTransaction(overrides: Record<string, unknown> = {}) {
  return {
    bank_transaction_id: "txn-001",
    reference: "REF-001",
    status: "ACTIVE",
    type: "RECEIVE",
    total: 1000.0,
    currency_code: "KWD",
    date: new Date("2026-06-10"),
    is_reconciled: false,
    bank_transaction_contact: { contact_id: "c-1", name: "Test Co" },
    bank_transaction_line_item: [{ line_item_id: "li-1" }],
    ...overrides,
  };
}

describe("listPayments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated payment rows with defaults", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([makeTransaction()]);
    mockCount.mockResolvedValue(1);

    const result = await payments.listPayments({});

    expect(requireCapability).toHaveBeenCalledWith("finance.read");
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);

    const item = result.items[0];
    expect(item.bank_transaction_id).toBe("txn-001");
    expect(item.reference).toBe("REF-001");
    expect(item.currency_code).toBe("KWD");
    expect(item.contact_name).toBe("Test Co");
    expect(item.line_items_count).toBe(1);
  });

  it("respects pagination params", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await payments.listPayments({ page: 3, limit: 10 });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.skip).toBe(20); // (3-1) * 10
    expect(callArgs.take).toBe(10);
  });

  it("filters by status", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await payments.listPayments({ status: "ACTIVE" });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.status).toBe("ACTIVE");
  });

  it("filters by type", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await payments.listPayments({ type: "RECEIVE" });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.type).toBe("RECEIVE");
  });

  it("filters by date range", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await payments.listPayments({
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.date.gte).toBeInstanceOf(Date);
    expect(callArgs.where.date.lte).toBeInstanceOf(Date);
  });

  it("returns empty result when no transactions match", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await payments.listPayments({ status: "VOIDED" });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("returns empty result on invalid input instead of throwing", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);

    const result = await payments.listPayments({
      page: 0,
    } as unknown as Record<string, unknown>);
    // Should return empty rather than throw
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("throws when auth fails", async () => {
    vi.mocked(requireCapability).mockRejectedValue(
      new Error("Forbidden"),
    );

    await expect(payments.listPayments({})).rejects.toThrow("Forbidden");
    expect(mockFindMany).not.toHaveBeenCalled();
    expect(mockCount).not.toHaveBeenCalled();
  });

  it("propagates Prisma errors", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindMany.mockRejectedValue(new Error("DB timeout"));

    await expect(payments.listPayments({})).rejects.toThrow("DB timeout");
  });
});

describe("getPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns payment detail with line items and metrics", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindFirst.mockResolvedValue(
      makeTransaction({
        sub_total: 900.0,
        total_tax: 100.0,
        currency_rate: 1.0,
        line_amount_types: "Exclusive",
        has_attachments: false,
        created_at: new Date("2026-06-10T10:00:00Z"),
        updated_at: new Date("2026-06-10T12:00:00Z"),
        bank_transaction_line_item: [
          {
            line_item_id: "li-1",
            account_code: "200",
            description: "Service fee",
            line_amount: 500.0,
            quantity: 1,
            unit_amount: 500.0,
          },
        ],
      }),
    );

    const result = await payments.getPayment("txn-001");

    expect(result.payment).not.toBeNull();
    expect(result.payment!.bank_transaction_id).toBe("txn-001");
    expect(result.payment!.contact!.name).toBe("Test Co");
    expect(result.payment!.is_reconciled).toBe(false);
    expect(result.line_items).toHaveLength(1);
    expect(result.line_items[0].description).toBe("Service fee");
    expect(result.metrics).toHaveLength(5);
  });

  it("returns null payment and empty arrays when not found", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindFirst.mockResolvedValue(null);

    const result = await payments.getPayment("nonexistent");

    expect(result.payment).toBeNull();
    expect(result.line_items).toHaveLength(0);
    expect(result.metrics).toHaveLength(0);
  });

  it("throws on invalid payment ID", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);

    await expect(payments.getPayment("")).rejects.toThrow();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("throws when auth fails", async () => {
    vi.mocked(requireCapability).mockRejectedValue(
      new Error("Forbidden"),
    );

    await expect(payments.getPayment("txn-1")).rejects.toThrow("Forbidden");
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("propagates Prisma errors", async () => {
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
    mockFindFirst.mockRejectedValue(new Error("DB connection error"));

    await expect(payments.getPayment("txn-1")).rejects.toThrow(
      "DB connection error",
    );
  });
});
