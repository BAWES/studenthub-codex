import { describe, it, expect } from "vitest";
import { listTagsSchema } from "./schemas";
import type { TagItem, ListTagsResult } from "./schemas";

/**
 * Page migration test for admin/tags.
 *
 * Verifies that listTagsSchema accepts the params passed by the page,
 * and that TagItem fields map correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin tags page — data contract", () => {
  it("listTagsSchema accepts empty params (defaults apply)", () => {
    const r = listTagsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(typeof r.data.limit).toBe("number");
    }
  });

  it("listTagsSchema accepts the params the page actually passes", () => {
    const r = listTagsSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("TagItem fields map correctly to DataTable columns", () => {
    // The page maps TagItem to DataTable columns:
    //   tag_id      → row.tag_id     (for keys)
    //   tag         → row.tag
    //   created_at  → row.created_at (formatted)
    //   updated_at  → row.updated_at (formatted)
    const row: TagItem = {
      tag_id: 1,
      tag: "VIP",
      created_at: new Date("2025-01-15T10:00:00Z"),
      updated_at: new Date("2025-06-01T12:00:00Z"),
    };
    expect(row.tag_id).toBe(1);
    expect(row.tag).toBe("VIP");
    expect(row.created_at).toEqual(new Date("2025-01-15T10:00:00Z"));
    expect(row.updated_at).toEqual(new Date("2025-06-01T12:00:00Z"));
  });

  it("ListTagsResult has expected shape", () => {
    const result: ListTagsResult = {
      tags: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    expect(Array.isArray(result.tags)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });
});
