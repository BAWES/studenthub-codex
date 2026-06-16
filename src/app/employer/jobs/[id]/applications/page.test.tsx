import { describe, it, expect } from "vitest";
import {
  listJobApplicationsSchema,
  jobApplicationListOutputSchema,
  jobApplicationRowOutputSchema,
} from "./schemas";

/**
 * Page migration test for employer/jobs/[id]/applications.
 *
 * Verifies the data contract between page and action.
 * The employer job applications page calls listJobApplications({ jobListingId, limit: 100 })
 * and renders the result in EmployerApplicationsTable.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("employer job applications page — data contract", () => {
  // -- listJobApplicationsSchema -------------------------------------------

  it("listJobApplicationsSchema accepts valid jobListingId with defaults", () => {
    const r = listJobApplicationsSchema.safeParse({ jobListingId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(42);
      expect(r.data.limit).toBe(20); // default
      expect(r.data.page).toBe(1); // default
    }
  });

  it("listJobApplicationsSchema coerces string jobListingId to number", () => {
    const r = listJobApplicationsSchema.safeParse({ jobListingId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(42);
    }
  });

  it("listJobApplicationsSchema accepts custom limit (page usage)", () => {
    const r = listJobApplicationsSchema.safeParse({ jobListingId: 42, limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("listJobApplicationsSchema rejects missing jobListingId", () => {
    const r = listJobApplicationsSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("listJobApplicationsSchema rejects zero jobListingId", () => {
    const r = listJobApplicationsSchema.safeParse({ jobListingId: 0 });
    expect(r.success).toBe(false);
  });

  it("listJobApplicationsSchema rejects negative jobListingId", () => {
    const r = listJobApplicationsSchema.safeParse({ jobListingId: -1 });
    expect(r.success).toBe(false);
  });

  it("listJobApplicationsSchema rejects limit over 100", () => {
    const r = listJobApplicationsSchema.safeParse({ jobListingId: 1, limit: 200 });
    expect(r.success).toBe(false);
  });

  // -- jobApplicationRowOutputSchema ---------------------------------------

  it("jobApplicationRowOutputSchema accepts a valid application row", () => {
    const r = jobApplicationRowOutputSchema.safeParse({
      applicationId: 1,
      candidateId: 100,
      candidateName: "Ahmed Al-Sabah",
      status: "applied",
      coverLetter: "I am interested in this role.",
      createdAt: new Date("2025-06-01"),
      updatedAt: new Date("2025-06-10"),
    });
    expect(r.success).toBe(true);
  });

  it("jobApplicationRowOutputSchema accepts null candidateName and coverLetter", () => {
    const r = jobApplicationRowOutputSchema.safeParse({
      applicationId: 1,
      candidateId: 100,
      candidateName: null,
      status: "pending_review",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("jobApplicationRowOutputSchema rejects missing required fields", () => {
    const { applicationId: _, ...partial } = {
      applicationId: 1,
      candidateId: 100,
      candidateName: "Test",
      status: "applied",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const r = jobApplicationRowOutputSchema.safeParse(partial);
    expect(r.success).toBe(false);
  });

  it("jobApplicationRowOutputSchema rejects non-date createdAt", () => {
    const r = jobApplicationRowOutputSchema.safeParse({
      applicationId: 1,
      candidateId: 100,
      candidateName: "Test",
      status: "applied",
      coverLetter: null,
      createdAt: "not-a-date",
      updatedAt: new Date(),
    });
    expect(r.success).toBe(false);
  });

  // -- jobApplicationListOutputSchema ---------------------------------------

  it("jobApplicationListOutputSchema accepts a successful list result", () => {
    const r = jobApplicationListOutputSchema.safeParse({
      success: true,
      applications: [
        {
          applicationId: 1,
          candidateId: 100,
          candidateName: "Fatima",
          status: "shortlisted",
          coverLetter: "Portfolio attached",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
    });
    expect(r.success).toBe(true);
  });

  it("jobApplicationListOutputSchema accepts empty applications array", () => {
    const r = jobApplicationListOutputSchema.safeParse({
      success: true,
      applications: [],
      total: 0,
    });
    expect(r.success).toBe(true);
  });

  it("jobApplicationListOutputSchema rejects missing total", () => {
    const r = jobApplicationListOutputSchema.safeParse({
      success: true,
      applications: [],
    });
    expect(r.success).toBe(false);
  });

  it("jobApplicationListOutputSchema rejects negative total", () => {
    const r = jobApplicationListOutputSchema.safeParse({
      success: true,
      applications: [],
      total: -1,
    });
    expect(r.success).toBe(false);
  });
});
