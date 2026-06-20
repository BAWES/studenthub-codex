import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireRoleCapability,
  mockRevalidatePath,
  mockFindUnique,
  mockNoteCreate,
  mockGetRequestDetail,
  mockParentApproveRequest,
  mockParentRejectRequest,
} = vi.hoisted(() => ({
  mockRequireRoleCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockFindUnique: vi.fn(),
  mockNoteCreate: vi.fn(),
  mockGetRequestDetail: vi.fn(),
  mockParentApproveRequest: vi.fn(),
  mockParentRejectRequest: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireRoleCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    request: {
      findUnique: mockFindUnique,
    },
    note: {
      create: mockNoteCreate,
    },
  },
}));

// ── Mock delegated modules ──────────────────────────────────
vi.mock("@/modules/workspace/request-detail-core", () => ({
  getRequestDetail: mockGetRequestDetail,
}));

vi.mock("@/modules/admin/requests/actions", () => ({
  approveRequest: mockParentApproveRequest,
  rejectRequest: mockParentRejectRequest,
}));

import {
  getRequestDetail,
  approveRequest,
  rejectRequest,
  addComment,
} from "./actions";
import type {
  ApproveRequestInput,
  RejectRequestInput,
  AddCommentInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_UUID = "req_12345678-90ab-cdef-1234-567890abcdef";

// ---------------------------------------------------------------------------
// getRequestDetail — runtime
// ---------------------------------------------------------------------------

describe("getRequestDetail — runtime", () => {
  const MOCK_DETAIL = {
    request: {
      request_uuid: VALID_UUID,
      request_position_title: "Software Engineer",
    },
    applications: [],
    invitations: [],
    interviews: [],
    metrics: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockGetRequestDetail.mockResolvedValue(MOCK_DETAIL);
  });

  it("delegates to workspace core and returns detail", async () => {
    const result = await getRequestDetail(VALID_UUID);
    expect(result.request?.request_uuid).toBe(VALID_UUID);
  });

  it("calls requireRoleCapability with admin and request.read.any", async () => {
    await getRequestDetail(VALID_UUID);
    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "admin",
      "request.read.any",
    );
  });

  it("validates the UUID before delegating", async () => {
    await getRequestDetail(VALID_UUID);
    expect(mockGetRequestDetail).toHaveBeenCalledWith(VALID_UUID);
  });

  it("throws on invalid UUID", async () => {
    await expect(getRequestDetail("")).rejects.toThrow();
  });

  it("throws on missing UUID", async () => {
    await expect(getRequestDetail("")).rejects.toThrow();
  });

  it("passes through the return from workspace core", async () => {
    const result = await getRequestDetail(VALID_UUID);
    expect(result).toEqual(MOCK_DETAIL);
  });
});

// ---------------------------------------------------------------------------
// approveRequest — runtime
// ---------------------------------------------------------------------------

