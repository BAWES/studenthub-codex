import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listMajorsSchema,
  createMajorSchema,
  updateMajorSchema,
  deleteMajorSchema,
  getMajorSchema,
  majorItemSchema,
  listMajorsResultSchema,
  majorActionResponseSchema,
  majorDetailSchema,
} from "./schemas";
import type { MajorItem, ListMajorsResult, MajorDetail } from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockRevalidatePath,
  mockFindMany,
  mockCount,
  mockFindUnique,
  mockCreate,
  mockUpdate,
  mockDelete,
} = vi.hoisted(() => ({
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
    major: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

import { listMajors, createMajor, updateMajor, deleteMajor, getMajor } from "./actions";

// ---------------------------------------------------------------------------
// Input schema validation
// ---------------------------------------------------------------------------

describe("listMajorsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listMajorsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts explicit pagination params", () => {
    const result = listMajorsSchema.safeParse({ page: 2, limit: 25 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });

  it("rejects limit over 200", () => {
    const result = listMajorsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listMajorsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listMajorsSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });
});

describe("createMajorSchema", () => {
  it("accepts valid input", () => {
    const result = createMajorSchema.safeParse({
      major_name_en: "Computer Science",
      major_name_ar: "علوم الحاسوب",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.major_name_en).toBe("Computer Science");
      expect(result.data.major_name_ar).toBe("علوم الحاسوب");
    }
  });

  it("rejects empty english name", () => {
    const result = createMajorSchema.safeParse({
      major_name_en: "",
      major_name_ar: "علوم الحاسوب",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty arabic name", () => {
    const result = createMajorSchema.safeParse({
      major_name_en: "Computer Science",
      major_name_ar: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name over 150 chars", () => {
    const result = createMajorSchema.safeParse({
      major_name_en: "a".repeat(151),
      major_name_ar: "b".repeat(151),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = createMajorSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateMajorSchema", () => {
  it("accepts valid update params", () => {
    const result = updateMajorSchema.safeParse({
      major_uuid: "abc-123",
      major_name_en: "Updated",
      major_name_ar: "محدث",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.major_uuid).toBe("abc-123");
      expect(result.data.major_name_en).toBe("Updated");
    }
  });

  it("rejects missing major_uuid", () => {
    const result = updateMajorSchema.safeParse({
      major_name_en: "CS",
      major_name_ar: "cs",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = updateMajorSchema.safeParse({
      major_uuid: "abc",
      major_name_en: "",
      major_name_ar: "cs",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteMajorSchema", () => {
  it("accepts a valid UUID", () => {
    const result = deleteMajorSchema.safeParse({ major_uuid: "abc-123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.major_uuid).toBe("abc-123");
    }
  });

  it("rejects missing major_uuid", () => {
    const result = deleteMajorSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty major_uuid", () => {
    const result = deleteMajorSchema.safeParse({ major_uuid: "" });
    expect(result.success).toBe(false);
  });
});

describe("getMajorSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getMajorSchema.safeParse({ major_uuid: "abc-123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getMajorSchema.safeParse({ major_uuid: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("majorItemSchema", () => {
  it("accepts a valid major item", () => {
    const item: MajorItem = {
      major_uuid: "abc-123",
      major_name_en: "Computer Science",
      major_name_ar: "علوم الحاسوب",
      data_source: null,
      major_created_at: new Date("2025-01-01"),
      major_updated_at: null,
    };
    const result = majorItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects missing major_name_en", () => {
    const result = majorItemSchema.safeParse({ major_uuid: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("listMajorsResultSchema", () => {
  it("accepts a valid list result with items", () => {
    const result: ListMajorsResult = {
      majors: [
        {
          major_uuid: "abc-123",
          major_name_en: "CS",
          major_name_ar: "cs",
          data_source: null,
          major_created_at: null,
          major_updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    };
    const parsed = listMajorsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts empty majors array", () => {
    const result: ListMajorsResult = {
      majors: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
    const parsed = listMajorsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects non-array majors", () => {
    const result = { majors: "not-an-array", total: 0, page: 1, limit: 50, totalPages: 0 };
    const parsed = listMajorsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

describe("majorActionResponseSchema", () => {
  it("accepts a success response", () => {
    const result = { operation: "success", message: "Major created successfully" };
    const parsed = majorActionResponseSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("accepts an error response", () => {
    const result = { operation: "error", message: "Major not found" };
    const parsed = majorActionResponseSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const result = { message: "Something" };
    const parsed = majorActionResponseSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it("rejects empty message", () => {
    const result = { operation: "success", message: "" };
    const parsed = majorActionResponseSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action-level tests — mocked DB
// ---------------------------------------------------------------------------

describe("listMajors action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const dbRows = [
      {
        major_uuid: "abc-1",
        major_name_en: "Computer Science",
        major_name_ar: "علوم الحاسوب",
        data_source: null,
        major_created_at: new Date("2025-01-01"),
        major_updated_at: null,
      },
      {
        major_uuid: "abc-2",
        major_name_en: "Mathematics",
        major_name_ar: "الرياضيات",
        data_source: 1,
        major_created_at: new Date("2025-01-02"),
        major_updated_at: null,
      },
    ];

    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue(dbRows);
    mockCount.mockResolvedValue(2);

    const result = await listMajors({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { major_name_en: "asc" },
        skip: 0,
        take: 50,
      }),
    );
    expect(result.majors).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
    expect(result.totalPages).toBe(1);

    // Verify shape mapping
    expect(result.majors[0]).toEqual({
      major_uuid: "abc-1",
      major_name_en: "Computer Science",
      major_name_ar: "علوم الحاسوب",
      data_source: null,
      major_created_at: dbRows[0].major_created_at,
      major_updated_at: null,
    });
  });

  it("handles pagination correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(50);

    await listMajors({ page: 3, limit: 10 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it("computes totalPages correctly", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(55);

    const result = await listMajors({ page: 1, limit: 20 });
    expect(result.totalPages).toBe(3);
  });

  it("returns empty result when no majors exist", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listMajors({});
    expect(result.majors).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(listMajors({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

describe("getMajor action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a major with candidate count", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({
      major_uuid: "abc-123",
      major_name_en: "Computer Science",
      major_name_ar: "علوم الحاسوب",
      data_source: 1,
      major_created_at: new Date("2025-01-01"),
      major_updated_at: null,
      _count: { candidate_education: 15 },
    });

    const result = await getMajor("abc-123");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { major_uuid: "abc-123" },
      select: expect.objectContaining({
        major_uuid: true,
        major_name_en: true,
        _count: { select: { candidate_education: true } },
      }),
    });
    expect(result.major.major_name_en).toBe("Computer Science");
    expect(result.candidate_count).toBe(15);
  });

  it("returns empty when major not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await getMajor("non-existent");
    expect(result.major).toBeNull();
    expect(result.candidate_count).toBe(0);
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getMajor("abc")).rejects.toThrow("Unauthorized");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

describe("createMajor action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a major successfully", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockResolvedValue({
      major_uuid: "abc-123",
      major_name_en: "New Major",
      major_name_ar: "تخصص جديد",
      data_source: null,
      major_created_at: new Date(),
      major_updated_at: null,
    });

    const result = await createMajor("New Major", "تخصص جديد");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        major_uuid: expect.any(String),
        major_name_en: "New Major",
        major_name_ar: "تخصص جديد",
      }),
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/major");
    expect(result.operation).toBe("success");
    expect(result.message).toBe("Major created successfully");
  });

  it("returns error for empty english name", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await createMajor("", "ar");

    expect(result.operation).toBe("error");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns error for empty arabic name", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await createMajor("en", "");

    expect(result.operation).toBe("error");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns error when prisma.create throws", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockCreate.mockRejectedValue(new Error("DB error"));

    const result = await createMajor("Failing", "فشل");

    expect(result.operation).toBe("error");
    expect(result.message).toContain("problem");
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(createMajor("Test", "اختبار")).rejects.toThrow("Unauthorized");
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe("updateMajor action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a major successfully", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ major_uuid: "abc-123" });

    const result = await updateMajor("abc-123", "Updated En", "محدث Ar");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { major_uuid: "abc-123" },
      select: { major_uuid: true },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { major_uuid: "abc-123" },
      data: { major_name_en: "Updated En", major_name_ar: "محدث Ar" },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/major");
    expect(result.operation).toBe("success");
    expect(result.message).toBe("Major successfully updated");
  });

  it("returns error when major not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await updateMajor("nonexistent", "En", "Ar");

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Major not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error for empty english name", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await updateMajor("abc", "", "Ar");

    expect(result.operation).toBe("error");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns error when prisma.update throws", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ major_uuid: "abc" });
    mockUpdate.mockRejectedValue(new Error("DB error"));

    const result = await updateMajor("abc", "En", "Ar");

    expect(result.operation).toBe("error");
    expect(result.message).toContain("problem");
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(updateMajor("abc", "En", "Ar")).rejects.toThrow(
      "Unauthorized",
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("deleteMajor action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a major successfully", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ major_uuid: "abc-123" });

    const result = await deleteMajor("abc-123");

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { major_uuid: "abc-123" },
      select: { major_uuid: true },
    });
    expect(mockDelete).toHaveBeenCalledWith({
      where: { major_uuid: "abc-123" },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/major");
    expect(result.operation).toBe("success");
    expect(result.message).toBe("Major deleted successfully");
  });

  it("returns error when major not found", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue(null);

    const result = await deleteMajor("nonexistent");

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Major not found");
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("returns error for empty UUID", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });

    const result = await deleteMajor("");

    expect(result.operation).toBe("error");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns error when prisma.delete throws", async () => {
    mockRequireCapability.mockResolvedValue({ user: { id: 1 } });
    mockFindUnique.mockResolvedValue({ major_uuid: "abc" });
    mockDelete.mockRejectedValue(new Error("DB error"));

    const result = await deleteMajor("abc");

    expect(result.operation).toBe("error");
    expect(result.message).toContain("problem");
  });

  it("throws when session fails", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(deleteMajor("abc")).rejects.toThrow("Unauthorized");
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
