import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const listStaffNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  staffId: z.coerce.number().int().positive().optional(),
  permission: z.string().optional(),
});

const getStaffNotificationSchema = z.object({
  snUuid: z.string().min(1, "Notification UUID is required"),
});

const markNotificationReadSchema = z.object({
  snUuid: z.string().min(1, "Notification UUID is required"),
  read: z
    .union([z.boolean(), z.string().transform((v) => v === "true")])
    .optional()
    .default(true),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StaffNotificationItem = {
  sn_uuid: string;
  staff_id: number | null;
  permission: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ListStaffNotificationsResult = {
  notifications: StaffNotificationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type MarkNotificationReadResult = {
  sn_uuid: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// listStaffNotifications schema tests
// ---------------------------------------------------------------------------

describe("listStaffNotifications input schema", () => {
  it("should accept default values when empty", () => {
    const result = listStaffNotificationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("should coerce string page and limit to numbers", () => {
    const result = listStaffNotificationsSchema.safeParse({
      page: "2",
      limit: "10",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("should reject page below 1", () => {
    const result = listStaffNotificationsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject limit above 100", () => {
    const result = listStaffNotificationsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("should accept optional staffId filter", () => {
    const result = listStaffNotificationsSchema.safeParse({
      staffId: "42",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(42);
    }
  });

  it("should accept optional permission filter", () => {
    const result = listStaffNotificationsSchema.safeParse({
      permission: "staff.request.view",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.permission).toBe("staff.request.view");
    }
  });
});

// ---------------------------------------------------------------------------
// getStaffNotification schema tests
// ---------------------------------------------------------------------------

describe("getStaffNotification input schema", () => {
  it("should accept a valid UUID", () => {
    const result = getStaffNotificationSchema.safeParse({
      snUuid: "some-uuid-here",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty UUID", () => {
    const result = getStaffNotificationSchema.safeParse({ snUuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// markNotificationRead schema tests
// ---------------------------------------------------------------------------

describe("markNotificationRead input schema", () => {
  it("should accept valid input with default read=true", () => {
    const result = markNotificationReadSchema.safeParse({
      snUuid: "notif-uuid-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.read).toBe(true);
    }
  });

  it("should accept explicit read=false", () => {
    const result = markNotificationReadSchema.safeParse({
      snUuid: "notif-uuid-1",
      read: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.read).toBe(false);
    }
  });

  it("should accept string 'true' for read", () => {
    const result = markNotificationReadSchema.safeParse({
      snUuid: "notif-uuid-1",
      read: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.read).toBe(true);
    }
  });

  it("should accept string 'false' for read", () => {
    const result = markNotificationReadSchema.safeParse({
      snUuid: "notif-uuid-1",
      read: "false",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.read).toBe(false);
    }
  });

  it("should reject empty UUID", () => {
    const result = markNotificationReadSchema.safeParse({ snUuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("StaffNotificationItem output schema", () => {
  it("should accept a valid StaffNotificationItem", () => {
    const item = {
      sn_uuid: "notif-uuid-1",
      staff_id: 42,
      permission: "staff.request.view",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
    };

    const schema = z.object({
      sn_uuid: z.string(),
      staff_id: z.number().int().nullable(),
      permission: z.string().nullable(),
      created_at: z.string().nullable(),
      updated_at: z.string().nullable(),
    });

    const result = schema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("should accept nullable fields", () => {
    const item = {
      sn_uuid: "notif-uuid-2",
      staff_id: null,
      permission: null,
      created_at: null,
      updated_at: null,
    };

    const schema = z.object({
      sn_uuid: z.string(),
      staff_id: z.number().int().nullable(),
      permission: z.string().nullable(),
      created_at: z.string().nullable(),
      updated_at: z.string().nullable(),
    });

    const result = schema.safeParse(item);
    expect(result.success).toBe(true);
  });
});

describe("ListStaffNotificationsResult output schema", () => {
  it("should accept a valid paginated result", () => {
    const result = {
      notifications: [
        {
          sn_uuid: "notif-uuid-1",
          staff_id: 42,
          permission: "staff.request.view",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    const schema = z.object({
      notifications: z.array(
        z.object({
          sn_uuid: z.string(),
          staff_id: z.number().int().nullable(),
          permission: z.string().nullable(),
          created_at: z.string().nullable(),
          updated_at: z.string().nullable(),
        }),
      ),
      total: z.number().int().nonnegative(),
      page: z.number().int().positive(),
      limit: z.number().int().min(1).max(100),
      totalPages: z.number().int().nonnegative(),
    });

    const parsed = schema.safeParse(result);
    expect(parsed.success).toBe(true);
  });
});

describe("MarkNotificationReadResult output schema", () => {
  it("should accept a valid result", () => {
    const result = {
      sn_uuid: "notif-uuid-1",
      updated_at: "2026-01-02T00:00:00.000Z",
    };

    const schema = z.object({
      sn_uuid: z.string(),
      updated_at: z.string(),
    });

    const parsed = schema.safeParse(result);
    expect(parsed.success).toBe(true);
  });
});
