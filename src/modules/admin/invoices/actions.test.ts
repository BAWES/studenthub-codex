import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listInvoicesSchema,
  getInvoiceSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  deleteInvoiceSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listInvoicesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listInvoicesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination and filter params", () => {
    const r = listInvoicesSchema.safeParse({
      page: 2,
      limit: 10,
      companyId: 5,
      status: "paid",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.companyId).toBe(5);
      expect(r.data.status).toBe("paid");
      expect(r.data.dateFrom).toBe("2026-01-01");
      expect(r.data.dateTo).toBe("2026-06-30");
    }
  });

  it("rejects limit over 100", () => {
    expect(listInvoicesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listInvoicesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("accepts all valid invoice status values", () => {
    const valid = ["paid", "unpaid"];
    for (const s of valid) {
      expect(listInvoicesSchema.safeParse({ status: s }).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(listInvoicesSchema.safeParse({ status: "pending" }).success).toBe(false);
  });

  it("coerces string page/limit to numbers", () => {
    const r = listInvoicesSchema.safeParse({ page: "3", limit: "25" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(25);
    }
  });
});

describe("getInvoiceSchema", () => {
  it("accepts a valid invoice ID", () => {
    const r = getInvoiceSchema.safeParse({ invoiceId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoiceId).toBe(42);
    }
  });

  it("rejects negative ID", () => {
    expect(getInvoiceSchema.safeParse({ invoiceId: -1 }).success).toBe(false);
  });

  it("rejects zero", () => {
    expect(getInvoiceSchema.safeParse({ invoiceId: 0 }).success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    expect(getInvoiceSchema.safeParse({ invoiceId: "abc" }).success).toBe(false);
  });

  it("coerces string number to int", () => {
    const r = getInvoiceSchema.safeParse({ invoiceId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoiceId).toBe(99);
    }
  });
});

// ---------------------------------------------------------------------------
// createInvoiceSchema
// ---------------------------------------------------------------------------

describe("createInvoiceSchema", () => {
  it("accepts minimal params (defaults only)", () => {
    const r = createInvoiceSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoice_status).toBe("unpaid");
    }
  });

  it("accepts all optional fields", () => {
    const r = createInvoiceSchema.safeParse({
      transfer_id: 1,
      invoice_date: "2026-06-10",
      invoice_status: "paid",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transfer_id).toBe(1);
      expect(r.data.invoice_status).toBe("paid");
    }
  });

  it("rejects invalid status", () => {
    const r = createInvoiceSchema.safeParse({ invoice_status: "pending" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateInvoiceSchema
// ---------------------------------------------------------------------------

describe("updateInvoiceSchema", () => {
  it("accepts valid invoice ID with partial update", () => {
    const r = updateInvoiceSchema.safeParse({
      invoiceId: 1,
      invoice_status: "paid",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoiceId).toBe(1);
      expect(r.data.invoice_status).toBe("paid");
    }
  });

  it("accepts invoice ID only (no mutation fields)", () => {
    const r = updateInvoiceSchema.safeParse({ invoiceId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects missing invoiceId", () => {
    const r = updateInvoiceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects zero invoiceId", () => {
    const r = updateInvoiceSchema.safeParse({ invoiceId: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const r = updateInvoiceSchema.safeParse({
      invoiceId: 1,
      invoice_status: "cancelled",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteInvoiceSchema
// ---------------------------------------------------------------------------

describe("deleteInvoiceSchema", () => {
  it("accepts a valid invoice ID", () => {
    const r = deleteInvoiceSchema.safeParse({ invoiceId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invoiceId).toBe(42);
    }
  });

  it("rejects missing invoiceId", () => {
    const r = deleteInvoiceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects zero", () => {
    const r = deleteInvoiceSchema.safeParse({ invoiceId: 0 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

import {
  invoiceRowOutputSchema,
  listInvoicesOutputSchema,
  candidatePayoutOutputSchema,
  metricOutputSchema,
  invoiceNestedOutputSchema,
  invoiceDetailOutputSchema,
  invoiceMutationOutputSchema,
} from "./schemas";

describe("invoiceRowOutputSchema", () => {
  it("accepts a valid invoice row", () => {
    const row = {
      invoice_id: 101,
      transfer_id: 5,
      company_name: "Acme Corp",
      invoice_date: "2026-06-01T00:00:00.000Z",
      invoice_status: "paid",
      total: "5000.00",
      currency_code: "KWD",
    };
    expect(invoiceRowOutputSchema.safeParse(row).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const row = {
      invoice_id: 101,
      transfer_id: null,
      company_name: null,
      invoice_date: null,
      invoice_status: null,
      total: null,
      currency_code: null,
    };
    expect(invoiceRowOutputSchema.safeParse(row).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(invoiceRowOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-number invoice_id", () => {
    const row = {
      invoice_id: "abc",
      transfer_id: null,
      company_name: null,
      invoice_date: null,
      invoice_status: null,
      total: null,
      currency_code: null,
    };
    expect(invoiceRowOutputSchema.safeParse(row).success).toBe(false);
  });
});

describe("listInvoicesOutputSchema", () => {
  const validItem = {
    invoice_id: 101,
    transfer_id: null,
    company_name: null,
    invoice_date: null,
    invoice_status: null,
    total: null,
    currency_code: null,
  };

  it("accepts a valid list result", () => {
    const result = {
      items: [validItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(listInvoicesOutputSchema.safeParse(result).success).toBe(true);
  });

  it("accepts empty items", () => {
    const result = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(listInvoicesOutputSchema.safeParse(result).success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = {
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(listInvoicesOutputSchema.safeParse(result).success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = {
      items: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    };
    expect(listInvoicesOutputSchema.safeParse(result).success).toBe(false);
  });
});

describe("candidatePayoutOutputSchema", () => {
  it("accepts a valid payout entry", () => {
    const payout = {
      tc_id: 42,
      candidate_name: "Ahmed Al-Mutairi",
      hours: 120,
      amount: "2400.00",
      paid: 0,
    };
    expect(candidatePayoutOutputSchema.safeParse(payout).success).toBe(true);
  });

  it("accepts null candidate_name and hours", () => {
    const payout = {
      tc_id: 42,
      candidate_name: null,
      hours: null,
      amount: null,
      paid: 0,
    };
    expect(candidatePayoutOutputSchema.safeParse(payout).success).toBe(true);
  });

  it("rejects missing tc_id", () => {
    const payout = {
      candidate_name: null,
      hours: null,
      amount: null,
      paid: 0,
    };
    expect(candidatePayoutOutputSchema.safeParse(payout).success).toBe(false);
  });
});

describe("metricOutputSchema", () => {
  it("accepts string value", () => {
    const m = { label: "Status", value: "paid", note: "" };
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

describe("invoiceNestedOutputSchema", () => {
  it("accepts a valid nested invoice with company", () => {
    const inv = {
      invoice_id: 1,
      transfer_id: 5,
      invoice_date: "2026-06-01T00:00:00.000Z",
      invoice_status: "paid",
      total: "5000.00",
      company_total: "4500.00",
      currency_code: "KWD",
      payment_received_on: "2026-06-10T00:00:00.000Z",
      company: { company_name: "Acme Corp", company_email: "billing@acme.com" },
    };
    expect(invoiceNestedOutputSchema.safeParse(inv).success).toBe(true);
  });

  it("accepts null company", () => {
    const inv = {
      invoice_id: 1,
      transfer_id: null,
      invoice_date: null,
      invoice_status: null,
      total: null,
      company_total: null,
      currency_code: null,
      payment_received_on: null,
      company: null,
    };
    expect(invoiceNestedOutputSchema.safeParse(inv).success).toBe(true);
  });

  it("rejects missing invoice_id", () => {
    const inv = {
      transfer_id: null,
      invoice_date: null,
      invoice_status: null,
      total: null,
      company_total: null,
      currency_code: null,
      payment_received_on: null,
      company: null,
    };
    expect(invoiceNestedOutputSchema.safeParse(inv).success).toBe(false);
  });
});

describe("invoiceDetailOutputSchema", () => {
  it("accepts a valid detail result", () => {
    const result = {
      invoice: {
        invoice_id: 1,
        transfer_id: null,
        invoice_date: null,
        invoice_status: null,
        total: null,
        company_total: null,
        currency_code: null,
        payment_received_on: null,
        company: null,
      },
      candidate_payouts: [],
      metrics: [],
    };
    expect(invoiceDetailOutputSchema.safeParse(result).success).toBe(true);
  });

  it("accepts null invoice (not found)", () => {
    const result = { invoice: null, candidate_payouts: [], metrics: [] };
    expect(invoiceDetailOutputSchema.safeParse(result).success).toBe(true);
  });

  it("rejects missing metrics", () => {
    const result = { invoice: null, candidate_payouts: [] };
    expect(invoiceDetailOutputSchema.safeParse(result).success).toBe(false);
  });
});

describe("invoiceMutationOutputSchema", () => {
  it("accepts a valid mutation result", () => {
    expect(invoiceMutationOutputSchema.safeParse({ invoice_id: 42 }).success).toBe(true);
  });

  it("rejects missing invoice_id", () => {
    expect(invoiceMutationOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-number invoice_id", () => {
    expect(invoiceMutationOutputSchema.safeParse({ invoice_id: "abc" }).success).toBe(false);
  });
});

// ── Runtime tests with mocked Prisma ─────────────────────────
// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapabilityInv,
  mockRevalidatePathInv,
  mockFindManyInv,
  mockCountInv,
  mockFindFirstInv,
  mockCreateInv,
  mockUpdateInv,
} = vi.hoisted(() => ({
  mockRequireCapabilityInv: vi.fn(),
  mockRevalidatePathInv: vi.fn(),
  mockFindManyInv: vi.fn(),
  mockCountInv: vi.fn(),
  mockFindFirstInv: vi.fn(),
  mockCreateInv: vi.fn(),
  mockUpdateInv: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapabilityInv,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePathInv,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: {
      findMany: mockFindManyInv,
      count: mockCountInv,
      findFirst: mockFindFirstInv,
      create: mockCreateInv,
      update: mockUpdateInv,
    },
  },
}));

import {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "./actions";

// ---------------------------------------------------------------------------
// listInvoices — runtime
// ---------------------------------------------------------------------------

describe("listInvoices — runtime", () => {
  const MOCK_INVOICES = [
    {
      invoice_id: 1,
      transfer_id: 100,
      invoice_date: new Date("2026-06-01"),
      invoice_status: "paid",
      transfer: {
        transfer_id: 100,
        total: 5000,
        currency_code: "KWD",
        company: { company_name: "Acme Corp" },
      },
    },
    {
      invoice_id: 2,
      transfer_id: null,
      invoice_date: null,
      invoice_status: null,
      transfer: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityInv.mockResolvedValue(undefined);
    mockFindManyInv.mockResolvedValue(MOCK_INVOICES);
    mockCountInv.mockResolvedValue(2);
  });

  it("returns paginated invoice list with items and totals", async () => {
    const result = await listInvoices({});
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
  });

  it("calls requireCapability with finance.read", async () => {
    await listInvoices({});
    expect(mockRequireCapabilityInv).toHaveBeenCalledWith("finance.read");
  });

  it("queries Prisma with default pagination (skip=0, take=20)", async () => {
    await listInvoices({});
    expect(mockFindManyInv).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
  });

  it("applies status filter when provided", async () => {
    await listInvoices({ status: "paid" });
    expect(mockFindManyInv).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ invoice_status: "paid" }),
      }),
    );
  });

  it("applies dateFrom filter as gte date", async () => {
    await listInvoices({ dateFrom: "2026-01-01" });
    const call = mockFindManyInv.mock.calls[0][0];
    expect(call.where).toBeDefined();
    expect(call.where.invoice_date).toBeDefined();
    expect(call.where.invoice_date.gte).toBeInstanceOf(Date);
  });

  it("applies dateTo filter as lte date", async () => {
    await listInvoices({ dateTo: "2026-06-30" });
    const call = mockFindManyInv.mock.calls[0][0];
    expect(call.where.invoice_date).toBeDefined();
    expect(call.where.invoice_date.lte).toBeInstanceOf(Date);
  });

  it("applies companyId filter via transfer.company_id", async () => {
    await listInvoices({ companyId: 5 });
    expect(mockFindManyInv).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          transfer: { company_id: 5 },
        }),
      }),
    );
  });

  it("maps invoice to InvoiceRow format with company name", async () => {
    const result = await listInvoices({});
    expect(result.items[0].company_name).toBe("Acme Corp");
    expect(result.items[0].invoice_status).toBe("paid");
    expect(result.items[0].total).toBe("5000");
  });

  it("handles invoices with null transfer gracefully", async () => {
    const result = await listInvoices({});
    expect(result.items[1].company_name).toBeNull();
    expect(result.items[1].total).toBeNull();
  });

  it("computes totalPages correctly", async () => {
    mockFindManyInv.mockResolvedValue(MOCK_INVOICES.slice(0, 1));
    mockCountInv.mockResolvedValue(25);
    const result = await listInvoices({ limit: 10 });
    expect(result.totalPages).toBe(3);
  });

  it("returns empty result on invalid input", async () => {
    const result = await listInvoices({ page: -1, limit: 20 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getInvoice — runtime
// ---------------------------------------------------------------------------

describe("getInvoice — runtime", () => {
  const MOCK_INVOICE = {
    invoice_id: 1,
    transfer_id: 100,
    invoice_date: new Date("2026-06-01"),
    invoice_status: "paid",
    transfer: {
      transfer_id: 100,
      total: 5000,
      company_total: 4500,
      currency_code: "KWD",
      payment_received_on: new Date("2026-06-10"),
      company: {
        company_name: "Acme Corp",
        company_email: "billing@acme.com",
      },
      transfer_candidate: [
        {
          tc_id: 1,
          hours: 120,
          candidate_total: "2400",
          paid: 0,
          candidate: { candidate_name: "Ahmed" },
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityInv.mockResolvedValue(undefined);
    mockFindFirstInv.mockResolvedValue(MOCK_INVOICE);
  });

  it("returns full invoice detail with company and candidate payouts", async () => {
    const result = await getInvoice(1);
    expect(result.invoice).not.toBeNull();
    expect(result.invoice!.invoice_id).toBe(1);
    expect(result.invoice!.company!.company_name).toBe("Acme Corp");
    expect(result.candidate_payouts).toHaveLength(1);
    expect(result.candidate_payouts[0].candidate_name).toBe("Ahmed");
    expect(result.candidate_payouts[0].amount).toBe("2400");
  });

  it("calls requireCapability with finance.read", async () => {
    await getInvoice(1);
    expect(mockRequireCapabilityInv).toHaveBeenCalledWith("finance.read");
  });

  it("queries Prisma with deleted: 0 filter", async () => {
    await getInvoice(1);
    expect(mockFindFirstInv).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ invoice_id: 1, deleted: 0 }),
      }),
    );
  });

  it("returns metrics array with status, count, and total", async () => {
    const result = await getInvoice(1);
    expect(result.metrics).toBeDefined();
    expect(result.metrics.length).toBeGreaterThanOrEqual(3);
    const totalMetric = result.metrics.find((m) => m.label === "Total");
    expect(totalMetric).toBeDefined();
    expect(totalMetric!.value).toBe("5000");
  });

  it("returns null invoice with empty arrays when not found", async () => {
    mockFindFirstInv.mockResolvedValue(null);
    const result = await getInvoice(999);
    expect(result.invoice).toBeNull();
    expect(result.candidate_payouts).toEqual([]);
    expect(result.metrics).toEqual([]);
  });

  it("throws on invalid input (zero ID)", async () => {
    await expect(getInvoice(0)).rejects.toThrow();
  });

  it("throws on invalid input (negative ID)", async () => {
    await expect(getInvoice(-1)).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// createInvoice — runtime
// ---------------------------------------------------------------------------

describe("createInvoice — runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityInv.mockResolvedValue(undefined);
    mockCreateInv.mockResolvedValue({ invoice_id: 1 });
  });

  it("creates invoice and returns invoice_id", async () => {
    const result = await createInvoice({ invoice_status: "unpaid" });
    expect(result.invoice_id).toBe(1);
  });

  it("calls requireCapability with finance.write", async () => {
    await createInvoice({ invoice_status: "unpaid" });
    expect(mockRequireCapabilityInv).toHaveBeenCalledWith("finance.write");
  });

  it("passes transfer_id and invoice_date to Prisma create", async () => {
    await createInvoice({
      transfer_id: 50,
      invoice_date: "2026-06-15",
      invoice_status: "paid",
    });
    expect(mockCreateInv).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          transfer_id: 50,
          invoice_status: "paid",
        }),
      }),
    );
  });

  it("converts invoice_date string to Date for Prisma", async () => {
    await createInvoice({
      invoice_date: "2026-06-15",
      invoice_status: "unpaid",
    });
    const call = mockCreateInv.mock.calls[0][0];
    expect(call.data.invoice_date).toBeInstanceOf(Date);
  });

  it("re-validates /admin/invoices on success", async () => {
    await createInvoice({ invoice_status: "unpaid" });
    expect(mockRevalidatePathInv).toHaveBeenCalledWith("/admin/invoices");
  });

  it("defaults invoice_status to unpaid", async () => {
    await createInvoice({});
    expect(mockCreateInv).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ invoice_status: "unpaid" }),
      }),
    );
  });

  it("throws on validation failure (invalid status)", async () => {
    await expect(
      createInvoice({ invoice_status: "pending" as any }),
    ).rejects.toThrow();
  });

  it("throws on Prisma exception", async () => {
    mockCreateInv.mockRejectedValue(new Error("Duplicate entry"));
    await expect(
      createInvoice({ invoice_status: "unpaid" }),
    ).rejects.toThrow("Duplicate entry");
  });
});

// ---------------------------------------------------------------------------
// updateInvoice — runtime
// ---------------------------------------------------------------------------

describe("updateInvoice — runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityInv.mockResolvedValue(undefined);
    mockUpdateInv.mockResolvedValue({ invoice_id: 1 });
  });

  it("updates invoice and returns invoice_id", async () => {
    const result = await updateInvoice({
      invoiceId: 1,
      invoice_status: "paid",
    });
    expect(result.invoice_id).toBe(1);
  });

  it("calls requireCapability with finance.write", async () => {
    await updateInvoice({ invoiceId: 1, invoice_status: "paid" });
    expect(mockRequireCapabilityInv).toHaveBeenCalledWith("finance.write");
  });

  it("only includes provided fields in update data", async () => {
    await updateInvoice({ invoiceId: 1, invoice_status: "paid" });
    const call = mockUpdateInv.mock.calls[0][0];
    expect(call.data.invoice_status).toBe("paid");
    expect(call.data.transfer_id).toBeUndefined();
    expect(call.data.invoice_date).toBeUndefined();
  });

  it("converts invoice_date string to Date when provided", async () => {
    await updateInvoice({
      invoiceId: 1,
      invoice_date: "2026-06-20",
    });
    const call = mockUpdateInv.mock.calls[0][0];
    expect(call.data.invoice_date).toBeInstanceOf(Date);
  });

  it("re-validates /admin/invoices on success", async () => {
    await updateInvoice({ invoiceId: 1, invoice_status: "paid" });
    expect(mockRevalidatePathInv).toHaveBeenCalledWith("/admin/invoices");
  });

  it("throws on validation failure (missing invoiceId)", async () => {
    await expect(updateInvoice({} as any)).rejects.toThrow();
  });

  it("throws on Prisma exception", async () => {
    mockUpdateInv.mockRejectedValue(new Error("FK constraint"));
    await expect(
      updateInvoice({ invoiceId: 1, invoice_status: "paid" }),
    ).rejects.toThrow("FK constraint");
  });
});

// ---------------------------------------------------------------------------
// deleteInvoice — runtime
// ---------------------------------------------------------------------------

describe("deleteInvoice — runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityInv.mockResolvedValue(undefined);
    mockUpdateInv.mockResolvedValue({ invoice_id: 1 });
  });

  it("soft-deletes invoice and returns invoice_id", async () => {
    const result = await deleteInvoice({ invoiceId: 1 });
    expect(result.invoice_id).toBe(1);
  });

  it("calls requireCapability with finance.write", async () => {
    await deleteInvoice({ invoiceId: 1 });
    expect(mockRequireCapabilityInv).toHaveBeenCalledWith("finance.write");
  });

  it("marks as deleted=1", async () => {
    await deleteInvoice({ invoiceId: 1 });
    expect(mockUpdateInv).toHaveBeenCalledWith({
      where: { invoice_id: 1 },
      data: { deleted: 1 },
    });
  });

  it("re-validates /admin/invoices on success", async () => {
    await deleteInvoice({ invoiceId: 1 });
    expect(mockRevalidatePathInv).toHaveBeenCalledWith("/admin/invoices");
  });

  it("throws on validation failure (zero ID)", async () => {
    await expect(deleteInvoice({ invoiceId: 0 })).rejects.toThrow();
  });

  it("throws on Prisma exception", async () => {
    mockUpdateInv.mockRejectedValue(new Error("DB error"));
    await expect(deleteInvoice({ invoiceId: 1 })).rejects.toThrow("DB error");
  });
});
