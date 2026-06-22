import { describe, it, expect } from "vitest";
import {
  notificationRowSchema,
  notificationDetailNotificationSchema,
  notificationDetailSchema,
  notificationActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validNotificationRow = () => ({
  id: "notif-1",
  type: "invitation",
  typeCode: 1,
  message: "You have a new invitation",
  isNew: "Unread",
  created: "2026-06-14T00:00:00.000Z",
});

const validNotificationDetailNotification = () => ({
  cn_uuid: "550e8400-e29b-41d4-a716-446655440000",
  type: 1,
  message: "You have a new invitation",
  is_new: true,
  created_at: new Date("2026-06-14"),
  updated_at: new Date("2026-06-14"),
  invitation_uuid: "660e8400-e29b-41d4-a716-446655440001",
  request_uuid: null,
  company_id: null,
  store_id: null,
  staff_id: null,
});

const validNotificationDetailNotificationMinimal = () => ({
  cn_uuid: "550e8400-e29b-41d4-a716-446655440000",
  type: 1,
  message: null,
  is_new: null,
  created_at: null,
  updated_at: null,
  invitation_uuid: null,
  request_uuid: null,
  company_id: null,
  store_id: null,
  staff_id: null,
});

const validNotificationDetail = () => ({
  notification: validNotificationDetailNotification(),
  typeLabel: "Invitation",
});

// ---------------------------------------------------------------------------
// notificationRowSchema
// ---------------------------------------------------------------------------

describe("notificationRowSchema", () => {
  it("accepts a full notification row", () => {
    const r = notificationRowSchema.safeParse(validNotificationRow());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = notificationRowSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = notificationRowSchema.safeParse({
      ...validNotificationRow(),
      id: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid isNew value", () => {
    const r = notificationRowSchema.safeParse({
      ...validNotificationRow(),
      isNew: "Pending",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string type when provided", () => {
    const r = notificationRowSchema.safeParse({
      ...validNotificationRow(),
      type: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number typeCode when provided", () => {
    const r = notificationRowSchema.safeParse({
      ...validNotificationRow(),
      typeCode: "one",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// notificationDetailNotificationSchema
// ---------------------------------------------------------------------------

describe("notificationDetailNotificationSchema", () => {
  it("accepts a full notification detail item", () => {
    const r = notificationDetailNotificationSchema.safeParse(
      validNotificationDetailNotification()
    );
    expect(r.success).toBe(true);
  });

  it("accepts a minimal item (nullable fields set to null)", () => {
    const r = notificationDetailNotificationSchema.safeParse(
      validNotificationDetailNotificationMinimal()
    );
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = notificationDetailNotificationSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string cn_uuid when provided", () => {
    const r = notificationDetailNotificationSchema.safeParse({
      ...validNotificationDetailNotification(),
      cn_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number type when provided", () => {
    const r = notificationDetailNotificationSchema.safeParse({
      ...validNotificationDetailNotification(),
      type: "one",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// notificationDetailSchema
// ---------------------------------------------------------------------------

describe("notificationDetailSchema", () => {
  it("accepts a full notification detail response", () => {
    const r = notificationDetailSchema.safeParse(validNotificationDetail());
    expect(r.success).toBe(true);
  });

  it("accepts a null notification", () => {
    const r = notificationDetailSchema.safeParse({
      notification: null,
      typeLabel: "Unknown",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = notificationDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string typeLabel when provided", () => {
    const r = notificationDetailSchema.safeParse({
      ...validNotificationDetail(),
      typeLabel: 123,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// notificationActionResultSchema
// ---------------------------------------------------------------------------

describe("notificationActionResultSchema", () => {
  it("accepts a successful result", () => {
    const r = notificationActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts a failed result with error", () => {
    const r = notificationActionResultSchema.safeParse({
      success: false,
      error: "Something went wrong",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success field", () => {
    const r = notificationActionResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    const r = notificationActionResultSchema.safeParse({
      success: "yes",
    });
    expect(r.success).toBe(false);
  });
});
