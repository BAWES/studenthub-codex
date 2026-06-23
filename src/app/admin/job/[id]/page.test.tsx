import { describe, it, expect, vi } from "vitest";
import { getJobSchema, getJobResultSchema, jobDetailItemSchema } from "@/modules/admin/jobs/[id]/schemas";
import type { GetJobResult, JobDetailItem } from "@/modules/admin/jobs/[id]/schemas";

/**
 * Page migration test for admin/job/[id].
 *
 * Validates the data contract between the page and the server action.
 * Full rendering tests require jsdom environment (Playwright for E2E).
 */

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "admin" }),
}));

vi.mock("./actions", () => ({
  getJob: vi.fn(),
}));

describe("admin job detail page — data contract", () => {
  it("getJobSchema accepts valid job UUID", () => {
    const r = getJobSchema.safeParse({ jobUuid: "job_abc123" });
    expect(r.success).toBe(true);
  });

  it("getJobSchema rejects empty job UUID", () => {
    const r = getJobSchema.safeParse({ jobUuid: "" });
    expect(r.success).toBe(false);
  });

  it("getJobResultSchema accepts nullable result (not found)", () => {
    const r = getJobResultSchema.safeParse({ job: null });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.job).toBeNull();
    }
  });

  it("getJobResultSchema accepts a full job detail result", () => {
    const item: JobDetailItem = {
      job_uuid: "job_abc123",
      position: "Software Engineer",
      position_ar: null,
      description: "Build the admin platform",
      description_ar: null,
      status: true,
      hours_per_day: 8,
      days_per_week: true,
      compensation_type: "salary",
      compensation_amount: "5000",
      compensation_description: "Monthly",
      compensation_description_ar: null,
      min_age: 22,
      max_age: 45,
      gender: true,
      available_from: new Date("2025-01-01"),
      available_to: new Date("2025-12-31"),
      area_uuid: "area_001",
      request_uuid: "req_001",
      created_at: new Date("2025-01-15"),
      updated_at: new Date("2025-06-01"),
      deleted_at: null,
    };
    const r = getJobResultSchema.safeParse({ job: item });
    expect(r.success).toBe(true);
  });

  it("jobDetailItemSchema accepts a minimal job with null optionals", () => {
    const item: JobDetailItem = {
      job_uuid: "minimal",
      position: "Dev",
      position_ar: null,
      description: null,
      description_ar: null,
      status: null,
      hours_per_day: null,
      days_per_week: null,
      compensation_type: null,
      compensation_amount: null,
      compensation_description: null,
      compensation_description_ar: null,
      min_age: null,
      max_age: null,
      gender: null,
      available_from: null,
      available_to: null,
      area_uuid: null,
      request_uuid: "req-minimal",
      created_at: null,
      updated_at: null,
      deleted_at: null,
    };
    const r = jobDetailItemSchema.safeParse(item);
    expect(r.success).toBe(true);
  });

  it("jobDetailItemSchema rejects missing required fields", () => {
    const r = jobDetailItemSchema.safeParse({ job_uuid: "abc-123" });
    expect(r.success).toBe(false);
  });

  it("GetJobResult type is correctly shaped for null job", () => {
    const result: GetJobResult = { job: null };
    expect(result.job).toBeNull();
  });
});
