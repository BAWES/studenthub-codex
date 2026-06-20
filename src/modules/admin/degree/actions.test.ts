import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DegreeItem, ListDegreesResult } from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockFindMany, mockCount, mockCreate, mockUpdate, mockFindUnique, mockDelete } = vi.hoisted(
  () => ({
    mockRequireCapability: vi.fn(),
    mockFindMany: vi.fn(),
    mockCount: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockFindUnique: vi.fn(),
    mockDelete: vi.fn(),
  }),
);

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    degree: {
      findMany: mockFindMany,
      count: mockCount,
      create: mockCreate,
      update: mockUpdate,
      findUnique: mockFindUnique,
      delete: mockDelete,
    },
  },
}));

import { listDegrees, createDegree, updateDegree, deleteDegree } from "./actions";

// ---------------------------------------------------------------------------
// Action-level tests — listDegrees
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
// Action-level tests — createDegree
// ---------------------------------------------------------------------------

describe("createDegree action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a degree with just english name", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue({ degree_uuid: "new-uuid" });

    const result = await createDegree("Bachelor of Science");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          degree_name_en: "Bachelor of Science",
          degree_name_ar: null,
          degree_group_uuid: null,
          degree_sort_order: null,
        }),
      }),
    );
    expect(result.operation).toBe("success");
    expect(result.message).toBe("Degree created successfully");
  });

  it("creates a degree with all fields", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue({ degree_uuid: "new-uuid" });

    const result = await createDegree("Master of Arts", "ماجستير في الآداب", "group-123", 2);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          degree_name_en: "Master of Arts",
          degree_name_ar: "ماجستير في الآداب",
          degree_group_uuid: "group-123",
          degree_sort_order: 2,
        }),
      }),
    );
    expect(result.operation).toBe("success");
  });

  it("returns error on invalid input (empty name)", async () => {
    const result = await createDegree("");

    expect(result.operation).toBe("error");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns error when db fails", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockRejectedValue(new Error("DB error"));

    const result = await createDegree("Bachelor");

    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — updateDegree
// ---------------------------------------------------------------------------

describe("updateDegree action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates an existing degree", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ degree_uuid: "deg-001" });
    mockUpdate.mockResolvedValue({ degree_uuid: "deg-001" });

    const result = await updateDegree("deg-001", "Updated Name");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { degree_uuid: "deg-001" },
      select: { degree_uuid: true },
    });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { degree_uuid: "deg-001" },
        data: expect.objectContaining({ degree_name_en: "Updated Name" }),
      }),
    );
    expect(result.operation).toBe("success");
  });

  it("returns error when degree not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await updateDegree("nonexistent", "Name");

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Degree not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error on invalid input (missing uuid)", async () => {
    const result = await updateDegree("", "Name");

    expect(result.operation).toBe("error");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns error when db update fails", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ degree_uuid: "deg-001" });
    mockUpdate.mockRejectedValue(new Error("DB error"));

    const result = await updateDegree("deg-001", "Name");

    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — deleteDegree
// ---------------------------------------------------------------------------

describe("deleteDegree action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes an existing degree", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ degree_uuid: "deg-001" });
    mockDelete.mockResolvedValue({ degree_uuid: "deg-001" });

    const result = await deleteDegree("deg-001");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { degree_uuid: "deg-001" },
      select: { degree_uuid: true },
    });
    expect(mockDelete).toHaveBeenCalledWith({
      where: { degree_uuid: "deg-001" },
    });
    expect(result.operation).toBe("success");
    expect(result.message).toBe("Degree deleted successfully");
  });

  it("returns error when degree not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await deleteDegree("nonexistent");

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Degree not found");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns error on invalid uuid", async () => {
    const result = await deleteDegree("");

    expect(result.operation).toBe("error");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns error when db delete fails", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ degree_uuid: "deg-001" });
    mockDelete.mockRejectedValue(new Error("DB error"));

    const result = await deleteDegree("deg-001");

    expect(result.operation).toBe("error");
  });
});
