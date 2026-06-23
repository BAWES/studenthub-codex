import { describe, it, expect } from "vitest";
import {
  listCandidateJobsSchema,
  getCandidateJobSchema,
  applyToJobSchema,
  listMyApplicationsSchema,
  candidateJobRowSchema,
  candidateJobDetailSchema,
  applicationRowSchema,
  listJobsResultSchema,
  listApplicationsResultSchema,
  applyToJobResultSchema,
} from "./schemas";
import type {
  CandidateJobRow,
  CandidateJobDetail,
  ApplicationRow,
  ListJobsResult,
  ListApplicationsResult,
  ApplyToJobResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("listCandidateJobsSchema", () => {
  it("requires candidateId", () => {
    const result = listCandidateJobsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts candidateId with defaults", () => {
    const result = listCandidateJobsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe("newest");
    }
  });

  it("accepts all optional filters", () => {
    const result = listCandidateJobsSchema.safeParse({
      candidateId: 42,
      page: 2,
      limit: 50,
      q: "developer",
      employmentType: "full-time",
      location: "Kuwait City",
      minSalary: 500,
      maxSalary: 5000,
      sortBy: "match",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("developer");
      expect(result.data.employmentType).toBe("full-time");
      expect(result.data.location).toBe("Kuwait City");
      expect(result.data.minSalary).toBe(500);
      expect(result.data.maxSalary).toBe(5000);
      expect(result.data.sortBy).toBe("match");
    }
  });

  it("rejects limit over 100", () => {
    const result = listCandidateJobsSchema.safeParse({
      candidateId: 1,
      limit: 999,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCandidateJobsSchema.safeParse({
      candidateId: 1,
      page: -1,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const result = listCandidateJobsSchema.safeParse({
      candidateId: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(15);
    }
  });

  it("rejects zero candidateId", () => {
    const result = listCandidateJobsSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid sortBy value", () => {
    const result = listCandidateJobsSchema.safeParse({
      candidateId: 1,
      sortBy: "alpha",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative minSalary", () => {
    const result = listCandidateJobsSchema.safeParse({
      candidateId: 1,
      minSalary: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative maxSalary", () => {
    const result = listCandidateJobsSchema.safeParse({
      candidateId: 1,
      maxSalary: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("getCandidateJobSchema", () => {
  it("accepts valid jobId", () => {
    const result = getCandidateJobSchema.safeParse({ jobId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobId).toBe(42);
    }
  });

  it("accepts jobId with optional candidateId", () => {
    const result = getCandidateJobSchema.safeParse({
      jobId: 42,
      candidateId: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobId).toBe(42);
      expect(result.data.candidateId).toBe(10);
    }
  });

  it("coerces string jobId to number", () => {
    const result = getCandidateJobSchema.safeParse({ jobId: "33" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobId).toBe(33);
    }
  });

  it("rejects missing jobId", () => {
    const result = getCandidateJobSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero jobId", () => {
    const result = getCandidateJobSchema.safeParse({ jobId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative jobId", () => {
    const result = getCandidateJobSchema.safeParse({ jobId: -5 });
    expect(result.success).toBe(false);
  });
});

describe("applyToJobSchema", () => {
  it("accepts valid application", () => {
    const result = applyToJobSchema.safeParse({
      candidateId: 42,
      jobListingId: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.jobListingId).toBe(10);
    }
  });

  it("accepts application with cover letter", () => {
    const result = applyToJobSchema.safeParse({
      candidateId: 42,
      jobListingId: 10,
      coverLetter: "I am very interested in this role.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.coverLetter).toBe("I am very interested in this role.");
    }
  });

  it("coerces string jobListingId to number", () => {
    const result = applyToJobSchema.safeParse({
      candidateId: 42,
      jobListingId: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobListingId).toBe(15);
    }
  });

  it("rejects missing candidateId", () => {
    const result = applyToJobSchema.safeParse({ jobListingId: 10 });
    expect(result.success).toBe(false);
  });

  it("rejects missing jobListingId", () => {
    const result = applyToJobSchema.safeParse({ candidateId: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    const result = applyToJobSchema.safeParse({
      candidateId: 0,
      jobListingId: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero jobListingId", () => {
    const result = applyToJobSchema.safeParse({
      candidateId: 1,
      jobListingId: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("listMyApplicationsSchema", () => {
  it("requires candidateId", () => {
    const result = listMyApplicationsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts candidateId with defaults", () => {
    const result = listMyApplicationsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination with status filter", () => {
    const result = listMyApplicationsSchema.safeParse({
      candidateId: 42,
      page: 2,
      limit: 10,
      status: "applied",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("applied");
    }
  });

  it("rejects limit over 100", () => {
    const result = listMyApplicationsSchema.safeParse({
      candidateId: 1,
      limit: 999,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    const result = listMyApplicationsSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("candidateJobRowSchema", () => {
  const validRow: CandidateJobRow = {
    jobListingId: 1,
    title: "Software Engineer",
    description: "Build awesome things",
    requirements: "5+ years experience",
    location: "Kuwait City",
    employmentType: "full-time",
    salaryRange: "2000-4000 KWD",
    employerName: "Acme Corp",
    matchScore: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-06-01"),
  };

  it("accepts valid job row", () => {
    const result = candidateJobRowSchema.safeParse(validRow);
    expect(result.success).toBe(true);
  });

  it("accepts row with null optional fields", () => {
    const result = candidateJobRowSchema.safeParse({
      ...validRow,
      requirements: null,
      location: null,
      employmentType: null,
      salaryRange: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts row with matchScore number", () => {
    const result = candidateJobRowSchema.safeParse({
      ...validRow,
      matchScore: 85,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.matchScore).toBe(85);
    }
  });

  it("rejects missing jobListingId", () => {
    const { jobListingId: _, ...rest } = validRow;
    const result = candidateJobRowSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validRow;
    const result = candidateJobRowSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing employerName", () => {
    const { employerName: _, ...rest } = validRow;
    const result = candidateJobRowSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("candidateJobDetailSchema", () => {
  const validDetail: CandidateJobDetail = {
    jobListingId: 1,
    title: "Software Engineer",
    description: "Build awesome things",
    requirements: "5+ years experience",
    location: "Kuwait City",
    employmentType: "full-time",
    salaryRange: "2000-4000 KWD",
    employerName: "Acme Corp",
    matchScore: 75,
    skillScore: 80,
    educationScore: 70,
    locationScore: 90,
    breakdown: ["skill", "education", "location"],
    status: "active",
    hasApplied: false,
    applicationStatus: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-06-01"),
  };

  it("accepts valid job detail", () => {
    const result = candidateJobDetailSchema.safeParse(validDetail);
    expect(result.success).toBe(true);
  });

  it("accepts detail with hasApplied=true", () => {
    const result = candidateJobDetailSchema.safeParse({
      ...validDetail,
      hasApplied: true,
      applicationStatus: "applied",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hasApplied).toBe(true);
      expect(result.data.applicationStatus).toBe("applied");
    }
  });

  it("accepts detail with null scores and empty breakdown", () => {
    const result = candidateJobDetailSchema.safeParse({
      ...validDetail,
      matchScore: null,
      skillScore: null,
      educationScore: null,
      locationScore: null,
      breakdown: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing hasApplied", () => {
    const { hasApplied: _, ...rest } = validDetail;
    const result = candidateJobDetailSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing breakdown", () => {
    const { breakdown: _, ...rest } = validDetail;
    const result = candidateJobDetailSchema.safeParse(rest);
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
  const validApplication: ApplicationRow = {
    applicationId: 1,
    jobListingId: 42,
    jobTitle: "Software Engineer",
    employerName: "Acme Corp",
    status: "applied",
    coverLetter: "I am interested in this role.",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-06-01"),
  };

  it("accepts valid application row", () => {
    const result = applicationRowSchema.safeParse(validApplication);
    expect(result.success).toBe(true);
  });

  it("accepts application with null coverLetter", () => {
    const result = applicationRowSchema.safeParse({
      ...validApplication,
      coverLetter: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing applicationId", () => {
    const { applicationId: _, ...rest } = validApplication;
    const result = applicationRowSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = validApplication;
    const result = applicationRowSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing jobTitle", () => {
    const { jobTitle: _, ...rest } = validApplication;
    const result = applicationRowSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("listJobsResultSchema", () => {
  it("accepts empty results", () => {
    const result: ListJobsResult = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    };
    const parsed = listJobsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts populated results", () => {
    const result = listJobsResultSchema.safeParse({
      items: [
        {
          jobListingId: 1,
          title: "Software Engineer",
          description: "Build things",
          requirements: null,
          location: null,
          employmentType: null,
          salaryRange: null,
          employerName: "Acme Corp",
          matchScore: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listJobsResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listJobsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 0,
      pageSize: 20,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing items", () => {
    const result = listJobsResultSchema.safeParse({
      total: 0,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(false);
  });
});

describe("listApplicationsResultSchema", () => {
  it("accepts empty results", () => {
    const result: ListApplicationsResult = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    };
    const parsed = listApplicationsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts populated results", () => {
    const result = listApplicationsResultSchema.safeParse({
      items: [
        {
          applicationId: 1,
          jobListingId: 42,
          jobTitle: "Software Engineer",
          employerName: "Acme Corp",
          status: "applied",
          coverLetter: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listApplicationsResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listApplicationsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 0,
      pageSize: 20,
    });
    expect(result.success).toBe(false);
  });
});

describe("applyToJobResultSchema", () => {
  it("accepts success result", () => {
    const result = applyToJobResultSchema.safeParse({
      success: true,
      applicationId: 42,
    } satisfies ApplyToJobResult);
    expect(result.success).toBe(true);
    if (result.success && result.data.success) {
      expect(result.data.applicationId).toBe(42);
    }
  });

  it("accepts error result", () => {
    const result = applyToJobResultSchema.safeParse({
      success: false,
      error: "Job listing not found",
    } satisfies ApplyToJobResult);
    expect(result.success).toBe(true);
    if (result.success && !result.data.success) {
      expect(result.data.error).toBe("Job listing not found");
    }
  });

  it("rejects success without applicationId", () => {
    const result = applyToJobResultSchema.safeParse({ success: true });
    expect(result.success).toBe(false);
  });

  it("rejects error without error message", () => {
    const result = applyToJobResultSchema.safeParse({ success: false });
    expect(result.success).toBe(false);
  });

  it("rejects invalid success type", () => {
    const result = applyToJobResultSchema.safeParse({
      success: "maybe",
      applicationId: 42,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero applicationId on success", () => {
    const result = applyToJobResultSchema.safeParse({
      success: true,
      applicationId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative applicationId on success", () => {
    const result = applyToJobResultSchema.safeParse({
      success: true,
      applicationId: -5,
    });
    expect(result.success).toBe(false);
  });
});
