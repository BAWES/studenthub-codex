import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    staff_leave: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const { getStaffLeave } = await import("@/modules/staff-leaves/actions");

// ---------------------------------------------------------------------------
// staff/leaves/[leaveUuid] actions
// ---------------------------------------------------------------------------

describe("staff/leaves/[leaveUuid] actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // getStaffLeave
  // -----------------------------------------------------------------------

  describe("getStaffLeave", () => {
    const sampleLeave = {
      staff_leave_uuid: "sl_abc123",
      staff_id: 42,
      staff_name: "Ahmed Hassan",
      from_date: "2026-06-01T00:00:00.000Z",
      to_date: "2026-06-10T00:00:00.000Z",
      note: "Annual leave",
      category: "annual",
      status: 0,
      created_at: "2026-06-01T10:00:00.000Z",
      updated_at: null,
    };

    it("returns leave detail when found", async () => {
      vi.mocked(prisma.staff_leave.findFirst).mockResolvedValue({
        staff_leave_uuid: "sl_abc123",
        staff_id: 42,
        staff: {
          first_name: "Ahmed",
          last_name: "Hassan",
        },
        from_date: new Date("2026-06-01"),
        to_date: new Date("2026-06-10"),
        note: "Annual leave",
        category: "annual",
        status: 0,
        created_at: new Date("2026-06-01T10:00:00Z"),
        updated_at: null,
      } as any);

      const result = await getStaffLeave("sl_abc123");

      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        staff_leave_uuid: "sl_abc123",
        staff_name: "Ahmed Hassan",
        from_date: "2026-06-01T00:00:00.000Z",
        to_date: "2026-06-10T00:00:00.000Z",
        note: "Annual leave",
        category: "annual",
        status: 0,
      });
      expect(prisma.staff_leave.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { staff_leave_uuid: "sl_abc123" },
        }),
      );
    });

    it("returns null when leave not found", async () => {
      vi.mocked(prisma.staff_leave.findFirst).mockResolvedValue(null);

      const result = await getStaffLeave("sl_nonexistent");

      expect(result).toBeNull();
    });

    it("throws for empty UUID", async () => {
      await expect(getStaffLeave("")).rejects.toThrow(
        "Leave UUID is required",
      );
      expect(prisma.staff_leave.findFirst).not.toHaveBeenCalled();
    });

    it("handles missing staff gracefully", async () => {
      vi.mocked(prisma.staff_leave.findFirst).mockResolvedValue({
        staff_leave_uuid: "sl_no_staff",
        staff_id: null,
        staff: null,
        from_date: null,
        to_date: null,
        note: null,
        category: null,
        status: null,
        created_at: null,
        updated_at: null,
      } as any);

      const result = await getStaffLeave("sl_no_staff");

      expect(result).not.toBeNull();
      expect(result?.staff_name).toBeNull();
      expect(result?.from_date).toBeNull();
      expect(result?.status).toBeNull();
    });

    it("output shape matches staffLeaveListItemSchema", async () => {
      vi.mocked(prisma.staff_leave.findFirst).mockResolvedValue({
        staff_leave_uuid: "sl_schema_test",
        staff_id: 10,
        staff: { first_name: "Test", last_name: "User" },
        from_date: new Date("2026-06-15"),
        to_date: new Date("2026-06-20"),
        note: "Schema check",
        category: "sick",
        status: 1,
        created_at: new Date("2026-06-15T08:00:00Z"),
        updated_at: new Date("2026-06-16T08:00:00Z"),
      } as any);

      const result = await getStaffLeave("sl_schema_test");

      expect(result).toMatchObject({
        staff_leave_uuid: expect.any(String),
        staff_id: expect.any(Number),
        staff_name: expect.any(String),
        from_date: expect.any(String),
        to_date: expect.any(String),
        note: expect.any(String),
        category: expect.any(String),
        status: expect.any(Number),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it("requires staff_leave.read capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      vi.mocked(prisma.staff_leave.findFirst).mockResolvedValue(null);

      await getStaffLeave("sl_check_perm");

      expect(requireCapability).toHaveBeenCalledWith("staff_leave.read");
    });
  });
});
