import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockRevalidatePath, mockFindMany, mockCount, mockFindUnique, mockCreate } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockFindMany: vi.fn(),
    mockCount: vi.fn(),
    mockFindUnique: vi.fn(),
    mockCreate: vi.fn(),
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
    attendance: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  listAttendanceSchema,
  getAttendanceSchema,
  createAttendanceSchema,
  attendanceItemSchema,
  attendanceDetailSchema,
  listAttendanceResultSchema,
  createAttendanceResultSchema,
} from "./schemas";
import type {
  AttendanceItem,
  AttendanceDetail,
  ListAttendanceResult,
  ListAttendanceParams,
  CreateAttendanceParams,
} from "./schemas";
import {
  listAttendance,
  getAttendance,
  createAttendance,
} from "./actions";
import { toItem, buildAttendanceWhere } from "./helpers";
import type { PrismaAttendanceRow } from "./helpers";

// ===========================================================================
// Input schema validation
// ===========================================================================

describe("listAttendanceSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listAttendanceSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts all filters", () => {
    const r = listAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date_from: "2025-01-01",
      date_to: "2025-12-31",
      status: 10,
      page: 2,
      limit: 50,
    });
    expect(r.success).toBe(true);
  });

  it("coerces string values for page and limit", () => {
    const r = listAttendanceSchema.safeParse({
      page: "3",
      limit: "25",
      status: "10",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(25);
      expect(r.data.status).toBe(10);
    }
  });

  it("rejects negative page", () => {
    const r = listAttendanceSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects page of 0", () => {
    const r = listAttendanceSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listAttendanceSchema.safeParse({ limit: 999 });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listAttendanceSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric strings for page", () => {
    const r = listAttendanceSchema.safeParse({ page: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric strings for limit", () => {
    const r = listAttendanceSchema.safeParse({ limit: "xyz" });
    expect(r.success).toBe(false);
  });
});

describe("getAttendanceSchema", () => {
  it("accepts a valid UUID", () => {
    const r = getAttendanceSchema.safeParse({ uuid: "att-uuid-123" });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const r = getAttendanceSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });
});

describe("createAttendanceSchema", () => {
  it("accepts valid input with all fields", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
      clock_in: "09:00",
      clock_out: "17:00",
      total_hours: 8.0,
      status: 10,
      note: "Regular work day",
    });
    expect(r.success).toBe(true);
  });

  it("requires employee_uuid and date", () => {
    const r = createAttendanceSchema.safeParse({});
    expect(r.success).toBe(false);
    if (!r.success) {
      const messages = r.error.issues.map((i) => i.path.join("."));
      expect(messages).toContain("employee_uuid");
      expect(messages).toContain("date");
    }
  });

  it("applies default status of 10", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe(10);
    }
  });

  it("rejects note over 500 chars", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
      note: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });

  it("accepts note of exactly 500 chars", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
      note: "x".repeat(500),
    });
    expect(r.success).toBe(true);
  });

  it("accepts minimal input (employee_uuid + date only)", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total_hours", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
      total_hours: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero total_hours", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
      total_hours: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty employee_uuid", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "",
      date: "2025-01-15",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty date", () => {
    const r = createAttendanceSchema.safeParse({
      employee_uuid: "emp-uuid",
      date: "",
    });
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Output schema validation
// ===========================================================================

describe("attendanceItemSchema", () => {
  it("accepts a valid attendance item", () => {
    const r = attendanceItemSchema.safeParse({
      attendance_uuid: "att-uuid-1",
      employee_uuid: "emp-uuid-1",
      date: "2025-01-15",
      clock_in: "2025-01-15T09:00:00.000Z",
      clock_out: "2025-01-15T17:00:00.000Z",
      total_hours: 8,
      status: 10,
      note: "Regular day",
      created_at: "2025-01-15T09:00:00.000Z",
      updated_at: "2025-01-15T17:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });

  it("accepts item with null fields", () => {
    const r = attendanceItemSchema.safeParse({
      attendance_uuid: "att-uuid-2",
      employee_uuid: null,
      date: "2025-01-16",
      clock_in: null,
      clock_out: null,
      total_hours: null,
      status: 10,
      note: null,
      created_at: "2025-01-16T00:00:00.000Z",
      updated_at: "2025-01-16T00:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = attendanceItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects missing attendance_uuid", () => {
    const r = attendanceItemSchema.safeParse({
      employee_uuid: null,
      date: "2025-01-15",
      clock_in: null,
      clock_out: null,
      total_hours: null,
      status: 10,
      note: null,
      created_at: "2025-01-15T00:00:00.000Z",
      updated_at: "2025-01-15T00:00:00.000Z",
    });
    expect(r.success).toBe(false);
  });
});

describe("attendanceDetailSchema", () => {
  it("accepts a valid attendance item", () => {
    const r = attendanceDetailSchema.safeParse({
      attendance_uuid: "att-uuid-1",
      employee_uuid: "emp-uuid-1",
      date: "2025-01-15",
      clock_in: null,
      clock_out: null,
      total_hours: null,
      status: 10,
      note: null,
      created_at: "2025-01-15T00:00:00.000Z",
      updated_at: "2025-01-15T00:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });

  it("accepts null (not found)", () => {
    const r = attendanceDetailSchema.safeParse(null);
    expect(r.success).toBe(true);
  });
});

describe("listAttendanceResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listAttendanceResultSchema.safeParse({
      items: [
        {
          attendance_uuid: "att-uuid-1",
          employee_uuid: null,
          date: "2025-01-15",
          clock_in: null,
          clock_out: null,
          total_hours: null,
          status: 10,
          note: null,
          created_at: "2025-01-15T00:00:00.000Z",
          updated_at: "2025-01-15T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty result set", () => {
    const r = listAttendanceResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listAttendanceResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listAttendanceResultSchema.safeParse({
      items: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

describe("createAttendanceResultSchema", () => {
  it("accepts a valid result", () => {
    const r = createAttendanceResultSchema.safeParse({
      attendance_uuid: "new-uuid-123",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const r = createAttendanceResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Pure helper function tests (no mocking needed)
// ===========================================================================

const makeMockRow = (overrides: Partial<PrismaAttendanceRow> = {}): PrismaAttendanceRow => ({
  attendance_uuid: "att-uuid-1",
  employee_uuid: "emp-uuid-1",
  date: new Date("2025-01-15"),
  clock_in: new Date("2025-01-15T09:00:00.000Z"),
  clock_out: new Date("2025-01-15T17:00:00.000Z"),
  total_hours: 8,
  status: 10,
  note: "Regular day",
  created_at: new Date("2025-01-15T09:00:00.000Z"),
  updated_at: new Date("2025-01-15T17:00:00.000Z"),
  ...overrides,
});

describe("toItem()", () => {
  it("maps all fields correctly", () => {
    const row = makeMockRow();
    const item = toItem(row);

    expect(item.attendance_uuid).toBe("att-uuid-1");
    expect(item.employee_uuid).toBe("emp-uuid-1");
    expect(item.date).toBe("2025-01-15");
    expect(item.clock_in).toBe("2025-01-15T09:00:00.000Z");
    expect(item.clock_out).toBe("2025-01-15T17:00:00.000Z");
    expect(item.total_hours).toBe(8);
    expect(item.status).toBe(10);
    expect(item.note).toBe("Regular day");
    expect(item.created_at).toBe("2025-01-15T09:00:00.000Z");
    expect(item.updated_at).toBe("2025-01-15T17:00:00.000Z");
  });

  it("handles null employee_uuid", () => {
    const row = makeMockRow({ employee_uuid: null });
    expect(toItem(row).employee_uuid).toBeNull();
  });

  it("handles null clock_in / clock_out", () => {
    const row = makeMockRow({ clock_in: null, clock_out: null });
    const item = toItem(row);
    expect(item.clock_in).toBeNull();
    expect(item.clock_out).toBeNull();
  });

  it("handles null total_hours", () => {
    const row = makeMockRow({ total_hours: null });
    expect(toItem(row).total_hours).toBeNull();
  });

  it("handles string-like total_hours (Prisma Decimal)", () => {
    // Prisma returns Decimal as unknown; toItem calls Number() on it
    const row = makeMockRow({ total_hours: 7.5 });
    expect(toItem(row).total_hours).toBe(7.5);
  });

  it("handles null note", () => {
    const row = makeMockRow({ note: null });
    expect(toItem(row).note).toBeNull();
  });

  it("handles null employee_uuid with no note", () => {
    const row = makeMockRow({ employee_uuid: null, note: null });
    const item = toItem(row);
    expect(item.employee_uuid).toBeNull();
    expect(item.note).toBeNull();
  });
});

describe("buildAttendanceWhere()", () => {
  it("returns empty where when no params", () => {
    const where = buildAttendanceWhere({});
    expect(where).toEqual({});
  });

  it("filters by employee_uuid", () => {
    const where = buildAttendanceWhere({ employee_uuid: "emp-uuid-1" });
    expect(where).toEqual({ employee_uuid: "emp-uuid-1" });
  });

  it("filters by status", () => {
    const where = buildAttendanceWhere({ status: 10 });
    expect(where).toEqual({ status: 10 });
  });

  it("filters by date_from only", () => {
    const where = buildAttendanceWhere({ date_from: "2025-01-01" });
    expect(where).toEqual({
      date: { gte: new Date("2025-01-01") },
    });
  });

  it("filters by date_to only", () => {
    const where = buildAttendanceWhere({ date_to: "2025-12-31" });
    expect(where).toEqual({
      date: { lte: new Date("2025-12-31") },
    });
  });

  it("filters by date range", () => {
    const where = buildAttendanceWhere({
      date_from: "2025-01-01",
      date_to: "2025-12-31",
    });
    expect(where).toEqual({
      date: {
        gte: new Date("2025-01-01"),
        lte: new Date("2025-12-31"),
      },
    });
  });

  it("combines all filters", () => {
    const where = buildAttendanceWhere({
      employee_uuid: "emp-uuid-1",
      date_from: "2025-01-01",
      date_to: "2025-12-31",
      status: 10,
    });
    expect(where).toEqual({
      employee_uuid: "emp-uuid-1",
      status: 10,
      date: {
        gte: new Date("2025-01-01"),
        lte: new Date("2025-12-31"),
      },
    });
  });
});

// ===========================================================================
// Action function tests (with mocked Prisma)
// ===========================================================================

const mockItems = [
  {
    attendance_uuid: "att-uuid-1",
    employee_uuid: "emp-uuid-1",
    date: new Date("2025-01-15"),
    clock_in: new Date("2025-01-15T09:00:00.000Z"),
    clock_out: new Date("2025-01-15T17:00:00.000Z"),
    total_hours: 8,
    status: 10,
    note: "Regular day",
    created_at: new Date("2025-01-15T09:00:00.000Z"),
    updated_at: new Date("2025-01-15T17:00:00.000Z"),
  },
];

describe("listAttendance()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue(mockItems);
    mockCount.mockResolvedValue(1);
  });

  it("requires staff.read capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listAttendance({})).rejects.toThrow("Unauthorized");
    expect(mockRequireCapability).toHaveBeenCalledWith("staff.read");
  });

  it("returns paginated results with defaults", async () => {
    const result = await listAttendance({});

    expect(mockRequireCapability).toHaveBeenCalledWith("staff.read");
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { date: "desc" },
      skip: 0,
      take: 20,
    });
    expect(mockCount).toHaveBeenCalledWith({ where: {} });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].attendance_uuid).toBe("att-uuid-1");
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("passes employee filter to prisma", async () => {
    await listAttendance({ employee_uuid: "emp-uuid-1" });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { employee_uuid: "emp-uuid-1" },
      }),
    );
    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { employee_uuid: "emp-uuid-1" },
      }),
    );
  });

  it("passes date range filter to prisma", async () => {
    await listAttendance({
      date_from: "2025-01-01",
      date_to: "2025-01-31",
    });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          date: {
            gte: new Date("2025-01-01"),
            lte: new Date("2025-01-31"),
          },
        },
      }),
    );
  });

  it("passes status filter to prisma", async () => {
    await listAttendance({ status: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 10 },
      }),
    );
  });

  it("respects custom page and limit", async () => {
    await listAttendance({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20, // (3-1) * 10
        take: 10,
      }),
    );
  });

  it("computes totalPages correctly", async () => {
    mockCount.mockResolvedValue(55);

    const result = await listAttendance({ limit: 20 });

    expect(result.totalPages).toBe(3); // ceil(55/20)
  });

  it("throws on invalid params", async () => {
    await expect(listAttendance({ page: -1 })).rejects.toThrow();
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

describe("getAttendance()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(mockItems[0]);
  });

  it("requires staff.read capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getAttendance({ uuid: "att-uuid-1" })).rejects.toThrow("Unauthorized");
    expect(mockRequireCapability).toHaveBeenCalledWith("staff.read");
  });

  it("returns attendance item by UUID", async () => {
    const result = await getAttendance({ uuid: "att-uuid-1" });

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { attendance_uuid: "att-uuid-1" },
    });
    expect(result).not.toBeNull();
    expect(result!.attendance_uuid).toBe("att-uuid-1");
    expect(result!.date).toBe("2025-01-15");
  });

  it("returns null when not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await getAttendance({ uuid: "nonexistent" });
    expect(result).toBeNull();
  });

  it("throws on empty UUID", async () => {
    await expect(getAttendance({ uuid: "" })).rejects.toThrow();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

describe("createAttendance()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue({
      attendance_uuid: "new-uuid-abc",
      employee_uuid: "emp-uuid-1",
      date: new Date("2025-01-15"),
      clock_in: null,
      clock_out: null,
      total_hours: null,
      status: 10,
      note: null,
      created_at: new Date(),
      updated_at: new Date(),
    });
  });

  it("requires setting.write capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      createAttendance({ employee_uuid: "emp-uuid-1", date: "2025-01-15" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockRequireCapability).toHaveBeenCalledWith("setting.write");
  });

  it("creates an attendance record", async () => {
    const result = await createAttendance({
      employee_uuid: "emp-uuid-1",
      date: "2025-01-15",
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employee_uuid: "emp-uuid-1",
          date: new Date("2025-01-15"),
          status: 10,
        }),
      }),
    );
    expect(result.attendance_uuid).toBe("new-uuid-abc");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/attendance");
  });

  it("passes optional fields to prisma create", async () => {
    await createAttendance({
      employee_uuid: "emp-uuid-1",
      date: "2025-01-15",
      clock_in: "09:00",
      clock_out: "17:00",
      total_hours: 8,
      status: 20,
      note: "Overtime",
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employee_uuid: "emp-uuid-1",
          clock_in: new Date("09:00"),
          clock_out: new Date("17:00"),
          total_hours: 8,
          status: 20,
          note: "Overtime",
        }),
      }),
    );
  });

  it("throws on invalid data", async () => {
    await expect(
      createAttendance({ employee_uuid: "", date: "" }),
    ).rejects.toThrow();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Type-shape checks (compile-time type assertions)
// ===========================================================================

describe("AttendanceItem shape", () => {
  it("has required fields", () => {
    const item: AttendanceItem = {
      attendance_uuid: "uuid",
      employee_uuid: null,
      date: "2025-01-15",
      clock_in: null,
      clock_out: null,
      total_hours: null,
      status: 10,
      note: null,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
    };
    expect(item.attendance_uuid).toBe("uuid");
  });
});

describe("ListAttendanceResult shape", () => {
  it("has items array and pagination", () => {
    const result: ListAttendanceResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.items).toEqual([]);
  });
});

describe("ListAttendanceParams shape", () => {
  it("accepts empty object", () => {
    const params: ListAttendanceParams = {};
    expect(params).toEqual({});
  });

  it("accepts partial filters", () => {
    const params: ListAttendanceParams = { employee_uuid: "emp-1" };
    expect(params.employee_uuid).toBe("emp-1");
  });
});

describe("CreateAttendanceParams shape", () => {
  it("accepts valid input values", () => {
    const input: CreateAttendanceParams = {
      employee_uuid: "emp-uuid",
      date: "2025-01-15",
    };
    expect(input.employee_uuid).toBe("emp-uuid");
  });
});

describe("AttendanceDetail shape", () => {
  it("accepts null (not found)", () => {
    const detail: AttendanceDetail = null;
    expect(detail).toBeNull();
  });

  it("accepts a valid item", () => {
    const detail: AttendanceDetail = {
      attendance_uuid: "uuid",
      employee_uuid: null,
      date: "2025-01-15",
      clock_in: null,
      clock_out: null,
      total_hours: null,
      status: 10,
      note: null,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
    };
    expect(detail!.attendance_uuid).toBe("uuid");
  });
});
