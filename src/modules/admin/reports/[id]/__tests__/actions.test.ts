import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockStaffFindMany,
  mockRequestCount,
  mockNoteCount,
  mockStoryCount,
  mockInvitationCount,
  mockCandidateNoteCount,
  mockInvitationGroupBy,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockStaffFindMany: vi.fn(),
  mockRequestCount: vi.fn(),
  mockNoteCount: vi.fn(),
  mockStoryCount: vi.fn(),
  mockInvitationCount: vi.fn(),
  mockCandidateNoteCount: vi.fn(),
  mockInvitationGroupBy: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    staff: { findMany: mockStaffFindMany },
    request: { count: mockRequestCount },
    note: { count: mockNoteCount },
    story: { count: mockStoryCount },
    invitation: { count: mockInvitationCount, groupBy: mockInvitationGroupBy },
    candidate_note: { count: mockCandidateNoteCount },
  },
}));

import { getReport } from "../actions";
import type { GetReportInput } from "../schemas";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_RECRUITER = {
  staff_id: 1,
  staff_email: "recruiter1@example.com",
  staff_name: "Recruiter One",
};

const MOCK_RECRUITER_2 = {
  staff_id: 2,
  staff_email: "recruiter2@example.com",
  staff_name: "Recruiter Two",
};

// ---------------------------------------------------------------------------
// getReport — runtime
// ---------------------------------------------------------------------------

