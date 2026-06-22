import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockRevalidatePath,
  mockFindMany,
  mockCount,
  mockFindFirst,
  mockFindUnique,
  mockUpdate,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindFirst: vi.fn(),
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    request: {
      findMany: mockFindMany,
      count: mockCount,
      findFirst: mockFindFirst,
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
  },
}));

import {
  listRequests,
  getRequest,
  updateRequestStatus,
  approveRequest,
  rejectRequest,
  closeRequest,
} from "./actions";
import type {
  UpdateRequestStatusInput,
  ApproveRequestInput,
  RejectRequestInput,
  CloseRequestInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_UUID = "req_12345678-90ab-cdef-1234-567890abcdef";

/** A fake request record as returned by Prisma findMany. */
function makeRequestRow(overrides: Record<string, unknown> = {}) {
  return {
    request_uuid: VALID_UUID,
    request_position_title: "Software Engineer",
    request_job_description: "Full stack developer",
    request_compensation: "2000 KWD/month",
    request_status: "pending",
    request_number_of_employees: 2,
    request_position_type: "full_time",
    request_priority: 1,
    request_feedback: null,
    request_started_at: null,
    request_finished_at: null,
    request_created_datetime: new Date("2026-01-01T00:00:00Z"),
    request_updated_datetime: null,
    company: { company_name: "Acme Corp" },
    staff: { staff_name: "John Staff" },
    ...overrides,
  };
}

/** A fake request record as returned by Prisma findFirst with full relations. */
function makeRequestDetail(overrides: Record<string, unknown> = {}) {
  return {
    request_uuid: VALID_UUID,
    request_position_title: "Software Engineer",
    request_job_description: "Full stack developer needed",
    request_compensation: "2000 KWD/month",
    request_status: "pending",
    request_feedback: null,
    request_priority: 1,
    request_cancelled_at: null,
    request_started_at: null,
    request_finished_at: null,
    request_delivered_at: null,
    request_re_worked_at: null,
    request_created_datetime: new Date("2026-01-01T00:00:00Z"),
    request_updated_datetime: null,
    company: { company_name: "Acme Corp", company_email: "hr@acme.com" },
    staff: { staff_name: "John Staff", staff_email: "john@acme.com" },
    request_application: [
      {
        application_uuid: "app_1",
        candidate: { candidate_name: "Jane Doe" },
        status: 1,
        created_at: new Date("2026-01-02T00:00:00Z"),
      },
    ],
    invitation: [
      {
        invitation_uuid: "inv_1",
        candidate: { candidate_name: "Jane Doe" },
        invitation_status: 1,
        invitation_created_at: new Date("2026-01-02T00:00:00Z"),
      },
    ],
    request_interview: [
      {
        request_interview_uuid: "int_1",
        candidate: { candidate_name: "Jane Doe" },
        interview_at: new Date("2026-01-10T00:00:00Z"),
        status: 0,
      },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// listRequests — runtime
// ---------------------------------------------------------------------------

describe("listRequests — runtime", () => {
  const MOCK_ROWS = [makeRequestRow()];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue(MOCK_ROWS);
    mockCount.mockResolvedValue(1);
  });

  it("returns paginated list of requests", async () => {
    const result = await listRequests({});
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
  });

  it("calls requireCapability with request.read.any", async () => {
    await listRequests({});
    expect(mockRequireCapability).toHaveBeenCalledWith("request.read.any");
  });

  it("queries Prisma with default pagination", async () => {
    await listRequests({});
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
    expect(mockCount).toHaveBeenCalled();
  });

  it("applies companyId filter", async () => {
    await listRequests({ companyId: 5 });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ company_id: 5 }),
      }),
    );
  });

  it("applies status filter", async () => {
    await listRequests({ status: "started" });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ request_status: "started" }),
      }),
    );
  });

  it("applies search query", async () => {
    await listRequests({ q: "developer" });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ request_position_title: { contains: "developer" } }),
          ]),
        }),
      }),
    );
  });

  it("correctly calculates skip for pagination", async () => {
    await listRequests({ page: 3, limit: 10 });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it("returns empty result on invalid input", async () => {
    const result = await listRequests({ page: -1 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("returns raw request data in output rows", async () => {
    const result = await listRequests({});
    const row = result.items[0];
    expect(row.title).toBe("Software Engineer");
    expect(row.company_name).toBe("Acme Corp");
    expect(row.status).toBe("pending");
  });
});

// ---------------------------------------------------------------------------
// getRequest — runtime
// ---------------------------------------------------------------------------

describe("getRequest — runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindFirst.mockResolvedValue(makeRequestDetail());
  });

  it("returns full request detail with relations", async () => {
    const result = await getRequest(VALID_UUID);
    expect(result.request).not.toBeNull();
    expect(result.request?.request_uuid).toBe(VALID_UUID);
    expect(result.applications).toHaveLength(1);
    expect(result.invitations).toHaveLength(1);
    expect(result.interviews).toHaveLength(1);
    expect(result.metrics).toHaveLength(4);
  });

  it("calls requireCapability with request.read.any", async () => {
    await getRequest(VALID_UUID);
    expect(mockRequireCapability).toHaveBeenCalledWith("request.read.any");
  });

  it("returns null request and empty arrays on not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await getRequest(VALID_UUID);
    expect(result.request).toBeNull();
    expect(result.applications).toEqual([]);
    expect(result.invitations).toEqual([]);
    expect(result.interviews).toEqual([]);
    expect(result.metrics).toEqual([]);
  });

  it("throws on invalid UUID", async () => {
    await expect(getRequest("")).rejects.toThrow();
  });

  it("includes company and staff in request detail", async () => {
    const result = await getRequest(VALID_UUID);
    expect(result.request?.company?.company_name).toBe("Acme Corp");
    expect(result.request?.staff?.staff_name).toBe("John Staff");
  });

  it("maps metrics with correct labels", async () => {
    const result = await getRequest(VALID_UUID);
    const labels = result.metrics.map((m) => m.label);
    expect(labels).toContain("Applications");
    expect(labels).toContain("Invitations");
    expect(labels).toContain("Interviews");
    expect(labels).toContain("Status");
  });
});

