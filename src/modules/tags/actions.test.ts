import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// listTags schema validation
// ---------------------------------------------------------------------------

const listTagsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
});

describe("listTagsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listTagsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listTagsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts search term", () => {
    const result = listTagsSchema.safeParse({ search: "urgent" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("urgent");
    }
  });

  it("rejects limit over 100", () => {
    const result = listTagsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listTagsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTag schema validation
// ---------------------------------------------------------------------------

const getTagSchema = z.object({
  tagId: z.coerce.number().int().positive("Tag ID must be a positive integer"),
});

describe("getTagSchema", () => {
  it("accepts a valid tag ID", () => {
    const result = getTagSchema.safeParse({ tagId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagId).toBe(42);
    }
  });

  it("accepts string-coercible tag ID", () => {
    const result = getTagSchema.safeParse({ tagId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagId).toBe(42);
    }
  });

  it("rejects missing tag ID", () => {
    const result = getTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero tag ID", () => {
    const result = getTagSchema.safeParse({ tagId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative tag ID", () => {
    const result = getTagSchema.safeParse({ tagId: -5 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createTag schema validation
// ---------------------------------------------------------------------------

const createTagSchema = z.object({
  tag: z.string().min(1, "Tag name is required").max(128),
});

describe("createTagSchema", () => {
  it("accepts a valid tag name", () => {
    const result = createTagSchema.safeParse({ tag: "Urgent" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tag).toBe("Urgent");
    }
  });

  it("rejects empty tag name", () => {
    const result = createTagSchema.safeParse({ tag: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing tag field", () => {
    const result = createTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects tag name exceeding 128 chars", () => {
    const result = createTagSchema.safeParse({ tag: "x".repeat(129) });
    expect(result.success).toBe(false);
  });

  it("accepts tag at exactly 128 chars", () => {
    const result = createTagSchema.safeParse({ tag: "x".repeat(128) });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// updateTag schema validation
// ---------------------------------------------------------------------------

const updateTagSchema = z.object({
  tagId: z.coerce.number().int().positive("Tag ID must be a positive integer"),
  tag: z.string().min(1, "Tag name is required").max(128),
});

describe("updateTagSchema", () => {
  it("accepts valid update params", () => {
    const result = updateTagSchema.safeParse({ tagId: 1, tag: "High Priority" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagId).toBe(1);
      expect(result.data.tag).toBe("High Priority");
    }
  });

  it("rejects missing tag name", () => {
    const result = updateTagSchema.safeParse({ tagId: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tagId", () => {
    const result = updateTagSchema.safeParse({ tagId: 0, tag: "Test" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteTag schema validation
// ---------------------------------------------------------------------------

const deleteTagSchema = z.object({
  tagId: z.coerce.number().int().positive("Tag ID must be a positive integer"),
});

describe("deleteTagSchema", () => {
  it("accepts a valid tag ID", () => {
    const result = deleteTagSchema.safeParse({ tagId: 7 });
    expect(result.success).toBe(true);
  });

  it("rejects missing tag ID", () => {
    const result = deleteTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type TagListItem = {
  tag_id: number;
  tag: string;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListTagsResult = {
  tags: TagListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("TagListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: TagListItem = {
      tag_id: 1,
      tag: "Urgent",
      created_at: null,
      updated_at: null,
    };
    expect(mock.tag_id).toBe(1);
    expect(mock.tag).toBe("Urgent");
  });
});

describe("ListTagsResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListTagsResult = {
      tags: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.tags).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Pure function: build tag list query filter
// ---------------------------------------------------------------------------

type TagWhereInput = {
  tag?: { contains: string; mode?: "insensitive" };
};

function buildTagListFilter(search?: string): TagWhereInput | Record<string, never> {
  if (search !== undefined && search.trim().length > 0) {
    return { tag: { contains: search.trim(), mode: "insensitive" } };
  }
  return {};
}

describe("buildTagListFilter", () => {
  it("returns empty object when no search term", () => {
    const result = buildTagListFilter();
    expect(result).toEqual({});
  });

  it("returns empty object for whitespace-only search", () => {
    const result = buildTagListFilter("   ");
    expect(result).toEqual({});
  });

  it("returns case-insensitive contains filter for search term", () => {
    const result = buildTagListFilter("urgent");
    expect(result).toEqual({ tag: { contains: "urgent", mode: "insensitive" } });
  });

  it("trims whitespace from search term", () => {
    const result = buildTagListFilter("  urgent  ");
    expect(result).toEqual({ tag: { contains: "urgent", mode: "insensitive" } });
  });
});
