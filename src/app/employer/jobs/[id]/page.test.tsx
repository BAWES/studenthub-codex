import { describe, it, expect } from "vitest";
import {
  getJobSchema,
  getJobResultSchema,
  jobRowSchema,
} from "./schemas";

/**
 * Page migration test for employer/jobs/[id].
 *
 * Verifies the data contract between page and action.
 * The employer job detail page calls getJob({ jobId }) and renders
 * the result in JobEditForm.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("employer job detail page — data contract", () => {
  it("getJobSchema accepts valid jobId", () => {
    const r = getJobSchema.safeParse({ jobId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobId).toBe(42);
    }
  });

  it("getJobSchema coerces string jobId to number", () => {
    const r = getJobSchema.safeParse({ jobId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobId).toBe(42);
    }
  });

  it("getJobSchema rejects missing jobId", () => {
    const r = getJobSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getJobSchema rejects zero jobId", () => {
    const r = getJobSchema.safeParse({ jobId: 0 });
    expect(r.success).toBe(false);
  });

  it("getJobSchema rejects negative jobId", () => {
    const r = getJobSchema.safeParse({ jobId: -1 });
    expect(r.success).toBe(false);
  });

  it("getJobResultSchema accepts a full job row", () => {
    const jobRow = {
      jobListingId: 1,
      employerId: 5,
      title: "Software Engineer",
      description: "Full-stack developer needed",
      requirements: "5+ years experience",
      location: "Kuwait City",
      employmentType: "full-time",
      salaryRange: "1500-2500 KWD",
      status: "active",
      createdAt: new Date("2025-06-01"),
      updatedAt: new Date("2025-06-10"),
    };
    const r = getJobResultSchema.safeParse(jobRow);
    expect(r.success).toBe(true);
  });

  it("getJobResultSchema accepts null (job not found)", () => {
    const r = getJobResultSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("getJobResultSchema rejects empty object", () => {
    const r = getJobResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getJobResultSchema rejects missing required fields", () => {
    const { title: _, ...partial } = {
      jobListingId: 1,
      employerId: 5,
      title: "Engineer",
      description: "Desc",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const r = getJobResultSchema.safeParse(partial);
    expect(r.success).toBe(false);
  });

  it("jobRowSchema matches the props JobEditForm expects", () => {
    const row = {
      jobListingId: 1,
      employerId: 5,
      title: "Test Job",
      description: "Test description",
      requirements: null,
      location: null,
      employmentType: null,
      salaryRange: null,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(jobRowSchema.safeParse(row).success).toBe(true);
  });

  it("jobRowSchema rejects non-date createdAt", () => {
    const r = jobRowSchema.safeParse({
      jobListingId: 1,
      employerId: 1,
      title: "Job",
      description: "Desc",
      createdAt: "not-a-date",
      updatedAt: new Date(),
    });
    expect(r.success).toBe(false);
  });

  it("jobRowSchema accepts nullable optional fields", () => {
    const row = {
      jobListingId: 1,
      employerId: 1,
      title: "Job",
      description: "Desc",
      requirements: null,
      location: null,
      employmentType: null,
      salaryRange: null,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(jobRowSchema.safeParse(row).success).toBe(true);
  });
});
