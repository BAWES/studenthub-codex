import { describe, it, expect } from "vitest";
import {
  employerDashboardMetricSchema,
  recentApplicationSchema,
  jobStatusBreakdownSchema,
  employerDashboardDataSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// employerDashboardMetricSchema
// ---------------------------------------------------------------------------

describe("employerDashboardMetricSchema", () => {
  const validMetric = () => ({
    label: "Total Applications",
    value: 42,
    note: "Last 30 days",
  });

  it("accepts a valid metric", () => {
    const r = employerDashboardMetricSchema.safeParse(validMetric());
    expect(r.success).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric();
    expect(employerDashboardMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-number value", () => {
    expect(
      employerDashboardMetricSchema.safeParse({ ...validMetric(), value: "many" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// recentApplicationSchema
// ---------------------------------------------------------------------------

describe("recentApplicationSchema", () => {
  const validApp = () => ({
    applicationId: 1,
    candidateId: 123,
    candidateName: "John Doe",
    jobTitle: "Software Engineer",
    jobListingId: 10,
    status: "applied",
    createdAt: new Date("2026-06-15"),
  });

  it("accepts a valid recent application", () => {
    const r = recentApplicationSchema.safeParse(validApp());
    expect(r.success).toBe(true);
  });

  it("accepts nullable candidateName", () => {
    const r = recentApplicationSchema.safeParse({ ...validApp(), candidateName: null });
    expect(r.success).toBe(true);
  });

  it("rejects missing applicationId", () => {
    const { applicationId: _, ...rest } = validApp();
    expect(recentApplicationSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-date createdAt", () => {
    expect(
      recentApplicationSchema.safeParse({ ...validApp(), createdAt: "yesterday" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// jobStatusBreakdownSchema
// ---------------------------------------------------------------------------

describe("jobStatusBreakdownSchema", () => {
  it("accepts valid breakdown", () => {
    const r = jobStatusBreakdownSchema.safeParse({ status: "active", count: 5 });
    expect(r.success).toBe(true);
  });

  it("rejects missing status", () => {
    const r = jobStatusBreakdownSchema.safeParse({ count: 5 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// employerDashboardDataSchema
// ---------------------------------------------------------------------------

describe("employerDashboardDataSchema", () => {
  it("accepts a valid dashboard data object", () => {
    const r = employerDashboardDataSchema.safeParse({
      metrics: [{ label: "Apps", value: 10, note: "Total" }],
      recentApplications: [
        { applicationId: 1, candidateId: 1, candidateName: null, jobTitle: "E", jobListingId: 1, status: "applied", createdAt: new Date() },
      ],
      jobStatusBreakdown: [{ status: "active", count: 3 }],
      totalJobs: 10,
      totalApplications: 50,
      pendingReviews: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty arrays", () => {
    const r = employerDashboardDataSchema.safeParse({
      metrics: [],
      recentApplications: [],
      jobStatusBreakdown: [],
      totalJobs: 0,
      totalApplications: 0,
      pendingReviews: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing totalJobs", () => {
    const r = employerDashboardDataSchema.safeParse({
      metrics: [], recentApplications: [], jobStatusBreakdown: [], totalApplications: 0, pendingReviews: 0,
    });
    expect(r.success).toBe(false);
  });
});
