import { describe, it, expect } from "vitest";
import {
  requestChecklistItemSchema,
  listRequestChecklistsResultSchema,
  requestChecklistDetailSchema,
  deleteRequestChecklistResultSchema,
} from "./schemas";

const validItem = () => ({
  request_checklist_uuid: "rc-001",
  status_name: "Pending Review",
  status_name_ar: null,
  is_require: true,
  sort_order: null,
  created_at: "2026-01-15T10:00:00.000Z",
  updated_at: null,
});

// ---------------------------------------------------------------------------
// requestChecklistItemSchema
// ---------------------------------------------------------------------------

describe("requestChecklistItemSchema", () => {
  it("accepts a valid item", () => {
    const r = requestChecklistItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = requestChecklistItemSchema.safeParse({
      ...validItem(),
      status_name_ar: null,
      is_require: null,
      sort_order: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing request_checklist_uuid", () => {
    const { request_checklist_uuid: _, ...rest } = validItem();
    expect(requestChecklistItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status_name", () => {
    const { status_name: _, ...rest } = validItem();
    expect(requestChecklistItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listRequestChecklistsResultSchema
// ---------------------------------------------------------------------------

describe("listRequestChecklistsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listRequestChecklistsResultSchema.safeParse({
      items: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty items array", () => {
    expect(
      listRequestChecklistsResultSchema.safeParse({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects zero page", () => {
    expect(
      listRequestChecklistsResultSchema.safeParse({ items: [], total: 0, page: 0, limit: 20, totalPages: 0 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// requestChecklistDetailSchema
// ---------------------------------------------------------------------------

describe("requestChecklistDetailSchema", () => {
  it("accepts a valid item", () => {
    const r = requestChecklistDetailSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts null", () => {
    expect(requestChecklistDetailSchema.safeParse(null).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// deleteRequestChecklistResultSchema
// ---------------------------------------------------------------------------

describe("deleteRequestChecklistResultSchema", () => {
  it("accepts success: true", () => {
    expect(deleteRequestChecklistResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("rejects missing success", () => {
    expect(deleteRequestChecklistResultSchema.safeParse({}).success).toBe(false);
  });
});
