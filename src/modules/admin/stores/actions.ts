"use server";

// ---------------------------------------------------------------------------
// Admin StoreController — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/StoreController.php
//
// Actions:
//   - listStores   — paginated list of all stores with filters (name, status)
//   - getStore     — single store detail with contact info, company, brand, mall
//   - createStore  — create a new store
//   - updateStore  — update an existing store with partial fields
//   - deleteStore  — soft-delete a store by marking deleted=1
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
  listStoresResultSchema,
  storeDetailSchema,
  storeActionResultSchema,
  type ListStoresInput,
  type GetStoreInput,
  type CreateStoreInput,
  type UpdateStoreInput,
  type DeleteStoreInput,
  type StoreRow,
  type StoreDetail,
  type StoreActionResult,
  type ListStoresResult,
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

  const result = {
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

  // Validate output shape
  const outputParsed = listStoresResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/stores] listStores output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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
    const result = { store: null };

    // Validate output shape
    const outputParsed = storeDetailSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/stores] getStore output validation failed (not found):",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const s = store as any;

  const result = {
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

  // Validate output shape
  const outputParsed = storeDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/stores] getStore output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createStore
// ---------------------------------------------------------------------------

/**
 * Create a new store with the given details.
 */
export async function createStore(
  input: CreateStoreInput,
): Promise<StoreActionResult> {
  await requireCapability("admin.write");

  const parsed = createStoreSchema.safeParse(input);
  if (!parsed.success) {
    const result = { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    // Validate output shape
    const outputParsed = storeActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/stores] createStore output validation failed (validation error):",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  try {
    const { company_id, store_manager_uuid, brand_uuid, mall_uuid, ...rest } = parsed.data;
    const store = await prisma.store.create({
      data: {
        ...rest,
        store_status: 10,
        store_created_at: new Date(),
        store_updated_at: new Date(),
        ...(company_id !== undefined ? { company_id } : {}),
        ...(store_manager_uuid !== undefined ? { store_manager_uuid } : {}),
        ...(brand_uuid !== undefined ? { brand_uuid } : {}),
        ...(mall_uuid !== undefined ? { mall_uuid } : {}),
      },
    });

    revalidatePath("/admin/stores");

    const result = { success: true, storeId: store.store_id };

    // Validate output shape
    const outputParsed = storeActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/stores] createStore output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (err) {
    const result = { success: false, error: err instanceof Error ? err.message : "Failed to create store" };

    // Validate output shape
    const outputParsed = storeActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/stores] createStore output validation failed (catch):",
        outputParsed.error.issues,
      );
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// updateStore
// ---------------------------------------------------------------------------

/**
 * Update an existing store. Only provided fields are updated.
 */
export async function updateStore(
  input: UpdateStoreInput,
): Promise<StoreActionResult> {
  await requireCapability("admin.write");

  const parsed = updateStoreSchema.safeParse(input);
  if (!parsed.success) {
    const result = { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    // Validate output shape
    const outputParsed = storeActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/stores] updateStore output validation failed (validation error):",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const { storeId, ...fields } = parsed.data;

  const existing = await prisma.store.findUnique({ where: { store_id: storeId } });
  if (!existing) {
    const result = { success: false, error: "Store not found" };

    // Validate output shape
    const outputParsed = storeActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/stores] updateStore output validation failed (not found):",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  try {
    const updateData: Record<string, unknown> = { store_updated_at: new Date() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    await prisma.store.update({
      where: { store_id: storeId },
      data: updateData as any,
    });

    revalidatePath("/admin/stores");

    const result = { success: true, storeId };

    // Validate output shape
    const outputParsed = storeActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/stores] updateStore output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (err) {
    const result = { success: false, error: err instanceof Error ? err.message : "Failed to update store" };

    // Validate output shape
    const outputParsed = storeActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/stores] updateStore output validation failed (catch):",
        outputParsed.error.issues,
      );
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// deleteStore
// ---------------------------------------------------------------------------

/**
 * Soft-delete a store by marking it as deleted.
 */
export async function deleteStore(
  input: DeleteStoreInput,
): Promise<StoreActionResult> {
  await requireCapability("admin.write");

  const parsed = deleteStoreSchema.safeParse(input);
  if (!parsed.success) {
    const result = { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    // Validate output shape
    const outputParsed = storeActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/stores] deleteStore output validation failed (validation error):",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const existing = await prisma.store.findUnique({ where: { store_id: parsed.data.storeId } });
  if (!existing) {
    const result = { success: false, error: "Store not found" };

    // Validate output shape
    const outputParsed = storeActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/stores] deleteStore output validation failed (not found):",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  try {
    await prisma.store.update({
      where: { store_id: parsed.data.storeId },
      data: { deleted: 1, store_updated_at: new Date() },
    });

    revalidatePath("/admin/stores");

    const result = { success: true };

    // Validate output shape
    const outputParsed = storeActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/stores] deleteStore output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (err) {
    const result = { success: false, error: err instanceof Error ? err.message : "Failed to delete store" };

    // Validate output shape
    const outputParsed = storeActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/stores] deleteStore output validation failed (catch):",
        outputParsed.error.issues,
      );
    }

    return result;
  }
}
