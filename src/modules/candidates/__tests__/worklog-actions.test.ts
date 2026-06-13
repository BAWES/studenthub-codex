import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must use vi.hoisted() because vi.mock factories are hoisted
// ---------------------------------------------------------------------------

const { mockUpdate, mockFindFirst, mockCreate, mockTransaction } = vi.hoisted(() => ({
  mockUpdate: vi.fn(),
  mockFindFirst: vi.fn(),
  mockCreate: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate_working_hour: {
      findFirst: mockFindFirst,
      update: mockUpdate,
    },
    candidate_working_hour_appeal: {
      findFirst: mockFindFirst,
      update: mockUpdate,
    },
    candidate_working_hour_appeal_updates: {
      create: mockCreate,
    },
    candidate_work_log_feedback: {
      create: mockCreate,
    },
    candidate_work_history: {
      findFirst: mockFindFirst,
    },
    $transaction: mockTransaction,
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { requireCapability } from "@/modules/auth/session";
import {
  approveWorkLog,
  rejectWorkLog,
  resolveWorkLogAppeal,
  addWorkLogFeedback,
  addAppealUpdateNote,
} from "../worklog-actions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formData(entries: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    fd.set(k, v);
  }
  return fd;
}

const STAFF_SESSION = { id: "42", role: "staff", name: "Staff One", email: "staff@test.com", issuedAt: Date.now() } as const;
const ADMIN_SESSION = { id: "1", role: "admin", name: "Admin", email: "admin@test.com", issuedAt: Date.now() } as const;

const SCOPE_WORK_LOG = {
  candidate_working_hour_uuid: "wl-uuid-1",
  candidate_id: 100,
  store_id: 10,
  store: { company_id: 5 },
};

const SCOPE_APPEAL = {
  appeal_uuid: "appeal-uuid-1",
  candidate_id: 100,
  candidate_working_hour_uuid: "wl-uuid-1",
  status: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireCapability).mockResolvedValue(STAFF_SESSION);
  mockFindFirst.mockImplementation((args: unknown) => {
    const query = args as { where?: Record<string, unknown> };
    // verifyStaffScope — return truthy so scope checks pass
    if (query.where?.staff_id === 42) return { id: 1 };
    // resolveWorkLogScope
    if (query.where?.candidate_working_hour_uuid === "wl-uuid-1") return SCOPE_WORK_LOG;
    // resolveAppealScope
    if (query.where?.appeal_uuid === "appeal-uuid-1") return SCOPE_APPEAL;
    return null;
  });
  mockUpdate.mockResolvedValue({});
  mockCreate.mockResolvedValue({});
  mockTransaction.mockImplementation((ops: unknown[]) => Promise.all(ops));
});

// ---------------------------------------------------------------------------
// approveWorkLog
// ---------------------------------------------------------------------------

