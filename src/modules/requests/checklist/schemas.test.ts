import { describe, it, expect } from "vitest";
import {
  checklistItemSchema,
  listChecklistsResultSchema,
  deleteChecklistResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// checklistItemSchema
// ---------------------------------------------------------------------------
describe("checklistItemSchema", () => {
  const valid = {
    request_checklist_uuid: "abc-123",
    status_name: "Approved",
    status_name_ar: null,
    is_require: true,
    sort_order: 1,
    created_at: new Date("2026-01-01"),
    updated_at: null,
  };

  it("accepts valid item", () => {
    expect(checklistItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = checklistItemSchema.safeParse({
      ...valid,
      status_name_ar: null,
      is_require: null,
      sort_order: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const { request_checklist_uuid: _, ...rest } = valid;
    expect(checklistItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status_name", () => {
    const { status_name: _, ...rest } = valid;
    expect(checklistItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listChecklistsResultSchema
// ---------------------------------------------------------------------------
describe("listChecklistsResultSchema", () => {
  const valid = {
    items: [
      {
        request_checklist_uuid: "abc-123",
        status_name: "Approved",
        status_name_ar: null,
        is_require: true,
        sort_order: 1,
        created_at: new Date("2026-01-01"),
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid response", () => {
    expect(listChecklistsResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = listChecklistsResultSchema.safeParse({
      ...valid,
      items: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listChecklistsResultSchema.safeParse({ ...valid, total: -1 }).success
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteChecklistResultSchema
// ---------------------------------------------------------------------------
describe("deleteChecklistResultSchema", () => {
  it("accepts success", () => {
    expect(deleteChecklistResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts failure", () => {
    expect(deleteChecklistResultSchema.safeParse({ success: false }).success).toBe(true);
  });

  it("rejects non-boolean success", () => {
    expect(deleteChecklistResultSchema.safeParse({ success: "yes" }).success).toBe(
      false
    );
  });
});