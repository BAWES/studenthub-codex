import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must use vi.hoisted() because vi.mock factories are hoisted
// ---------------------------------------------------------------------------

const {
  mockFindMany,
  mockCount,
  mockFindUnique,
  mockCreate,
  mockUpdate,
  mockDelete,
  mockRequireCapability,
} = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockRequireCapability: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    department: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (must come after vi.mock calls)
// ---------------------------------------------------------------------------

import {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "./actions";

import {
  listDepartmentsSchema,
  getDepartmentSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
  departmentItemSchema,
  listDepartmentsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const SAMPLE_DEPT = {
  department_uuid: "dept-001-uuid",
  department_name_en: "Information Technology",
  department_name_ar: "تقنية المعلومات",
};

const SAMPLE_DEPT_NO_AR = {
  department_uuid: "dept-002-uuid",
  department_name_en: "Human Resources",
  department_name_ar: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireCapability.mockResolvedValue({ id: "1", role: "admin" });
});

// ===================================================================
// Schema validation tests
// ===================================================================

describe("listDepartmentsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listDepartmentsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
      expect(r.data.nameFilter).toBeUndefined();
    }
  });

  it("accepts explicit page, limit, and nameFilter", () => {
    const r = listDepartmentsSchema.safeParse({ page: "3", limit: "50", nameFilter: "IT" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(50);
      expect(r.data.nameFilter).toBe("IT");
    }
  });

  it("rejects page less than 1", () => {
    expect(listDepartmentsSchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listDepartmentsSchema.safeParse({ page: "-1" }).success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    expect(listDepartmentsSchema.safeParse({ limit: "101" }).success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    expect(listDepartmentsSchema.safeParse({ limit: "0" }).success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    expect(listDepartmentsSchema.safeParse({ page: "abc" }).success).toBe(false);
  });
});

describe("getDepartmentSchema", () => {
  it("accepts a valid UUID string", () => {
    const r = getDepartmentSchema.safeParse({ uuid: "dept-001" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.uuid).toBe("dept-001");
  });

  it("rejects empty UUID", () => {
    expect(getDepartmentSchema.safeParse({ uuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getDepartmentSchema.safeParse({}).success).toBe(false);
  });
});

describe("createDepartmentSchema", () => {
  it("accepts valid input with both names", () => {
    const r = createDepartmentSchema.safeParse({
      departmentNameEn: "Engineering",
      departmentNameAr: "الهندسة",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.departmentNameEn).toBe("Engineering");
      expect(r.data.departmentNameAr).toBe("الهندسة");
    }
  });

  it("accepts English-only input", () => {
    const r = createDepartmentSchema.safeParse({ departmentNameEn: "HR" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.departmentNameAr).toBe("");
    }
  });

  it("rejects empty English name", () => {
    expect(createDepartmentSchema.safeParse({ departmentNameEn: "" }).success).toBe(false);
  });

  it("rejects missing English name", () => {
    expect(createDepartmentSchema.safeParse({ departmentNameAr: "الموارد" }).success).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    expect(
      createDepartmentSchema.safeParse({ departmentNameEn: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects whitespace-only English name", () => {
    expect(createDepartmentSchema.safeParse({ departmentNameEn: "   " }).success).toBe(false);
  });

  it("rejects Arabic name over 255 chars", () => {
    expect(
      createDepartmentSchema.safeParse({
        departmentNameEn: "Test",
        departmentNameAr: "x".repeat(256),
      }).success,
    ).toBe(false);
  });
});

describe("updateDepartmentSchema", () => {
  it("requires departmentUuid", () => {
    expect(updateDepartmentSchema.safeParse({}).success).toBe(false);
  });

  it("accepts UUID with optional fields", () => {
    const r = updateDepartmentSchema.safeParse({
      departmentUuid: "dept-001",
      departmentNameEn: "Engineering (Updated)",
    });
    expect(r.success).toBe(true);
  });

  it("accepts only UUID (no changes)", () => {
    const r = updateDepartmentSchema.safeParse({
      departmentUuid: "dept-001",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty departmentUuid", () => {
    expect(updateDepartmentSchema.safeParse({ departmentUuid: "" }).success).toBe(false);
  });

  it("rejects empty English name when provided", () => {
    expect(
      updateDepartmentSchema.safeParse({
        departmentUuid: "dept-001",
        departmentNameEn: "",
      }).success,
    ).toBe(false);
  });

  it("rejects whitespace-only English name when provided", () => {
    expect(
      updateDepartmentSchema.safeParse({
        departmentUuid: "dept-001",
        departmentNameEn: "   ",
      }).success,
    ).toBe(false);
  });
});

describe("deleteDepartmentSchema", () => {
  it("requires departmentUuid", () => {
    expect(deleteDepartmentSchema.safeParse({}).success).toBe(false);
  });

  it("accepts valid UUID", () => {
    expect(
      deleteDepartmentSchema.safeParse({ departmentUuid: "dept-001" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(deleteDepartmentSchema.safeParse({ departmentUuid: "" }).success).toBe(false);
  });
});

describe("departmentItemSchema (output)", () => {
  it("validates a full department item with Arabic name", () => {
    expect(
      departmentItemSchema.safeParse(SAMPLE_DEPT).success,
    ).toBe(true);
  });

  it("validates a department item with null Arabic name", () => {
    expect(
      departmentItemSchema.safeParse(SAMPLE_DEPT_NO_AR).success,
    ).toBe(true);
  });

  it("rejects missing department_uuid", () => {
    expect(
      departmentItemSchema.safeParse({ department_name_en: "IT", department_name_ar: null }).success,
    ).toBe(false);
  });

  it("rejects non-string department_uuid", () => {
    expect(
      departmentItemSchema.safeParse({
        department_uuid: 123,
        department_name_en: "IT",
        department_name_ar: null,
      }).success,
    ).toBe(false);
  });
});

describe("listDepartmentsResultSchema (output)", () => {
  it("validates a complete list result", () => {
    expect(
      listDepartmentsResultSchema.safeParse({
        departments: [SAMPLE_DEPT],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }).success,
    ).toBe(true);
  });

  it("validates an empty department list", () => {
    expect(
      listDepartmentsResultSchema.safeParse({
        departments: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listDepartmentsResultSchema.safeParse({
        departments: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listDepartmentsResultSchema.safeParse({
        departments: [],
        total: 0,
        page: 0,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });
});

// ===================================================================
// Runtime action tests (mocked Prisma)
// ===================================================================

describe("listDepartments (runtime)", () => {
  it("returns paginated departments with total count", async () => {
    mockFindMany.mockResolvedValue([SAMPLE_DEPT, SAMPLE_DEPT_NO_AR]);
    mockCount.mockResolvedValue(2);

    const result = await listDepartments({ page: 1, limit: 20 });

    expect(result.departments).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
  });

  it("applies nameFilter to Prisma query", async () => {
    mockFindMany.mockResolvedValue([SAMPLE_DEPT]);
    mockCount.mockResolvedValue(1);

    await listDepartments({ nameFilter: "IT" });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { department_name_en: { contains: "IT" } },
      }),
    );
  });

  it("handles empty results", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const result = await listDepartments({ page: 1, limit: 20 });

    expect(result.departments).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("requires admin.system capability", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listDepartments({});

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
  });

  it("throws on invalid params", async () => {
    await expect(listDepartments({ page: 0 })).rejects.toThrow();
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

describe("getDepartment (runtime)", () => {
  it("returns department when found", async () => {
    mockFindUnique.mockResolvedValue(SAMPLE_DEPT);

    const result = await getDepartment({ uuid: "dept-001-uuid" });

    expect(result).not.toBeNull();
    expect(result!.department_name_en).toBe("Information Technology");
    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { department_uuid: "dept-001-uuid" } }),
    );
  });

  it("returns null when not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await getDepartment({ uuid: "nonexistent" });

    expect(result).toBeNull();
  });

  it("requires admin.system capability", async () => {
    mockFindUnique.mockResolvedValue(null);
    await getDepartment({ uuid: "dept-001" });
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
  });

  it("throws on empty UUID", async () => {
    await expect(getDepartment({ uuid: "" })).rejects.toThrow();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

describe("createDepartment (runtime)", () => {
  it("creates a new department and returns its UUID", async () => {
    mockCreate.mockResolvedValue({ department_uuid: "new-uuid-123" });

    const result = await createDepartment({
      departmentNameEn: "Engineering",
      departmentNameAr: "الهندسة",
    });

    expect(result.departmentUuid).toBe("new-uuid-123");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          department_name_en: "Engineering",
          department_name_ar: "الهندسة",
        }),
      }),
    );
  });

  it("sets Arabic name to null when not provided", async () => {
    mockCreate.mockResolvedValue({ department_uuid: "new-uuid-456" });

    await createDepartment({ departmentNameEn: "HR" });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          department_name_ar: null,
        }),
      }),
    );
  });

  it("requires admin.system capability", async () => {
    mockCreate.mockResolvedValue({ department_uuid: "x" });
    await createDepartment({ departmentNameEn: "Test" });
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
  });

  it("throws on empty English name", async () => {
    await expect(
      createDepartment({ departmentNameEn: "" }),
    ).rejects.toThrow();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe("updateDepartment (runtime)", () => {
  it("updates a department with new name", async () => {
    mockUpdate.mockResolvedValue({ department_uuid: "dept-001" });

    const result = await updateDepartment({
      departmentUuid: "dept-001",
      departmentNameEn: "Engineering (Updated)",
    });

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { department_uuid: "dept-001" },
        data: expect.objectContaining({
          department_name_en: "Engineering (Updated)",
          department_updated_at: expect.any(Date),
        }),
      }),
    );
  });

  it("requires departmentUuid only when no changes", async () => {
    mockUpdate.mockResolvedValue({});

    await expect(
      updateDepartment({ departmentUuid: "dept-001" }),
    ).resolves.toEqual({ success: true });
  });

  it("requires admin.system capability", async () => {
    mockUpdate.mockResolvedValue({});
    await updateDepartment({
      departmentUuid: "dept-001",
      departmentNameEn: "New Name",
    });
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
  });

  it("throws on empty departmentUuid", async () => {
    await expect(
      updateDepartment({ departmentUuid: "", departmentNameEn: "Nope" }),
    ).rejects.toThrow();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe("deleteDepartment (runtime)", () => {
  it("deletes a department and returns success", async () => {
    mockDelete.mockResolvedValue({ department_uuid: "dept-001" });

    const result = await deleteDepartment({ departmentUuid: "dept-001" });

    expect(result.success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { department_uuid: "dept-001" } }),
    );
  });

  it("requires admin.system capability", async () => {
    mockDelete.mockResolvedValue({});
    await deleteDepartment({ departmentUuid: "dept-001" });
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.system");
  });

  it("throws on empty departmentUuid", async () => {
    await expect(
      deleteDepartment({ departmentUuid: "" }),
    ).rejects.toThrow();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
