import { describe, it, expect } from "vitest";
import { listActivityEventsSchema, getActivityEventSchema } from "./schemas";
import type {
  ActivityEventItem,
  ListActivityEventsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

describe("listActivityEventsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    expect(listActivityEventsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listActivityEventsSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listActivityEventsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listActivityEventsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("accepts date range filter", () => {
    const r = listActivityEventsSchema.safeParse({
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.dateFrom).toBe("2024-01-01");
      expect(r.data.dateTo).toBe("2024-12-31");
    }
  });

  it("accepts requestUuid filter", () => {
    const r = listActivityEventsSchema.safeParse({
      requestUuid: "request_abc123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.requestUuid).toBe("request_abc123");
    }
  });

  it("defaults page to 1 and limit to 20", () => {
    const defaults = { page: 1, limit: 20 };
    expect(listActivityEventsSchema.safeParse(defaults).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("ActivityEventItem type", () => {
  it("has the required shape", () => {
    const item: ActivityEventItem = {
      activity_uuid: "act_abc123",
      request_uuid: "request_abc123",
      activity_detail: "Status changed from pending to approved",
      staff_name: "Staff 1",
      activity_created_datetime: new Date("2024-06-01T10:00:00.000Z"),
      activity_updated_datetime: new Date("2024-06-01T10:00:00.000Z"),
    };
    expect(item.activity_uuid).toBe("act_abc123");
    expect(item.activity_detail).toBe(
      "Status changed from pending to approved",
    );
    expect(item.staff_name).toBe("Staff 1");
  });

  it("accepts null staff name", () => {
    const item: ActivityEventItem = {
      activity_uuid: "act_def456",
      request_uuid: "request_def456",
      activity_detail: "System action",
      staff_name: null,
      activity_created_datetime: null,
      activity_updated_datetime: null,
    };
    expect(item.staff_name).toBeNull();
  });
});

describe("ListActivityEventsResult type", () => {
  it("has the correct shape", () => {
    const result: ListActivityEventsResult = {
      events: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.events).toHaveLength(0);
    expect(result.totalPages).toBe(0);
    expect(result.page).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getActivityEvent tests
// ---------------------------------------------------------------------------

describe("getActivityEventSchema", () => {
  it("rejects empty activity UUID", () => {
    const r = getActivityEventSchema.safeParse({ id: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.message).toBe("Invalid activity event ID");
    }
  });

  it("accepts valid activity UUID", () => {
    const r = getActivityEventSchema.safeParse({ id: "act_abc123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.id).toBe("act_abc123");
    }
  });
});
