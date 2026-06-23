import { describe, it, expect } from "vitest";
import {
  candidateJobRowSchema,
  candidateJobDetailSchema,
  applicationRowSchema,
  listJobsResultSchema,
  listApplicationsResultSchema,
  applyToJobResultSchema,
  getCandidateJobResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// candidateJobRowSchema
// ---------------------------------------------------------------------------

describe("candidateJobRowSchema", () => {
  const validRow = () => ({
    jobListingId: 1,
    title: "Software Engineer",
    description: "Full-stack role",
    requirements: "React, Node.js",
    location: "Kuwait City",
    employmentType: "full-time",
    salaryRange: "1000-1500 KWD",
    employerName: "Acme Corp",
    matchScore: 85.5,
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-10"),
  });

  it("accepts a valid job row", () => {
    const r = candidateJobRowSchema.safeParse(validRow());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const r = candidateJobRowSchema.safeParse({
      ...validRow(),
      requirements: null,
      location: null,
      employmentType: null,
      salaryRange: null,
      matchScore: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validRow();
    expect(candidateJobRowSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateJobDetailSchema (extended)
// ---------------------------------------------------------------------------

describe("candidateJobDetailSchema", () => {
  it("accepts a valid job detail", () => {
    const r = candidateJobDetailSchema.safeParse({
      jobListingId: 1, title: "Engineer", description: "Desc",
      requirements: null, location: null, employmentType: null,
      salaryRange: null, employerName: "Acme", matchScore: null,
      createdAt: new Date(), updatedAt: new Date(),
      status: "active", hasApplied: false,
      applicationStatus: "applied", skillScore: 80,
      educationScore: 70, locationScore: 90,
      breakdown: ["Skills match", "Education match"],
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-boolean hasApplied", () => {
    const r = candidateJobDetailSchema.safeParse({
      jobListingId: 1, title: "E", description: "D",
      requirements: null, location: null, employmentType: null,
      salaryRange: null, employerName: "A", matchScore: null,
      createdAt: new Date(), updatedAt: new Date(),
      hasApplied: "yes", breakdown: [],
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// applicationRowSchema
// ---------------------------------------------------------------------------

describe("applicationRowSchema", () => {
  it("accepts a valid application row", () => {
    const r = applicationRowSchema.safeParse({
      applicationId: 1, jobListingId: 10,
      jobTitle: "Engineer", employerName: "Acme",
      status: "applied", coverLetter: "Hi",
      createdAt: new Date(), updatedAt: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable coverLetter", () => {
    const r = applicationRowSchema.safeParse({
      applicationId: 1, jobListingId: 10,
      jobTitle: "E", employerName: "A",
      status: "applied", coverLetter: null,
      createdAt: new Date(), updatedAt: new Date(),
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listJobsResultSchema
// ---------------------------------------------------------------------------

describe("listJobsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listJobsResultSchema.safeParse({
      items: [], total: 0, page: 1, pageSize: 20,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative page", () => {
    const r = listJobsResultSchema.safeParse({ items: [], total: 0, page: 0, pageSize: 20 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listApplicationsResultSchema
// ---------------------------------------------------------------------------

describe("listApplicationsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listApplicationsResultSchema.safeParse({
      items: [], total: 0, page: 1, pageSize: 20,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// applyToJobResultSchema  (discriminatedUnion)
// ---------------------------------------------------------------------------

describe("applyToJobResultSchema", () => {
  it("accepts success with applicationId", () => {
    const r = applyToJobResultSchema.safeParse({ success: true, applicationId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects success without applicationId", () => {
    const r = applyToJobResultSchema.safeParse({ success: true });
    expect(r.success).toBe(false);
  });

  it("accepts failure with error", () => {
    const r = applyToJobResultSchema.safeParse({ success: false, error: "Failed" });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getCandidateJobResultSchema
// ---------------------------------------------------------------------------

describe("getCandidateJobResultSchema", () => {
  it("accepts valid result with job detail", () => {
    const r = getCandidateJobResultSchema.safeParse({
      job: {
        jobListingId: 1, title: "E", description: "D",
        requirements: null, location: null, employmentType: null,
        salaryRange: null, employerName: "A", matchScore: null,
        createdAt: new Date(), updatedAt: new Date(),
        status: null, hasApplied: false,
        applicationStatus: null, skillScore: null,
        educationScore: null, locationScore: null,
        breakdown: [],
      },
    });
    expect(r.success).toBe(true);
  });
});
