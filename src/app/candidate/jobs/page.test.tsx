import { describe, it, expect } from "vitest";
import {
  candidateJobRowSchema,
  candidateJobDetailSchema,
  applicationRowSchema,
  listCandidateJobsResultSchema,
  getCandidateJobResultSchema,
  applyToJobResultSchema,
  listMyApplicationsResultSchema,
} from "./schemas";

describe("candidate jobs page — data contract", () => {
  const validRow = {
    jobListingId: 1, title: "Engineer", description: "Build things",
    requirements: "BS CS", location: "Kuwait", employmentType: "Full-time",
    salaryRange: "2000 KWD", employerName: "Tech Corp", matchScore: 85,
    createdAt: new Date(), updatedAt: new Date(),
  };

  it("candidateJobRowSchema validates a valid job row", () => {
    const r = candidateJobRowSchema.safeParse(validRow);
    expect(r.success).toBe(true);
  });

  it("candidateJobRowSchema rejects missing title", () => {
    const r = candidateJobRowSchema.safeParse({ jobListingId: 1, description: "desc", employerName: "Co", createdAt: new Date(), updatedAt: new Date() });
    expect(r.success).toBe(false);
  });

  it("candidateJobDetailSchema extends job row", () => {
    const r = candidateJobDetailSchema.safeParse({
      ...validRow,
      status: "active", hasApplied: false, applicationStatus: null,
      skillScore: 90, educationScore: 80, locationScore: 70,
      breakdown: ["skill", "education"],
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe("active");
  });

  it("applicationRowSchema validates an application row", () => {
    const r = applicationRowSchema.safeParse({
      applicationId: 1, jobListingId: 1, jobTitle: "Engineer",
      employerName: "Co", status: "pending", coverLetter: null,
      createdAt: new Date(), updatedAt: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("listCandidateJobsResultSchema validates result", () => {
    const r = listCandidateJobsResultSchema.safeParse({ success: true, jobs: [validRow], total: 1 });
    expect(r.success).toBe(true);
  });

  it("getCandidateJobResultSchema validates detail result", () => {
    const r = getCandidateJobResultSchema.safeParse({
      success: true,
      job: { ...validRow, status: "active", hasApplied: true, applicationStatus: "pending",
             skillScore: null, educationScore: null, locationScore: null, breakdown: [] },
    });
    expect(r.success).toBe(true);
  });

  it("applyToJobResultSchema validates apply result", () => {
    const r = applyToJobResultSchema.safeParse({ success: true, applicationId: 5, message: "Applied" });
    expect(r.success).toBe(true);
  });

  it("listMyApplicationsResultSchema validates applications list", () => {
    const r = listMyApplicationsResultSchema.safeParse({
      success: true,
      applications: [{ applicationId: 1, jobListingId: 1, jobTitle: "E", employerName: "C", status: "p", coverLetter: null, createdAt: new Date(), updatedAt: new Date() }],
      total: 1,
    });
    expect(r.success).toBe(true);
  });
});
