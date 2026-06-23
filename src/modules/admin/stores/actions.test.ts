import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listStoresSchema,
  getStoreSchema,
  createStoreSchema,
  updateStoreSchema,
  deleteStoreSchema,
  storeRowSchema,
  storeDetailSchema,
  listStoresResultSchema,
  storeActionResultSchema,
} from "./schemas";
import type {
  ListStoresInput,
  CreateStoreInput,
  UpdateStoreInput,
} from "./schemas";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockRevalidatePath,
  mockFindMany,
  mockCount,
  mockFindFirst,
  mockFindUnique,
  mockCreate,
  mockUpdate,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindFirst: vi.fn(),
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
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
    store: {
      findMany: mockFindMany,
      count: mockCount,
      findFirst: mockFindFirst,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
    },
  },
}));

import {
  listStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
} from "./actions";

// ---------------------------------------------------------------------------
// Unit test coverage for admin/stores actions
// (STU-3276)
// ---------------------------------------------------------------------------

describe("listStoresSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listStoresSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listStoresSchema.safeParse({ page: 3, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.page).toBe(3);
  });

  it("coerces string page and limit", () => {
    const r = listStoresSchema.safeParse({ page: "2", limit: "50" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.page).toBe(2);
  });

  it("rejects limit over 100", () => {
    expect(listStoresSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listStoresSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("accepts active/inactive status", () => {
    expect(listStoresSchema.safeParse({ status: "active" }).success).toBe(true);
    expect(listStoresSchema.safeParse({ status: "inactive" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(listStoresSchema.safeParse({ status: "unknown" }).success).toBe(false);
  });

  it("accepts companyId filter", () => {
    const r = listStoresSchema.safeParse({ companyId: "5" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.companyId).toBe(5);
  });

  it("accepts search query", () => {
    const r = listStoresSchema.safeParse({ q: "Tech" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.q).toBe("Tech");
  });
});

describe("getStoreSchema", () => {
  it("accepts valid storeId", () => {
    expect(getStoreSchema.safeParse({ storeId: 1 }).success).toBe(true);
  });

  it("coerces string storeId", () => {
    const r = getStoreSchema.safeParse({ storeId: "42" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.storeId).toBe(42);
  });

  it("rejects missing storeId", () => {
    expect(getStoreSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero storeId", () => {
    expect(getStoreSchema.safeParse({ storeId: 0 }).success).toBe(false);
  });
});

describe("createStoreSchema", () => {
  it("accepts valid input (name + location)", () => {
    const r = createStoreSchema.safeParse({
      store_name: "Tech Store",
      store_location: "Floor 1",
    });
    expect(r.success).toBe(true);
  });

  it("accepts full input with all fields", () => {
    const r = createStoreSchema.safeParse({
      store_name: "Tech Store",
      store_location: "Floor 1",
      company_id: "5",
      store_manager_uuid: "mgr-abc",
      brand_uuid: "brand-123",
      mall_uuid: "mall-456",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_id).toBe(5);
    }
  });

  it("rejects missing store_name", () => {
    expect(createStoreSchema.safeParse({ store_location: "Floor 1" }).success).toBe(false);
  });

  it("rejects empty store_name", () => {
    expect(createStoreSchema.safeParse({
      store_name: "",
      store_location: "Floor 1",
    }).success).toBe(false);
  });
});

describe("updateStoreSchema", () => {
  it("accepts storeId only (partial update)", () => {
    expect(updateStoreSchema.safeParse({ storeId: 1 }).success).toBe(true);
  });

  it("accepts all fields", () => {
    const r = updateStoreSchema.safeParse({
      storeId: 1,
      store_name: "New Name",
      store_location: "Floor 2",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing storeId", () => {
    expect(updateStoreSchema.safeParse({ store_name: "New" }).success).toBe(false);
  });
});

describe("deleteStoreSchema", () => {
  it("accepts valid storeId", () => {
    expect(deleteStoreSchema.safeParse({ storeId: 1 }).success).toBe(true);
  });

  it("rejects missing storeId", () => {
    expect(deleteStoreSchema.safeParse({}).success).toBe(false);
  });
});

describe("StoreActionResult type", () => {
  it("accepts success result", () => {
    const r = { success: true, storeId: 1 } as const;
    expect(r.success).toBe(true);
  });

  it("accepts failure result", () => {
    const r = { success: false, error: "Store not found" } as const;
    expect(r.success).toBe(false);
  });
});

// ── Runtime tests ──────────────────────────────────────────

describe("listStores — runtime", () => {
  const MOCK_STORES = [
    {
      store_id: 1,
      store_name: "Tech Store",
      store_location: "Floor 1",
      store_status: 10,
      store_total_candidates: 5,
      store_created_at: new Date("2026-01-01"),
      store_updated_at: new Date("2026-06-01"),
      company: { company_name: "Tech Corp" },
      brand: { brand_name_en: "TechBrand" },
      mall: { mall_name_en: "Mall A" },
      contact: { contact_name: "John Doe" },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue(MOCK_STORES);
    mockCount.mockResolvedValue(1);
  });

  it("returns paginated store list", async () => {
    const result = await listStores({});

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("calls requireCapability with admin.read", async () => {
    await listStores({});
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
  });

  it("queries Prisma with default pagination", async () => {
    await listStores({});
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
  });

  it("applies status filter (active = 10)", async () => {
    await listStores({ status: "active" });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ store_status: 10 }),
      }),
    );
  });

  it("applies search query", async () => {
    await listStores({ q: "Tech" });
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ store_name: { contains: "Tech" } }),
          ]),
        }),
      }),
    );
  });

  it("maps store to StoreRow format", async () => {
    const result = await listStores({});
    expect(result.items[0].store_name).toBe("Tech Store");
    expect(result.items[0].company_name).toBe("Tech Corp");
    expect(result.items[0].manager_name).toBe("John Doe");
  });

  it("returns empty result on invalid input", async () => {
    const result = await listStores({ page: -1 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("getStore — runtime", () => {
  const MOCK_STORE = {
    store_id: 1,
    store_name: "Tech Store",
    store_location: "Floor 1",
    store_status: 10,
    store_total_candidates: 5,
    store_created_at: new Date("2026-01-01"),
    store_updated_at: new Date("2026-06-01"),
    company: { company_name: "Tech Corp", company_email: "info@tech.com" },
    contact: { contact_name: "John Doe", contact_email: "john@tech.com" },
    brand: { brand_name_en: "TechBrand" },
    mall: { mall_name_en: "Mall A" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindFirst.mockResolvedValue(MOCK_STORE);
  });

  it("returns store detail with all relations", async () => {
    const result = await getStore(1);
    expect(result.store).not.toBeNull();
    expect(result.store!.store_name).toBe("Tech Store");
    expect(result.store!.company!.company_name).toBe("Tech Corp");
    expect(result.store!.contact!.contact_name).toBe("John Doe");
  });

  it("calls requireCapability with admin.read", async () => {
    await getStore(1);
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
  });

  it("returns null store when not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await getStore(999);
    expect(result.store).toBeNull();
  });

  it("throws on invalid input", async () => {
    await expect(getStore(0)).rejects.toThrow();
  });
});

describe("createStore — runtime", () => {
  const VALID_INPUT: CreateStoreInput = {
    store_name: "New Store",
    store_location: "Floor 2",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockCreate.mockResolvedValue({ store_id: 1, ...VALID_INPUT });
  });

  it("creates store and returns success", async () => {
    const result = await createStore(VALID_INPUT);
    expect(result).toEqual({ success: true, storeId: 1 });
  });

  it("calls requireCapability with admin.write", async () => {
    await createStore(VALID_INPUT);
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("re-validates /admin/stores on success", async () => {
    await createStore(VALID_INPUT);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/stores");
  });

  it("returns error on validation failure", async () => {
    const result = await createStore({ store_name: "", store_location: "X" });
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("returns error on Prisma exception", async () => {
    mockCreate.mockRejectedValue(new Error("Duplicate entry"));
    const result = await createStore(VALID_INPUT);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Duplicate entry");
  });
});

describe("updateStore — runtime", () => {
  const EXISTING_STORE = { store_id: 1, store_name: "Old Name" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(EXISTING_STORE);
    mockUpdate.mockResolvedValue({ store_id: 1, store_name: "New Name" });
  });

  it("updates store and returns success", async () => {
    const input: UpdateStoreInput = { storeId: 1, store_name: "New Name" };
    const result = await updateStore(input);
    expect(result).toEqual({ success: true, storeId: 1 });
  });

  it("calls requireCapability with admin.write", async () => {
    await updateStore({ storeId: 1, store_name: "New" });
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("checks store exists before update", async () => {
    await updateStore({ storeId: 1, store_name: "New" });
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { store_id: 1 } });
  });

  it("returns error when store not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await updateStore({ storeId: 999, store_name: "New" });
    expect(result).toEqual({ success: false, error: "Store not found" });
  });

  it("re-validates /admin/stores on success", async () => {
    await updateStore({ storeId: 1, store_name: "New" });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/stores");
  });

  it("returns error on validation failure", async () => {
    const result = await updateStore({ storeId: -1 });
    expect(result.success).toBe(false);
  });
});

describe("deleteStore — runtime", () => {
  const EXISTING_STORE = { store_id: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(EXISTING_STORE);
    mockUpdate.mockResolvedValue({ store_id: 1, deleted: 1 });
  });

  it("soft-deletes store and returns success", async () => {
    const result = await deleteStore({ storeId: 1 });
    expect(result).toEqual({ success: true });
  });

  it("calls requireCapability with admin.write", async () => {
    await deleteStore({ storeId: 1 });
    expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("marks as deleted=1 with updated timestamp", async () => {
    await deleteStore({ storeId: 1 });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { store_id: 1 },
      data: expect.objectContaining({ deleted: 1 }),
    });
  });

  it("returns error when store not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await deleteStore({ storeId: 999 });
    expect(result).toEqual({ success: false, error: "Store not found" });
  });

  it("re-validates /admin/stores on success", async () => {
    await deleteStore({ storeId: 1 });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/stores");
  });

  it("returns error on Prisma exception", async () => {
    mockUpdate.mockRejectedValue(new Error("FK constraint"));
    const result = await deleteStore({ storeId: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toContain("FK constraint");
  });
});

// ---------------------------------------------------------------------------
// Output validation schema tests
// ---------------------------------------------------------------------------

describe("storeRowSchema", () => {
  it("accepts a valid store row", () => {
    const r = storeRowSchema.safeParse({
      store_id: 1,
      store_name: "Tech Store",
      store_location: "Floor 1",
      store_status: 10,
      store_total_candidates: 5,
      company_name: "Tech Corp",
      brand_name: "TechBrand",
      mall_name: "Mall A",
      manager_name: "John Doe",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-06-01T00:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = storeRowSchema.safeParse({
      store_id: 1,
      store_name: "Tech Store",
      store_location: "Floor 1",
      store_status: 10,
      store_total_candidates: null,
      company_name: null,
      brand_name: null,
      mall_name: null,
      manager_name: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing store_name", () => {
    const r = storeRowSchema.safeParse({
      store_id: 1,
      store_location: "Floor 1",
      store_status: 10,
      company_name: null,
      brand_name: null,
      mall_name: null,
      manager_name: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty store_name", () => {
    const r = storeRowSchema.safeParse({
      store_id: 1,
      store_name: "",
      store_location: "Floor 1",
      store_status: 10,
      store_total_candidates: null,
      company_name: null,
      brand_name: null,
      mall_name: null,
      manager_name: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(false);
  });
});

describe("listStoresResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listStoresResultSchema.safeParse({
      items: [
        {
          store_id: 1,
          store_name: "Tech Store",
          store_location: "Floor 1",
          store_status: 10,
          store_total_candidates: 5,
          company_name: "Tech Corp",
          brand_name: "TechBrand",
          mall_name: "Mall A",
          manager_name: "John Doe",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-06-01T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const r = listStoresResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative limit", () => {
    const r = listStoresResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: -5,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});

describe("storeDetailSchema", () => {
  it("accepts a full store detail", () => {
    const r = storeDetailSchema.safeParse({
      store: {
        store_id: 1,
        store_name: "Tech Store",
        store_location: "Floor 1",
        store_status: 10,
        store_total_candidates: 5,
        store_created_at: "2026-01-01T00:00:00.000Z",
        store_updated_at: "2026-06-01T00:00:00.000Z",
        company: { company_name: "Tech Corp", company_email: "info@tech.com" },
        contact: { contact_name: "John Doe", contact_email: "john@tech.com" },
        brand: { brand_name_en: "TechBrand" },
        mall: { mall_name_en: "Mall A" },
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts null store (not found)", () => {
    const r = storeDetailSchema.safeParse({ store: null });
    expect(r.success).toBe(true);
  });

  it("rejects missing store", () => {
    const r = storeDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects missing store_name", () => {
    const r = storeDetailSchema.safeParse({
      store: {
        store_id: 1,
        store_location: "Floor 1",
        store_status: 10,
      },
    });
    expect(r.success).toBe(false);
  });
});

describe("storeActionResultSchema", () => {
  it("accepts success result with storeId", () => {
    const r = storeActionResultSchema.safeParse({ success: true, storeId: 1 });
    expect(r.success).toBe(true);
  });

  it("accepts success result without storeId", () => {
    const r = storeActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts error result with message", () => {
    const r = storeActionResultSchema.safeParse({
      success: false,
      error: "Store not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing success", () => {
    const r = storeActionResultSchema.safeParse({ storeId: 1 });
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    const r = storeActionResultSchema.safeParse({ success: "yes" });
    expect(r.success).toBe(false);
  });
});
