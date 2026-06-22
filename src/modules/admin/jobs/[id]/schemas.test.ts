import { describe, it, expect } from "vitest";
import {
  getJobSchema,
  jobDetailItemSchema,
  getJobResultSchema,
} from "./schemas";
import type { GetJobInput, JobDetailItem, GetJobResult } from "./schemas";

describe("admin jobs detail schemas", () => {
  describe("getJobSchema", () => {
    it("accepts valid job UUID", () => {
      const r = getJobSchema.safeParse({ jobUuid: "abc-123" });
      expect(r.success).toBe(true);
    });

    it("rejects empty job UUID", () => {
      const r = getJobSchema.safeParse({ jobUuid: "" });
      expect(r.success).toBe(false);
    });

    it("rejects missing jobUuid", () => {
      const r = getJobSchema.safeParse({});
      expect(r.success).toBe(false);
    });

    it("has correct typed input", () => {
      const input: GetJobInput = { jobUuid: "test-uuid" };
      const r = getJobSchema.safeParse(input);
      expect(r.success).toBe(true);
    });
  });

  describe("jobDetailItemSchema", () => {
    it("accepts a full job detail object", () => {
      const r = jobDetailItemSchema.safeParse({
        job_uuid: "abc-123",
        position: "Software Engineer",
        position_ar: "مهندس برمجيات",
        description: "Build things",
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
        area_uuid: "area-001",
        request_uuid: "req-001",
        created_at: new Date("2025-01-15"),
        updated_at: new Date("2025-06-01"),
        deleted_at: null,
      });
      expect(r.success).toBe(true);
    });

    it("accepts a job with all nullable fields as null", () => {
      const r = jobDetailItemSchema.safeParse({
        job_uuid: "abc-123",
        position: "Engineer",
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
        request_uuid: "req-001",
        created_at: null,
        updated_at: null,
        deleted_at: null,
      });
      expect(r.success).toBe(true);
    });

    it("rejects missing required fields", () => {
      const r = jobDetailItemSchema.safeParse({
        job_uuid: "abc-123",
        // missing position, request_uuid
      });
      expect(r.success).toBe(false);
    });

    it("has correct typed item", () => {
      const item: JobDetailItem = {
        job_uuid: "abc",
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
        request_uuid: "req",
        created_at: null,
        updated_at: null,
        deleted_at: null,
      };
      expect(item.job_uuid).toBe("abc");
    });
  });

  describe("getJobResultSchema", () => {
    it("accepts a result with a job", () => {
      const r = getJobResultSchema.safeParse({
        job: {
          job_uuid: "abc",
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
          request_uuid: "req",
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
      });
      expect(r.success).toBe(true);
    });

    it("accepts a result with null job (not found)", () => {
      const r = getJobResultSchema.safeParse({ job: null });
      expect(r.success).toBe(true);
    });

    it("has correct typed result", () => {
      const result: GetJobResult = { job: null };
      expect(result.job).toBeNull();
    });
  });
});
