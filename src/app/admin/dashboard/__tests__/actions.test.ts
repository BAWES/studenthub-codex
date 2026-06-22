import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock global.fetch for GitHub API calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    company: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    request: {
      count: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    transfer: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const { getPrMergeMetrics, getDashboardData } = await import("../actions");

// ---------------------------------------------------------------------------
// admin/dashboard actions
// ---------------------------------------------------------------------------

describe("admin/dashboard actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // getPrMergeMetrics
  // -----------------------------------------------------------------------

  describe("getPrMergeMetrics", () => {
    it("returns N/A when no GitHub token is configured", async () => {
      const origToken = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = "";

      const result = await getPrMergeMetrics();

      expect(result.metrics[0].value).toBe("N/A");
      expect(result.metrics[0].note).toContain("No GitHub token");
      expect(result.recent).toHaveLength(0);

      process.env.GITHUB_TOKEN = origToken;
    });

    it("returns metrics from successful GitHub API response", async () => {
      const origToken = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = "fake-token";

      const now = new Date();
      const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          total_count: 3,
          items: [
            {
              number: 101,
              title: "Fix login bug",
              created_at: hoursAgo(24),
              pull_request: { merged_at: hoursAgo(2) },
            },
            {
              number: 102,
              title: "Add dashboard",
              created_at: hoursAgo(48),
              pull_request: { merged_at: hoursAgo(6) },
            },
            {
              number: 103,
              title: "Refactor auth",
              created_at: hoursAgo(72),
              pull_request: { merged_at: hoursAgo(24) },
            },
          ],
        }),
      });

      const result = await getPrMergeMetrics();

      expect(result.metrics.length).toBeGreaterThanOrEqual(3);
      expect(result.metrics[0].label).toBe("Avg time-to-merge");
      expect(result.recent).toHaveLength(3);
      expect(result.recent[0].number).toBe(101);
      expect(result.recent[0].title).toBe("Fix login bug");

      process.env.GITHUB_TOKEN = origToken;
    });

    it("handles GitHub API error gracefully", async () => {
      const origToken = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = "fake-token";

      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: "Forbidden",
      });

      const result = await getPrMergeMetrics();

      expect(result.metrics[0].value).toBe("Error");
      expect(result.recent).toHaveLength(0);

      process.env.GITHUB_TOKEN = origToken;
    });

    it("handles empty response gracefully", async () => {
      const origToken = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = "fake-token";

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ total_count: 0, items: [] }),
      });

      const result = await getPrMergeMetrics();

      expect(result.metrics[0].value).toBe("N/A");
      expect(result.metrics[0].note).toBe("No merged PRs found");

      process.env.GITHUB_TOKEN = origToken;
    });

    it("handles fetch exception gracefully", async () => {
      const origToken = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = "fake-token";

      mockFetch.mockRejectedValue(new Error("Network failure"));

      const result = await getPrMergeMetrics();

      expect(result.metrics[0].value).toBe("Error");
      expect(result.metrics[0].note).toBe("GitHub API request failed");

      process.env.GITHUB_TOKEN = origToken;
    });
  });

  // -----------------------------------------------------------------------
  // getDashboardData
  // -----------------------------------------------------------------------

  describe("getDashboardData", () => {
    it("returns dashboard data with all sections", async () => {
      const origToken = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = "";

      // Mock $transaction returns array of 11 results in order
      vi.mocked(prisma.$transaction).mockResolvedValue([
        5, // candidateCount
        3, // companyCount
        10, // requestCount
        7, // transferCount
        1, // openCandidateCount
        2, // activeCompanyCount
        [], // recentCandidates
        [], // recentCompanies
        [], // recentRequests
        [], // recentTransfers
        [], // requestStatusGroups (empty groupBy)
      ]);

      const result = await getDashboardData();

      // Check metric cards
      expect(result.metrics).toHaveLength(4);
      expect(result.metrics[0]).toMatchObject({
        label: "Candidates",
        value: 5,
      });
      expect(result.metrics[1]).toMatchObject({
        label: "Companies",
        value: 3,
      });
      expect(result.metrics[2]).toMatchObject({
        label: "Requests",
        value: 10,
      });
      expect(result.metrics[3]).toMatchObject({
        label: "Transfers",
        value: 7,
      });

      // Check empty sections
      expect(result.statusMix).toEqual([]);
      expect(result.recentCandidates).toEqual([]);
      expect(result.recentCompanies).toEqual([]);
      expect(result.recentRequests).toEqual([]);
      expect(result.recentTransfers).toEqual([]);

      // PR metrics (no token → N/A fallback)
      expect(result.prMergeMetrics).toBeDefined();
      expect(result.recentPrMergeTimes).toEqual([]);

      process.env.GITHUB_TOKEN = origToken;
    });
  });
});
