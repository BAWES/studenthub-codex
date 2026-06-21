import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import {
  listTransferCandidatesSchema,
  getTransferCandidateSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Mock prisma before importing the module under test
// ---------------------------------------------------------------------------

const mockFindMany = vi.hoisted(() => vi.fn());
const mockCount = vi.hoisted(() => vi.fn());
const mockFindUnique = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    transfer_candidate: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
    },
  },
}));

// Mock requireCapability
const mockRequireCapability = vi.hoisted(() => vi.fn());
vi.mock("@/modules/auth/session", () => ({
  requireCapability: (...args: unknown[]) => mockRequireCapability(...args),
}));

// Import AFTER mocks are hoisted
const { listTransferCandidates, getTransferCandidate } = await import("./actions");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetMocks() {
  mockFindMany.mockReset();
  mockCount.mockReset();
  mockFindUnique.mockReset();
  mockRequireCapability.mockReset();
  mockRequireCapability.mockResolvedValue(undefined);
}

function makePrismaRow(overrides: Record<string, unknown> = {}) {
  return {
    tc_id: 1,
    transfer_id: 42,
    candidate_id: 100,
    prev_candidate_id: null,
    store_id: 5,
    store_name: "Main Branch",
    company_id: 3,
    company_name: "Acme Corp",
    company_email: "hr@acme.com",
    bank_id: 10,
    transfer_confirmation_id: "CNF-001",
    transfer_file_id: null,
    transfer_benef_name: "John Doe",
    transfer_benef_iban: "KW1234567890",
    candidate_hourly_rate: 10.5,
    company_hourly_rate: 15.0,
    hours: 8,
    minutes: 30,
    seconds: 0,
    bonus: 100,
    bonus_commission: 20,
    transfer_cost: 200,
    candidate_total: 84,
    company_total: 120,
    deleted: 0,
    paid: 1,
    is_candidate_notified: true,
    currency_code: "KWD",
    contract_uuid: "550e8400-e29b-41d4-a716-446655440000",
    tc_created_at: new Date("2026-01-01"),
    tc_updated_at: new Date("2026-01-15"),
    candidate: {
      candidate_id: 100,
      candidate_name: "John Doe",
      candidate_name_ar: "جون دو",
    },
    transfer: {
      transfer_id: 42,
      transfer_status: 1,
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Schema validation tests (existing — kept for TDD regression)
// ---------------------------------------------------------------------------

describe("listTransferCandidatesSchema", () => {
  it("accepts empty params (all optional)", () => {
    const result = listTransferCandidatesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tcId).toBeUndefined();
      expect(result.data.transferConfirmationId).toBeUndefined();
      expect(result.data.candidateId).toBeUndefined();
      expect(result.data.transferId).toBeUndefined();
      expect(result.data.transferFileId).toBeUndefined();
    }
  });

  it("accepts tcId as string", () => {
    const result = listTransferCandidatesSchema.safeParse({ tcId: "1,2,3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tcId).toBe("1,2,3");
    }
  });

  it("accepts transferConfirmationId as string", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferConfirmationId: "CNF-12345",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transferConfirmationId).toBe("CNF-12345");
    }
  });

  it("accepts candidateId as number", () => {
    const result = listTransferCandidatesSchema.safeParse({
      candidateId: 42,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts transferId as number", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferId: 7,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transferId).toBe(7);
    }
  });

  it("accepts transferFileId as number", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferFileId: 99,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transferFileId).toBe(99);
    }
  });

  it("coerces candidateId string to number", () => {
    const result = listTransferCandidatesSchema.safeParse({
      candidateId: "42",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("coerces transferId string to number", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferId: "7",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transferId).toBe(7);
    }
  });

  it("coerces transferFileId string to number", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferFileId: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transferFileId).toBe(15);
    }
  });

  it("rejects zero candidateId", () => {
    const result = listTransferCandidatesSchema.safeParse({
      candidateId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    const result = listTransferCandidatesSchema.safeParse({
      candidateId: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero transferId", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative transferId", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferId: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero transferFileId", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferFileId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative transferFileId", () => {
    const result = listTransferCandidatesSchema.safeParse({
      transferFileId: -3,
    });
    expect(result.success).toBe(false);
  });

  it("accepts all params together", () => {
    const result = listTransferCandidatesSchema.safeParse({
      tcId: "10,20",
      transferConfirmationId: "CNF-ABC",
      candidateId: 5,
      transferId: 3,
      transferFileId: 8,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tcId).toBe("10,20");
      expect(result.data.transferConfirmationId).toBe("CNF-ABC");
      expect(result.data.candidateId).toBe(5);
      expect(result.data.transferId).toBe(3);
      expect(result.data.transferFileId).toBe(8);
    }
  });
});

describe("getTransferCandidateSchema", () => {
  it("accepts a valid positive tcId", () => {
    const result = getTransferCandidateSchema.safeParse({ tcId: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tcId).toBe(1);
    }
  });

  it("rejects zero tcId", () => {
    const result = getTransferCandidateSchema.safeParse({ tcId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative tcId", () => {
    const result = getTransferCandidateSchema.safeParse({ tcId: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing tcId", () => {
    const result = getTransferCandidateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("coerces string tcId to number", () => {
    const result = getTransferCandidateSchema.safeParse({ tcId: "7" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tcId).toBe(7);
    }
  });

  it("rejects non-numeric string tcId", () => {
    const result = getTransferCandidateSchema.safeParse({ tcId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects decimal tcId", () => {
    const result = getTransferCandidateSchema.safeParse({ tcId: 3.14 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Server action tests (with mocked prisma + session)
// ---------------------------------------------------------------------------

describe("listTransferCandidates", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("requires candidate.read capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Forbidden"));
    await expect(listTransferCandidates({})).rejects.toThrow("Forbidden");
    expect(mockRequireCapability).toHaveBeenCalledWith("candidate.read");
  });

  it("returns empty list when no rows found", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listTransferCandidates({});
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("returns mapped items from prisma rows", async () => {
    const row = makePrismaRow();
    mockFindMany.mockResolvedValue([row]);
    mockCount.mockResolvedValue(1);

    const result = await listTransferCandidates({});
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);

    const item = result.items[0];
    expect(item.tc_id).toBe(1);
    expect(item.store_name).toBe("Main Branch");
    expect(item.company_name).toBe("Acme Corp");
    expect(item.candidate_hourly_rate).toBe(10.5);
    expect(item.company_hourly_rate).toBe(15.0);
    expect(item.hours).toBe(8);
    expect(item.minutes).toBe(30);
    expect(item.currency_code).toBe("KWD");
    expect(item.candidate?.candidate_name).toBe("John Doe");
    expect(item.transfer?.transfer_status).toBe(1);
  });

  it("filters by tcId (comma-separated)", async () => {
    const row1 = makePrismaRow({ tc_id: 1 });
    const row2 = makePrismaRow({ tc_id: 2, candidate_id: 101 });
    mockFindMany.mockResolvedValue([row1, row2]);
    mockCount.mockResolvedValue(2);

    await listTransferCandidates({ tcId: "1,2" });
    const where = mockFindMany.mock.calls[0][0].where;
    expect(where.tc_id).toEqual({ in: [1, 2] });
  });

  it("filters by transferConfirmationId", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listTransferCandidates({ transferConfirmationId: "CNF-ABC" });
    const where = mockFindMany.mock.calls[0][0].where;
    expect(where.transfer_confirmation_id).toBe("CNF-ABC");
  });

  it("filters by candidateId", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listTransferCandidates({ candidateId: 42 });
    const where = mockFindMany.mock.calls[0][0].where;
    expect(where.candidate_id).toBe(42);
  });

  it("filters by transferId", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listTransferCandidates({ transferId: 7 });
    const where = mockFindMany.mock.calls[0][0].where;
    expect(where.transfer_id).toBe(7);
  });

  it("filters by transferFileId", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listTransferCandidates({ transferFileId: 99 });
    const where = mockFindMany.mock.calls[0][0].where;
    expect(where.transfer_file_id).toBe(99);
  });

  it("handles null relations gracefully", async () => {
    const row = makePrismaRow({
      candidate: null,
      transfer: null,
    });
    mockFindMany.mockResolvedValue([row]);
    mockCount.mockResolvedValue(1);

    const result = await listTransferCandidates({});
    expect(result.items[0].candidate).toBeNull();
    expect(result.items[0].transfer).toBeNull();
  });

  it("orders by tc_created_at desc then tc_id desc", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listTransferCandidates({});
    const orderBy = mockFindMany.mock.calls[0][0].orderBy;
    expect(orderBy).toEqual([{ tc_created_at: "desc" }, { tc_id: "desc" }]);
  });

  it("passes tcId filter to count query", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listTransferCandidates({ tcId: "1,2" });
    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tc_id: { in: [1, 2] },
        }),
      }),
    );
  });
});

describe("getTransferCandidate", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("requires candidate.read capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Forbidden"));
    await expect(getTransferCandidate({ tcId: 1 })).rejects.toThrow("Forbidden");
    expect(mockRequireCapability).toHaveBeenCalledWith("candidate.read");
  });

  it("returns null when not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await getTransferCandidate({ tcId: 999 });
    expect(result).toBeNull();
  });

  it("returns mapped item when found", async () => {
    const row = makePrismaRow({ tc_id: 42 });
    mockFindUnique.mockResolvedValue(row);

    const result = await getTransferCandidate({ tcId: 42 });
    expect(result).not.toBeNull();
    expect(result!.tc_id).toBe(42);
    expect(result!.store_name).toBe("Main Branch");
    expect(result!.candidate?.candidate_name).toBe("John Doe");
  });

  it("calls findUnique with correct where clause and includes", async () => {
    mockFindUnique.mockResolvedValue(null);

    await getTransferCandidate({ tcId: 7 });
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { tc_id: 7 },
      include: {
        candidate: { select: { candidate_id: true, candidate_name: true, candidate_name_ar: true } },
        transfer: { select: { transfer_id: true, transfer_status: true } },
      },
    });
  });

  it("rejects with validation error for invalid tcId", async () => {
    await expect(getTransferCandidate({ tcId: 0 })).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Type shape tests (compile-time verification)
// ---------------------------------------------------------------------------

import type {
  TransferCandidateItem,
  TransferCandidateDetail,
  ListTransferCandidatesResult,
} from "./schemas";

describe("TransferCandidateItem shape", () => {
  it("defines expected fields", () => {
    const mock: TransferCandidateItem = {
      tc_id: 1,
      transfer_id: 42,
      candidate_id: 100,
      prev_candidate_id: null,
      store_id: 5,
      store_name: "Main Branch",
      company_id: 3,
      company_name: "Acme Corp",
      company_email: "hr@acme.com",
      bank_id: 10,
      transfer_confirmation_id: "CNF-001",
      transfer_file_id: null,
      transfer_benef_name: "John Doe",
      transfer_benef_iban: "KW1234567890",
      candidate_hourly_rate: 10.5,
      company_hourly_rate: 15.0,
      hours: 8,
      minutes: 30,
      seconds: 0,
      bonus: 100,
      bonus_commission: 20,
      transfer_cost: 200,
      candidate_total: 84,
      company_total: 120,
      deleted: 0,
      paid: 1,
      is_candidate_notified: true,
      currency_code: "KWD",
      contract_uuid: "550e8400-e29b-41d4-a716-446655440000",
      tc_created_at: new Date("2026-01-01"),
      tc_updated_at: new Date("2026-01-15"),
      candidate: {
        candidate_id: 100,
        candidate_name: "John Doe",
        candidate_name_ar: "جون دو",
      },
      transfer: {
        transfer_id: 42,
        transfer_status: 1,
      },
    };
    expect(mock.tc_id).toBe(1);
    expect(mock.transfer_id).toBe(42);
    expect(mock.candidate_id).toBe(100);
    expect(mock.store_name).toBe("Main Branch");
    expect(mock.company_name).toBe("Acme Corp");
    expect(mock.deleted).toBe(0);
    expect(mock.paid).toBe(1);
    expect(mock.is_candidate_notified).toBe(true);
    expect(mock.currency_code).toBe("KWD");
    expect(mock.contract_uuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(mock.tc_created_at).toBeInstanceOf(Date);
    expect(mock.tc_updated_at).toBeInstanceOf(Date);
    expect(mock.candidate?.candidate_name).toBe("John Doe");
    expect(mock.transfer?.transfer_status).toBe(1);
  });

  it("allows null relations", () => {
    const mock: TransferCandidateItem = {
      tc_id: 2,
      transfer_id: null,
      candidate_id: null,
      prev_candidate_id: null,
      store_id: null,
      store_name: null,
      company_id: null,
      company_name: null,
      company_email: null,
      bank_id: null,
      transfer_confirmation_id: null,
      transfer_file_id: null,
      transfer_benef_name: null,
      transfer_benef_iban: null,
      candidate_hourly_rate: null,
      company_hourly_rate: null,
      hours: null,
      minutes: null,
      seconds: null,
      bonus: null,
      bonus_commission: null,
      transfer_cost: null,
      candidate_total: null,
      company_total: null,
      deleted: 0,
      paid: 0,
      is_candidate_notified: null,
      currency_code: null,
      contract_uuid: null,
      tc_created_at: new Date(),
      tc_updated_at: new Date(),
      candidate: null,
      transfer: null,
    };
    expect(mock.tc_id).toBe(2);
    expect(mock.candidate).toBeNull();
    expect(mock.transfer).toBeNull();
  });
});

describe("TransferCandidateDetail shape", () => {
  it("accepts null (not found)", () => {
    const detail: TransferCandidateDetail = null;
    expect(detail).toBeNull();
  });
});

describe("ListTransferCandidatesResult shape", () => {
  it("holds items array and total count", () => {
    const result: ListTransferCandidatesResult = {
      items: [],
      total: 0,
    };
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
