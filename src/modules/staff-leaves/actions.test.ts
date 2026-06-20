import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: staff_leave schema validation
// ---------------------------------------------------------------------------

const listStaffLeavesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  staffId: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().optional(),
});

const getStaffLeaveSchema = z.object({
  leaveUuid: z.string().min(1, "Leave UUID is required"),
});

const createStaffLeaveSchema = z.object({
  staffId: z.coerce.number().int().positive().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  note: z.string().optional(),
  category: z.string().optional(),
  status: z.coerce.number().int().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StaffLeaveListItem = {
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

type ListStaffLeavesResult = {
  leaves: StaffLeaveListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CreateStaffLeaveResult = {
  staff_leave_uuid: string;
};

describe("listStaffLeavesSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listStaffLeavesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts staffId filter", () => {
    const result = listStaffLeavesSchema.safeParse({ staffId: 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(5);
    }
  });

  it("accepts status filter", () => {
    const result = listStaffLeavesSchema.safeParse({ status: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });

  it("rejects limit over 100", () => {
    const result = listStaffLeavesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listStaffLeavesSchema.safeParse({ page: -5 });
    expect(result.success).toBe(false);
  });

  it("coerces string values", () => {
    const result = listStaffLeavesSchema.safeParse({
      page: "2",
      limit: "10",
      staffId: "3",
      status: "0",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.staffId).toBe(3);
    }
  });
});

describe("getStaffLeaveSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getStaffLeaveSchema.safeParse({ leaveUuid: "sl_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getStaffLeaveSchema.safeParse({ leaveUuid: "" });
    expect(result.success).toBe(false);
  });
});

describe("StaffLeaveListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: StaffLeaveListItem = {
      staff_leave_uuid: "sl_abc123",
      staff_id: 1,
      staff_name: "John Doe",
      from_date: "2025-06-01",
      to_date: "2025-06-05",
      note: "Annual leave",
      category: "annual",
      status: 0,
      created_at: "2025-06-01T10:00:00.000Z",
      updated_at: "2025-06-01T10:00:00.000Z",
    };
    expect(mock.staff_leave_uuid).toBe("sl_abc123");
    expect(mock.staff_id).toBe(1);
    expect(mock.note).toBe("Annual leave");
    expect(mock.status).toBe(0);
  });
});

describe("ListStaffLeavesResult shape", () => {
  it("accepts an empty result set", () => {
    const result: ListStaffLeavesResult = {
      leaves: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.leaves).toHaveLength(0);
  });
});

describe("createStaffLeaveSchema", () => {
  it("accepts minimal data (all optional fields)", () => {
    const result = createStaffLeaveSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts staffId only", () => {
    const result = createStaffLeaveSchema.safeParse({ staffId: 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(5);
    }
  });

  it("accepts full leave data", () => {
    const result = createStaffLeaveSchema.safeParse({
      staffId: 1,
      fromDate: "2025-06-01",
      toDate: "2025-06-05",
      note: "Annual leave",
      category: "annual",
      status: 0,
    });
    expect(result.success).toBe(true);
  });

  it("coerces string values", () => {
    const result = createStaffLeaveSchema.safeParse({
      staffId: "3",
      status: "1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(3);
      expect(result.data.status).toBe(1);
    }
  });

  it("rejects negative staffId", () => {
    const result = createStaffLeaveSchema.safeParse({ staffId: -1 });
    expect(result.success).toBe(false);
  });
});

describe("CreateStaffLeaveResult shape", () => {
  it("defines the expected fields", () => {
    const result: CreateStaffLeaveResult = {
      staff_leave_uuid: "sl_new_uuid",
    };
    expect(result.staff_leave_uuid).toBe("sl_new_uuid");
  });
});
