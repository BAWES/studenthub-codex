import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma (for getEmployeeOptions and getAdminAttendance direct queries)
vi.mock("@/lib/prisma", () => ({
  prisma: {
    employee: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

// Mock the shared attendance module that admin delegates to
const mockListAttendance = vi.fn();
const mockCreateAttendance = vi.fn();
const mockGetAttendance = vi.fn();
vi.mock("@/modules/attendance/actions", () => ({
  listAttendance: mockListAttendance,
  createAttendance: mockCreateAttendance,
  getAttendance: mockGetAttendance,
}));

const {
  listAdminAttendance,
  createAdminAttendance,
  getEmployeeOptions,
  getAdminAttendance,
} = await import("../actions");

describe("admin/attendance actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listAdminAttendance", () => {
    it("returns paginated attendance records", async () => {
      const mockResult = {
        items: [
          {
            attendance_uuid: "uuid-1",
            employee_uuid: "emp-1",
            date: "2026-06-16",
            clock_in: "2026-06-16T09:00:00.000Z",
            clock_out: "2026-06-16T17:00:00.000Z",
            total_hours: 8,
            status: 10,
            note: null,
            created_at: "2026-06-16T00:00:00.000Z",
            updated_at: "2026-06-16T00:00:00.000Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      mockListAttendance.mockResolvedValue(mockResult);

      const result = await listAdminAttendance({});

      expect(result).toEqual(mockResult);
      expect(mockListAttendance).toHaveBeenCalledWith({});
    });

    it("passes params through to shared listAttendance", async () => {
      const params = { employee_uuid: "emp-1", page: 2, limit: 10 };
      mockListAttendance.mockResolvedValue({
        items: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      });

      await listAdminAttendance(params);

      expect(mockListAttendance).toHaveBeenCalledWith(params);
    });

    it("requires admin.read capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      mockListAttendance.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await listAdminAttendance({});

      expect(requireCapability).toHaveBeenCalledWith("admin.read");
    });
  });

  describe("createAdminAttendance", () => {
    const validData = {
      employee_uuid: "emp-1",
      date: "2026-06-16",
      clock_in: "2026-06-16T09:00:00.000Z",
      clock_out: "2026-06-16T17:00:00.000Z",
      total_hours: 8,
      status: 10,
      note: "On time",
    };

    it("creates an attendance record via shared module", async () => {
      mockCreateAttendance.mockResolvedValue({
        attendance_uuid: "new-uuid",
      });

      const result = await createAdminAttendance(validData);

      expect(result).toEqual({ attendance_uuid: "new-uuid" });
      expect(mockCreateAttendance).toHaveBeenCalledWith(validData);
    });

    it("revalidates /admin/attendance after creation", async () => {
      const { revalidatePath } = await import("next/cache");
      mockCreateAttendance.mockResolvedValue({
        attendance_uuid: "new-uuid",
      });

      await createAdminAttendance(validData);

      expect(revalidatePath).toHaveBeenCalledWith("/admin/attendance");
    });

    it("requires admin.write capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      mockCreateAttendance.mockResolvedValue({
        attendance_uuid: "new-uuid",
      });

      await createAdminAttendance(validData);

      expect(requireCapability).toHaveBeenCalledWith("admin.write");
    });
  });

  describe("getEmployeeOptions", () => {
    it("returns employee options sorted by name", async () => {
      const mockEmployees = [
        { employee_uuid: "uuid-1", employee_name: "Alice" },
        { employee_uuid: "uuid-2", employee_name: "Bob" },
      ];
      vi.mocked(prisma.employee.findMany).mockResolvedValue(mockEmployees as any);

      const result = await getEmployeeOptions();

      expect(vi.mocked(prisma.employee.findMany)).toHaveBeenCalledWith({
        where: { deleted: 0 },
        orderBy: { employee_name: "asc" },
        select: { employee_uuid: true, employee_name: true },
      });
      expect(result).toEqual([
        { uuid: "uuid-1", name: "Alice" },
        { uuid: "uuid-2", name: "Bob" },
      ]);
    });

    it("returns empty array when no employees", async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([]);

      const result = await getEmployeeOptions();

      expect(result).toEqual([]);
    });

    it("requires admin.read capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      vi.mocked(prisma.employee.findMany).mockResolvedValue([]);

      await getEmployeeOptions();

      expect(requireCapability).toHaveBeenCalledWith("admin.read");
    });
  });

  describe("getAdminAttendance", () => {
    const mockAttendance = {
      attendance_uuid: "att-uuid",
      employee_uuid: "emp-1",
      date: "2026-06-16",
      clock_in: "2026-06-16T09:00:00.000Z",
      clock_out: "2026-06-16T17:00:00.000Z",
      total_hours: 8,
      status: 10,
      note: null,
      created_at: "2026-06-16T00:00:00.000Z",
      updated_at: "2026-06-16T00:00:00.000Z",
    };

    it("returns attendance with employee name", async () => {
      mockGetAttendance.mockResolvedValue(mockAttendance);
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({
        employee_name: "Alice",
      } as any);

      const result = await getAdminAttendance("att-uuid");

      expect(result).toEqual({
        attendance: mockAttendance,
        employee_name: "Alice",
      });
      expect(mockGetAttendance).toHaveBeenCalledWith({ uuid: "att-uuid" });
      expect(vi.mocked(prisma.employee.findUnique)).toHaveBeenCalledWith({
        where: { employee_uuid: "emp-1" },
        select: { employee_name: true },
      });
    });

    it("returns null employee_name when not found", async () => {
      mockGetAttendance.mockResolvedValue(mockAttendance);
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null);

      const result = await getAdminAttendance("att-uuid");

      expect(result).toEqual({
        attendance: mockAttendance,
        employee_name: null,
      });
    });

    it("returns null attendance when shared module returns null", async () => {
      mockGetAttendance.mockResolvedValue(null);

      const result = await getAdminAttendance("att-uuid");

      expect(result).toEqual({
        attendance: null,
        employee_name: null,
      });
    });

    it("requires admin.read capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      mockGetAttendance.mockResolvedValue(null);

      await getAdminAttendance("att-uuid");

      expect(requireCapability).toHaveBeenCalledWith("admin.read");
    });
  });
});
