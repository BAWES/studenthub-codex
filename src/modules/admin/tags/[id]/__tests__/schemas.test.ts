import { describe, it, expect } from "vitest";
import { getTagSchema, getTagResultSchema, tagItemSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Input schema: getTagSchema
// ---------------------------------------------------------------------------
describe("getTagSchema", () => {
  it("accepts a valid numeric tag ID", () => {
    const result = getTagSchema.safeParse({ tagId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagId).toBe(42);
    }
  });

  it("coerces string ID to number", () => {
    const result = getTagSchema.safeParse({ tagId: "99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagId).toBe(99);
    }
  });

  it("rejects missing tagId", () => {
    const result = getTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero tagId", () => {
    const result = getTagSchema.safeParse({ tagId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative tagId", () => {
    const result = getTagSchema.safeParse({ tagId: -5 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: tagItemSchema
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
// Output schema: getTagResultSchema
// ---------------------------------------------------------------------------
describe("getTagResultSchema", () => {
  it("accepts a valid get tag result with tag present", () => {
    const result = {
      tag: { tag_id: 1, tag: "JavaScript", created_at: new Date("2025-01-01"), updated_at: null },
    };
    const parsed = getTagResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts tag null (not found)", () => {
    const result = { tag: null };
    const parsed = getTagResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing tag field", () => {
    expect(getTagResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid tag data", () => {
    expect(getTagResultSchema.safeParse({ tag: { tag_id: 0, tag: "" } }).success).toBe(false);
  });
});
