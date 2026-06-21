import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listStoriesSchema,
  storyItemSchema,
  listStoriesResultSchema,
} from "../schemas";
import type { StoryItem, ListStoriesResult } from "../schemas";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockRevalidatePath,
  mockFindMany,
  mockCount,
  mockFindUnique,
  mockCreate,
  mockUpdate,
  mockDelete,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    story: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

import { listStories, createStory, updateStory, deleteStory } from "../actions";
import { getStoryDetail } from "../actions";

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

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("storyItemSchema", () => {
  it("accepts a valid story item", () => {
    const item: StoryItem = {
      story_uuid: "abc-123",
      request_uuid: "req-001",
      request_position_title: "Engineer",
      staff_id: 42,
      staff_name: "John",
      number_of_employees: 5,
      story_status: 1,
      is_old: false,
      story_time_spent: 120,
      story_last_updated_at: "2026-06-15T10:00:00.000Z",
    };
    expect(storyItemSchema.safeParse(item).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const item: StoryItem = {
      story_uuid: "abc",
      request_uuid: "req-001",
      request_position_title: null,
      staff_id: null,
      staff_name: null,
      number_of_employees: null,
      story_status: 0,
      is_old: null,
      story_time_spent: null,
      story_last_updated_at: null,
    };
    expect(storyItemSchema.safeParse(item).success).toBe(true);
  });

  it("rejects missing story_uuid", () => {
    expect(storyItemSchema.safeParse({ request_uuid: "req-1", story_status: 0 }).success).toBe(false);
  });
});

describe("listStoriesResultSchema", () => {
  it("accepts a valid list result", () => {
    const result: ListStoriesResult = {
      stories: [{
        story_uuid: "abc",
        request_uuid: "req-001",
        request_position_title: null,
        staff_id: null,
        staff_name: null,
        number_of_employees: null,
        story_status: 0,
        is_old: null,
        story_time_spent: null,
        story_last_updated_at: null,
      }],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    };
    expect(listStoriesResultSchema.safeParse(result).success).toBe(true);
  });

  it("accepts empty array", () => {
    const r: ListStoriesResult = { stories: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    expect(listStoriesResultSchema.safeParse(r).success).toBe(true);
  });

  it("rejects non-array stories", () => {
    expect(listStoriesResultSchema.safeParse({ stories: "bad", total: 0, page: 1, limit: 50, totalPages: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — mocked DB
// ---------------------------------------------------------------------------

describe("listStories action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const dbRows = [{
      story_uuid: "abc-123",
      request_uuid: "req-001",
      staff_id: 42,
      number_of_employees: 5,
      story_status: 1,
      is_old: false,
      story_time_spent: 120,
      story_last_updated_at: new Date("2026-06-15"),
      request: { request_position_title: "Engineer" },
      staff: { staff_name: "John" },
    }];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(1);

    const result = await listStories({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { story_last_updated_at: "desc" },
        skip: 0,
        take: 50,
      }),
    );
    expect(result.stories).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.stories[0].request_position_title).toBe("Engineer");
    expect(result.stories[0].staff_name).toBe("John");
  });

  it("handles pagination correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    await listStories({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it("returns empty result when no stories", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listStories({});
    expect(result.stories).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));
    await expect(listStories({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

describe("createStory action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a story with valid data", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue({ story_uuid: "new-uuid" });

    const formData = new FormData();
    formData.set("requestUuid", "req-abc");
    formData.set("staffId", "42");
    formData.set("numberOfEmployees", "5");
    formData.set("storyStatus", "1");

    const result = await createStory(null, formData);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          request_uuid: "req-abc",
          staff_id: 42,
          number_of_employees: 5,
          story_status: 1,
        }),
      }),
    );
    expect(result.operation).toBe("success");
  });

  it("returns error on missing requestUuid", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await createStory(null, new FormData());
    expect(result.operation).toBe("error");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns error on DB failure", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockRejectedValue(new Error("DB error"));

    const formData = new FormData();
    formData.set("requestUuid", "req-abc");

    const result = await createStory(null, formData);
    expect(result.operation).toBe("error");
  });
});

describe("updateStory action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a story with valid data", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ story_uuid: "str-abc" });
    mockUpdate.mockResolvedValue({ story_uuid: "str-abc" });

    const formData = new FormData();
    formData.set("storyUuid", "str-abc");
    formData.set("requestUuid", "req-def");
    formData.set("storyStatus", "2");

    const result = await updateStory(null, formData);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { story_uuid: "str-abc" },
        data: expect.objectContaining({
          request_uuid: "req-def",
          story_status: 2,
        }),
      }),
    );
    expect(result.operation).toBe("success");
  });

  it("returns error when story not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const formData = new FormData();
    formData.set("storyUuid", "nonexistent");
    formData.set("requestUuid", "req-def");
    formData.set("storyStatus", "0");

    const result = await updateStory(null, formData);
    expect(result.operation).toBe("error");
    expect(result.message).toContain("not found");
  });

  it("returns error on invalid input", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await updateStory(null, new FormData());
    expect(result.operation).toBe("error");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("deleteStory action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a story that exists", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ story_uuid: "str-abc" });
    mockDelete.mockResolvedValue({ story_uuid: "str-abc" });

    const result = await deleteStory("str-abc");
    expect(result.operation).toBe("success");
    expect(mockDelete).toHaveBeenCalledWith({ where: { story_uuid: "str-abc" } });
  });

  it("returns error when story not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await deleteStory("nonexistent");
    expect(result.operation).toBe("error");
    expect(mockDelete).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getStoryDetail
// ---------------------------------------------------------------------------

describe("getStoryDetail action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a story item for a valid uuid", async () => {
    const dbRow = {
      story_uuid: "abc-123",
      request_uuid: "req-001",
      staff_id: 42,
      number_of_employees: 5,
      story_status: 1,
      is_old: false,
      story_time_spent: 120,
      story_last_updated_at: new Date("2026-06-15"),
      request: { request_position_title: "Engineer" },
      staff: { staff_name: "John" },
    };

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(dbRow);

    const result = await getStoryDetail("abc-123");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { story_uuid: "abc-123" },
      select: expect.any(Object),
    });
    expect(result).not.toBeNull();
    expect(result!.story_uuid).toBe("abc-123");
    expect(result!.request_uuid).toBe("req-001");
    expect(result!.request_position_title).toBe("Engineer");
    expect(result!.staff_name).toBe("John");
    expect(result!.story_status).toBe(1);
    expect(result!.story_time_spent).toBe(120);
  });

  it("returns null when story not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await getStoryDetail("nonexistent");
    expect(result).toBeNull();
  });

  it("returns null when required capability is missing", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getStoryDetail("abc-123")).rejects.toThrow("Unauthorized");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});
