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
  const validItem = () => ({
    request_checklist_uuid: "cl-001",
    status_name: "Pending",
    status_name_ar: "قيد الانتظار",
    is_require: true,
    sort_order: 1,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-01"),
  });

  it("accepts a valid checklist item", () => {
    const r = checklistItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = checklistItemSchema.safeParse({
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
    expect(checklistItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string status_name", () => {
    expect(
      checklistItemSchema.safeParse({ ...validItem(), status_name: 42 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listChecklistsResultSchema
// ---------------------------------------------------------------------------

describe("listChecklistsResultSchema", () => {
  const validItem = () => ({
    request_checklist_uuid: "cl-001",
    status_name: "Approved",
    status_name_ar: null,
    is_require: false,
    sort_order: null,
    created_at: null,
    updated_at: null,
  });

  it("accepts a valid paginated result", () => {
    const r = listChecklistsResultSchema.safeParse({
      items: [validItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const r = listChecklistsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative totalPages", () => {
    const r = listChecklistsResultSchema.safeParse({
      items: [], total: 0, page: 1, limit: 20, totalPages: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-positive page", () => {
    const r = listChecklistsResultSchema.safeParse({
      items: [], total: 0, page: 0, limit: 20, totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteChecklistResultSchema
// ---------------------------------------------------------------------------

describe("deleteChecklistResultSchema", () => {
  it("accepts success: true", () => {
    const r = deleteChecklistResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts success: false", () => {
    const r = deleteChecklistResultSchema.safeParse({ success: false });
    expect(r.success).toBe(true);
  });

  it("rejects non-boolean success", () => {
    const r = deleteChecklistResultSchema.safeParse({ success: "yes" });
    expect(r.success).toBe(false);
  });

  it("rejects missing success", () => {
    const r = deleteChecklistResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
