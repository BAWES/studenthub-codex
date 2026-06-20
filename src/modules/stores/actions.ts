"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listStoresSchema,
  getStoreSchema,
  listStoresResultSchema,
} from "./schemas";
import type { StoreListItem, ListStoresResult, ListStoresInput } from "./schemas";

// ---------------------------------------------------------------------------
// listStores
// ---------------------------------------------------------------------------

/**
 * List stores with pagination, excluding soft-deleted records.
 * Mirrors the legacy Yii2 StoreController::actionList().
 */
export async function listStores(
  params: FormData | ListStoresInput = {},
): Promise<ListStoresResult> {
  await requireCapability("store.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          companyId: params.get("companyId"),
        }
      : params;

  const parsed = listStoresSchema.safeParse(raw);
  if (!parsed.success) {
    return { stores: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, companyId } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deleted: 0 };
  if (companyId !== undefined) where.company_id = companyId;

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where: where as any,
      orderBy: { store_name: "asc" },
      skip,
      take: limit,
    }),
    prisma.store.count({ where: where as any }),
  ]);

  const result = {
    stores: stores.map((s: any): StoreListItem => ({
      store_id: s.store_id,
      store_name: s.store_name,
      store_location: s.store_location,
      store_status: s.store_status,
      store_total_candidates: s.store_total_candidates ?? null,
      created_at: s.store_created_at?.toISOString() ?? null,
      updated_at: s.store_updated_at?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listStoresResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/stores] listStores output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getStore
// ---------------------------------------------------------------------------

/**
 * Get a single store by ID, excluding soft-deleted records.
 * Returns null if not found.
 */
export async function getStore(
  storeId: number,
): Promise<StoreListItem | null> {
  await requireCapability("store.read");

  const parsed = getStoreSchema.safeParse({ storeId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid store ID");
  }

  const store = await prisma.store.findFirst({
    where: {
      store_id: parsed.data.storeId,
      deleted: 0,
    },
  });

  if (!store) return null;

  const raw = store as any;
  return {
    store_id: raw.store_id,
    store_name: raw.store_name,
    store_location: raw.store_location,
    store_status: raw.store_status,
    store_total_candidates: raw.store_total_candidates ?? null,
    created_at: raw.store_created_at?.toISOString() ?? null,
    updated_at: raw.store_updated_at?.toISOString() ?? null,
  };
}
