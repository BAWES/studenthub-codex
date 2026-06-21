import { describe, it, expect } from "vitest";
import {
  storyItemSchema,
  listStoriesResultSchema,
  storyActionResponseSchema,
  listStoriesSchema,
  createStorySchema,
  updateStorySchema,
  deleteStorySchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Input schema validation
// ---------------------------------------------------------------------------

describe("listStoriesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listStoriesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(50);
    }
  });

  it("accepts explicit pagination params", () => {
    const r = listStoriesSchema.safeParse({ page: 2, limit: 25 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(25);
    }
  });

  it("rejects limit over 200", () => {
    expect(listStoriesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listStoriesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("coerces string page to number", () => {
    const r = listStoriesSchema.safeParse({ page: "3" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.page).toBe(3);
  });
});

describe("createStorySchema", () => {
  it("accepts valid input (requestUuid only)", () => {
    const r = createStorySchema.safeParse({ requestUuid: "req-abc-123" });
    expect(r.success).toBe(true);
  });

  it("accepts input with all fields", () => {
    const r = createStorySchema.safeParse({
      requestUuid: "req-abc-123",
      staffId: 42,
      numberOfEmployees: 5,
      storyStatus: 1,
      storyTimeSpent: 120,
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty requestUuid", () => {
    expect(createStorySchema.safeParse({ requestUuid: "" }).success).toBe(false);
  });

  it("rejects missing requestUuid", () => {
    expect(createStorySchema.safeParse({}).success).toBe(false);
  });

  it("rejects storyStatus > 2", () => {
    expect(
      createStorySchema.safeParse({ requestUuid: "req-1", storyStatus: 3 }).success,
    ).toBe(false);
  });

  it("defaults storyStatus to 0", () => {
    const r = createStorySchema.safeParse({ requestUuid: "req-1" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.storyStatus).toBe(0);
  });
});

describe("updateStorySchema", () => {
  it("accepts valid update", () => {
    const r = updateStorySchema.safeParse({
      storyUuid: "str-abc",
      requestUuid: "req-def",
      storyStatus: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing storyUuid", () => {
    expect(
      updateStorySchema.safeParse({ requestUuid: "req-1", storyStatus: 0 }).success,
    ).toBe(false);
  });

  it("rejects missing requestUuid", () => {
    expect(
      updateStorySchema.safeParse({ storyUuid: "str-1", storyStatus: 0 }).success,
    ).toBe(false);
  });

  it("rejects empty storyUuid", () => {
    expect(
      updateStorySchema.safeParse({ storyUuid: "", requestUuid: "req-1", storyStatus: 0 })
        .success,
    ).toBe(false);
  });
});

describe("deleteStorySchema", () => {
  it("accepts valid uuid", () => {
    expect(deleteStorySchema.safeParse({ storyUuid: "str-abc" }).success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(deleteStorySchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

const validStoryItem = {
  story_uuid: "abc-123-def-456",
  request_uuid: "req-001",
  request_position_title: "Software Engineer",
  staff_id: 42,
  staff_name: "John Doe",
  number_of_employees: 5,
  story_status: 1,
  is_old: false,
  story_time_spent: 120,
  story_last_updated_at: "2026-06-15T10:00:00.000Z",
};

describe("storyItemSchema", () => {
  it("accepts a valid story item with all fields", () => {
    const r = storyItemSchema.safeParse(validStoryItem);
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const r = storyItemSchema.safeParse({
      ...validStoryItem,
      request_position_title: null,
      staff_id: null,
      staff_name: null,
      number_of_employees: null,
      is_old: null,
      story_time_spent: null,
      story_last_updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing story_uuid", () => {
    const { story_uuid: _, ...rest } = validStoryItem;
    expect(storyItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty story_uuid", () => {
    expect(
      storyItemSchema.safeParse({ ...validStoryItem, story_uuid: "" }).success,
    ).toBe(false);
  });

  it("rejects non-integer story_status", () => {
    expect(
      storyItemSchema.safeParse({ ...validStoryItem, story_status: "not-a-number" }).success,
    ).toBe(false);
  });
});

describe("listStoriesResultSchema", () => {
  const validResult = {
    stories: [validStoryItem],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid result with items", () => {
    expect(listStoriesResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty stories array", () => {
    expect(
      listStoriesResultSchema.safeParse({
        ...validResult,
        stories: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects non-array stories", () => {
    expect(
      listStoriesResultSchema.safeParse({
        ...validResult,
        stories: "not-an-array",
      }).success,
    ).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listStoriesResultSchema.safeParse({ ...validResult, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects page 0", () => {
    expect(
      listStoriesResultSchema.safeParse({ ...validResult, page: 0 }).success,
    ).toBe(false);
  });
});

describe("storyActionResponseSchema", () => {
  it("accepts success response", () => {
    expect(
      storyActionResponseSchema.safeParse({ operation: "success", message: "Created" }).success,
    ).toBe(true);
  });

  it("accepts error response", () => {
    expect(
      storyActionResponseSchema.safeParse({ operation: "error", message: "Not found" }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(storyActionResponseSchema.safeParse({ message: "Msg" }).success).toBe(false);
  });

  it("rejects empty operation", () => {
    expect(storyActionResponseSchema.safeParse({ operation: "", message: "Msg" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(storyActionResponseSchema.safeParse({ operation: "error", message: "" }).success).toBe(false);
  });
});
