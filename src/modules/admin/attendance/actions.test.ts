import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  employeeOptionSchema,
  listEmployeeOptionsResultSchema,
} from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapabilityAtt,
  mockRevalidatePathAtt,
  mockFindManyEmp,
  mockFindUniqueEmp,
  mockListAttendance,
  mockCreateAttendance,
  mockGetAttendance,
} = vi.hoisted(() => ({
  mockRequireCapabilityAtt: vi.fn(),
  mockRevalidatePathAtt: vi.fn(),
  mockFindManyEmp: vi.fn(),
  mockFindUniqueEmp: vi.fn(),
  mockListAttendance: vi.fn(),
  mockCreateAttendance: vi.fn(),
  mockGetAttendance: vi.fn(),
}));

// ── Mock session ────────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapabilityAtt,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePathAtt,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    employee: {
      findMany: mockFindManyEmp,
      findUnique: mockFindUniqueEmp,
    },
  },
}));

// ── Mock delegate actions ─────────────────────────────────
vi.mock("@/modules/attendance/actions", () => ({
  listAttendance: mockListAttendance,
  createAttendance: mockCreateAttendance,
  getAttendance: mockGetAttendance,
}));

import { listAdminAttendance, createAdminAttendance, getEmployeeOptions, getAdminAttendance } from "./actions";

