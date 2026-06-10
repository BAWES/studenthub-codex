import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listStaffRequestsSchema,
  getStaffRequestDetailSchema,
  updateRequestStatusSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listStaffRequestsSchema
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
});

// ---------------------------------------------------------------------------
// getStaffRequestDetailSchema
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// updateRequestStatusSchema
// ---------------------------------------------------------------------------

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
// Type shape tests
// ---------------------------------------------------------------------------

type StaffRequestRow = {
  id: string;
  title: string;
  company: string;
  seats: number;
  status: string;
  updated: string;
};

type StaffRequestDetail = {
  requestUuid: string;
  positionTitle: string | null;
  jobDescription: string;
  compensation: string;
  seats: number;
  location: string | null;
  status: string | null;
  company: { company_id: number; company_name: string | null } | null;
};

type UpdateRequestStatusResult = {
  operation: "success" | "error";
  message: string;
};

describe("StaffRequestRow shape", () => {
  it("defines the expected fields", () => {
    const mock: StaffRequestRow = {
      id: "req_abc-123",
      title: "Senior Developer",
      company: "Acme Corp",
      seats: 2,
      status: "started",
      updated: "2 hours ago",
    };
    expect(mock.id).toBe("req_abc-123");
    expect(mock.title).toBe("Senior Developer");
    expect(mock.seats).toBe(2);
    expect(mock.status).toBe("started");
  });
});

describe("StaffRequestDetail shape", () => {
  it("accepts a valid detail object", () => {
    const detail: StaffRequestDetail = {
      requestUuid: "req_abc-123",
      positionTitle: "Senior Developer",
      jobDescription: "Looking for a senior developer...",
      compensation: "$100k-$120k",
      seats: 2,
      location: "New York, NY",
      status: "started",
      company: { company_id: 1, company_name: "Acme Corp" },
    };
    expect(detail.positionTitle).toBe("Senior Developer");
    expect(detail.company?.company_name).toBe("Acme Corp");
  });
});

describe("UpdateRequestStatusResult shape", () => {
  it("accepts a success result", () => {
    const result: UpdateRequestStatusResult = {
      operation: "success",
      message: "Request status updated",
    };
    expect(result.operation).toBe("success");
  });

  it("accepts an error result", () => {
    const result: UpdateRequestStatusResult = {
      operation: "error",
      message: "Request not found",
    };
    expect(result.operation).toBe("error");
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

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { requireRoleCapability } = await import("@/modules/auth/session");
const requests = await import("./actions");

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

describe("listStaffRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRoleCapability).mockResolvedValue(mockStaffUser);
  });

  it("returns paginated requests with defaults", async () => {
    mockFindMany.mockResolvedValue([makeRequestRow()]);
    mockCount.mockResolvedValue(1);

    const result = await requests.listStaffRequests({});

    expect(requireRoleCapability).toHaveBeenCalledWith("staff", "request.read.assigned");
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
    await requests.listStaffRequests({ status: "started" });
    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.request_status).toBe("started");
  });

  it("searches by title and company name", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
    await requests.listStaffRequests({ q: "developer" });
    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.OR).toBeDefined();
    expect(callArgs.where.OR[0].request_position_title.contains).toBe("developer");
  });

  it("respects pagination", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
    await requests.listStaffRequests({ page: 3, limit: 10 });
    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.skip).toBe(20);
    expect(callArgs.take).toBe(10);
  });

  it("returns empty result on invalid input", async () => {
    const result = await requests.listStaffRequests({ limit: 999 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("updateRequestStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRoleCapability).mockResolvedValue(mockStaffUser);
  });

  it("updates status to started for a pending request", async () => {
    mockFindFirst.mockResolvedValue({ request_uuid: "req_abc-123", request_status: "pending" });
    mockUpdate.mockResolvedValue({});
    const result = await requests.updateRequestStatus({ requestUuid: "req_abc-123", status: "started" });
    expect(result.operation).toBe("success");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { request_uuid: "req_abc-123" },
      data: expect.objectContaining({ request_status: "started", request_started_at: expect.any(Date) }),
    });
  });

  it("updates status to delivered with feedback", async () => {
    mockFindFirst.mockResolvedValue({ request_uuid: "req_abc-123", request_status: "started" });
    mockUpdate.mockResolvedValue({});
    const result = await requests.updateRequestStatus({ requestUuid: "req_abc-123", status: "delivered", feedback: "Candidate accepted offer" });
    expect(result.operation).toBe("success");
    const callData = mockUpdate.mock.calls[0][0].data;
    expect(callData.request_status).toBe("delivered");
    expect(callData.request_finished_at).toBeDefined();
    expect(callData.request_feedback).toBe("Candidate accepted offer");
  });

  it("returns error when request not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await requests.updateRequestStatus({ requestUuid: "req_missing", status: "started" });
    expect(result.operation).toBe("error");
    expect(result.message).toBe("Request not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error on invalid input", async () => {
    const result = await requests.updateRequestStatus({ requestUuid: "req_abc-123", status: "invalid_status" as "pending" });
    expect(result.operation).toBe("error");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
