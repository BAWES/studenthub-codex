import { describe, it, expect } from "vitest";
import {
  eventItemSchema,
  listEventsResultSchema,
  timelineEntrySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validEventItem = () => ({
  activity_uuid: "act_abc123-def-456-ghi",
  request_uuid: "req_xyz789-abc-123-def",
  activity_detail: "Status changed from pending to approved",
  staff_name: "Staff Member Name",
  activity_created_datetime: new Date("2024-06-01T10:00:00.000Z"),
  activity_updated_datetime: new Date("2024-06-01T10:00:00.000Z"),
});

const validEventItemNullables = () => ({
  activity_uuid: "act_def456-ghi-789-jkl",
  request_uuid: "req_abc123-def-456-ghi",
  activity_detail: "System generated event",
  staff_name: null,
  activity_created_datetime: null,
  activity_updated_datetime: null,
});

const validListEventsResult = () => ({
  events: [validEventItem(), validEventItemNullables()],
  total: 42,
  page: 1,
  limit: 20,
  totalPages: 3,
});

const validTimelineEntry = () => ({
  date: "2024-06-01",
  events: [validEventItem(), validEventItemNullables()],
});

// ---------------------------------------------------------------------------
// eventItemSchema
// ---------------------------------------------------------------------------

describe("eventItemSchema", () => {
  it("accepts a full event item with all fields", () => {
    const r = eventItemSchema.safeParse(validEventItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields all set to null", () => {
    const r = eventItemSchema.safeParse(validEventItemNullables());
    expect(r.success).toBe(true);
  });

  it("rejects missing all required fields (empty object)", () => {
    const r = eventItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects missing activity_uuid", () => {
    const r = eventItemSchema.safeParse({
      ...validEventItem(),
      activity_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing request_uuid", () => {
    const r = eventItemSchema.safeParse({
      ...validEventItem(),
      request_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing activity_detail", () => {
    const r = eventItemSchema.safeParse({
      ...validEventItem(),
      activity_detail: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for activity_uuid (number instead of string)", () => {
    const r = eventItemSchema.safeParse({
      ...validEventItem(),
      activity_uuid: 12345,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for staff_name (number instead of string)", () => {
    const r = eventItemSchema.safeParse({
      ...validEventItem(),
      staff_name: 999,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for activity_created_datetime (string instead of date)", () => {
    const r = eventItemSchema.safeParse({
      ...validEventItem(),
      activity_created_datetime: "not-a-date",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for activity_updated_datetime (string instead of date)", () => {
    const r = eventItemSchema.safeParse({
      ...validEventItem(),
      activity_updated_datetime: "not-a-date",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listEventsResultSchema
// ---------------------------------------------------------------------------

describe("listEventsResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listEventsResultSchema.safeParse(validListEventsResult());
    expect(r.success).toBe(true);
  });

  it("accepts an empty events array", () => {
    const r = listEventsResultSchema.safeParse({
      events: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("accepts zero total with a single page", () => {
    const r = listEventsResultSchema.safeParse({
      events: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listEventsResultSchema.safeParse({
      ...validListEventsResult(),
      total: -5,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page (page must be positive)", () => {
    const r = listEventsResultSchema.safeParse({
      ...validListEventsResult(),
      page: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing events array", () => {
    const r = listEventsResultSchema.safeParse({
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for total (string instead of number)", () => {
    const r = listEventsResultSchema.safeParse({
      ...validListEventsResult(),
      total: "42",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// timelineEntrySchema
// ---------------------------------------------------------------------------

describe("timelineEntrySchema", () => {
  it("accepts a full timeline entry with events", () => {
    const r = timelineEntrySchema.safeParse(validTimelineEntry());
    expect(r.success).toBe(true);
  });

  it("accepts a timeline entry with empty events array", () => {
    const r = timelineEntrySchema.safeParse({
      date: "2024-06-15",
      events: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing date", () => {
    const r = timelineEntrySchema.safeParse({
      events: [validEventItem()],
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing events", () => {
    const r = timelineEntrySchema.safeParse({
      date: "2024-06-01",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for date (number instead of string)", () => {
    const r = timelineEntrySchema.safeParse({
      ...validTimelineEntry(),
      date: 20240601,
    });
    expect(r.success).toBe(false);
  });

  it("rejects events that are not an array", () => {
    const r = timelineEntrySchema.safeParse({
      date: "2024-06-01",
      events: "not-an-array",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid event items inside the events array", () => {
    const r = timelineEntrySchema.safeParse({
      date: "2024-06-01",
      events: [
        {
          activity_uuid: "act_001",
          // missing request_uuid
          activity_detail: "Bad event",
          staff_name: null,
          activity_created_datetime: null,
          activity_updated_datetime: null,
        },
      ],
    });
    expect(r.success).toBe(false);
  });
});