describe("approveRequest [id] — runtime", () => {
  const VALID_INPUT: ApproveRequestInput = {
    requestUuid: VALID_UUID,
    reason: "Approved by admin from detail page",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockParentApproveRequest.mockResolvedValue({
      operation: "success",
      message: "Request approved: Approved by admin from detail page",
    });
  });

  it("delegates to parent approveRequest and returns its result", async () => {
    const result = await approveRequest(VALID_INPUT);
    expect(result.operation).toBe("success");
    expect(result.message).toContain("Approved by admin from detail page");
  });

  it("calls requireRoleCapability with admin and request.write.any", async () => {
    await approveRequest(VALID_INPUT);
    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "admin",
      "request.write.any",
    );
  });

  it("validates input before delegating", async () => {
    await approveRequest(VALID_INPUT);
    expect(mockParentApproveRequest).toHaveBeenCalledWith(VALID_INPUT);
  });

  it("returns error on invalid input", async () => {
    const result = await approveRequest({} as ApproveRequestInput);
    expect(result.operation).toBe("error");
    expect(mockParentApproveRequest).not.toHaveBeenCalled();
  });

  it("returns error on missing reason", async () => {
    const result = await approveRequest({
      requestUuid: VALID_UUID,
      reason: "",
    } as ApproveRequestInput);
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// rejectRequest — runtime
// ---------------------------------------------------------------------------

describe("rejectRequest [id] — runtime", () => {
  const VALID_INPUT: RejectRequestInput = {
    requestUuid: VALID_UUID,
    reason: "Missing documents",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockParentRejectRequest.mockResolvedValue({
      operation: "success",
      message: "Request rejected: Missing documents",
    });
  });

  it("delegates to parent rejectRequest and returns its result", async () => {
    const result = await rejectRequest(VALID_INPUT);
    expect(result.operation).toBe("success");
    expect(result.message).toContain("Missing documents");
  });

  it("calls requireRoleCapability with admin and request.write.any", async () => {
    await rejectRequest(VALID_INPUT);
    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "admin",
      "request.write.any",
    );
  });

  it("validates input before delegating", async () => {
    await rejectRequest(VALID_INPUT);
    expect(mockParentRejectRequest).toHaveBeenCalledWith(VALID_INPUT);
  });

  it("returns error on invalid input", async () => {
    const result = await rejectRequest({} as RejectRequestInput);
    expect(result.operation).toBe("error");
    expect(mockParentRejectRequest).not.toHaveBeenCalled();
  });

  it("returns error on missing reason", async () => {
    const result = await rejectRequest({
      requestUuid: VALID_UUID,
      reason: "",
    } as RejectRequestInput);
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// addComment — runtime
// ---------------------------------------------------------------------------

describe("addComment — runtime", () => {
  const VALID_INPUT: AddCommentInput = {
    requestUuid: VALID_UUID,
    comment: "Following up on this request",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue({ request_uuid: VALID_UUID });
    mockNoteCreate.mockResolvedValue({
      note_uuid: `note_${VALID_UUID}`,
    });
  });

  it("adds comment and returns success", async () => {
    const result = await addComment(VALID_INPUT);
    expect(result.operation).toBe("success");
    expect(result.message).toBe("Comment added successfully");
  });

  it("calls requireRoleCapability with admin and request.write.any", async () => {
    await addComment(VALID_INPUT);
    expect(mockRequireRoleCapability).toHaveBeenCalledWith(
      "admin",
      "request.write.any",
    );
  });

  it("re-validates the request detail path on success", async () => {
    await addComment(VALID_INPUT);
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      `/admin/requests/${VALID_UUID}`,
    );
  });

  it("creates a note record with correct data", async () => {
    await addComment(VALID_INPUT);
    expect(mockNoteCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          request_uuid: VALID_UUID,
          note_type: "Internal Note",
          note_text: "Following up on this request",
          note_created_datetime: expect.any(Date),
          note_updated_datetime: expect.any(Date),
        }),
      }),
    );
  });

  it("verifies request exists before creating comment", async () => {
    await addComment(VALID_INPUT);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { request_uuid: VALID_UUID },
      select: { request_uuid: true },
    });
  });

  it("returns error on invalid input", async () => {
    const result = await addComment({} as AddCommentInput);
    expect(result.operation).toBe("error");
  });

  it("returns error on missing comment", async () => {
    const result = await addComment({
      requestUuid: VALID_UUID,
      comment: "",
    } as AddCommentInput);
    expect(result.operation).toBe("error");
  });

  it("returns error when request not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await addComment(VALID_INPUT);
    expect(result.operation).toBe("error");
    expect(result.message).toContain("not found");
  });

  it("returns error on Prisma exception", async () => {
    mockNoteCreate.mockRejectedValue(new Error("DB error"));
    const result = await addComment(VALID_INPUT);
    expect(result.operation).toBe("error");
  });
});
