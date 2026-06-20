import { describe, it, expect } from "vitest";
import {
  listActivitySchema,
  getActivitySchema,
} from "./schemas";
import type {
  RequestActivityItem,
  ListActivityResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listActivitySchema tests
// ---------------------------------------------------------------------------

describe("listActivitySchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listActivitySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.requestUuid).toBeUndefined();
    }
  });

  it("accepts pagination params", () => {
    const result = listActivitySchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts requestUuid filter", () => {
    const result = listActivitySchema.safeParse({
      requestUuid: "req_abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("req_abc123");
    }
  });

  it("rejects negative page", () => {
    const result = listActivitySchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listActivitySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listActivitySchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const result = listActivitySchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getActivitySchema tests
// ---------------------------------------------------------------------------

describe("getActivitySchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getActivitySchema.safeParse({ uuid: "act_12345" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("act_12345");
    }
  });

  it("rejects empty UUID", () => {
    const result = getActivitySchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getActivitySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string UUID", () => {
    const result = getActivitySchema.safeParse({ uuid: 42 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// RequestActivityItem shape tests
// ---------------------------------------------------------------------------

describe("RequestActivityItem shape", () => {
  it("defines all expected fields", () => {
    const item: RequestActivityItem = {
      activity_uuid: "act_123",
      request_uuid: "req_456",
      staff_id: 1,
      activity_detail: "Candidate was assigned to store ABC",
      activity_created_datetime: "2026-06-09T10:00:00.000Z",
      activity_updated_datetime: "2026-06-09T10:00:00.000Z",
    };
    expect(item.activity_uuid).toBe("act_123");
    expect(item.request_uuid).toBe("req_456");
    expect(item.staff_id).toBe(1);
    expect(item.activity_detail).toBe(
      "Candidate was assigned to store ABC",
    );
    expect(item.activity_created_datetime).toBeTruthy();
  });

  it("allows null for staff_id and nullable datetime fields", () => {
    const item: RequestActivityItem = {
      activity_uuid: "act_789",
      request_uuid: "req_012",
      staff_id: null,
      activity_detail: "Request was created",
      activity_created_datetime: null,
      activity_updated_datetime: null,
    };
    expect(item.staff_id).toBeNull();
    expect(item.activity_created_datetime).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// ListActivityResult shape tests
// ---------------------------------------------------------------------------

describe("ListActivityResult shape", () => {
  it("accepts an empty result array", () => {
    const result: ListActivityResult = {
      activities: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.activities).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });

  it("accepts paginated results", () => {
    const result: ListActivityResult = {
      activities: [
        {
          activity_uuid: "act_1",
          request_uuid: "req_1",
          staff_id: null,
          activity_detail: "First activity",
          activity_created_datetime: "2026-06-09T10:00:00.000Z",
          activity_updated_datetime: "2026-06-09T10:00:00.000Z",
        },
        {
          activity_uuid: "act_2",
          request_uuid: "req_1",
          staff_id: 5,
          activity_detail: "Second activity",
          activity_created_datetime: "2026-06-09T11:00:00.000Z",
          activity_updated_datetime: "2026-06-09T11:00:00.000Z",
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.activities).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
  });
});