describe("getReport — runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  describe("recruiter-daily report", () => {
    const RECRUITER_INPUT: GetReportInput = {
      id: "2026-06-15-recruiter-daily",
      type: "recruiter-daily",
    };

    beforeEach(() => {
      mockStaffFindMany.mockResolvedValue([MOCK_RECRUITER]);
      // All count mocks return 0 by default
      mockRequestCount.mockResolvedValue(0);
      mockNoteCount.mockResolvedValue(0);
      mockStoryCount.mockResolvedValue(0);
      mockInvitationCount.mockResolvedValue(0);
      mockCandidateNoteCount.mockResolvedValue(0);
    });

    it("returns a recruiter-daily report with correct structure", async () => {
      const result = await getReport(RECRUITER_INPUT);

      expect(result.id).toBe("2026-06-15-recruiter-daily");
      expect(result.type).toBe("recruiter-daily");
      expect(result.label).toBe("Daily Recruiter Report");
      expect(result.data).toHaveProperty("date", "2026-06-15");
      expect(result.data).toHaveProperty("total", 1);
      expect(result.data.reports).toHaveLength(1);
      expect(result.generatedAt).toBeTruthy();
    });

    it("calls requireCapability with admin.read", async () => {
      await getReport(RECRUITER_INPUT);

      expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    });

    it("fetches recruiters with staff_role=true and non-deleted", async () => {
      await getReport(RECRUITER_INPUT);

      expect(mockStaffFindMany).toHaveBeenCalledWith({
        where: { staff_role: true, deleted: 0 },
        select: { staff_id: true, staff_email: true, staff_name: true },
      });
    });

    it("generates one report row per recruiter", async () => {
      mockStaffFindMany.mockResolvedValue([MOCK_RECRUITER, MOCK_RECRUITER_2]);

      const result = await getReport(RECRUITER_INPUT);

      expect(result.data.reports).toHaveLength(2);
      expect(result.data.total).toBe(2);
    });

    it("counts requests, notes, stories, invitations for each recruiter", async () => {
      mockRequestCount
        .mockResolvedValueOnce(5)  // totalAssigned
        .mockResolvedValueOnce(3); // totalRequests
      mockNoteCount.mockResolvedValue(7);
      mockStoryCount
        .mockResolvedValueOnce(4)  // totalStories
        .mockResolvedValueOnce(2); // totalCompletedStories
      mockInvitationCount
        .mockResolvedValueOnce(6)  // accepted
        .mockResolvedValueOnce(1)  // rejected
        .mockResolvedValueOnce(10); // total
      mockCandidateNoteCount.mockResolvedValue(0);

      const result = await getReport(RECRUITER_INPUT);

      const data = result.data as { date: string; reports: Array<Record<string, unknown>>; total: number };
      const row = data.reports[0];
      expect(row.staffEmail).toBe("recruiter1@example.com");
      expect(row.staffName).toBe("Recruiter One");
      expect(row.totalAssigned).toBe(5);
      expect(row.totalRequests).toBe(3);
      expect(row.totalNotes).toBe(7);
      expect(row.totalStories).toBe(4);
      expect(row.totalCompletedStories).toBe(2);
      expect(row.totalAcceptedInvitations).toBe(6);
      expect(row.totalRejectedInvitations).toBe(1);
      expect(row.totalInvitations).toBe(10);
      expect(row.totalSuggestions).toBe(0);
    });

    it("queries with date range filters", async () => {
      await getReport(RECRUITER_INPUT);

      // First request.count uses request_assigned_at (assigned requests)
      const reqCall0 = mockRequestCount.mock.calls[0];
      expect(reqCall0[0]?.where?.request_assigned_at?.gte).toBeInstanceOf(Date);

      // Second request.count uses request_created_datetime (created requests)
      const reqCall1 = mockRequestCount.mock.calls[1];
      expect(reqCall1[0]?.where?.request_created_datetime?.gte).toBeInstanceOf(Date);

      // invitation.count is called 3 times: accepted(status=1), rejected(status=2), total
      const invitationCalls = mockInvitationCount.mock.calls;
      expect(invitationCalls.length).toBe(3);

      // Each invitation.count has date range on invitation_created_at
      for (const call of invitationCalls) {
        const createdAt = call[0]?.where?.invitation_created_at;
        expect(createdAt).toBeDefined();
        expect(createdAt.gte).toBeInstanceOf(Date);
        expect(createdAt.lte).toBeInstanceOf(Date);
      }
    });

    it("handles empty recruiter list gracefully", async () => {
      mockStaffFindMany.mockResolvedValue([]);

      const result = await getReport(RECRUITER_INPUT);

      expect(result.data.reports).toEqual([]);
      expect(result.data.total).toBe(0);
    });

    it("parses date from ID when ID has date format", async () => {
      const result = await getReport({
        id: "2026-01-01-recruiter-daily",
        type: "recruiter-daily",
      });

      expect(result.data.date).toBe("2026-01-01");
    });

    it("uses today's date when ID date is unparseable", async () => {
      const result = await getReport({
        id: "invalid-date-recruiter-daily",
        type: "recruiter-daily",
      });

      const today = new Date().toISOString().split("T")[0];
      expect(result.data.date).toBe(today);
    });
  });

  describe("invitation-summary report", () => {
    const INVITATION_INPUT: GetReportInput = {
      id: "invitation-summary-1",
      type: "invitation-summary",
    };

    beforeEach(() => {
      mockInvitationGroupBy.mockResolvedValue([
        { invitation_status: 1, _count: { _all: 10 } },
        { invitation_status: 2, _count: { _all: 3 } },
      ]);
    });

    it("returns an invitation-summary report with correct structure", async () => {
      const result = await getReport(INVITATION_INPUT);

      expect(result.id).toBe("invitation-summary-1");
      expect(result.type).toBe("invitation-summary");
      expect(result.label).toBe("Invitation Summary");
      expect(result.data).toHaveProperty("date");
      expect(result.data).toHaveProperty("summary");
      expect(result.generatedAt).toBeTruthy();
    });

    it("groups invitations by status", async () => {
      await getReport(INVITATION_INPUT);

      expect(mockInvitationGroupBy).toHaveBeenCalledWith({
        by: ["invitation_status"],
        _count: { _all: true },
      });
    });

    it("maps summary items with status and count", async () => {
      const result = await getReport(INVITATION_INPUT);

      const data = result.data as { date: string; summary: Array<{ status: number; count: number }> };
      expect(data.summary).toHaveLength(2);
      expect(data.summary[0]).toEqual({ status: 1, count: 10 });
      expect(data.summary[1]).toEqual({ status: 2, count: 3 });
    });

    it("handles empty summary result", async () => {
      mockInvitationGroupBy.mockResolvedValue([]);

      const result = await getReport(INVITATION_INPUT);

      const data = result.data as { date: string; summary: Array<{ status: number; count: number }> };
      expect(data.summary).toEqual([]);
    });
  });

  describe("error handling", () => {
    it("throws on unknown report type", async () => {
      await expect(
        getReport({
          id: "unknown-1",
          type: "unknown-type",
        }),
      ).rejects.toThrow("Unknown report type: unknown-type");
    });

    it("throws on empty type", async () => {
      await expect(
        getReport({ id: "test-1", type: "" }),
      ).rejects.toThrow();
    });

    it("throws on empty id", async () => {
      await expect(
        getReport({ id: "", type: "recruiter-daily" }),
      ).rejects.toThrow();
    });

    it("propagates requireCapability rejection", async () => {
      mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

      await expect(
        getReport({ id: "test-recruiter-daily", type: "recruiter-daily" }),
      ).rejects.toThrow("Unauthorized");
    });
  });
});
