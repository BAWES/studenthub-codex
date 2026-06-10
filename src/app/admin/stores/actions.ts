"use server";

// ---------------------------------------------------------------------------
// Admin StoreController — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/StoreController.php
//
// Actions:
//   - listStores     — paginated list of all stores with filters (name, status)
//   - getStore       — single store detail with contact info, company, brand, mall
//   - createStore    — create a new store
//   - updateStore    — update an existing store
//   - deleteStore    — soft-delete a store
//
// Status: store_status is an Int (SmallInt) where 10 = active, 0 = inactive.
// Filter accepts 'active'/'inactive' strings and converts accordingly.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listStoresSchema,
  getStoreSchema,
  createStoreSchema,
  updateStoreSchema,
  deleteStoreSchema,
  type ListStoresInput,
  type GetStoreInput,
  type CreateStoreInput,
  type UpdateStoreInput,
  type DeleteStoreInput,
  type ListStoresResult,
  type StoreRow,
  type StoreDetail,
  type StoreActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listStores
// ---------------------------------------------------------------------------

/**
 * List all stores with pagination, search, and status filtering.
 */
export async function listStores(
  input: ListStoresInput = {},
): Promise<ListStoresResult> {
  await requireCapability("admin.read");

  const parsed = listStoresSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, companyId, status, q } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (companyId !== undefined) where.company_id = companyId;
  if (status !== undefined) {
    where.store_status = status === "active" ? 10 : 0;
  }
  if (q && q.trim().length > 0) {
    where.OR = [
      { store_name: { contains: q.trim() } },
      { store_location: { contains: q.trim() } },
    ];
  }

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where: where as any,
      orderBy: { store_created_at: "desc" },
      skip,
      take: limit,
      include: {
        company: { select: { company_name: true } },
        brand: { select: { brand_name_en: true } },
        mall: { select: { mall_name_en: true } },
        contact: { select: { contact_name: true } },
      },
    }),
    prisma.store.count({ where: where as any }),
  ]);

  return {
    items: stores.map((s: any): StoreRow => ({
      store_id: s.store_id,
      store_name: s.store_name,
      store_location: s.store_location,
      store_status: s.store_status,
      store_total_candidates: s.store_total_candidates ?? null,
      company_name: s.company?.company_name ?? null,
      brand_name: s.brand?.brand_name_en ?? null,
      mall_name: s.mall?.mall_name_en ?? null,
      manager_name: s.contact?.contact_name ?? null,
      created_at: s.store_created_at?.toISOString() ?? null,
      updated_at: s.store_updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getStore
// ---------------------------------------------------------------------------

/**
 * Get a single store with its associated company, contact (manager),
 * brand, and mall information.
 */
export async function getStore(
  storeId: number,
): Promise<StoreDetail> {
  await requireCapability("admin.read");

  const parsed = getStoreSchema.safeParse({ storeId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid store ID");
  }

  const store = await prisma.store.findFirst({
    where: { store_id: parsed.data.storeId },
    include: {
      company: { select: { company_name: true, company_email: true } },
      contact: { select: { contact_name: true, contact_email: true } },
      brand: { select: { brand_name_en: true } },
      mall: { select: { mall_name_en: true } },
    },
  });

  if (!store) {
    return { store: null };
  }

  const s = store as any;

  return {
    store: {
      store_id: s.store_id,
      store_name: s.store_name,
      store_location: s.store_location,
      store_status: s.store_status,
      store_total_candidates: s.store_total_candidates ?? null,
      store_created_at: s.store_created_at?.toISOString() ?? null,
      store_updated_at: s.store_updated_at?.toISOString() ?? null,
      company: s.company
        ? { company_name: s.company.company_name, company_email: s.company.company_email }
        : null,
      contact: s.contact
        ? { contact_name: s.contact.contact_name, contact_email: s.contact.contact_email }
        : null,
      brand: s.brand
        ? { brand_name_en: s.brand.brand_name_en }
        : null,
      mall: s.mall
        ? { mall_name_en: s.mall.mall_name_en }
        : null,
    },
  };
}

// ---------------------------------------------------------------------------
// createStore
// ---------------------------------------------------------------------------

/**
 * Create a new store with the given fields.
 * Returns the new store's ID on success.
 */
export async function createStore(
  input: CreateStoreInput,
): Promise<StoreActionResult> {
  await requireCapability("admin.read");

  const parsed = createStoreSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const store = await prisma.store.create({
      data: {
        store_name: parsed.data.store_name,
        store_location: parsed.data.store_location || "",
        company_id: parsed.data.company_id || null,
        store_status: parsed.data.store_status,
        store_created_at: new Date(),
        store_updated_at: new Date(),
      },
    });

    revalidatePath("/admin/stores");

    return { success: true, storeId: store.store_id };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to create store",
    };
  }
}

// ---------------------------------------------------------------------------
// updateStore
// ---------------------------------------------------------------------------

/**
 * Update an existing store's fields. Only provided fields are updated.
 * Returns an error if the store does not exist.
 */
export async function updateStore(
  input: UpdateStoreInput,
): Promise<StoreActionResult> {
  await requireCapability("admin.read");

  const parsed = updateStoreSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { storeId, ...fields } = parsed.data;

  const existing = await prisma.store.findUnique({
    where: { store_id: storeId },
    select: { store_id: true },
  });

  if (!existing) {
    return { success: false, error: "Store not found" };
  }

  const data: Record<string, unknown> = { store_updated_at: new Date() };
  if (fields.store_name !== undefined) data.store_name = fields.store_name;
  if (fields.store_location !== undefined) data.store_location = fields.store_location;
  if (fields.company_id !== undefined) data.company_id = fields.company_id;
  if (fields.store_status !== undefined) data.store_status = fields.store_status;

  try {
    await prisma.store.update({
      where: { store_id: storeId },
      data,
    });

    revalidatePath("/admin/stores");

    return { success: true, storeId };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to update store",
    };
  }
}

// ---------------------------------------------------------------------------
// deleteStore
// ---------------------------------------------------------------------------

/**
 * Soft-delete a store by setting deleted=1.
 * Returns an error if the store does not exist.
 */
export async function deleteStore(
  input: DeleteStoreInput,
): Promise<StoreActionResult> {
  await requireCapability("admin.read");

  const parsed = deleteStoreSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await prisma.store.findUnique({
    where: { store_id: parsed.data.storeId },
    select: { store_id: true },
  });

  if (!existing) {
    return { success: false, error: "Store not found" };
  }

  try {
    await prisma.store.update({
      where: { store_id: parsed.data.storeId },
      data: {
        deleted: 1,
        store_updated_at: new Date(),
      },
    });

    revalidatePath("/admin/stores");

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to delete store",
    };
  }
}
