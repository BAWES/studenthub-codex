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
  getCandidateJobResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

describe("listCandidateJobsSchema", () => {
  it("accepts candidateId only", () => {
    const r = listCandidateJobsSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
      expect(r.data.sortBy).toBe("newest");
    }
  });

  it("accepts all fields", () => {
    const r = listCandidateJobsSchema.safeParse({
      candidateId: 1,
      page: 2,
      limit: 50,
      q: "engineer",
      employmentType: "full-time",
      location: "Kuwait City",
      minSalary: 500,
      maxSalary: 2000,
      sortBy: "match",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.sortBy).toBe("match");
  });

  it("rejects negative candidateId", () => {
    expect(listCandidateJobsSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(listCandidateJobsSchema.safeParse({ candidateId: 1, limit: 999 }).success).toBe(false);
  });

  it("rejects invalid sortBy", () => {
    expect(
      listCandidateJobsSchema.safeParse({ candidateId: 1, sortBy: "oldest" }).success,
    ).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const r = listCandidateJobsSchema.safeParse({ candidateId: "3" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(3);
  });

  it("rejects negative minSalary", () => {
    expect(listCandidateJobsSchema.safeParse({ candidateId: 1, minSalary: -100 }).success).toBe(false);
  });
});

describe("getCandidateJobSchema", () => {
  it("accepts jobId only", () => {
    expect(getCandidateJobSchema.safeParse({ jobId: 5 }).success).toBe(true);
  });

  it("accepts jobId with optional candidateId", () => {
    expect(getCandidateJobSchema.safeParse({ jobId: 5, candidateId: 1 }).success).toBe(true);
  });

  it("rejects missing jobId", () => {
    expect(getCandidateJobSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative jobId", () => {
    expect(getCandidateJobSchema.safeParse({ jobId: -1 }).success).toBe(false);
  });
});

describe("applyToJobSchema", () => {
  it("accepts valid application", () => {
    const r = applyToJobSchema.safeParse({ candidateId: 1, jobListingId: 5 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.jobListingId).toBe(5);
  });

  it("accepts optional coverLetter", () => {
    const r = applyToJobSchema.safeParse({
      candidateId: 1,
      jobListingId: 5,
      coverLetter: "I am interested.",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(applyToJobSchema.safeParse({ jobListingId: 5 }).success).toBe(false);
  });

  it("rejects missing jobListingId", () => {
    expect(applyToJobSchema.safeParse({ candidateId: 1 }).success).toBe(false);
  });
});

describe("listMyApplicationsSchema", () => {
  it("accepts candidateId only", () => {
    const r = listMyApplicationsSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts optional status filter", () => {
    const r = listMyApplicationsSchema.safeParse({
      candidateId: 1,
      status: "pending",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe("pending");
  });

  it("rejects negative candidateId", () => {
    expect(listMyApplicationsSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("candidateJobRowSchema", () => {
  const valid = {
    jobListingId: 1,
    title: "Software Engineer",
    description: "Full stack developer needed",
    requirements: "3+ years experience",
    location: "Kuwait City",
    employmentType: "full-time",
    salaryRange: "800-1500 KWD",
    employerName: "GCC Energies",
    matchScore: 85,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-06-20"),
  };

  it("accepts a valid job row", () => {
    expect(candidateJobRowSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      candidateJobRowSchema.safeParse({
        ...valid,
        requirements: null,
        location: null,
        employmentType: null,
        salaryRange: null,
        matchScore: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing jobListingId", () => {
    const { jobListingId: _, ...rest } = valid;
    expect(candidateJobRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = valid;
    expect(candidateJobRowSchema.safeParse(rest).success).toBe(false);
  });
});

describe("candidateJobDetailSchema", () => {
  const valid = {
    jobListingId: 1,
    title: "Software Engineer",
    description: "Full stack developer",
    requirements: null,
    location: "Kuwait City",
    employmentType: "full-time",
    salaryRange: "800-1500 KWD",
    employerName: "GCC Energies",
    matchScore: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-06-20"),
    status: "active",
    hasApplied: false,
    applicationStatus: null,
    skillScore: 80,
    educationScore: 70,
    locationScore: 90,
    breakdown: ["Skills match: 80%", "Education match: 70%"],
  };

  it("accepts a valid job detail", () => {
    expect(candidateJobDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    expect(
      candidateJobDetailSchema.safeParse({
        ...valid,
        status: null,
        applicationStatus: null,
        skillScore: null,
        educationScore: null,
        locationScore: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing hasApplied", () => {
    const { hasApplied: _, ...rest } = valid;
    expect(candidateJobDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing breakdown", () => {
    const { breakdown: _, ...rest } = valid;
    expect(candidateJobDetailSchema.safeParse(rest).success).toBe(false);
  });
});

describe("applicationRowSchema", () => {
  const valid = {
    applicationId: 1,
    jobListingId: 5,
    jobTitle: "Software Engineer",
    employerName: "GCC Energies",
    status: "applied",
    coverLetter: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-06-20"),
  };

  it("accepts a valid application row", () => {
    expect(applicationRowSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing applicationId", () => {
    const { applicationId: _, ...rest } = valid;
    expect(applicationRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing jobTitle", () => {
    const { jobTitle: _, ...rest } = valid;
    expect(applicationRowSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listJobsResultSchema", () => {
  it("accepts valid result with empty list", () => {
    expect(
      listJobsResultSchema.safeParse({ items: [], total: 0, page: 1, pageSize: 20 }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listJobsResultSchema.safeParse({ items: [], total: -1, page: 1, pageSize: 20 }).success,
    ).toBe(false);
  });

  it("rejects missing items", () => {
    expect(listJobsResultSchema.safeParse({ total: 0, page: 1, pageSize: 20 }).success).toBe(false);
  });
});

describe("listApplicationsResultSchema", () => {
  it("accepts valid result with empty list", () => {
    expect(
      listApplicationsResultSchema.safeParse({ items: [], total: 0, page: 1, pageSize: 20 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    expect(
      listApplicationsResultSchema.safeParse({ total: 0, page: 1, pageSize: 20 }).success,
    ).toBe(false);
  });
});

describe("applyToJobResultSchema", () => {
  it("accepts success with applicationId", () => {
    expect(
      applyToJobResultSchema.safeParse({ success: true, applicationId: 1 }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      applyToJobResultSchema.safeParse({ success: false, error: "Already applied." }).success,
    ).toBe(true);
  });

  it("rejects success without applicationId", () => {
    expect(applyToJobResultSchema.safeParse({ success: true }).success).toBe(false);
  });

  it("rejects error without error message", () => {
    expect(applyToJobResultSchema.safeParse({ success: false }).success).toBe(false);
  });
});

describe("getCandidateJobResultSchema", () => {
  const valid = {
    job: {
      jobListingId: 1,
      title: "Software Engineer",
      description: "Full stack developer",
      requirements: null,
      location: "Kuwait City",
      employmentType: "full-time",
      salaryRange: "800-1500 KWD",
      employerName: "GCC Energies",
      matchScore: null,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-06-20"),
      status: "active",
      hasApplied: false,
      applicationStatus: null,
      skillScore: null,
      educationScore: null,
      locationScore: null,
      breakdown: [],
    },
  };

  it("accepts a valid result", () => {
    expect(getCandidateJobResultSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing job", () => {
    expect(getCandidateJobResultSchema.safeParse({}).success).toBe(false);
  });
});
