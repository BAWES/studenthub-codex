import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listTransfersSchema,
  getTransferSchema,
  approveTransferSchema,
  rejectTransferSchema,
  listTransfersResultSchema,
  transferDetailResultSchema,
  transferActionResponseSchema,
  adminTransferDetailResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listTransfersSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listTransfersSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination and filter params", () => {
    const r = listTransfersSchema.safeParse({ page: 2, limit: 10, companyId: 5, status: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.companyId).toBe(5);
      expect(r.data.status).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listTransfersSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listTransfersSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects negative companyId", () => {
    expect(listTransfersSchema.safeParse({ companyId: -5 }).success).toBe(false);
  });

  it("coerces string values to numbers", () => {
    const r = listTransfersSchema.safeParse({ page: "2", limit: "15", companyId: "3" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(15);
      expect(r.data.companyId).toBe(3);
    }
  });
});

describe("getTransferSchema", () => {
  it("accepts a valid positive transfer ID", () => {
    const r = getTransferSchema.safeParse({ transferId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects zero ID", () => {
    expect(getTransferSchema.safeParse({ transferId: 0 }).success).toBe(false);
  });

  it("rejects negative ID", () => {
    expect(getTransferSchema.safeParse({ transferId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric ID", () => {
    expect(getTransferSchema.safeParse({ transferId: "abc" }).success).toBe(false);
  });

  it("coerces string transferId to number", () => {
    const r = getTransferSchema.safeParse({ transferId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transferId).toBe(99);
    }
  });
});

describe("approveTransferSchema", () => {
  it("accepts a valid transfer ID", () => {
    const r = approveTransferSchema.safeParse({ transferId: 7 });
    expect(r.success).toBe(true);
  });

  it("rejects missing transferId", () => {
    expect(approveTransferSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero transferId", () => {
    expect(approveTransferSchema.safeParse({ transferId: 0 }).success).toBe(false);
  });
});

describe("rejectTransferSchema", () => {
  it("accepts valid transfer ID and reason", () => {
    const r = rejectTransferSchema.safeParse({ transferId: 7, reason: "Incorrect period dates" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.reason).toBe("Incorrect period dates");
    }
  });

  it("rejects missing reason", () => {
    expect(rejectTransferSchema.safeParse({ transferId: 7 }).success).toBe(false);
  });

  it("rejects empty reason", () => {
    expect(rejectTransferSchema.safeParse({ transferId: 7, reason: "" }).success).toBe(false);
  });

  it("rejects reason exceeding 500 chars", () => {
    const longReason = "x".repeat(501);
    expect(rejectTransferSchema.safeParse({ transferId: 7, reason: longReason }).success).toBe(false);
  });

  it("rejects missing transferId", () => {
    expect(rejectTransferSchema.safeParse({ reason: "No reason" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("listTransfersResultSchema", () => {
  it("validates a valid paginated response", () => {
    const r = listTransfersResultSchema.safeParse({
      items: [
        {
          id: 1,
          company: "ACME Corp",
          period: "Jan 1 – Jan 15",
          status: "Pending",
          statusCode: 10,
          total: "5000.000",
          currencyCode: "KWD",
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative page", () => {
    const r = listTransfersResultSchema.safeParse({
      items: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("validates empty items array", () => {
    const r = listTransfersResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing items", () => {
    const r = listTransfersResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

describe("transferDetailResultSchema", () => {
  it("validates a full transfer detail", () => {
    const r = transferDetailResultSchema.safeParse({
      transfer: {
        transferId: 1,
        total: "5000.000",
        companyTotal: "6000.000",
        transferCost: "1000.000",
        status: "Pending",
        statusLabel: "Pending",
        currencyCode: "KWD",
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: "2024-01-15T00:00:00.000Z",
        paymentReceivedOn: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: null,
        companyName: "ACME Corp",
        companyEmail: "acme@test.com",
      },
      candidates: [
        {
          tcId: 1,
          candidateName: "John Doe",
          hours: 40,
          amount: "500.000",
          paid: 1,
        },
      ],
      invoices: [
        {
          invoiceId: 1,
          invoiceDate: "2024-01-10T00:00:00.000Z",
          invoiceStatus: "Status 1",
        },
      ],
      metrics: [
        { label: "Candidate Payouts", value: 1, note: "Transfers to candidates" },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("validates transfer as null", () => {
    const r = transferDetailResultSchema.safeParse({
      transfer: null,
      candidates: [],
      invoices: [],
      metrics: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing transfer field", () => {
    const r = transferDetailResultSchema.safeParse({
      candidates: [],
      invoices: [],
      metrics: [],
    });
    expect(r.success).toBe(false);
  });
});

describe("transferActionResponseSchema", () => {
  it("validates a success response", () => {
    const r = transferActionResponseSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("validates an error response", () => {
    const r = transferActionResponseSchema.safeParse({
      success: false,
      error: "Transfer not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success field", () => {
    const r = transferActionResponseSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("adminTransferDetailResultSchema", () => {
  it("validates a full admin transfer detail", () => {
    const r = adminTransferDetailResultSchema.safeParse({
      transfer: {
        transfer_id: 1,
        total: "5000.000",
        company_total: "6000.000",
        transfer_cost: "1000.000",
        transfer_status: 10,
        currency_code: "KWD",
        start_date: new Date("2024-01-01"),
        end_date: new Date("2024-01-15"),
        payment_received_on: null,
        transfer_created_at: new Date("2024-01-01"),
        transfer_updated_at: new Date("2024-01-01"),
        company: { company_name: "ACME", company_email: "acme@test.com" },
        staff_transfer_transfer_created_byTostaff: null,
        staff_transfer_transfer_updated_byTostaff: null,
      },
      candidates: [
        { id: 1, title: "John Doe", subtitle: "Amount: 500", meta: "" },
      ],
      invoices: [
        { id: 1, title: "Invoice #1", subtitle: "Status 1", meta: "2024-01-10" },
      ],
      metrics: [
        { label: "Candidate Payouts", value: 1, note: "Transfers to candidates" },
      ],
      fileEntries: [],
    });
    expect(r.success).toBe(true);
  });

  it("validates transfer as null", () => {
    const r = adminTransferDetailResultSchema.safeParse({
      transfer: null,
      candidates: [],
      invoices: [],
      metrics: [],
      fileEntries: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing fileEntries", () => {
    const r = adminTransferDetailResultSchema.safeParse({
      transfer: null,
      candidates: [],
      invoices: [],
      metrics: [],
    });
    expect(r.success).toBe(false);
  });
});

// ── Runtime tests with mocked Prisma ─────────────────────────
// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapabilityTR,
  mockRevalidatePathTR,
  mockFindManyTransferTR,
  mockCountTransferTR,
  mockFindUniqueTransferTR,
  mockUpdateTransferTR,
  mockFindManyCandidateTR,
  mockFindManyInvoiceTR,
  mockTransactionTR,
} = vi.hoisted(() => ({
  mockRequireCapabilityTR: vi.fn(),
  mockRevalidatePathTR: vi.fn(),
  mockFindManyTransferTR: vi.fn(),
  mockCountTransferTR: vi.fn(),
  mockFindUniqueTransferTR: vi.fn(),
  mockUpdateTransferTR: vi.fn(),
  mockFindManyCandidateTR: vi.fn(),
  mockFindManyInvoiceTR: vi.fn(),
  mockTransactionTR: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapabilityTR,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePathTR,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    transfer: {
      findMany: mockFindManyTransferTR,
      count: mockCountTransferTR,
      findUnique: mockFindUniqueTransferTR,
      update: mockUpdateTransferTR,
    },
    transfer_candidate: {
      findMany: mockFindManyCandidateTR,
    },
    invoice: {
      findMany: mockFindManyInvoiceTR,
    },
    $transaction: mockTransactionTR,
  },
}));

import {
  listTransfers,
  getTransferDetail,
  approveTransfer,
  rejectTransfer,
} from "./actions";

// ---------------------------------------------------------------------------
// listTransfers — runtime
// ---------------------------------------------------------------------------

describe("listTransfers — runtime", () => {
  const MOCK_TRANSFERS = [
    {
      transfer_id: 1,
      transfer_status: 10,
      total: 5000,
      currency_code: "KWD",
      start_date: new Date("2026-01-01"),
      end_date: new Date("2026-01-15"),
      transfer_created_at: new Date("2026-01-01T00:00:00.000Z"),
      company: { company_name: "Acme Corp" },
      transfer_candidate: [{ tc_id: 1 }],
    },
    {
      transfer_id: 2,
      transfer_status: 20,
      total: 3000,
      currency_code: "KWD",
      start_date: new Date("2026-02-01"),
      end_date: new Date("2026-02-15"),
      transfer_created_at: new Date("2026-02-01T00:00:00.000Z"),
      company: { company_name: "Beta Ltd" },
      transfer_candidate: [],
    },
  ] as any[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityTR.mockResolvedValue(undefined);
    mockFindManyTransferTR.mockResolvedValue(MOCK_TRANSFERS);
    mockCountTransferTR.mockResolvedValue(2);
  });

  it("calls requireCapability with finance.read", async () => {
    await listTransfers({});
    expect(mockRequireCapabilityTR).toHaveBeenCalledWith("finance.read");
  });

  it("returns paginated list with items, total, page, limit, totalPages", async () => {
    const result = await listTransfers({});
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
  });

  it("queries Prisma with default pagination (skip=0, take=20)", async () => {
    await listTransfers({});
    expect(mockFindManyTransferTR).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
  });

  it("queries Prisma count with the same where filter", async () => {
    await listTransfers({ companyId: 5 });
    expect(mockCountTransferTR).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ company_id: 5 }),
      }),
    );
  });

  it("applies status filter when provided", async () => {
    await listTransfers({ status: 10 });
    expect(mockFindManyTransferTR).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ transfer_status: 10 }),
      }),
    );
  });

  it("applies companyId filter when provided", async () => {
    await listTransfers({ companyId: 5 });
    expect(mockFindManyTransferTR).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ company_id: 5 }),
      }),
    );
  });

  it("computes totalPages correctly for large total", async () => {
    mockCountTransferTR.mockResolvedValue(55);
    const result = await listTransfers({ limit: 10 });
    expect(result.totalPages).toBe(6);
  });

  it("maps Prisma rows to TransferRow format", async () => {
    const result = await listTransfers({});
    const first = result.items[0];
    expect(first.id).toBe(1);
    expect(first.company).toBe("Acme Corp");
    expect(first.status).toBe("Pending");
    expect(first.statusCode).toBe(10);
    expect(first.total).toBe("5000");
    expect(first.currencyCode).toBe("KWD");
  });

  it("returns empty result on invalid input", async () => {
    const result = await listTransfers({ page: -1, limit: 20 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getTransferDetail — runtime
// ---------------------------------------------------------------------------

describe("getTransferDetail — runtime", () => {
  const MOCK_TRANSFER = {
    transfer_id: 1,
    transfer_status: 10,
    total: 5000,
    company_total: 6000,
    transfer_cost: 1000,
    currency_code: "KWD",
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-01-15"),
    payment_received_on: null,
    transfer_created_at: new Date("2026-01-01T00:00:00.000Z"),
    transfer_updated_at: null,
    company: {
      company_name: "Acme Corp",
      company_email: "acme@test.com",
    },
  } as any;

  const MOCK_CANDIDATES = [
    {
      tc_id: 1,
      hours: 40,
      candidate_total: 500,
      paid: 1,
      candidate: { candidate_name: "John Doe" },
    },
  ] as any[];

  const MOCK_INVOICES = [
    {
      invoice_id: 101,
      invoice_date: new Date("2026-01-10"),
      invoice_status: 1,
    },
  ] as any[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityTR.mockResolvedValue(undefined);
    mockTransactionTR.mockResolvedValue([
      MOCK_TRANSFER,
      MOCK_CANDIDATES,
      MOCK_INVOICES,
    ]);
  });

  it("calls requireCapability with finance.read", async () => {
    await getTransferDetail(1);
    expect(mockRequireCapabilityTR).toHaveBeenCalledWith("finance.read");
  });

  it("calls prisma.$transaction with findUnique, transfer_candidate.findMany, invoice.findMany", async () => {
    await getTransferDetail(1);
    expect(mockTransactionTR).toHaveBeenCalledTimes(1);
    const queries = mockTransactionTR.mock.calls[0][0];
    expect(queries).toHaveLength(3);
  });

  it("queries transfer.findUnique with correct where and includes", async () => {
    await getTransferDetail(1);
    expect(mockFindUniqueTransferTR).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { transfer_id: 1 },
        include: { company: expect.anything() },
      }),
    );
  });

  it("queries transfer_candidate.findMany with correct where and includes", async () => {
    await getTransferDetail(1);
    expect(mockFindManyCandidateTR).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { transfer_id: 1, deleted: 0 },
        include: { candidate: expect.anything() },
      }),
    );
  });

  it("queries invoice.findMany with correct where", async () => {
    await getTransferDetail(1);
    expect(mockFindManyInvoiceTR).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { transfer_id: 1, deleted: 0 },
      }),
    );
  });

  it("returns full detail with transfer, candidates, invoices, and metrics", async () => {
    const result = await getTransferDetail(1);
    expect(result.transfer).not.toBeNull();
    expect(result.transfer!.transferId).toBe(1);
    expect(result.transfer!.status).toBe("Pending");
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].candidateName).toBe("John Doe");
    expect(result.candidates[0].amount).toBe("500");
    expect(result.invoices).toHaveLength(1);
    expect(result.metrics).toHaveLength(4);
  });

  it("throws when transfer is not found", async () => {
    mockTransactionTR.mockResolvedValue([null, [], []]);
    await expect(getTransferDetail(999)).rejects.toThrow("Transfer #999 not found");
  });

  it("throws on invalid input (zero ID)", async () => {
    await expect(getTransferDetail(0)).rejects.toThrow();
  });

  it("throws on invalid input (negative ID)", async () => {
    await expect(getTransferDetail(-1)).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// approveTransfer — runtime
// ---------------------------------------------------------------------------

describe("approveTransfer — runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityTR.mockResolvedValue(undefined);
    mockFindUniqueTransferTR.mockResolvedValue({
      transfer_id: 1,
      transfer_status: 10,
    });
    mockUpdateTransferTR.mockResolvedValue({
      transfer_id: 1,
      transfer_status: 20,
    });
  });

  it("calls requireCapability with finance.mutate", async () => {
    await approveTransfer(1);
    expect(mockRequireCapabilityTR).toHaveBeenCalledWith("finance.mutate");
  });

  it("updates transfer status to 20 (approved/locked)", async () => {
    await approveTransfer(1);
    expect(mockUpdateTransferTR).toHaveBeenCalledWith({
      where: { transfer_id: 1 },
      data: { transfer_status: 20 },
    });
  });

  it("calls revalidatePath for /admin/transfers and detail page", async () => {
    await approveTransfer(1);
    expect(mockRevalidatePathTR).toHaveBeenCalledWith("/admin/transfers");
    expect(mockRevalidatePathTR).toHaveBeenCalledWith("/admin/transfers/1");
  });

  it("returns success:true on approval", async () => {
    const result = await approveTransfer(1);
    expect(result.success).toBe(true);
  });

  it("returns error if transfer not found", async () => {
    mockFindUniqueTransferTR.mockResolvedValue(null);
    const result = await approveTransfer(999);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Transfer not found");
  });

  it("returns error if transfer is not pending", async () => {
    mockFindUniqueTransferTR.mockResolvedValue({
      transfer_id: 1,
      transfer_status: 20,
    });
    const result = await approveTransfer(1);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Only pending transfers");
  });

  it("returns error on invalid input (zero ID)", async () => {
    const result = await approveTransfer(0);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("throws on Prisma exception from findUnique", async () => {
    mockFindUniqueTransferTR.mockRejectedValue(new Error("DB connection lost"));
    await expect(approveTransfer(1)).rejects.toThrow("DB connection lost");
  });
});

// ---------------------------------------------------------------------------
// rejectTransfer — runtime
// ---------------------------------------------------------------------------

describe("rejectTransfer — runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityTR.mockResolvedValue(undefined);
    mockFindUniqueTransferTR.mockResolvedValue({
      transfer_id: 1,
      transfer_status: 10,
    });
    mockUpdateTransferTR.mockResolvedValue({
      transfer_id: 1,
      transfer_status: 30,
    });
  });

  it("calls requireCapability with finance.mutate", async () => {
    await rejectTransfer(1, "Incorrect period dates");
    expect(mockRequireCapabilityTR).toHaveBeenCalledWith("finance.mutate");
  });

  it("updates transfer status to 30 (cancelled/rejected)", async () => {
    await rejectTransfer(1, "Incorrect period dates");
    expect(mockUpdateTransferTR).toHaveBeenCalledWith({
      where: { transfer_id: 1 },
      data: { transfer_status: 30 },
    });
  });

  it("calls revalidatePath for /admin/transfers and detail page", async () => {
    await rejectTransfer(1, "Incorrect period dates");
    expect(mockRevalidatePathTR).toHaveBeenCalledWith("/admin/transfers");
    expect(mockRevalidatePathTR).toHaveBeenCalledWith("/admin/transfers/1");
  });

  it("returns success:true on rejection", async () => {
    const result = await rejectTransfer(1, "Incorrect period dates");
    expect(result.success).toBe(true);
  });

  it("returns error if reason is empty", async () => {
    const result = await rejectTransfer(1, "");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Reason is required");
  });

  it("returns error if reason is only whitespace", async () => {
    const result = await rejectTransfer(1, "   ");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Reason is required");
  });

  it("returns error if transfer not found", async () => {
    mockFindUniqueTransferTR.mockResolvedValue(null);
    const result = await rejectTransfer(999, "No reason");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Transfer not found");
  });

  it("returns error if transfer is not pending", async () => {
    mockFindUniqueTransferTR.mockResolvedValue({
      transfer_id: 1,
      transfer_status: 30,
    });
    const result = await rejectTransfer(1, "No reason");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Only pending transfers");
  });

  it("returns error on invalid input (zero ID)", async () => {
    const result = await rejectTransfer(0, "No reason");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns error on Prisma exception during update", async () => {
    mockFindUniqueTransferTR.mockResolvedValue({
      transfer_id: 1,
      transfer_status: 10,
    });
    mockUpdateTransferTR.mockRejectedValue(new Error("Update failed"));
    const result = await rejectTransfer(1, "No reason");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Update failed");
  });
});
