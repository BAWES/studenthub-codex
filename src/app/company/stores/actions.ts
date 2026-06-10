"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listStoresSchema,
  getStoreSchema,
} from "./schemas";
import type {
  ListStoresInput,
  StoreListItem,
  StoreDetail,
  ListStoresResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapStoreStatus(status: number): "active" | "inactive" {
  return status === 10 ? "active" : "inactive";
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List stores with optional company filter, store_status filter, and pagination.
 */
export async function listStores(
  params: ListStoresInput = {},
): Promise<ListStoresResult> {
  await requireCapability("company.read.linked");

  const parsed = listStoresSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { company_id, store_status, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (company_id !== undefined) {
    where.company_id = company_id;
  }
  if (store_status !== undefined) {
    where.store_status = store_status;
  }

  const [raw, total] = await Promise.all([
    prisma.store.findMany({
      where: where as any,
      orderBy: { store_updated_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        store_id: true,
        store_name: true,
        store_location: true,
        store_status: true,
        mall: {
          select: {
            mall_name_en: true,
          },
        },
        brand: {
          select: {
            brand_name_en: true,
          },
        },
        contact: {
          select: {
            contact_name: true,
          },
        },
      },
    }),
    prisma.store.count({ where: where as any }),
  ]);

  const stores: StoreListItem[] = raw.map((s) => ({
    store_id: s.store_id,
    store_name: s.store_name,
    store_location: s.store_location,
    store_status: mapStoreStatus(s.store_status),
    mall_name: s.mall?.mall_name_en ?? null,
    brand_name: s.brand?.brand_name_en ?? null,
    manager_name: s.contact?.contact_name ?? null,
  }));

  return {
    stores,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single store's details by store_id.
 */
export async function getStoreDetail(
  storeId: number,
): Promise<StoreDetail | null> {
  await requireCapability("company.read.linked");

  const parsed = getStoreSchema.safeParse({ store_id: storeId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid store ID");
  }

  const raw = await prisma.store.findUnique({
    where: { store_id: parsed.data.store_id },
    select: {
      store_id: true,
      store_name: true,
      store_location: true,
      store_status: true,
      company_id: true,
      store_created_at: true,
      store_updated_at: true,
      company: {
        select: {
          company_name: true,
        },
      },
      mall: {
        select: {
          mall_name_en: true,
        },
      },
      brand: {
        select: {
          brand_name_en: true,
        },
      },
      contact: {
        select: {
          contact_name: true,
          contact_email: true,
        },
      },
    },
  });

  if (!raw) return null;

  return {
    store_id: raw.store_id,
    store_name: raw.store_name,
    store_location: raw.store_location,
    store_status: mapStoreStatus(raw.store_status),
    company_id: raw.company_id,
    company_name: raw.company?.company_name ?? null,
    mall_name: raw.mall?.mall_name_en ?? null,
    brand_name: raw.brand?.brand_name_en ?? null,
    manager_name: raw.contact?.contact_name ?? null,
    manager_email: raw.contact?.contact_email ?? null,
    created_at: raw.store_created_at.toISOString(),
    updated_at: raw.store_updated_at.toISOString(),
  };
}
