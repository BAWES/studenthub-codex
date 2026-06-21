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
  const validMetric = { label: "Active Jobs", value: 42, note: "Last 30 days" };

  it("accepts valid input", () => {
    expect(employerDashboardMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts empty note", () => {
    expect(
      employerDashboardMetricSchema.safeParse({ ...validMetric, note: "" }).success,
    ).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(employerDashboardMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validMetric;
    expect(employerDashboardMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string label", () => {
    expect(
      employerDashboardMetricSchema.safeParse({ label: 123, value: 42, note: "" }).success,
    ).toBe(false);
  });

  it("rejects non-numeric value", () => {
    expect(
      employerDashboardMetricSchema.safeParse({ label: "Jobs", value: "42", note: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// recentApplicationSchema
// ---------------------------------------------------------------------------
describe("recentApplicationSchema", () => {
  const now = new Date("2025-01-01T00:00:00Z");
  const validInput = {
    applicationId: 1,
    candidateId: 42,
    candidateName: "John Doe",
    jobTitle: "Software Engineer",
    jobListingId: 10,
    status: "pending",
    createdAt: now,
  };

  it("accepts valid input", () => {
    expect(recentApplicationSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts nullable candidateName", () => {
    expect(
      recentApplicationSchema.safeParse({ ...validInput, candidateName: null }).success,
    ).toBe(true);
  });

  it("rejects missing applicationId", () => {
    const { applicationId: _, ...rest } = validInput;
    expect(recentApplicationSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = validInput;
    expect(recentApplicationSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-date createdAt", () => {
    expect(
      recentApplicationSchema.safeParse({ ...validInput, createdAt: "not-a-date" }).success,
    ).toBe(false);
  });

  it("rejects non-numeric applicationId", () => {
    expect(
      recentApplicationSchema.safeParse({ ...validInput, applicationId: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// jobStatusBreakdownSchema
// ---------------------------------------------------------------------------
describe("jobStatusBreakdownSchema", () => {
  const validInput = { status: "active", count: 5 };

  it("accepts valid input", () => {
    expect(jobStatusBreakdownSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts zero count", () => {
    expect(
      jobStatusBreakdownSchema.safeParse({ status: "closed", count: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = validInput;
    expect(jobStatusBreakdownSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing count", () => {
    const { count: _, ...rest } = validInput;
    expect(jobStatusBreakdownSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string status", () => {
    expect(
      jobStatusBreakdownSchema.safeParse({ status: 123, count: 5 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// employerDashboardDataSchema
// ---------------------------------------------------------------------------
describe("employerDashboardDataSchema", () => {
  const validMetric = { label: "Jobs", value: 42, note: "Active" };
  const validRecent = {
    applicationId: 1,
    candidateId: 42,
    candidateName: "John",
    jobTitle: "Engineer",
    jobListingId: 10,
    status: "pending",
    createdAt: new Date(),
  };
  const validBreakdown = { status: "active", count: 5 };

  const validData = {
    metrics: [validMetric],
    recentApplications: [validRecent],
    jobStatusBreakdown: [validBreakdown],
    totalJobs: 50,
    totalApplications: 200,
    pendingReviews: 5,
  };

  it("accepts valid input", () => {
    expect(employerDashboardDataSchema.safeParse(validData).success).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      employerDashboardDataSchema.safeParse({
        ...validData,
        metrics: [],
        recentApplications: [],
        jobStatusBreakdown: [],
      }).success,
    ).toBe(true);
  });

  it("accepts zero totals", () => {
    expect(
      employerDashboardDataSchema.safeParse({
        ...validData,
        totalJobs: 0,
        totalApplications: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validData;
    expect(employerDashboardDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array metrics", () => {
    expect(
      employerDashboardDataSchema.safeParse({ ...validData, metrics: "not-array" }).success,
    ).toBe(false);
  });

  it("rejects missing totalJobs", () => {
    const { totalJobs: _, ...rest } = validData;
    expect(employerDashboardDataSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string totalJobs", () => {
    expect(
      employerDashboardDataSchema.safeParse({ ...validData, totalJobs: "50" }).success,
    ).toBe(false);
  });
});
