import { describe, it, expect } from "vitest";
import { tagListItemSchema, listTagResultSchema, tagIdResultSchema } from "../schemas";

describe("tagListItemSchema", () => {
  it("validates a complete tag item", () => {
    const result = tagListItemSchema.safeParse({
      tag_id: 1,
      tag: "urgent",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-02T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("validates a tag item with null dates", () => {
    const result = tagListItemSchema.safeParse({
      tag_id: 2,
      tag: "vip",
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing tag string", () => {
    const result = tagListItemSchema.safeParse({
      tag_id: 1,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer tag_id", () => {
    const result = tagListItemSchema.safeParse({
      tag_id: "abc",
      tag: "test",
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("listTagResultSchema", () => {
  it("validates a complete list result", () => {
    const result = listTagResultSchema.safeParse({
      records: [
        { tag_id: 1, tag: "urgent", created_at: null, updated_at: null },
        { tag_id: 2, tag: "vip", created_at: null, updated_at: null },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("validates empty records", () => {
    const result = listTagResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("tagIdResultSchema", () => {
  it("validates a tag_id result", () => {
    const result = tagIdResultSchema.safeParse({ tag_id: 42 });
    expect(result.success).toBe(true);
  });
});
