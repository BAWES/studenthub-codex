import { describe, it, expect } from "vitest";
import {
  getJobSchema,
  getJobResultSchema,
  jobDetailItemSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Input schema: getJobSchema
// ---------------------------------------------------------------------------
describe("getJobSchema", () => {
  it("accepts a valid job UUID", () => {
    const result = getJobSchema.safeParse({ jobUuid: "abc-123-def" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobUuid).toBe("abc-123-def");
    }
  });

  it("rejects missing jobUuid", () => {
    const result = getJobSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty string jobUuid", () => {
    const result = getJobSchema.safeParse({ jobUuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: jobDetailItemSchema
// ---------------------------------------------------------------------------
describe("jobDetailItemSchema", () => {
  const validItem = {
    job_uuid: "abc-123",
    position: "Software Engineer",
    position_ar: null,
    description: "Build software solutions",
    description_ar: null,
    status: true,
    hours_per_day: 8,
    days_per_week: null,
    compensation_type: "salary",
    compensation_amount: "5000",
    compensation_description: null,
    compensation_description_ar: null,
    min_age: null,
    max_age: null,
    gender: null,
    available_from: null,
    available_to: null,
    area_uuid: null,
    request_uuid: "req-456",
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-06-01T12:00:00Z"),
    deleted_at: null,
  };

  it("accepts a valid job detail item", () => {
    expect(jobDetailItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null created_at", () => {
    expect(
      jobDetailItemSchema.safeParse({ ...validItem, created_at: null }).success,
    ).toBe(true);
  });

  it("accepts null status", () => {
    expect(
      jobDetailItemSchema.safeParse({ ...validItem, status: null }).success,
    ).toBe(true);
  });

  it("rejects missing job_uuid", () => {
    const { job_uuid: _, ...rest } = validItem;
    expect(jobDetailItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing position", () => {
    const { position: _, ...rest } = validItem;
    expect(jobDetailItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing request_uuid", () => {
    const { request_uuid: _, ...rest } = validItem;
    expect(jobDetailItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: getJobResultSchema
// ---------------------------------------------------------------------------
describe("getJobResultSchema", () => {
  it("accepts a valid result with job present", () => {
    const result = {
      job: {
        job_uuid: "xyz-789",
        position: "DevOps Engineer",
        position_ar: null,
        description: null,
        description_ar: null,
        status: true,
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
        request_uuid: "req-000",
        created_at: null,
        updated_at: null,
        deleted_at: null,
      },
    };
    const parsed = getJobResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts job null (not found)", () => {
    const result = { job: null };
    const parsed = getJobResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing job field", () => {
    expect(getJobResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid job data (missing required field)", () => {
    expect(
      getJobResultSchema.safeParse({
        job: { job_uuid: "abc", request_uuid: "req" },
      }).success,
    ).toBe(false);
  });
});
