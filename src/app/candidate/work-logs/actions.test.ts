import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listWorkLogsSchema,
  getWorkLogDetailSchema,
  submitWorkLogSchema,
  updateWorkLogStatusSchema,
} from "./schemas";

// ── Hoisted mock functions ─────────────────────────────────────────────
const {
  mockRequireCapability,
  mockModuleListWorklogs,
  mockModuleGetWorklog,
  mockModuleCreateWorklog,
  mockModuleUpdateWorklogStatus,
  mockPrismaUpdate,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockModuleListWorklogs: vi.fn(),
  mockModuleGetWorklog: vi.fn(),
  mockModuleCreateWorklog: vi.fn(),
  mockModuleUpdateWorklogStatus: vi.fn(),
  mockPrismaUpdate: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

// ── Mock session module ────────────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock module actions (the primary delegation target) ────────────────
vi.mock("@/modules/worklogs/actions", () => ({
  listWorklogs: mockModuleListWorklogs,
  getWorklog: mockModuleGetWorklog,
  createWorklog: mockModuleCreateWorklog,
  updateWorklogStatus: mockModuleUpdateWorklogStatus,
}));

// ── Mock Prisma (still needed for updateWorkLogStatus) ─────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_working_hour: {
      update: mockPrismaUpdate,
    },
  },
}));

// ── Mock next/cache ────────────────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Import after mocks ─────────────────────────────────────────────────
import {
  listWorkLogs,
  getWorkLogDetail,
  submitWorkLog,
  updateWorkLogStatus,
} from "./actions";

// =========================================================================
// Schema tests (pure unit — no mocks needed)
// =========================================================================

describe("listWorkLogsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listWorkLogsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.date).toBeUndefined();
    }
  });

  it("accepts pagination params", () => {
    const result = listWorkLogsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts date filter", () => {
    const result = listWorkLogsSchema.safeParse({ date: "2026-06-01" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBe("2026-06-01");
    }
  });

  it("rejects limit over 100", () => {
    const result = listWorkLogsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listWorkLogsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

describe("getWorkLogDetailSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getWorkLogDetailSchema.safeParse({
      workLogUuid: "wh_abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workLogUuid).toBe("wh_abc-123-def-456");
    }
  });

  it("rejects empty UUID", () => {
    const result = getWorkLogDetailSchema.safeParse({ workLogUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getWorkLogDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("submitWorkLogSchema", () => {
  it("accepts valid minimal params (date + startTime)", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBe("2026-06-15");
      expect(result.data.startTime).toBe("2026-06-15T08:00:00");
      expect(result.data.endTime).toBeUndefined();
    }
  });

  it("accepts all optional fields", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
      endTime: "2026-06-15T16:00:00",
      totalTime: 480,
      note: "Test work log entry",
      storeId: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.endTime).toBe("2026-06-15T16:00:00");
      expect(result.data.totalTime).toBe(480);
      expect(result.data.note).toBe("Test work log entry");
      expect(result.data.storeId).toBe(5);
    }
  });

  it("rejects missing date", () => {
    const result = submitWorkLogSchema.safeParse({
      startTime: "2026-06-15T08:00:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing startTime", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "2026-06-15",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty date", () => {
    const result = submitWorkLogSchema.safeParse({
      date: "",
      startTime: "2026-06-15T08:00:00",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateWorkLogStatusSchema", () => {
  it("accepts valid update params", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wh_abc-123-def-456",
      status: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workLogUuid).toBe("wh_abc-123-def-456");
      expect(result.data.status).toBe(1);
    }
  });

  it("accepts status 0", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wh_abc-123-def-456",
      status: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects status negative", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wh_abc-123-def-456",
      status: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = updateWorkLogStatusSchema.safeParse({ status: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = updateWorkLogStatusSchema.safeParse({
      workLogUuid: "wh_abc-123-def-456",
    });
    expect(result.success).toBe(false);
  });
});

// =========================================================================
// Delegation tests — verify app router actions delegate to module actions
// =========================================================================

const SESSION = { id: "123", role: "candidate", email: "candidate@test.com" };
const WORKLOG_UUID = "wl_abc-123";
const DATE_STR = "2026-06-15";

const MODULE_WORKLOG = {
  uuid: WORKLOG_UUID,
  date: DATE_STR,
  startTime: "2026-06-15T08:00:00.000Z",
  endTime: "2026-06-15T16:00:00.000Z",
  totalTime: 480,
  note: "Test work log",
  status: 0,
  via: "Manual Log",
  storeId: null,
};

describe("listWorkLogs — delegation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(SESSION);
  });

  it("calls module listWorklogs and returns paginated results", async () => {
    const worklogs = Array.from({ length: 5 }, (_, i) => ({
      ...MODULE_WORKLOG,
      uuid: `${WORKLOG_UUID}_${i}`,
      date: DATE_STR,
    }));
    mockModuleListWorklogs.mockResolvedValue({ worklogs, error: undefined });

    const result = await listWorkLogs({ page: 1, limit: 20 });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate.read.own");
    expect(mockModuleListWorklogs).toHaveBeenCalledWith({ date: undefined });

    expect(result.items).toHaveLength(5);
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
  });

  it("returns empty result on invalid input", async () => {
    const result = await listWorkLogs({ page: -1 });

    expect(mockModuleListWorklogs).not.toHaveBeenCalled();
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("passes date filter to module", async () => {
    mockModuleListWorklogs.mockResolvedValue({ worklogs: [] });

    await listWorkLogs({ date: "2026-06-01" });

    expect(mockModuleListWorklogs).toHaveBeenCalledWith({ date: "2026-06-01" });
  });

  it("paginates module results correctly", async () => {
    const worklogs = Array.from({ length: 10 }, (_, i) => ({
      ...MODULE_WORKLOG,
      uuid: `${WORKLOG_UUID}_${i}`,
    }));
    mockModuleListWorklogs.mockResolvedValue({ worklogs });

    const result = await listWorkLogs({ page: 2, limit: 3 });

    expect(result.items).toHaveLength(3);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(3);
    expect(result.totalPages).toBe(4); // ceil(10/3)
  });
});

describe("getWorkLogDetail — delegation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(SESSION);
  });

  it("calls module getWorklog and returns detail", async () => {
    mockModuleGetWorklog.mockResolvedValue({ worklog: MODULE_WORKLOG });

    const result = await getWorkLogDetail({ workLogUuid: WORKLOG_UUID });

    expect(mockRequireCapability).toHaveBeenCalledWith("candidate.read.own");
    expect(mockModuleGetWorklog).toHaveBeenCalledWith({
      worklogUuid: WORKLOG_UUID,
    });
    expect(result).not.toBeNull();
    expect(result!.candidate_working_hour_uuid).toBe(WORKLOG_UUID);
    expect(result!.status).toBe(0);
  });

  it("returns null when module returns null", async () => {
    mockModuleGetWorklog.mockResolvedValue({ worklog: null });

    const result = await getWorkLogDetail({ workLogUuid: WORKLOG_UUID });

    expect(result).toBeNull();
  });

  it("throws on invalid input", async () => {
    await expect(
      getWorkLogDetail({ workLogUuid: "" }),
    ).rejects.toThrow();
    expect(mockModuleGetWorklog).not.toHaveBeenCalled();
  });
});

