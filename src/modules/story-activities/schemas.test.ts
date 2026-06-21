import { describe, it, expect } from "vitest";
import {
  storyActivityItemSchema,
  listStoryActivitiesResultSchema,
  logStoryActivityResultSchema,
  updateStoryActivityResultSchema,
} from "./schemas";

const validItem = () => ({
  story_activity_uuid: "sa-001",
  story_uuid: "story-001",
  staff_id: null,
  activity_time_spent: null,
  activity_status: 1,
  activity_created_at: null,
  activity_last_updated_at: null,
});

// ---------------------------------------------------------------------------
// storyActivityItemSchema
// ---------------------------------------------------------------------------

describe("storyActivityItemSchema", () => {
  it("accepts a valid item", () => {
    const r = storyActivityItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = storyActivityItemSchema.safeParse({
      ...validItem(),
      staff_id: null,
      activity_time_spent: null,
      activity_created_at: null,
      activity_last_updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing story_activity_uuid", () => {
    const { story_activity_uuid: _, ...rest } = validItem();
    expect(storyActivityItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing story_uuid", () => {
    const { story_uuid: _, ...rest } = validItem();
    expect(storyActivityItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing activity_status", () => {
    const { activity_status: _, ...rest } = validItem();
    expect(storyActivityItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStoryActivitiesResultSchema
// ---------------------------------------------------------------------------

describe("listStoryActivitiesResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listStoryActivitiesResultSchema.safeParse({
      activities: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty activities array", () => {
    expect(
      listStoryActivitiesResultSchema.safeParse({ activities: [], total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// logStoryActivityResultSchema
// ---------------------------------------------------------------------------

describe("logStoryActivityResultSchema", () => {
  it("accepts a valid result", () => {
    expect(
      logStoryActivityResultSchema.safeParse({
        story_activity_uuid: "sa-001",
        story_uuid: "story-001",
        activity_status: 1,
      }).success,
    ).toBe(true);
  });

  it("rejects missing story_uuid", () => {
    expect(
      logStoryActivityResultSchema.safeParse({ story_activity_uuid: "sa-001", activity_status: 1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateStoryActivityResultSchema
// ---------------------------------------------------------------------------

describe("updateStoryActivityResultSchema", () => {
  it("accepts a valid result", () => {
    expect(
      updateStoryActivityResultSchema.safeParse({
        story_activity_uuid: "sa-001",
        activity_status: 2,
        activity_time_spent: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing activity_status", () => {
    expect(
      updateStoryActivityResultSchema.safeParse({
        story_activity_uuid: "sa-001",
        activity_time_spent: null,
      }).success,
    ).toBe(false);
  });
});
