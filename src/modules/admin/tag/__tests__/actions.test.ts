import { describe, it, expect } from "vitest";
import { listTagsSchema, createTagSchema, deleteTagSchema } from "../actions";
import type { TagListItem, ListTagsResult, TagIdResult } from "../schemas";

/**
 * Data contract test for admin/tag server actions.
 *
 * Validates that:
 * - Input schemas accept/reject expected params
 * - Output types match what the page's DataTable expects
 *
 * Full integration tests require a running DB (see CI).
 */

describe("listTagsSchema — page params contract", () => {
  it("accepts empty params (defaults apply)", () => {
    const r = listTagsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(50);
      expect(r.data.page).toBe(1);
    }
  });

  it("accepts custom page and limit", () => {
    const r = listTagsSchema.safeParse({ page: 2, limit: 25 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(25);
    }
  });

  it("accepts search query", () => {
    const r = listTagsSchema.safeParse({ search: "urgent" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.search).toBe("urgent");
    }
  });
});

describe("createTagSchema", () => {
  it("accepts valid tag name", () => {
    const r = createTagSchema.safeParse({ tag: "urgent" });
    expect(r.success).toBe(true);
  });

  it("rejects empty tag name", () => {
    const r = createTagSchema.safeParse({ tag: "" });
    expect(r.success).toBe(false);
  });

  it("rejects tag name over 128 chars", () => {
    const r = createTagSchema.safeParse({ tag: "a".repeat(129) });
    expect(r.success).toBe(false);
  });

  it("rejects missing tag field", () => {
    const r = createTagSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("deleteTagSchema", () => {
  it("accepts valid tag_id", () => {
    const r = deleteTagSchema.safeParse({ tagId: 5 });
    expect(r.success).toBe(true);
  });

  it("rejects missing tagId", () => {
    const r = deleteTagSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("TagListItem — DataTable column contract", () => {
  it("has all fields the DataTable renders", () => {
    // The page maps tag_id → row.id, tag → row.tag
    const row: TagListItem = {
      tag_id: 1,
      tag: "urgent",
      created_at: new Date("2025-01-15T10:00:00Z"),
      updated_at: new Date("2025-01-16T10:00:00Z"),
    };
    expect(row.tag_id).toBe(1);
    expect(row.tag).toBe("urgent");
  });

  it("accepts nullable dates", () => {
    const row: TagListItem = {
      tag_id: 2,
      tag: "vip",
      created_at: null,
      updated_at: null,
    };
    expect(row.created_at).toBeNull();
    expect(row.updated_at).toBeNull();
  });
});

describe("ListTagsResult shape", () => {
  it("has expected shape for pagination", () => {
    const result: ListTagsResult = {
      records: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.records)).toBe(true);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});

describe("TagIdResult shape", () => {
  it("returns tag_id on create/delete", () => {
    const result: TagIdResult = { tag_id: 42 };
    expect(result.tag_id).toBe(42);
  });
});
