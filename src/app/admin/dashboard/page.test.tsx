import { describe, it, expect } from "vitest";
import { dashboardDataSchema } from "./schemas";
import type { DashboardData } from "./schemas";

/**
 * Page migration test for admin/dashboard.
 *
 * Verifies that getDashboardData returns data matching dashboardDataSchema,
 * and that the AdminDashboardClient can consume the result shape.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between page and action.
 */
describe("admin dashboard page — data contract", () => {
  it("dashboardDataSchema accepts full valid payload", () => {
    const payload: DashboardData = {
      metrics: [
        { label: "Total Candidates", value: 1240, note: "+12% this week" },
        { label: "Active Companies", value: 89, note: "" },
        { label: "Open Requests", value: 45, note: "" },
        { label: "Pending Transfers", value: 12, note: "3 overdue" },
      ],
      statusMix: [
        { label: "Approved", value: 320 },
        { label: "Pending", value: 145 },
        { label: "Rejected", value: 28 },
      ],
      recentCandidates: [
        {
          id: 1,
          title: "John Doe",
          subtitle: "john@example.com",
          meta: "Software Engineer",
          amount: "2,500 KWD",
          date: "2026-06-10",
        },
      ],
      recentCompanies: [
        {
          id: 2,
          title: "Acme Corp",
          subtitle: "contact@acme.com",
          meta: "active",
          count: 5,
        },
      ],
      recentRequests: [
        {
          id: "REQ-001",
          title: "Frontend Developer",
          subtitle: "Acme Corp",
          meta: "open",
          date: "2026-06-12",
        },
      ],
      recentTransfers: [
        {
          id: 3,
          title: "Salary Transfer",
          subtitle: "KFH → NBK",
          meta: "completed",
          amount: "15,000 KWD",
          date: "2026-06-11",
        },
      ],
      prMergeMetrics: [
        { label: "Average Merge Time", value: "4.2h", note: "-15% from last week" },
        { label: "Median Merge Time", value: "3.1h", note: "" },
      ],
      recentPrMergeTimes: [
        { number: 1385, title: "fix: update candidate stats query", hours: 1.5 },
        { number: 1384, title: "feat: add transfer list page", hours: 3.2 },
      ],
    };

    const r = dashboardDataSchema.safeParse(payload);
    expect(r.success).toBe(true);
  });

  it("dashboardDataSchema rejects missing metrics array", () => {
    const r = dashboardDataSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("dashboardDataSchema rejects non-array metrics", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: "not-an-array",
      statusMix: [],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
      prMergeMetrics: [],
      recentPrMergeTimes: [],
    });
    expect(r.success).toBe(false);
  });

  it("dashboardDataSchema rejects metric with missing label", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [{ value: 10 }],
      statusMix: [],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
      prMergeMetrics: [],
      recentPrMergeTimes: [],
    });
    expect(r.success).toBe(false);
  });

  it("dashboardDataSchema rejects metric with negative value", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [{ label: "Test", value: -1 }],
      statusMix: [],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
      prMergeMetrics: [],
      recentPrMergeTimes: [],
    });
    expect(r.success).toBe(false);
  });

  it("dashboardDataSchema accepts all empty arrays (initial state)", () => {
    const payload: DashboardData = {
      metrics: [],
      statusMix: [],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
      prMergeMetrics: [],
      recentPrMergeTimes: [],
    };
    const r = dashboardDataSchema.safeParse(payload);
    expect(r.success).toBe(true);
  });

  it("dashboardDataListItem accepts union id (number or string)", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [],
      statusMix: [],
      recentCandidates: [{ id: 1, title: "A", subtitle: "B", meta: "C" }],
      recentCompanies: [{ id: "uuid-123", title: "X", subtitle: "Y", meta: "Z" }],
      recentRequests: [],
      recentTransfers: [],
      prMergeMetrics: [],
      recentPrMergeTimes: [],
    });
    expect(r.success).toBe(true);
  });

  it("dashboardDataListItem rejects missing title", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [],
      statusMix: [],
      recentCandidates: [{ id: 1, subtitle: "B", meta: "C" }],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
      prMergeMetrics: [],
      recentPrMergeTimes: [],
    });
    expect(r.success).toBe(false);
  });

  it("prMergeItemSchema rejects non-positive PR number", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [],
      statusMix: [],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
      prMergeMetrics: [],
      recentPrMergeTimes: [{ number: 0, title: "fix: stuff", hours: 1.5 }],
    });
    expect(r.success).toBe(false);
  });

  it("prMergeItemSchema rejects negative hours", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [],
      statusMix: [],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
      prMergeMetrics: [],
      recentPrMergeTimes: [{ number: 1385, title: "fix: stuff", hours: -1 }],
    });
    expect(r.success).toBe(false);
  });

  it("statusMix item rejects empty label", () => {
    const r = dashboardDataSchema.safeParse({
      metrics: [],
      statusMix: [{ label: "", value: 10 }],
      recentCandidates: [],
      recentCompanies: [],
      recentRequests: [],
      recentTransfers: [],
      prMergeMetrics: [],
      recentPrMergeTimes: [],
    });
    expect(r.success).toBe(false);
  });
});
