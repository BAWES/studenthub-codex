import { describe, it, expect } from "vitest";
import { staffLeaveListItemSchema } from "./schemas";

/**
 * Page migration test for staff/leaves/[leaveUuid].
 *
 * Verifies the data contract between page and action.
 * The staff leave detail page calls getStaffLeave({ leaveUuid }),
 * which returns StaffLeaveListItem | null.
 *
 * staffLeaveListItemSchema is defined in src/modules/staff-leaves/schemas.ts
 * and re-exported from this page's schemas.ts.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("staff leave detail page — data contract", () => {
  it("accepts a full leave record", () => {
    const r = staffLeaveListItemSchema.safeParse({
      staff_leave_uuid: "sl_abc123",
      staff_id: 42,
      staff_name: "John Doe",
      from_date: "2026-06-01T00:00:00.000Z",
      to_date: "2026-06-05T00:00:00.000Z",
      note: "Annual leave",
      category: "annual",
      status: 0,
      created_at: "2026-05-20T10:00:00.000Z",
      updated_at: "2026-05-20T10:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = staffLeaveListItemSchema.safeParse({
      staff_leave_uuid: "sl_def456",
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
    const r = staffLeaveListItemSchema.safeParse({
      staff_id: 1,
      staff_name: null,
      from_date: null,
      to_date: null,
      note: null,
      category: null,
      status: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for status (string instead of number)", () => {
    const r = staffLeaveListItemSchema.safeParse({
      staff_leave_uuid: "sl_ghi789",
      staff_id: 1,
      staff_name: null,
      from_date: null,
      to_date: null,
      note: null,
      category: null,
      status: "pending",
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(false);
  });

  it("rejects null input", () => {
    const r = staffLeaveListItemSchema.safeParse(null);
    expect(r.success).toBe(false);
  });

  it("rejects undefined input", () => {
    const r = staffLeaveListItemSchema.safeParse(undefined);
    expect(r.success).toBe(false);
  });

  it("accepts empty strings for nullable fields", () => {
    const r = staffLeaveListItemSchema.safeParse({
      staff_leave_uuid: "sl_jkl012",
      staff_id: null,
      staff_name: "",
      from_date: "",
      to_date: "",
      note: "",
      category: "",
      status: null,
      created_at: "",
      updated_at: "",
    });
    expect(r.success).toBe(true);
  });
});
