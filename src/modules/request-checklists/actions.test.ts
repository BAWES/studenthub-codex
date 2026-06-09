import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const listRequestChecklistsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().max(255).optional(),
});

const createRequestChecklistSchema = z.object({
  statusName: z.string().min(1, "Status name is required").max(100),
  statusNameAr: z.string().max(100).optional(),
  isRequire: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const updateRequestChecklistSchema = z.object({
  requestChecklistUuid: z.string().min(1, "Request checklist UUID is required"),
  statusName: z.string().min(1).max(100).optional(),
  statusNameAr: z.string().max(100).optional(),
  isRequire: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const deleteRequestChecklistSchema = z.object({
  requestChecklistUuid: z.string().min(1, "Request checklist UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RequestChecklistItem = {
  request_checklist_uuid: string;
  status_name: string;
  status_name_ar: string | null;
  is_require: boolean | null;
  sort_order: number | null;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListRequestChecklistsResult = {
  items: RequestChecklistItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

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

describe("RequestChecklistItem type shape", () => {
  it("accepts a valid request checklist object", () => {
    const mock: RequestChecklistItem = {
      request_checklist_uuid: "request_checklis_abc-123",
      status_name: "Approved",
      status_name_ar: "موافقة",
      is_require: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };
    expect(mock.request_checklist_uuid).toBe("request_checklis_abc-123");
    expect(mock.status_name).toBe("Approved");
  });
});

describe("ListRequestChecklistsResult type shape", () => {
  it("accepts an empty result set", () => {
    const result: ListRequestChecklistsResult = {
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
