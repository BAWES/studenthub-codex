import { describe, it, expect } from "vitest";
import {
  employerDashboardMetricOutputSchema,
  recentApplicationOutputSchema,
  jobStatusBreakdownOutputSchema,
  employerDashboardDataOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema tests — employerDashboardMetricOutputSchema
// ---------------------------------------------------------------------------

describe("employerDashboardMetricOutputSchema", () => {
  it("accepts a valid dashboard metric", () => {
    const metric = {
      label: "Active Job Listings",
      value: 12,
      note: "15 total job postings",
    };
    const result = employerDashboardMetricOutputSchema.safeParse(metric);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.label).toBe("Active Job Listings");
      expect(result.data.value).toBe(12);
      expect(result.data.note).toContain("total job postings");
    }
  });

  it("rejects metric with missing label", () => {
    const metric = { value: 5, note: "foo" };
    const result = employerDashboardMetricOutputSchema.safeParse(metric);
    expect(result.success).toBe(false);
  });

  it("rejects metric with non-number value", () => {
    const metric = { label: "Test", value: "five", note: "foo" };
    const result = employerDashboardMetricOutputSchema.safeParse(metric);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — recentApplicationOutputSchema
// ---------------------------------------------------------------------------

describe("recentApplicationOutputSchema", () => {
  it("accepts a valid recent application with name", () => {
    const app = {
      applicationId: 1,
      candidateId: 42,
      candidateName: "Ahmed Al-Mutairi",
      jobTitle: "Software Engineer Intern",
      jobListingId: 101,
      status: "pending",
      createdAt: new Date("2026-01-15"),
    };
    const result = recentApplicationOutputSchema.safeParse(app);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.applicationId).toBe(1);
      expect(result.data.candidateName).toBe("Ahmed Al-Mutairi");
      expect(result.data.status).toBe("pending");
    }
  });

  it("accepts null candidateName", () => {
    const app = {
      applicationId: 2,
      candidateId: 99,
      candidateName: null,
      jobTitle: "Designer",
      jobListingId: 102,
      status: "reviewed",
      createdAt: new Date(),
    };
    const result = recentApplicationOutputSchema.safeParse(app);
    expect(result.success).toBe(true);
    expect(result.data?.candidateName).toBeNull();
  });

  it("rejects non-integer applicationId", () => {
    const app = {
      applicationId: 1.5,
      candidateId: 42,
      candidateName: null,
      jobTitle: "Engineer",
      jobListingId: 101,
      status: "pending",
      createdAt: new Date(),
    };
    const result = recentApplicationOutputSchema.safeParse(app);
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const app = {
      applicationId: 1,
      // missing candidateId
      candidateName: null,
      jobTitle: "Engineer",
      jobListingId: 101,
      status: "pending",
      createdAt: new Date(),
    };
    const result = recentApplicationOutputSchema.safeParse(app);
    expect(result.success).toBe(false);
  });

  it("rejects non-Date createdAt", () => {
    const app = {
      applicationId: 1,
      candidateId: 42,
      candidateName: null,
      jobTitle: "Engineer",
      jobListingId: 101,
      status: "pending",
      createdAt: "2026-01-15", // string, not Date
    };
    const result = recentApplicationOutputSchema.safeParse(app);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — jobStatusBreakdownOutputSchema
// ---------------------------------------------------------------------------

describe("jobStatusBreakdownOutputSchema", () => {
  it("accepts a valid job status breakdown", () => {
    const item = { status: "active", count: 5 };
    const result = jobStatusBreakdownOutputSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects negative count", () => {
    const item = { status: "active", count: -1 };
    const result = jobStatusBreakdownOutputSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("rejects non-integer count", () => {
    const item = { status: "active", count: 5.5 };
    const result = jobStatusBreakdownOutputSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const item = { count: 5 };
    const result = jobStatusBreakdownOutputSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — employerDashboardDataOutputSchema (full response)
// ---------------------------------------------------------------------------

describe("employerDashboardDataOutputSchema", () => {
  it("accepts a populated dashboard response", () => {
    const data = {
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
    };
    const result = employerDashboardDataOutputSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metrics).toHaveLength(2);
      expect(result.data.metrics[0].label).toBe("Active Jobs");
      expect(result.data.recentApplications).toHaveLength(1);
      expect(result.data.jobStatusBreakdown).toHaveLength(3);
      expect(result.data.totalJobs).toBe(10);
      expect(result.data.totalApplications).toBe(120);
    }
  });

  it("accepts empty dashboard response (no data)", () => {
    const data = {
      metrics: [],
      recentApplications: [],
      jobStatusBreakdown: [],
      totalJobs: 0,
      totalApplications: 0,
    };
    const result = employerDashboardDataOutputSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metrics).toHaveLength(0);
      expect(result.data.totalJobs).toBe(0);
    }
  });

  it("rejects negative totalJobs", () => {
    const data = {
      metrics: [],
      recentApplications: [],
      jobStatusBreakdown: [],
      totalJobs: -1,
      totalApplications: 0,
    };
    const result = employerDashboardDataOutputSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects non-integer totalApplications", () => {
    const data = {
      metrics: [],
      recentApplications: [],
      jobStatusBreakdown: [],
      totalJobs: 0,
      totalApplications: 1.5,
    };
    const result = employerDashboardDataOutputSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects missing metrics array", () => {
    const data = {
      recentApplications: [],
      jobStatusBreakdown: [],
      totalJobs: 0,
      totalApplications: 0,
    };
    const result = employerDashboardDataOutputSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
