import { describe, it, expect } from "vitest";
import {
  listCandidateJobsSchema,
  getCandidateJobSchema,
  applyToJobSchema,
  listMyApplicationsSchema,
  candidateJobRowSchema,
  candidateJobDetailSchema,
  applicationRowSchema,
  listCandidateJobsResultSchema,
  applyToJobResultSchema,
  listMyApplicationsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Candidate Job Browsing & Applications — schema tests
// ---------------------------------------------------------------------------

describe("listCandidateJobsSchema", () => {
  it("accepts valid input with all fields", () => {
    const r = listCandidateJobsSchema.safeParse({
      page: 1,
      limit: 20,
      q: "software",
      employmentType: "full-time",
      location: "Kuwait",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.q).toBe("software");
    }
  });

  it("defaults page and limit", () => {
    const r = listCandidateJobsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listCandidateJobsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listCandidateJobsSchema.safeParse({ limit: 200 }).success).toBe(
      false,
    );
  });

  it("coerces string page to number", () => {
    const r = listCandidateJobsSchema.safeParse({ page: "2" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
    }
  });
});

describe("getCandidateJobSchema", () => {
  it("accepts valid job ID", () => {
    const r = getCandidateJobSchema.safeParse({ jobId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobId).toBe(42);
    }
  });

  it("rejects zero job ID", () => {
    expect(getCandidateJobSchema.safeParse({ jobId: 0 }).success).toBe(false);
  });

  it("rejects negative job ID", () => {
    expect(getCandidateJobSchema.safeParse({ jobId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric job ID", () => {
    expect(
      getCandidateJobSchema.safeParse({ jobId: "abc" }).success,
    ).toBe(false);
  });

  it("rejects missing job ID", () => {
    expect(getCandidateJobSchema.safeParse({}).success).toBe(false);
  });

  it("coerces string job ID to number", () => {
    const r = getCandidateJobSchema.safeParse({ jobId: "7" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobId).toBe(7);
    }
  });
});

describe("applyToJobSchema", () => {
  it("accepts valid input", () => {
    const r = applyToJobSchema.safeParse({
      jobListingId: 42,
      coverLetter: "I am interested in this position.",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(42);
      expect(r.data.coverLetter).toBe("I am interested in this position.");
    }
  });

  it("accepts input with jobListingId only", () => {
    const r = applyToJobSchema.safeParse({ jobListingId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects zero job listing ID", () => {
    expect(applyToJobSchema.safeParse({ jobListingId: 0 }).success).toBe(false);
  });

  it("rejects negative job listing ID", () => {
    expect(applyToJobSchema.safeParse({ jobListingId: -1 }).success).toBe(false);
  });

  it("rejects missing jobListingId", () => {
    expect(applyToJobSchema.safeParse({}).success).toBe(false);
  });

  it("coerces string job listing ID to number", () => {
    const r = applyToJobSchema.safeParse({ jobListingId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(99);
    }
  });
});

describe("listMyApplicationsSchema", () => {
  it("accepts valid pagination", () => {
    const r = listMyApplicationsSchema.safeParse({ page: 1, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(10);
    }
  });

  it("defaults page and limit", () => {
    const r = listMyApplicationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listMyApplicationsSchema.safeParse({ page: 0 }).success).toBe(
      false,
    );
  });

  it("rejects limit > 100", () => {
    expect(listMyApplicationsSchema.safeParse({ limit: 200 }).success).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("candidateJobRowSchema", () => {
  const validRow = {
    jobListingId: 1,
    title: "Software Engineer",
    description: "Build things",
    requirements: "5 years experience",
    location: "Kuwait",
    employmentType: "full-time",
    salaryRange: "2000-3000 KWD",
    employerName: "Acme Corp",
    matchScore: 85,
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-10"),
  };

  it("accepts a valid job row with all fields", () => {
    expect(candidateJobRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null requirements", () => {
    expect(
      candidateJobRowSchema.safeParse({ ...validRow, requirements: null }).success,
    ).toBe(true);
  });

  it("accepts null matchScore", () => {
    expect(
      candidateJobRowSchema.safeParse({ ...validRow, matchScore: null }).success,
    ).toBe(true);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validRow;
    expect(candidateJobRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(
      candidateJobRowSchema.safeParse({ ...validRow, title: "" }).success,
    ).toBe(false);
  });
});

describe("candidateJobDetailSchema", () => {
  const baseRow = {
    jobListingId: 1,
    title: "Software Engineer",
    description: "Build things",
    requirements: null,
    location: "Kuwait",
    employmentType: "full-time",
    salaryRange: null,
    employerName: "Acme Corp",
    matchScore: 85,
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-10"),
  };

  const validDetail = {
    ...baseRow,
    status: "active",
    hasApplied: false,
    applicationStatus: null,
    skillScore: 90,
    educationScore: 75,
    locationScore: 100,
    breakdown: ["Skill match: 90%", "Education match: 75%"],
  };

  it("accepts a valid full detail", () => {
    expect(candidateJobDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts hasApplied=true", () => {
    expect(
      candidateJobDetailSchema.safeParse({
        ...validDetail,
        hasApplied: true,
        applicationStatus: "applied",
      }).success,
    ).toBe(true);
  });

  it("accepts null scores", () => {
    expect(
      candidateJobDetailSchema.safeParse({
        ...validDetail,
        skillScore: null,
        educationScore: null,
        locationScore: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing hasApplied", () => {
    const { hasApplied: _, ...rest } = validDetail;
    expect(candidateJobDetailSchema.safeParse(rest).success).toBe(false);
  });
});

describe("applicationRowSchema", () => {
  const validApp = {
    applicationId: 42,
    jobListingId: 1,
    jobTitle: "Software Engineer",
    employerName: "Acme Corp",
    status: "applied",
    coverLetter: "I am interested",
    createdAt: new Date("2026-06-05"),
    updatedAt: new Date("2026-06-05"),
  };

  it("accepts a valid application row", () => {
    expect(applicationRowSchema.safeParse(validApp).success).toBe(true);
  });

  it("accepts null coverLetter", () => {
    expect(
      applicationRowSchema.safeParse({ ...validApp, coverLetter: null }).success,
    ).toBe(true);
  });

  it("rejects empty status", () => {
    expect(
      applicationRowSchema.safeParse({ ...validApp, status: "" }).success,
    ).toBe(false);
  });

  it("rejects missing jobTitle", () => {
    const { jobTitle: _, ...rest } = validApp;
    expect(applicationRowSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listCandidateJobsResultSchema", () => {
  it("accepts a valid result with empty jobs array", () => {
    const result = listCandidateJobsResultSchema.safeParse({
      success: true,
      jobs: [],
      total: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing jobs field", () => {
    const result = listCandidateJobsResultSchema.safeParse({
      success: true,
      total: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("applyToJobResultSchema", () => {
  it("accepts a valid apply result", () => {
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
      message: "Submitted",
    });
    expect(result.success).toBe(false);
  });
});

describe("listMyApplicationsResultSchema", () => {
  it("accepts a valid result with empty applications", () => {
    const result = listMyApplicationsResultSchema.safeParse({
      success: true,
      applications: [],
      total: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing applications", () => {
    const result = listMyApplicationsResultSchema.safeParse({
      success: true,
      total: 0,
    });
    expect(result.success).toBe(false);
  });
});
