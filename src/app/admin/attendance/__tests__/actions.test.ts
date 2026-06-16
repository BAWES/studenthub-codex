import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma (for getEmployeeOptions direct query)
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

// Mock delegated attendance actions
vi.mock("@/modules/attendance/actions", () => ({
  listAttendance: vi.fn(),
  createAttendance: vi.fn(),
  getAttendance: vi.fn(),
}));

const {
  listAdminAttendance,
  createAdminAttendance,
  getEmployeeOptions,
  getAdminAttendance,
} = await import("../actions");

// Re-import mock refs
import { listAttendance, createAttendance, getAttendance } from "@/modules/attendance/actions";

describe("admin/attendance actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listAdminAttendance", () => {
    const mockResult = {
      items: [
        {
          attendance_uuid: "att-001",
          employee_uuid: "emp-1",
          date: "2026-06-01",
          clock_in: "09:00",
          clock_out: "17:00",
          total_hours: 8,
          status: 10,
          note: "On time",
          created_at: "2026-06-01T06:00:00Z",
          updated_at: "2026-06-01T06:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    it("lists attendance with default params", async () => {
      vi.mocked(listAttendance).mockResolvedValue(mockResult as any);

      const result = await listAdminAttendance();

      expect(listAttendance).toHaveBeenCalledWith({});
      expect(result).toEqual(mockResult);
    });

    it("lists attendance with custom params", async () => {
      vi.mocked(listAttendance).mockResolvedValue(mockResult as any);
      const params = { employee_uuid: "emp-1", page: 2, limit: 10 };

      const result = await listAdminAttendance(params);

      expect(listAttendance).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });

    it("requires admin.read capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      vi.mocked(listAttendance).mockResolvedValue(mockResult as any);

      await listAdminAttendance();

      expect(requireCapability).toHaveBeenCalledWith("admin.read");
    });
  });

  describe("createAdminAttendance", () => {
    const validData = {
      employee_uuid: "emp-1",
      date: "2026-06-16",
      clock_in: "09:00",
      clock_out: "17:00",
      total_hours: 8,
      status: 10,
      note: "Regular day",
    };

    it("creates an attendance record", async () => {
      vi.mocked(createAttendance).mockResolvedValue({ attendance_uuid: "att-new" });

      const result = await createAdminAttendance(validData);

      expect(createAttendance).toHaveBeenCalledWith(validData);
      expect(result).toEqual({ attendance_uuid: "att-new" });
    });

    it("requires admin.write capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      vi.mocked(createAttendance).mockResolvedValue({ attendance_uuid: "att-new" });

      await createAdminAttendance(validData);

      expect(requireCapability).toHaveBeenCalledWith("admin.write");
    });

    it("revalidates /admin/attendance path", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(createAttendance).mockResolvedValue({ attendance_uuid: "att-new" });

      await createAdminAttendance(validData);

      expect(revalidatePath).toHaveBeenCalledWith("/admin/attendance");
    });

    it("handles delegation failure gracefully", async () => {
      vi.mocked(createAttendance).mockRejectedValue(new Error("Delegation error"));

      await expect(createAdminAttendance(validData)).rejects.toThrow("Delegation error");
    });

    it("creates with minimal required fields", async () => {
      const minimal = { employee_uuid: "emp-1", date: "2026-06-16" };
      vi.mocked(createAttendance).mockResolvedValue({ attendance_uuid: "att-min" });

      const result = await createAdminAttendance(minimal);

      expect(createAttendance).toHaveBeenCalledWith(minimal);
      expect(result).toEqual({ attendance_uuid: "att-min" });
    });
  });

  describe("getEmployeeOptions", () => {
    const mockEmployees = [
      { employee_uuid: "emp-1", employee_name: "Alice" },
      { employee_uuid: "emp-2", employee_name: "Bob" },
    ];

    it("returns mapped employee options", async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue(mockEmployees as any);

      const result = await getEmployeeOptions();

      expect(result).toEqual([
        { uuid: "emp-1", name: "Alice" },
        { uuid: "emp-2", name: "Bob" },
      ]);
    });

    it("requires admin.read capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      vi.mocked(prisma.employee.findMany).mockResolvedValue(mockEmployees as any);

      await getEmployeeOptions();

      expect(requireCapability).toHaveBeenCalledWith("admin.read");
    });

    it("queries non-deleted employees ordered by name", async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue(mockEmployees as any);

      await getEmployeeOptions();

      expect(prisma.employee.findMany).toHaveBeenCalledWith({
        where: { deleted: 0 },
        orderBy: { employee_name: "asc" },
        select: { employee_uuid: true, employee_name: true },
      });
    });

    it("returns empty array when no employees found", async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([]);

      const result = await getEmployeeOptions();

      expect(result).toEqual([]);
    });
  });

  describe("getAdminAttendance", () => {
    const mockAttendanceItem = {
      attendance_uuid: "att-001",
      employee_uuid: "emp-1",
      date: "2026-06-01",
      clock_in: "09:00",
      clock_out: "17:00",
      total_hours: 8,
      status: 10,
      note: "On time",
      created_at: "2026-06-01T06:00:00Z",
      updated_at: "2026-06-01T06:00:00Z",
    };

    it("returns attendance with employee name", async () => {
      vi.mocked(getAttendance).mockResolvedValue(mockAttendanceItem as any);
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({
        employee_uuid: "emp-1",
        employee_name: "Alice",
      } as any);

      const result = await getAdminAttendance("att-001");

      expect(result).toEqual({
        attendance: mockAttendanceItem,
        employee_name: "Alice",
      });
    });

    it("requires admin.read capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      vi.mocked(getAttendance).mockResolvedValue(mockAttendanceItem as any);
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({
        employee_name: "Alice",
      } as any);

      await getAdminAttendance("att-001");

      expect(requireCapability).toHaveBeenCalledWith("admin.read");
    });

    it("returns null employee_name when employee not found", async () => {
      vi.mocked(getAttendance).mockResolvedValue(mockAttendanceItem as any);
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null);

      const result = await getAdminAttendance("att-001");

      expect(result.employee_name).toBeNull();
    });

    it("returns null attendance when record not found", async () => {
      vi.mocked(getAttendance).mockResolvedValue(null);

      const result = await getAdminAttendance("non-existent");

      expect(result).toEqual({ attendance: null, employee_name: null });
    });

    it("returns null employee_name when attendance has no employee_uuid", async () => {
      const noEmpItem = { ...mockAttendanceItem, employee_uuid: null };
      vi.mocked(getAttendance).mockResolvedValue(noEmpItem as any);

      const result = await getAdminAttendance("att-001");

      expect(result.attendance?.employee_uuid).toBeNull();
      expect(result.employee_name).toBeNull();
    });

    it("queries employee by uuid when attendance has employee_uuid", async () => {
      vi.mocked(getAttendance).mockResolvedValue(mockAttendanceItem as any);
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({
        employee_name: "Alice",
      } as any);

      await getAdminAttendance("att-001");

      expect(prisma.employee.findUnique).toHaveBeenCalledWith({
        where: { employee_uuid: "emp-1" },
        select: { employee_name: true },
      });
    });
  });
});
