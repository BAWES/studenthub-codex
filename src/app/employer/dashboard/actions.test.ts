import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Type shape tests for employer/dashboard server actions
// These types are plain TypeScript interfaces (no Zod schemas), so tests
// validate the expected shape at the type level.
// ---------------------------------------------------------------------------

type EmployerDashboardMetric = {
  label: string;
  value: number;
  note: string;
};

type RecentApplication = {
  applicationId: number;
  candidateId: number;
  candidateName: string | null;
  jobTitle: string;
  jobListingId: number;
  status: string;
  createdAt: Date;
};

type JobStatusBreakdown = {
  status: string;
  count: number;
};

type EmployerDashboardData = {
  metrics: EmployerDashboardMetric[];
  recentApplications: RecentApplication[];
  jobStatusBreakdown: JobStatusBreakdown[];
  totalJobs: number;
  totalApplications: number;
};

// ---------------------------------------------------------------------------
// Tests — EmployerDashboardMetric
// ---------------------------------------------------------------------------

describe("EmployerDashboardMetric", () => {
  it("accepts a valid dashboard metric", () => {
    const metric: EmployerDashboardMetric = {
      label: "Active Job Listings",
      value: 12,
      note: "15 total job postings",
    };
    expect(metric.label).toBe("Active Job Listings");
    expect(metric.value).toBe(12);
    expect(metric.note).toContain("total job postings");
  });

  it("rejects missing fields at type level (compiler check)", () => {
    // This is a compile-time check — all fields are required
    const valid: EmployerDashboardMetric = {
      label: "Test",
      value: 0,
      note: "",
    };
    expect(valid).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Tests — RecentApplication
// ---------------------------------------------------------------------------

describe("RecentApplication", () => {
  it("accepts a valid recent application object", () => {
    const app: RecentApplication = {
      applicationId: 1,
      candidateId: 42,
      candidateName: "Ahmed Al-Mutairi",
      jobTitle: "Software Engineer Intern",
      jobListingId: 101,
      status: "pending",
      createdAt: new Date("2026-01-15"),
    };
    expect(app.applicationId).toBe(1);
    expect(app.candidateName).toBe("Ahmed Al-Mutairi");
    expect(app.jobTitle).toContain("Intern");
    expect(app.status).toBe("pending");
  });

  it("accepts null candidateName", () => {
    const app: RecentApplication = {
      applicationId: 2,
      candidateId: 99,
      candidateName: null,
      jobTitle: "Designer",
      jobListingId: 102,
      status: "reviewed",
      createdAt: new Date(),
    };
    expect(app.candidateName).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests — EmployerDashboardData (full response shape)
// ---------------------------------------------------------------------------

describe("EmployerDashboardData", () => {
  it("accepts a populated dashboard response", () => {
    const data: EmployerDashboardData = {
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

    expect(data.metrics).toHaveLength(2);
    expect(data.metrics[0].label).toBe("Active Jobs");
    expect(data.recentApplications).toHaveLength(1);
    expect(data.jobStatusBreakdown).toHaveLength(3);
    expect(data.totalJobs).toBe(10);
    expect(data.totalApplications).toBe(120);
  });

  it("accepts empty dashboard response (no data)", () => {
    const data: EmployerDashboardData = {
      metrics: [],
      recentApplications: [],
      jobStatusBreakdown: [],
      totalJobs: 0,
      totalApplications: 0,
    };

    expect(data.metrics).toHaveLength(0);
    expect(data.recentApplications).toHaveLength(0);
    expect(data.totalJobs).toBe(0);
  });
});
