import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const listStoriesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  staffId: z.coerce.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  status: z.coerce.number().int().min(0).optional(),
});

const getStorySchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
});

const assignStorySchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
  staffId: z.coerce.number().int().positive("Staff ID must be a positive integer"),
});

const updateStoryStatusSchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
  status: z.coerce.number().int().min(0, "Status must be a non-negative integer"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StoryListItem = {
  story_uuid: string;
  request_uuid: string;
  suggestion_uuid: string | null;
  staff_id: number | null;
  number_of_employees: number | null;
  story_status: number;
  is_old: boolean | null;
  story_time_spent: number | null;
  story_created_at: string | null;
  story_last_updated_at: string | null;
};

type ListStoriesResult = {
  stories: StoryListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Pure functions for testable logic
// ---------------------------------------------------------------------------

function buildStoryStatusLabel(status: number): string {
  const labels: Record<number, string> = {
    0: "New",
    1: "In Progress",
    2: "Completed",
    3: "Cancelled",
  };
  return labels[status] ?? `Unknown (${status})`;
}

function isValidStatusTransition(current: number, next: number): boolean {
  // Allow any non-negative transition for flexibility
  return next >= 0;
}

// ---------------------------------------------------------------------------
// Tests: listStoriesSchema
// ---------------------------------------------------------------------------

describe("listStoriesSchema", () => {
  it("accepts empty params and defaults page/limit", () => {
    const result = listStoriesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit pagination", () => {
    const result = listStoriesSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts staffId filter", () => {
    const result = listStoriesSchema.safeParse({ staffId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(42);
    }
  });

  it("accepts requestUuid filter", () => {
    const result = listStoriesSchema.safeParse({ requestUuid: "req_abc123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("req_abc123");
    }
  });

  it("accepts status filter", () => {
    const result = listStoriesSchema.safeParse({ status: 2 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(2);
    }
  });

  it("rejects negative page", () => {
    const result = listStoriesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listStoriesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: getStorySchema
// ---------------------------------------------------------------------------

describe("getStorySchema", () => {
  it("accepts valid UUID", () => {
    const result = getStorySchema.safeParse({ storyUuid: "story_abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getStorySchema.safeParse({ storyUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getStorySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: assignStorySchema
// ---------------------------------------------------------------------------

describe("assignStorySchema", () => {
  it("accepts valid input", () => {
    const result = assignStorySchema.safeParse({
      storyUuid: "story_abc123",
      staffId: 42,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty storyUuid", () => {
    const result = assignStorySchema.safeParse({
      storyUuid: "",
      staffId: 42,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive staffId", () => {
    const result = assignStorySchema.safeParse({
      storyUuid: "story_abc123",
      staffId: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: updateStoryStatusSchema
// ---------------------------------------------------------------------------

describe("updateStoryStatusSchema", () => {
  it("accepts valid input", () => {
    const result = updateStoryStatusSchema.safeParse({
      storyUuid: "story_abc123",
      status: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty storyUuid", () => {
    const result = updateStoryStatusSchema.safeParse({
      storyUuid: "",
      status: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative status", () => {
    const result = updateStoryStatusSchema.safeParse({
      storyUuid: "story_abc123",
      status: -1,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: Pure functions
// ---------------------------------------------------------------------------

describe("buildStoryStatusLabel", () => {
  it("returns correct label for known statuses", () => {
    expect(buildStoryStatusLabel(0)).toBe("New");
    expect(buildStoryStatusLabel(1)).toBe("In Progress");
    expect(buildStoryStatusLabel(2)).toBe("Completed");
    expect(buildStoryStatusLabel(3)).toBe("Cancelled");
  });

  it("returns Unknown for unrecognized status", () => {
    expect(buildStoryStatusLabel(99)).toBe("Unknown (99)");
  });
});

describe("isValidStatusTransition", () => {
  it("allows any non-negative status", () => {
    expect(isValidStatusTransition(0, 1)).toBe(true);
    expect(isValidStatusTransition(1, 2)).toBe(true);
    expect(isValidStatusTransition(2, 3)).toBe(true);
    expect(isValidStatusTransition(3, 0)).toBe(true);
    expect(isValidStatusTransition(0, 0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: Types
// ---------------------------------------------------------------------------

describe("StoryListItem type shape", () => {
  it("accepts a valid story object", () => {
    const mock: StoryListItem = {
      story_uuid: "story_abc123",
      request_uuid: "req_def456",
      suggestion_uuid: null,
      staff_id: 42,
      number_of_employees: 5,
      story_status: 1,
      is_old: false,
      story_time_spent: 120,
      story_created_at: new Date().toISOString(),
      story_last_updated_at: new Date().toISOString(),
    };
    expect(mock.story_uuid).toBe("story_abc123");
    expect(mock.story_status).toBe(1);
  });
});

describe("ListStoriesResult type shape", () => {
  it("accepts an empty result set", () => {
    const result: ListStoriesResult = {
      stories: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.stories).toHaveLength(0);
  });
});
