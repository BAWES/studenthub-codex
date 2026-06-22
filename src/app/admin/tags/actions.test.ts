import { describe, it, expect } from "vitest";
import { listTagsSchema, createTagSchema, updateTagSchema, deleteTagSchema, tagItemSchema, listTagsResultSchema, tagActionResponseSchema } from "./schemas";
import type { TagItem, ListTagsResult } from "./schemas";

describe("listTagsSchema", () => {
  it("accepts empty params", () => { const r = listTagsSchema.safeParse({}); expect(r.success).toBe(true); if (r.success) { expect(r.data.page).toBe(1); expect(r.data.limit).toBe(50); } });
  it("accepts full filter", () => { const r = listTagsSchema.safeParse({ page: 2, limit: 25 }); expect(r.success).toBe(true); });
  it("rejects limit over 200", () => expect(listTagsSchema.safeParse({ limit: 999 }).success).toBe(false));
  it("rejects negative page", () => expect(listTagsSchema.safeParse({ page: -1 }).success).toBe(false));
});



describe("createTagSchema", () => {
  it("accepts valid name", () => { const r = createTagSchema.safeParse({ tag: "New Tag" }); expect(r.success).toBe(true); if (r.success) expect(r.data.tag).toBe("New Tag"); });
  it("rejects empty name", () => expect(createTagSchema.safeParse({ tag: "" }).success).toBe(false));
  it("rejects missing name", () => expect(createTagSchema.safeParse({}).success).toBe(false));
});

describe("updateTagSchema", () => {
  it("accepts valid update", () => expect(updateTagSchema.safeParse({ tagId: 1, tag: "Updated" }).success).toBe(true));
  it("rejects missing tagId", () => expect(updateTagSchema.safeParse({ tag: "Updated" }).success).toBe(false));
  it("rejects empty name", () => expect(updateTagSchema.safeParse({ tagId: 1, tag: "" }).success).toBe(false));
});

describe("deleteTagSchema", () => {
  it("accepts valid id", () => expect(deleteTagSchema.safeParse({ tagId: 1 }).success).toBe(true));
  it("rejects missing id", () => expect(deleteTagSchema.safeParse({}).success).toBe(false));
});

describe("TagItem type", () => {
  it("has required shape", () => { const i: TagItem = { tag_id: 1, tag: "urgent", created_at: new Date(), updated_at: null }; expect(i.tag_id).toBe(1); });
  it("accepts null dates", () => { const i: TagItem = { tag_id: 2, tag: "follow-up", created_at: null, updated_at: null }; expect(i.created_at).toBeNull(); });
});

describe("ListTagsResult", () => {
  it("has correct shape", () => { const r: ListTagsResult = { tags: [], total: 0, page: 1, limit: 50, totalPages: 0 }; expect(r.tags).toHaveLength(0); expect(r.totalPages).toBe(0); });
});

// ---------------------------------------------------------------------------
// Output validation — tagItemSchema
// ---------------------------------------------------------------------------

describe("tagItemSchema (output validation)", () => {
  it("accepts a valid tag item", () => {
    const r = tagItemSchema.safeParse({
      tag_id: 1,
      tag: "urgent",
      created_at: new Date("2026-01-01"),
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts tag with both dates null", () => {
    const r = tagItemSchema.safeParse({
      tag_id: 2,
      tag: "follow-up",
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing tag_id", () => {
    expect(
      tagItemSchema.safeParse({
        tag: "urgent",
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(false);
  });

  it("rejects negative tag_id", () => {
    expect(
      tagItemSchema.safeParse({
        tag_id: -1,
        tag: "urgent",
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(false);
  });

  it("rejects empty tag string", () => {
    expect(
      tagItemSchema.safeParse({
        tag_id: 1,
        tag: "",
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — listTagsResultSchema
// ---------------------------------------------------------------------------

describe("listTagsResultSchema (output validation)", () => {
  const validResponse = {
    tags: [
      { tag_id: 1, tag: "urgent", created_at: new Date(), updated_at: null },
    ],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid list tags response", () => {
    const r = listTagsResultSchema.safeParse(validResponse);
    expect(r.success).toBe(true);
  });

  it("accepts empty tags array", () => {
    const r = listTagsResultSchema.safeParse({
      ...validResponse,
      tags: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    expect(
      listTagsResultSchema.safeParse({
        tags: [],
        page: 1,
        limit: 50,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listTagsResultSchema.safeParse({
        ...validResponse,
        totalPages: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects invalid tag in tags array", () => {
    const r = listTagsResultSchema.safeParse({
      ...validResponse,
      tags: [{ tag_id: "not-a-number", tag: "bad" }],
    });
    expect(r.success).toBe(false);
  });
});



// ---------------------------------------------------------------------------
// Output validation — tagActionResponseSchema
// ---------------------------------------------------------------------------

describe("tagActionResponseSchema (output validation)", () => {
  it("accepts success response", () => {
    const r = tagActionResponseSchema.safeParse({
      operation: "success",
      message: "Tag created successfully",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error response", () => {
    const r = tagActionResponseSchema.safeParse({
      operation: "error",
      message: "Tag not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(
      tagActionResponseSchema.safeParse({ message: "Msg" }).success,
    ).toBe(false);
  });

  it("rejects empty operation", () => {
    expect(
      tagActionResponseSchema.safeParse({ operation: "", message: "Msg" }).success,
    ).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      tagActionResponseSchema.safeParse({ operation: "success", message: "" })
      .success,
    ).toBe(false);
  });
});
