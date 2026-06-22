import { describe, it, expect } from "vitest";
import {
  storyListItemSchema,
  listStoriesResultSchema,
  assignStoryResultSchema,
  updateStoryStatusResultSchema,
} from "./schemas";

const validItem = () => ({
  story_uuid: "story-001",
  request_uuid: "req-001",
  suggestion_uuid: null,
  staff_id: 42,
  number_of_employees: null,
  story_status: 1,
  is_old: null,
  story_time_spent: null,
  story_created_at: "2026-06-01T10:00:00.000Z",
  story_last_updated_at: null,
});

// ---------------------------------------------------------------------------
// storyListItemSchema
// ---------------------------------------------------------------------------

describe("storyListItemSchema", () => {
  it("accepts a valid item", () => {
    const r = storyListItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = storyListItemSchema.safeParse({
      ...validItem(),
      suggestion_uuid: null,
      staff_id: null,
      number_of_employees: null,
      is_old: null,
      story_time_spent: null,
      story_created_at: null,
      story_last_updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing story_uuid", () => {
    const { story_uuid: _, ...rest } = validItem();
    expect(storyListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing request_uuid", () => {
    const { request_uuid: _, ...rest } = validItem();
    expect(storyListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing story_status", () => {
    const { story_status: _, ...rest } = validItem();
    expect(storyListItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStoriesResultSchema
// ---------------------------------------------------------------------------

describe("listStoriesResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listStoriesResultSchema.safeParse({
      stories: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty stories array", () => {
    expect(
      listStoriesResultSchema.safeParse({ stories: [], total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// assignStoryResultSchema
// ---------------------------------------------------------------------------

describe("assignStoryResultSchema", () => {
  it("accepts a valid result", () => {
    expect(assignStoryResultSchema.safeParse({ story_uuid: "story-001", staff_id: 42 }).success).toBe(true);
  });

  it("rejects missing staff_id", () => {
    expect(assignStoryResultSchema.safeParse({ story_uuid: "story-001" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateStoryStatusResultSchema
// ---------------------------------------------------------------------------

describe("updateStoryStatusResultSchema", () => {
  it("accepts a valid result", () => {
    expect(
      updateStoryStatusResultSchema.safeParse({ story_uuid: "story-001", story_status: 2 }).success,
    ).toBe(true);
  });

  it("rejects missing story_status", () => {
    expect(
      updateStoryStatusResultSchema.safeParse({ story_uuid: "story-001" }).success,
    ).toBe(false);
  });
});
