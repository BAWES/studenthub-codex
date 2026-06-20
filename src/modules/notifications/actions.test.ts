import { describe, it, expect } from "vitest";
import {
  getCandidateNotificationRowsSchema,
  getCandidateNotificationDetailSchema,
  dismissNotificationSchema,
  updateNotificationSchema,
  notificationRowSchema,
  notificationDetailSchema,
  notificationActionResultSchema,
} from "./schemas";

describe("getCandidateNotificationRowsSchema", () => {
  it("accepts empty params (default limit)", () => {
    const r = getCandidateNotificationRowsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.limit).toBe(80);
  });

  it("accepts custom limit", () => {
    const r = getCandidateNotificationRowsSchema.safeParse({ limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.limit).toBe(20);
  });

  it("rejects limit over 100", () => {
    expect(getCandidateNotificationRowsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });
});

describe("getCandidateNotificationDetailSchema", () => {
  it("accepts valid UUID", () => {
    const r = getCandidateNotificationDetailSchema.safeParse({
      notificationUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getCandidateNotificationDetailSchema.safeParse({ notificationUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getCandidateNotificationDetailSchema.safeParse({}).success).toBe(false);
  });
});

describe("dismissNotificationSchema", () => {
  it("accepts valid UUID", () => {
    const r = dismissNotificationSchema.safeParse({
      notificationUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(dismissNotificationSchema.safeParse({ notificationUuid: "" }).success).toBe(false);
  });
});

describe("updateNotificationSchema", () => {
  it("accepts valid update", () => {
    const r = updateNotificationSchema.safeParse({
      notificationUuid: "550e8400-e29b-41d4-a716-446655440000",
      isRead: true,
    });
    expect(r.success).toBe(true);
  });

  it("accepts notificationUuid only", () => {
    const r = updateNotificationSchema.safeParse({
      notificationUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing UUID", () => {
    expect(updateNotificationSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — notificationRowSchema
// ---------------------------------------------------------------------------

describe("notificationRowSchema", () => {
  it("accepts a valid notification row", () => {
    const r = notificationRowSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: "Interview",
      typeCode: 3,
      message: "You have a new interview invitation",
      isNew: "Unread",
      created: "2026-06-12",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a read notification row", () => {
    const r = notificationRowSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: "Message",
      typeCode: 1,
      message: "Hello world",
      isNew: "Read",
      created: "2026-06-11",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = notificationRowSchema.safeParse({
      type: "Interview",
      typeCode: 3,
      message: "",
      isNew: "Read",
      created: "2026-06-12",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid isNew value", () => {
    const r = notificationRowSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: "Interview",
      typeCode: 3,
      message: "",
      isNew: "Unknown",
      created: "2026-06-12",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string typeCode", () => {
    const r = notificationRowSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: "Interview",
      typeCode: "three",
      message: "",
      isNew: "Read",
      created: "2026-06-12",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — notificationDetailSchema
// ---------------------------------------------------------------------------

describe("notificationDetailSchema", () => {
  const validDetail = {
    notification: {
      cn_uuid: "550e8400-e29b-41d4-a716-446655440000",
      type: 3,
      message: "Interview invitation",
      is_new: true,
      created_at: "2026-06-12T10:00:00.000Z",
      updated_at: "2026-06-12T10:30:00.000Z",
      invitation_uuid: null,
      request_uuid: null,
      company_id: 42,
      store_id: null,
      staff_id: null,
    },
    typeLabel: "Interview",
  };

  it("accepts a valid notification detail", () => {
    const r = notificationDetailSchema.safeParse(validDetail);
    expect(r.success).toBe(true);
  });

  it("accepts notification detail with null notification", () => {
    const r = notificationDetailSchema.safeParse({
      notification: null,
      typeLabel: "",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing typeLabel", () => {
    const r = notificationDetailSchema.safeParse({
      notification: validDetail.notification,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing cn_uuid in notification", () => {
    const r = notificationDetailSchema.safeParse({
      notification: {
        type: 3,
        message: null,
        is_new: false,
        created_at: null,
        updated_at: null,
        invitation_uuid: null,
        request_uuid: null,
        company_id: null,
        store_id: null,
        staff_id: null,
      },
      typeLabel: "Test",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — notificationActionResultSchema
// ---------------------------------------------------------------------------

describe("notificationActionResultSchema", () => {
  it("accepts a successful result", () => {
    const r = notificationActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts a failed result with error message", () => {
    const r = notificationActionResultSchema.safeParse({
      success: false,
      error: "Notification not found.",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success field", () => {
    const r = notificationActionResultSchema.safeParse({ error: "Oops" });
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    const r = notificationActionResultSchema.safeParse({
      success: "yes",
    });
    expect(r.success).toBe(false);
  });
});
