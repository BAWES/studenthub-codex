import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { getNotificationTypeLabel } from "@/modules/notifications/utils";

// ---------------------------------------------------------------------------
// Mocks — delegate to module actions (these now contain the real logic)
// ---------------------------------------------------------------------------

const mockModuleGetNotificationRows = vi.fn();
const mockModuleGetNotificationDetail = vi.fn();
const mockModuleDismissNotification = vi.fn();
const mockModuleUpdateNotification = vi.fn();

vi.mock("@/modules/notifications/actions", () => ({
  getCandidateNotificationRows: mockModuleGetNotificationRows,
  getCandidateNotificationDetail: mockModuleGetNotificationDetail,
  dismissNotification: mockModuleDismissNotification,
  updateNotification: mockModuleUpdateNotification,
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

// Must import after mocks are set up
const { requireRoleCapability } = await import("@/modules/auth/session");
const {
  getCandidateNotificationRows,
  getCandidateNotificationDetail,
  dismissNotification,
  updateNotification,
} = await import("./actions");

import {
  getCandidateNotificationRowsSchema,
  getCandidateNotificationDetailSchema,
  updateNotificationSchema,
  notificationRowSchema,
  notificationRowArraySchema,
  notificationDetailSchema,
  dismissResultSchema,
  updateResultSchema,
} from "./schemas";

const mockUser = { id: 1, role: "candidate" };

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

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("notificationRowSchema (output validation)", () => {
  it("accepts a valid notification row", () => {
    const r = notificationRowSchema.safeParse({
      id: "notif_abc",
      type: "Invitation",
      typeCode: 0,
      message: "You have a new invitation",
      isNew: "Unread",
      created: "2026-06-12",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = notificationRowSchema.safeParse({ id: "notif_abc" });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for typeCode", () => {
    const r = notificationRowSchema.safeParse({
      id: "notif_abc",
      type: "Invitation",
      typeCode: "not-a-number",
      message: "Hello",
      isNew: "Unread",
      created: "2026-06-12",
    });
    expect(r.success).toBe(false);
  });
});

describe("notificationRowArraySchema (output validation)", () => {
  it("accepts an array of valid notification rows", () => {
    const r = notificationRowArraySchema.safeParse([
      { id: "n1", type: "Invitation", typeCode: 0, message: "Hello", isNew: "Unread", created: "2026-06-12" },
      { id: "n2", type: "Assignment", typeCode: 1, message: "New assignment", isNew: "Read", created: "2026-06-11" },
    ]);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toHaveLength(2);
    }
  });

  it("accepts an empty array", () => {
    expect(notificationRowArraySchema.safeParse([]).success).toBe(true);
  });

  it("rejects array with invalid items", () => {
    const r = notificationRowArraySchema.safeParse([
      { id: "n1", type: "Invitation", typeCode: 0, message: "Hello", isNew: "Unread", created: "2026-06-12" },
      { id: "n2", type: "Assignment", typeCode: "invalid", message: "Bad", isNew: "Read", created: "2026-06-11" },
    ]);
    expect(r.success).toBe(false);
  });
});

describe("dismissResultSchema (output validation)", () => {
  it("accepts a success result", () => {
    expect(dismissResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts a failure result with error", () => {
    const r = dismissResultSchema.safeParse({ success: false, error: "Not found" });
    expect(r.success).toBe(true);
  });

  it("accepts a failure result without error", () => {
    expect(dismissResultSchema.safeParse({ success: false }).success).toBe(true);
  });

  it("rejects missing success", () => {
    expect(dismissResultSchema.safeParse({}).success).toBe(false);
  });
});

describe("updateResultSchema (output validation)", () => {
  it("accepts a success result", () => {
    expect(updateResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts a failure result with error", () => {
    const r = updateResultSchema.safeParse({ success: false, error: "Not found" });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Action tests — verify delegation to module
// ---------------------------------------------------------------------------

describe("getCandidateNotificationRows (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module with session candidateId", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
    mockModuleGetNotificationRows.mockResolvedValue([
      { id: "n1", type: "Invitation", typeCode: 0, message: "Hello", isNew: "Unread", created: "2026-06-11" },
    ]);

    const result = await getCandidateNotificationRows();

    expect(mockModuleGetNotificationRows).toHaveBeenCalledWith(1, undefined);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("Invitation");
  });

  it("delegates with explicit candidateId and params", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
    mockModuleGetNotificationRows.mockResolvedValue([]);

    await getCandidateNotificationRows(5, { limit: 10 });

    expect(mockModuleGetNotificationRows).toHaveBeenCalledWith(5, { limit: 10 });
  });
});

describe("dismissNotification (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module with session candidateId", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
    mockModuleDismissNotification.mockResolvedValue({ success: true });

    const result = await dismissNotification("notif-abc");

    expect(mockModuleDismissNotification).toHaveBeenCalledWith(1, "notif-abc");
    expect(result.success).toBe(true);
  });

  it("returns error when module returns error", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
    mockModuleDismissNotification.mockResolvedValue({ success: false, error: "Notification not found." });

    const result = await dismissNotification("notif-xyz");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Notification not found.");
  });
});

describe("updateNotification (delegation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to module with session candidateId and isNew", async () => {
    vi.mocked(requireRoleCapability).mockResolvedValue(mockUser as any);
    mockModuleUpdateNotification.mockResolvedValue({ success: true });

    const result = await updateNotification("notif-abc", { isNew: false });

    expect(mockModuleUpdateNotification).toHaveBeenCalledWith(1, "notif-abc", { isNew: false });
    expect(result.success).toBe(true);
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
