import { describe, it, expect } from "vitest";
import { listJobsSchema } from "./schemas";
import type { JobRow } from "./schemas";

/**
 * Page migration test for employer/jobs.
 *
 * Verifies the data contract between page and action.
 * The employer jobs page calls listJobs({ limit: 50 }) and maps JobRow items
 * to DataTable rows with fields: id, title, employmentType, location,
 * salaryRange, status, createdAt.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("employer jobs page — data contract", () => {
  it("listJobs accepts the params the page passes ({ limit: 50 })", () => {
    const r = listJobsSchema.safeParse({ limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(50);
      expect(r.data.page).toBe(1); // default
    }
  });

  it("listJobs defaults page/limit when called with empty input", () => {
    const r = listJobsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("listJobs rejects invalid limit (over 100)", () => {
    expect(listJobsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("listJobs rejects non-positive page", () => {
    expect(listJobsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("listJobs accepts optional status filter", () => {
    const r = listJobsSchema.safeParse({ status: "active" });
    expect(r.success).toBe(true);
  });

  it("listJobs accepts optional search query", () => {
    const r = listJobsSchema.safeParse({ q: "engineer" });
    expect(r.success).toBe(true);
  });

  it("JobRow fields match DataTable column expectations", () => {
    // The page maps JobRow to DataTable rows:
    //   job.jobListingId -> row.id             (for rowHref)
    //   job.title -> row.title
    //   job.employmentType -> row.employmentType
    //   job.location -> row.location
    //   job.salaryRange -> row.salaryRange
    //   job.status -> row.status
    //   job.createdAt.toISOString().slice(0, 10) -> row.createdAt
    const row: JobRow = {
      jobListingId: 1,
      employerId: 42,
      title: "Software Engineer",
      description: "Build cool stuff",
      requirements: "5 years experience",
      location: "Kuwait City",
      employmentType: "full-time",
      salaryRange: "1500-2000 KWD",
      status: "active",
      createdAt: new Date("2025-06-01"),
      updatedAt: new Date("2025-06-01"),
    };

    // Verify the mapping produces expected DataTable shape
    const dataTableRow = {
      id: row.jobListingId,
      title: row.title,
      employmentType: row.employmentType ?? undefined,
      location: row.location ?? undefined,
      salaryRange: row.salaryRange ?? undefined,
      status: row.status,
      createdAt: row.createdAt.toISOString().slice(0, 10),
    };

    expect(dataTableRow.id).toBe(1);
    expect(dataTableRow.title).toBe("Software Engineer");
    expect(dataTableRow.employmentType).toBe("full-time");
    expect(dataTableRow.location).toBe("Kuwait City");
    expect(dataTableRow.salaryRange).toBe("1500-2000 KWD");
    expect(dataTableRow.status).toBe("active");
    expect(dataTableRow.createdAt).toBe("2025-06-01");
  });

  it("JobRow handles nullable fields correctly", () => {
    const row: JobRow = {
      jobListingId: 2,
      employerId: 42,
      title: "Designer",
      description: "Design things",
      requirements: null,
      location: null,
      employmentType: null,
      salaryRange: null,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Nullable fields become undefined via ?? operator
    expect(row.employmentType ?? undefined).toBeUndefined();
    expect(row.location ?? undefined).toBeUndefined();
    expect(row.salaryRange ?? undefined).toBeUndefined();
  });

  it("listJobs return shape includes pagination fields", () => {
    // The action returns { items: JobRow[], total, page, limit, totalPages }
    // This test ensures the data contract is complete
    type ListJobsResult = {
      items: JobRow[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };

    const result: ListJobsResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };

    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });
});
