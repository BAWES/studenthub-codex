import { describe, it, expect } from "vitest";
import {
  workLogFeedbackItemSchema,
  listWorkLogFeedbackResultSchema,
  listWorkLogFeedbackSchema,
  getWorkLogFeedbackSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validFeedbackItem = () => ({
  cwlf_uuid: "uuid-abc-123",
  candidate_id: 42,
  store_id: 7,
  company_id: 99,
  date: new Date("2026-06-01"),
  candidate_working_hour_uuid: "wh-uuid-456",
  status: 1,
  note: "Good performance today",
  reason: "Met all targets",
  is_public: true,
  rating: true,
  created_by: "staff-uuid-abc",
  created_at: new Date("2026-06-01T10:00:00Z"),
  updated_at: new Date("2026-06-01T12:00:00Z"),
});

const nullableFeedbackItem = () => ({
  cwlf_uuid: "uuid-abc-123",
  candidate_id: 42,
  store_id: 7,
  company_id: 99,
  date: new Date("2026-06-01"),
  candidate_working_hour_uuid: null,
  status: null,
  note: null,
  reason: null,
  is_public: null,
  rating: null,
  created_by: null,
  created_at: null,
  updated_at: null,
});

// ---------------------------------------------------------------------------
// workLogFeedbackItemSchema (output)
// ---------------------------------------------------------------------------

describe("workLogFeedbackItemSchema", () => {
  it("accepts a fully populated feedback item", () => {
    const r = workLogFeedbackItemSchema.safeParse(validFeedbackItem());
    expect(r.success).toBe(true);
  });

  it("accepts a feedback item with nullable fields set to null", () => {
    const r = workLogFeedbackItemSchema.safeParse(nullableFeedbackItem());
    expect(r.success).toBe(true);
  });

  it("rejects missing required field 'cwlf_uuid'", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      cwlf_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'candidate_id'", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      candidate_id: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'store_id'", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      store_id: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'company_id'", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      company_id: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'date'", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      date: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string cwlf_uuid", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      cwlf_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number candidate_id", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      candidate_id: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-positive candidate_id", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      candidate_id: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer candidate_id", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      candidate_id: 1.5,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number store_id", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      store_id: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number company_id", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      company_id: "not-a-number",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-date for 'date'", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      date: "2026-06-01",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number status", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      status: "approved",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean is_public", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      is_public: "yes",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean rating", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      rating: 1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-date created_at", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      created_at: "not-a-date",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-date updated_at", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validFeedbackItem(),
      updated_at: "not-a-date",
    });
    expect(r.success).toBe(false);
  });

  it("rejects completely empty object", () => {
    const r = workLogFeedbackItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listWorkLogFeedbackResultSchema (output)
// ---------------------------------------------------------------------------

describe("listWorkLogFeedbackResultSchema", () => {
  const validResult = () => ({
    workLogFeedbacks: [validFeedbackItem(), nullableFeedbackItem()],
    total: 42,
    page: 1,
    limit: 20,
    totalPages: 3,
  });

  it("accepts a fully populated paginated result", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse(validResult());
    expect(r.success).toBe(true);
  });

  it("accepts an empty workLogFeedbacks array", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      workLogFeedbacks: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required field 'workLogFeedbacks'", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'total'", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      workLogFeedbacks: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'page'", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      workLogFeedbacks: [],
      total: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'limit'", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      workLogFeedbacks: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'totalPages'", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      workLogFeedbacks: [],
      total: 0,
      page: 1,
      limit: 20,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative total", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      ...validResult(),
      total: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      ...validResult(),
      page: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      ...validResult(),
      limit: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      ...validResult(),
      totalPages: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-array workLogFeedbacks", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      ...validResult(),
      workLogFeedbacks: "not-an-array",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer total", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      ...validResult(),
      total: 1.5,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      ...validResult(),
      page: 1.5,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      ...validResult(),
      limit: 1.5,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer totalPages", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      ...validResult(),
      totalPages: 1.5,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listWorkLogFeedbackSchema (input)
// ---------------------------------------------------------------------------

describe("listWorkLogFeedbackSchema", () => {
  it("accepts valid params with all fields", () => {
    const r = listWorkLogFeedbackSchema.safeParse({
      candidate_id: 42,
      status: 1,
      date_from: "2026-01-01",
      date_to: "2026-06-01",
      page: 1,
      limit: 20,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty object (defaults applied)", () => {
    const r = listWorkLogFeedbackSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts string-coercible candidate_id", () => {
    const r = listWorkLogFeedbackSchema.safeParse({
      candidate_id: "42",
    });
    expect(r.success).toBe(true);
  });

  it("accepts string-coercible status", () => {
    const r = listWorkLogFeedbackSchema.safeParse({
      status: "1",
    });
    expect(r.success).toBe(true);
  });

  it("accepts string-coercible page", () => {
    const r = listWorkLogFeedbackSchema.safeParse({
      page: "2",
    });
    expect(r.success).toBe(true);
  });

  it("accepts string-coercible limit", () => {
    const r = listWorkLogFeedbackSchema.safeParse({
      limit: "50",
    });
    expect(r.success).toBe(true);
  });

  it("rejects zero page", () => {
    const r = listWorkLogFeedbackSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative page", () => {
    const r = listWorkLogFeedbackSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listWorkLogFeedbackSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects limit above 100", () => {
    const r = listWorkLogFeedbackSchema.safeParse({ limit: 101 });
    expect(r.success).toBe(false);
  });

  it("rejects invalid date_from format", () => {
    const r = listWorkLogFeedbackSchema.safeParse({
      date_from: "01-01-2026",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid date_to format", () => {
    const r = listWorkLogFeedbackSchema.safeParse({
      date_to: "2026/01/01",
    });
    expect(r.success).toBe(false);
  });

  it("rejects status above max (2)", () => {
    const r = listWorkLogFeedbackSchema.safeParse({ status: 3 });
    expect(r.success).toBe(false);
  });

  it("rejects status below 0", () => {
    const r = listWorkLogFeedbackSchema.safeParse({ status: -1 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getWorkLogFeedbackSchema (input)
// ---------------------------------------------------------------------------

describe("getWorkLogFeedbackSchema", () => {
  it("accepts a valid UUID", () => {
    const r = getWorkLogFeedbackSchema.safeParse({
      uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const r = getWorkLogFeedbackSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects empty string uuid", () => {
    const r = getWorkLogFeedbackSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects non-string uuid", () => {
    const r = getWorkLogFeedbackSchema.safeParse({ uuid: 123 });
    expect(r.success).toBe(false);
  });
});
