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
  const validItem = {
    candidate_working_hour_uuid: "550e8400-e29b-41d4-a716-446655440000",
    candidate_id: 42,
    store_id: 7,
    date: "2026-06-14",
    start_time: "09:00:00",
    end_time: "17:00:00",
    total_time: 8,
    status: 1,
    via: "app",
    note: "On time",
    start_location_lat: 51.5074,
    start_location_long: -0.1278,
    end_location_lat: 51.5074,
    end_location_long: -0.1278,
    created_at: "2026-06-14T09:00:00Z",
    updated_at: "2026-06-14T17:00:00Z",
  };

  it("accepts a valid item", () => {
    expect(candidateWorkingHourItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null for all nullable fields", () => {
    const nullItem = {
      candidate_working_hour_uuid: "550e8400-e29b-41d4-a716-446655440000",
      candidate_id: null,
      store_id: null,
      date: null,
      start_time: null,
      end_time: null,
      total_time: null,
      status: null,
      via: null,
      note: null,
      start_location_lat: null,
      start_location_long: null,
      end_location_lat: null,
      end_location_long: null,
      created_at: null,
      updated_at: null,
    };
    expect(candidateWorkingHourItemSchema.safeParse(nullItem).success).toBe(true);
  });

  it("rejects missing candidate_working_hour_uuid", () => {
    const { candidate_working_hour_uuid: _, ...rest } = validItem;
    expect(candidateWorkingHourItemSchema.safeParse(rest).success).toBe(false);
  });

  it("accepts empty candidate_working_hour_uuid (z.string() allows empty)", () => {
    expect(
      candidateWorkingHourItemSchema.safeParse({ ...validItem, candidate_working_hour_uuid: "" })
        .success,
    ).toBe(true);
  });

  it("rejects wrong type for candidate_id", () => {
    expect(
      candidateWorkingHourItemSchema.safeParse({ ...validItem, candidate_id: "not-a-number" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for total_time", () => {
    expect(
      candidateWorkingHourItemSchema.safeParse({ ...validItem, total_time: "eight" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for start_location_lat", () => {
    expect(
      candidateWorkingHourItemSchema.safeParse({ ...validItem, start_location_lat: "invalid" }).success,
    ).toBe(false);
  });

  it("rejects missing required string field", () => {
    const { candidate_working_hour_uuid: _, ...rest } = validItem;
    expect(candidateWorkingHourItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateWorkingHoursResultSchema
// ---------------------------------------------------------------------------
describe("listCandidateWorkingHoursResultSchema", () => {
  const validItem = {
    candidate_working_hour_uuid: "550e8400-e29b-41d4-a716-446655440000",
    candidate_id: 42,
    store_id: 7,
    date: "2026-06-14",
    start_time: "09:00:00",
    end_time: "17:00:00",
    total_time: 8,
    status: 1,
    via: "app",
    note: "On time",
    start_location_lat: 51.5074,
    start_location_long: -0.1278,
    end_location_lat: 51.5074,
    end_location_long: -0.1278,
    created_at: "2026-06-14T09:00:00Z",
    updated_at: "2026-06-14T17:00:00Z",
  };

  const validResult = {
    items: [validItem],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result with items", () => {
    expect(listCandidateWorkingHoursResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listCandidateWorkingHoursResultSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts zero total and totalPages", () => {
    expect(
      listCandidateWorkingHoursResultSchema.safeParse({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listCandidateWorkingHoursResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validResult;
    expect(listCandidateWorkingHoursResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validResult;
    expect(listCandidateWorkingHoursResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = validResult;
    expect(listCandidateWorkingHoursResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const { totalPages: _, ...rest } = validResult;
    expect(listCandidateWorkingHoursResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for items", () => {
    expect(
      listCandidateWorkingHoursResultSchema.safeParse({ ...validResult, items: "not-an-array" }).success,
    ).toBe(false);
  });

  it("rejects invalid item in items array", () => {
    expect(
      listCandidateWorkingHoursResultSchema.safeParse({
        ...validResult,
        items: [{ candidate_working_hour_uuid: "" }],
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for total", () => {
    expect(
      listCandidateWorkingHoursResultSchema.safeParse({ ...validResult, total: "one" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for page", () => {
    expect(
      listCandidateWorkingHoursResultSchema.safeParse({ ...validResult, page: "first" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for limit", () => {
    expect(
      listCandidateWorkingHoursResultSchema.safeParse({ ...validResult, limit: "twenty" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for totalPages", () => {
    expect(
      listCandidateWorkingHoursResultSchema.safeParse({ ...validResult, totalPages: "one" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// workLogFeedbackItemSchema
// ---------------------------------------------------------------------------
describe("workLogFeedbackItemSchema", () => {
  const validItem = {
    cwlf_uuid: "550e8400-e29b-41d4-a716-446655440000",
    candidate_id: 42,
    store_id: 7,
    company_id: 1,
    date: new Date("2026-06-14"),
    candidate_working_hour_uuid: "550e8400-e29b-41d4-a716-446655440000",
    status: 1,
    note: "Good work",
    reason: "Completed on time",
    is_public: true,
    rating: true,
    created_by: "Manager A",
    created_at: new Date("2026-06-14T09:00:00Z"),
    updated_at: new Date("2026-06-14T17:00:00Z"),
  };

  it("accepts a valid item", () => {
    expect(workLogFeedbackItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null for all nullable fields", () => {
    const nullItem = {
      cwlf_uuid: "550e8400-e29b-41d4-a716-446655440000",
      candidate_id: 42,
      store_id: 7,
      company_id: 1,
      date: new Date("2026-06-14"),
      candidate_working_hour_uuid: null,
      status: null,
      note: null,
      reason: null,
      is_public: null,
      rating: null,
      created_by: null,
      created_at: null,
      updated_at: null,
    };
    expect(workLogFeedbackItemSchema.safeParse(nullItem).success).toBe(true);
  });

  it("rejects number for date (date must be Date)", () => {
    expect(
      workLogFeedbackItemSchema.safeParse({ ...validItem, date: 12345 }).success,
    ).toBe(false);
  });

  it("rejects missing cwlf_uuid", () => {
    const { cwlf_uuid: _, ...rest } = validItem;
    expect(workLogFeedbackItemSchema.safeParse(rest).success).toBe(false);
  });

  it("accepts empty cwlf_uuid (z.string() allows empty)", () => {
    expect(
      workLogFeedbackItemSchema.safeParse({ ...validItem, cwlf_uuid: "" }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_id", () => {
    const { candidate_id: _, ...rest } = validItem;
    expect(workLogFeedbackItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing store_id", () => {
    const { store_id: _, ...rest } = validItem;
    expect(workLogFeedbackItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = validItem;
    expect(workLogFeedbackItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing date", () => {
    const { date: _, ...rest } = validItem;
    expect(workLogFeedbackItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid date type", () => {
    expect(
      workLogFeedbackItemSchema.safeParse({ ...validItem, date: "not-a-date" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for candidate_id", () => {
    expect(
      workLogFeedbackItemSchema.safeParse({ ...validItem, candidate_id: "not-a-number" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for is_public", () => {
    expect(
      workLogFeedbackItemSchema.safeParse({ ...validItem, is_public: "yes" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for rating", () => {
    expect(
      workLogFeedbackItemSchema.safeParse({ ...validItem, rating: "yes" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listWorkLogFeedbackResultSchema
// ---------------------------------------------------------------------------
describe("listWorkLogFeedbackResultSchema", () => {
  const validFeedbackItem = {
    cwlf_uuid: "550e8400-e29b-41d4-a716-446655440000",
    candidate_id: 42,
    store_id: 7,
    company_id: 1,
    date: new Date("2026-06-14"),
    candidate_working_hour_uuid: null,
    status: null,
    note: null,
    reason: null,
    is_public: null,
    rating: null,
    created_by: null,
    created_at: null,
    updated_at: null,
  };

  const validResult = {
    workLogFeedbacks: [validFeedbackItem],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result with items", () => {
    expect(listWorkLogFeedbackResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty workLogFeedbacks array", () => {
    expect(
      listWorkLogFeedbackResultSchema.safeParse({
        workLogFeedbacks: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts zero total and totalPages", () => {
    expect(
      listWorkLogFeedbackResultSchema.safeParse({
        workLogFeedbacks: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing workLogFeedbacks", () => {
    const { workLogFeedbacks: _, ...rest } = validResult;
    expect(listWorkLogFeedbackResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validResult;
    expect(listWorkLogFeedbackResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validResult;
    expect(listWorkLogFeedbackResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = validResult;
    expect(listWorkLogFeedbackResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const { totalPages: _, ...rest } = validResult;
    expect(listWorkLogFeedbackResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for workLogFeedbacks", () => {
    expect(
      listWorkLogFeedbackResultSchema.safeParse({ ...validResult, workLogFeedbacks: "not-an-array" })
        .success,
    ).toBe(false);
  });

  it("rejects invalid item in workLogFeedbacks array", () => {
    expect(
      listWorkLogFeedbackResultSchema.safeParse({
        ...validResult,
        workLogFeedbacks: [{ cwlf_uuid: "" }],
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for total", () => {
    expect(
      listWorkLogFeedbackResultSchema.safeParse({ ...validResult, total: "one" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for page", () => {
    expect(
      listWorkLogFeedbackResultSchema.safeParse({ ...validResult, page: "first" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for limit", () => {
    expect(
      listWorkLogFeedbackResultSchema.safeParse({ ...validResult, limit: "twenty" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for totalPages", () => {
    expect(
      listWorkLogFeedbackResultSchema.safeParse({ ...validResult, totalPages: "one" }).success,
    ).toBe(false);
  });
});
