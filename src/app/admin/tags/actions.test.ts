import { describe, it, expect } from "vitest";
import { listTagsSchema, getTagSchema, createTagSchema, updateTagSchema, deleteTagSchema } from "./schemas";
import type { TagItem, ListTagsResult } from "./schemas";

describe("listTagsSchema", () => {
  it("accepts empty params", () => { const r = listTagsSchema.safeParse({}); expect(r.success).toBe(true); if (r.success) { expect(r.data.page).toBe(1); expect(r.data.limit).toBe(50); } });
  it("accepts full filter", () => { const r = listTagsSchema.safeParse({ page: 2, limit: 25 }); expect(r.success).toBe(true); });
  it("rejects limit over 200", () => expect(listTagsSchema.safeParse({ limit: 999 }).success).toBe(false));
  it("rejects negative page", () => expect(listTagsSchema.safeParse({ page: -1 }).success).toBe(false));
});

describe("getTagSchema", () => {
  it("accepts valid id", () => expect(getTagSchema.safeParse({ tagId: 1 }).success).toBe(true));
  it("rejects missing id", () => expect(getTagSchema.safeParse({}).success).toBe(false));
  it("rejects zero id", () => expect(getTagSchema.safeParse({ tagId: 0 }).success).toBe(false));
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
