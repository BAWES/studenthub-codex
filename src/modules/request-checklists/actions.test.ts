import { describe, it, expect } from "vitest";

import {
  listRequestChecklistsSchema,
  createRequestChecklistSchema,
  updateRequestChecklistSchema,
  deleteRequestChecklistSchema,
  requestChecklistItemSchema,
  listRequestChecklistsResultSchema,
  deleteRequestChecklistResultSchema,
  type RequestChecklistItem,
  type ListRequestChecklistsResult,
} from "./schemas";

describe("listRequestChecklistsSchema", () => {
  it("accepts empty params", () => {
    const result = listRequestChecklistsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listRequestChecklistsSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
  });

  it("accepts search filter", () => {
    const result = listRequestChecklistsSchema.safeParse({ search: "approve" });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listRequestChecklistsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listRequestChecklistsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

describe("createRequestChecklistSchema", () => {
  it("accepts valid input with required fields only", () => {
    const result = createRequestChecklistSchema.safeParse({
      statusName: "Approved",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    const result = createRequestChecklistSchema.safeParse({
      statusName: "Approved",
      statusNameAr: "موافقة",
      isRequire: true,
      sortOrder: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty statusName", () => {
    const result = createRequestChecklistSchema.safeParse({ statusName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing statusName", () => {
    const result = createRequestChecklistSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects statusName over 100 chars", () => {
    const result = createRequestChecklistSchema.safeParse({
      statusName: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative sortOrder", () => {
    const result = createRequestChecklistSchema.safeParse({
      statusName: "Test",
      sortOrder: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateRequestChecklistSchema", () => {
  it("accepts valid update with all fields", () => {
    const result = updateRequestChecklistSchema.safeParse({
      requestChecklistUuid: "request_checklis_abc-123",
      statusName: "Rejected",
      statusNameAr: "مرفوض",
      isRequire: false,
      sortOrder: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update (statusName only)", () => {
    const result = updateRequestChecklistSchema.safeParse({
      requestChecklistUuid: "request_checklis_abc-123",
      statusName: "Pending",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing requestChecklistUuid", () => {
    const result = updateRequestChecklistSchema.safeParse({ statusName: "Test" });
    expect(result.success).toBe(false);
  });

  it("rejects empty requestChecklistUuid", () => {
    const result = updateRequestChecklistSchema.safeParse({
      requestChecklistUuid: "",
      statusName: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteRequestChecklistSchema", () => {
  it("accepts valid uuid", () => {
    const result = deleteRequestChecklistSchema.safeParse({
      requestChecklistUuid: "request_checklis_abc-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    const result = deleteRequestChecklistSchema.safeParse({
      requestChecklistUuid: "",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: requestChecklistItemSchema
// ---------------------------------------------------------------------------

const validRequestChecklistItem: RequestChecklistItem = {
  request_checklist_uuid: "request_checklis_abc-123",
  status_name: "Approved",
  status_name_ar: "موافقة",
  is_require: true,
  sort_order: 1,
  created_at: null,
  updated_at: null,
};

describe("requestChecklistItemSchema", () => {
  it("accepts a valid request checklist item", () => {
    const result = requestChecklistItemSchema.parse(validRequestChecklistItem);
    expect(result.request_checklist_uuid).toBe("request_checklis_abc-123");
  });

  it("rejects missing required field", () => {
    const { status_name, ...rest } = validRequestChecklistItem;
    expect(() => requestChecklistItemSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for is_require", () => {
    expect(() =>
      requestChecklistItemSchema.parse({ ...validRequestChecklistItem, is_require: "yes" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listRequestChecklistsResultSchema
// ---------------------------------------------------------------------------

describe("listRequestChecklistsResultSchema", () => {
  it("accepts a valid result", () => {
    const result = listRequestChecklistsResultSchema.parse({
      items: [validRequestChecklistItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.items).toHaveLength(1);
  });

  it("accepts an empty list", () => {
    const result = listRequestChecklistsResultSchema.parse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.items).toHaveLength(0);
  });

  it("rejects negative total", () => {
    expect(() =>
      listRequestChecklistsResultSchema.parse({
        items: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: deleteRequestChecklistResultSchema
// ---------------------------------------------------------------------------

describe("deleteRequestChecklistResultSchema", () => {
  it("accepts success result", () => {
    const result = deleteRequestChecklistResultSchema.parse({ success: true });
    expect(result.success).toBe(true);
  });
});
