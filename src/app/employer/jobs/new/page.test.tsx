import { describe, it, expect } from "vitest";
import {
  createJobSchema,
  createJobResultSchema,
} from "./schemas";

/**
 * Page migration test for employer/jobs/new.
 *
 * Verifies the data contract between page and action.
 * The employer job new page calls createJob with form data
 * and displays the result.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("employer job new page — data contract", () => {
  it("createJobSchema accepts valid input with all required fields", () => {
    const r = createJobSchema.safeParse({
      employerId: 1,
      title: "Software Engineer",
      description: "Full-stack developer needed",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe("active"); // default
    }
  });

  it("createJobSchema accepts optional fields", () => {
    const r = createJobSchema.safeParse({
      employerId: 1,
      title: "Engineer",
      description: "Desc",
      requirements: "5+ years",
      location: "Kuwait",
      employmentType: "full-time",
      salaryRange: "1500 KWD",
      status: "draft",
    });
    expect(r.success).toBe(true);
  });

  it("createJobSchema coerces string employerId to number", () => {
    const r = createJobSchema.safeParse({
      employerId: "1",
      title: "Engineer",
      description: "Desc",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.employerId).toBe("number");
    }
  });

  it("createJobSchema rejects missing employerId", () => {
    const r = createJobSchema.safeParse({
      title: "Engineer",
      description: "Desc",
    });
    expect(r.success).toBe(false);
  });

  it("createJobSchema rejects missing title", () => {
    const r = createJobSchema.safeParse({
      employerId: 1,
      description: "Desc",
    });
    expect(r.success).toBe(false);
  });

  it("createJobSchema rejects missing description", () => {
    const r = createJobSchema.safeParse({
      employerId: 1,
      title: "Engineer",
    });
    expect(r.success).toBe(false);
  });

  it("createJobSchema rejects empty title", () => {
    const r = createJobSchema.safeParse({
      employerId: 1,
      title: "",
      description: "Desc",
    });
    expect(r.success).toBe(false);
  });

  it("createJobSchema rejects empty description", () => {
    const r = createJobSchema.safeParse({
      employerId: 1,
      title: "Engineer",
      description: "",
    });
    expect(r.success).toBe(false);
  });

  it("createJobSchema rejects title exceeding 255 chars", () => {
    const r = createJobSchema.safeParse({
      employerId: 1,
      title: "x".repeat(256),
      description: "Desc",
    });
    expect(r.success).toBe(false);
  });

  it("createJobSchema rejects zero employerId", () => {
    const r = createJobSchema.safeParse({
      employerId: 0,
      title: "Engineer",
      description: "Desc",
    });
    expect(r.success).toBe(false);
  });

  it("createJobResultSchema accepts success result", () => {
    const r = createJobResultSchema.safeParse({
      success: true,
      jobListingId: 42,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(42);
    }
  });

  it("createJobResultSchema rejects missing jobListingId", () => {
    const r = createJobResultSchema.safeParse({ success: true });
    expect(r.success).toBe(false);
  });

  it("createJobResultSchema rejects non-positive jobListingId", () => {
    const r = createJobResultSchema.safeParse({
      success: true,
      jobListingId: 0,
    });
    expect(r.success).toBe(false);
  });

  it("createJobResultSchema rejects non-boolean success", () => {
    const r = createJobResultSchema.safeParse({
      success: "true",
      jobListingId: 42,
    });
    expect(r.success).toBe(false);
  });

  it("form fields match the props JobNewForm expects", () => {
    const formData = {
      employerId: 1,
      title: "Engineer",
      description: "Full-stack developer",
      requirements: "Python, React",
      location: "Remote",
      employmentType: "contract",
      salaryRange: "2000 KWD",
      status: "active",
    };
    expect(createJobSchema.safeParse(formData).success).toBe(true);
  });
});
