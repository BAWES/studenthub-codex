import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listStaffInterviewsSchema,
  getStaffInterviewDetailSchema,
  updateInterviewStatusSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listStaffInterviewsSchema
// ---------------------------------------------------------------------------

describe("listStaffInterviewsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listStaffInterviewsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listStaffInterviewsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts status filter (0=scheduled, 1=completed, 2=cancelled)", () => {
    const result = listStaffInterviewsSchema.safeParse({ status: "0" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("0");
    }
  });

  it("accepts completed status filter", () => {
    const result = listStaffInterviewsSchema.safeParse({ status: "1" });
    expect(result.success).toBe(true);
  });

  it("accepts cancelled status filter", () => {
    const result = listStaffInterviewsSchema.safeParse({ status: "2" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status filter", () => {
    const result = listStaffInterviewsSchema.safeParse({ status: "99" });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listStaffInterviewsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listStaffInterviewsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts search query", () => {
    const result = listStaffInterviewsSchema.safeParse({ q: "developer" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("developer");
    }
  });
});

// ---------------------------------------------------------------------------
// getStaffInterviewDetailSchema
// ---------------------------------------------------------------------------

describe("getStaffInterviewDetailSchema", () => {
  it("accepts a valid interview UUID", () => {
    const result = getStaffInterviewDetailSchema.safeParse({
      interviewUuid: "interview_abc-123-def-456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getStaffInterviewDetailSchema.safeParse({ interviewUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getStaffInterviewDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateInterviewStatusSchema
// ---------------------------------------------------------------------------

describe("updateInterviewStatusSchema", () => {
  it("accepts valid status update (complete)", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "interview_abc-123",
      status: "1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid status update (cancel)", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "interview_abc-123",
      status: "2",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid status update (reset to scheduled)", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "interview_abc-123",
      status: "0",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "interview_abc-123",
      status: "99",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric status", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "interview_abc-123",
      status: "cancelled",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateInterviewStatusSchema.safeParse({ status: "1" });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "interview_abc-123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty UUID", () => {
    const result = updateInterviewStatusSchema.safeParse({
      interviewUuid: "",
      status: "1",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type InterviewRow = {
  id: string;
  candidate: string;
  requestTitle: string;
  scheduledAt: string;
  status: string;
  note: string;
};

type InterviewDetail = {
  interviewUuid: string;
  candidateName: string | null;
  candidateEmail: string | null;
  requestTitle: string | null;
  companyName: string | null;
  scheduledAt: Date | null;
  status: number | null;
  note: string | null;
};

type UpdateInterviewStatusResult = {
  operation: "success" | "error";
  message: string;
};

describe("InterviewRow shape", () => {
  it("defines the expected fields", () => {
    const mock: InterviewRow = {
      id: "interview_abc-123",
      candidate: "John Doe",
      requestTitle: "Senior Developer",
      scheduledAt: "2 hours ago",
      status: "Scheduled",
      note: "Internal note",
    };
    expect(mock.id).toBe("interview_abc-123");
    expect(mock.candidate).toBe("John Doe");
    expect(mock.status).toBe("Scheduled");
  });
});

describe("InterviewDetail shape", () => {
  it("accepts a valid detail object", () => {
    const detail: InterviewDetail = {
      interviewUuid: "interview_abc-123",
      candidateName: "John Doe",
      candidateEmail: "john@example.com",
      requestTitle: "Senior Developer",
      companyName: "Acme Corp",
      scheduledAt: new Date("2026-06-10T10:00:00Z"),
      status: 0,
      note: "Internal note",
    };
    expect(detail.candidateName).toBe("John Doe");
    expect(detail.companyName).toBe("Acme Corp");
    expect(detail.status).toBe(0);
  });
});

describe("UpdateInterviewStatusResult shape", () => {
  it("accepts a success result", () => {
    const result: UpdateInterviewStatusResult = {
      operation: "success",
      message: "Interview status updated",
    };
    expect(result.operation).toBe("success");
  });

  it("accepts an error result", () => {
    const result: UpdateInterviewStatusResult = {
      operation: "error",
      message: "Interview not found",
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
    request_interview: {
      findMany: mockFindMany,
      count: mockCount,
      findFirst: mockFindFirst,
      update: mockUpdate,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
  requireCapability: vi.fn().mockResolvedValue({ role: "staff", id: "99" }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { requireRoleCapability } = await import("@/modules/auth/session");
const interviews = await import("./actions");

const mockStaffUser = {
  role: "staff" as const,
  id: "99",
  name: "Staff User",
  email: "staff@studenthub.ai",
  issuedAt: Date.now(),
};

function makeInterviewRow(overrides: Record<string, unknown> = {}) {
  return {
    request_interview_uuid: "interview_abc-123",
    interview_at: new Date("2026-06-10T10:00:00Z"),
    status: 0,
    internal_note: "Call with candidate",
    interview_note: "Follow up on interview",
    created_at: new Date("2026-06-08T09:00:00Z"),
    updated_at: new Date("2026-06-09T14:00:00Z"),
    candidate: { candidate_id: 42, candidate_name: "John Doe", candidate_email: "john@example.com", candidate_phone: "+965****0000" },
    request: { request_uuid: "req_abc-123", request_position_title: "Senior Developer", company: { company_name: "Test Corp" } },
    staff: { staff_name: "Staff User" },
    ...overrides,
  };
}

describe("listStaffInterviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRoleCapability).mockResolvedValue(mockStaffUser);
  });

  it("returns paginated interviews with defaults", async () => {
    mockFindMany.mockResolvedValue([makeInterviewRow()]);
    mockCount.mockResolvedValue(1);
    const result = await interviews.listStaffInterviews({});
    expect(requireRoleCapability).toHaveBeenCalledWith("staff", "request.interview");
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
    expect(result.items[0].candidate).toBe("John Doe");
    expect(result.items[0].requestTitle).toBe("Senior Developer");
  });

  it("filters by status", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
    await interviews.listStaffInterviews({ status: "1" });
    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.status).toBe(1);
  });

  it("respects pagination", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
    await interviews.listStaffInterviews({ page: 3, limit: 10 });
    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.skip).toBe(20);
    expect(callArgs.take).toBe(10);
  });

  it("returns empty result on invalid input", async () => {
    const result = await interviews.listStaffInterviews({ limit: 999 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("getStaffInterviewDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRoleCapability).mockResolvedValue(mockStaffUser);
  });

  it("returns interview detail for valid UUID", async () => {
    mockFindFirst.mockResolvedValue(makeInterviewRow());
    const result = await interviews.getStaffInterviewDetail({ interviewUuid: "interview_abc-123" });
    expect(result).not.toBeNull();
    expect(result?.candidateName).toBe("John Doe");
    expect(result?.requestTitle).toBe("Senior Developer");
    expect(result?.status).toBe(0);
  });

  it("returns null when interview not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await interviews.getStaffInterviewDetail({ interviewUuid: "interview_missing" });
    expect(result).toBeNull();
  });

  it("throws on invalid UUID", async () => {
    await expect(interviews.getStaffInterviewDetail({ interviewUuid: "" })).rejects.toThrow();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});

describe("updateInterviewStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRoleCapability).mockResolvedValue(mockStaffUser);
  });

  it("updates status to completed", async () => {
    mockFindFirst.mockResolvedValue({ request_interview_uuid: "interview_abc-123" });
    mockUpdate.mockResolvedValue({});
    const result = await interviews.updateInterviewStatus({ interviewUuid: "interview_abc-123", status: "1" });
    expect(result.operation).toBe("success");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { request_interview_uuid: "interview_abc-123" },
      data: expect.objectContaining({ status: 1, updated_at: expect.any(Date) }),
    });
  });

  it("returns error when interview not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await interviews.updateInterviewStatus({ interviewUuid: "interview_missing", status: "1" });
    expect(result.operation).toBe("error");
    expect(result.message).toBe("Interview not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error on invalid status", async () => {
    const result = await interviews.updateInterviewStatus({ interviewUuid: "interview_abc-123", status: "99" as any });
    expect(result.operation).toBe("error");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
