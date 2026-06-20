import { describe, it, expect } from "vitest";
import {
  listTagsSchema,
  createTagSchema,
  updateTagSchema,
  deleteTagSchema,
  tagItemSchema,
  listTagsResultSchema,
  tagActionResponseSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listTagsSchema
// ---------------------------------------------------------------------------
describe("listTagsSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listTagsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(listTagsSchema.safeParse({ page: 2, limit: 100 }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listTagsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 200", () => {
    expect(listTagsSchema.safeParse({ limit: 201 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listTagsSchema.safeParse({ page: 0 }).success).toBe(false);
  });
});



// ---------------------------------------------------------------------------
// createTagSchema
// ---------------------------------------------------------------------------
describe("createTagSchema", () => {
  it("accepts valid input", () => {
    expect(createTagSchema.safeParse({ tag: "javascript" }).success).toBe(true);
  });

  it("rejects missing tag", () => {
    expect(createTagSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty tag", () => {
    expect(createTagSchema.safeParse({ tag: "" }).success).toBe(false);
  });

  it("rejects tag exceeding 128 chars", () => {
    expect(createTagSchema.safeParse({ tag: "x".repeat(129) }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateTagSchema
// ---------------------------------------------------------------------------
describe("updateTagSchema", () => {
  it("accepts valid input", () => {
    expect(updateTagSchema.safeParse({ tagId: 1, tag: "typescript" }).success).toBe(true);
  });

  it("accepts coerced string tagId", () => {
    expect(updateTagSchema.safeParse({ tagId: "3", tag: "ts" }).success).toBe(true);
  });

  it("rejects missing tagId", () => {
    expect(updateTagSchema.safeParse({ tag: "ts" }).success).toBe(false);
  });

  it("rejects zero tagId", () => {
    expect(updateTagSchema.safeParse({ tagId: 0, tag: "ts" }).success).toBe(false);
  });

  it("rejects missing tag", () => {
    expect(updateTagSchema.safeParse({ tagId: 1 }).success).toBe(false);
  });

  it("rejects empty tag", () => {
    expect(updateTagSchema.safeParse({ tagId: 1, tag: "" }).success).toBe(false);
  });

  it("rejects tag exceeding 128 chars", () => {
    expect(updateTagSchema.safeParse({ tagId: 1, tag: "x".repeat(129) }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteTagSchema
// ---------------------------------------------------------------------------
describe("deleteTagSchema", () => {
  it("accepts valid input", () => {
    expect(deleteTagSchema.safeParse({ tagId: 1 }).success).toBe(true);
  });

  it("accepts coerced string", () => {
    expect(deleteTagSchema.safeParse({ tagId: "7" }).success).toBe(true);
  });

  it("rejects missing tagId", () => {
    expect(deleteTagSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero tagId", () => {
    expect(deleteTagSchema.safeParse({ tagId: 0 }).success).toBe(false);
  });

  it("rejects negative tagId", () => {
    expect(deleteTagSchema.safeParse({ tagId: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// tagItemSchema
// ---------------------------------------------------------------------------
describe("tagItemSchema", () => {
  const validItem = {
    tag_id: 1,
    tag: "javascript",
    created_at: null,
    updated_at: null,
  };

  it("accepts a valid tag item", () => {
    expect(tagItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null nullable fields", () => {
    expect(
      tagItemSchema.safeParse({
        ...validItem,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing tag_id", () => {
    const { tag_id: _, ...rest } = validItem;
    expect(tagItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects zero tag_id", () => {
    expect(tagItemSchema.safeParse({ ...validItem, tag_id: 0 }).success).toBe(false);
  });

  it("rejects negative tag_id", () => {
    expect(tagItemSchema.safeParse({ ...validItem, tag_id: -1 }).success).toBe(false);
  });

  it("rejects wrong type for tag_id", () => {
    expect(tagItemSchema.safeParse({ ...validItem, tag_id: "abc" }).success).toBe(false);
  });

  it("rejects missing tag", () => {
    const { tag: _, ...rest } = validItem;
    expect(tagItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty tag", () => {
    expect(tagItemSchema.safeParse({ ...validItem, tag: "" }).success).toBe(false);
  });

  it("rejects wrong type for created_at", () => {
    expect(tagItemSchema.safeParse({ ...validItem, created_at: "not-a-date" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listTagsResultSchema (paginated)
// ---------------------------------------------------------------------------
describe("listTagsResultSchema", () => {
  const validResult = {
    tags: [{ tag_id: 1, tag: "js", created_at: null, updated_at: null }],
    total: 1,
    page: 1,
    limit: 50,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listTagsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty tags array", () => {
    expect(
      listTagsResultSchema.safeParse({ ...validResult, tags: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing tags", () => {
    const { tags: _, ...rest } = validResult;
    expect(listTagsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listTagsResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
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
  it("accepts valid response", () => {
    expect(tagActionResponseSchema.safeParse({ operation: "created", message: "Tag created" }).success).toBe(true);
  });

  it("rejects missing operation", () => {
    expect(tagActionResponseSchema.safeParse({ message: "Done" }).success).toBe(false);
  });

  it("rejects empty operation", () => {
    expect(tagActionResponseSchema.safeParse({ operation: "", message: "Done" }).success).toBe(false);
  });

  it("rejects missing message", () => {
    expect(tagActionResponseSchema.safeParse({ operation: "created" }).success).toBe(false);
  });

  it("rejects empty message", () => {
    expect(tagActionResponseSchema.safeParse({ operation: "created", message: "" }).success).toBe(false);
  });

  it("rejects wrong type for operation", () => {
    expect(tagActionResponseSchema.safeParse({ operation: 123, message: "Done" }).success).toBe(false);
  });

  it("rejects wrong type for message", () => {
    expect(tagActionResponseSchema.safeParse({ operation: "created", message: 456 }).success).toBe(false);
  });
});