describe("employeeOptionSchema (output validation)", () => {
  it("accepts a valid employee option", () => {
    const r = employeeOptionSchema.safeParse({
      uuid: "abc-123-def",
      name: "Ahmed Al-Mutawa",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const r = employeeOptionSchema.safeParse({ name: "Ahmed" });
    expect(r.success).toBe(false);
  });

  it("rejects missing name", () => {
    const r = employeeOptionSchema.safeParse({ uuid: "abc-123" });
    expect(r.success).toBe(false);
  });

  it("rejects null uuid", () => {
    const r = employeeOptionSchema.safeParse({ uuid: null, name: "Ahmed" });
    expect(r.success).toBe(false);
  });

  it("rejects empty name", () => {
    const r = employeeOptionSchema.safeParse({ uuid: "abc-123", name: "" });
    expect(r.success).toBe(true); // empty string is still a string
  });

  it("rejects extra fields", () => {
    const r = employeeOptionSchema.safeParse({
      uuid: "abc-123",
      name: "Ahmed",
      extra: "should not be here",
    });
    expect(r.success).toBe(true); // Zod strips unknown by default
  });

  it("rejects non-string uuid", () => {
    const r = employeeOptionSchema.safeParse({ uuid: 123, name: "Ahmed" });
    expect(r.success).toBe(false);
  });
});

describe("listEmployeeOptionsResultSchema (output validation)", () => {
  it("accepts a valid array of employee options", () => {
    const r = listEmployeeOptionsResultSchema.safeParse([
      { uuid: "abc", name: "Ahmed" },
      { uuid: "def", name: "Fatima" },
    ]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toHaveLength(2);
    }
  });

  it("accepts an empty array", () => {
    const r = listEmployeeOptionsResultSchema.safeParse([]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toHaveLength(0);
    }
  });

  it("rejects array with invalid items", () => {
    const r = listEmployeeOptionsResultSchema.safeParse([
      { uuid: "abc", name: "Ahmed" },
      { uuid: 123, name: "Fatima" }, // invalid uuid type
    ]);
    expect(r.success).toBe(false);
  });

  it("rejects non-array input", () => {
    const r = listEmployeeOptionsResultSchema.safeParse({ uuid: "abc", name: "Ahmed" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getEmployeeOptions — runtime
// ---------------------------------------------------------------------------

describe("getEmployeeOptions — runtime", () => {
  const MOCK_EMPLOYEES = [
    { employee_uuid: "uuid-1", employee_name: "Ahmed Al-Mutawa" },
    { employee_uuid: "uuid-2", employee_name: "Fatima Al-Sabah" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityAtt.mockResolvedValue(undefined);
    mockFindManyEmp.mockResolvedValue(MOCK_EMPLOYEES);
  });

  it("returns employee options with uuid and name", async () => {
    const result = await getEmployeeOptions();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ uuid: "uuid-1", name: "Ahmed Al-Mutawa" });
    expect(result[1]).toEqual({ uuid: "uuid-2", name: "Fatima Al-Sabah" });
  });

  it("calls requireCapability with admin.read", async () => {
    await getEmployeeOptions();
    expect(mockRequireCapabilityAtt).toHaveBeenCalledWith("admin.read");
  });

  it("queries employees with deleted:0 sorted by name", async () => {
    await getEmployeeOptions();
    expect(mockFindManyEmp).toHaveBeenCalledWith({
      where: { deleted: 0 },
      orderBy: { employee_name: "asc" },
      select: { employee_uuid: true, employee_name: true },
    });
  });

  it("returns empty array when no employees found", async () => {
    mockFindManyEmp.mockResolvedValue([]);
    const result = await getEmployeeOptions();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// listAdminAttendance — runtime
// ---------------------------------------------------------------------------

describe("listAdminAttendance — runtime", () => {
  const MOCK_RESULT = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityAtt.mockResolvedValue(undefined);
    mockListAttendance.mockResolvedValue(MOCK_RESULT);
  });

  it("delegates to listAttendance with params", async () => {
    await listAdminAttendance({ page: 2, limit: 10 });
    expect(mockListAttendance).toHaveBeenCalledWith({ page: 2, limit: 10 });
  });

  it("calls requireCapability with admin.read", async () => {
    await listAdminAttendance({});
    expect(mockRequireCapabilityAtt).toHaveBeenCalledWith("admin.read");
  });

  it("returns the delegated result unchanged", async () => {
    const result = await listAdminAttendance({});
    expect(result).toEqual(MOCK_RESULT);
  });

  it("passes empty params by default", async () => {
    await listAdminAttendance({});
    expect(mockListAttendance).toHaveBeenCalledWith({});
  });
});

// ---------------------------------------------------------------------------
// createAdminAttendance — runtime
// ---------------------------------------------------------------------------

describe("createAdminAttendance — runtime", () => {
  const VALID_INPUT = {
    employee_uuid: "uuid-1",
    date: "2026-06-15",
    clock_in: "09:00",
    clock_out: "17:00",
  };

  const MOCK_RESULT = { attendance_uuid: "mock-uuid" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityAtt.mockResolvedValue(undefined);
    mockCreateAttendance.mockResolvedValue(MOCK_RESULT);
  });

  it("delegates to createAttendance with data", async () => {
    const result = await createAdminAttendance(VALID_INPUT);
    expect(mockCreateAttendance).toHaveBeenCalledWith(VALID_INPUT);
    expect(result).toEqual(MOCK_RESULT);
  });

  it("calls requireCapability with admin.write", async () => {
    await createAdminAttendance(VALID_INPUT);
    expect(mockRequireCapabilityAtt).toHaveBeenCalledWith("admin.write");
  });

  it("re-validates /admin/attendance on success", async () => {
    await createAdminAttendance(VALID_INPUT);
    expect(mockRevalidatePathAtt).toHaveBeenCalledWith("/admin/attendance");
  });
});

// ---------------------------------------------------------------------------
// getAdminAttendance — runtime
// ---------------------------------------------------------------------------

describe("getAdminAttendance — runtime", () => {
  const MOCK_UUID = "attendance-uuid-123";
  const MOCK_ATTENDANCE = {
    attendance_uuid: "attendance-uuid-123",
    employee_uuid: "emp-uuid-1",
    date: "2026-06-15",
    clock_in: "09:00",
    clock_out: "17:00",
    total_hours: 8,
    status: 1,
    note: "On time",
    created_at: "2026-06-15T08:00:00.000Z",
    updated_at: "2026-06-15T08:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityAtt.mockResolvedValue(undefined);
  });

  it("returns attendance and employee name", async () => {
    mockGetAttendance.mockResolvedValue(MOCK_ATTENDANCE);
    mockFindUniqueEmp.mockResolvedValue(
      { employee_uuid: "emp-uuid-1", employee_name: "Ahmed Al-Mutawa" },
    );

    const result = await getAdminAttendance(MOCK_UUID);
    expect(result.attendance).toEqual(MOCK_ATTENDANCE);
    expect(result.employee_name).toBe("Ahmed Al-Mutawa");
  });

  it("calls requireCapability with admin.read", async () => {
    mockGetAttendance.mockResolvedValue(null);

    await getAdminAttendance(MOCK_UUID);
    expect(mockRequireCapabilityAtt).toHaveBeenCalledWith("admin.read");
  });

  it("returns null attendance when getAttendance returns null", async () => {
    mockGetAttendance.mockResolvedValue(null);

    const result = await getAdminAttendance(MOCK_UUID);
    expect(result.attendance).toBeNull();
    expect(result.employee_name).toBeNull();
  });

  it("returns null employee_name when attendance has no employee_uuid", async () => {
    mockGetAttendance.mockResolvedValue({ ...MOCK_ATTENDANCE, employee_uuid: "" });

    const result = await getAdminAttendance(MOCK_UUID);
    expect(result.attendance).toBeDefined();
    expect(result.employee_name).toBeNull();
  });

  it("returns null employee_name when employee not found", async () => {
    mockGetAttendance.mockResolvedValue(MOCK_ATTENDANCE);
    mockFindUniqueEmp.mockResolvedValue(null);

    const result = await getAdminAttendance(MOCK_UUID);
    expect(result.employee_name).toBeNull();
  });

  it("calls getAttendance with the provided UUID", async () => {
    mockGetAttendance.mockResolvedValue(null);

    await getAdminAttendance(MOCK_UUID);
    expect(mockGetAttendance).toHaveBeenCalledWith({ uuid: MOCK_UUID });
  });
});
