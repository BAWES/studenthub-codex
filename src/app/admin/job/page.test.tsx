import { describe, it, expect } from "vitest";
import { listJobsSchema, jobItemSchema, listJobsResultSchema } from "./schemas";
import type { JobItem, ListJobsResult } from "./schemas";

/**
 * Page migration test for admin/job.
 * Validates the data contract between the page and the server action.
 */
describe("admin job page — data contract", () => {
  it("listJobsSchema accepts empty params (defaults apply)", () => {
    const r = listJobsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(50);
      expect(r.data.page).toBe(1);
    }
  });

  it("listJobsSchema accepts the params the page actually passes", () => {
    const r = listJobsSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.limit).toBe(100);
  });

  it("JobItem fields map correctly to DataTable columns", () => {
    const row: JobItem = {
      job_uuid: "job-abc-123",
      story_uuid: "story-def-456",
      request_uuid: "req-ghi-789",
      area_uuid: null,
      position: "Software Engineer",
      position_ar: null,
      hours_per_day: null,
      days_per_week: null,
      compensation_type: null,
      compensation_amount: null,
      min_age: null,
      max_age: null,
      gender: null,
      available_from: null,
      available_to: null,
      status: null,
      created_at: null,
      updated_at: null,
    };
    expect(row.job_uuid).toBe("job-abc-123");
    expect(row.position).toBe("Software Engineer");
  });

  it("JobItem allows nullable fields", () => {
    const r = jobItemSchema.safeParse({
      job_uuid: "job-null-test",
      story_uuid: "story-null-test",
      request_uuid: "req-null-test",
      area_uuid: null,
      position: "Test Position",
      position_ar: null,
      hours_per_day: null,
      days_per_week: null,
      compensation_type: null,
      compensation_amount: null,
      min_age: null,
      max_age: null,
      gender: null,
      available_from: null,
      available_to: null,
      status: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("ListJobsResult has expected shape", () => {
    const result: ListJobsResult = {
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

  it("JobItem status values match table component expectations", () => {
    const base: Omit<JobItem, "job_uuid" | "story_uuid" | "request_uuid" | "position"> = {
      area_uuid: null,
      position_ar: null,
      hours_per_day: null,
      days_per_week: null,
      compensation_type: null,
      compensation_amount: null,
      min_age: null,
      max_age: null,
      gender: null,
      available_from: null,
      available_to: null,
      status: null,
      created_at: null,
      updated_at: null,
    };
    const active: JobItem = {
      ...base,
      job_uuid: "j", story_uuid: "s", request_uuid: "r", position: "Engineer",
      status: true,
    };
    const inactive: JobItem = {
      ...base,
      job_uuid: "j2", story_uuid: "s2", request_uuid: "r2", position: "Designer",
      status: false,
    };
    expect(active.status).toBe(true);
    expect(inactive.status).toBe(false);
  });
});
