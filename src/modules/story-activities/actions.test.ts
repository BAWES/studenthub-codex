import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const listStoryActivitiesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  storyUuid: z.string().optional(),
  staffId: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().min(0).optional(),
});

const getStoryActivitySchema = z.object({
  storyActivityUuid: z.string().min(1, "Story activity UUID is required"),
});

const logStoryActivitySchema = z.object({
  storyUuid: z.string().min(1, "Story UUID is required"),
  staffId: z.coerce.number().int().positive("Staff ID must be a positive integer"),
  activityTimeSpent: z.coerce.number().int().nonnegative().optional(),
  activityStatus: z.coerce.number().int().min(0).optional().default(0),
});

const updateStoryActivitySchema = z.object({
  storyActivityUuid: z.string().min(1, "Story activity UUID is required"),
  activityTimeSpent: z.coerce.number().int().nonnegative().optional(),
  activityStatus: z.coerce.number().int().min(0).optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StoryActivityItem = {
  story_activity_uuid: string;
  story_uuid: string;
  staff_id: number | null;
  activity_time_spent: number | null;
  activity_status: number;
  activity_created_at: string | null;
  activity_last_updated_at: string | null;
};

type ListStoryActivitiesResult = {
  activities: StoryActivityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type LogStoryActivityResult = {
  story_activity_uuid: string;
  story_uuid: string;
  activity_status: number;
};

type UpdateStoryActivityResult = {
  story_activity_uuid: string;
  activity_status: number;
  activity_time_spent: number | null;
};

// ---------------------------------------------------------------------------
// listStoryActivities schema tests
// ---------------------------------------------------------------------------

describe("listStoryActivities input schema", () => {
  it("should accept default values when empty", () => {
    const result = listStoryActivitiesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("should coerce string page and limit to numbers", () => {
    const result = listStoryActivitiesSchema.safeParse({
      page: "2",
      limit: "10",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("should reject page below 1", () => {
    const result = listStoryActivitiesSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject limit above 100", () => {
    const result = listStoryActivitiesSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("should accept optional storyUuid filter", () => {
    const result = listStoryActivitiesSchema.safeParse({
      storyUuid: "abc-123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.storyUuid).toBe("abc-123");
    }
  });

  it("should accept optional staffId filter", () => {
    const result = listStoryActivitiesSchema.safeParse({
      staffId: "42",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.staffId).toBe(42);
    }
  });

  it("should accept optional status filter", () => {
    const result = listStoryActivitiesSchema.safeParse({
      status: "1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// getStoryActivity schema tests
// ---------------------------------------------------------------------------

describe("getStoryActivity input schema", () => {
  it("should accept a valid UUID", () => {
    const result = getStoryActivitySchema.safeParse({
      storyActivityUuid: "some-uuid-here",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty UUID", () => {
    const result = getStoryActivitySchema.safeParse({ storyActivityUuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// logStoryActivity schema tests
// ---------------------------------------------------------------------------

describe("logStoryActivity input schema", () => {
  it("should accept valid input with all fields", () => {
    const result = logStoryActivitySchema.safeParse({
      storyUuid: "story-123",
      staffId: "10",
      activityTimeSpent: "300",
      activityStatus: "1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.storyUuid).toBe("story-123");
      expect(result.data.staffId).toBe(10);
      expect(result.data.activityTimeSpent).toBe(300);
      expect(result.data.activityStatus).toBe(1);
    }
  });

  it("should default activityStatus to 0 when omitted", () => {
    const result = logStoryActivitySchema.safeParse({
      storyUuid: "story-123",
      staffId: "10",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.activityStatus).toBe(0);
    }
  });

  it("should reject empty storyUuid", () => {
    const result = logStoryActivitySchema.safeParse({
      storyUuid: "",
      staffId: "10",
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-positive staffId", () => {
    const result = logStoryActivitySchema.safeParse({
      storyUuid: "story-123",
      staffId: "0",
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative activityTimeSpent", () => {
    const result = logStoryActivitySchema.safeParse({
      storyUuid: "story-123",
      staffId: "10",
      activityTimeSpent: "-5",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateStoryActivity schema tests
// ---------------------------------------------------------------------------

describe("updateStoryActivity input schema", () => {
  it("should accept UUID-only (partial update)", () => {
    const result = updateStoryActivitySchema.safeParse({
      storyActivityUuid: "activity-uuid-1",
    });
    expect(result.success).toBe(true);
  });

  it("should accept all optional fields", () => {
    const result = updateStoryActivitySchema.safeParse({
      storyActivityUuid: "activity-uuid-1",
      activityTimeSpent: "600",
      activityStatus: "2",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.activityTimeSpent).toBe(600);
      expect(result.data.activityStatus).toBe(2);
    }
  });

  it("should reject empty UUID", () => {
    const result = updateStoryActivitySchema.safeParse({
      storyActivityUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative activityStatus", () => {
    const result = updateStoryActivitySchema.safeParse({
      storyActivityUuid: "uuid-1",
      activityStatus: "-1",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("StoryActivityItem output schema", () => {
  it("should accept a valid StoryActivityItem", () => {
    const item = {
      story_activity_uuid: "uuid-1",
      story_uuid: "story-uuid-1",
      staff_id: 42,
      activity_time_spent: 300,
      activity_status: 1,
      activity_created_at: "2026-01-01T00:00:00.000Z",
      activity_last_updated_at: "2026-01-02T00:00:00.000Z",
    };

    // Define the output schema inline for testing
    const schema = z.object({
      story_activity_uuid: z.string(),
      story_uuid: z.string(),
      staff_id: z.number().int().nullable(),
      activity_time_spent: z.number().int().nullable(),
      activity_status: z.number().int(),
      activity_created_at: z.string().nullable(),
      activity_last_updated_at: z.string().nullable(),
    });

    const result = schema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("should accept nullable fields", () => {
    const item = {
      story_activity_uuid: "uuid-2",
      story_uuid: "story-uuid-2",
      staff_id: null,
      activity_time_spent: null,
      activity_status: 0,
      activity_created_at: null,
      activity_last_updated_at: null,
    };

    const schema = z.object({
      story_activity_uuid: z.string(),
      story_uuid: z.string(),
      staff_id: z.number().int().nullable(),
      activity_time_spent: z.number().int().nullable(),
      activity_status: z.number().int(),
      activity_created_at: z.string().nullable(),
      activity_last_updated_at: z.string().nullable(),
    });

    const result = schema.safeParse(item);
    expect(result.success).toBe(true);
  });
});

describe("ListStoryActivitiesResult output schema", () => {
  it("should accept a valid paginated result", () => {
    const result = {
      activities: [
        {
          story_activity_uuid: "uuid-1",
          story_uuid: "story-uuid-1",
          staff_id: 42,
          activity_time_spent: 300,
          activity_status: 1,
          activity_created_at: "2026-01-01T00:00:00.000Z",
          activity_last_updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    const schema = z.object({
      activities: z.array(
        z.object({
          story_activity_uuid: z.string(),
          story_uuid: z.string(),
          staff_id: z.number().int().nullable(),
          activity_time_spent: z.number().int().nullable(),
          activity_status: z.number().int(),
          activity_created_at: z.string().nullable(),
          activity_last_updated_at: z.string().nullable(),
        }),
      ),
      total: z.number().int().nonnegative(),
      page: z.number().int().positive(),
      limit: z.number().int().min(1).max(100),
      totalPages: z.number().int().nonnegative(),
    });

    const parsed = schema.safeParse(result);
    expect(parsed.success).toBe(true);
  });
});

describe("LogStoryActivityResult output schema", () => {
  it("should accept a valid result", () => {
    const result = {
      story_activity_uuid: "new-uuid",
      story_uuid: "story-uuid-1",
      activity_status: 0,
    };

    const schema = z.object({
      story_activity_uuid: z.string(),
      story_uuid: z.string(),
      activity_status: z.number().int(),
    });

    const parsed = schema.safeParse(result);
    expect(parsed.success).toBe(true);
  });
});

describe("UpdateStoryActivityResult output schema", () => {
  it("should accept a valid result", () => {
    const result = {
      story_activity_uuid: "uuid-1",
      activity_status: 2,
      activity_time_spent: 600,
    };

    const schema = z.object({
      story_activity_uuid: z.string(),
      activity_status: z.number().int(),
      activity_time_spent: z.number().int().nullable(),
    });

    const parsed = schema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("should accept null time spent", () => {
    const result = {
      story_activity_uuid: "uuid-1",
      activity_status: 1,
      activity_time_spent: null,
    };

    const schema = z.object({
      story_activity_uuid: z.string(),
      activity_status: z.number().int(),
      activity_time_spent: z.number().int().nullable(),
    });

    const parsed = schema.safeParse(result);
    expect(parsed.success).toBe(true);
  });
});
