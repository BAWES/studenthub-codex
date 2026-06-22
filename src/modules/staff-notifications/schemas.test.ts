import { describe, it, expect } from "vitest";
import {
  staffNotificationItemSchema,
  listStaffNotificationsResultSchema,
  markNotificationReadResultSchema,
} from "./schemas";

const validItem = () => ({
  sn_uuid: "sn-001",
  staff_id: null,
  permission: "admin.read",
  created_at: null,
  updated_at: null,
});

// ---------------------------------------------------------------------------
// staffNotificationItemSchema
// ---------------------------------------------------------------------------

describe("staffNotificationItemSchema", () => {
  it("accepts a valid item", () => {
    const r = staffNotificationItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = staffNotificationItemSchema.safeParse({
      ...validItem(),
      staff_id: null,
      permission: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing sn_uuid", () => {
    const { sn_uuid: _, ...rest } = validItem();
    expect(staffNotificationItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStaffNotificationsResultSchema
// ---------------------------------------------------------------------------

describe("listStaffNotificationsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listStaffNotificationsResultSchema.safeParse({
      notifications: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty notifications array", () => {
    expect(
      listStaffNotificationsResultSchema.safeParse({
        notifications: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// markNotificationReadResultSchema
// ---------------------------------------------------------------------------

describe("markNotificationReadResultSchema", () => {
  it("accepts a valid result", () => {
    expect(
      markNotificationReadResultSchema.safeParse({ sn_uuid: "sn-001", updated_at: "2026-06-14T12:00:00.000Z" }).success,
    ).toBe(true);
  });

  it("rejects missing sn_uuid", () => {
    expect(markNotificationReadResultSchema.safeParse({ updated_at: "2026-06-14T12:00:00.000Z" }).success).toBe(false);
  });

  it("rejects missing updated_at", () => {
    expect(markNotificationReadResultSchema.safeParse({ sn_uuid: "sn-001" }).success).toBe(false);
  });
});
