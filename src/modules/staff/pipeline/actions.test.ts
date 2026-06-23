import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPipelineData,
  getPipelineMetrics,
  updatePipelineStageAction,
} from "./actions";
import type { PipelineItem } from "./schemas";
import { stageFromInvitationStatus } from "./stage";

// ---------------------------------------------------------------------------
// getPipelineMetrics tests (pure logic — no DB required)
// NOTE: function is async despite being pure — must await.
// ---------------------------------------------------------------------------

function makeItem(stage: string, overrides: Partial<PipelineItem> = {}): PipelineItem {
  return {
    id: "test-id",
    requestUuid: "req-uuid",
    candidateName: "Test Candidate",
    candidateId: 1,
    positionTitle: "Software Engineer",
    companyName: "Test Company",
    stage: stage as any,
    updatedAt: new Date(),
    priority: "normal",
    invitationStatus: 0,
    ...overrides,
  };
}

describe("getPipelineMetrics", () => {
  it("returns all-zero metrics for empty items", async () => {
    const metrics = await getPipelineMetrics([]);
    expect(metrics.pendingReview).toBe(0);
    expect(metrics.interviewing).toBe(0);
    expect(metrics.offered).toBe(0);
    expect(metrics.hired).toBe(0);
    expect(metrics.rejected).toBe(0);
    expect(metrics.total).toBe(0);
  });

  it("counts items by stage correctly", async () => {
    const items: PipelineItem[] = [
      makeItem("pending_review"),
      makeItem("interviewing"),
      makeItem("offered"),
      makeItem("hired"),
      makeItem("rejected"),
    ];

    const metrics = await getPipelineMetrics(items);
    expect(metrics.pendingReview).toBe(1);
    expect(metrics.interviewing).toBe(1);
    expect(metrics.offered).toBe(1);
    expect(metrics.hired).toBe(1);
    expect(metrics.rejected).toBe(1);
    expect(metrics.total).toBe(5);
  });

  it("returns zero for stages with no items", async () => {
    const items: PipelineItem[] = [
      makeItem("hired"),
      makeItem("rejected"),
    ];

    const metrics = await getPipelineMetrics(items);
    expect(metrics.pendingReview).toBe(0);
    expect(metrics.interviewing).toBe(0);
    expect(metrics.offered).toBe(0);
    expect(metrics.hired).toBe(1);
    expect(metrics.rejected).toBe(1);
    expect(metrics.total).toBe(2);
  });

  it("handles a single item", async () => {
    const items: PipelineItem[] = [makeItem("interviewing")];

    const metrics = await getPipelineMetrics(items);
    expect(metrics.interviewing).toBe(1);
    expect(metrics.total).toBe(1);
    expect(metrics.pendingReview).toBe(0);
  });

  it("handles all items in the same stage", async () => {
    const items: PipelineItem[] = [
      makeItem("pending_review"),
      makeItem("pending_review"),
      makeItem("pending_review"),
    ];

    const metrics = await getPipelineMetrics(items);
    expect(metrics.pendingReview).toBe(3);
    expect(metrics.total).toBe(3);
    expect(metrics.interviewing).toBe(0);
  });

  it("returns flat trends for all stages", async () => {
    const items: PipelineItem[] = [
      makeItem("pending_review"),
      makeItem("hired"),
    ];

    const metrics = await getPipelineMetrics(items);
    const stages = ["pending_review", "interviewing", "offered", "hired", "rejected"] as const;
    for (const stage of stages) {
      expect(metrics.trends[stage]).toEqual({
        direction: "flat",
        label: "0%",
      });
    }
  });
});

// ---------------------------------------------------------------------------
// stageFromInvitationStatus tests (pure mapping — no DB)
// ---------------------------------------------------------------------------

