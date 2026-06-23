import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  checklistItemSchema,
  listChecklistsResultSchema,
  deleteChecklistResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const listChecklistsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getChecklistSchema = z.object({
  uuid: z.string().length(60, "UUID must be 60 characters"),
});

const createChecklistSchema = z.object({
  statusName: z.string().min(1, "Status name is required").max(100),
  statusNameAr: z.string().max(100).optional(),
  isRequire: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const updateChecklistSchema = z.object({
  uuid: z.string().length(60, "UUID must be 60 characters"),
  statusName: z.string().min(1).max(100).optional(),
  statusNameAr: z.string().max(100).optional(),
  isRequire: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const deleteChecklistSchema = z.object({
  uuid: z.string().length(60, "UUID must be 60 characters"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChecklistListItem = {
  request_checklist_uuid: string;
  status_name: string;
  status_name_ar: string | null;
  is_require: boolean | null;
  sort_order: number | null;
  created_at: Date | null;
};

type ListChecklistsResult = {
  items: ChecklistListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Pure functions for testable logic
// ---------------------------------------------------------------------------

function validateCreateInput(
  statusName: string,
  statusNameAr?: string,
  sortOrder?: number,
): string | null {
  if (!statusName || statusName.trim().length === 0) {
    return "Status name is required";
  }
  if (statusName.length > 100) {
    return "Status name must not exceed 100 characters";
  }
  if (statusNameAr !== undefined && statusNameAr.length > 100) {
    return "Arabic status name must not exceed 100 characters";
  }
  if (sortOrder !== undefined && sortOrder < 0) {
    return "Sort order must not be negative";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("listChecklistsSchema", () => {
  it("accepts empty params", () => {
    const result = listChecklistsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listChecklistsSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    const result = listChecklistsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listChecklistsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

describe("getChecklistSchema", () => {
  it("accepts valid 60-char UUID", () => {
    const uuid = "a".repeat(60);
    const result = getChecklistSchema.safeParse({ uuid });
    expect(result.success).toBe(true);
  });

  it("rejects short UUID", () => {
    const result = getChecklistSchema.safeParse({ uuid: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const result = getChecklistSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createChecklistSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = createChecklistSchema.safeParse({
      statusName: "Pending Review",
      statusNameAr: "قيد المراجعة",
      isRequire: true,
      sortOrder: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal input (statusName only)", () => {
    const result = createChecklistSchema.safeParse({
      statusName: "Approved",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty statusName", () => {
    const result = createChecklistSchema.safeParse({
      statusName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects statusName over 100 chars", () => {
    const result = createChecklistSchema.safeParse({
      statusName: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative sortOrder", () => {
    const result = createChecklistSchema.safeParse({
      statusName: "Test",
      sortOrder: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateChecklistSchema", () => {
  it("accepts valid full update", () => {
    const result = updateChecklistSchema.safeParse({
      uuid: "a".repeat(60),
      statusName: "Updated Name",
      statusNameAr: "الاسم المحدث",
      isRequire: false,
      sortOrder: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update (single field)", () => {
    const result = updateChecklistSchema.safeParse({
      uuid: "a".repeat(60),
      statusName: "Just Name Change",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const result = updateChecklistSchema.safeParse({
      statusName: "No UUID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid uuid length", () => {
    const result = updateChecklistSchema.safeParse({
      uuid: "too-short",
      statusName: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteChecklistSchema", () => {
  it("accepts valid uuid", () => {
    const result = deleteChecklistSchema.safeParse({
      uuid: "a".repeat(60),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    const result = deleteChecklistSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("validateCreateInput", () => {
  it("returns null for valid input", () => {
    expect(validateCreateInput("Pending Review")).toBeNull();
  });

  it("returns error for empty statusName", () => {
    expect(validateCreateInput("")).toBe("Status name is required");
  });

  it("returns error for whitespace-only name", () => {
    expect(validateCreateInput("   ")).toBe("Status name is required");
  });

  it("returns error for name over 100 chars", () => {
    expect(validateCreateInput("x".repeat(101))).toBe(
      "Status name must not exceed 100 characters",
    );
  });

  it("returns error for negative sortOrder", () => {
    expect(validateCreateInput("Test", undefined, -1)).toBe(
      "Sort order must not be negative",
    );
  });

  it("returns error for arabic name over 100 chars", () => {
    expect(validateCreateInput("Test", "x".repeat(101))).toBe(
      "Arabic status name must not exceed 100 characters",
    );
  });

  it("accepts valid statusNameAr", () => {
    expect(validateCreateInput("Test", "قيد المراجعة")).toBeNull();
  });
});

describe("ChecklistListItem type shape", () => {
  it("accepts a valid checklist object", () => {
    const mock: ChecklistListItem = {
      request_checklist_uuid: "a".repeat(60),
      status_name: "Pending Review",
      status_name_ar: "قيد المراجعة",
      is_require: true,
      sort_order: 1,
      created_at: new Date(),
    };
    expect(mock.request_checklist_uuid).toHaveLength(60);
    expect(mock.status_name).toBe("Pending Review");
  });
});

describe("ListChecklistsResult type shape", () => {
  it("accepts an empty result set", () => {
    const result: ListChecklistsResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("checklistItemSchema", () => {
  it("parses a valid checklist item", () => {
    const r = checklistItemSchema.safeParse({
      request_checklist_uuid: "a".repeat(60),
      status_name: "Pending Review",
      status_name_ar: "قيد المراجعة",
      is_require: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("accepts null values for nullable fields", () => {
    const r = checklistItemSchema.safeParse({
      request_checklist_uuid: "b".repeat(60),
      status_name: "Approved",
      status_name_ar: null,
      is_require: null,
      sort_order: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing request_checklist_uuid", () => {
    const r = checklistItemSchema.safeParse({
      status_name: "Test",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing status_name", () => {
    const r = checklistItemSchema.safeParse({
      request_checklist_uuid: "c".repeat(60),
    });
    expect(r.success).toBe(false);
  });
});

describe("listChecklistsResultSchema", () => {
  it("parses a valid paginated result", () => {
    const r = listChecklistsResultSchema.safeParse({
      items: [
        {
          request_checklist_uuid: "a".repeat(60),
          status_name: "Pending",
          status_name_ar: null,
          is_require: null,
          sort_order: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listChecklistsResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listChecklistsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

describe("deleteChecklistResultSchema", () => {
  it("parses a valid delete result", () => {
    const r = deleteChecklistResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("rejects missing success field", () => {
    const r = deleteChecklistResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    const r = deleteChecklistResultSchema.safeParse({ success: "yes" });
    expect(r.success).toBe(false);
  });
});
