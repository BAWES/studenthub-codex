import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listSalaryScalesSchema,
  salaryScaleItemSchema,
  listSalaryScalesResultSchema,
} from "./schemas";
import type { SalaryScaleItem, ListSalaryScalesResult } from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockFindMany, mockCount, mockUpdate, mockDelete, mockCreate } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockFindMany: vi.fn(),
    mockCount: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
    mockCreate: vi.fn(),
  }));

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
    salary_scale: {
      findMany: mockFindMany,
      count: mockCount,
      update: mockUpdate,
      delete: mockDelete,
      create: mockCreate,
    },
  },
}));

import { listSalaryScales, updateSalaryScale, deleteSalaryScale, createSalaryScale } from "./actions";

// ---------------------------------------------------------------------------
// Input schema validation
// ---------------------------------------------------------------------------

describe("listSalaryScalesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listSalaryScalesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listSalaryScalesSchema.safeParse({ page: 2, limit: 25 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });

  it("rejects limit over 200", () => {
    const result = listSalaryScalesSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listSalaryScalesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listSalaryScalesSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });
});

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("salaryScaleItemSchema", () => {
  it("accepts a valid salary scale item", () => {
    const item: SalaryScaleItem = {
      salary_scale_uuid: "scale-001",
      salary_scale_name_en: "Grade 1",
      salary_scale_name_ar: null,
      salary_scale_min_salary: 500,
      salary_scale_mid_salary: 750,
      salary_scale_max_salary: 1000,
      salary_scale_currency: "KWD",
      salary_scale_sort_order: 1,
      salary_scale_created_at: new Date("2026-01-01"),
      salary_scale_updated_at: null,
    };
    const result = salaryScaleItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const item: SalaryScaleItem = {
      salary_scale_uuid: "scale-002",
      salary_scale_name_en: "Grade 2",
      salary_scale_name_ar: null,
      salary_scale_min_salary: null,
      salary_scale_mid_salary: null,
      salary_scale_max_salary: null,
      salary_scale_currency: null,
      salary_scale_sort_order: null,
      salary_scale_created_at: null,
      salary_scale_updated_at: null,
    };
    const result = salaryScaleItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing salary_scale_uuid", () => {
    const result = salaryScaleItemSchema.safeParse({
      salary_scale_name_en: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("listSalaryScalesResultSchema", () => {
  it("accepts a valid list result with items", () => {
    const result: ListSalaryScalesResult = {
      items: [
        {
          salary_scale_uuid: "scale-001",
          salary_scale_name_en: "Grade 1",
          salary_scale_name_ar: null,
          salary_scale_min_salary: null,
          salary_scale_mid_salary: null,
          salary_scale_max_salary: null,
          salary_scale_currency: null,
          salary_scale_sort_order: 1,
          salary_scale_created_at: new Date("2026-01-01"),
          salary_scale_updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    };
    const parsed = listSalaryScalesResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const result: ListSalaryScalesResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const parsed = listSalaryScalesResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects non-array items", () => {
    const result = {
      items: "not-an-array",
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const parsed = listSalaryScalesResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — mocked DB
// ---------------------------------------------------------------------------

describe("listSalaryScales action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const dbRows = [
      {
        salary_scale_uuid: "scale-001",
        salary_scale_name_en: "Grade 1",
        salary_scale_name_ar: null,
        salary_scale_min_salary: null,
        salary_scale_mid_salary: null,
        salary_scale_max_salary: null,
        salary_scale_currency: "KWD",
        salary_scale_sort_order: 1,
        salary_scale_created_at: new Date("2026-01-01"),
        salary_scale_updated_at: null,
      },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(1);

    const result = await listSalaryScales({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { salary_scale_sort_order: "asc" },
        skip: 0,
        take: 50,
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(1);
  });

  it("handles pagination correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    await listSalaryScales({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("returns empty result when no scales exist", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listSalaryScales({});

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listSalaryScales({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// updateSalaryScale action tests
// ---------------------------------------------------------------------------

describe("updateSalaryScale action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a salary scale by UUID", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockUpdate.mockResolvedValue({
      salary_scale_uuid: "scale-001",
      salary_scale_name_en: "Updated Name",
    });

    const result = await updateSalaryScale("scale-001", {
      salary_scale_name_en: "Updated Name",
      salary_scale_name_ar: undefined,
      salary_scale_min_salary: null,
      salary_scale_mid_salary: null,
      salary_scale_max_salary: null,
      salary_scale_currency: null,
      salary_scale_sort_order: null,
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { salary_scale_uuid: "scale-001" },
      data: {
        salary_scale_name_en: "Updated Name",
        salary_scale_name_ar: null,
        salary_scale_min_salary: null,
        salary_scale_mid_salary: null,
        salary_scale_max_salary: null,
        salary_scale_currency: null,
        salary_scale_sort_order: null,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty salary_scale_name_en", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await updateSalaryScale("scale-003", {
      salary_scale_name_en: "",
      salary_scale_name_ar: undefined,
      salary_scale_min_salary: null,
      salary_scale_mid_salary: null,
      salary_scale_max_salary: null,
      salary_scale_currency: null,
      salary_scale_sort_order: null,
    });

    expect(result.error).toBeTruthy();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    const result = await updateSalaryScale("scale-001", {
      salary_scale_name_en: "Name",
      salary_scale_name_ar: undefined,
      salary_scale_min_salary: null,
      salary_scale_mid_salary: null,
      salary_scale_max_salary: null,
      salary_scale_currency: null,
      salary_scale_sort_order: null,
    });

    expect(result.error).toBe("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// deleteSalaryScale action tests
// ---------------------------------------------------------------------------

describe("deleteSalaryScale action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a salary scale by UUID", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockDelete.mockResolvedValue({
      salary_scale_uuid: "scale-001",
      salary_scale_name_en: "Deleted",
    });

    const result = await deleteSalaryScale("scale-001");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockDelete).toHaveBeenCalledWith({
      where: { salary_scale_uuid: "scale-001" },
    });
    expect(result.success).toBe(true);
  });

  it("handles Prisma error (e.g. foreign key constraint)", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockDelete.mockRejectedValue(new Error("Foreign key constraint failed"));

    const result = await deleteSalaryScale("scale-with-references");

    expect(result.success).toBeUndefined();
    expect(result.error).toBeTruthy();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    const result = await deleteSalaryScale("scale-001");

    expect(result.error).toBe("Unauthorized");
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