describe("stageFromInvitationStatus", () => {
  it("maps status 0 to pending_review", () => {
    expect(stageFromInvitationStatus(0)).toBe("pending_review");
  });

  it("maps status 1 to interviewing", () => {
    expect(stageFromInvitationStatus(1)).toBe("interviewing");
  });

  it("maps status 2 to offered", () => {
    expect(stageFromInvitationStatus(2)).toBe("offered");
  });

  it("maps status 3 to hired", () => {
    expect(stageFromInvitationStatus(3)).toBe("hired");
  });

  it("maps status 4 to rejected", () => {
    expect(stageFromInvitationStatus(4)).toBe("rejected");
  });

  it("falls back to pending_review for unknown status", () => {
    expect(stageFromInvitationStatus(-1)).toBe("pending_review");
    expect(stageFromInvitationStatus(99)).toBe("pending_review");
  });

  it("falls back to pending_review for null/undefined", () => {
    expect(stageFromInvitationStatus(null as any)).toBe("pending_review");
    expect(stageFromInvitationStatus(undefined as any)).toBe("pending_review");
  });
});

// ---------------------------------------------------------------------------
// Mock Prisma + Session for server action tests
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    invitation: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import type { Mock } from "vitest";

const mockFindMany = prisma.invitation.findMany as Mock;
const mockUpdate = prisma.invitation.update as Mock;
const mockRequireCapability = requireRoleCapability as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getPipelineData (DB fetch — mock findMany)
// ---------------------------------------------------------------------------

describe("getPipelineData", () => {
  it("returns mapped PipelineItem[] from DB data", async () => {
    mockFindMany.mockResolvedValue([
      {
        invitation_uuid: "inv_001",
        invitation_status: 1,
        invitation_updated_at: new Date("2026-06-10"),
        candidate: {
          candidate_id: 100,
          candidate_name: "Ahmed Al-Sabah",
        },
        request: {
          request_uuid: "req_001",
          request_position_title: "Software Engineer",
          company: { company_name: "TechCorp" },
        },
      },
    ]);

    const result = await getPipelineData(42);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { invitation_created_by_staff: 42 },
        orderBy: { invitation_updated_at: "desc" },
        take: 100,
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "inv_001",
      requestUuid: "req_001",
      candidateName: "Ahmed Al-Sabah",
      candidateId: 100,
      positionTitle: "Software Engineer",
      companyName: "TechCorp",
      stage: "interviewing",
      invitationStatus: 1,
    });
  });

  it("handles missing candidate gracefully", async () => {
    mockFindMany.mockResolvedValue([
      {
        invitation_uuid: "inv_002",
        invitation_status: 0,
        invitation_updated_at: new Date(),
        candidate: null,
        request: {
          request_uuid: "req_002",
          request_position_title: null,
          company: null,
        },
      },
    ]);

    const result = await getPipelineData(1);
    expect(result[0].candidateName).toBe("Unknown candidate");
    expect(result[0].candidateId).toBeNull();
    expect(result[0].positionTitle).toBe("Untitled position");
    expect(result[0].companyName).toBe("No company");
  });

  it("returns empty array when no invitations exist", async () => {
    mockFindMany.mockResolvedValue([]);
    const result = await getPipelineData(99);
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// updatePipelineStageAction (server action — mock session + DB)
// ---------------------------------------------------------------------------

describe("updatePipelineStageAction", () => {
  const mockSession = {
    role: "staff",
    id: "42",
    name: "Staff User",
    email: "staff@test.local",
    issuedAt: Date.now(),
  };

  it("updates and returns success for valid input", async () => {
    mockRequireCapability.mockResolvedValue(mockSession);
    mockUpdate.mockResolvedValue({});

    const result = await updatePipelineStageAction({
      invitationUuid: "inv_123",
      stage: "hired",
    });

    expect(result.success).toBe(true);
    expect(result.newStage).toBe("hired");
    expect(result.error).toBeUndefined();
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { invitation_uuid: "inv_123" },
      data: expect.objectContaining({
        invitation_status: 3,
        invitation_updated_by_staff: 42,
      }),
    });
  });

  it("returns error for invalid input schema", async () => {
    const result = await updatePipelineStageAction({
      invitationUuid: "",
      stage: "invalid" as any,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid input");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error when session auth fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    const result = await updatePipelineStageAction({
      invitationUuid: "inv_123",
      stage: "pending_review",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error on DB failure gracefully", async () => {
    mockRequireCapability.mockResolvedValue(mockSession);
    mockUpdate.mockRejectedValue(new Error("DB connection lost"));

    const result = await updatePipelineStageAction({
      invitationUuid: "inv_123",
      stage: "interviewing",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("DB connection lost");
  });
});
