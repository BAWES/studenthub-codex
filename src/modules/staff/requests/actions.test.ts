import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listStaffRequestsSchema,
  getStaffRequestDetailSchema,
  updateRequestStatusSchema,
  staffRequestRowOutputSchema,
  staffRequestListOutputSchema,
  requestCandidateOutputSchema,
  staffRequestDetailOutputSchema,
  updateRequestStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listStaffRequestsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listStaffRequestsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listStaffRequestsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts status filter", () => {
    const result = listStaffRequestsSchema.safeParse({ status: "started" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("started");
    }
  });

  it("rejects invalid status filter", () => {
    const result = listStaffRequestsSchema.safeParse({ status: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listStaffRequestsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listStaffRequestsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts search query", () => {
    const result = listStaffRequestsSchema.safeParse({ q: "developer" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("developer");
    }
  });

  it("coerces string page/limit to numbers", () => {
    const result = listStaffRequestsSchema.safeParse({
      page: "3",
      limit: "25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(25);
    }
  });
});

describe("getStaffRequestDetailSchema", () => {
  it("accepts a valid request UUID", () => {
    const result = getStaffRequestDetailSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("req_abc-123-def-456");
    }
  });

  it("rejects empty UUID", () => {
    const result = getStaffRequestDetailSchema.safeParse({ requestUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getStaffRequestDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateRequestStatusSchema", () => {
  it("accepts valid update params", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
      status: "started",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("req_abc-123-def-456");
      expect(result.data.status).toBe("started");
    }
  });

  it("accepts pending status", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
      status: "pending",
    });
    expect(result.success).toBe(true);
  });

  it("accepts delivered status", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
      status: "delivered",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
      status: "cancelled",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateRequestStatusSchema.safeParse({ status: "started" });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty UUID", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "",
      status: "started",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional feedback param", () => {
    const result = updateRequestStatusSchema.safeParse({
      requestUuid: "req_abc-123-def-456",
      status: "delivered",
      feedback: "Candidate accepted offer",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.feedback).toBe("Candidate accepted offer");
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("staffRequestRowOutputSchema", () => {
  it("validates a valid staff request row", () => {
    const result = staffRequestRowOutputSchema.safeParse({
      id: "req_abc-123",
      title: "Senior Developer",
      company: "Acme Corp",
      seats: 2,
      status: "started",
      updated: "2 hours ago",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(staffRequestRowOutputSchema.safeParse({ id: "req_1" }).success).toBe(
      false,
    );
  });
});

describe("staffRequestListOutputSchema", () => {
  it("validates a valid list result", () => {
    const result = staffRequestListOutputSchema.safeParse({
      items: [
        {
          id: "req_1",
          title: "Dev",
          company: "Acme",
          seats: 1,
          status: "pending",
          updated: "1m ago",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = staffRequestListOutputSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("requestCandidateOutputSchema", () => {
  it("validates a candidate entry", () => {
    const result = requestCandidateOutputSchema.safeParse({
      uuid: "app_uuid_123",
      name: "John Doe",
      email: "john@example.com",
      applicationStatus: 1,
      appliedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable name and email", () => {
    const result = requestCandidateOutputSchema.safeParse({
      uuid: "app_uuid_123",
      name: null,
      email: null,
      applicationStatus: null,
      appliedAt: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("staffRequestDetailOutputSchema", () => {
  it("validates a full detail object", () => {
    const result = staffRequestDetailOutputSchema.safeParse({
      requestUuid: "req_abc-123",
      positionTitle: "Senior Developer",
      jobDescription: "Looking for a developer",
      compensation: "Competitive",
      seats: 2,
      location: "Kuwait City",
      status: "started",
      priority: 1,
      assignedAt: new Date(),
      startedAt: new Date(),
      finishedAt: null,
      updatedAt: new Date(),
      createdAt: new Date(),
      company: {
        company_id: 1,
        company_name: "Acme Corp",
        company_email: "hr@acme.com",
      },
      contact: {
        contact_name: "Jane",
        contact_email: "jane@acme.com",
      },
      staff: {
        staff_name: "Staff User",
        staff_email: "staff@studenthub.ai",
      },
      candidates: [],
    });
    expect(result.success).toBe(true);
  });

  it("allows null company, contact, staff", () => {
    const result = staffRequestDetailOutputSchema.safeParse({
      requestUuid: "req_abc-123",
      positionTitle: null,
      jobDescription: "",
      compensation: "",
      seats: 0,
      location: null,
      status: null,
      priority: null,
      assignedAt: null,
      startedAt: null,
      finishedAt: null,
      updatedAt: new Date(),
      createdAt: new Date(),
      company: null,
      contact: null,
      staff: null,
      candidates: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = staffRequestDetailOutputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateRequestStatusOutputSchema", () => {
  it("validates a success result", () => {
    const result = updateRequestStatusOutputSchema.safeParse({
      operation: "success",
      message: "Done",
    });
    expect(result.success).toBe(true);
  });

  it("validates an error result", () => {
    const result = updateRequestStatusOutputSchema.safeParse({
      operation: "error",
      message: "Not found",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown operation", () => {
    const result = updateRequestStatusOutputSchema.safeParse({
      operation: "unknown",
      message: "test",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action tests — mock Prisma + auth
// ---------------------------------------------------------------------------

const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    request: {
      findMany: mockFindMany,
      count: mockCount,
      findFirst: mockFindFirst,
      update: mockUpdate,
    },
  },
}));

const mockRequireRoleCapability = vi.fn();
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireRoleCapability,
}));

const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

const actions = await import("./actions");
const { requireRoleCapability } = await import("@/modules/auth/session");
const { revalidatePath } = await import("next/cache");

const mockStaffUser = {
  role: "staff" as const,
  id: "99",
  name: "Staff User",
  email: "staff@studenthub.ai",
  issuedAt: Date.now(),
};

function makeRequestRow(overrides: Record<string, unknown> = {}) {
  return {
    request_uuid: "req_abc-123",
    request_position_title: "Senior Developer",
    request_status: "started",
    request_number_of_employees: 2,
    request_updated_datetime: new Date("2026-06-10T10:00:00Z"),
    company: { company_name: "Acme Corp" },
    ...overrides,
  };
}

function makeDetailRow() {
  const now = new Date("2026-06-10T10:00:00Z");
  return {
    request_uuid: "req_detail-001",
    request_position_title: "Senior Developer",
    request_job_description: "Looking for a senior developer",
    request_compensation: "Competitive",
    request_number_of_employees: 2,
    request_location: "Kuwait City",
    request_status: "started",
    request_priority: 1,
    request_assigned_at: now,
    request_started_at: now,
    request_finished_at: null,
    request_updated_datetime: now,
    request_created_datetime: now,
    company: {
      company_id: 1,
      company_name: "Acme Corp",
      company_email: "hr@acme.com",
    },
    contact: {
      contact_name: "Jane",
      contact_email: "jane@acme.com",
    },
    staff: {
      staff_name: "Staff User",
      staff_email: "staff@studenthub.ai",
    },
    request_application: [
      {
        application_uuid: "app_001",
        status: 1,
        created_at: now,
        candidate: {
          candidate_id: 10,
          candidate_name: "John Doe",
          candidate_email: "john@example.com",
        },
      },
    ],
  };
}

describe("listStaffRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockStaffUser);
  });

  it("returns paginated requests with defaults", async () => {
    mockFindMany.mockResolvedValue([makeRequestRow()]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listStaffRequests({});

    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "staff",
      "request.read.assigned",
    );
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
    expect(result.items[0].title).toBe("Senior Developer");
    expect(result.items[0].company).toBe("Acme Corp");
  });

  it("filters by status", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listStaffRequests({ status: "started" });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.request_status).toBe("started");
    expect(callArgs.where.staff_id).toBe(99);
  });

  it("searches by title and company name", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listStaffRequests({ q: "developer" });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.OR).toBeDefined();
    expect(callArgs.where.OR[0].request_position_title.contains).toBe(
      "developer",
    );
  });

  it("respects pagination", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listStaffRequests({ page: 3, limit: 10 });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.skip).toBe(20);
    expect(callArgs.take).toBe(10);
  });

  it("returns empty result on invalid input", async () => {
    const result = await actions.listStaffRequests({ limit: 999 });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("handles null position_title gracefully", async () => {
    mockFindMany.mockResolvedValue([
      makeRequestRow({ request_position_title: null }),
    ]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listStaffRequests({});

    expect(result.items[0].title).toBe("Untitled request");
  });

  it("handles null company_name gracefully", async () => {
    mockFindMany.mockResolvedValue([
      makeRequestRow({ company: { company_name: null } }),
    ]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listStaffRequests({});

    expect(result.items[0].company).toBe("No company");
  });

  it("orders by request_updated_datetime descending", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listStaffRequests({});

    expect(mockFindMany.mock.calls[0][0].orderBy)
      .toEqual({ request_updated_datetime: "desc" });
  });

  it("filters by staff_id from session", async () => {
    mockFindMany.mockResolvedValue([makeRequestRow()]);
    mockCount.mockResolvedValue(1);

    await actions.listStaffRequests({});

    const where = mockFindMany.mock.calls[0][0].where;
    expect(where.staff_id).toBe(99);
  });

  it("throws on unauthorized access", async () => {
    mockRequireRoleCapability.mockRejectedValue(
      new Error("Unauthorized: insufficient role capability"),
    );

    await expect(actions.listStaffRequests({})).rejects.toThrow(
      "Unauthorized",
    );
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

describe("getStaffRequestDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockStaffUser);
  });

  it("returns request detail for a valid UUID", async () => {
    mockFindFirst.mockResolvedValue(makeDetailRow());

    const result = await actions.getStaffRequestDetail({
      requestUuid: "req_detail-001",
    });

    expect(result).not.toBeNull();
    expect(result!.requestUuid).toBe("req_detail-001");
    expect(result!.positionTitle).toBe("Senior Developer");
    expect(result!.company?.company_name).toBe("Acme Corp");
    expect(result!.candidates).toHaveLength(1);
    expect(result!.candidates[0].name).toBe("John Doe");
  });

  it("returns null when request not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await actions.getStaffRequestDetail({
      requestUuid: "req_missing",
    });

    expect(result).toBeNull();
  });

  it("queries with correct staff_id and UUID", async () => {
    mockFindFirst.mockResolvedValue(makeDetailRow());

    await actions.getStaffRequestDetail({ requestUuid: "req_detail-001" });

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        request_uuid: "req_detail-001",
        staff_id: 99,
      },
      select: expect.any(Object),
    });
  });

  it("throws on invalid input UUID", async () => {
    await expect(
      actions.getStaffRequestDetail({ requestUuid: "" }),
    ).rejects.toThrow("Request UUID is required");
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("throws on missing UUID param", async () => {
    await expect(
      actions.getStaffRequestDetail({} as any),
    ).rejects.toThrow();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("throws on unauthorized access", async () => {
    mockRequireRoleCapability.mockRejectedValue(
      new Error("Unauthorized: insufficient role capability"),
    );

    await expect(
      actions.getStaffRequestDetail({ requestUuid: "req_detail-001" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("handles null candidate details gracefully", async () => {
    const row = makeDetailRow() as any;
    row.request_application[0].candidate = null;
    mockFindFirst.mockResolvedValue(row);

    const result = await actions.getStaffRequestDetail({
      requestUuid: "req_detail-001",
    });

    expect(result!.candidates[0].name).toBeNull();
    expect(result!.candidates[0].email).toBeNull();
  });

  it("handles empty applications array", async () => {
    const row = makeDetailRow();
    row.request_application = [];
    mockFindFirst.mockResolvedValue(row);

    const result = await actions.getStaffRequestDetail({
      requestUuid: "req_detail-001",
    });

    expect(result!.candidates).toEqual([]);
  });
});

describe("updateRequestStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockStaffUser);
  });

  it("updates status to started for a pending request", async () => {
    mockFindFirst.mockResolvedValue({
      request_uuid: "req_abc-123",
      request_status: "pending",
    });
    mockUpdate.mockResolvedValue({});

    const result = await actions.updateRequestStatus({
      requestUuid: "req_abc-123",
      status: "started",
    });

    expect(result.operation).toBe("success");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { request_uuid: "req_abc-123" },
      data: expect.objectContaining({
        request_status: "started",
        request_started_at: expect.any(Date),
      }),
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/staff/requests");
  });

  it("updates status to delivered with feedback", async () => {
    mockFindFirst.mockResolvedValue({
      request_uuid: "req_abc-123",
      request_status: "started",
    });
    mockUpdate.mockResolvedValue({});

    const result = await actions.updateRequestStatus({
      requestUuid: "req_abc-123",
      status: "delivered",
      feedback: "Candidate accepted offer",
    });

    expect(result.operation).toBe("success");
    const callData = mockUpdate.mock.calls[0][0].data;
    expect(callData.request_status).toBe("delivered");
    expect(callData.request_finished_at).toBeDefined();
    expect(callData.request_feedback).toBe("Candidate accepted offer");
  });

  it("updates status to delivered without feedback", async () => {
    mockFindFirst.mockResolvedValue({
      request_uuid: "req_abc-123",
      request_status: "started",
    });
    mockUpdate.mockResolvedValue({});

    const result = await actions.updateRequestStatus({
      requestUuid: "req_abc-123",
      status: "delivered",
    });

    expect(result.operation).toBe("success");
    expect(mockUpdate.mock.calls[0][0].data.request_finished_at).toBeDefined();
    expect(
      mockUpdate.mock.calls[0][0].data.request_feedback,
    ).toBeUndefined();
  });

  it("does not set started_at if already started", async () => {
    mockFindFirst.mockResolvedValue({
      request_uuid: "req_abc-123",
      request_status: "started",
    });
    mockUpdate.mockResolvedValue({});

    const result = await actions.updateRequestStatus({
      requestUuid: "req_abc-123",
      status: "started",
    });

    expect(result.operation).toBe("success");
    const callData = mockUpdate.mock.calls[0][0].data;
    expect(callData.request_status).toBe("started");
    // started_at should NOT be set when transitioning started→started
    expect(callData.request_started_at).toBeUndefined();
  });

  it("returns error when request not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await actions.updateRequestStatus({
      requestUuid: "req_missing",
      status: "started",
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Request not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error on invalid input", async () => {
    const result = await actions.updateRequestStatus({
      requestUuid: "req_abc-123",
      status: "invalid_status" as "pending",
    });

    expect(result.operation).toBe("error");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error when request belongs to another staff member", async () => {
    mockFindFirst.mockResolvedValue(null); // Not found = not owned

    const result = await actions.updateRequestStatus({
      requestUuid: "req_other-staff",
      status: "started",
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Request not found");
  });

  it("throws on unauthorized access", async () => {
    mockRequireRoleCapability.mockRejectedValue(
      new Error("Unauthorized: insufficient role capability"),
    );

    await expect(
      actions.updateRequestStatus({
        requestUuid: "req_abc-123",
        status: "started",
      }),
    ).rejects.toThrow("Unauthorized");
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("handles prisma update error gracefully", async () => {
    mockFindFirst.mockResolvedValue({
      request_uuid: "req_abc-123",
      request_status: "pending",
    });
    mockUpdate.mockRejectedValue(new Error("DB connection failed"));

    const result = await actions.updateRequestStatus({
      requestUuid: "req_abc-123",
      status: "started",
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBe("DB connection failed");
  });

  it("handles non-Error exception during update", async () => {
    mockFindFirst.mockResolvedValue({
      request_uuid: "req_abc-123",
      request_status: "pending",
    });
    mockUpdate.mockRejectedValue("string error");

    const result = await actions.updateRequestStatus({
      requestUuid: "req_abc-123",
      status: "started",
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBe(
      "Failed to update request status",
    );
  });
});
