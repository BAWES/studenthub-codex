import { describe, it, expect } from "vitest";
import {
  listStorySchema,
  createStorySchema,
  updateStorySchema,
  deleteStorySchema,
  storyItemSchema,
  listStoryResultSchema,
  storyActionResponseSchema,
} from "./schemas";
import type { StoryItem, ListStoryResult } from "./schemas";

// ---------------------------------------------------------------------------
// listStorySchema
// ---------------------------------------------------------------------------
describe("listStorySchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listStorySchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listStorySchema.safeParse({ page: 2, limit: 100 }).success,
    ).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listStorySchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 200", () => {
    expect(listStorySchema.safeParse({ limit: 201 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listStorySchema.safeParse({ page: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createStorySchema
// ---------------------------------------------------------------------------
describe("createStorySchema", () => {
  it("accepts valid input", () => {
    expect(
      createStorySchema.safeParse({
        requestUuid: "req-123",
        staffId: 1,
        numberOfEmployees: 3,
        storyStatus: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts minimal input (just requestUuid)", () => {
    expect(
      createStorySchema.safeParse({
        requestUuid: "req-123",
      }).success,
    ).toBe(true);
  });

  it("rejects missing requestUuid", () => {
    expect(createStorySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty requestUuid", () => {
    expect(
      createStorySchema.safeParse({ requestUuid: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateStorySchema
// ---------------------------------------------------------------------------
describe("updateStorySchema", () => {
  it("accepts valid input", () => {
    expect(
      updateStorySchema.safeParse({
        storyUuid: "abc-123",
        storyStatus: 2,
        numberOfEmployees: 5,
      }).success,
    ).toBe(true);
  });

  it("rejects missing storyUuid", () => {
    expect(updateStorySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty storyUuid", () => {
    expect(
      updateStorySchema.safeParse({ storyUuid: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteStorySchema
// ---------------------------------------------------------------------------
describe("deleteStorySchema", () => {
  it("accepts valid input", () => {
    expect(
      deleteStorySchema.safeParse({ storyUuid: "abc-123" }).success,
    ).toBe(true);
  });

  it("rejects missing storyUuid", () => {
    expect(deleteStorySchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty storyUuid", () => {
    expect(deleteStorySchema.safeParse({ storyUuid: "" }).success).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// storyItemSchema
// ---------------------------------------------------------------------------
describe("storyItemSchema", () => {
  const validItem = {
    story_uuid: "abc-123",
    request_uuid: "req-456",
    request_position_title: "Engineer",
    staff_id: 1,
    staff_name: "Ahmed",
    number_of_employees: 3,
    story_status: 1,
    is_old: false,
    story_time_spent: 120,
    story_created_at: null,
    story_last_updated_at: null,
  };

  it("accepts a valid story item", () => {
    expect(storyItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null nullable fields", () => {
    expect(
      storyItemSchema.safeParse({
        ...validItem,
        staff_id: null,
        staff_name: null,
        number_of_employees: null,
        is_old: null,
        story_time_spent: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing story_uuid", () => {
    const { story_uuid: _, ...rest } = validItem;
    expect(storyItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty story_uuid", () => {
    expect(
      storyItemSchema.safeParse({ ...validItem, story_uuid: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStoryResultSchema (paginated)
// ---------------------------------------------------------------------------
describe("listStoryResultSchema", () => {
  const validResult = {
    stories: [
      {
        story_uuid: "abc-123",
        request_uuid: "req-456",
        request_position_title: "Engineer",
        staff_id: 1,
        staff_name: "Ahmed",
        number_of_employees: 3,
        story_status: 1,
        is_old: false,
        story_time_spent: 120,
        story_created_at: null,
        story_last_updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listStoryResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty stories array", () => {
    expect(
      listStoryResultSchema.safeParse({
        ...validResult,
        stories: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing stories", () => {
    const { stories: _, ...rest } = validResult;
    expect(listStoryResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listStoryResultSchema.safeParse({ ...validResult, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listStoryResultSchema.safeParse({ ...validResult, page: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listStoryResultSchema.safeParse({
        ...validResult,
        totalPages: -1,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// storyActionResponseSchema
// ---------------------------------------------------------------------------
describe("storyActionResponseSchema", () => {
  it("accepts valid response", () => {
    expect(
      storyActionResponseSchema.safeParse({
        operation: "created",
        message: "Story created",
      }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(
      storyActionResponseSchema.safeParse({ message: "Done" }).success,
    ).toBe(false);
  });

  it("rejects empty operation", () => {
    expect(
      storyActionResponseSchema.safeParse({ operation: "", message: "Done" })
        .success,
    ).toBe(false);
  });

  it("rejects missing message", () => {
    expect(
      storyActionResponseSchema.safeParse({ operation: "created" }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      storyActionResponseSchema.safeParse({
        operation: "created",
        message: "",
      }).success,
    ).toBe(false);
  });
});
