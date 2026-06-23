import { describe, it, expect } from "vitest";
import {
  tagListItemSchema,
  listTagsResultSchema,
  tagIdResultSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Pure logic: tag schema validation
// ---------------------------------------------------------------------------

const validTagListItem = {
  tag_id: 1,
  tag: "urgent",
  created_at: new Date("2025-01-01"),
  updated_at: new Date("2025-01-15"),
};

describe("tagListItemSchema", () => {
  it("accepts a valid tag list item", () => {
    const result = tagListItemSchema.safeParse(validTagListItem);
    expect(result.success).toBe(true);
  });

  it("accepts null optional date fields", () => {
    const result = tagListItemSchema.safeParse({
      tag_id: 1,
      tag: "urgent",
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required tag_id", () => {
    const { tag_id, ...incomplete } = validTagListItem;
    const result = tagListItemSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects missing required tag name", () => {
    const { tag, ...incomplete } = validTagListItem;
    const result = tagListItemSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects non-number tag_id", () => {
    const result = tagListItemSchema.safeParse({
      ...validTagListItem,
      tag_id: "not-a-number",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty tag name", () => {
    const result = tagListItemSchema.safeParse({
      ...validTagListItem,
      tag: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("listTagsResultSchema", () => {
  it("accepts a valid result with records array", () => {
    const result = listTagsResultSchema.safeParse({
      records: [validTagListItem],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty records array", () => {
    const result = listTagsResultSchema.safeParse({
      records: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing total field", () => {
    const { total, ...incomplete } = {
      records: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const result = listTagsResultSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects negative total", () => {
    const result = listTagsResultSchema.safeParse({
      records: [],
      total: -1,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("tagIdResultSchema", () => {
  it("accepts a valid result with tag_id", () => {
    const result = tagIdResultSchema.safeParse({
      tag_id: 42,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing tag_id", () => {
    const result = tagIdResultSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-number tag_id", () => {
    const result = tagIdResultSchema.safeParse({ tag_id: "abc" });
    expect(result.success).toBe(false);
  });
});
