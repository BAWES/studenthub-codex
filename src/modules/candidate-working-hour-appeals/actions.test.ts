import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

import {
  appealItemSchema,
  appealUpdateItemSchema,
  listAppealsResultSchema,
} from "./schemas";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_working_hour_appeal: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    candidate_working_hour_appeal_updates: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
  requireCapability: vi.fn(),
}));

const { prisma } = await import("@/lib/prisma");

// Import the module under test
const mod = await import("./actions");

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockAppeal = {
  appeal_uuid: "appeal_abc123",
  candidate_working_hour_uuid: "cwh_uuid_1",
  candidate_id: 42,
  reason: "Work hours recorded incorrectly",
  status: 0,
  created_at: new Date("2026-06-01T10:00:00Z"),
  updated_at: new Date("2026-06-01T10:00:00Z"),
};

const mockAppeals = [
  mockAppeal,
  {
    appeal_uuid: "appeal_def456",
    candidate_working_hour_uuid: "cwh_uuid_2",
    candidate_id: 42,
    reason: "Clock-out time was wrong",
    status: 1,
    created_at: new Date("2026-06-02T14:00:00Z"),
    updated_at: new Date("2026-06-02T14:00:00Z"),
  },
];

const mockAppealUpdate = {
  appeal_update_uuid: "upd_abc123",
  appeal_uuid: "appeal_abc123",
  update: "Reviewed by manager",
  detail: "Status changed to approved after verification",
  created_at: new Date("2026-06-01T12:00:00Z"),
  updated_at: new Date("2026-06-01T12:00:00Z"),
  created_by: 1,
  updated_by: 1,
  is_new: false,
};

// ---------------------------------------------------------------------------
// listAppeals
// ---------------------------------------------------------------------------