describe("approveWorkLog", () => {
  it("approves a work log when staff is in scope", async () => {
    const result = await approveWorkLog({ error: "" }, formData({ workLogUuid: "wl-uuid-1" }));

    expect(result.error).toBe("");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_working_hour_uuid: "wl-uuid-1" },
        data: expect.objectContaining({ status: 1 }),
      }),
    );
  });

  it("returns error for missing workLogUuid", async () => {
    const result = await approveWorkLog({ error: "" }, formData({}));

    expect(result.error).toBe("Missing work log identifier.");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error when work log not found", async () => {
    mockFindFirst.mockReset();
    mockFindFirst.mockResolvedValue(null);

    const result = await approveWorkLog({ error: "" }, formData({ workLogUuid: "nonexistent" }));

    expect(result.error).toBe("Work log not found.");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// rejectWorkLog
// ---------------------------------------------------------------------------

describe("rejectWorkLog", () => {
  it("rejects a work log when staff is in scope", async () => {
    const result = await rejectWorkLog({ error: "" }, formData({ workLogUuid: "wl-uuid-1" }));

    expect(result.error).toBe("");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { candidate_working_hour_uuid: "wl-uuid-1" },
        data: expect.objectContaining({ status: 2 }),
      }),
    );
  });

  it("returns error for missing workLogUuid", async () => {
    const result = await rejectWorkLog({ error: "" }, formData({}));

    expect(result.error).toBe("Missing work log identifier.");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// resolveWorkLogAppeal
// ---------------------------------------------------------------------------

describe("resolveWorkLogAppeal", () => {
  it("approves an appeal with a note", async () => {
    const result = await resolveWorkLogAppeal(
      { error: "" },
      formData({ appealUuid: "appeal-uuid-1", resolution: "approve", note: "Looks good" }),
    );

    expect(result.error).toBe("");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { appeal_uuid: "appeal-uuid-1" },
        data: expect.objectContaining({ status: 1 }),
      }),
    );
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          appeal_uuid: "appeal-uuid-1",
          update: "Appeal approved",
          detail: "Looks good",
          created_by: 42,
        }),
      }),
    );
  });

  it("rejects an appeal without a note (no update created)", async () => {
    const result = await resolveWorkLogAppeal(
      { error: "" },
      formData({ appealUuid: "appeal-uuid-1", resolution: "reject" }),
    );

    expect(result.error).toBe("");
    expect(mockUpdate).toHaveBeenCalled();
    // No appeal note created because note is empty
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns error for invalid resolution", async () => {
    const result = await resolveWorkLogAppeal(
      { error: "" },
      formData({ appealUuid: "appeal-uuid-1", resolution: "maybe" }),
    );

    expect(result.error).toContain("Invalid resolution");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error for missing appealUuid", async () => {
    const result = await resolveWorkLogAppeal(
      { error: "" },
      formData({ resolution: "approve" }),
    );

    expect(result.error).toBe("Missing appeal identifier.");
  });

  it("returns error when appeal not found", async () => {
    const result = await resolveWorkLogAppeal(
      { error: "" },
      formData({ appealUuid: "nonexistent", resolution: "approve" }),
    );

    expect(result.error).toBe("Appeal not found.");
  });
});

// ---------------------------------------------------------------------------
// addWorkLogFeedback
// ---------------------------------------------------------------------------

describe("addWorkLogFeedback", () => {
  it("creates feedback with positive rating", async () => {
    const result = await addWorkLogFeedback(
      { error: "" },
      formData({ workLogUuid: "wl-uuid-1", note: "Great work!", rating: "positive" }),
    );

    expect(result.error).toBe("");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          candidate_working_hour_uuid: "wl-uuid-1",
          note: "Great work!",
          rating: true,
          created_by: "staff:42",
        }),
      }),
    );
  });

  it("creates feedback with negative rating when isPublic is true", async () => {
    const result = await addWorkLogFeedback(
      { error: "" },
      formData({
        workLogUuid: "wl-uuid-1",
        reason: "Late submission",
        rating: "negative",
        isPublic: "true",
      }),
    );

    expect(result.error).toBe("");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reason: "Late submission",
          rating: false,
          is_public: true,
        }),
      }),
    );
  });

  it("returns error for missing workLogUuid", async () => {
    const result = await addWorkLogFeedback(
      { error: "" },
      formData({ note: "Nice" }),
    );

    expect(result.error).toBe("Missing work log identifier.");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns error when both note and reason are missing", async () => {
    const result = await addWorkLogFeedback(
      { error: "" },
      formData({ workLogUuid: "wl-uuid-1" }),
    );

    expect(result.error).toBe("Please provide a note or reason.");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("uses null rating when rating field is missing", async () => {
    const result = await addWorkLogFeedback(
      { error: "" },
      formData({ workLogUuid: "wl-uuid-1", note: "Good effort" }),
    );

    expect(result.error).toBe("");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ rating: null }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// addAppealUpdateNote
// ---------------------------------------------------------------------------

describe("addAppealUpdateNote", () => {
  it("creates an appeal update note", async () => {
    const result = await addAppealUpdateNote(
      { error: "" },
      formData({ appealUuid: "appeal-uuid-1", update: "Reviewed", detail: "All documents verified" }),
    );

    expect(result.error).toBe("");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          appeal_uuid: "appeal-uuid-1",
          update: "Reviewed",
          detail: "All documents verified",
          created_by: 42,
          updated_by: 42,
        }),
      }),
    );
  });

  it("returns error for missing appealUuid", async () => {
    const result = await addAppealUpdateNote(
      { error: "" },
      formData({ update: "Reviewed" }),
    );

    expect(result.error).toBe("Missing appeal identifier.");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns error for empty update string", async () => {
    const result = await addAppealUpdateNote(
      { error: "" },
      formData({ appealUuid: "appeal-uuid-1", update: "" }),
    );

    expect(result.error).toBe("Please provide an update summary.");
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
