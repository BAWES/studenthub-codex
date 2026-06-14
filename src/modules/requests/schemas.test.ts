import { describe, it, expect } from "vitest";
import {
  requestListItemSchema,
  listRequestsResultSchema,
  requestUuidResultSchema,
  requestDetailSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validRequestListItem = () => ({
  request_uuid: "550e8400-e29b-41d4-a716-446655440000",
  company_id: 1,
  contact_uuid: "660e8400-e29b-41d4-a716-446655440001",
  staff_id: 100,
  request_position_type: 1,
  request_position_title: "Software Engineer",
  request_job_description: "Full-stack development role",
  request_compensation: "1500 KWD",
  request_number_of_employees: 3,
  no_of_employees_per_story: 1,
  request_location: "Kuwait City",
  request_additional_info: "Must have 3+ years experience",
  request_status: "active",
  request_priority: 1,
  gender: true,
  nationality_id: 1,
  request_created_datetime: new Date("2026-06-14"),
  request_updated_datetime: new Date("2026-06-14"),
});

const validRequestListItemMinimal = () => ({
  request_uuid: "550e8400-e29b-41d4-a716-446655440000",
  company_id: null,
  contact_uuid: null,
  staff_id: null,
  request_position_type: null,
  request_position_title: null,
  request_job_description: "desc",
  request_compensation: "comp",
  request_number_of_employees: null,
  no_of_employees_per_story: 1,
  request_location: null,
  request_additional_info: null,
  request_status: null,
  request_priority: null,
  gender: true,
  nationality_id: null,
  request_created_datetime: new Date("2026-06-14"),
  request_updated_datetime: new Date("2026-06-14"),
});

const validRequestDetail = () => ({
  ...validRequestListItem(),
  request_created_by: 100,
  request_updated_by: 100,
  request_feedback: "Priority client",
  our_fees: 150.5,
  our_fees_unit: "KWD",
});

const validRequestDetailMinimal = () => ({
  ...validRequestListItemMinimal(),
  request_created_by: null,
  request_updated_by: null,
  request_feedback: null,
  our_fees: null,
  our_fees_unit: null,
});

// ---------------------------------------------------------------------------
// requestListItemSchema
// ---------------------------------------------------------------------------

describe("requestListItemSchema", () => {
  it("accepts a full request list item", () => {
    const r = requestListItemSchema.safeParse(validRequestListItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal request list item (nullable fields set to null)", () => {
    const r = requestListItemSchema.safeParse(validRequestListItemMinimal());
    expect(r.success).toBe(true);
  });

  it("accepts a Date object for datetime fields", () => {
    const r = requestListItemSchema.safeParse({
      ...validRequestListItem(),
      request_created_datetime: new Date("2026-06-14"),
      request_updated_datetime: new Date("2026-06-14"),
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = requestListItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = requestListItemSchema.safeParse({
      ...validRequestListItem(),
      request_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing request_uuid", () => {
    const r = requestListItemSchema.safeParse({
      ...validRequestListItem(),
      request_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean gender", () => {
    const r = requestListItemSchema.safeParse({
      ...validRequestListItem(),
      gender: "yes",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number no_of_employees_per_story", () => {
    const r = requestListItemSchema.safeParse({
      ...validRequestListItem(),
      no_of_employees_per_story: "one",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listRequestsResultSchema
// ---------------------------------------------------------------------------

describe("listRequestsResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listRequestsResultSchema.safeParse({
      requests: [validRequestListItem(), validRequestListItemMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty requests array", () => {
    const r = listRequestsResultSchema.safeParse({
      requests: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = listRequestsResultSchema.safeParse({ requests: [] });
    expect(r.success).toBe(false);
  });

  it("rejects non-number total", () => {
    const r = listRequestsResultSchema.safeParse({
      requests: [],
      total: "not-a-number",
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid request items in the array", () => {
    const r = listRequestsResultSchema.safeParse({
      requests: [{ request_uuid: 123 }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// requestUuidResultSchema
// ---------------------------------------------------------------------------

describe("requestUuidResultSchema", () => {
  it("accepts a valid result", () => {
    const r = requestUuidResultSchema.safeParse({
      request_uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing request_uuid", () => {
    const r = requestUuidResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string request_uuid", () => {
    const r = requestUuidResultSchema.safeParse({
      request_uuid: 123,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// requestDetailSchema
// ---------------------------------------------------------------------------

describe("requestDetailSchema", () => {
  it("accepts a full request detail", () => {
    const r = requestDetailSchema.safeParse(validRequestDetail());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal request detail (nullable fields set to null)", () => {
    const r = requestDetailSchema.safeParse(validRequestDetailMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = requestDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = requestDetailSchema.safeParse({
      ...validRequestDetail(),
      request_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean gender", () => {
    const r = requestDetailSchema.safeParse({
      ...validRequestDetail(),
      gender: "yes",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number our_fees when provided", () => {
    const r = requestDetailSchema.safeParse({
      ...validRequestDetail(),
      our_fees: "free",
    });
    expect(r.success).toBe(false);
  });
});
