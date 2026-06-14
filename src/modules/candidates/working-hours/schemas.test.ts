import { describe, it, expect } from "vitest";
import {
  candidateWorkingHourItemSchema,
  listCandidateWorkingHoursResultSchema,
  workLogFeedbackItemSchema,
  listWorkLogFeedbackResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// candidateWorkingHourItemSchema
// ---------------------------------------------------------------------------

describe("candidateWorkingHourItemSchema", () => {
  const validItem = () => ({
    candidate_working_hour_uuid: "wh-001",
    candidate_id: 123,
    store_id: 5,
    date: "2026-06-15",
    start_time: "08:00",
    end_time: "17:00",
    total_time: 540,
    status: 1,
    via: "mobile",
    note: "Regular shift",
    start_location_lat: 29.3759,
    start_location_long: 47.9774,
    end_location_lat: null,
    end_location_long: null,
    created_at: "2026-06-15T08:00:00Z",
    updated_at: null,
  });

  it("accepts a valid working hour item", () => {
    const r = candidateWorkingHourItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts all-null optional fields", () => {
    const r = candidateWorkingHourItemSchema.safeParse({
      ...validItem(),
      candidate_id: null, store_id: null, date: null,
      start_time: null, end_time: null, total_time: null,
      status: null, via: null, note: null,
      start_location_lat: null, start_location_long: null,
      end_location_lat: null, end_location_long: null,
      created_at: null, updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing candidate_working_hour_uuid", () => {
    const { candidate_working_hour_uuid: _, ...rest } = validItem();
    expect(candidateWorkingHourItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateWorkingHoursResultSchema
// ---------------------------------------------------------------------------

describe("listCandidateWorkingHoursResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listCandidateWorkingHoursResultSchema.safeParse({
      items: [{
        candidate_working_hour_uuid: "w-1",
        candidate_id: null, store_id: null, date: null,
        start_time: null, end_time: null, total_time: null,
        status: null, via: null, note: null,
        start_location_lat: null, start_location_long: null,
        end_location_lat: null, end_location_long: null,
        created_at: null, updated_at: null,
      }],
      total: 1, page: 1, limit: 20, totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = listCandidateWorkingHoursResultSchema.safeParse({
      items: [], total: 0, page: 1, limit: 20, totalPages: 0,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// workLogFeedbackItemSchema
// ---------------------------------------------------------------------------

describe("workLogFeedbackItemSchema", () => {
  const validItem = () => ({
    cwlf_uuid: "fb-001",
    candidate_id: 123,
    store_id: 5,
    company_id: 3,
    date: new Date("2026-06-15"),
    candidate_working_hour_uuid: "wh-001",
    status: 1,
    note: "Good performance",
    reason: null,
    is_public: true,
    rating: true,
    created_by: "Staff User",
    created_at: new Date("2026-06-15T10:00:00Z"),
    updated_at: null,
  });

  it("accepts a valid feedback item", () => {
    const r = workLogFeedbackItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = workLogFeedbackItemSchema.safeParse({
      ...validItem(),
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
    expect(r.success).toBe(true);
  });

  it("rejects missing cwlf_uuid", () => {
    const { cwlf_uuid: _, ...rest } = validItem();
    expect(workLogFeedbackItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listWorkLogFeedbackResultSchema
// ---------------------------------------------------------------------------

describe("listWorkLogFeedbackResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      workLogFeedbacks: [{
        cwlf_uuid: "f-1", candidate_id: 1, store_id: 1, company_id: 1,
        date: new Date(), candidate_working_hour_uuid: null,
        status: null, note: null, reason: null,
        is_public: null, rating: null, created_by: null,
        created_at: null, updated_at: null,
      }],
      total: 1, page: 1, limit: 20, totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty feedback array", () => {
    const r = listWorkLogFeedbackResultSchema.safeParse({
      workLogFeedbacks: [], total: 0, page: 1, limit: 20, totalPages: 0,
    });
    expect(r.success).toBe(true);
  });
});
