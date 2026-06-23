import { describe, it, expect } from "vitest";
import {
  listCandidateNotificationsSchema,
  getCandidateNotificationSchema,
  createNotificationSchema,
  candidateNotificationItemSchema,
  listCandidateNotificationsResultSchema,
  createNotificationResultSchema,
  markNotificationReadResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input: listCandidateNotificationsSchema
// ---------------------------------------------------------------------------

describe("listCandidateNotificationsSchema (input)", () => {
  it("accepts empty params (defaults applied)", () => {
    const r = listCandidateNotificationsSchema.safeParse({});
    expect(r.success).toBe(true);
    expect(r.data).toEqual({ page: 1, limit: 20 });
  });

  it("accepts valid page and limit", () => {
    const r = listCandidateNotificationsSchema.safeParse({
      page: 2,
      limit: 50,
    });
    expect(r.success).toBe(true);
  });

  it("accepts appealUuid", () => {
    const r = listCandidateNotificationsSchema.safeParse({
      appealUuid: "abc-123",
    });
    expect(r.success).toBe(true);
    expect(r.data?.appealUuid).toBe("abc-123");
  });

  it("rejects negative page", () => {
    const r = listCandidateNotificationsSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listCandidateNotificationsSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listCandidateNotificationsSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listCandidateNotificationsSchema.safeParse({ limit: 101 });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const r = listCandidateNotificationsSchema.safeParse({ page: "abc" });
    expect(r.success).toBe(false);
  });

  it("accepts string-coerced numeric page", () => {
    const r = listCandidateNotificationsSchema.safeParse({ page: "3" });
    expect(r.success).toBe(true);
    expect(r.data?.page).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Input: getCandidateNotificationSchema
// ---------------------------------------------------------------------------

describe("getCandidateNotificationSchema (input)", () => {
  it("accepts a valid cnUuid", () => {
    const r = getCandidateNotificationSchema.safeParse({
      cnUuid: "abc-123-def",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty cnUuid", () => {
    const r = getCandidateNotificationSchema.safeParse({ cnUuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing cnUuid", () => {
    const r = getCandidateNotificationSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for cnUuid", () => {
    const r = getCandidateNotificationSchema.safeParse({ cnUuid: 123 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input: createNotificationSchema
// ---------------------------------------------------------------------------

describe("createNotificationSchema (input)", () => {
  const valid = {
    candidateId: 42,
    type: 1,
    message: "You have a new notification",
  };

  it("accepts valid input", () => {
    const r = createNotificationSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    const { candidateId: _, ...rest } = valid;
    const r = createNotificationSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = valid;
    const r = createNotificationSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing message", () => {
    const { message: _, ...rest } = valid;
    const r = createNotificationSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects non-positive candidateId", () => {
    const r = createNotificationSchema.safeParse({
      ...valid,
      candidateId: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects candidateId as string", () => {
    const r = createNotificationSchema.safeParse({
      ...valid,
      candidateId: "abc",
    });
    expect(r.success).toBe(false);
  });

  it("rejects type out of range (negative)", () => {
    const r = createNotificationSchema.safeParse({
      ...valid,
      type: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects type over 255", () => {
    const r = createNotificationSchema.safeParse({
      ...valid,
      type: 256,
    });
    expect(r.success).toBe(false);
  });

  it("rejects type as string", () => {
    const r = createNotificationSchema.safeParse({
      ...valid,
      type: "abc",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty message", () => {
    const r = createNotificationSchema.safeParse({
      ...valid,
      message: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects message over 500 characters", () => {
    const r = createNotificationSchema.safeParse({
      ...valid,
      message: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });

  it("rejects message as number", () => {
    const r = createNotificationSchema.safeParse({
      ...valid,
      message: 123,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output: candidateNotificationItemSchema
// ---------------------------------------------------------------------------

describe("candidateNotificationItemSchema (output)", () => {
  const valid = {
    cn_uuid: "abc-123-def",
    type: 1,
    message: "You have a new notification",
    is_new: true,
    appeal_uuid: "appeal-xyz",
    created_at: "2025-01-01T00:00:00Z",
  };

  it("accepts a full notification item", () => {
    const r = candidateNotificationItemSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("accepts nullable message", () => {
    const r = candidateNotificationItemSchema.safeParse({
      ...valid,
      message: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable is_new", () => {
    const r = candidateNotificationItemSchema.safeParse({
      ...valid,
      is_new: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable appeal_uuid", () => {
    const r = candidateNotificationItemSchema.safeParse({
      ...valid,
      appeal_uuid: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable created_at", () => {
    const r = candidateNotificationItemSchema.safeParse({
      ...valid,
      created_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing cn_uuid", () => {
    const { cn_uuid: _, ...rest } = valid;
    const r = candidateNotificationItemSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = valid;
    const r = candidateNotificationItemSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for type", () => {
    const r = candidateNotificationItemSchema.safeParse({
      ...valid,
      type: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for is_new", () => {
    const r = candidateNotificationItemSchema.safeParse({
      ...valid,
      is_new: "not-a-boolean",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for cn_uuid", () => {
    const r = candidateNotificationItemSchema.safeParse({
      ...valid,
      cn_uuid: 123,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output: listCandidateNotificationsResultSchema
// ---------------------------------------------------------------------------

describe("listCandidateNotificationsResultSchema (output)", () => {
  const valid = {
    notifications: [
      {
        cn_uuid: "abc-123",
        type: 1,
        message: "Hello",
        is_new: true,
        appeal_uuid: null,
        created_at: null,
      },
    ],
    total: 1,
    unreadCount: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a full result", () => {
    const r = listCandidateNotificationsResultSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("accepts empty notifications array", () => {
    const r = listCandidateNotificationsResultSchema.safeParse({
      ...valid,
      notifications: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing notifications", () => {
    const { notifications: _, ...rest } = valid;
    const r = listCandidateNotificationsResultSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    const r = listCandidateNotificationsResultSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    const r = listCandidateNotificationsResultSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = valid;
    const r = listCandidateNotificationsResultSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects negative total", () => {
    const r = listCandidateNotificationsResultSchema.safeParse({
      ...valid,
      total: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-array notifications", () => {
    const r = listCandidateNotificationsResultSchema.safeParse({
      ...valid,
      notifications: "not-an-array",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const r = listCandidateNotificationsResultSchema.safeParse({
      ...valid,
      page: 1.5,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listCandidateNotificationsResultSchema.safeParse({
      ...valid,
      page: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listCandidateNotificationsResultSchema.safeParse({
      ...valid,
      limit: 200,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output: createNotificationResultSchema (discriminated union)
// ---------------------------------------------------------------------------

describe("createNotificationResultSchema (output)", () => {
  it("accepts a success result", () => {
    const r = createNotificationResultSchema.safeParse({
      success: true,
      notificationUuid: "uuid-123",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a failure result", () => {
    const r = createNotificationResultSchema.safeParse({
      success: false,
      error: "Something went wrong",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success discriminant", () => {
    const r = createNotificationResultSchema.safeParse({
      notificationUuid: "uuid-123",
    });
    expect(r.success).toBe(false);
  });

  it("rejects success with missing notificationUuid", () => {
    const r = createNotificationResultSchema.safeParse({
      success: true,
    });
    expect(r.success).toBe(false);
  });

  it("rejects failure with missing error", () => {
    const r = createNotificationResultSchema.safeParse({
      success: false,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    const r = createNotificationResultSchema.safeParse({
      success: 123,
      notificationUuid: "uuid-123",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for notificationUuid", () => {
    const r = createNotificationResultSchema.safeParse({
      success: true,
      notificationUuid: 456,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for error", () => {
    const r = createNotificationResultSchema.safeParse({
      success: false,
      error: 789,
    });
    expect(r.success).toBe(false);
  });

  it("rejects an object with both success and error mixed", () => {
    const r = createNotificationResultSchema.safeParse({
      success: false,
      notificationUuid: "uuid-123",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output: markNotificationReadResultSchema
// ---------------------------------------------------------------------------

describe("markNotificationReadResultSchema (output)", () => {
  it("accepts a successful result", () => {
    const r = markNotificationReadResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts a failure result with error", () => {
    const r = markNotificationReadResultSchema.safeParse({
      success: false,
      error: "Notification not found",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a failure result without error", () => {
    const r = markNotificationReadResultSchema.safeParse({
      success: false,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success", () => {
    const r = markNotificationReadResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    const r = markNotificationReadResultSchema.safeParse({
      success: "yes",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for error", () => {
    const r = markNotificationReadResultSchema.safeParse({
      success: false,
      error: 123,
    });
    expect(r.success).toBe(false);
  });
});
