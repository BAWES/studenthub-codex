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
import type { EventItem, ListEventsResult, TimelineEntry } from "./schemas";

// ---------------------------------------------------------------------------
// Input schema: listEventsSchema
// ---------------------------------------------------------------------------
describe("listEventsSchema", () => {
  it("accepts empty params (all optional)", () => {
    const r = listEventsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBeUndefined();
      expect(r.data.limit).toBeUndefined();
    }
  });

  it("accepts full filter with all params", () => {
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
    }
  });

  it("rejects negative page", () =>
    expect(listEventsSchema.safeParse({ page: -1 }).success).toBe(false));

  it("rejects limit over 100", () =>
    expect(listEventsSchema.safeParse({ limit: 200 }).success).toBe(false));

  it("rejects zero page", () =>
    expect(listEventsSchema.safeParse({ page: 0 }).success).toBe(false));
});

// ---------------------------------------------------------------------------
// Input schema: getEventSchema
// ---------------------------------------------------------------------------
describe("getEventSchema", () => {
  it("accepts valid id", () => {
    const r = getEventSchema.safeParse({ id: "evt-001" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.id).toBe("evt-001");
  });

  it("rejects empty id", () =>
    expect(getEventSchema.safeParse({ id: "" }).success).toBe(false));

  it("rejects missing id", () =>
    expect(getEventSchema.safeParse({}).success).toBe(false));
});

// ---------------------------------------------------------------------------
// Input schema: getEventTimelineSchema
// ---------------------------------------------------------------------------
describe("getEventTimelineSchema", () => {
  it("accepts valid requestUuid", () => {
    const r = getEventTimelineSchema.safeParse({ requestUuid: "req-001" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.requestUuid).toBe("req-001");
  });

  it("rejects empty requestUuid", () =>
    expect(getEventTimelineSchema.safeParse({ requestUuid: "" }).success).toBe(
      false,
    ));

  it("rejects missing requestUuid", () =>
    expect(getEventTimelineSchema.safeParse({}).success).toBe(false));
});

// ---------------------------------------------------------------------------
// Schema alias: listActivityEventsSchema
// ---------------------------------------------------------------------------
describe("listActivityEventsSchema", () => {
  it("aliases listEventsSchema", () => {
    expect(listActivityEventsSchema).toBe(listEventsSchema);
  });
});

// ---------------------------------------------------------------------------
// Output validation: eventItemSchema
// ---------------------------------------------------------------------------
describe("eventItemSchema (output validation)", () => {
  it("accepts a full event with all fields", () => {
    const r = eventItemSchema.safeParse({
      activity_uuid: "act-001",
      request_uuid: "req-001",
      activity_detail: "Candidate status changed to Hired",
      staff_name: "Staff User",
      activity_created_datetime: new Date("2026-06-14"),
      activity_updated_datetime: new Date("2026-06-14"),
    });
    expect(r.success).toBe(true);
  });

  it("accepts event with nullable fields as null", () => {
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

  it("rejects missing required activity_uuid", () => {
    const r = eventItemSchema.safeParse({
      request_uuid: "req-001",
      activity_detail: "Missing uuid",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for staff_name (number instead of string|null)", () => {
    const r = eventItemSchema.safeParse({
      activity_uuid: "act-003",
      request_uuid: "req-001",
      activity_detail: "Bad staff name",
      staff_name: 42,
      activity_created_datetime: null,
      activity_updated_datetime: null,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation: listEventsResultSchema
// ---------------------------------------------------------------------------
describe("listEventsResultSchema (output validation)", () => {
  it("accepts valid paginated result", () => {
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

  it("accepts empty events array", () => {
    const r = listEventsResultSchema.safeParse({
      events: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listEventsResultSchema.safeParse({
      events: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing events array", () => {
    const r = listEventsResultSchema.safeParse({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation: timelineEntrySchema
// ---------------------------------------------------------------------------
describe("timelineEntrySchema (output validation)", () => {
  it("accepts a full timeline entry with events", () => {
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

  it("accepts timeline entry with empty events", () => {
    const r = timelineEntrySchema.safeParse({
      date: "2026-06-14",
      events: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing date", () => {
    const r = timelineEntrySchema.safeParse({
      events: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing events", () => {
    const r = timelineEntrySchema.safeParse({
      date: "2026-06-14",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape verification
// ---------------------------------------------------------------------------
describe("EventItem type shape", () => {
  it("has required shape with all fields", () => {
    const item: EventItem = {
      activity_uuid: "act-001",
      request_uuid: "req-001",
      activity_detail: "Test",
      staff_name: "User",
      activity_created_datetime: new Date(),
      activity_updated_datetime: null,
    };
    expect(item.activity_uuid).toBe("act-001");
    expect(item.staff_name).toBe("User");
  });

  it("accepts null dates", () => {
    const item: EventItem = {
      activity_uuid: "act-002",
      request_uuid: "req-002",
      activity_detail: "Test nulls",
      staff_name: null,
      activity_created_datetime: null,
      activity_updated_datetime: null,
    };
    expect(item.activity_created_datetime).toBeNull();
  });
});

describe("ListEventsResult type shape", () => {
  it("has correct shape with pagination fields", () => {
    const r: ListEventsResult = {
      events: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(r.events).toHaveLength(0);
    expect(r.totalPages).toBe(0);
  });
});

describe("TimelineEntry type shape", () => {
  it("has date and events array", () => {
    const t: TimelineEntry = {
      date: "2026-06-14",
      events: [],
    };
    expect(t.date).toBe("2026-06-14");
    expect(t.events).toHaveLength(0);
  });
});
