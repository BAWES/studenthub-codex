import { describe, it, expect } from "vitest";
import {
  tagItemSchema,
  listTagsResultSchema,
  tagActionResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// tagItemSchema
// ---------------------------------------------------------------------------
describe("tagItemSchema", () => {
  const validItem = {
    tag_id: 1,
    tag: "urgent",
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-01"),
  };

  it("accepts a valid tag item", () => {
    expect(tagItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null created_at", () => {
    expect(tagItemSchema.safeParse({ ...validItem, created_at: null }).success).toBe(true);
  });

  it("accepts null updated_at", () => {
    expect(tagItemSchema.safeParse({ ...validItem, updated_at: null }).success).toBe(true);
  });

  it("rejects tag_id 0", () => {
    expect(tagItemSchema.safeParse({ ...validItem, tag_id: 0 }).success).toBe(false);
  });

  it("rejects negative tag_id", () => {
    expect(tagItemSchema.safeParse({ ...validItem, tag_id: -1 }).success).toBe(false);
  });

  it("rejects missing tag_id", () => {
    const { tag_id: _, ...rest } = validItem;
    expect(tagItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing tag", () => {
    const { tag: _, ...rest } = validItem;
    expect(tagItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty tag", () => {
    expect(tagItemSchema.safeParse({ ...validItem, tag: "" }).success).toBe(false);
  });

  it("rejects non-integer tag_id", () => {
    expect(tagItemSchema.safeParse({ ...validItem, tag_id: 1.5 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listTagsResultSchema
// ---------------------------------------------------------------------------
describe("listTagsResultSchema", () => {
  const validResult = {
    tags: [
      {
        tag_id: 1,
        tag: "urgent",
        created_at: new Date("2026-01-01"),
        updated_at: new Date("2026-06-01"),
      },
    ],
    total: 10,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid list tags result", () => {
    expect(listTagsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty tags array", () => {
    expect(
      listTagsResultSchema.safeParse({ ...validResult, tags: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("accepts multiple tags", () => {
    expect(
      listTagsResultSchema.safeParse({
        ...validResult,
        tags: [
          validResult.tags[0],
          { tag_id: 2, tag: "high-priority", created_at: null, updated_at: null },
        ],
        total: 2,
        totalPages: 1,
      }).success,
    ).toBe(true);
  });

  it("rejects missing tags", () => {
    const { tags: _, ...rest } = validResult;
    expect(listTagsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listTagsResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });

  it("rejects page 0", () => {
    expect(listTagsResultSchema.safeParse({ ...validResult, page: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(listTagsResultSchema.safeParse({ ...validResult, totalPages: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// tagActionResponseSchema
// ---------------------------------------------------------------------------
describe("tagActionResponseSchema", () => {
  it("accepts a valid action response", () => {
    expect(
      tagActionResponseSchema.safeParse({ operation: "created", message: "Tag created" }).success,
    ).toBe(true);
  });

  it("accepts any operation string", () => {
    expect(
      tagActionResponseSchema.safeParse({ operation: "updated", message: "Done" }).success,
    ).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(tagActionResponseSchema.safeParse({ message: "Done" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(tagActionResponseSchema.safeParse({ operation: "created" }).success).toBe(false);
  });

  it("rejects empty operation", () => {
    expect(tagActionResponseSchema.safeParse({ operation: "", message: "Done" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(
      tagActionResponseSchema.safeParse({ operation: "created", message: "" }).success,
    ).toBe(false);
  });

  it("rejects non-string operation", () => {
    expect(tagActionResponseSchema.safeParse({ operation: 123, message: "x" }).success).toBe(false);
  });
});
