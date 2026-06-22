import { describe, it, expect } from "vitest";
import {
  listCandidateJobsSchema,
  getCandidateJobSchema,
  applyToJobSchema,
  listMyApplicationsSchema,
  listJobApplicationsSchema,
  candidateJobRowSchema,
  candidateJobDetailSchema,
  applicationRowSchema,
  listCandidateJobsResultSchema,
  getCandidateJobResultSchema,
  applyToJobResultSchema,
  listMyApplicationsResultSchema,
} from "@/app/candidate/jobs/schemas";

// ---------------------------------------------------------------------------
// Input Schema Validation Tests
// ---------------------------------------------------------------------------

describe("listCandidateJobsSchema", () => {
  it("applies defaults for empty input", () => {
    const result = listCandidateJobsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe("newest");
    }
  });

  it("accepts with search query and filters", () => {
    const result = listCandidateJobsSchema.safeParse({
      page: 2,
      limit: 10,
      q: "developer",
      employmentType: "full-time",
      location: "Kuwait City",
      minSalary: 500,
      maxSalary: 2000,
      sortBy: "match",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("developer");
      expect(result.data.employmentType).toBe("full-time");
      expect(result.data.sortBy).toBe("match");
    }
  });

  it("coerces string numbers", () => {
    const result = listCandidateJobsSchema.safeParse({
      page: "3",
      limit: "15",
      minSalary: "1000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
      expect(result.data.minSalary).toBe(1000);
    }
  });

  it("rejects negative page", () => {
    const result = listCandidateJobsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit > 100", () => {
    const result = listCandidateJobsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sortBy value", () => {
    const result = listCandidateJobsSchema.safeParse({ sortBy: "relevance" });
    expect(result.success).toBe(false);
  });

  it("rejects negative minSalary", () => {
    const result = listCandidateJobsSchema.safeParse({ minSalary: -100 });
    expect(result.success).toBe(false);
  });

  it("accepts zero minSalary", () => {
    const result = listCandidateJobsSchema.safeParse({ minSalary: 0 });
    expect(result.success).toBe(true);
  });
});

describe("getCandidateJobSchema", () => {
  it("accepts a valid job ID", () => {
    const result = getCandidateJobSchema.safeParse({ jobId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobId).toBe(42);
    }
  });

  it("coerces string job ID", () => {
    const result = getCandidateJobSchema.safeParse({ jobId: "99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobId).toBe(99);
    }
  });

  it("rejects zero job ID", () => {
    const result = getCandidateJobSchema.safeParse({ jobId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative job ID", () => {
    const result = getCandidateJobSchema.safeParse({ jobId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing jobId", () => {
    const result = getCandidateJobSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("applyToJobSchema", () => {
  it("accepts valid job ID without cover letter", () => {
    const result = applyToJobSchema.safeParse({ jobListingId: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobListingId).toBe(1);
      expect(result.data.coverLetter).toBeUndefined();
    }
  });

  it("accepts valid input with cover letter", () => {
    const result = applyToJobSchema.safeParse({
      jobListingId: 1,
      coverLetter: "I am excited to apply...",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.coverLetter).toBe("I am excited to apply...");
    }
  });

  it("coerces string jobListingId", () => {
    const result = applyToJobSchema.safeParse({ jobListingId: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobListingId).toBe(5);
    }
  });

  it("rejects zero jobListingId", () => {
    const result = applyToJobSchema.safeParse({ jobListingId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects missing jobListingId", () => {
    const result = applyToJobSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("listMyApplicationsSchema", () => {
  it("applies defaults for empty input", () => {
    const result = listMyApplicationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts with status filter", () => {
    const result = listMyApplicationsSchema.safeParse({
      page: 1,
      limit: 10,
      status: "applied",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("applied");
    }
  });

  it("rejects limit > 100", () => {
    const result = listMyApplicationsSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive page", () => {
    const result = listMyApplicationsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });
});

describe("listJobApplicationsSchema", () => {
  it("accepts valid input", () => {
    const result = listJobApplicationsSchema.safeParse({
      jobListingId: 1,
      page: 2,
      limit: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobListingId).toBe(1);
      expect(result.data.page).toBe(2);
    }
  });

  it("accepts with status filter", () => {
    const result = listJobApplicationsSchema.safeParse({
      jobListingId: 1,
      status: "interview",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("interview");
    }
  });

  it("rejects missing jobListingId", () => {
    const result = listJobApplicationsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output Schema Validation Tests
// ---------------------------------------------------------------------------

describe("candidateJobRowSchema", () => {
  const validRow = {
    jobListingId: 1,
    title: "Software Engineer",
    description: "Build great things",
    requirements: "3+ years experience",
    location: "Kuwait City",
    employmentType: "full-time",
    salaryRange: "KD 800-1500",
    employerName: "ACME Corp",
    matchScore: 85.5,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-06-01"),
  };

  it("accepts a valid job row", () => {
    const result = candidateJobRowSchema.safeParse(validRow);
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const result = candidateJobRowSchema.safeParse({
      ...validRow,
      requirements: null,
      location: null,
      employmentType: null,
      salaryRange: null,
      matchScore: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = candidateJobRowSchema.safeParse({
      ...validRow,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing description", () => {
    const result = candidateJobRowSchema.safeParse({
      ...validRow,
      description: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive jobListingId", () => {
    const result = candidateJobRowSchema.safeParse({
      ...validRow,
      jobListingId: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-Date createdAt", () => {
    const result = candidateJobRowSchema.safeParse({
      ...validRow,
      createdAt: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});

describe("candidateJobDetailSchema", () => {
  const validDetail = {
    jobListingId: 1,
    title: "Software Engineer",
    description: "Build great things",
    requirements: "3+ years",
    location: "Kuwait City",
    employmentType: "full-time",
    salaryRange: "KD 800-1500",
    employerName: "ACME Corp",
    matchScore: 85.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "active",
    hasApplied: true,
    applicationStatus: "applied",
    skillScore: 90,
    educationScore: 80,
    locationScore: 100,
    breakdown: ["Skills match: high", "Location match: perfect"],
  };

  it("accepts a valid job detail", () => {
    const result = candidateJobDetailSchema.safeParse(validDetail);
    expect(result.success).toBe(true);
  });

  it("accepts with no application", () => {
    const result = candidateJobDetailSchema.safeParse({
      ...validDetail,
      hasApplied: false,
      applicationStatus: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null scores", () => {
    const result = candidateJobDetailSchema.safeParse({
      ...validDetail,
      matchScore: null,
      skillScore: null,
      educationScore: null,
      locationScore: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty breakdown", () => {
    const result = candidateJobDetailSchema.safeParse({
      ...validDetail,
      breakdown: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing hasApplied", () => {
    const { hasApplied, ...withoutHasApplied } = validDetail;
    const result = candidateJobDetailSchema.safeParse(withoutHasApplied);
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean hasApplied", () => {
    const result = candidateJobDetailSchema.safeParse({
      ...validDetail,
      hasApplied: "yes",
    });
    expect(result.success).toBe(false);
  });
});

describe("applicationRowSchema", () => {
  const validApp = {
    applicationId: 1,
    jobListingId: 1,
    jobTitle: "Software Engineer",
    employerName: "ACME Corp",
    status: "applied",
    coverLetter: "I am a great fit",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("accepts a valid application row", () => {
    const result = applicationRowSchema.safeParse(validApp);
    expect(result.success).toBe(true);
  });

  it("accepts null coverLetter", () => {
    const result = applicationRowSchema.safeParse({ ...validApp, coverLetter: null });
    expect(result.success).toBe(true);
  });

  it("rejects missing job title", () => {
    const result = applicationRowSchema.safeParse({ ...validApp, jobTitle: "" });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive applicationId", () => {
    const result = applicationRowSchema.safeParse({ ...validApp, applicationId: 0 });
    expect(result.success).toBe(false);
  });
});

describe("listCandidateJobsResultSchema", () => {
  it("accepts valid result with jobs array", () => {
    const result = listCandidateJobsResultSchema.safeParse({
      success: true,
      jobs: [
        {
          jobListingId: 1,
          title: "Engineer",
          description: "desc",
          requirements: null,
          location: null,
          employmentType: null,
          salaryRange: null,
          employerName: "ACME",
          matchScore: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty jobs array", () => {
    const result = listCandidateJobsResultSchema.safeParse({
      success: true,
      jobs: [],
      total: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing total", () => {
    const result = listCandidateJobsResultSchema.safeParse({
      success: true,
      jobs: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative total", () => {
    const result = listCandidateJobsResultSchema.safeParse({
      success: true,
      jobs: [],
      total: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("getCandidateJobResultSchema", () => {
  it("accepts valid job detail result", () => {
    const result = getCandidateJobResultSchema.safeParse({
      success: true,
      job: {
        jobListingId: 1,
        title: "Engineer",
        description: "desc",
        requirements: null,
        location: null,
        employmentType: null,
        salaryRange: null,
        employerName: "ACME",
        matchScore: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "active",
        hasApplied: false,
        applicationStatus: null,
        skillScore: null,
        educationScore: null,
        locationScore: null,
        breakdown: [],
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing job property", () => {
    const result = getCandidateJobResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects with success: false", () => {
    const result = getCandidateJobResultSchema.safeParse({
      success: false,
      error: "Not found",
    });
    expect(result.success).toBe(false);
  });
});

describe("applyToJobResultSchema", () => {
  it("accepts valid result", () => {
    const result = applyToJobResultSchema.safeParse({
      success: true,
      applicationId: 42,
      message: "Application submitted successfully",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing applicationId", () => {
    const result = applyToJobResultSchema.safeParse({
      success: true,
      message: "Done",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive applicationId", () => {
    const result = applyToJobResultSchema.safeParse({
      success: true,
      applicationId: 0,
      message: "Done",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const result = applyToJobResultSchema.safeParse({
      success: true,
      applicationId: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("listMyApplicationsResultSchema", () => {
  it("accepts valid result", () => {
    const result = listMyApplicationsResultSchema.safeParse({
      success: true,
      applications: [
        {
          applicationId: 1,
          jobListingId: 1,
          jobTitle: "Engineer",
          employerName: "ACME",
          status: "applied",
          coverLetter: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty applications", () => {
    const result = listMyApplicationsResultSchema.safeParse({
      success: true,
      applications: [],
      total: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listMyApplicationsResultSchema.safeParse({
      success: true,
      applications: [],
      total: -1,
    });
    expect(result.success).toBe(false);
  });
});
