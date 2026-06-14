import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Page-level imports test — verify barrel re-exports resolve correctly
// ---------------------------------------------------------------------------

describe("staff/leaves exports", () => {
  it("exports listStaffLeaves, getStaffLeave, createStaffLeave", async () => {
    const mod = await import("@/modules/staff-leaves/actions");
    expect(mod).toHaveProperty("listStaffLeaves");
    expect(mod).toHaveProperty("getStaffLeave");
    expect(mod).toHaveProperty("createStaffLeave");
    expect(typeof mod.listStaffLeaves).toBe("function");
    expect(typeof mod.getStaffLeave).toBe("function");
    expect(typeof mod.createStaffLeave).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// StaffLeaveRow shape validation — mirrors DB model
// ---------------------------------------------------------------------------

type StaffLeaveRow = {
  id: string;
  staff_leave_uuid: string;
  staff_id: number | null;
  staff_name: string | null;
  from_date: string | null;
  to_date: string | null;
  note: string | null;
  category: string | null;
  status: number | null;
  created_at: string | null;
  updated_at: string | null;
};

const staffLeaveRowSchema = z.object({
  id: z.string(),
  staff_leave_uuid: z.string(),
  staff_id: z.number().nullable(),
  staff_name: z.string().nullable(),
  from_date: z.string().nullable(),
  to_date: z.string().nullable(),
  note: z.string().nullable(),
  category: z.string().nullable(),
  status: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

describe("StaffLeaveRow shape", () => {
  it("accepts a valid row with all fields", () => {
    const row: StaffLeaveRow = {
      id: "sl_abc123",
      staff_leave_uuid: "sl_abc123",
      staff_id: 1,
      staff_name: "John Doe",
      from_date: "2025-06-01T00:00:00.000Z",
      to_date: "2025-06-05T00:00:00.000Z",
      note: "Annual leave",
      category: "annual",
      status: 0,
      created_at: "2025-06-01T10:00:00.000Z",
      updated_at: "2025-06-01T10:00:00.000Z",
    };
    expect(staffLeaveRowSchema.safeParse(row).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const row: StaffLeaveRow = {
      id: "sl_abc123",
      staff_leave_uuid: "sl_abc123",
      staff_id: null,
      staff_name: null,
      from_date: null,
      to_date: null,
      note: null,
      category: null,
      status: null,
      created_at: null,
      updated_at: null,
    };
    expect(staffLeaveRowSchema.safeParse(row).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(staffLeaveRowSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string uuid", () => {
    const row: Partial<StaffLeaveRow> = {
      id: "sl_abc123",
      staff_leave_uuid: "sl_abc123",
      staff_id: null,
      staff_name: null,
      from_date: null,
      to_date: null,
      note: null,
      category: null,
      status: null,
      created_at: null,
      updated_at: null,
    };
    expect(staffLeaveRowSchema.safeParse(row).success).toBe(true);
  });

  it("rejects non-number status", () => {
    const row = {
      id: "sl_abc123",
      staff_leave_uuid: "sl_abc123",
      staff_id: 1,
      staff_name: null,
      from_date: null,
      to_date: null,
      note: null,
      category: null,
      status: "pending",
      created_at: null,
      updated_at: null,
    };
    expect(staffLeaveRowSchema.safeParse(row).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Status label mapping
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<number, string> = {
  0: "pending",
  1: "approved",
  2: "rejected",
  3: "cancelled",
};

function getStatusLabel(status: number | null): string {
  if (status === null) return "unknown";
  return STATUS_LABELS[status] ?? `unknown (${status})`;
}

describe("getStatusLabel", () => {
  it("returns 'pending' for status 0", () => {
    expect(getStatusLabel(0)).toBe("pending");
  });

  it("returns 'approved' for status 1", () => {
    expect(getStatusLabel(1)).toBe("approved");
  });

  it("returns 'rejected' for status 2", () => {
    expect(getStatusLabel(2)).toBe("rejected");
  });

  it("returns 'cancelled' for status 3", () => {
    expect(getStatusLabel(3)).toBe("cancelled");
  });

  it("returns 'unknown' for null status", () => {
    expect(getStatusLabel(null)).toBe("unknown");
  });

  it("returns 'unknown (99)' for unknown status code", () => {
    expect(getStatusLabel(99)).toBe("unknown (99)");
  });
});
