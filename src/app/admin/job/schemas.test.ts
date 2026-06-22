import { describe, it, expect } from "vitest";
import {
  listJobsSchema,
  jobItemSchema,
  listJobsResultSchema,
  jobActionResponseSchema,
} from "./schemas";
import type { JobItem, ListJobsResult } from "./schemas";

// ---------------------------------------------------------------------------
// listJobsSchema
// ---------------------------------------------------------------------------
describe("listJobsSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listJobsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listJobsSchema.safeParse({ page: 2, limit: 100 }).success,
    ).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listJobsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 200", () => {
    expect(listJobsSchema.safeParse({ limit: 201 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listJobsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// jobItemSchema
// ---------------------------------------------------------------------------
describe("jobItemSchema", () => {
  const validItem = {
    job_uuid: "job-123",
    story_uuid: "story-456",
    request_uuid: "req-789",
    area_uuid: null,
    position: "Software Engineer",
    position_ar: null,
    hours_per_day: 8,
    days_per_week: null,
    compensation_type: null,
    compensation_amount: null,
    min_age: null,
    max_age: null,
    gender: null,
    available_from: null,
    available_to: null,
    status: false,
    created_at: null,
    updated_at: null,
  };

  it("accepts a valid job item", () => {
    expect(jobItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null nullable fields", () => {
    expect(
      jobItemSchema.safeParse({
        ...validItem,
        hours_per_day: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing job_uuid", () => {
    const { job_uuid: _, ...rest } = validItem;
    expect(jobItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty position", () => {
    expect(
      jobItemSchema.safeParse({ ...validItem, position: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listJobsResultSchema (paginated)
// ---------------------------------------------------------------------------
describe("listJobsResultSchema", () => {
  const validResult = {
    jobs: [
      {
        job_uuid: "job-123",
        story_uuid: "story-456",
        request_uuid: "req-789",
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
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listJobsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty jobs array", () => {
    expect(
      listJobsResultSchema.safeParse({
        ...validResult,
        jobs: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing jobs", () => {
    const { jobs: _, ...rest } = validResult;
    expect(listJobsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listJobsResultSchema.safeParse({ ...validResult, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listJobsResultSchema.safeParse({ ...validResult, page: 0 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// jobActionResponseSchema
// ---------------------------------------------------------------------------
describe("jobActionResponseSchema", () => {
  it("accepts valid response", () => {
    expect(
      jobActionResponseSchema.safeParse({
        operation: "created",
        message: "Job created",
      }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(
      jobActionResponseSchema.safeParse({ message: "Done" }).success,
    ).toBe(false);
  });

  it("rejects empty operation", () => {
    expect(
      jobActionResponseSchema.safeParse({ operation: "", message: "Done" })
        .success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      jobActionResponseSchema.safeParse({ operation: "created" }).success,
    ).toBe(false);
  });
});
