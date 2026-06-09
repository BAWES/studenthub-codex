"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listStoresSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
});

const getStoreSchema = z.object({
  storeId: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StoreListItem = {
  store_id: number;
  store_name: string;
  store_location: string;
  store_status: number;
  store_total_candidates: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ListStoresResult = {
  stores: StoreListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// listStores
// ---------------------------------------------------------------------------

/**
 * List stores with pagination, excluding soft-deleted records.
 * Mirrors the legacy Yii2 StoreController::actionList().
 */
export async function listStores(
  params: FormData | z.input<typeof listStoresSchema> = {},
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

  return {
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
