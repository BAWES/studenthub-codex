import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Mock modules before importing the actions
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_work_log_feedback: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
}));

const { prisma } = await import("@/lib/prisma");

// ---------------------------------------------------------------------------
// Import the module under test
// ---------------------------------------------------------------------------

const mod = await import("./actions");

describe("CandidateWorkLogFeedback - listWorkLogFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRows = [
    {
      cwlf_uuid: "cwlf_abc123",
      candidate_id: 42,
      store_id: 1,
      company_id: 2,
      date: new Date("2026-06-01"),
      candidate_working_hour_uuid: "cwh_uuid_1",
      status: 1,
      note: "Good work",
      reason: null,
      is_public: true,
      rating: null,
      created_by: "contact_uuid_1",
      created_at: new Date("2026-06-01T10:00:00Z"),
      updated_at: new Date("2026-06-01T10:00:00Z"),
    },
    {
      cwlf_uuid: "cwlf_def456",
      candidate_id: 42,
      store_id: 1,
      company_id: 2,
      date: new Date("2026-06-02"),
      candidate_working_hour_uuid: null,
      status: 0,
      note: "Pending review",
      reason: null,
      is_public: false,
      rating: null,
      created_by: null,
      created_at: new Date("2026-06-02T14:00:00Z"),
      updated_at: new Date("2026-06-02T14:00:00Z"),
    },
  ];

  it("returns paginated list with default params", async () => {
    vi.mocked(prisma.candidate_work_log_feedback.findMany).mockResolvedValue(mockRows);
    vi.mocked(prisma.candidate_work_log_feedback.count).mockResolvedValue(2);

    const result = await mod.listWorkLogFeedback({});

    expect(result.workLogFeedbacks).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
    expect(prisma.candidate_work_log_feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        orderBy: { created_at: "desc" },
      }),
    );
  });

  it("filters by candidate_id when provided", async () => {
    vi.mocked(prisma.candidate_work_log_feedback.findMany).mockResolvedValue(mockRows);
    vi.mocked(prisma.candidate_work_log_feedback.count).mockResolvedValue(2);

    await mod.listWorkLogFeedback({ candidate_id: 42 });

    expect(prisma.candidate_work_log_feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          candidate_id: 42,
        }),
      }),
    );
  });

  it("filters by status when provided", async () => {
    vi.mocked(prisma.candidate_work_log_feedback.findMany).mockResolvedValue(
      mockRows.filter((r) => r.status === 1),
    );
    vi.mocked(prisma.candidate_work_log_feedback.count).mockResolvedValue(1);

    const result = await mod.listWorkLogFeedback({ status: 1 });

    expect(result.workLogFeedbacks).toHaveLength(1);
    expect(result.workLogFeedbacks[0].status).toBe(1);
  });

  it("filters by date range when provided", async () => {
    vi.mocked(prisma.candidate_work_log_feedback.findMany).mockResolvedValue([mockRows[0]]);
    vi.mocked(prisma.candidate_work_log_feedback.count).mockResolvedValue(1);

    await mod.listWorkLogFeedback({
      date_from: "2026-06-01",
      date_to: "2026-06-01",
    });

    expect(prisma.candidate_work_log_feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          date: {
            gte: new Date("2026-06-01"),
            lte: new Date("2026-06-01"),
          },
        }),
      }),
    );
  });

  it("handles empty results", async () => {
    vi.mocked(prisma.candidate_work_log_feedback.findMany).mockResolvedValue([]);
    vi.mocked(prisma.candidate_work_log_feedback.count).mockResolvedValue(0);

    const result = await mod.listWorkLogFeedback({});

    expect(result.workLogFeedbacks).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("validates pagination params", async () => {
    vi.mocked(prisma.candidate_work_log_feedback.findMany).mockResolvedValue([]);
    vi.mocked(prisma.candidate_work_log_feedback.count).mockResolvedValue(0);

    await expect(mod.listWorkLogFeedback({ page: -1 })).rejects.toThrow();
    await expect(mod.listWorkLogFeedback({ limit: 200 })).rejects.toThrow();
  });
});

