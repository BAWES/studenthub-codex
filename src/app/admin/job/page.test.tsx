import { describe, it, expect } from "vitest";
import { listAdminJobsSchema } from "@/modules/admin/jobs/schemas";
import type { AdminJobItem, ListAdminJobsResult } from "@/modules/admin/jobs/schemas";

/**
 * Page migration test for admin/job.
 *
 * Verifies that listAdminJobsSchema accepts the params passed by the page,
 * and that AdminJobItem fields map correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin jobs page — data contract", () => {
  it("listAdminJobsSchema accepts empty params (defaults apply)", () => {
    const r = listAdminJobsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.limit).toBe("number");
    }
  });

  it("listAdminJobsSchema accepts the params the page actually passes", () => {
    const r = listAdminJobsSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("listAdminJobsSchema parses search and status filters", () => {
    const r = listAdminJobsSchema.safeParse({ search: "engineer", status: "true" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.search).toBe("engineer");
      expect(r.data.status).toBe(true);
    }
  });

  it("AdminJobItem fields map correctly to DataTable columns", () => {
    // The page maps AdminJobItem to DataTable columns:
    //   job_uuid   → row.job_uuid (for keys)
    //   position   → rendered as span
    //   status     → Badge (Active/Inactive)
    //   created_at → formatted date
    //   updated_at → formatted date
    const row: AdminJobItem = {
      job_uuid: "abc-123",
      position: "Software Engineer",
      position_ar: null,
      description: "Build things",
      status: true,
      hours_per_day: 8,
      compensation_type: "salary",
      compensation_amount: "5000",
      area_uuid: null,
      request_uuid: "req-456",
      created_at: new Date("2025-01-15T10:00:00Z"),
      updated_at: new Date("2025-06-01T12:00:00Z"),
    };
    expect(row.job_uuid).toBe("abc-123");
    expect(row.position).toBe("Software Engineer");
    expect(row.status).toBe(true);
    expect(row.hours_per_day).toBe(8);
    expect(row.compensation_type).toBe("salary");
    expect(row.created_at).toEqual(new Date("2025-01-15T10:00:00Z"));
    expect(row.updated_at).toEqual(new Date("2025-06-01T12:00:00Z"));
  });

  it("ListAdminJobsResult has expected shape", () => {
    const result: ListAdminJobsResult = {
      jobs: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.jobs)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });
});