describe("CandidateWorkingHourAppeal - listAppeals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    vi.mocked(prisma.candidate_working_hour_appeal.findMany).mockResolvedValue(mockAppeals);
    vi.mocked(prisma.candidate_working_hour_appeal.count).mockResolvedValue(2);

    const result = await mod.listAppeals({});

    expect(result.appeals).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
    expect(prisma.candidate_working_hour_appeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        orderBy: { created_at: "desc" },
      }),
    );
  });

  it("filters by candidate_id when provided", async () => {
    vi.mocked(prisma.candidate_working_hour_appeal.findMany).mockResolvedValue(mockAppeals);
    vi.mocked(prisma.candidate_working_hour_appeal.count).mockResolvedValue(2);

    await mod.listAppeals({ candidate_id: 42 });

    expect(prisma.candidate_working_hour_appeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          candidate_id: 42,
        }),
      }),
    );
  });

  it("filters by status when provided", async () => {
    vi.mocked(prisma.candidate_working_hour_appeal.findMany).mockResolvedValue([mockAppeal]);
    vi.mocked(prisma.candidate_working_hour_appeal.count).mockResolvedValue(1);

    const result = await mod.listAppeals({ status: 0 });

    expect(result.appeals).toHaveLength(1);
    expect(result.appeals[0].status).toBe(0);
  });

  it("filters by date range when provided", async () => {
    vi.mocked(prisma.candidate_working_hour_appeal.findMany).mockResolvedValue([mockAppeal]);
    vi.mocked(prisma.candidate_working_hour_appeal.count).mockResolvedValue(1);

    await mod.listAppeals({
      date_from: "2026-06-01",
      date_to: "2026-06-01",
    });

    expect(prisma.candidate_working_hour_appeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          created_at: {
            gte: new Date("2026-06-01"),
            lte: new Date("2026-06-01"),
          },
        }),
      }),
    );
  });

  it("handles empty results", async () => {
    vi.mocked(prisma.candidate_working_hour_appeal.findMany).mockResolvedValue([]);
    vi.mocked(prisma.candidate_working_hour_appeal.count).mockResolvedValue(0);

    const result = await mod.listAppeals({});

    expect(result.appeals).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("validates pagination params", async () => {
    vi.mocked(prisma.candidate_working_hour_appeal.findMany).mockResolvedValue([]);
    vi.mocked(prisma.candidate_working_hour_appeal.count).mockResolvedValue(0);

    await expect(mod.listAppeals({ page: -1 })).rejects.toThrow();
    await expect(mod.listAppeals({ limit: 200 })).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// getAppeal
// ---------------------------------------------------------------------------

describe("CandidateWorkingHourAppeal - getAppeal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns appeal by UUID", async () => {
    vi.mocked(prisma.candidate_working_hour_appeal.findUnique).mockResolvedValue(mockAppeal);

    const result = await mod.getAppeal({ uuid: "appeal_abc123" });

    expect(result.appeal_uuid).toBe("appeal_abc123");
    expect(result.candidate_id).toBe(42);
    expect(result.status).toBe(0);
    expect(prisma.candidate_working_hour_appeal.findUnique).toHaveBeenCalledWith({
      where: { appeal_uuid: "appeal_abc123" },
    });
  });

  it("throws when appeal not found", async () => {
    vi.mocked(prisma.candidate_working_hour_appeal.findUnique).mockResolvedValue(null);

    await expect(mod.getAppeal({ uuid: "appeal_nonexistent" })).rejects.toThrow(
      /not found/i,
    );
  });

  it("validates UUID is required", async () => {
    await expect(mod.getAppeal({ uuid: "" })).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// createAppeal
// ---------------------------------------------------------------------------

describe("CandidateWorkingHourAppeal - createAppeal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new appeal", async () => {
    const now = new Date();
    vi.mocked(prisma.candidate_working_hour_appeal.create).mockResolvedValue({
      ...mockAppeal,
      created_at: now,
      updated_at: now,
    });

    const result = await mod.createAppeal({
      candidate_working_hour_uuid: "cwh_uuid_1",
      candidate_id: 42,
      reason: "Work hours recorded incorrectly",
    });

    expect(result.reason).toBe("Work hours recorded incorrectly");
    expect(result.status).toBe(0);
    expect(prisma.candidate_working_hour_appeal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          candidate_working_hour_uuid: "cwh_uuid_1",
          candidate_id: 42,
          reason: "Work hours recorded incorrectly",
        }),
      }),
    );
  });

  it("validates required fields", async () => {
    await expect(
      mod.createAppeal({} as any),
    ).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// updateAppealStatus
// ---------------------------------------------------------------------------

describe("CandidateWorkingHourAppeal - updateAppealStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates appeal status", async () => {
    const now = new Date();
    const updated = { ...mockAppeal, status: 1, updated_at: now };
    vi.mocked(prisma.candidate_working_hour_appeal.update).mockResolvedValue(updated);

    const result = await mod.updateAppealStatus({
      uuid: "appeal_abc123",
      status: 1,
    });

    expect(result.status).toBe(1);
    expect(prisma.candidate_working_hour_appeal.update).toHaveBeenCalledWith({
      where: { appeal_uuid: "appeal_abc123" },
      data: { status: 1, updated_at: expect.any(Date) },
    });
  });

  it("validates status range", async () => {
    await expect(
      mod.updateAppealStatus({ uuid: "appeal_abc123", status: -1 }),
    ).rejects.toThrow();
    await expect(
      mod.updateAppealStatus({ uuid: "appeal_abc123", status: 5 }),
    ).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// listAppealUpdates
// ---------------------------------------------------------------------------

describe("CandidateWorkingHourAppeal - listAppealUpdates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists updates for an appeal", async () => {
    vi.mocked(prisma.candidate_working_hour_appeal_updates.findMany).mockResolvedValue([
      mockAppealUpdate,
    ]);

    const result = await mod.listAppealUpdates({ appeal_uuid: "appeal_abc123" });

    expect(result).toHaveLength(1);
    expect(result[0].appeal_uuid).toBe("appeal_abc123");
    expect(prisma.candidate_working_hour_appeal_updates.findMany).toHaveBeenCalledWith({
      where: { appeal_uuid: "appeal_abc123" },
      orderBy: { created_at: "desc" },
    });
  });
});

// ---------------------------------------------------------------------------
// createAppealUpdate
// ---------------------------------------------------------------------------

describe("CandidateWorkingHourAppeal - createAppealUpdate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an update for an appeal", async () => {
    const now = new Date();
    vi.mocked(prisma.candidate_working_hour_appeal_updates.create).mockResolvedValue({
      ...mockAppealUpdate,
      created_at: now,
      updated_at: now,
    });

    const result = await mod.createAppealUpdate({
      appeal_uuid: "appeal_abc123",
      update: "Reviewed by manager",
      detail: "Checked time logs, hours are valid",
    });

    expect(result.update).toBe("Reviewed by manager");
    // Verify create was called with expected shape (generated UUID)
    expect(prisma.candidate_working_hour_appeal_updates.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        appeal_uuid: "appeal_abc123",
        update: "Reviewed by manager",
        detail: "Checked time logs, hours are valid",
        is_new: true,
      }),
    });
  });
});

