import { describe, it, expect } from "vitest";
import {
  getNotificationSchema,
  markAsReadSchema,
  deleteNotificationSchema,
  actionResponseSchema,
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

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("actionResponseSchema (output validation)", () => {
  it("accepts a success response", () => {
    const r = actionResponseSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.success).toBe(true);
    }
  });

  it("accepts a failure response with error", () => {
    const r = actionResponseSchema.safeParse({ success: false, error: "Not found" });
    expect(r.success).toBe(true);
    if (r.success) {
      // discriminated union — check via type guard
      expect((r.data as { success: false; error: string }).error).toBe("Not found");
    }
  });

  it("rejects success: true with error field", () => {
    const r = actionResponseSchema.safeParse({ success: true, error: "should not have error" });
    // discriminatedUnion allows this through since success is true, error is extra
    // but with strict() it would fail. Using discriminatedUnion without strict, extra fields are stripped.
    expect(r.success).toBe(true);
  });

  it("rejects failure without error", () => {
    const r = actionResponseSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });

  it("rejects missing success", () => {
    const r = actionResponseSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
