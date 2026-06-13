import { describe, it, expect } from "vitest";
import {
  tagItemSchema,
  listTagsResultSchema,
  type TagItem,
  type ListTagsResult,
} from "@/modules/tags/schemas";

// ---------------------------------------------------------------------------
// tagItemSchema
// ---------------------------------------------------------------------------

describe("tagItemSchema", () => {
  it("parses a valid tag item", () => {
    const item: TagItem = {
      tag_id: 1,
      tag: "Part-Time",
      created_at: new Date("2024-01-15T10:00:00Z"),
      updated_at: new Date("2024-06-01T12:00:00Z"),
    };

    const result = tagItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts nullable date fields", () => {
    const item = {
      tag_id: 2,
      tag: "Internship",
      created_at: null,
      updated_at: null,
    };

    const result = tagItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing tag_id", () => {
    const result = tagItemSchema.safeParse({
      tag: "Full-Time",
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing tag", () => {
    const result = tagItemSchema.safeParse({
      tag_id: 3,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string tag", () => {
    const result = tagItemSchema.safeParse({
      tag_id: 4,
      tag: 123,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-number tag_id", () => {
    const result = tagItemSchema.safeParse({
      tag_id: "abc",
      tag: "Seasonal",
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string tag", () => {
    const result = tagItemSchema.safeParse({
      tag_id: 5,
      tag: "",
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listTagsResultSchema
// ---------------------------------------------------------------------------

function makeValidTag(overrides: Partial<TagItem> = {}): TagItem {
  return {
    tag_id: 1,
    tag: "Part-Time",
    created_at: new Date("2024-01-15T10:00:00Z"),
    updated_at: null,
    ...overrides,
  };
}

describe("listTagsResultSchema", () => {
  it("parses a valid list result with tags", () => {
    const result: ListTagsResult = {
      tags: [
        makeValidTag({ tag_id: 1, tag: "Part-Time" }),
        makeValidTag({ tag_id: 2, tag: "Full-Time" }),
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("parses an empty list result", () => {
    const result: ListTagsResult = {
      tags: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };

    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = {
      tags: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };

    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = {
      tags: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    };

    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it("rejects page beyond limit range", () => {
    const result = {
      tags: [],
      total: 0,
      page: 1,
      limit: 200,
      totalPages: 0,
    };

    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it("rejects missing tags array", () => {
    const result = {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };

    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it("rejects non-integer total", () => {
    const result = {
      tags: [],
      total: 1.5,
      page: 1,
      limit: 20,
      totalPages: 0,
    };

    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it("rejects non-array tags", () => {
    const result = {
      tags: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };

    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it("rejects tag items with wrong field types in the array", () => {
    const result = {
      tags: [{ tag_id: "abc", tag: "Test", created_at: null, updated_at: null }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    const parsed = listTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});
