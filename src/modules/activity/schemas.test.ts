import { describe, it, expect } from "vitest";
import {
  requestActivityItemSchema,
  listActivityResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// requestActivityItemSchema
// ---------------------------------------------------------------------------

describe("requestActivityItemSchema", () => {
  it("accepts a valid request activity item", () => {
    const input = {
      activity_uuid: "abc-123-def",
      request_uuid: "req-456-ghi",
      staff_id: 42,
      activity_detail: "Status changed from Pending to Approved",
      activity_created_datetime: "2026-01-15T10:00:00Z",
      activity_updated_datetime: "2026-01-15T10:30:00Z",
    };
    const result = requestActivityItemSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts activity with nullable fields as null", () => {
    const input = {
      activity_uuid: "abc-456-def",
      request_uuid: "req-789-ghi",
      staff_id: null,
      activity_detail: "System auto-approved",
      activity_created_datetime: null,
      activity_updated_datetime: null,
    };
    const result = requestActivityItemSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects missing activity_uuid", () => {
    const input = {
      request_uuid: "req-123",
      activity_detail: "Something happened",
    };
    const result = requestActivityItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-string activity_uuid", () => {
    const input = {
      activity_uuid: 12345,
      request_uuid: "req-123",
      staff_id: null,
      activity_detail: "Test activity",
      activity_created_datetime: null,
      activity_updated_datetime: null,
    };
    const result = requestActivityItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects missing request_uuid", () => {
    const input = {
      activity_uuid: "abc-123",
      activity_detail: "Something happened",
    };
    const result = requestActivityItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-integer staff_id", () => {
    const input = {
      activity_uuid: "abc-123",
      request_uuid: "req-456",
      staff_id: "not-a-number",
      activity_detail: "Test",
      activity_created_datetime: null,
      activity_updated_datetime: null,
    };
    const result = requestActivityItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects missing activity_detail", () => {
    const input = {
      activity_uuid: "abc-123",
      request_uuid: "req-456",
      staff_id: null,
      activity_created_datetime: null,
      activity_updated_datetime: null,
    };
    const result = requestActivityItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-string activity_detail", () => {
    const input = {
      activity_uuid: "abc-123",
      request_uuid: "req-456",
      staff_id: null,
      activity_detail: 42,
      activity_created_datetime: null,
      activity_updated_datetime: null,
    };
    const result = requestActivityItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listActivityResultSchema
// ---------------------------------------------------------------------------

describe("listActivityResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const input = {
      activities: [
        {
          activity_uuid: "aaa-111",
          request_uuid: "req-111",
          staff_id: 1,
          activity_detail: "Created",
          activity_created_datetime: "2026-01-01T00:00:00Z",
          activity_updated_datetime: "2026-01-01T00:00:00Z",
        },
        {
          activity_uuid: "aaa-222",
          request_uuid: "req-222",
          staff_id: null,
          activity_detail: "Updated",
          activity_created_datetime: null,
          activity_updated_datetime: null,
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const result = listActivityResultSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.activities).toHaveLength(2);
    }
  });

  it("accepts an empty activities array", () => {
    const input = {
      activities: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listActivityResultSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.activities).toHaveLength(0);
    }
  });

  it("rejects negative total", () => {
    const input = {
      activities: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listActivityResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects zero or negative page", () => {
    const input = {
      activities: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    };
    const result = listActivityResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    const input = {
      activities: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: -1,
    };
    const result = listActivityResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-array activities", () => {
    const input = {
      activities: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const result = listActivityResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid item in the activities array", () => {
    const input = {
      activities: [
        {
          activity_uuid: 999,
          request_uuid: "req-999",
          staff_id: null,
          activity_detail: "Invalid UUID type",
          activity_created_datetime: null,
          activity_updated_datetime: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const result = listActivityResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
