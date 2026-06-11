import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — delegate to module actions (these now contain the real logic)
// ---------------------------------------------------------------------------

const mockModuleListSchedule = vi.fn();
const mockModuleGetScheduleItem = vi.fn();
const mockModuleGetScheduleDetail = vi.fn();
const mockModuleUpdateScheduleStatus = vi.fn();

vi.mock("@/modules/candidates/schedule/actions", () => ({
  listSchedule: mockModuleListSchedule,
  getScheduleItem: mockModuleGetScheduleItem,
  getScheduleDetail: mockModuleGetScheduleDetail,
  updateScheduleStatus: mockModuleUpdateScheduleStatus,
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

// Must import after mocks are set up
const { requireRoleCapability } = await import("@/modules/auth/session");
const {
  listSchedule,
  getScheduleItem,
  getScheduleDetail,
  updateScheduleStatus,
} = await import("./actions");

import {
  listScheduleSchema,
  getScheduleItemSchema,
  getScheduleDetailSchema,
  updateScheduleStatusSchema,
} from "./schemas";

const mockUser = { id: 1, role: "candidate" };

// ---------------------------------------------------------------------------
// Schema tests (pure — no mock dependency)
// ---------------------------------------------------------------------------

describe("listScheduleSchema", () => {
  it("accepts empty params (default — no pagination, no filter)", () => {
    expect(listScheduleSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listScheduleSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts optional date filter", () => {
    const r = listScheduleSchema.safeParse({ dateFrom: "2026-06-01", dateTo: "2026-06-30" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.dateFrom).toBe("2026-06-01");
      expect(r.data.dateTo).toBe("2026-06-30");
    }
  });

  it("rejects limit over 100", () => {
    expect(listScheduleSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listScheduleSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

describe("getScheduleItemSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getScheduleItemSchema.safeParse({ cwd_uuid: "abc-123-def" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getScheduleItemSchema.safeParse({ cwd_uuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getScheduleItemSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateScheduleStatusSchema", () => {
  it("accepts valid status update to confirmed (1)", () => {
    const r = updateScheduleStatusSchema.safeParse({
      cwd_uuid: "abc-123-def",
      status: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.cwd_uuid).toBe("abc-123-def");
      expect(r.data.status).toBe(1);
    }
  });

  it("accepts valid status update to cancelled (2)", () => {
    const r = updateScheduleStatusSchema.safeParse({
      cwd_uuid: "abc-123-def",
      status: 2,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe(2);
    }
  });

  it("rejects invalid status 99", () => {
    expect(
      updateScheduleStatusSchema.safeParse({
        cwd_uuid: "abc-123-def",
        status: 99,
      }).success,
    ).toBe(false);
  });

  it("rejects empty UUID", () => {
    expect(
      updateScheduleStatusSchema.safeParse({
        cwd_uuid: "",
        status: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects negative status", () => {
    expect(
      updateScheduleStatusSchema.safeParse({
        cwd_uuid: "abc-123-def",
        status: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing status", () => {
    expect(
      updateScheduleStatusSchema.safeParse({
        cwd_uuid: "abc-123-def",
      }).success,
    ).toBe(false);
  });

  it("rejects string status (must be number)", () => {
    expect(
      updateScheduleStatusSchema.safeParse({
        cwd_uuid: "abc-123-def",
        status: "1",
      }).success,
    ).toBe(false);
  });
});

describe("getScheduleDetailSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getScheduleDetailSchema.safeParse({ cwd_uuid: "abc-123-def" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getScheduleDetailSchema.safeParse({ cwd_uuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getScheduleDetailSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action tests — verify delegation to module
// ---------------------------------------------------------------------------

describe("listSchedule (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module with session candidateId", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
    mockModuleListSchedule.mockResolvedValue([
      {
        cwd_uuid: "wd-1",
        date: new Date("2026-06-11"),
        start_time: new Date("2026-06-11T09:00:00"),
        end_time: new Date("2026-06-11T17:00:00"),
        total_time: 8,
        status: 1,
        store_name: "Store A",
        company_name: "Company A",
      },
    ]);

    const result = await listSchedule({ page: 1, limit: 20 });

    expect(mockModuleListSchedule).toHaveBeenCalledWith(1, { page: 1, limit: 20 });
    expect(result).toHaveLength(1);
    expect(result[0].cwd_uuid).toBe("wd-1");
    expect(result[0].company_name).toBe("Company A");
  });

  it("passes date filter when provided", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
    mockModuleListSchedule.mockResolvedValue([]);

    await listSchedule({ dateFrom: "2026-06-01", dateTo: "2026-06-30" });

    expect(mockModuleListSchedule).toHaveBeenCalledWith(1, {
      page: 1,
      limit: 20,
      dateFrom: "2026-06-01",
      dateTo: "2026-06-30",
    });
  });
});

describe("getScheduleItem (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module with session candidateId and UUID", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
    mockModuleGetScheduleItem.mockResolvedValue({
      cwd_uuid: "wd-1",
      date: new Date(),
      start_time: new Date(),
      end_time: null,
      total_time: null,
      status: 0,
      store_name: "Store B",
      company_name: "Company B",
    });

    const result = await getScheduleItem("wd-1");

    expect(mockModuleGetScheduleItem).toHaveBeenCalledWith(1, "wd-1");
    expect(result).not.toBeNull();
    expect(result!.store_name).toBe("Store B");
  });

  it("returns null when module returns null", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
    mockModuleGetScheduleItem.mockResolvedValue(null);

    const result = await getScheduleItem("nonexistent");

    expect(result).toBeNull();
  });
});

describe("updateScheduleStatus (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module with session candidateId and status data", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
    mockModuleUpdateScheduleStatus.mockResolvedValue({
      cwd_uuid: "wd-1",
      status: 1,
    });

    const result = await updateScheduleStatus({ cwd_uuid: "wd-1", status: 1 });

    expect(mockModuleUpdateScheduleStatus).toHaveBeenCalledWith(1, {
      cwd_uuid: "wd-1",
      status: 1,
    });
    expect(result.status).toBe(1);
  });
});
