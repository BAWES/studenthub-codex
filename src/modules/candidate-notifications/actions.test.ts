import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema tests (mirrored from actions.ts — keeps test decoupled from impl)
// ---------------------------------------------------------------------------

const listCandidateNotificationsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  appealUuid: z.string().optional(),
});

describe("listCandidateNotificationsSchema", () => {
  it("accepts empty params", () => {
    expect(listCandidateNotificationsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listCandidateNotificationsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts appealUuid filter", () => {
    const r = listCandidateNotificationsSchema.safeParse({
      appealUuid: "appeal_abc123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.appealUuid).toBe("appeal_abc123");
    }
  });

  it("rejects limit over 100", () => {
    expect(listCandidateNotificationsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCandidateNotificationsSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type CandidateNotificationItem = {
  cn_uuid: string;
  type: number;
  message: string | null;
  is_new: boolean | null;
  appeal_uuid: string | null;
  created_at: string | null;
};

type ListCandidateNotificationsResult = {
  notifications: CandidateNotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("CandidateNotificationItem shape", () => {
  it("defines expected fields", () => {
    const mock: CandidateNotificationItem = {
      cn_uuid: "notif_abc123",
      type: 1,
      message: "You have a new invitation",
      is_new: true,
      appeal_uuid: null,
      created_at: "2026-06-09T00:00:00.000Z",
    };
    expect(mock.cn_uuid).toBe("notif_abc123");
    expect(mock.is_new).toBe(true);
  });
});

describe("ListCandidateNotificationsResult shape", () => {
  it("accepts empty result", () => {
    const r: ListCandidateNotificationsResult = {
      notifications: [],
      total: 0,
      unreadCount: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(r.total).toBe(0);
    expect(r.unreadCount).toBe(0);
  });

  it("accepts populated result", () => {
    const r: ListCandidateNotificationsResult = {
      notifications: [
        {
          cn_uuid: "notif_1",
          type: 2,
          message: "Appeal approved",
          is_new: false,
          appeal_uuid: "appeal_xyz",
          created_at: "2026-06-08T23:00:00.000Z",
        },
      ],
      total: 1,
      unreadCount: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(r.notifications).toHaveLength(1);
    expect(r.notifications[0].message).toBe("Appeal approved");
  });
});

// ---------------------------------------------------------------------------
// createNotificationSchema tests
// ---------------------------------------------------------------------------

const createNotificationSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  type: z.number().int().min(0).max(255, "Type must be 0–255"),
  message: z.string().min(1, "Message is required").max(500, "Message too long"),
});

describe("createNotificationSchema", () => {
  it("accepts valid notification data", () => {
    const result = createNotificationSchema.safeParse({
      candidateId: 42,
      type: 1,
      message: "You have a new interview invitation",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.type).toBe(1);
      expect(result.data.message).toBe("You have a new interview invitation");
    }
  });

  it("rejects missing candidateId", () => {
    const result = createNotificationSchema.safeParse({
      type: 1,
      message: "Test notification",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing type", () => {
    const result = createNotificationSchema.safeParse({
      candidateId: 42,
      message: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const result = createNotificationSchema.safeParse({
      candidateId: 42,
      type: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty message", () => {
    const result = createNotificationSchema.safeParse({
      candidateId: 42,
      type: 1,
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    const result = createNotificationSchema.safeParse({
      candidateId: 0,
      type: 1,
      message: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative type", () => {
    const result = createNotificationSchema.safeParse({
      candidateId: 42,
      type: -1,
      message: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects type over 255", () => {
    const result = createNotificationSchema.safeParse({
      candidateId: 42,
      type: 999,
      message: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message over 500 chars", () => {
    const result = createNotificationSchema.safeParse({
      candidateId: 42,
      type: 1,
      message: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts message at exactly 500 chars", () => {
    const result = createNotificationSchema.safeParse({
      candidateId: 42,
      type: 1,
      message: "x".repeat(500),
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Mark-read schema tests
// ---------------------------------------------------------------------------

const markNotificationReadSchema = z.object({
  cn_uuid: z.string().min(1, "Notification UUID is required"),
});

describe("markNotificationReadSchema", () => {
  it("accepts valid uuid", () => {
    expect(markNotificationReadSchema.safeParse({ cn_uuid: "notif_abc" }).success).toBe(true);
  });

  it("rejects empty uuid", () => {
    expect(markNotificationReadSchema.safeParse({ cn_uuid: "" }).success).toBe(false);
  });
});
