"use server";

// ---------------------------------------------------------------------------
// Admin StoreController — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/StoreController.php
//
// Actions:
//   - listStores   — paginated list of all stores with filters (name, status)
//   - getStore     — single store detail with contact info, company, brand, mall
//
// Status: store_status is an Int (SmallInt) where 10 = active, 0 = inactive.
// Filter accepts 'active'/'inactive' strings and converts accordingly.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listStoresSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  q: z.string().optional(),
});

export const getStoreSchema = z.object({
  storeId: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListStoresInput = z.input<typeof listStoresSchema>;
export type GetStoreInput = z.input<typeof getStoreSchema>;

export type StoreRow = {
  store_id: number;
  store_name: string;
  store_location: string;
  store_status: number;
  store_total_candidates: number | null;
  company_name: string | null;
  brand_name: string | null;
  mall_name: string | null;
  manager_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type StoreDetail = {
  store: {
    store_id: number;
    store_name: string;
    store_location: string;
    store_status: number;
    store_total_candidates: number | null;
    store_created_at: string | null;
    store_updated_at: string | null;
    company: { company_name: string | null; company_email: string | null } | null;
    contact: { contact_name: string | null; contact_email: string | null } | null;
    brand: { brand_name_en: string | null } | null;
    mall: { mall_name_en: string | null } | null;
  } | null;
};

export type ListStoresResult = {
  items: StoreRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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