describe("submitWorkLog — delegation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(SESSION);
    mockModuleCreateWorklog.mockResolvedValue({ success: true });
  });

  it("calls module createWorklog with FormData and returns success", async () => {
    const result = await submitWorkLog({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith(
      "candidate.profile.edit",
    );
    expect(mockModuleCreateWorklog).toHaveBeenCalledTimes(1);

    // Check FormData content passed to module
    const [prevState, fd] = mockModuleCreateWorklog.mock.calls[0];
    expect(prevState).toEqual({ success: false });
    expect(fd.get("date")).toBe("2026-06-15");
    expect(fd.get("startTime")).toBe("08:00");

    expect(result.operation).toBe("success");
    expect(result.message).toBe("Work log submitted successfully");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate/work-logs");
  });

  it("includes endTime and note when provided", async () => {
    await submitWorkLog({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
      endTime: "2026-06-15T16:30:00",
      note: "Worked on project X",
    });

    const [, fd] = mockModuleCreateWorklog.mock.calls[0];
    expect(fd.get("endTime")).toBe("16:30");
    expect(fd.get("note")).toBe("Worked on project X");
  });

  it("returns error on module failure", async () => {
    mockModuleCreateWorklog.mockResolvedValue({
      success: false,
      error: "Module error",
    });

    const result = await submitWorkLog({
      date: "2026-06-15",
      startTime: "2026-06-15T08:00:00",
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Module error");
  });

  it("returns error on invalid input", async () => {
    const result = await submitWorkLog({
      date: "",
      startTime: "",
    });

    expect(result.operation).toBe("error");
    expect(mockModuleCreateWorklog).not.toHaveBeenCalled();
  });
});

describe("updateWorkLogStatus — delegation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(SESSION);
  });

  it("delegates ownership check to module updateWorklogStatus", async () => {
    mockModuleUpdateWorklogStatus.mockResolvedValue({
      success: true,
      worklog: { ...MODULE_WORKLOG, status: 2 },
    });

    const result = await updateWorkLogStatus({
      workLogUuid: WORKLOG_UUID,
      status: 2,
    });

    // Verify delegation to module
    expect(mockRequireCapability).toHaveBeenCalledWith(
      "candidate.profile.edit",
    );
    expect(mockModuleUpdateWorklogStatus).toHaveBeenCalledWith({
      worklogUuid: WORKLOG_UUID,
      status: 2,
    });

    expect(result.operation).toBe("success");
    expect(result.message).toBe("Work log status updated");
    expect(result.workLog?.status).toBe(2);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/candidate/work-logs");
  });

  it("returns error when module updateWorklogStatus returns not found", async () => {
    mockModuleUpdateWorklogStatus.mockResolvedValue({
      success: false,
      error: "Work log not found.",
    });

    const result = await updateWorkLogStatus({
      workLogUuid: WORKLOG_UUID,
      status: 1,
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Work log not found.");
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns error on invalid input", async () => {
    const result = await updateWorkLogStatus({
      workLogUuid: "",
      status: 1,
    });

    expect(result.operation).toBe("error");
    expect(mockModuleGetWorklog).not.toHaveBeenCalled();
    expect(mockPrismaUpdate).not.toHaveBeenCalled();
  });

  it("returns error when module updateWorklogStatus throws", async () => {
    mockModuleUpdateWorklogStatus.mockRejectedValue(new Error("DB error"));

    const result = await updateWorkLogStatus({
      workLogUuid: WORKLOG_UUID,
      status: 1,
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBe("DB error");
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
