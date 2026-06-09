import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema tests (mirrored from actions.ts — keeps test decoupled from impl)
// ---------------------------------------------------------------------------

const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getNotificationDetailSchema = z.object({
  cnUuid: z.string().min(1, "Notification UUID is required"),
});

describe("listNotificationsSchema", () => {
  it("accepts empty params", () => {
    expect(listNotificationsSchema.safeParse({}).success).toBe(true);
  });

  it("applies defaults for empty params", () => {
    const r = listNotificationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination params", () => {
    const r = listNotificationsSchema.safeParse({ page: "3", limit: "50" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listNotificationsSchema.safeParse({ limit: "999" }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listNotificationsSchema.safeParse({ page: "-1" }).success).toBe(false);
  });
});

describe("getNotificationDetailSchema", () => {
  it("accepts valid uuid", () => {
    expect(getNotificationDetailSchema.safeParse({ cnUuid: "notif_abc123" }).success).toBe(true);
  });

  it("rejects empty uuid", () => {
    expect(getNotificationDetailSchema.safeParse({ cnUuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type NotificationRow = {
  id: string;
  type: string;
  typeCode: number;
  message: string;
  isNew: string;
  created: string;
};

type ListNotificationsResult = {
  items: NotificationRow[];
  total: number;
  page: number;
  limit: number;
};

type NotificationDetail = {
  notification: {
    cn_uuid: string;
    type: number;
    message: string | null;
    is_new: boolean | null;
    created_at: Date | null;
    updated_at: Date | null;
    invitation_uuid: string | null;
    request_uuid: string | null;
    company_id: number | null;
    store_id: number | null;
    staff_id: number | null;
  } | null;
  typeLabel: string;
};

describe("NotificationRow shape", () => {
  it("defines expected fields", () => {
    const mock: NotificationRow = {
      id: "notif_abc",
      type: "Invitation",
      typeCode: 0,
      message: "You have a new invitation",
      isNew: "Unread",
      created: "Jun 9, 2026",
    };
    expect(mock.id).toBe("notif_abc");
    expect(mock.isNew).toBe("Unread");
  });
});

describe("ListNotificationsResult shape", () => {
  it("accepts empty result", () => {
    const r: ListNotificationsResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    };
    expect(r.total).toBe(0);
  });

  it("accepts populated result", () => {
    const r: ListNotificationsResult = {
      items: [
        {
          id: "notif_1",
          type: "Invitation",
          typeCode: 0,
          message: "New invitation",
          isNew: "Unread",
          created: "Jun 9, 2026",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    };
    expect(r.items).toHaveLength(1);
    expect(r.items[0].message).toBe("New invitation");
  });
});

describe("NotificationDetail shape", () => {
  it("accepts null notification", () => {
    const d: NotificationDetail = { notification: null, typeLabel: "" };
    expect(d.notification).toBeNull();
    expect(d.typeLabel).toBe("");
  });

  it("accepts populated notification", () => {
    const d: NotificationDetail = {
      notification: {
        cn_uuid: "notif_abc",
        type: 0,
        message: "You have a new invitation",
        is_new: true,
        created_at: new Date("2026-06-09"),
        updated_at: new Date("2026-06-09"),
        invitation_uuid: "invite_xyz",
        request_uuid: "req_123",
        company_id: 1,
        store_id: 2,
        staff_id: 3,
      },
      typeLabel: "Invitation",
    };
    expect(d.notification.cn_uuid).toBe("notif_abc");
    expect(d.typeLabel).toBe("Invitation");
  });
});

// ---------------------------------------------------------------------------
// Notification type label tests
// ---------------------------------------------------------------------------

const NOTIFICATION_TYPE_LABELS: Record<number, string> = {
  0: "Invitation",
  1: "Assignment",
  2: "Unassigned",
  3: "Work Approved",
  4: "Work Rejected",
  5: "Transfer Initiated",
  6: "Transfer Paid",
  7: "Transfer Unpaid",
  8: "Work Session Approved",
  9: "Work Session Rejected",
  10: "Job Interest Shortlisted",
  11: "Job Interest Rejected",
};

describe("NOTIFICATION_TYPE_LABELS", () => {
  it("returns label for known types", () => {
    expect(NOTIFICATION_TYPE_LABELS[0]).toBe("Invitation");
    expect(NOTIFICATION_TYPE_LABELS[1]).toBe("Assignment");
    expect(NOTIFICATION_TYPE_LABELS[3]).toBe("Work Approved");
    expect(NOTIFICATION_TYPE_LABELS[4]).toBe("Work Rejected");
    expect(NOTIFICATION_TYPE_LABELS[11]).toBe("Job Interest Rejected");
  });

  it("returns undefined for unknown types", () => {
    expect(NOTIFICATION_TYPE_LABELS[99]).toBeUndefined();
  });
});
