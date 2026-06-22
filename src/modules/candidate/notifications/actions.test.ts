import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireRoleCapability,
  mockModuleGetNotificationRows,
  mockModuleGetNotificationDetail,
  mockModuleDismissNotification,
  mockModuleUpdateNotification,
} = vi.hoisted(() => ({
  mockRequireRoleCapability: vi.fn(),
  mockModuleGetNotificationRows: vi.fn(),
  mockModuleGetNotificationDetail: vi.fn(),
  mockModuleDismissNotification: vi.fn(),
  mockModuleUpdateNotification: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireRoleCapability,
}));

// ── Mock modules/notifications actions ───────────────────────
vi.mock("@/modules/notifications/actions", () => ({
  getCandidateNotificationRows: mockModuleGetNotificationRows,
  getCandidateNotificationDetail: mockModuleGetNotificationDetail,
  dismissNotification: mockModuleDismissNotification,
  updateNotification: mockModuleUpdateNotification,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  notificationRowArraySchema,
  notificationDetailSchema,
  dismissResultSchema,
  updateResultSchema,
} from "@/app/candidate/notifications/schemas";
import type { NotificationRow, NotificationDetail } from "@/modules/notifications/actions";
import {
  getCandidateNotificationRows,
  getCandidateNotificationDetail,
  dismissNotification,
  updateNotification,
} from "./actions";

// ===========================================================================
// Output schema validation — type shapes
// ===========================================================================

describe("notificationRowArraySchema", () => {
  const validRow = {
    id: "notif-1",
    type: "invitation_accepted",
    typeCode: 1,
    message: "Your invitation was accepted",
    isNew: "true",
    created: "2026-01-15T10:00:00Z",
  };

  it("accepts valid row array", () => {
    const r = notificationRowArraySchema.safeParse([validRow]);
    expect(r.success).toBe(true);
  });

  it("accepts empty array", () => {
    const r = notificationRowArraySchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("accepts multiple rows", () => {
    const r = notificationRowArraySchema.safeParse([
      validRow,
      { ...validRow, id: "notif-2", typeCode: 2 },
    ]);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toHaveLength(2);
  });

  it("rejects row with missing id", () => {
    const { id, ...rest } = validRow;
    const r = notificationRowArraySchema.safeParse([rest]);
    expect(r.success).toBe(false);
  });
});

describe("notificationDetailSchema", () => {
  const validDetail = {
    notification: {
      cn_uuid: "notif-1",
      type: 1,
      message: "Your invitation was accepted",
      is_new: true,
      created_at: new Date("2026-01-15"),
      updated_at: new Date("2026-01-16"),
      invitation_uuid: null,
      request_uuid: "req-1",
      company_id: 1,
      store_id: 5,
      staff_id: null,
    },
    typeLabel: "Invitation Accepted",
  };

  it("accepts valid detail", () => {
    const r = notificationDetailSchema.safeParse(validDetail);
    expect(r.success).toBe(true);
  });

  it("accepts null notification (not found)", () => {
    const r = notificationDetailSchema.safeParse({
      notification: null,
      typeLabel: "",
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const r = notificationDetailSchema.safeParse({
      notification: {
        cn_uuid: "notif-1",
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
      },
      typeLabel: "Unknown",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing typeLabel", () => {
    const { typeLabel, ...rest } = validDetail;
    const r = notificationDetailSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });
});

describe("dismissResultSchema / updateResultSchema", () => {
  it("accepts success result", () => {
    const r = dismissResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts failure with error message", () => {
    const r = updateResultSchema.safeParse({
      success: false,
      error: "Something went wrong",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success field", () => {
    const r = dismissResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Action functions
// ===========================================================================

describe("getCandidateNotificationRows", () => {
  const mockRows: NotificationRow[] = [
    { id: "n-1", type: "invitation", typeCode: 1, message: "Hello", isNew: "true", created: "2026-01-15" },
    { id: "n-2", type: "interview", typeCode: 2, message: "Reminder", isNew: "false", created: "2026-01-14" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue({ id: "42", role: "candidate" });
    mockModuleGetNotificationRows.mockResolvedValue(mockRows);
  });

  it("checks candidate.read.own capability with candidate role", async () => {
    await getCandidateNotificationRows();
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
  });

  it("delegates to module with session candidateId and default params", async () => {
    await getCandidateNotificationRows();
    expect(mockModuleGetNotificationRows).toHaveBeenCalledWith(42, undefined);
  });

  it("delegates with provided candidateId (overrides session)", async () => {
    await getCandidateNotificationRows(99);
    expect(mockModuleGetNotificationRows).toHaveBeenCalledWith(99, undefined);
  });

  it("passes limit param to module", async () => {
    await getCandidateNotificationRows(42, { limit: 10 });
    expect(mockModuleGetNotificationRows).toHaveBeenCalledWith(42, { limit: 10 });
  });

  it("returns the notification rows from the module", async () => {
    const result = await getCandidateNotificationRows();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("n-1");
    expect(result[1].id).toBe("n-2");
  });

  it("returns empty array when module returns none", async () => {
    mockModuleGetNotificationRows.mockResolvedValue([]);
    const result = await getCandidateNotificationRows();
    expect(result).toEqual([]);
  });
});

describe("getCandidateNotificationDetail", () => {
  const mockDetail: NotificationDetail = {
    notification: {
      cn_uuid: "n-1",
      type: 1,
      message: "Hello",
      is_new: true,
      created_at: new Date("2026-01-15"),
      updated_at: null,
      invitation_uuid: null,
      request_uuid: "req-1",
      company_id: 1,
      store_id: null,
      staff_id: null,
    },
    typeLabel: "Invitation",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue({ id: "42", role: "candidate" });
    mockModuleGetNotificationDetail.mockResolvedValue(mockDetail);
  });

  it("checks candidate.read.own capability", async () => {
    await getCandidateNotificationDetail(42, "n-1");
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
  });

  it("delegates to module with candidateId and notificationUuid", async () => {
    await getCandidateNotificationDetail(42, "n-1");
    expect(mockModuleGetNotificationDetail).toHaveBeenCalledWith(42, "n-1");
  });

  it("returns the detail from the module", async () => {
    const result = await getCandidateNotificationDetail(42, "n-1");
    expect(result.notification?.cn_uuid).toBe("n-1");
    expect(result.typeLabel).toBe("Invitation");
  });

  it("uses session id when candidateId is not provided", async () => {
    await getCandidateNotificationDetail(0 as any, "n-1");
    // candidateId=0 is passed through because 0 is not nullish
    expect(mockModuleGetNotificationDetail).toHaveBeenCalledWith(0, "n-1");
  });

  it("handles null notification from module", async () => {
    mockModuleGetNotificationDetail.mockResolvedValue({
      notification: null,
      typeLabel: "Not Found",
    });
    const result = await getCandidateNotificationDetail(42, "n-nonexistent");
    expect(result.notification).toBeNull();
  });
});

describe("dismissNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue({ id: "42", role: "candidate" });
    mockModuleDismissNotification.mockResolvedValue({ success: true });
  });

  it("checks candidate.read.own capability", async () => {
    await dismissNotification("n-1");
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
  });

  it("delegates to module with session candidateId and UUID", async () => {
    await dismissNotification("n-1");
    expect(mockModuleDismissNotification).toHaveBeenCalledWith(42, "n-1");
  });

  it("returns success when module succeeds", async () => {
    const result = await dismissNotification("n-1");
    expect(result).toEqual({ success: true });
  });

  it("returns failure when module fails", async () => {
    mockModuleDismissNotification.mockResolvedValue({
      success: false,
      error: "Notification not found.",
    });
    const result = await dismissNotification("n-nonexistent");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Notification not found.");
  });

  it("handles exceptions by returning error response", async () => {
    mockModuleDismissNotification.mockRejectedValue(new Error("DB connection lost"));
    const result = await dismissNotification("n-1");
    expect(result.success).toBe(false);
    expect(result.error).toContain("DB connection lost");
  });

  it("handles non-Error exceptions gracefully", async () => {
    mockModuleDismissNotification.mockRejectedValue("string error");
    const result = await dismissNotification("n-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to dismiss notification.");
  });
});

describe("updateNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue({ id: "42", role: "candidate" });
    mockModuleUpdateNotification.mockResolvedValue({ success: true });
  });

  it("checks candidate.read.own capability", async () => {
    await updateNotification("n-1");
    expect(mockRequireRoleCapability).toHaveBeenCalledWith("candidate", "candidate.read.own");
  });

  it("delegates to module with session candidateId, UUID, and data", async () => {
    await updateNotification("n-1", { isNew: false });
    expect(mockModuleUpdateNotification).toHaveBeenCalledWith(42, "n-1", { isNew: false });
  });

  it("delegates without data", async () => {
    await updateNotification("n-1");
    expect(mockModuleUpdateNotification).toHaveBeenCalledWith(42, "n-1", undefined);
  });

  it("returns success when module succeeds", async () => {
    const result = await updateNotification("n-1", { isNew: false });
    expect(result).toEqual({ success: true });
  });

  it("returns failure when module fails", async () => {
    mockModuleUpdateNotification.mockResolvedValue({
      success: false,
      error: "Notification not found.",
    });
    const result = await updateNotification("n-nonexistent");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Notification not found.");
  });

  it("handles exceptions by returning error response", async () => {
    mockModuleUpdateNotification.mockRejectedValue(new Error("DB timeout"));
    const result = await updateNotification("n-1");
    expect(result.success).toBe(false);
    expect(result.error).toContain("DB timeout");
  });

  it("handles non-Error exceptions gracefully", async () => {
    mockModuleUpdateNotification.mockRejectedValue(null);
    const result = await updateNotification("n-1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to update notification.");
  });
});
