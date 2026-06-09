import { describe, it, expect } from "vitest";
import {
  listStoriesSchema,
  assignStorySchema,
  getActiveStorySchema,
  listOldStoriesSchema,
  getStorySchema,
} from "./story-schemas";
import type {
  StoryItem,
  StoryDetail,
  ListStoriesResult,
  ActiveStoryResult,
} from "./story-schemas";

// ---------------------------------------------------------------------------
// Schema tests — listStories
// ---------------------------------------------------------------------------

describe("listStoriesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listStoriesSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts full filter params", () => {
    const r = listStoriesSchema.safeParse({
      page: 2,
      limit: 50,
      status: 0,
      keyword: "developer",
      staffId: 42,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
      expect(r.data.status).toBe(0);
      expect(r.data.keyword).toBe("developer");
      expect(r.data.staffId).toBe(42);
    }
  });

  it("rejects limit over 100", () => {
    expect(listStoriesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listStoriesSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — getStory
// ---------------------------------------------------------------------------

describe("getStorySchema", () => {
  it("accepts valid story UUID", () => {
    const r = getStorySchema.safeParse({ storyUuid: "story_abc123" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.storyUuid).toBe("story_abc123");
    }
  });

  it("rejects empty story UUID", () => {
    const r = getStorySchema.safeParse({ storyUuid: "" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — assignStory
// ---------------------------------------------------------------------------

describe("assignStorySchema", () => {
  it("accepts valid story UUID and staff ID", () => {
    const r = assignStorySchema.safeParse({
      storyUuid: "story_def456",
      staffId: 15,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.storyUuid).toBe("story_def456");
      expect(r.data.staffId).toBe(15);
    }
  });

  it("rejects empty story UUID", () => {
    expect(assignStorySchema.safeParse({ storyUuid: "", staffId: 1 }).success).toBe(false);
  });

  it("rejects negative staff ID", () => {
    expect(assignStorySchema.safeParse({ storyUuid: "story_abc", staffId: -1 }).success).toBe(false);
  });

  it("rejects zero staff ID", () => {
    expect(assignStorySchema.safeParse({ storyUuid: "story_abc", staffId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — getActiveStory
// ---------------------------------------------------------------------------

describe("getActiveStorySchema", () => {
  it("accepts valid staff ID", () => {
    const r = getActiveStorySchema.safeParse({ staffId: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.staffId).toBe(10);
    }
  });

  it("rejects negative staff ID", () => {
    expect(getActiveStorySchema.safeParse({ staffId: -5 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema tests — listOldStories
// ---------------------------------------------------------------------------

describe("listOldStoriesSchema", () => {
  it("accepts valid staff ID with pagination", () => {
    const r = listOldStoriesSchema.safeParse({ staffId: 10, page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.staffId).toBe(10);
      expect(r.data.page).toBe(1);
    }
  });

  it("accepts minimal params", () => {
    const r = listOldStoriesSchema.safeParse({ staffId: 10 });
    expect(r.success).toBe(true);
  });

  it("rejects negative staff ID", () => {
    expect(listOldStoriesSchema.safeParse({ staffId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — StoryItem
// ---------------------------------------------------------------------------

describe("StoryItem type", () => {
  it("has the required shape", () => {
    const item: StoryItem = {
      story_uuid: "story_abc123",
      request_uuid: "req_def456",
      staff_id: 42,
      number_of_employees: 3,
      story_status: 0,
      is_old: false,
      story_created_at: new Date("2026-01-01T00:00:00Z"),
      story_last_updated_at: new Date("2026-01-02T00:00:00Z"),
      request: {
        request_position_title: "Software Engineer",
        request_position_type: 1,
        company: { company_name: "StudentHub" },
      },
      staff: { staff_name: "John Doe" },
    };
    expect(item.story_uuid).toBe("story_abc123");
    expect(item.request.request_position_title).toBe("Software Engineer");
    expect(item.staff?.staff_name).toBe("John Doe");
  });

  it("accepts null optional fields", () => {
    const item: StoryItem = {
      story_uuid: "story_abc",
      request_uuid: "req_def",
      staff_id: null,
      number_of_employees: null,
      story_status: 0,
      is_old: null,
      story_created_at: null,
      story_last_updated_at: null,
      request: {
        request_position_title: null,
        request_position_type: null,
        company: null,
      },
      staff: null,
    };
    expect(item.staff).toBeNull();
    expect(item.number_of_employees).toBeNull();
    expect(item.request.company).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — StoryDetail
// ---------------------------------------------------------------------------

describe("StoryDetail type", () => {
  it("has the correct shape", () => {
    const detail: StoryDetail = {
      story_uuid: "story_detail_1",
      request_uuid: "req_detail_1",
      staff_id: 10,
      number_of_employees: 2,
      story_status: 1,
      is_old: false,
      story_time_spent: 3600,
      story_created_at: new Date(),
      story_last_updated_at: new Date(),
      request: {
        request_position_title: "DevOps Engineer",
        request_position_type: 2,
        request_status: "started",
        request_priority: 2,
        company: { company_name: "CloudCo" },
      },
      staff: { staff_name: "Alice" },
      story_activity: [
        {
          activity_status: 1,
          activity_created_at: new Date(),
          staff: { staff_name: "Alice" },
        },
      ],
    };
    expect(detail.story_activity).toHaveLength(1);
    expect(detail.request.company?.company_name).toBe("CloudCo");
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — ListStoriesResult
// ---------------------------------------------------------------------------

describe("ListStoriesResult type", () => {
  it("has the correct shape", () => {
    const result: ListStoriesResult = {
      stories: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.stories).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests — ActiveStoryResult
// ---------------------------------------------------------------------------

describe("ActiveStoryResult type", () => {
  it("has the correct shape", () => {
    const result: ActiveStoryResult = {
      operation: "success",
      stories: [],
    };
    expect(result.operation).toBe("success");
    expect(result.stories).toHaveLength(0);
  });

  it("can represent an error", () => {
    const result: ActiveStoryResult = {
      operation: "error",
      message: "No active story found",
    };
    expect(result.operation).toBe("error");
    expect(result.message).toBe("No active story found");
  });
});
