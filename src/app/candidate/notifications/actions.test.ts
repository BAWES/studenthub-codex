import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  getCandidateNotificationRowsSchema,
  getCandidateNotificationDetailSchema,
  updateNotificationSchema,
} from "./schemas";
import { getNotificationTypeLabel } from "@/modules/notifications/utils";

// ---------------------------------------------------------------------------
// Schema tests for candidate/notifications actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("getCandidateNotificationRowsSchema", () => {
  it("accepts empty params (default — limit 80)", () => {
    const r = getCandidateNotificationRowsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(80);
    }
  });

  it("accepts custom limit", () => {
    const r = getCandidateNotificationRowsSchema.safeParse({ limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    expect(getCandidateNotificationRowsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(getCandidateNotificationRowsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("coerces string limit to number", () => {
    const r = getCandidateNotificationRowsSchema.safeParse({ limit: "30" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(30);
    }
  });
});

describe("getCandidateNotificationDetailSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getCandidateNotificationDetailSchema.safeParse({ notificationUuid: "notif_abc-123" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getCandidateNotificationDetailSchema.safeParse({ notificationUuid: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing UUID", () => {
    expect(getCandidateNotificationDetailSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// dismissNotificationSchema
// ---------------------------------------------------------------------------

const dismissNotificationSchema = z.object({
  notificationUuid: z.string().min(1, "Notification UUID is required"),
});

describe("dismissNotificationSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      dismissNotificationSchema.safeParse({ notificationUuid: "notif_abc-123" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(dismissNotificationSchema.safeParse({ notificationUuid: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing UUID", () => {
    expect(dismissNotificationSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateNotificationSchema
// ---------------------------------------------------------------------------

describe("updateNotificationSchema", () => {
  it("accepts a valid UUID with no isNew", () => {
    expect(
      updateNotificationSchema.safeParse({ notificationUuid: "notif_abc-123" }).success,
    ).toBe(true);
  });

  it("accepts a valid UUID with isNew: false", () => {
    expect(
      updateNotificationSchema.safeParse({ notificationUuid: "notif_abc-123", isNew: false }).success,
    ).toBe(true);
  });

  it("accepts a valid UUID with isNew: true", () => {
    expect(
      updateNotificationSchema.safeParse({ notificationUuid: "notif_abc-123", isNew: true }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(updateNotificationSchema.safeParse({ notificationUuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(updateNotificationSchema.safeParse({}).success).toBe(false);
  });
});

describe("getNotificationTypeLabel", () => {
  it('returns "Invitation" for type 0', () => {
    expect(getNotificationTypeLabel(0)).toBe("Invitation");
  });

  it('returns "Assignment" for type 1', () => {
    expect(getNotificationTypeLabel(1)).toBe("Assignment");
  });

  it('returns "Work Session Approved" for type 8', () => {
    expect(getNotificationTypeLabel(8)).toBe("Work Session Approved");
  });

  it('returns "Work Session Rejected" for type 9', () => {
    expect(getNotificationTypeLabel(9)).toBe("Work Session Rejected");
  });

  it('returns "Job Interest Shortlisted" for type 10', () => {
    expect(getNotificationTypeLabel(10)).toBe("Job Interest Shortlisted");
  });

  it('returns "Job Interest Rejected" for type 11', () => {
    expect(getNotificationTypeLabel(11)).toBe("Job Interest Rejected");
  });

  it("returns fallback for unknown type", () => {
    expect(getNotificationTypeLabel(99)).toBe("Unknown (99)");
  });

  it("returns fallback for negative type", () => {
    expect(getNotificationTypeLabel(-1)).toBe("Unknown (-1)");
  });
});
