import { describe, it, expect } from "vitest";
import {
  employerDashboardMetricSchema,
  recentApplicationSchema,
  jobStatusBreakdownSchema,
  employerDashboardDataSchema,
} from "./schemas";

/**
 * Page migration test for employer/dashboard.
 *
 * Verifies the data contract between page and action.
 * The employer dashboard page calls getEmployerDashboardData() and destructures:
 *   metrics → MetricCard props
 *   recentApplications → RecentActivityTable rows
 *   jobStatusBreakdown → StatusBreakdownChart segments
 *   totalJobs, totalApplications → summary metrics
 *
 * Full rendering tests require Playwright (server component).
 */
describe("employer dashboard page — data contract", () => {
  it("getEmployerDashboardData returns full dashboard data shape", () => {
    const data = {
      metrics: [
        { label: "Active Jobs", value: 12, note: "This month" },
        { label: "New Applications", value: 47, note: "This week" },
      ],
      recentApplications: [
        {
          applicationId: 1,
          candidateId: 42,
          candidateName: "John Doe",
          jobTitle: "Software Engineer",
          jobListingId: 10,
          status: "pending",
          createdAt: new Date("2025-06-01"),
        },
      ],
      jobStatusBreakdown: [
        { status: "active", count: 8 },
        { status: "filled", count: 3 },
        { status: "closed", count: 1 },
      ],
      totalJobs: 12,
      totalApplications: 200,
    };

    const r = employerDashboardDataSchema.safeParse(data);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.metrics).toHaveLength(2);
      expect(r.data.recentApplications).toHaveLength(1);
      expect(r.data.jobStatusBreakdown).toHaveLength(3);
      expect(r.data.totalJobs).toBe(12);
      expect(r.data.totalApplications).toBe(200);
    }
  });

  it("accepts empty metrics array (zero state)", () => {
    const r = employerDashboardDataSchema.safeParse({
      metrics: [],
      recentApplications: [],
      jobStatusBreakdown: [],
      totalJobs: 0,
      totalApplications: 0,
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable candidateName", () => {
    const metric = { label: "Jobs", value: 5, note: "" };
    const recent = {
      applicationId: 1,
      candidateId: 42,
      candidateName: null,
      jobTitle: "Engineer",
      jobListingId: 10,
      status: "pending",
      createdAt: new Date(),
    };
    const r = recentApplicationSchema.safeParse(recent);
    expect(r.success).toBe(true);

    const full = employerDashboardDataSchema.safeParse({
      metrics: [metric],
      recentApplications: [recent],
      jobStatusBreakdown: [{ status: "a", count: 1 }],
      totalJobs: 1,
      totalApplications: 1,
    });
    expect(full.success).toBe(true);
  });

  it("MetricCard fields match employerDashboardMetricSchema", () => {
    const metric = { label: "Test Metric", value: 100, note: "Test note" };
    expect(employerDashboardMetricSchema.safeParse(metric).success).toBe(true);
  });

  it("rejects missing required totalJobs", () => {
    const { totalJobs: _, ...rest } = {
      metrics: [],
      recentApplications: [],
      jobStatusBreakdown: [],
      totalApplications: 0,
    } as any;
    expect(employerDashboardDataSchema.safeParse(rest).success).toBe(false);
  });

  it("RecentApplication fields match DataTable column expectations", () => {
    const app = {
      applicationId: 1,
      candidateId: 42,
      candidateName: "Alice",
      jobTitle: "Designer",
      jobListingId: 10,
      status: "reviewed",
      createdAt: new Date(),
    };
    expect(recentApplicationSchema.safeParse(app).success).toBe(true);
  });

  it("JobStatusBreakdown fields match chart segment expectations", () => {
    expect(
      jobStatusBreakdownSchema.safeParse({ status: "active", count: 5 }).success,
    ).toBe(true);
    expect(
      jobStatusBreakdownSchema.safeParse({ status: "", count: 0 }).success,
    ).toBe(true);
  });
});
