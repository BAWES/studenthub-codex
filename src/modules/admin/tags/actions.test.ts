import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listTagsSchema,
  createTagSchema,
  updateTagSchema,
  deleteTagSchema,
  tagItemSchema,
  listTagsResultSchema,
  tagActionResponseSchema,
} from "./schemas";
import type { TagItem, ListTagsResult } from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockRevalidatePath, mockFindMany, mockCount, mockFindUnique, mockCreate, mockUpdate, mockDelete } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockFindMany: vi.fn(),
    mockCount: vi.fn(),
    mockFindUnique: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
  }));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    tag: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

import { listTags, createTag, updateTag, deleteTag } from "./actions";

// ---------------------------------------------------------------------------
// Input schema validation
// ---------------------------------------------------------------------------

describe("listTagsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listTagsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listTagsSchema.safeParse({ page: 2, limit: 25 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });

  it("rejects limit over 200", () => {
    const result = listTagsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listTagsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listTagsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listTagsSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it("coerces string limit to number", () => {
    const result = listTagsSchema.safeParse({ limit: "25" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
    }
  });
});



describe("createTagSchema", () => {
  it("accepts a valid tag name", () => {
    const result = createTagSchema.safeParse({ tag: "JavaScript" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tag).toBe("JavaScript");
    }
  });

  it("rejects empty tag name", () => {
    const result = createTagSchema.safeParse({ tag: "" });
    expect(result.success).toBe(false);
  });

  it("rejects tag name over 128 chars", () => {
    const result = createTagSchema.safeParse({ tag: "a".repeat(129) });
    expect(result.success).toBe(false);
  });

  it("rejects missing tag field", () => {
    const result = createTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateTagSchema", () => {
  it("accepts valid update params", () => {
    const result = updateTagSchema.safeParse({ tagId: 1, tag: "TypeScript" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagId).toBe(1);
      expect(result.data.tag).toBe("TypeScript");
    }
  });

  it("rejects empty tag name", () => {
    const result = updateTagSchema.safeParse({ tagId: 1, tag: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing tagId", () => {
    const result = updateTagSchema.safeParse({ tag: "React" });
    expect(result.success).toBe(false);
  });
});

describe("deleteTagSchema", () => {
  it("accepts a valid tag ID", () => {
    const result = deleteTagSchema.safeParse({ tagId: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagId).toBe(10);
    }
  });

  it("rejects missing tagId", () => {
    const result = deleteTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero tagId", () => {
    const result = deleteTagSchema.safeParse({ tagId: 0 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("tagItemSchema", () => {
  it("accepts a valid tag item", () => {
    const item: TagItem = {
      tag_id: 1,
      tag: "JavaScript",
      created_at: new Date("2025-01-01"),
      updated_at: new Date("2025-01-15"),
    };
    const result = tagItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts nullable dates", () => {
    const item: TagItem = {
      tag_id: 2,
      tag: "React",
      created_at: null,
      updated_at: null,
    };
    const result = tagItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing tag field", () => {
    const result = tagItemSchema.safeParse({ tag_id: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric tag_id", () => {
    const result = tagItemSchema.safeParse({
      tag_id: "not-a-number",
      tag: "Test",
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("listTagsResultSchema", () => {
  it("accepts a valid list result with items", () => {
    const result: ListTagsResult = {
      tags: [
        { tag_id: 1, tag: "JavaScript", created_at: new Date("2025-01-01"), updated_at: null },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    };
    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts empty tags array", () => {
    const result: ListTagsResult = {
      tags: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects non-array tags", () => {
    const result = {
      tags: "not-an-array",
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it("rejects negative total", () => {
    const result = {
      tags: [],
      total: -1,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});



describe("tagActionResponseSchema", () => {
  it("accepts a success response", () => {
    const result = { operation: "success", message: "Tag created successfully" };
    const parsed = tagActionResponseSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts an error response", () => {
    const result = { operation: "error", message: "Tag not found" };
    const parsed = tagActionResponseSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const result = { message: "Something" };
    const parsed = tagActionResponseSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it("rejects empty message", () => {
    const result = { operation: "success", message: "" };
    const parsed = tagActionResponseSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — mocked DB
// ---------------------------------------------------------------------------

describe("listTags action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const dbRows = [
      { tag_id: 1, tag: "JavaScript", created_at: new Date("2025-01-01"), updated_at: null },
      { tag_id: 2, tag: "React", created_at: new Date("2025-01-02"), updated_at: null },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(2);

    const result = await listTags({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { tag: "asc" },
        skip: 0,
        take: 50,
      }),
    );
    expect(result.tags).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(1);

    // Verify shape mapping
    expect(result.tags[0]).toEqual({
      tag_id: 1,
      tag: "JavaScript",
      created_at: dbRows[0].created_at,
      updated_at: null,
    });
  });

  it("handles pagination correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    await listTags({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("computes totalPages correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(55);

    const result = await listTags({ page: 1, limit: 20 });

    expect(result.totalPages).toBe(3); // ceil(55/20) = 3
  });

  it("returns empty result when no tags exist", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listTags({});

    expect(result.tags).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("throws when session fails (requireCapability rejects)", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listTags({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});



describe("createTag action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a tag successfully", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue({ tag_id: 1, tag: "NewTag", created_at: new Date(), updated_at: null });

    const result = await createTag("NewTag");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockCreate).toHaveBeenCalledWith({ data: { tag: "NewTag" } });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/tags");
    expect(result.operation).toBe("success");
    expect(result.message).toBe("Tag created successfully");
  });

  it("returns error for empty tag name", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await createTag("");

    expect(result.operation).toBe("error");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns error when prisma.create throws", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockRejectedValue(new Error("DB error"));

    const result = await createTag("FailingTag");

    expect(result.operation).toBe("error");
    expect(result.message).toContain("problem");
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(createTag("Test")).rejects.toThrow("Unauthorized");
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe("updateTag action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a tag successfully", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ tag_id: 1 });

    const result = await updateTag(1, "UpdatedName");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { tag_id: 1 }, select: { tag_id: true } });
    expect(mockUpdate).toHaveBeenCalledWith({ where: { tag_id: 1 }, data: { tag: "UpdatedName" } });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/tags");
    expect(result.operation).toBe("success");
    expect(result.message).toBe("Tag successfully updated");
  });

  it("returns error when tag not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await updateTag(999, "Ghost");

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Tag not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error for empty tag name", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await updateTag(1, "");

    expect(result.operation).toBe("error");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns error when prisma.update throws", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ tag_id: 1 });
    mockUpdate.mockRejectedValue(new Error("DB error"));

    const result = await updateTag(1, "FailUpdate");

    expect(result.operation).toBe("error");
    expect(result.message).toContain("problem");
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(updateTag(1, "Test")).rejects.toThrow("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("deleteTag action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a tag successfully", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ tag_id: 5 });

    const result = await deleteTag(5);

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { tag_id: 5 }, select: { tag_id: true } });
    expect(mockDelete).toHaveBeenCalledWith({ where: { tag_id: 5 } });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/tags");
    expect(result.operation).toBe("success");
    expect(result.message).toBe("Tag deleted successfully");
  });

  it("returns error when tag not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await deleteTag(999);

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Tag not found");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns error when prisma.delete throws", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ tag_id: 5 });
    mockDelete.mockRejectedValue(new Error("DB error"));

    const result = await deleteTag(5);

    expect(result.operation).toBe("error");
    expect(result.message).toContain("problem");
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(deleteTag(1)).rejects.toThrow("Unauthorized");
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
