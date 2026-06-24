import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listSalaryScalesSchema,
} from "./schemas";
import type {
  SalaryScaleListItem,
} from "./schemas";

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
      count: mockCount,
      update: mockUpdate,
      delete: mockDelete,
      create: mockCreate,
      findFirst: mockFindFirst,
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
// listSalaryScales action tests — mocked DB
// ---------------------------------------------------------------------------

describe("listSalaryScales action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const dbRows = [
      {
        salary_scale_id: 1,
        salary_scale_name_en: "Grade 1",
        salary_scale_name_ar: null,
        salary_scale_min_amount: null,
        salary_scale_max_amount: null,
        salary_scale_created_at: new Date("2026-01-01"),
        salary_scale_updated_at: null,
      },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(1);

    const result = await listSalaryScales({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ salary_scale_name_en: "asc" }],
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

  it("updates a salary scale by id", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(existingRecord);
    mockUpdate.mockResolvedValue({ salary_scale_id: 1, ...existingRecord, salary_scale_name_en: "Updated Name" });

    const result = await updateSalaryScale({
      salary_scale_id: 1,
      salary_scale_name_en: "Updated Name",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
    expect(mockFindFirst).toHaveBeenCalledWith({ where: { salary_scale_id: 1 } });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { salary_scale_id: 1 },
      data: expect.objectContaining({
        salary_scale_name_en: "Updated Name",
      }),
    });
    expect(result.salary_scale_id).toBe(1);
  });

  it("rejects empty salary_scale_name_en", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    await expect(
      updateSalaryScale({
        salary_scale_id: 1,
        salary_scale_name_en: "",
      }),
    ).rejects.toThrow();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws when record not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(null);

    await expect(
      updateSalaryScale({
        salary_scale_id: 999,
        salary_scale_name_en: "Name",
      }),
    ).rejects.toThrow("Salary scale record not found: 999");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      updateSalaryScale({
        salary_scale_id: 1,
        salary_scale_name_en: "Name",
      }),
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

  it("deletes a salary scale by id", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(existingRecord);
    mockDelete.mockResolvedValue({ salary_scale_id: 1 });

    const result = await deleteSalaryScale(1);

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
    expect(mockFindFirst).toHaveBeenCalledWith({ where: { salary_scale_id: 1 } });
    expect(mockDelete).toHaveBeenCalledWith({
      where: { salary_scale_id: 1 },
    });
    expect(result.salary_scale_id).toBe(1);
  });

  it("handles Prisma error (e.g. foreign key constraint)", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(existingRecord);
    mockDelete.mockRejectedValue(new Error("Foreign key constraint failed"));

    await expect(deleteSalaryScale(1)).rejects.toThrow("Foreign key constraint failed");
  });

  it("throws when record not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindFirst.mockResolvedValue(null);

    await expect(deleteSalaryScale(999)).rejects.toThrow("Salary scale record not found: 999");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(deleteSalaryScale(1)).rejects.toThrow("Unauthorized");
    expect(mockDelete).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// createSalaryScale action tests
// ---------------------------------------------------------------------------

describe("createSalaryScale action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a salary scale", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue({ salary_scale_id: 1 });

    const result = await createSalaryScale({
      salary_scale_name_en: "Grade 1",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        salary_scale_name_en: "Grade 1",
      }),
    });
    expect(result.salary_scale_id).toBe(1);
  });

  it("rejects empty english name", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    await expect(
      createSalaryScale({ salary_scale_name_en: "" }),
    ).rejects.toThrow();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      createSalaryScale({ salary_scale_name_en: "Grade 1" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
