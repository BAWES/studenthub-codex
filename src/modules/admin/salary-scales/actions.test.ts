import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listSalaryScalesSchema,
  salaryScaleListItemSchema,
  listSalaryScalesResultSchema,
} from "./schemas";
import type { SalaryScaleListItem, ListSalaryScalesResult } from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockFindMany,
  mockCount,
  mockUpdate,
  mockDelete,
  mockCreate,
  mockFindFirst,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockCreate: vi.fn(),
  mockFindFirst: vi.fn(),
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
      findFirst: vi.fn(),
      count: mockCount,
      update: mockUpdate,
      delete: mockDelete,
      create: mockCreate,
      findFirst: vi.fn(),
    },
  },
}));

import { listSalaryScales } from "./actions";

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
// Output schema validation — salaryScaleListItemSchema
// ---------------------------------------------------------------------------

describe("salaryScaleListItemSchema", () => {
  it("accepts a valid salary scale item", () => {
    const item: SalaryScaleListItem = {
      salary_scale_id: 1,
      salary_scale_name_en: "Grade 1",
      salary_scale_name_ar: null,
      salary_scale_min_amount: 500,
      salary_scale_max_amount: 1000,
      candidate_count: null,
    };
    const result = salaryScaleListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const item: SalaryScaleListItem = {
      salary_scale_id: 2,
      salary_scale_name_en: "Grade 2",
      salary_scale_name_ar: null,
      salary_scale_min_amount: null,
      salary_scale_max_amount: null,
      candidate_count: null,
    };
    const result = salaryScaleListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing salary_scale_id", () => {
    const result = salaryScaleListItemSchema.safeParse({
      salary_scale_name_en: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("listSalaryScalesResultSchema", () => {
  it("accepts a valid list result with items", () => {
    const result: ListSalaryScalesResult = {
      records: [
        {
          salary_scale_id: 1,
          salary_scale_name_en: "Grade 1",
          salary_scale_name_ar: null,
          salary_scale_min_amount: null,
          salary_scale_max_amount: null,
          candidate_count: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty records array", () => {
    const result: ListSalaryScalesResult = {
      records: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-array records", () => {
    const result = {
      records: "not-an-array",
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — mocked DB
// ---------------------------------------------------------------------------

const dbRow = {
  salary_scale_id: 1,
  salary_scale_name_en: "Grade 1",
  salary_scale_name_ar: null,
  salary_scale_min_amount: null,
  salary_scale_max_amount: null,
  salary_scale_created_at: new Date("2026-01-01"),
  salary_scale_updated_at: null,
};

describe("listSalaryScales action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([dbRow]);
    mockCount.mockResolvedValue(1);

    const result = await listSalaryScales({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { salary_scale_name_en: "asc" },
        skip: 0,
        take: 50,
      }),
    );
    expect(result.records).toHaveLength(1);
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

    expect(result.records).toHaveLength(0);
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
  const existingRecord = {
    salary_scale_id: 1,
    salary_scale_name_en: "Old Name",
    salary_scale_name_ar: null,
    salary_scale_min_amount: null,
    salary_scale_max_amount: null,
    salary_scale_created_at: new Date("2026-01-01"),
    salary_scale_updated_at: new Date("2026-01-01"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a salary scale by ID", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    setupFindFirstMock({ salary_scale_id: 1 });
    mockUpdate.mockResolvedValue({ salary_scale_id: 1, salary_scale_name_en: "Updated Name" });

    const result = await updateSalaryScale({
      salary_scale_id: 1,
      salary_scale_name_en: "Updated Name",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
    expect(result.salary_scale_id).toBe(1);
  });

  it("rejects empty salary_scale_name_en", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    await expect(
      updateSalaryScale({ salary_scale_id: 1, salary_scale_name_en: "" }),
    ).rejects.toThrow();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws when record not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    setupFindFirstMock(null);

    await expect(
      updateSalaryScale({ salary_scale_id: 999, salary_scale_name_en: "Name" }),
    ).rejects.toThrow("Salary scale record not found: 999");
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      updateSalaryScale({ salary_scale_id: 1, salary_scale_name_en: "Name" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// deleteSalaryScale action tests
// ---------------------------------------------------------------------------

describe("deleteSalaryScale action", () => {
  const existingRecord = {
    salary_scale_id: 1,
    salary_scale_name_en: "Grade 1",
    salary_scale_name_ar: null,
    salary_scale_min_amount: null,
    salary_scale_max_amount: null,
    salary_scale_created_at: new Date("2026-01-01"),
    salary_scale_updated_at: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a salary scale by ID", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    setupFindFirstMock({ salary_scale_id: 1 });
    mockDelete.mockResolvedValue({ salary_scale_id: 1 });

    const result = await deleteSalaryScale(1);

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
    expect(mockDelete).toHaveBeenCalledWith({
      where: { salary_scale_id: 1 },
    });
    expect(result.salary_scale_id).toBe(1);
  });

  it("throws when record not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    setupFindFirstMock(null);

    await expect(deleteSalaryScale(999)).rejects.toThrow("Salary scale record not found: 999");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("handles Prisma error (e.g. foreign key constraint)", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    setupFindFirstMock({ salary_scale_id: 1 });
    mockDelete.mockRejectedValue(new Error("Foreign key constraint failed"));

    await expect(deleteSalaryScale(1)).rejects.toThrow("Foreign key constraint failed");
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(deleteSalaryScale(1)).rejects.toThrow("Unauthorized");
    expect(mockDelete).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function setupFindFirstMock(returnValue: unknown) {
  const { prisma } = { prisma: { salary_scale: { findFirst: vi.fn() } } };
  // Dynamic import won't work in the helper — use a different approach
  const mockPrisma = { salary_scale: { findFirst: vi.fn().mockResolvedValue(returnValue) } };
  (globalThis as any).__mockPrisma = mockPrisma;
  vi.mock("@/lib/prisma", () => ({
    prisma: {
      salary_scale: {
        findMany: mockFindMany,
        count: mockCount,
        update: mockUpdate,
        delete: mockDelete,
        create: mockCreate,
        findFirst: vi.fn().mockResolvedValue(returnValue),
      },
    },
  }));
}
