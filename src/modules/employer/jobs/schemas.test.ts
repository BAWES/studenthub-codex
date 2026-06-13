import { describe, it, expect } from "vitest";
import {
  jobRowSchema,
  listJobsResultSchema,
  getJobResultSchema,
  createJobResultSchema,
  updateJobResultSchema,
  deleteJobResultSchema,
} from "./schemas";

const validJobRow = () => ({
  jobListingId: 42,
  employerId: 7,
  title: "Software Engineer",
  description: "Build things",
  requirements: "3+ years",
  location: "Kuwait City",
  employmentType: "full-time",
  salaryRange: "800-1200 KWD",
  status: "active",
  createdAt: new Date("2026-01-15"),
  updatedAt: new Date("2026-06-10"),
});

const validJobRowMinimal = () => ({
  jobListingId: 1,
  employerId: 1,
  title: "Dev",
  description: "Do stuff",
  requirements: null,
  location: null,
  employmentType: null,
  salaryRange: null,
  status: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// ---------------------------------------------------------------------------
// jobRowSchema
// ---------------------------------------------------------------------------

describe("jobRowSchema", () => {
  it("accepts a full job row", () => {
    const r = jobRowSchema.safeParse(validJobRow());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal job row (nullable fields set to null)", () => {
    const r = jobRowSchema.safeParse(validJobRowMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = jobRowSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = jobRowSchema.safeParse({ ...validJobRow(), jobListingId: "not-a-number" });
    expect(r.success).toBe(false);
  });

  it("rejects missing title", () => {
    const r = jobRowSchema.safeParse({ ...validJobRow(), title: undefined });
    expect(r.success).toBe(false);
  });

  it("rejects non-date createdAt", () => {
    const r = jobRowSchema.safeParse({ ...validJobRow(), createdAt: "2026-01-15" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listJobsResultSchema
// ---------------------------------------------------------------------------

describe("listJobsResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listJobsResultSchema.safeParse({
      items: [validJobRow(), validJobRowMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty items array", () => {
    const r = listJobsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listJobsResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listJobsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listJobsResultSchema.safeParse({ items: [] });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getJobResultSchema
// ---------------------------------------------------------------------------

describe("getJobResultSchema", () => {
  it("accepts a valid job row", () => {
    const r = getJobResultSchema.safeParse(validJobRow());
    expect(r.success).toBe(true);
  });

  it("accepts null", () => {
    const r = getJobResultSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("rejects undefined", () => {
    const r = getJobResultSchema.safeParse(undefined);
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createJobResultSchema
// ---------------------------------------------------------------------------

describe("createJobResultSchema", () => {
  it("accepts a valid create result", () => {
    const r = createJobResultSchema.safeParse({ success: true, jobListingId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects missing jobListingId", () => {
    const r = createJobResultSchema.safeParse({ success: true });
    expect(r.success).toBe(false);
  });

  it("rejects success: false", () => {
    const r = createJobResultSchema.safeParse({ success: false, jobListingId: 42 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateJobResultSchema
// ---------------------------------------------------------------------------

describe("updateJobResultSchema", () => {
  it("accepts a valid update result", () => {
    const r = updateJobResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("rejects success: false", () => {
    const r = updateJobResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });

  it("does not throw on extra fields (Zod strips by default)", () => {
    const r = updateJobResultSchema.safeParse({ success: true, extra: "field" });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// deleteJobResultSchema
// ---------------------------------------------------------------------------

describe("deleteJobResultSchema", () => {
  it("accepts a valid delete result", () => {
    const r = deleteJobResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("rejects success: false", () => {
    const r = deleteJobResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });
});
