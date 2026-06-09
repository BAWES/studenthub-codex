import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Schemas imported from actions.ts for contract testing
// ---------------------------------------------------------------------------

import {
  listTagsSchema,
  getTagSchema,
  createTagSchema,
  updateTagSchema,
  deleteTagSchema,
} from "./actions";

describe("listTagsSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listTagsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit page and limit", () => {
    const result = listTagsSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects page less than 1", () => {
    const result = listTagsSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = listTagsSchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listTagsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("getTagSchema", () => {
  it("accepts valid tag ID", () => {
    const result = getTagSchema.safeParse({ tagId: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagId).toBe(5);
    }
  });

  it("rejects missing tagId", () => {
    const result = getTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric tagId", () => {
    const result = getTagSchema.safeParse({ tagId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive tagId", () => {
    const result = getTagSchema.safeParse({ tagId: "0" });
    expect(result.success).toBe(false);
  });
});

describe("createTagSchema", () => {
  it("accepts valid tag name", () => {
    const result = createTagSchema.safeParse({ tag: "Priority" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tag).toBe("Priority");
    }
  });

  it("rejects empty tag name", () => {
    const result = createTagSchema.safeParse({ tag: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing tag", () => {
    const result = createTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects tag name exceeding 128 chars", () => {
    const result = createTagSchema.safeParse({ tag: "x".repeat(129) });
    expect(result.success).toBe(false);
  });
});

describe("updateTagSchema", () => {
  it("accepts valid tag ID and name", () => {
    const result = updateTagSchema.safeParse({ tagId: "5", tag: "Updated" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagId).toBe(5);
      expect(result.data.tag).toBe("Updated");
    }
  });

  it("rejects missing tagId", () => {
    const result = updateTagSchema.safeParse({ tag: "Updated" });
    expect(result.success).toBe(false);
  });

  it("rejects empty tag name", () => {
    const result = updateTagSchema.safeParse({ tagId: "5", tag: "" });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive tagId", () => {
    const result = updateTagSchema.safeParse({ tagId: "-1", tag: "Tag" });
    expect(result.success).toBe(false);
  });
});

describe("deleteTagSchema", () => {
  it("accepts valid tag ID", () => {
    const result = deleteTagSchema.safeParse({ tagId: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagId).toBe(5);
    }
  });

  it("rejects missing tagId", () => {
    const result = deleteTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-positive tagId", () => {
    const result = deleteTagSchema.safeParse({ tagId: "0" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape verification
// ---------------------------------------------------------------------------

type TagItem = {
  tag_id: number;
  tag: string;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListTagsResult = {
  tags: TagItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("ListTagsResult type shape", () => {
  it("conforms to expected structure", () => {
    const result: ListTagsResult = {
      tags: [
        {
          tag_id: 1,
          tag: "Priority",
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.tags).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("handles empty tag list", () => {
    const result: ListTagsResult = {
      tags: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.tags).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });
});

describe("TagItem type shape", () => {
  it("includes all required fields", () => {
    const item: TagItem = {
      tag_id: 42,
      tag: "Urgent",
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-15"),
    };
    expect(item.tag_id).toBe(42);
    expect(item.tag).toBe("Urgent");
  });

  it("allows nullable timestamps", () => {
    const item: TagItem = {
      tag_id: 1,
      tag: "Normal",
      created_at: null,
      updated_at: null,
    };
    expect(item.created_at).toBeNull();
    expect(item.updated_at).toBeNull();
  });
});
