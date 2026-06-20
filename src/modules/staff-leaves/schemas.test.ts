import { describe, it, expect } from "vitest";
import {
  staffLeaveListItemSchema,
  listStaffLeavesResultSchema,
  createStaffLeaveResultSchema,
} from "./schemas";

const validItem = () => ({
  staff_leave_uuid: "sl-001",
  staff_id: null,
  staff_name: "Ahmed",
  from_date: "2026-06-15",
  to_date: null,
  note: null,
  category: "Annual Leave",
  status: null,
  created_at: null,
  updated_at: null,
});

// ---------------------------------------------------------------------------
// staffLeaveListItemSchema
// ---------------------------------------------------------------------------

describe("staffLeaveListItemSchema", () => {
  it("accepts a valid item", () => {
    const r = staffLeaveListItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = staffLeaveListItemSchema.safeParse({
      ...validItem(),
      staff_id: null,
      staff_name: null,
      from_date: null,
      to_date: null,
      note: null,
      category: null,
      status: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing staff_leave_uuid", () => {
    const { staff_leave_uuid: _, ...rest } = validItem();
    expect(staffLeaveListItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStaffLeavesResultSchema
// ---------------------------------------------------------------------------

describe("listStaffLeavesResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listStaffLeavesResultSchema.safeParse({
      leaves: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty leaves array", () => {
    expect(
      listStaffLeavesResultSchema.safeParse({ leaves: [], total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createStaffLeaveResultSchema
// ---------------------------------------------------------------------------

describe("createStaffLeaveResultSchema", () => {
  it("accepts a valid result", () => {
    expect(createStaffLeaveResultSchema.safeParse({ staff_leave_uuid: "sl-002" }).success).toBe(true);
  });

  it("rejects missing staff_leave_uuid", () => {
    expect(createStaffLeaveResultSchema.safeParse({}).success).toBe(false);
  });
});
