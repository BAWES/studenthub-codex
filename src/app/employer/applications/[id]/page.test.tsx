import { describe, it, expect } from "vitest";
import {
  getApplicationDetailSchema,
  getApplicationDetailOutputSchema,
  employerApplicationDetailOutputSchema,
} from "./schemas";

/**
 * Page migration test for employer/applications/[id].
 *
 * Verifies the data contract between page and action.
 * The employer application detail page calls getApplicationDetail({ applicationId })
 * and renders the result.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("employer application detail page — data contract", () => {
  it("getApplicationDetailSchema accepts valid applicationId", () => {
    const r = getApplicationDetailSchema.safeParse({ applicationId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.applicationId).toBe(42);
    }
  });

  it("getApplicationDetailSchema coerces string applicationId to number", () => {
    const r = getApplicationDetailSchema.safeParse({ applicationId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.applicationId).toBe(42);
    }
  });

  it("getApplicationDetailSchema rejects missing applicationId", () => {
    const r = getApplicationDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getApplicationDetailSchema rejects zero applicationId", () => {
    const r = getApplicationDetailSchema.safeParse({ applicationId: 0 });
    expect(r.success).toBe(false);
  });

  it("getApplicationDetailSchema rejects negative applicationId", () => {
    const r = getApplicationDetailSchema.safeParse({ applicationId: -1 });
    expect(r.success).toBe(false);
  });

  it("employerApplicationDetailOutputSchema accepts a full application detail row", () => {
    const row = {
      applicationId: 1,
      jobListingId: 5,
      candidateId: 100,
      candidateName: "Ahmed Al-Sabah",
      jobTitle: "Software Engineer",
      status: "applied",
      coverLetter: "I am interested in this position.",
      notes: null,
      createdAt: new Date("2025-06-01"),
      updatedAt: new Date("2025-06-10"),
    };
    const r = employerApplicationDetailOutputSchema.safeParse(row);
    expect(r.success).toBe(true);
  });

  it("employerApplicationDetailOutputSchema accepts null candidateName", () => {
    const r = employerApplicationDetailOutputSchema.safeParse({
      applicationId: 1,
      jobListingId: 5,
      candidateId: 100,
      candidateName: null,
      jobTitle: "Engineer",
      status: "pending_review",
      coverLetter: null,
      notes: "Follow up next week",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("employerApplicationDetailOutputSchema rejects missing required fields", () => {
    const { jobTitle: _, ...partial } = {
      applicationId: 1,
      jobListingId: 5,
      candidateId: 100,
      candidateName: "Test",
      jobTitle: "Test Job",
      status: "applied",
      coverLetter: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const r = employerApplicationDetailOutputSchema.safeParse(partial);
    expect(r.success).toBe(false);
  });

  it("employerApplicationDetailOutputSchema rejects non-date createdAt", () => {
    const r = employerApplicationDetailOutputSchema.safeParse({
      applicationId: 1,
      jobListingId: 5,
      candidateId: 100,
      candidateName: "Test",
      jobTitle: "Job",
      status: "applied",
      coverLetter: null,
      notes: null,
      createdAt: "not-a-date",
      updatedAt: new Date(),
    });
    expect(r.success).toBe(false);
  });

  it("getApplicationDetailOutputSchema accepts a successful result with application", () => {
    const r = getApplicationDetailOutputSchema.safeParse({
      success: true,
      application: {
        applicationId: 1,
        jobListingId: 5,
        candidateId: 100,
        candidateName: "Fatima",
        jobTitle: "UX Designer",
        status: "shortlisted",
        coverLetter: "Portfolio attached",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    expect(r.success).toBe(true);
  });

  it("getApplicationDetailOutputSchema accepts null application (not found)", () => {
    const r = getApplicationDetailOutputSchema.safeParse({
      success: true,
      application: null,
    });
    expect(r.success).toBe(true);
  });

  it("getApplicationDetailOutputSchema rejects missing success field", () => {
    const r = getApplicationDetailOutputSchema.safeParse({
      application: null,
    });
    expect(r.success).toBe(false);
  });
});
