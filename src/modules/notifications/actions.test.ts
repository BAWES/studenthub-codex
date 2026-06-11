import { describe, it, expect } from "vitest";
import {
  getCandidateNotificationRowsSchema,
  getCandidateNotificationDetailSchema,
  dismissNotificationSchema,
  updateNotificationSchema,
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
