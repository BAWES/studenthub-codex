import { describe, it, expect } from "vitest";
import {
  getNotificationSchema,
  markAsReadSchema,
  deleteNotificationSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/notifications/[id] actions (pure unit — no DB)
// ---------------------------------------------------------------------------

describe("getNotificationSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getNotificationSchema.safeParse({ notificationUuid: "notif_abc-123" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getNotificationSchema.safeParse({ notificationUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getNotificationSchema.safeParse({}).success).toBe(false);
  });
});

describe("markAsReadSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      markAsReadSchema.safeParse({ notificationUuid: "notif_abc-123" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(markAsReadSchema.safeParse({ notificationUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(markAsReadSchema.safeParse({}).success).toBe(false);
  });
});

describe("deleteNotificationSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      deleteNotificationSchema.safeParse({ notificationUuid: "notif_abc-123" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(deleteNotificationSchema.safeParse({ notificationUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(deleteNotificationSchema.safeParse({}).success).toBe(false);
  });
});
