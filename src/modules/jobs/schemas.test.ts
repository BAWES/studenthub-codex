import { describe, it, expect } from "vitest";
import {
  jobListItemSchema,
  jobDetailSchema,
  listJobsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validJobListItem = () => ({
  job_uuid: "550e8400-e29b-41d4-a716-446655440000",
  position: "Software Engineer",
  position_ar: "مهندس برمجيات",
  description: "Full-stack development role",
  hours_per_day: 8,
  days_per_week: true,
  status: true,
  area_uuid: "660e8400-e29b-41d4-a716-446655440001",
  request_uuid: "770e8400-e29b-41d4-a716-446655440002",
  created_at: "2026-06-14T00:00:00.000Z",
  updated_at: "2026-06-14T00:00:00.000Z",
});

const validJobListItemMinimal = () => ({
  job_uuid: "550e8400-e29b-41d4-a716-446655440000",
  position: "Intern",
  position_ar: null,
  description: null,
  hours_per_day: null,
  days_per_week: null,
  status: null,
  area_uuid: null,
  request_uuid: "770e8400-e29b-41d4-a716-446655440002",
  created_at: null,
  updated_at: null,
});

const validJobDetail = () => ({
  ...validJobListItem(),
  description_ar: "دور تطوير متكامل",
  compensation_type: "monthly",
  compensation_amount: "1500",
  compensation_description: "Monthly salary",
  compensation_description_ar: "راتب شهري",
  min_age: 18,
  max_age: 45,
  gender: true,
  available_from: "2026-07-01T00:00:00.000Z",
  available_to: "2026-12-31T00:00:00.000Z",
});

const validJobDetailMinimal = () => ({
  ...validJobListItemMinimal(),
  description_ar: null,
  compensation_type: null,
  compensation_amount: null,
  compensation_description: null,
  compensation_description_ar: null,
  min_age: null,
  max_age: null,
  gender: null,
  available_from: null,
  available_to: null,
});

// ---------------------------------------------------------------------------
// jobListItemSchema
// ---------------------------------------------------------------------------

describe("jobListItemSchema", () => {
  it("accepts a full job list item", () => {
    const r = jobListItemSchema.safeParse(validJobListItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal job list item (nullable fields set to null)", () => {
    const r = jobListItemSchema.safeParse(validJobListItemMinimal());
    expect(r.success).toBe(true);
  });

  it("accepts a Date object for created_at and updated_at", () => {
    const r = jobListItemSchema.safeParse({
      ...validJobListItem(),
      created_at: new Date("2026-06-14"),
      updated_at: new Date("2026-06-14"),
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = jobListItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = jobListItemSchema.safeParse({
      ...validJobListItem(),
      job_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing job_uuid", () => {
    const r = jobListItemSchema.safeParse({
      ...validJobListItem(),
      job_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing position", () => {
    const r = jobListItemSchema.safeParse({
      ...validJobListItem(),
      position: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string position when provided", () => {
    const r = jobListItemSchema.safeParse({
      ...validJobListItem(),
      position: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number hours_per_day when provided", () => {
    const r = jobListItemSchema.safeParse({
      ...validJobListItem(),
      hours_per_day: "eight",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean days_per_week when provided", () => {
    const r = jobListItemSchema.safeParse({
      ...validJobListItem(),
      days_per_week: "yes",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// jobDetailSchema
// ---------------------------------------------------------------------------

describe("jobDetailSchema", () => {
  it("accepts a full job detail item", () => {
    const r = jobDetailSchema.safeParse(validJobDetail());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal job detail item (nullable fields set to null)", () => {
    const r = jobDetailSchema.safeParse(validJobDetailMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields inherited from jobListItemSchema", () => {
    const r = jobDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string description_ar when provided", () => {
    const r = jobDetailSchema.safeParse({
      ...validJobDetail(),
      description_ar: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number min_age when provided", () => {
    const r = jobDetailSchema.safeParse({
      ...validJobDetail(),
      min_age: "eighteen",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean gender when provided", () => {
    const r = jobDetailSchema.safeParse({
      ...validJobDetail(),
      gender: "yes",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number max_age when provided", () => {
    const r = jobDetailSchema.safeParse({
      ...validJobDetail(),
      max_age: "forty-five",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string compensation_type when provided", () => {
    const r = jobDetailSchema.safeParse({
      ...validJobDetail(),
      compensation_type: 123,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listJobsResultSchema
// ---------------------------------------------------------------------------

describe("listJobsResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listJobsResultSchema.safeParse({
      jobs: [validJobListItem(), validJobListItemMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty jobs array", () => {
    const r = listJobsResultSchema.safeParse({
      jobs: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-number total", () => {
    const r = listJobsResultSchema.safeParse({
      jobs: [],
      total: "not-a-number",
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number page", () => {
    const r = listJobsResultSchema.safeParse({
      jobs: [],
      total: 0,
      page: "first",
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listJobsResultSchema.safeParse({ jobs: [] });
    expect(r.success).toBe(false);
  });

  it("rejects invalid job items in the array", () => {
    const r = listJobsResultSchema.safeParse({
      jobs: [{ job_uuid: 123 }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });
});