describe("CandidateWorkLogFeedback - getWorkLogFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRow = {
    cwlf_uuid: "cwlf_abc123",
    candidate_id: 42,
    store_id: 1,
    company_id: 2,
    date: new Date("2026-06-01"),
    candidate_working_hour_uuid: "cwh_uuid_1",
    status: 1,
    note: "Good work",
    reason: null,
    is_public: true,
    rating: null,
    created_by: "contact_uuid_1",
    created_at: new Date("2026-06-01T10:00:00Z"),
    updated_at: new Date("2026-06-01T10:00:00Z"),
  };

  it("returns feedback by UUID", async () => {
    vi.mocked(prisma.candidate_work_log_feedback.findUnique).mockResolvedValue(mockRow);

    const result = await mod.getWorkLogFeedback({ uuid: "cwlf_abc123" });

    expect(result.cwlf_uuid).toBe("cwlf_abc123");
    expect(result.candidate_id).toBe(42);
    expect(result.status).toBe(1);
    expect(prisma.candidate_work_log_feedback.findUnique).toHaveBeenCalledWith({
      where: { cwlf_uuid: "cwlf_abc123" },
    });
  });

  it("throws when feedback not found", async () => {
    vi.mocked(prisma.candidate_work_log_feedback.findUnique).mockResolvedValue(null);

    await expect(mod.getWorkLogFeedback({ uuid: "cwlf_nonexistent" })).rejects.toThrow(
      /not found/i,
    );
  });

  it("validates UUID is required", async () => {
    await expect(mod.getWorkLogFeedback({ uuid: "" })).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Zod schema tests
// ---------------------------------------------------------------------------

const schemas = await import("./schemas");

describe("CandidateWorkLogFeedback - output schemas", () => {
  describe("workLogFeedbackItemSchema", () => {
    const validItem = {
      cwlf_uuid: "cwlf_abc123",
      candidate_id: 42,
      store_id: 1,
      company_id: 2,
      date: new Date("2026-06-01"),
      candidate_working_hour_uuid: "cwh_uuid_1",
      status: 1,
      note: "Good work",
      reason: null,
      is_public: true,
      rating: null,
      created_by: "contact_uuid_1",
      created_at: new Date("2026-06-01T10:00:00Z"),
      updated_at: new Date("2026-06-01T10:00:00Z"),
    };

    it("parses a valid work log feedback item", () => {
      const result = schemas.workLogFeedbackItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it("accepts nullable fields as null", () => {
      const item = {
        ...validItem,
        candidate_working_hour_uuid: null,
        status: null,
        note: null,
        reason: null,
        is_public: null,
        rating: null,
        created_by: null,
        created_at: null,
        updated_at: null,
      };
      const result = schemas.workLogFeedbackItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it("rejects missing required field cwlf_uuid", () => {
      const { cwlf_uuid, ...incomplete } = validItem;
      const result = schemas.workLogFeedbackItemSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it("rejects string instead of number for candidate_id", () => {
      const result = schemas.workLogFeedbackItemSchema.safeParse({
        ...validItem,
        candidate_id: "not-a-number",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("listWorkLogFeedbackResultSchema", () => {
    const validResult = {
      workLogFeedbacks: [
        {
          cwlf_uuid: "cwlf_abc123",
          candidate_id: 42,
          store_id: 1,
          company_id: 2,
          date: new Date("2026-06-01"),
          candidate_working_hour_uuid: null,
          status: 1,
          note: "Good work",
          reason: null,
          is_public: true,
          rating: null,
          created_by: null,
          created_at: new Date("2026-06-01T10:00:00Z"),
          updated_at: new Date("2026-06-01T10:00:00Z"),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    it("parses a valid list result", () => {
      const result = schemas.listWorkLogFeedbackResultSchema.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it("parses empty array result", () => {
      const result = schemas.listWorkLogFeedbackResultSchema.safeParse({
        workLogFeedbacks: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative total", () => {
      const result = schemas.listWorkLogFeedbackResultSchema.safeParse({
        ...validResult,
        total: -1,
      });
      expect(result.success).toBe(false);
    });
  });
});
