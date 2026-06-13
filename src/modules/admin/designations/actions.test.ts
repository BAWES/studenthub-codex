import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listDesignationsSchema,
  createDesignationSchema,
  updateDesignationSchema,
  designationRowSchema,
  listDesignationsResultSchema,
  actionResponseSchema,
} from "./schemas";
import type { CreateDesignationInput, UpdateDesignationInput } from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockRevalidatePath,
  mockFindMany,
  mockCount,
  mockCreate,
  mockUpdate,
  mockDelete,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
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
    designation: {
      findMany: mockFindMany,
      count: mockCount,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

import {
  listDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "./actions";

// ---------------------------------------------------------------------------
// Input schema validation
// ---------------------------------------------------------------------------

describe("listDesignationsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listDesignationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(50);
    }
  });

  it("accepts pagination params", () => {
    const r = listDesignationsSchema.safeParse({ page: 3, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.page).toBe(3);
  });

  it("coerces string page and limit", () => {
    const r = listDesignationsSchema.safeParse({ page: "2", limit: "25" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.page).toBe(2);
  });

  it("rejects limit over 100", () => {
    expect(listDesignationsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listDesignationsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("accepts optional nameFilter", () => {
    const r = listDesignationsSchema.safeParse({ nameFilter: "manager" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.nameFilter).toBe("manager");
  });
});

describe("createDesignationSchema", () => {
  it("accepts valid input with English name only", () => {
    const r = createDesignationSchema.safeParse({ nameEn: "Manager" });
    expect(r.success).toBe(true);
  });

  it("accepts input with both English and Arabic names", () => {
    const r = createDesignationSchema.safeParse({ nameEn: "Manager", nameAr: "مدير" });
    expect(r.success).toBe(true);
  });

  it("rejects empty English name", () => {
    expect(createDesignationSchema.safeParse({ nameEn: "" }).success).toBe(false);
  });

  it("rejects missing English name", () => {
    expect(createDesignationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects overly long name", () => {
    expect(createDesignationSchema.safeParse({ nameEn: "A".repeat(256) }).success).toBe(false);
  });
});

describe("updateDesignationSchema", () => {
  it("accepts valid input with uuid only (partial update)", () => {
    const r = updateDesignationSchema.safeParse({ uuid: "abc-123" });
    expect(r.success).toBe(true);
  });

  it("accepts uuid with English name", () => {
    const r = updateDesignationSchema.safeParse({ uuid: "abc-123", nameEn: "Senior Manager" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.nameEn).toBe("Senior Manager");
  });

  it("accepts uuid with Arabic name", () => {
    const r = updateDesignationSchema.safeParse({ uuid: "abc-123", nameAr: "مدير أول" });
    expect(r.success).toBe(true);
  });

  it("rejects empty uuid", () => {
    expect(updateDesignationSchema.safeParse({ uuid: "" }).success).toBe(false);
  });

  it("rejects missing uuid", () => {
    expect(updateDesignationSchema.safeParse({ nameEn: "Test" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema validation
// ---------------------------------------------------------------------------

describe("designationRowSchema", () => {
  it("accepts a valid designation row", () => {
    const r = designationRowSchema.safeParse({
      designation_uuid: "abc-123",
      designation_name_en: "Manager",
      designation_name_ar: null,
      designation_created_at: new Date("2026-01-01"),
      designation_updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing designation_uuid", () => {
    const r = designationRowSchema.safeParse({
      designation_name_en: "Manager",
      designation_name_ar: null,
      designation_created_at: null,
      designation_updated_at: null,
    });
    expect(r.success).toBe(false);
  });
});

describe("listDesignationsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listDesignationsResultSchema.safeParse({
      designations: [{
        designation_uuid: "abc-123",
        designation_name_en: "Manager",
        designation_name_ar: null,
        designation_created_at: new Date(),
        designation_updated_at: null,
      }],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listDesignationsResultSchema.safeParse({
      designations: [], total: -1, page: 1, limit: 50, totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-positive page", () => {
    const r = listDesignationsResultSchema.safeParse({
      designations: [], total: 0, page: 0, limit: 50, totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

describe("actionResponseSchema", () => {
  it("accepts success response", () => {
    const r = actionResponseSchema.safeParse({ operation: "success", message: "Designation created" });
    expect(r.success).toBe(true);
  });

  it("accepts error response", () => {
    const r = actionResponseSchema.safeParse({ operation: "error", message: "Failed" });
    expect(r.success).toBe(true);
  });

  it("rejects unknown operation value", () => {
    expect(actionResponseSchema.safeParse({ operation: "unknown", message: "msg" }).success).toBe(false);
  });

  it("accepts empty message (schema has no .min() constraint)", () => {
    expect(actionResponseSchema.safeParse({ operation: "success", message: "" }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Runtime action tests — listDesignations
// ---------------------------------------------------------------------------

describe("listDesignations — runtime", () => {
  const MOCK_ROWS = [
    {
      designation_uuid: "uuid-1",
      designation_name_en: "Manager",
      designation_name_ar: "مدير",
      designation_created_at: new Date("2026-01-01"),
      designation_updated_at: null,
    },
    {
      designation_uuid: "uuid-2",
      designation_name_en: "Supervisor",
      designation_name_ar: null,
      designation_created_at: new Date("2026-02-01"),
      designation_updated_at: new Date("2026-03-01"),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue(MOCK_ROWS);
    mockCount.mockResolvedValue(2);
  });

  it("returns paginated designation list", async () => {
    const result = await listDesignations({});
    expect(result.designations).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("calls requireCapability with admin.read", async () => {
    await listDesignations({});
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
  });

  it("queries Prisma with default pagination", async () => {
    await listDesignations({});
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 50 }),
    );
  });

  it("applies name filter with case-insensitive search", async () => {
    await listDesignations({ nameFilter: "manager" });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ designation_name_en: { contains: "manager", mode: "insensitive" } }),
          ]),
        }),
      }),
    );
  });

  it("returns raw Prisma rows in output", async () => {
    const result = await listDesignations({});
    expect(result.designations[0].designation_name_en).toBe("Manager");
    expect(result.designations[0].designation_name_ar).toBe("مدير");
  });

  it("returns empty result on invalid input", async () => {
    const result = await listDesignations({ page: -1 });
    expect(result.designations).toEqual([]);
    expect(result.total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Runtime action tests — createDesignation
// ---------------------------------------------------------------------------

describe("createDesignation — runtime", () => {
  const VALID_INPUT: CreateDesignationInput = { nameEn: "Manager" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue({ designation_uuid: "new-uuid" });
  });

  it("creates designation and returns success", async () => {
    const result = await createDesignation(VALID_INPUT);
    expect(result).toEqual({ operation: "success", message: "Designation created" });
  });

  it("creates designation with Arabic name", async () => {
    await createDesignation({ nameEn: "Manager", nameAr: "مدير" });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          designation_name_en: "Manager",
          designation_name_ar: "مدير",
        }),
      }),
    );
  });

  it("calls requireCapability with admin.write", async () => {
    await createDesignation(VALID_INPUT);
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("re-validates /admin/designations on success", async () => {
    await createDesignation(VALID_INPUT);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/designations");
  });

  it("returns error on validation failure", async () => {
    const result = await createDesignation({ nameEn: "" });
    expect(result.operation).toBe("error");
    expect(result.message).toBeTruthy();
  });

  it("returns error on Prisma exception", async () => {
    mockCreate.mockRejectedValue(new Error("Duplicate entry"));
    const result = await createDesignation(VALID_INPUT);
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// Runtime action tests — updateDesignation
// ---------------------------------------------------------------------------

describe("updateDesignation — runtime", () => {
  const VALID_INPUT: UpdateDesignationInput = { uuid: "uuid-1", nameEn: "Senior Manager" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue({ designation_uuid: "uuid-1" });
  });

  it("updates designation and returns success", async () => {
    const result = await updateDesignation(VALID_INPUT);
    expect(result).toEqual({ operation: "success", message: "Designation updated" });
  });

  it("calls requireCapability with admin.write", async () => {
    await updateDesignation(VALID_INPUT);
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("re-validates /admin/designations on success", async () => {
    await updateDesignation(VALID_INPUT);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/designations");
  });

  it("returns error on validation failure (empty uuid)", async () => {
    const result = await updateDesignation({ uuid: "" });
    expect(result.operation).toBe("error");
  });

  it("returns error on Prisma exception", async () => {
    mockUpdate.mockRejectedValue(new Error("Not found"));
    const result = await updateDesignation(VALID_INPUT);
    expect(result.operation).toBe("error");
  });

  it("updates only provided fields", async () => {
    await updateDesignation({ uuid: "uuid-1", nameAr: "مدير أول" });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { designation_uuid: "uuid-1" },
        data: expect.objectContaining({
          designation_name_ar: "مدير أول",
          designation_updated_at: expect.any(Date),
        }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Runtime action tests — deleteDesignation
// ---------------------------------------------------------------------------

describe("deleteDesignation — runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue({ designation_uuid: "uuid-1" });
  });

  it("deletes designation and returns success", async () => {
    const result = await deleteDesignation("uuid-1");
    expect(result).toEqual({ operation: "success", message: "Designation deleted" });
  });

  it("calls requireCapability with admin.write", async () => {
    await deleteDesignation("uuid-1");
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("re-validates /admin/designations on success", async () => {
    await deleteDesignation("uuid-1");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/designations");
  });

  it("deletes by UUID", async () => {
    await deleteDesignation("target-uuid");
    expect(mockDelete).toHaveBeenCalledWith({ where: { designation_uuid: "target-uuid" } });
  });

  it("returns error on Prisma exception", async () => {
    mockDelete.mockRejectedValue(new Error("FK constraint"));
    const result = await deleteDesignation("uuid-1");
    expect(result.operation).toBe("error");
  });
});
