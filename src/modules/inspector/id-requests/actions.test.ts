import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockFindMany, mockCount, mockFindUnique, mockCandidateFindMany, mockUpdate } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockFindMany: vi.fn(),
    mockCount: vi.fn(),
    mockFindUnique: vi.fn(),
    mockCandidateFindMany: vi.fn(),
    mockUpdate: vi.fn(),
  }));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_id_request: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
    candidate: {
      findMany: mockCandidateFindMany,
    },
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  listIdRequestsSchema,
  getIdRequestSchema,
  type ListIdRequestsInput,
  type GetIdRequestInput,
  type IdRequestRow,
  type IdRequestDetail,
  type ListIdRequestsResult,
} from "./schemas";
import { listIdRequests, getIdRequest, approveIdRequest, rejectIdRequest } from "./actions";

// ===========================================================================
// Input schema validation
// ===========================================================================

describe("listIdRequestsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listIdRequestsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listIdRequestsSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("coerces string values for page and limit", () => {
    const r = listIdRequestsSchema.safeParse({
      page: "3",
      limit: "25",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(25);
    }
  });

  it("accepts search query", () => {
    const r = listIdRequestsSchema.safeParse({ q: "CIR-123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("CIR-123");
    }
  });

  it("accepts status filter", () => {
    const r = listIdRequestsSchema.safeParse({ status: "pending" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("pending");
    }
  });

  it("rejects negative page", () => {
    const r = listIdRequestsSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects page of 0", () => {
    const r = listIdRequestsSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listIdRequestsSchema.safeParse({ limit: 999 });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listIdRequestsSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric strings for page", () => {
    const r = listIdRequestsSchema.safeParse({ page: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric strings for limit", () => {
    const r = listIdRequestsSchema.safeParse({ limit: "xyz" });
    expect(r.success).toBe(false);
  });
});

describe("getIdRequestSchema", () => {
  it("accepts a valid UUID-like string", () => {
    const r = getIdRequestSchema.safeParse({ id: "abc-123-def" });
    expect(r.success).toBe(true);
  });

  it("rejects empty string", () => {
    const r = getIdRequestSchema.safeParse({ id: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing id", () => {
    const r = getIdRequestSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string id", () => {
    const r = getIdRequestSchema.safeParse({ id: 123 });
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Type shape validation
// ===========================================================================

describe("IdRequestRow type shape", () => {
  it("accepts a valid row", () => {
    const row: IdRequestRow = {
      id: "cir-abc-123",
      request: "cir-abc-123-4567-8",
      candidates: 3,
      status: "pending",
      createdBy: "Staff One",
      updatedBy: "System",
      created: "2h ago",
      updated: "1d ago",
    };
    expect(row.id).toBe("cir-abc-123");
    expect(row.request).toBe("cir-abc-123-4567-8");
    expect(row.candidates).toBe(3);
    expect(row.status).toBe("pending");
    expect(row.createdBy).toBe("Staff One");
    expect(row.updatedBy).toBe("System");
  });

  it("accepts row with zero candidates", () => {
    const row: IdRequestRow = {
      id: "cir-def-456",
      request: "cir-def-456",
      candidates: 0,
      status: "approved",
      createdBy: "System",
      updatedBy: "Staff Two",
      created: "just now",
      updated: "just now",
    };
    expect(row.candidates).toBe(0);
    expect(row.status).toBe("approved");
  });
});

describe("IdRequestDetail type shape", () => {
  it("accepts a valid detail object", () => {
    const detail: IdRequestDetail = {
      cir_uuid: "cir-abc-123",
      status: "pending",
      rejection_reason: null,
      candidate_ids: "1,2,3",
      created_at: new Date("2025-01-15T10:00:00.000Z"),
      updated_at: null,
      created_by_name: "Staff One",
      updated_by_name: null,
      metrics: [
        { label: "Status", value: "pending", note: "Legacy ID request status" },
      ],
      candidates: [
        {
          id: 1,
          title: "Candidate 1",
          subtitle: "candidate@example.com",
          meta: "No flag · expires N/A",
        },
      ],
    };
    expect(detail.cir_uuid).toBe("cir-abc-123");
    expect(detail.candidates).toHaveLength(1);
    expect(detail.metrics).toHaveLength(1);
    expect(detail.candidates[0].id).toBe(1);
  });

  it("accepts null rejection_reason", () => {
    const detail: IdRequestDetail = {
      cir_uuid: "cir-def-456",
      status: null,
      rejection_reason: null,
      candidate_ids: null,
      created_at: null,
      updated_at: null,
      created_by_name: null,
      updated_by_name: null,
      metrics: [],
      candidates: [],
    };
    expect(detail.rejection_reason).toBeNull();
    expect(detail.candidates).toHaveLength(0);
    expect(detail.metrics).toHaveLength(0);
  });

  it("accepts rejected detail with reason", () => {
    const detail: IdRequestDetail = {
      cir_uuid: "cir-ghi-789",
      status: "rejected",
      rejection_reason: "Documents do not match civil records",
      candidate_ids: "10,20",
      created_at: new Date(),
      updated_at: new Date(),
      created_by_name: "Admin",
      updated_by_name: "Admin",
      metrics: [
        { label: "Status", value: "rejected", note: "Rejected by inspector" },
      ],
      candidates: [],
    };
    expect(detail.status).toBe("rejected");
    expect(detail.rejection_reason).toBe("Documents do not match civil records");
    expect(detail.candidate_ids).toBe("10,20");
  });
});

describe("ListIdRequestsResult type shape", () => {
  it("has correct shape with empty array", () => {
    const result: ListIdRequestsResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.items).toHaveLength(0);
    expect(result.totalPages).toBe(0);
    expect(result.page).toBe(1);
  });

  it("accepts multiple items", () => {
    const result: ListIdRequestsResult = {
      items: [
        {
          id: "cir-1",
          request: "cir-1-abc",
          candidates: 2,
          status: "pending",
          createdBy: "A",
          updatedBy: "B",
          created: "5m ago",
          updated: "2m ago",
        },
        {
          id: "cir-2",
          request: "cir-2-def",
          candidates: 5,
          status: "approved",
          createdBy: "C",
          updatedBy: "D",
          created: "1h ago",
          updated: "30m ago",
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.items).toHaveLength(2);
    expect(result.totalPages).toBe(1);
    expect(result.items[1].status).toBe("approved");
  });
});

// ===========================================================================
// Action function tests (with mocked Prisma)
// ===========================================================================

const mockDate = new Date("2025-01-15T10:00:00.000Z");

const makeMockRow = (overrides: Record<string, unknown> = {}) => ({
  cir_uuid: "cir-abc-123-4567-8901-2345",
  candidate_ids: "1,2,3",
  status: "pending",
  rejection_reason: null,
  created_at: mockDate,
  updated_at: mockDate,
  staff_candidate_id_request_created_byTostaff: {
    staff_name: "Staff One",
  },
  staff_candidate_id_request_updated_byTostaff: {
    staff_name: "Staff Two",
  },
  ...overrides,
});

describe("listIdRequests()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue([makeMockRow()]);
    mockCount.mockResolvedValue(1);
  });

  it("requires id_review.read capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listIdRequests({})).rejects.toThrow("Unauthorized");
    expect(mockRequireCapability).toHaveBeenCalledWith("id_review.read");
  });

  it("returns paginated results with defaults", async () => {
    const result = await listIdRequests({});

    expect(mockRequireCapability).toHaveBeenCalledWith("id_review.read");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        orderBy: { created_at: "desc" },
        skip: 0,
        take: 20,
      }),
    );
    expect(mockCount).toHaveBeenCalledWith({ where: {} });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("cir-abc-123-4567-8901-2345");
    expect(result.items[0].request).toBe("cir-abc-123-4567-8");
    expect(result.items[0].candidates).toBe(3);
    expect(result.items[0].status).toBe("pending");
    expect(result.items[0].createdBy).toBe("Staff One");
    expect(result.items[0].updatedBy).toBe("Staff Two");
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("passes status filter to prisma", async () => {
    await listIdRequests({ status: "approved" });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "approved" },
      }),
    );
    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "approved" },
      }),
    );
  });

  it("passes search query to prisma (q)", async () => {
    await listIdRequests({ q: "cir-xyz" });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { cir_uuid: { contains: "cir-xyz" } },
      }),
    );
    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { cir_uuid: { contains: "cir-xyz" } },
      }),
    );
  });

  it("accepts custom pagination", async () => {
    await listIdRequests({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("handles empty results gracefully", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listIdRequests({});

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("handles invalid params gracefully (returns empty)", async () => {
    const result = await listIdRequests({ page: -1 });

    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("handles null staff relations", async () => {
    mockFindMany.mockResolvedValue([
      makeMockRow({
        staff_candidate_id_request_created_byTostaff: null,
        staff_candidate_id_request_updated_byTostaff: null,
      }),
    ]);

    const result = await listIdRequests({});

    expect(result.items[0].createdBy).toBe("System");
    expect(result.items[0].updatedBy).toBe("System");
  });

  it("handles null candidate_ids", async () => {
    mockFindMany.mockResolvedValue([
      makeMockRow({ candidate_ids: null }),
    ]);

    const result = await listIdRequests({});

    expect(result.items[0].candidates).toBe(0);
  });

  it("handles null status", async () => {
    mockFindMany.mockResolvedValue([
      makeMockRow({ status: null }),
    ]);

    const result = await listIdRequests({});

    expect(result.items[0].status).toBe("pending");
  });

  it("trims search query whitespace", async () => {
    await listIdRequests({ q: "  cir-xyz  " });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { cir_uuid: { contains: "cir-xyz" } },
      }),
    );
  });
});

describe("getIdRequest()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    // Default: request found with no candidates to look up
    mockFindUnique.mockResolvedValue(makeMockRow());
    mockCandidateFindMany.mockResolvedValue([]);
  });

  it("requires id_review.read capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getIdRequest({ id: "cir-abc-123" })).rejects.toThrow(
      "Unauthorized",
    );
    expect(mockRequireCapability).toHaveBeenCalledWith("id_review.read");
  });

  it("returns request detail for valid id", async () => {
    const result = await getIdRequest({ id: "cir-abc-123" });

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { cir_uuid: "cir-abc-123" },
      select: expect.any(Object),
    });

    expect(result).not.toBeNull();
    expect(result!.cir_uuid).toBe("cir-abc-123-4567-8901-2345");
    expect(result!.status).toBe("pending");
    expect(result!.rejection_reason).toBeNull();
    expect(result!.candidate_ids).toBe("1,2,3");
    expect(result!.created_by_name).toBe("Staff One");
    expect(result!.updated_by_name).toBe("Staff Two");
  });

  it("includes metrics array", async () => {
    const result = await getIdRequest({ id: "cir-abc-123" });

    expect(result!.metrics).toHaveLength(4);
    expect(result!.metrics[0].label).toBe("Status");
    expect(result!.metrics[1].label).toBe("Candidates");
    expect(result!.metrics[2].label).toBe("Matched");
    expect(result!.metrics[3].label).toBe("Updated");
  });

  it("returns null for unknown id", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await getIdRequest({ id: "non-existent" });

    expect(result).toBeNull();
  });

  it("queries candidate records when candidate_ids present", async () => {
    mockCandidateFindMany.mockResolvedValue([
      {
        candidate_id: 1,
        candidate_name: "Candidate One",
        candidate_email: "one@example.com",
        candidate_civil_need_verification: true,
        candidate_civil_expiry_date: new Date("2025-12-31"),
        candidate_status: "active",
        approved: true,
      },
    ]);

    const result = await getIdRequest({ id: "cir-abc-123" });

    expect(mockCandidateFindMany).toHaveBeenCalledWith({
      where: { candidate_id: { in: [1, 2, 3] } },
      select: expect.any(Object),
    });
    expect(result!.candidates).toHaveLength(1);
    expect(result!.candidates[0].id).toBe(1);
    expect(result!.candidates[0].title).toBe("Candidate One");
    expect(result!.metrics[2].value).toBe(1); // Matched count
  });

  it("handles null staff relations", async () => {
    mockFindUnique.mockResolvedValue(
      makeMockRow({
        staff_candidate_id_request_created_byTostaff: null,
        staff_candidate_id_request_updated_byTostaff: null,
      }),
    );

    const result = await getIdRequest({ id: "cir-abc-123" });

    expect(result!.created_by_name).toBeNull();
    expect(result!.updated_by_name).toBeNull();
  });

  it("handles empty candidate_ids string", async () => {
    mockFindUnique.mockResolvedValue(makeMockRow({ candidate_ids: "" }));

    const result = await getIdRequest({ id: "cir-abc-123" });

    expect(result!.candidate_ids).toBe("");
    expect(result!.candidates).toHaveLength(0);
    expect(result!.metrics[1].value).toBe(0); // Candidates count
    expect(result!.metrics[2].value).toBe(0); // Matched count
  });

  it("throws on invalid id (empty string)", async () => {
    await expect(getIdRequest({ id: "" })).rejects.toThrow(
      "Request ID is required",
    );
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// approveIdRequest / rejectIdRequest mutation action tests
// ===========================================================================

const mockExistingPending = {
  cir_uuid: "cir-abc-123-4567-8901-2345",
  status: "pending",
};

describe("approveIdRequest()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(mockExistingPending);
    mockUpdate.mockResolvedValue({ cir_uuid: "cir-abc-123", status: "approved" });
  });

  it("requires id_review.mutate capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      approveIdRequest({ id: "cir-abc-123-4567-8901-2345" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockRequireCapability).toHaveBeenCalledWith("id_review.mutate");
  });

  it("approves a pending request", async () => {
    const result = await approveIdRequest({
      id: "cir-abc-123-4567-8901-2345",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("id_review.mutate");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { cir_uuid: "cir-abc-123-4567-8901-2345" },
      select: { cir_uuid: true, status: true },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { cir_uuid: "cir-abc-123-4567-8901-2345" },
      data: { status: "approved", updated_at: expect.any(Date) },
    });
    expect(result).toEqual({ success: true });
  });

  it("returns error for non-existent request", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await approveIdRequest({ id: "non-existent" });

    expect(result).toEqual({ error: "ID request not found." });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error if request is not pending", async () => {
    mockFindUnique.mockResolvedValue({
      ...mockExistingPending,
      status: "approved",
    });

    const result = await approveIdRequest({
      id: "cir-abc-123-4567-8901-2345",
    });

    expect(result).toEqual({
      error:
        'Cannot update a request with status "approved". Only \'pending\' requests can be updated.',
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("rejectIdRequest()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(mockExistingPending);
    mockUpdate.mockResolvedValue({ cir_uuid: "cir-abc-123", status: "rejected" });
  });

  it("requires id_review.mutate capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      rejectIdRequest({ id: "cir-abc-123", comment: "Documents do not match" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockRequireCapability).toHaveBeenCalledWith("id_review.mutate");
  });

  it("rejects a pending request with a reason", async () => {
    const result = await rejectIdRequest({
      id: "cir-abc-123-4567-8901-2345",
      comment: "Documents do not match civil records.",
    });

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { cir_uuid: "cir-abc-123-4567-8901-2345" },
      select: { cir_uuid: true, status: true },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { cir_uuid: "cir-abc-123-4567-8901-2345" },
      data: {
        status: "rejected",
        rejection_reason: "Documents do not match civil records.",
        updated_at: expect.any(Date),
      },
    });
    expect(result).toEqual({ success: true });
  });

  it("returns error when rejection reason is missing", async () => {
    const result = await rejectIdRequest({ id: "cir-abc-123-4567-8901-2345", comment: "" });

    expect(result).toEqual({
      error:
        "Rejection reason must be at least 10 characters",
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error for non-existent request", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await rejectIdRequest({ id: "cir-abc-123", comment: "Invalid docs" });

    expect(result).toEqual({ error: "ID request not found." });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error if request is not pending", async () => {
    mockFindUnique.mockResolvedValue({
      ...mockExistingPending,
      status: "approved",
    });

    const result = await rejectIdRequest({
      id: "cir-abc-123",
      comment: "Already approved cannot reject",
    });

    expect(result).toEqual({
      error:
        'Cannot update a request with status "approved". Only \'pending\' requests can be updated.',
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