// ---------------------------------------------------------------------------
// updateRequestStatus — runtime
// ---------------------------------------------------------------------------

describe("updateRequestStatus — runtime", () => {
  const VALID_INPUT: UpdateRequestStatusInput = {
    requestUuid: VALID_UUID,
    status: "delivered",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue({
      request_uuid: VALID_UUID,
      request_status: "pending",
    });
    mockUpdate.mockResolvedValue({ request_uuid: VALID_UUID });
  });

  it("updates request status and returns success", async () => {
    const result = await updateRequestStatus(VALID_INPUT);
    expect(result.operation).toBe("success");
    expect(result.message).toContain('"delivered"');
  });

  it("calls requireCapability with request.write.any", async () => {
    await updateRequestStatus(VALID_INPUT);
    expect(mockRequireCapability).toHaveBeenCalledWith("request.write.any");
  });

  it("re-validates /admin/requests on success", async () => {
    await updateRequestStatus(VALID_INPUT);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/requests");
  });

  it("sets request_finished_at and request_delivered_at for delivered status", async () => {
    await updateRequestStatus({ requestUuid: VALID_UUID, status: "delivered" });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          request_finished_at: expect.any(Date),
          request_delivered_at: expect.any(Date),
        }),
      }),
    );
  });

  it("sets request_started_at for started status", async () => {
    await updateRequestStatus({ requestUuid: VALID_UUID, status: "started" });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          request_started_at: expect.any(Date),
        }),
      }),
    );
  });

  it("sets request_cancelled_at for cancelled status", async () => {
    await updateRequestStatus({ requestUuid: VALID_UUID, status: "cancelled" });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          request_cancelled_at: expect.any(Date),
        }),
      }),
    );
  });

  it("sets request_re_worked_at for re_work status", async () => {
    await updateRequestStatus({ requestUuid: VALID_UUID, status: "re_work" });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          request_re_worked_at: expect.any(Date),
        }),
      }),
    );
  });

  it("sets request_finished_at for finished_by_recruitment status", async () => {
    await updateRequestStatus({
      requestUuid: VALID_UUID,
      status: "finished_by_recruitment",
    });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          request_finished_at: expect.any(Date),
        }),
      }),
    );
  });

  it("includes optional feedback when provided with delivered", async () => {
    await updateRequestStatus({
      requestUuid: VALID_UUID,
      status: "delivered",
      feedback: "Candidate accepted",
    });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          request_feedback: "Candidate accepted",
        }),
      }),
    );
  });

  it("returns error on invalid input", async () => {
    const result = await updateRequestStatus({} as UpdateRequestStatusInput);
    expect(result.operation).toBe("error");
    expect(result.message).toBeTruthy();
  });

  it("returns error when request not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await updateRequestStatus(VALID_INPUT);
    expect(result.operation).toBe("error");
    expect(result.message).toContain("not found");
  });

  it("returns error on Prisma exception", async () => {
    mockUpdate.mockRejectedValue(new Error("DB connection failed"));
    const result = await updateRequestStatus(VALID_INPUT);
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// approveRequest — runtime
// ---------------------------------------------------------------------------

describe("approveRequest — runtime", () => {
  const VALID_INPUT: ApproveRequestInput = {
    requestUuid: VALID_UUID,
    reason: "Approved by management",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue({
      request_uuid: VALID_UUID,
      request_status: "pending",
    });
    mockUpdate.mockResolvedValue({ request_uuid: VALID_UUID });
  });

  it("approves request and returns success", async () => {
    const result = await approveRequest(VALID_INPUT);
    expect(result.operation).toBe("success");
    expect(result.message).toContain("Approved by management");
  });

  it("calls requireCapability with request.write.any", async () => {
    await approveRequest(VALID_INPUT);
    expect(mockRequireCapability).toHaveBeenCalledWith("request.write.any");
  });

  it("re-validates /admin/requests on success", async () => {
    await approveRequest(VALID_INPUT);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/requests");
  });

  it("updates status to started and sets timestamps", async () => {
    await approveRequest(VALID_INPUT);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          request_status: "started",
          request_started_at: expect.any(Date),
          request_feedback: "Approved by management",
        }),
      }),
    );
  });

  it("returns error on invalid input", async () => {
    const result = await approveRequest({} as ApproveRequestInput);
    expect(result.operation).toBe("error");
  });

  it("returns error when request not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await approveRequest(VALID_INPUT);
    expect(result.operation).toBe("error");
    expect(result.message).toContain("not found");
  });

  it("returns error when request is not pending", async () => {
    mockFindUnique.mockResolvedValue({
      request_uuid: VALID_UUID,
      request_status: "started",
    });
    const result = await approveRequest(VALID_INPUT);
    expect(result.operation).toBe("error");
    expect(result.message).toContain("cannot be approved");
  });

  it("returns error on Prisma exception", async () => {
    mockUpdate.mockRejectedValue(new Error("Update failed"));
    const result = await approveRequest(VALID_INPUT);
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// rejectRequest — runtime
// ---------------------------------------------------------------------------

describe("rejectRequest — runtime", () => {
  const VALID_INPUT: RejectRequestInput = {
    requestUuid: VALID_UUID,
    reason: "Budget constraints",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue({
      request_uuid: VALID_UUID,
      request_status: "pending",
    });
    mockUpdate.mockResolvedValue({ request_uuid: VALID_UUID });
  });

  it("rejects request and returns success", async () => {
    const result = await rejectRequest(VALID_INPUT);
    expect(result.operation).toBe("success");
    expect(result.message).toContain("Budget constraints");
  });

  it("calls requireCapability with request.write.any", async () => {
    await rejectRequest(VALID_INPUT);
    expect(mockRequireCapability).toHaveBeenCalledWith("request.write.any");
  });

  it("re-validates /admin/requests on success", async () => {
    await rejectRequest(VALID_INPUT);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/requests");
  });

  it("updates status to cancelled and sets feedback", async () => {
    await rejectRequest(VALID_INPUT);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          request_status: "cancelled",
          request_cancelled_at: expect.any(Date),
          request_feedback: "Budget constraints",
        }),
      }),
    );
  });

  it("returns error on invalid input", async () => {
    const result = await rejectRequest({} as RejectRequestInput);
    expect(result.operation).toBe("error");
  });

  it("returns error when request not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await rejectRequest(VALID_INPUT);
    expect(result.operation).toBe("error");
    expect(result.message).toContain("not found");
  });

  it("returns error when request is delivered", async () => {
    mockFindUnique.mockResolvedValue({
      request_uuid: VALID_UUID,
      request_status: "delivered",
    });
    const result = await rejectRequest(VALID_INPUT);
    expect(result.operation).toBe("error");
    expect(result.message).toContain("Cannot reject");
  });

  it("returns error when request is cancelled", async () => {
    mockFindUnique.mockResolvedValue({
      request_uuid: VALID_UUID,
      request_status: "cancelled",
    });
    const result = await rejectRequest(VALID_INPUT);
    expect(result.operation).toBe("error");
    expect(result.message).toContain("Cannot reject");
  });

  it("returns error on Prisma exception", async () => {
    mockUpdate.mockRejectedValue(new Error("Reject failed"));
    const result = await rejectRequest(VALID_INPUT);
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// closeRequest — runtime
// ---------------------------------------------------------------------------

describe("closeRequest — runtime", () => {
  const VALID_INPUT: CloseRequestInput = {
    requestUuid: VALID_UUID,
    resolution: "Position filled",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue({
      request_uuid: VALID_UUID,
      request_status: "started",
    });
    mockUpdate.mockResolvedValue({ request_uuid: VALID_UUID });
  });

  it("closes request and returns success", async () => {
    const result = await closeRequest(VALID_INPUT);
    expect(result.operation).toBe("success");
    expect(result.message).toContain("Position filled");
  });

  it("calls requireCapability with request.write.any", async () => {
    await closeRequest(VALID_INPUT);
    expect(mockRequireCapability).toHaveBeenCalledWith("request.write.any");
  });

  it("re-validates /admin/requests on success", async () => {
    await closeRequest(VALID_INPUT);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/requests");
  });

  it("updates status to delivered with timestamps", async () => {
    await closeRequest(VALID_INPUT);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          request_status: "delivered",
          request_finished_at: expect.any(Date),
          request_delivered_at: expect.any(Date),
          request_feedback: "Position filled",
        }),
      }),
    );
  });

  it("returns error on invalid input", async () => {
    const result = await closeRequest({} as CloseRequestInput);
    expect(result.operation).toBe("error");
  });

  it("returns error when request not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await closeRequest(VALID_INPUT);
    expect(result.operation).toBe("error");
    expect(result.message).toContain("not found");
  });

  it("returns error when request is delivered", async () => {
    mockFindUnique.mockResolvedValue({
      request_uuid: VALID_UUID,
      request_status: "delivered",
    });
    const result = await closeRequest(VALID_INPUT);
    expect(result.operation).toBe("error");
    expect(result.message).toContain("Cannot close");
  });

  it("returns error when request is cancelled", async () => {
    mockFindUnique.mockResolvedValue({
      request_uuid: VALID_UUID,
      request_status: "cancelled",
    });
    const result = await closeRequest(VALID_INPUT);
    expect(result.operation).toBe("error");
    expect(result.message).toContain("Cannot close");
  });

  it("returns error on Prisma exception", async () => {
    mockUpdate.mockRejectedValue(new Error("Close failed"));
    const result = await closeRequest(VALID_INPUT);
    expect(result.operation).toBe("error");
  });
});
