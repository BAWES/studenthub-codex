import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockRevalidatePath, mockFindMany, mockCount, mockFindUnique, mockCreate, mockUpdate, mockDelete } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockFindMany: vi.fn(),
    mockCount: vi.fn(),
    mockFindUnique: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
  }));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    degree: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

import { listDegrees, createDegree, updateDegree, deleteDegree, getDegree } from "./actions";
import type { DegreeItem } from "./schemas";

// ---------------------------------------------------------------------------
// listDegrees action
// ---------------------------------------------------------------------------
describe("listDegrees action", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns paginated list with default params", async () => {
    const dbRows = [
      { degree_uuid: "u1", degree_name_en: "BSc", degree_name_ar: null, degree_sort_order: 1, degree_group_uuid: "g1", degree_created_at: new Date("2026-01-01"), degree_updated_at: null },
      { degree_uuid: "u2", degree_name_en: "BA", degree_name_ar: "بكالوريوس الآداب", degree_sort_order: 2, degree_group_uuid: null, degree_created_at: new Date("2026-01-02"), degree_updated_at: null },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(2);

    const result = await listDegrees({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { degree_sort_order: "asc" }, skip: 0, take: 50 }),
    );
    expect(result.degrees).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(1);
    expect(result.degrees[0]).toEqual(dbRows[0]);
  });

  it("handles pagination correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    await listDegrees({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 10 }));
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
// getDegree action
// ---------------------------------------------------------------------------
describe("getDegree action", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns a degree by UUID", async () => {
    const row = { degree_uuid: "u1", degree_name_en: "BSc", degree_name_ar: null, degree_sort_order: 1, degree_group_uuid: "g1", degree_created_at: new Date("2026-01-01"), degree_updated_at: null };
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(row);

    const result = await getDegree({ degree_uuid: "u1" });
    expect(result.degree).toBeDefined();
    expect(result.degree!.degree_uuid).toBe("u1");
    expect(result.degree!.degree_name_en).toBe("BSc");
  });

  it("returns null for unknown UUID", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await getDegree({ degree_uuid: "unknown" });
    expect(result.degree).toBeNull();
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));
    await expect(getDegree({ degree_uuid: "u1" })).rejects.toThrow("Unauthorized");
  });
});

// ---------------------------------------------------------------------------
// createDegree action
// ---------------------------------------------------------------------------
describe("createDegree action", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a degree successfully", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue({ degree_uuid: "new-uuid", degree_name_en: "BSc", degree_name_ar: null, degree_sort_order: null, degree_group_uuid: null, degree_created_at: new Date(), degree_updated_at: null });

    const result = await createDegree("BSc");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        degree_name_en: "BSc",
        degree_uuid: expect.any(String),
      }),
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/degree");
    expect(result.operation).toBe("success");
  });

  it("creates with optional fields", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue({ degree_uuid: "new-uuid", degree_name_en: "BSc", degree_name_ar: "بكالوريوس", degree_sort_order: 1, degree_group_uuid: "g1", degree_created_at: new Date(), degree_updated_at: null });

    const result = await createDegree("BSc", "بكالوريوس", 1, "g1");

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        degree_name_en: "BSc",
        degree_name_ar: "بكالوريوس",
        degree_sort_order: 1,
        degree_group_uuid: "g1",
      }),
    });
    expect(result.operation).toBe("success");
  });

  it("returns error for empty name", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    const result = await createDegree("");
    expect(result.operation).toBe("error");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns error when prisma.create throws", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockRejectedValue(new Error("DB error"));

    const result = await createDegree("Failing");
    expect(result.operation).toBe("error");
    expect(result.message).toContain("problem");
  });
});

// ---------------------------------------------------------------------------
// updateDegree action
// ---------------------------------------------------------------------------
describe("updateDegree action", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates a degree successfully", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ degree_uuid: "u1" });

    const result = await updateDegree("u1", "Updated BSc");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { degree_uuid: "u1" }, select: { degree_uuid: true } });
    expect(mockUpdate).toHaveBeenCalledWith({ where: { degree_uuid: "u1" }, data: { degree_name_en: "Updated BSc", degree_name_ar: null, degree_sort_order: null, degree_group_uuid: null } });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/degree");
    expect(result.operation).toBe("success");
  });

  it("returns error when degree not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await updateDegree("unknown", "Test");
    expect(result.operation).toBe("error");
    expect(result.message).toBe("Degree not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error for empty name", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    const result = await updateDegree("u1", "");
    expect(result.operation).toBe("error");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// deleteDegree action
// ---------------------------------------------------------------------------
describe("deleteDegree action", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("deletes a degree successfully", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ degree_uuid: "u1" });

    const result = await deleteDegree("u1");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { degree_uuid: "u1" }, select: { degree_uuid: true } });
    expect(mockDelete).toHaveBeenCalledWith({ where: { degree_uuid: "u1" } });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/degree");
    expect(result.operation).toBe("success");
  });

  it("returns error when degree not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await deleteDegree("unknown");
    expect(result.operation).toBe("error");
    expect(result.message).toBe("Degree not found");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns error for empty UUID", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    const result = await deleteDegree("");
    expect(result.operation).toBe("error");
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
