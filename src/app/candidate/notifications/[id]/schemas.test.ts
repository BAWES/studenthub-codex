import { describe, it, expect } from "vitest";
import {
  getNotificationSchema,
  markAsReadSchema,
  deleteNotificationSchema,
  actionResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getNotificationSchema
// ---------------------------------------------------------------------------
describe("getNotificationSchema", () => {
  it("accepts valid input", () => {
    expect(
      getNotificationSchema.safeParse({ notificationUuid: "uuid-12345" }).success,
    ).toBe(true);
  });

  it("rejects missing notificationUuid", () => {
    expect(getNotificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty notificationUuid", () => {
    expect(getNotificationSchema.safeParse({ notificationUuid: "" }).success).toBe(false);
  });

  it("rejects non-string notificationUuid", () => {
    expect(getNotificationSchema.safeParse({ notificationUuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// markAsReadSchema
// ---------------------------------------------------------------------------
describe("markAsReadSchema", () => {
  it("accepts valid input", () => {
    expect(
      markAsReadSchema.safeParse({ notificationUuid: "uuid-12345" }).success,
    ).toBe(true);
  });

  it("rejects missing notificationUuid", () => {
    expect(markAsReadSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty notificationUuid", () => {
    expect(markAsReadSchema.safeParse({ notificationUuid: "" }).success).toBe(false);
  });

  it("rejects non-string notificationUuid", () => {
    expect(markAsReadSchema.safeParse({ notificationUuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteNotificationSchema
// ---------------------------------------------------------------------------
describe("deleteNotificationSchema", () => {
  it("accepts valid input", () => {
    expect(
      deleteNotificationSchema.safeParse({ notificationUuid: "uuid-12345" }).success,
    ).toBe(true);
  });

  it("rejects missing notificationUuid", () => {
    expect(deleteNotificationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty notificationUuid", () => {
    expect(deleteNotificationSchema.safeParse({ notificationUuid: "" }).success).toBe(false);
  });

  it("rejects non-string notificationUuid", () => {
    expect(deleteNotificationSchema.safeParse({ notificationUuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// actionResponseSchema (output)
// ---------------------------------------------------------------------------
describe("actionResponseSchema", () => {
  it("accepts success response", () => {
    expect(actionResponseSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      actionResponseSchema.safeParse({ success: false, error: "Something went wrong" }).success,
    ).toBe(true);
  });

  it("rejects missing success key", () => {
    expect(actionResponseSchema.safeParse({ error: "Oops" }).success).toBe(false);
  });

  it("rejects error without error string", () => {
    expect(actionResponseSchema.safeParse({ success: false }).success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(actionResponseSchema.safeParse({ success: "true" }).success).toBe(false);
  });
});
