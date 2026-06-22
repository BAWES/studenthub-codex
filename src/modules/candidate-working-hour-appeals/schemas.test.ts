import { describe, it, expect } from "vitest";
import {
  listAppealsSchema,
  getAppealSchema,
  createAppealSchema,
  updateAppealStatusSchema,
  listAppealUpdatesSchema,
  createAppealUpdateSchema,
  appealItemSchema,
  appealUpdateItemSchema,
  listAppealsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// appealItemSchema (output)
// ---------------------------------------------------------------------------

describe("appealItemSchema", () => {
  const valid = () => ({
    appeal_uuid: "appeal-uuid-abc-123",
    candidate_working_hour_uuid: "wh-uuid-456",
    candidate_id: 42,
    reason: "Incorrect hours logged",
    status: 2,
    created_at: new Date("2026-06-01T10:00:00Z"),
    updated_at: new Date("2026-06-01T12:00:00Z"),
  });

  const nullable = () => ({
    appeal_uuid: "appeal-uuid-abc-123",
    candidate_working_hour_uuid: "wh-uuid-456",
    candidate_id: 42,
    reason: null,
    status: 2,
    created_at: null,
    updated_at: null,
  });

  it("accepts a fully populated appeal item", () => {
    const r = appealItemSchema.safeParse(valid());
    expect(r.success).toBe(true);
  });

  it("accepts nullable reason", () => {
    const r = appealItemSchema.safeParse(nullable());
    expect(r.success).toBe(true);
  });

  it("accepts nullable created_at", () => {
    const r = appealItemSchema.safeParse({ ...valid(), created_at: null });
    expect(r.success).toBe(true);
  });

  it("accepts nullable updated_at", () => {
    const r = appealItemSchema.safeParse({ ...valid(), updated_at: null });
    expect(r.success).toBe(true);
  });

  it("rejects missing required field 'appeal_uuid'", () => {
    const { appeal_uuid: _, ...rest } = valid();
    const r = appealItemSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'candidate_working_hour_uuid'", () => {
    const { candidate_working_hour_uuid: _, ...rest } = valid();
    const r = appealItemSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'candidate_id'", () => {
    const { candidate_id: _, ...rest } = valid();
    const r = appealItemSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'status'", () => {
    const { status: _, ...rest } = valid();
    const r = appealItemSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects non-string appeal_uuid", () => {
    const r = appealItemSchema.safeParse({ ...valid(), appeal_uuid: 123 });
    expect(r.success).toBe(false);
  });

  it("rejects non-string candidate_working_hour_uuid", () => {
    const r = appealItemSchema.safeParse({ ...valid(), candidate_working_hour_uuid: 123 });
    expect(r.success).toBe(false);
  });

  it("rejects non-number candidate_id", () => {
    const r = appealItemSchema.safeParse({ ...valid(), candidate_id: "not-a-number" });
    expect(r.success).toBe(false);
  });

  it("rejects non-number status", () => {
    const r = appealItemSchema.safeParse({ ...valid(), status: "pending" });
    expect(r.success).toBe(false);
  });

  it("rejects non-date created_at", () => {
    const r = appealItemSchema.safeParse({ ...valid(), created_at: "not-a-date" });
    expect(r.success).toBe(false);
  });

  it("rejects non-date updated_at", () => {
    const r = appealItemSchema.safeParse({ ...valid(), updated_at: "not-a-date" });
    expect(r.success).toBe(false);
  });

  it("rejects completely empty object", () => {
    const r = appealItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// appealUpdateItemSchema (output)
// ---------------------------------------------------------------------------

describe("appealUpdateItemSchema", () => {
  const valid = () => ({
    appeal_update_uuid: "update-uuid-abc",
    appeal_uuid: "appeal-uuid-abc",
    update: "Reviewed the evidence",
    detail: "All documents are in order",
    created_at: new Date("2026-06-01T10:00:00Z"),
    updated_at: new Date("2026-06-01T12:00:00Z"),
    created_by: 1,
    updated_by: 1,
    is_new: false,
  });

  const nullable = () => ({
    appeal_update_uuid: "update-uuid-abc",
    appeal_uuid: "appeal-uuid-abc",
    update: null,
    detail: null,
    created_at: null,
    updated_at: null,
    created_by: null,
    updated_by: null,
    is_new: null,
  });

  it("accepts a fully populated appeal update item", () => {
    const r = appealUpdateItemSchema.safeParse(valid());
    expect(r.success).toBe(true);
  });

  it("accepts nullable update", () => {
    const r = appealUpdateItemSchema.safeParse(nullable());
    expect(r.success).toBe(true);
  });

  it("accepts nullable detail", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), detail: null });
    expect(r.success).toBe(true);
  });

  it("accepts nullable created_at", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), created_at: null });
    expect(r.success).toBe(true);
  });

  it("accepts nullable updated_at", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), updated_at: null });
    expect(r.success).toBe(true);
  });

  it("accepts nullable created_by", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), created_by: null });
    expect(r.success).toBe(true);
  });

  it("accepts nullable updated_by", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), updated_by: null });
    expect(r.success).toBe(true);
  });

  it("accepts nullable is_new", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), is_new: null });
    expect(r.success).toBe(true);
  });

  it("rejects missing required field 'appeal_update_uuid'", () => {
    const { appeal_update_uuid: _, ...rest } = valid();
    const r = appealUpdateItemSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'appeal_uuid'", () => {
    const { appeal_uuid: _, ...rest } = valid();
    const r = appealUpdateItemSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects non-string appeal_update_uuid", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), appeal_update_uuid: 123 });
    expect(r.success).toBe(false);
  });

  it("rejects non-string appeal_uuid", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), appeal_uuid: 123 });
    expect(r.success).toBe(false);
  });

  it("rejects non-date created_at", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), created_at: "not-a-date" });
    expect(r.success).toBe(false);
  });

  it("rejects non-date updated_at", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), updated_at: "not-a-date" });
    expect(r.success).toBe(false);
  });

  it("rejects non-number created_by", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), created_by: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects non-number updated_by", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), updated_by: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean is_new", () => {
    const r = appealUpdateItemSchema.safeParse({ ...valid(), is_new: 1 });
    expect(r.success).toBe(false);
  });

  it("rejects completely empty object", () => {
    const r = appealUpdateItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listAppealsResultSchema (output)
// ---------------------------------------------------------------------------

describe("listAppealsResultSchema", () => {
  const valid = () => ({
    appeals: [
      {
        appeal_uuid: "uuid-1",
        candidate_working_hour_uuid: "wh-uuid-1",
        candidate_id: 1,
        reason: null,
        status: 1,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  it("accepts a valid paginated result", () => {
    const r = listAppealsResultSchema.safeParse(valid());
    expect(r.success).toBe(true);
  });

  it("accepts an empty appeals array", () => {
    const r = listAppealsResultSchema.safeParse({
      ...valid(),
      appeals: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required field 'appeals'", () => {
    const { appeals: _, ...rest } = valid();
    const r = listAppealsResultSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'total'", () => {
    const { total: _, ...rest } = valid();
    const r = listAppealsResultSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'page'", () => {
    const { page: _, ...rest } = valid();
    const r = listAppealsResultSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'limit'", () => {
    const { limit: _, ...rest } = valid();
    const r = listAppealsResultSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing required field 'totalPages'", () => {
    const { totalPages: _, ...rest } = valid();
    const r = listAppealsResultSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects non-array appeals", () => {
    const r = listAppealsResultSchema.safeParse({ ...valid(), appeals: "not-an-array" });
    expect(r.success).toBe(false);
  });

  it("rejects non-number total", () => {
    const r = listAppealsResultSchema.safeParse({ ...valid(), total: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects non-number page", () => {
    const r = listAppealsResultSchema.safeParse({ ...valid(), page: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects non-number limit", () => {
    const r = listAppealsResultSchema.safeParse({ ...valid(), limit: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects non-number totalPages", () => {
    const r = listAppealsResultSchema.safeParse({ ...valid(), totalPages: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects null total", () => {
    const r = listAppealsResultSchema.safeParse({ ...valid(), total: null });
    expect(r.success).toBe(false);
  });

  it("rejects null page", () => {
    const r = listAppealsResultSchema.safeParse({ ...valid(), page: null });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listAppealsSchema (input)
// ---------------------------------------------------------------------------

describe("listAppealsSchema", () => {
  it("accepts valid params with all fields", () => {
    const r = listAppealsSchema.safeParse({
      candidate_id: 42,
      status: 2,
      date_from: "2026-01-01",
      date_to: "2026-06-01",
      page: 1,
      limit: 20,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty object (defaults applied)", () => {
    const r = listAppealsSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts string-coercible candidate_id", () => {
    const r = listAppealsSchema.safeParse({ candidate_id: "42" });
    expect(r.success).toBe(true);
  });

  it("accepts string-coercible status", () => {
    const r = listAppealsSchema.safeParse({ status: "2" });
    expect(r.success).toBe(true);
  });

  it("accepts string-coercible page", () => {
    const r = listAppealsSchema.safeParse({ page: "2" });
    expect(r.success).toBe(true);
  });

  it("accepts string-coercible limit", () => {
    const r = listAppealsSchema.safeParse({ limit: "50" });
    expect(r.success).toBe(true);
  });

  it("rejects zero page", () => {
    const r = listAppealsSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative page", () => {
    const r = listAppealsSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listAppealsSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects limit above 100", () => {
    const r = listAppealsSchema.safeParse({ limit: 101 });
    expect(r.success).toBe(false);
  });

  it("rejects invalid date_from format", () => {
    const r = listAppealsSchema.safeParse({ date_from: "01-01-2026" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid date_to format", () => {
    const r = listAppealsSchema.safeParse({ date_to: "2026/01/01" });
    expect(r.success).toBe(false);
  });

  it("rejects status above max (4)", () => {
    const r = listAppealsSchema.safeParse({ status: 5 });
    expect(r.success).toBe(false);
  });

  it("rejects status below 0", () => {
    const r = listAppealsSchema.safeParse({ status: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric candidate_id", () => {
    const r = listAppealsSchema.safeParse({ candidate_id: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric status", () => {
    const r = listAppealsSchema.safeParse({ status: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const r = listAppealsSchema.safeParse({ page: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric limit", () => {
    const r = listAppealsSchema.safeParse({ limit: "abc" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getAppealSchema (input)
// ---------------------------------------------------------------------------

describe("getAppealSchema", () => {
  it("accepts a valid UUID", () => {
    const r = getAppealSchema.safeParse({ uuid: "550e8400-e29b-41d4-a716-446655440000" });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const r = getAppealSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects empty string uuid", () => {
    const r = getAppealSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects non-string uuid", () => {
    const r = getAppealSchema.safeParse({ uuid: 123 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createAppealSchema (input)
// ---------------------------------------------------------------------------

describe("createAppealSchema", () => {
  const valid = () => ({
    candidate_working_hour_uuid: "wh-uuid-456",
    candidate_id: 42,
    reason: "Incorrect hours logged for the shift",
  });

  it("accepts valid input", () => {
    const r = createAppealSchema.safeParse(valid());
    expect(r.success).toBe(true);
  });

  it("accepts string-coercible candidate_id", () => {
    const r = createAppealSchema.safeParse({
      ...valid(),
      candidate_id: "42",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing candidate_working_hour_uuid", () => {
    const { candidate_working_hour_uuid: _, ...rest } = valid();
    const r = createAppealSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing candidate_id", () => {
    const { candidate_id: _, ...rest } = valid();
    const r = createAppealSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing reason", () => {
    const { reason: _, ...rest } = valid();
    const r = createAppealSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects empty candidate_working_hour_uuid", () => {
    const r = createAppealSchema.safeParse({
      ...valid(),
      candidate_working_hour_uuid: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty reason", () => {
    const r = createAppealSchema.safeParse({
      ...valid(),
      reason: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string candidate_working_hour_uuid", () => {
    const r = createAppealSchema.safeParse({
      ...valid(),
      candidate_working_hour_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric candidate_id", () => {
    const r = createAppealSchema.safeParse({
      ...valid(),
      candidate_id: "abc",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-positive candidate_id", () => {
    const r = createAppealSchema.safeParse({
      ...valid(),
      candidate_id: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string reason", () => {
    const r = createAppealSchema.safeParse({
      ...valid(),
      reason: 123,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateAppealStatusSchema (input)
// ---------------------------------------------------------------------------

describe("updateAppealStatusSchema", () => {
  const valid = () => ({
    uuid: "appeal-uuid-abc",
    status: 2,
  });

  it("accepts valid status update", () => {
    const r = updateAppealStatusSchema.safeParse(valid());
    expect(r.success).toBe(true);
  });

  it("accepts string-coercible status", () => {
    const r = updateAppealStatusSchema.safeParse({
      ...valid(),
      status: "2",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = valid();
    const r = updateAppealStatusSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = valid();
    const r = updateAppealStatusSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects empty uuid", () => {
    const r = updateAppealStatusSchema.safeParse({ ...valid(), uuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects non-string uuid", () => {
    const r = updateAppealStatusSchema.safeParse({ ...valid(), uuid: 123 });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric status", () => {
    const r = updateAppealStatusSchema.safeParse({ ...valid(), status: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects status below 0", () => {
    const r = updateAppealStatusSchema.safeParse({ ...valid(), status: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects status above 4", () => {
    const r = updateAppealStatusSchema.safeParse({ ...valid(), status: 5 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listAppealUpdatesSchema (input)
// ---------------------------------------------------------------------------

describe("listAppealUpdatesSchema", () => {
  it("accepts a valid appeal UUID", () => {
    const r = listAppealUpdatesSchema.safeParse({
      appeal_uuid: "appeal-uuid-abc",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing appeal_uuid", () => {
    const r = listAppealUpdatesSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects empty appeal_uuid", () => {
    const r = listAppealUpdatesSchema.safeParse({ appeal_uuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects non-string appeal_uuid", () => {
    const r = listAppealUpdatesSchema.safeParse({ appeal_uuid: 123 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createAppealUpdateSchema (input)
// ---------------------------------------------------------------------------

describe("createAppealUpdateSchema", () => {
  const valid = () => ({
    appeal_uuid: "appeal-uuid-abc",
    update: "Reviewed the evidence",
    detail: "Additional notes about the review",
  });

  it("accepts valid input with all fields", () => {
    const r = createAppealUpdateSchema.safeParse(valid());
    expect(r.success).toBe(true);
  });

  it("accepts input with only required fields (detail defaults)", () => {
    const r = createAppealUpdateSchema.safeParse({
      appeal_uuid: "appeal-uuid-abc",
      update: "Reviewed the evidence",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing appeal_uuid", () => {
    const { appeal_uuid: _, ...rest } = valid();
    const r = createAppealUpdateSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing update", () => {
    const { update: _, ...rest } = valid();
    const r = createAppealUpdateSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects empty appeal_uuid", () => {
    const r = createAppealUpdateSchema.safeParse({
      ...valid(),
      appeal_uuid: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty update", () => {
    const r = createAppealUpdateSchema.safeParse({
      ...valid(),
      update: "",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string appeal_uuid", () => {
    const r = createAppealUpdateSchema.safeParse({
      ...valid(),
      appeal_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string update", () => {
    const r = createAppealUpdateSchema.safeParse({
      ...valid(),
      update: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string detail", () => {
    const r = createAppealUpdateSchema.safeParse({
      ...valid(),
      detail: 123,
    });
    expect(r.success).toBe(false);
  });
});
