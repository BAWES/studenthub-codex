import { describe, it, expect } from "vitest";
import { tagItemSchema, listTagsResultSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validTagItem = () => ({
  tag_id: 42,
  tag: "Urgent",
  created_at: new Date("2026-01-15"),
  updated_at: new Date("2026-06-10"),
});

const validTagItemMinimal = () => ({
  tag_id: 1,
  tag: "Normal",
  created_at: null,
  updated_at: null,
});

// ---------------------------------------------------------------------------
// tagItemSchema
// ---------------------------------------------------------------------------

describe("tagItemSchema", () => {
  it("accepts a full tag item", () => {
    const r = tagItemSchema.safeParse(validTagItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal tag item (nullable dates set to null)", () => {
    const r = tagItemSchema.safeParse(validTagItemMinimal());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = tagItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = tagItemSchema.safeParse({ ...validTagItem(), tag_id: "not-a-number" });
    expect(r.success).toBe(false);
  });

  it("rejects missing tag field", () => {
    const r = tagItemSchema.safeParse({ ...validTagItem(), tag: undefined });
    expect(r.success).toBe(false);
  });

  it("rejects non-number tag_id", () => {
    const r = tagItemSchema.safeParse({ ...validTagItem(), tag_id: "abc" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listTagsResultSchema
// ---------------------------------------------------------------------------

describe("listTagsResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listTagsResultSchema.safeParse({
      tags: [validTagItem(), validTagItemMinimal()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty tags array", () => {
    const r = listTagsResultSchema.safeParse({
      tags: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listTagsResultSchema.safeParse({
      tags: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listTagsResultSchema.safeParse({
      tags: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listTagsResultSchema.safeParse({
      tags: [],
      total: 0,
      page: 1,
      limit: 101,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listTagsResultSchema.safeParse({ tags: [] });
    expect(r.success).toBe(false);
  });
});
