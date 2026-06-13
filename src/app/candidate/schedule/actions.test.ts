import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — delegate to module actions (these now contain the real logic)
// ---------------------------------------------------------------------------

const mockModuleListScheduleAction = vi.fn();
const mockModuleGetScheduleItemAction = vi.fn();
const mockModuleGetScheduleDetailAction = vi.fn();
const mockModuleUpdateScheduleStatusAction = vi.fn();

vi.mock("@/modules/candidates/schedule/actions", () => ({
  listScheduleAction: mockModuleListScheduleAction,
  getScheduleItemAction: mockModuleGetScheduleItemAction,
  getScheduleDetailAction: mockModuleGetScheduleDetailAction,
  updateScheduleStatusAction: mockModuleUpdateScheduleStatusAction,
  // Prisma-level functions (called internally by route-level wrappers)
  listSchedule: vi.fn(),
  getScheduleItem: vi.fn(),
  getScheduleDetail: vi.fn(),
  updateScheduleStatus: vi.fn(),
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
    expect(
      listScheduleSchema.safeParse({ page: 2, limit: 50 }).success,
    ).toBe(true);
  });

  it("accepts optional date range filters", () => {
    expect(
      listScheduleSchema
        .safeParse({
          page: 1,
          limit: 20,
          dateFrom: "2026-01-01",
          dateTo: "2026-01-31",
        })
        .success,
    ).toBe(true);
  });

  it("rejects negative page", () => {
    expect(listScheduleSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("defaults page to 1 and limit to 20", () => {
    const parsed = listScheduleSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });
});

describe("getScheduleItemSchema", () => {
  it("accepts valid cwd_uuid", () => {
    expect(
      getScheduleItemSchema.safeParse({ cwd_uuid: "wd-abc123" }).success,
    ).toBe(true);
  });

  it("rejects empty cwd_uuid", () => {
    expect(getScheduleItemSchema.safeParse({ cwd_uuid: "" }).success).toBe(
      false,
    );
  });
});

describe("getScheduleDetailSchema", () => {
  it("accepts valid cwd_uuid", () => {
    expect(
      getScheduleDetailSchema.safeParse({ cwd_uuid: "wd-abc123" }).success,
    ).toBe(true);
  });

  it("rejects empty cwd_uuid", () => {
    expect(getScheduleDetailSchema.safeParse({ cwd_uuid: "" }).success).toBe(
      false,
    );
  });
});

describe("updateScheduleStatusSchema", () => {
  it("accepts valid cwd_uuid and status", () => {
    expect(
      updateScheduleStatusSchema
        .safeParse({ cwd_uuid: "wd-abc123", status: 1 })
        .success,
    ).toBe(true);
  });

  it("rejects missing status", () => {
    expect(
      updateScheduleStatusSchema.safeParse({ cwd_uuid: "wd-abc123" }).success,
    ).toBe(false);
  });

  it("rejects empty cwd_uuid", () => {
    expect(
      updateScheduleStatusSchema.safeParse({ cwd_uuid: "", status: 1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Barrel re-export verification tests
// ---------------------------------------------------------------------------

describe("listSchedule (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module with session candidateId and pagination defaults", async () => {
    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser,
    );
    mockModuleListScheduleAction.mockResolvedValue([]);

    await listSchedule({});

    expect(mockModuleListScheduleAction).toHaveBeenCalled();
  });

  it("delegates with provided pagination params", async () => {
    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser,
    );
    mockModuleListScheduleAction.mockResolvedValue([]);

    await listSchedule({ page: 3, limit: 10 });

    expect(mockModuleListScheduleAction).toHaveBeenCalled();
  });

  it("includes date filters when provided", async () => {
    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser,
    );
    mockModuleListScheduleAction.mockResolvedValue([]);

    await listSchedule({
      dateFrom: "2026-01-01",
      dateTo: "2026-01-31",
    });

    expect(mockModuleListScheduleAction).toHaveBeenCalled();
  });
});

describe("getScheduleItem (delegation)", () => {
  const CWD_UUID = "wd-abc123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module with cwd_uuid", async () => {
    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser,
    );
    mockModuleGetScheduleItemAction.mockResolvedValue(null);

    await getScheduleItem(CWD_UUID);

    expect(mockModuleGetScheduleItemAction).toHaveBeenCalled();
  });

  it("returns null when module returns null", async () => {
    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser,
    );
    mockModuleGetScheduleItemAction.mockResolvedValue(null);

    const result = await getScheduleItem(CWD_UUID);

    expect(result).toBeNull();
  });

  it("returns schedule item from module", async () => {
    const expected: import("./schemas").ScheduleItem = {
      cwd_uuid: CWD_UUID,
      date: new Date("2026-06-01"),
      start_time: new Date("2026-06-01T09:00:00"),
      end_time: new Date("2026-06-01T17:00:00"),
      total_time: 8,
      status: 0,
      store_name: "Main Store",
      company_name: "Tech Corp",
    };

    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser,
    );
    mockModuleGetScheduleItemAction.mockResolvedValue(expected);

    const result = await getScheduleItem(CWD_UUID);

    expect(result).toEqual(expected);
  });
});

describe("getScheduleDetail (delegation)", () => {
  const CWD_UUID = "wd-abc123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module with cwd_uuid", async () => {
    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser,
    );
    mockModuleGetScheduleDetailAction.mockResolvedValue(null);

    await getScheduleDetail(CWD_UUID);

    expect(mockModuleGetScheduleDetailAction).toHaveBeenCalled();
  });

  it("returns null when module returns null", async () => {
    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser,
    );
    mockModuleGetScheduleDetailAction.mockResolvedValue(null);

    const result = await getScheduleDetail(CWD_UUID);

    expect(result).toBeNull();
  });

  it("returns schedule detail from module", async () => {
    const expected: import("./schemas").ScheduleDetail = {
      cwd_uuid: CWD_UUID,
      date: new Date("2026-06-01"),
      start_time: new Date("2026-06-01T09:00:00"),
      end_time: new Date("2026-06-01T17:00:00"),
      total_time: 8,
      status: 0,
      created_at: new Date(),
      updated_at: new Date(),
      store: {
        store_name: "Main Store",
        company: { company_name: "Tech Corp" },
      },
    };

    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser,
    );
    mockModuleGetScheduleDetailAction.mockResolvedValue(expected);

    const result = await getScheduleDetail(CWD_UUID);

    expect(result).toEqual(expected);
  });
});

describe("updateScheduleStatus (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module with session candidateId and status data", async () => {
    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser,
    );
    mockModuleUpdateScheduleStatusAction.mockResolvedValue({
      cwd_uuid: "wd-1",
      status: 1,
    });

    await updateScheduleStatus({ cwd_uuid: "wd-1", status: 1 });

    expect(mockModuleUpdateScheduleStatusAction).toHaveBeenCalled();
  });

  it("returns status result from module", async () => {
    const expected: import("./schemas").ScheduleStatusResult = {
      cwd_uuid: "wd-1",
      status: 1,
    };

    (requireRoleCapability as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUser,
    );
    mockModuleUpdateScheduleStatusAction.mockResolvedValue(expected);

    const result = await updateScheduleStatus({
      cwd_uuid: "wd-1",
      status: 1,
    });

    expect(result).toEqual(expected);
  });
});
