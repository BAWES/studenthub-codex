import { describe, it, expect } from "vitest";
import {
  listEventsSchema,
  getEventSchema,
  getEventTimelineSchema,
  listActivityEventsSchema,
} from "./schemas";
import type {
  EventItem,
  ListEventsResult,
  TimelineEntry,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — listEvents
// ---------------------------------------------------------------------------

describe("listEventsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listEventsSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts full pagination and filter params", () => {
    const r = listEventsSchema.safeParse({
      page: 2,
      limit: 50,
      requestUuid: "req_abc123",
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
      expect(r.data.requestUuid).toBe("req_abc123");
      expect(r.data.dateFrom).toBe("2024-01-01");
      expect(r.data.dateTo).toBe("2024-12-31");
    }
  });

  it("rejects limit over 100", () => {
    expect(listEventsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listEventsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("defaults page to 1 and limit to 20", () => {
    const r = listEventsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — getEvent
// ---------------------------------------------------------------------------

describe("getEventSchema", () => {
  it("accepts a valid UUID string", () => {
    const r = getEventSchema.safeParse({ id: "act_abc123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe("act_abc123");
    }
  });

  it("rejects empty ID", () => {
    const r = getEventSchema.safeParse({ id: "" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — getEventTimeline
// ---------------------------------------------------------------------------

describe("getEventTimelineSchema", () => {
  it("accepts a valid request UUID", () => {
    const r = getEventTimelineSchema.safeParse({ requestUuid: "req_abc123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.requestUuid).toBe("req_abc123");
    }
  });

  it("rejects empty requestUuid", () => {
    const r = getEventTimelineSchema.safeParse({ requestUuid: "" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — EventItem
// ---------------------------------------------------------------------------

describe("EventItem type", () => {
  it("has the required shape", () => {
    const item: EventItem = {
      activity_uuid: "act_abc123",
      request_uuid: "req_abc123",
      activity_detail: "Status changed from pending to approved",
      staff_name: "Staff 1",
      activity_created_datetime: new Date("2024-06-01T10:00:00.000Z"),
      activity_updated_datetime: new Date("2024-06-01T10:00:00.000Z"),
    };
    expect(item.activity_uuid).toBe("act_abc123");
    expect(item.activity_detail).toContain("Status changed");
    expect(item.staff_name).toBe("Staff 1");
  });

  it("accepts null staff name", () => {
    const item: EventItem = {
      activity_uuid: "act_def456",
      request_uuid: "req_def456",
      activity_detail: "System action",
      staff_name: null,
      activity_created_datetime: null,
      activity_updated_datetime: null,
    };
    expect(item.staff_name).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — ListEventsResult
// ---------------------------------------------------------------------------

describe("ListEventsResult type", () => {
  it("has the correct shape", () => {
    const result: ListEventsResult = {
      events: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.events).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — TimelineEntry
// ---------------------------------------------------------------------------

describe("TimelineEntry type", () => {
  it("groups events by date", () => {
    const entry: TimelineEntry = {
      date: "2024-06-01",
      events: [
        {
          activity_uuid: "act_001",
          request_uuid: "req_001",
          activity_detail: "Event 1",
          staff_name: "Staff A",
          activity_created_datetime: new Date("2024-06-01T10:00:00.000Z"),
          activity_updated_datetime: new Date("2024-06-01T10:00:00.000Z"),
        },
      ],
    };
    expect(entry.date).toBe("2024-06-01");
    expect(entry.events).toHaveLength(1);
    expect(entry.events[0].activity_detail).toBe("Event 1");
  });
});

// ---------------------------------------------------------------------------
// Backward compat: listActivityEventsSchema re-export
// ---------------------------------------------------------------------------

describe("listActivityEventsSchema (backward compat)", () => {
  it("is the same as listEventsSchema", () => {
    expect(listActivityEventsSchema).toBe(listEventsSchema);
  });
});
