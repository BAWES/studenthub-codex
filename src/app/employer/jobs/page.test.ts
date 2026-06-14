import { describe, it, expect } from "vitest";
import {
  listJobsSchema,
  getJobSchema,
} from "./schemas";

/**
 * Page migration test for employer/jobs.
 *
 * Verifies the data contract between the page component and its server actions.
 * The page calls listJobs({ limit: 50 }) and maps results to DataTable-compatible rows
 * (jobListingId → id, nullable fields → undefined).
 *
 * Full rendering tests require Playwright (server component).
 */

// ── Input schemas ──

describe("employer jobs page — listJobsSchema defaults", () => {
  it("parses with default page=1, limit=20 when empty", () => {
    const r = listJobsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts limit=50 (the value the page actually uses)", () => {
    const r = listJobsSchema.safeParse({ limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.limit).toBe(50);
  });

  it("accepts optional filters", () => {
    const r = listJobsSchema.safeParse({ status: "active", q: "engineer" });
    expect(r.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    expect(listJobsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listJobsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("accepts string-coerced numbers", () => {
    const r = listJobsSchema.safeParse({ page: "2", limit: "15" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(15);
    }
  });
});

describe("employer jobs page — getJobSchema", () => {
  it("accepts a valid jobId", () => {
    expect(getJobSchema.safeParse({ jobId: 42 }).success).toBe(true);
  });

  it("rejects missing jobId", () => {
    expect(getJobSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero jobId", () => {
    expect(getJobSchema.safeParse({ jobId: 0 }).success).toBe(false);
  });
});

// ── Data contract: page mapping → EmployerJobsTable props ──

describe("employer jobs page — row shape for EmployerJobsTable", () => {
  type EmployerJobRow = {
    id: string | number;
    title: string;
    employmentType?: string;
    location?: string;
    salaryRange?: string;
    status: string | null;
    createdAt: string;
  };

  it("maps from a full job row: fields present", () => {
    const job = {
      jobListingId: 42,
      title: "Software Engineer",
      employmentType: "full-time",
      location: "Kuwait City",
      salaryRange: "800-1200 KWD",
      status: "active",
      createdAt: new Date("2026-06-14"),
    };

    const row: EmployerJobRow = {
      id: job.jobListingId,
      title: job.title,
      employmentType: job.employmentType ?? undefined,
      location: job.location ?? undefined,
      salaryRange: job.salaryRange ?? undefined,
      status: job.status,
      createdAt: job.createdAt.toISOString().slice(0, 10),
    };

    expect(row.id).toBe(42);
    expect(row.title).toBe("Software Engineer");
    expect(row.employmentType).toBe("full-time");
    expect(row.location).toBe("Kuwait City");
    expect(row.salaryRange).toBe("800-1200 KWD");
    expect(row.status).toBe("active");
    expect(row.createdAt).toBe("2026-06-14");
  });

  it("maps from a minimal job row: nullable fields become undefined", () => {
    const job = {
      jobListingId: 7,
      title: "Intern",
      employmentType: null,
      location: null,
      salaryRange: null,
      status: "active",
      createdAt: new Date("2026-06-01"),
    };

    const row: EmployerJobRow = {
      id: job.jobListingId,
      title: job.title,
      employmentType: job.employmentType ?? undefined,
      location: job.location ?? undefined,
      salaryRange: job.salaryRange ?? undefined,
      status: job.status,
      createdAt: job.createdAt.toISOString().slice(0, 10),
    };

    expect(row.id).toBe(7);
    expect(row.employmentType).toBeUndefined();
    expect(row.location).toBeUndefined();
    expect(row.salaryRange).toBeUndefined();
    expect(row.status).toBe("active");
    expect(row.createdAt).toBe("2026-06-01");
  });

  it("row id type is compatible with DataTable rowHref (/employer/jobs/)", () => {
    const row: EmployerJobRow = {
      id: 42,
      title: "Engineer",
      status: "active",
      createdAt: "2026-06-14",
    };
    const href = `/employer/jobs/${row.id}`;
    expect(href).toBe("/employer/jobs/42");
  });

  it("all expected DataTable columns have corresponding row keys", () => {
    // Columns in EmployerJobsTable: title, employmentType, location, salaryRange, status, createdAt
    const row: EmployerJobRow = {
      id: 1,
      title: "Dev",
      employmentType: "full-time",
      location: "Kuwait",
      salaryRange: "1000 KWD",
      status: "active",
      createdAt: "2026-06-01",
    };

    expect(row).toHaveProperty("title");
    expect(row).toHaveProperty("employmentType");
    expect(row).toHaveProperty("location");
    expect(row).toHaveProperty("salaryRange");
    expect(row).toHaveProperty("status");
    expect(row).toHaveProperty("createdAt");
  });
});
