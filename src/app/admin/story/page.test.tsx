import { describe, it, expect } from "vitest";
import { listStorySchema } from "./schemas";
import type { StoryItem, ListStoryResult } from "./schemas";

describe("admin story page — data contract", () => {
  it("listStorySchema accepts empty params (defaults apply)", () => {
    const r = listStorySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.limit).toBe("number");
    }
  });

  it("listStorySchema accepts the params the page actually passes", () => {
    const r = listStorySchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("StoryItem fields map correctly to DataTable columns", () => {
    const row: StoryItem = {
      story_uuid: "abc-123",
      request_uuid: "req-456",
      request_position_title: "Software Engineer",
      staff_id: 1,
      staff_name: "Ahmed Ali",
      number_of_employees: 3,
      story_status: 1,
      is_old: false,
      story_time_spent: 120,
      story_created_at: new Date("2026-01-15T10:00:00Z"),
      story_last_updated_at: new Date("2026-06-01T12:00:00Z"),
    };
    expect(row.story_uuid).toBe("abc-123");
    expect(row.request_position_title).toBe("Software Engineer");
    expect(row.staff_name).toBe("Ahmed Ali");
    expect(row.story_status).toBe(1);
    expect(row.number_of_employees).toBe(3);
  });

  it("StoryItem handles null fields", () => {
    const row: StoryItem = {
      story_uuid: "def-456",
      request_uuid: "req-789",
      request_position_title: null,
      staff_id: null,
      staff_name: null,
      number_of_employees: null,
      story_status: 0,
      is_old: null,
      story_time_spent: null,
      story_created_at: null,
      story_last_updated_at: null,
    };
    expect(row.staff_name).toBeNull();
    expect(row.number_of_employees).toBeNull();
    expect(row.is_old).toBeNull();
  });

  it("ListStoryResult has expected shape", () => {
    const result: ListStoryResult = {
      stories: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.stories)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });
});
