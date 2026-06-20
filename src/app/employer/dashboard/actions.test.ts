import { describe, it, expect } from "vitest";
import {
  employerDashboardMetricSchema,
  recentApplicationSchema,
  jobStatusBreakdownSchema,
  employerDashboardDataSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Tests — employerDashboardMetricSchema
// ---------------------------------------------------------------------------

describe("employerDashboardMetricSchema", () => {
  it("accepts a valid dashboard metric", () => {
    const result = employerDashboardMetricSchema.safeParse({
      label: "Active Job Listings",
      value: 12,
      note: "15 total job postings",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.label).toBe("Active Job Listings");
      expect(result.data.value).toBe(12);
    }
  });

  it("rejects missing label", () => {
    const result = employerDashboardMetricSchema.safeParse({
      value: 5,
      note: "test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric value", () => {
    const result = employerDashboardMetricSchema.safeParse({
      label: "Test",
      value: "not-a-number",
      note: "",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests — recentApplicationSchema
// ---------------------------------------------------------------------------

describe("recentApplicationSchema", () => {
  it("accepts a valid recent application with candidate name", () => {
    const result = recentApplicationSchema.safeParse({
      applicationId: 1,
      candidateId: 42,
      candidateName: "Ahmed Al-Mutairi",
      jobTitle: "Software Engineer Intern",
      jobListingId: 101,
      status: "pending",
      createdAt: new Date("2026-01-15"),
    });
    expect(result.success).toBe(true);
  });

  it("accepts null candidateName", () => {
    const result = recentApplicationSchema.safeParse({
      applicationId: 2,
      candidateId: 99,
      candidateName: null,
      jobTitle: "Designer",
      jobListingId: 102,
      status: "reviewed",
      createdAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = recentApplicationSchema.safeParse({
      applicationId: 1,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests — jobStatusBreakdownSchema
// ---------------------------------------------------------------------------

describe("jobStatusBreakdownSchema", () => {
  it("accepts a valid job status breakdown entry", () => {
    const result = jobStatusBreakdownSchema.safeParse({
      status: "active",
      count: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-numeric count", () => {
    const result = jobStatusBreakdownSchema.safeParse({
      status: "draft",
      count: "five",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests — employerDashboardDataSchema (full response shape)
// ---------------------------------------------------------------------------

describe("employerDashboardDataSchema", () => {
  it("accepts a populated dashboard response", () => {
    const result = employerDashboardDataSchema.safeParse({
      metrics: [
        { label: "Active Jobs", value: 5, note: "10 total" },
        { label: "Applications", value: 120, note: "15 in 30d" },
      ],
      recentApplications: [
        {
          applicationId: 1,
          candidateId: 10,
          candidateName: "Fatima",
          jobTitle: "Engineer",
          jobListingId: 101,
          status: "pending",
          createdAt: new Date(),
        },
      ],
      jobStatusBreakdown: [
        { status: "active", count: 5 },
        { status: "closed", count: 3 },
        { status: "draft", count: 2 },
      ],
      totalJobs: 10,
      totalApplications: 120,
      pendingReviews: 3,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metrics).toHaveLength(2);
      expect(result.data.recentApplications).toHaveLength(1);
      expect(result.data.jobStatusBreakdown).toHaveLength(3);
      expect(result.data.totalJobs).toBe(10);
      expect(result.data.totalApplications).toBe(120);
    }
  });

  it("accepts empty dashboard response (no data)", () => {
    const result = employerDashboardDataSchema.safeParse({
      metrics: [],
      recentApplications: [],
      jobStatusBreakdown: [],
      totalJobs: 0,
      totalApplications: 0,
      pendingReviews: 0,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metrics).toHaveLength(0);
      expect(result.data.totalJobs).toBe(0);
    }
  });

  it("rejects missing totalJobs field", () => {
    const result = employerDashboardDataSchema.safeParse({
      metrics: [],
      recentApplications: [],
      jobStatusBreakdown: [],
      totalApplications: 0,
      pendingReviews: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-array metrics", () => {
    const result = employerDashboardDataSchema.safeParse({
      metrics: "not-an-array",
      recentApplications: [],
      jobStatusBreakdown: [],
      totalJobs: 0,
      totalApplications: 0,
    });
    expect(result.success).toBe(false);
  });
});