// ---------------------------------------------------------------------------
// Zod output schema validation
// ---------------------------------------------------------------------------

describe("appealItemSchema (output)", () => {
  it("validates a complete appeal item", () => {
    const item = {
      appeal_uuid: "appeal_abc123",
      candidate_working_hour_uuid: "cwh_uuid_1",
      candidate_id: 42,
      reason: "Work hours recorded incorrectly",
      status: 0,
      created_at: new Date("2026-06-01T10:00:00Z"),
      updated_at: new Date("2026-06-01T10:00:00Z"),
    };
    expect(appealItemSchema.safeParse(item).success).toBe(true);
  });

  it("accepts null reason", () => {
    const item = {
      appeal_uuid: "appeal_abc123",
      candidate_working_hour_uuid: "cwh_uuid_1",
      candidate_id: 42,
      reason: null,
      status: 0,
      created_at: null,
      updated_at: null,
    };
    expect(appealItemSchema.safeParse(item).success).toBe(true);
  });

  it("rejects missing appeal_uuid", () => {
    expect(
      appealItemSchema.safeParse({
        candidate_working_hour_uuid: "cwh_uuid_1",
        candidate_id: 42,
        reason: null,
        status: 0,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      appealItemSchema.safeParse({
        appeal_uuid: "appeal_abc123",
        candidate_working_hour_uuid: "cwh_uuid_1",
        candidate_id: 42,
        reason: null,
        status: "pending",
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(false);
  });
});

describe("appealUpdateItemSchema (output)", () => {
  it("validates a complete update item", () => {
    const item = {
      appeal_update_uuid: "upd_abc123",
      appeal_uuid: "appeal_abc123",
      update: "Reviewed by manager",
      detail: "Status changed to approved after verification",
      created_at: new Date("2026-06-01T12:00:00Z"),
      updated_at: new Date("2026-06-01T12:00:00Z"),
      created_by: 1,
      updated_by: 1,
      is_new: false,
    };
    expect(appealUpdateItemSchema.safeParse(item).success).toBe(true);
  });

  it("accepts null update fields", () => {
    const item = {
      appeal_update_uuid: "upd_abc123",
      appeal_uuid: "appeal_abc123",
      update: null,
      detail: null,
      created_at: null,
      updated_at: null,
      created_by: null,
      updated_by: null,
      is_new: null,
    };
    expect(appealUpdateItemSchema.safeParse(item).success).toBe(true);
  });

  it("rejects missing appeal_update_uuid", () => {
    expect(
      appealUpdateItemSchema.safeParse({
        appeal_uuid: "appeal_abc123",
        update: null,
        detail: null,
        created_at: null,
        updated_at: null,
        created_by: null,
        updated_by: null,
        is_new: null,
      }).success,
    ).toBe(false);
  });
});

describe("listAppealsResultSchema (output)", () => {
  it("validates a paginated result", () => {
    const data = {
      appeals: [
        {
          appeal_uuid: "appeal_abc123",
          candidate_working_hour_uuid: "cwh_uuid_1",
          candidate_id: 42,
          reason: "Work hours recorded incorrectly",
          status: 0,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(listAppealsResultSchema.safeParse(data).success).toBe(true);
  });

  it("handles empty appeals array", () => {
    const data = {
      appeals: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(listAppealsResultSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing totalPages", () => {
    expect(
      listAppealsResultSchema.safeParse({
        appeals: [],
        total: 0,
        page: 1,
        limit: 20,
      }).success,
    ).toBe(false);
  });
});
