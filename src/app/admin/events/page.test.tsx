import { describe, it, expect } from "vitest";
import {
  listEventsSchema,
  getEventSchema,
  getEventTimelineSchema,
  listActivityEventsSchema,
  eventItemSchema,
  listEventsResultSchema,
  timelineEntrySchema,
} from "./schemas";

/**
 * Page migration test for admin/events.
 *
 * Verifies the data contract between page and action.
 * Full rendering tests require Playwright (server component).
 */
describe("admin events page — data contract", () => {
  it("listEventsSchema parses with defaults", () => {
    const r = listEventsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBeUndefined();
      expect(r.data.limit).toBeUndefined();
    }
  });

  it("listEventsSchema accepts filters", () => {
    const r = listEventsSchema.safeParse({
      requestUuid: "req-001",
      dateFrom: "2026-01-01",
      dateTo: "2026-06-30",
      page: 1,
      limit: 50,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.requestUuid).toBe("req-001");
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(50);
    }
  });

  it("listEventsSchema rejects negative page", () => {
    const r = listEventsSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("listEventsSchema rejects limit over 100", () => {
    const r = listEventsSchema.safeParse({ limit: 200 });
    expect(r.success).toBe(false);
  });

  it("getEventSchema validates with id", () => {
    const r = getEventSchema.safeParse({ id: "evt-001" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe("evt-001");
    }
  });

  it("getEventSchema rejects empty id", () => {
    const r = getEventSchema.safeParse({ id: "" });
    expect(r.success).toBe(false);
  });

  it("getEventTimelineSchema validates with requestUuid", () => {
    const r = getEventTimelineSchema.safeParse({ requestUuid: "req-001" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.requestUuid).toBe("req-001");
    }
  });

  it("getEventTimelineSchema rejects missing requestUuid", () => {
    const r = getEventTimelineSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("listActivityEventsSchema aliases listEventsSchema", () => {
    expect(listActivityEventsSchema).toBe(listEventsSchema);
  });

  it("eventItemSchema validates a full event entry", () => {
    const r = eventItemSchema.safeParse({
      activity_uuid: "act-001",
      request_uuid: "req-001",
      activity_detail: "Candidate status changed to Hired",
      staff_name: "Staff User",
      activity_created_datetime: new Date("2026-06-14"),
      activity_updated_datetime: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.activity_uuid).toBe("act-001");
      expect(r.data.staff_name).toBe("Staff User");
    }
  });

  it("eventItemSchema accepts null staff_name", () => {
    const r = eventItemSchema.safeParse({
      activity_uuid: "act-002",
      request_uuid: "req-001",
      activity_detail: "System event",
      staff_name: null,
      activity_created_datetime: null,
      activity_updated_datetime: null,
    });
    expect(r.success).toBe(true);
  });

  it("eventItemSchema rejects missing required fields", () => {
    const r = eventItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("listEventsResultSchema validates paginated result", () => {
    const r = listEventsResultSchema.safeParse({
      events: [
        {
          activity_uuid: "act-001",
          request_uuid: "req-001",
          activity_detail: "Event detail",
          staff_name: null,
          activity_created_datetime: new Date("2026-06-14"),
          activity_updated_datetime: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("listEventsResultSchema rejects negative total", () => {
    const r = listEventsResultSchema.safeParse({
      events: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("timelineEntrySchema validates date group", () => {
    const r = timelineEntrySchema.safeParse({
      date: "2026-06-14",
      events: [
        {
          activity_uuid: "act-001",
          request_uuid: "req-001",
          activity_detail: "Timeline event",
          staff_name: "Staff A",
          activity_created_datetime: new Date("2026-06-14T10:00:00"),
          activity_updated_datetime: null,
        },
      ],
    });
    expect(r.success).toBe(true);
  });
});
