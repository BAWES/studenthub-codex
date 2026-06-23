import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listDegreesSchema,
  degreeItemSchema,
  listDegreesResultSchema,
} from "./schemas";
import type { DegreeItem, ListDegreesResult } from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockFindMany, mockCount, mockUpdate, mockDelete } = vi.hoisted(
  () => ({
    mockRequireCapability: vi.fn(),
    mockFindMany: vi.fn(),
    mockCount: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
  }),
);

// ── Mock next/cache revalidatePath ───────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    degree: {
      findMany: mockFindMany,
      count: mockCount,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

import { listDegrees, updateDegree, deleteDegree } from "./actions";

// ---------------------------------------------------------------------------
// Input schema validation
// ---------------------------------------------------------------------------

describe("listDegreesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listDegreesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listDegreesSchema.safeParse({ page: 2, limit: 25 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });

  it("rejects limit over 200", () => {
    const result = listDegreesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDegreesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listDegreesSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("degreeItemSchema", () => {
  it("accepts a valid degree item", () => {
    const item: DegreeItem = {
      degree_uuid: "deg-001",
      degree_group_uuid: null,
      degree_name_en: "Bachelor of Science",
      degree_name_ar: null,
      degree_sort_order: 1,
      degree_created_at: new Date("2026-01-01"),
      degree_updated_at: null,
    };
    const result = degreeItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const item: DegreeItem = {
      degree_uuid: "deg-002",
      degree_group_uuid: null,
      degree_name_en: "Master of Arts",
      degree_name_ar: null,
      degree_sort_order: null,
      degree_created_at: null,
      degree_updated_at: null,
    };
    const result = degreeItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing degree_uuid", () => {
    const result = degreeItemSchema.safeParse({
      degree_name_en: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("listDegreesResultSchema", () => {
  it("accepts a valid list result with items", () => {
    const result: ListDegreesResult = {
      degrees: [
        {
          degree_uuid: "deg-001",
          degree_group_uuid: null,
          degree_name_en: "Bachelor",
          degree_name_ar: null,
          degree_sort_order: 1,
          degree_created_at: new Date("2026-01-01"),
          degree_updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    };
    const parsed = listDegreesResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts empty degrees array", () => {
    const result: ListDegreesResult = {
      degrees: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const parsed = listDegreesResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects non-array degrees", () => {
    const result = {
      degrees: "not-an-array",
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const parsed = listDegreesResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — mocked DB
// ---------------------------------------------------------------------------

describe("listDegrees action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const dbRows = [
      {
        degree_uuid: "deg-001",
        degree_group_uuid: null,
        degree_name_en: "Bachelor of Science",
        degree_name_ar: null,
        degree_sort_order: 1,
        degree_created_at: new Date("2026-01-01"),
        degree_updated_at: null,
      },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(1);

    const result = await listDegrees({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { degree_name_en: "asc" },
        skip: 0,
        take: 50,
      }),
    );
    expect(result.degrees).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(1);
  });

  it("handles pagination correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    await listDegrees({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("returns empty result when no degrees exist", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listDegrees({});

    expect(result.degrees).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listDegrees({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// updateDegree action tests
// ---------------------------------------------------------------------------

describe("updateDegree action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a degree by UUID", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockUpdate.mockResolvedValue({
      degree_uuid: "deg-001",
      degree_name_en: "Updated Name",
      degree_name_ar: "اسم محدث",
      degree_sort_order: 2,
      degree_group_uuid: "group-1",
    });

    const result = await updateDegree("deg-001", {
      degree_name_en: "Updated Name",
      degree_name_ar: "اسم محدث",
      degree_sort_order: 2,
      degree_group_uuid: "group-1",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { degree_uuid: "deg-001" },
      data: {
        degree_name_en: "Updated Name",
        degree_name_ar: "اسم محدث",
        degree_sort_order: 2,
        degree_group_uuid: "group-1",
      },
    });
    expect(result.success).toBe(true);
  });

  it("allows optional fields to be undefined (nullified)", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockUpdate.mockResolvedValue({
      degree_uuid: "deg-002",
      degree_name_en: "Name Only",
      degree_name_ar: null,
      degree_sort_order: 0,
      degree_group_uuid: null,
    });

    const result = await updateDegree("deg-002", {
      degree_name_en: "Name Only",
      degree_name_ar: undefined,
      degree_sort_order: 0,
      degree_group_uuid: null,
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { degree_uuid: "deg-002" },
      data: {
        degree_name_en: "Name Only",
        degree_name_ar: null,
        degree_sort_order: 0,
        degree_group_uuid: null,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty degree_name_en", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await updateDegree("deg-003", {
      degree_name_en: "",
      degree_name_ar: undefined,
      degree_sort_order: 0,
      degree_group_uuid: null,
    });

    expect(result.error).toBeTruthy();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    const result = await updateDegree("deg-001", {
      degree_name_en: "Name",
      degree_name_ar: undefined,
      degree_sort_order: 0,
      degree_group_uuid: null,
    });

    expect(result.error).toBe("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// deleteDegree action tests
// ---------------------------------------------------------------------------

describe("deleteDegree action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a degree by UUID", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockDelete.mockResolvedValue({
      degree_uuid: "deg-001",
      degree_name_en: "Deleted Name",
    });

    const result = await deleteDegree("deg-001");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockDelete).toHaveBeenCalledWith({
      where: { degree_uuid: "deg-001" },
    });
    expect(result.success).toBe(true);
  });

  it("handles Prisma error (e.g. foreign key constraint)", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockDelete.mockRejectedValue(new Error("Foreign key constraint failed"));

    const result = await deleteDegree("deg-with-children");

    expect(result.success).toBeUndefined();
    expect(result.error).toBeTruthy();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    const result = await deleteDegree("deg-001");

    expect(result.error).toBe("Unauthorized");
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
