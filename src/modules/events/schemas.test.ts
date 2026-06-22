import { describe, it, expect } from "vitest";
import {
  activityEventItemSchema,
  listActivityEventsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// activityEventItemSchema
// ---------------------------------------------------------------------------
describe("activityEventItemSchema", () => {
  const valid = {
    activity_uuid: "ae-uuid-1",
    request_uuid: "req-uuid-1",
    activity_detail: "Candidate was moved to interview stage",
    staff_name: "John Smith",
    activity_created_datetime: new Date("2026-06-14T05:00:00"),
    activity_updated_datetime: new Date("2026-06-14T06:00:00"),
  };

  it("accepts a valid activity event item", () => {
    expect(activityEventItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      activityEventItemSchema.safeParse({
        ...valid,
        staff_name: null,
        activity_created_datetime: null,
        activity_updated_datetime: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing activity_uuid", () => {
    const { activity_uuid: _, ...rest } = valid;
    expect(activityEventItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing request_uuid", () => {
    const { request_uuid: _, ...rest } = valid;
    expect(activityEventItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing activity_detail", () => {
    const { activity_detail: _, ...rest } = valid;
    expect(activityEventItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string request_uuid", () => {
    expect(
      activityEventItemSchema.safeParse({ ...valid, request_uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-date activity_created_datetime", () => {
    expect(
      activityEventItemSchema.safeParse({
        ...valid,
        activity_created_datetime: "2026-01-01",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listActivityEventsResultSchema
// ---------------------------------------------------------------------------
describe("listActivityEventsResultSchema", () => {
  const valid = () => ({
    events: [
      {
        activity_uuid: "ae-uuid-1",
        request_uuid: "req-uuid-1",
        activity_detail: "Stage change",
        staff_name: null,
        activity_created_datetime: null,
        activity_updated_datetime: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  it("accepts a valid paginated result", () => {
    expect(listActivityEventsResultSchema.safeParse(valid()).success).toBe(true);
  });

  it("accepts empty events array", () => {
    expect(
      listActivityEventsResultSchema.safeParse({ ...valid(), events: [] }).success,
    ).toBe(true);
  });

  it("rejects missing events", () => {
    const { events: _, ...rest } = valid();
    expect(listActivityEventsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array events", () => {
    expect(
      listActivityEventsResultSchema.safeParse({ ...valid(), events: "not-array" }).success,
    ).toBe(false);
  });

  it("rejects non-number total", () => {
    expect(
      listActivityEventsResultSchema.safeParse({ ...valid(), total: "one" }).success,
    ).toBe(false);
  });
});
