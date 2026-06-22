"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listStoresSchema,
  getStoreSchema,
  listStoresRowsSchema,
  listMallsAndBrandsSchema,
  listCompanySelectOptionsSchema,
  listStoresResultOutputSchema,
  storeDetailOutputSchema,
  storeRowOutputSchema,
  mallsAndBrandsResultOutputSchema,
  companySelectOptionOutputSchema,
} from "./schemas";
import type {
  ListStoresInput,
  StoreListItem,
  StoreDetail,
  ListStoresResult,
  StoreRow,
  MallsAndBrandsResult,
  CompanySelectOption,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/company/stores] ${source} output validation failed:`, error);
}

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

  const result = {
    stores,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listStoresResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listStores", outputParsed.error.issues);
  }

  return result;
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

  const result = {
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

  // Validate output shape
  const outputParsed = storeDetailOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getStoreDetail", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// DataTable rows — colocated replacements for @/modules/company/data
// ---------------------------------------------------------------------------

/**
 * List stores as flat DataTable rows for the company/stores page.
 * Mirrors getCompanyStoresRows from @/modules/company/data.
 */
export async function listStoresRows(
  contactUuid: string,
): Promise<StoreRow[]> {
  await requireCapability("company.read.linked");

  const parsed = listStoresRowsSchema.safeParse({ contactUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact UUID");
  }

  // Get companies linked to this contact
  const linked = await prisma.company_contact.findMany({
    where: { contact_uuid: parsed.data.contactUuid, allow_access: true },
    select: { company_id: true },
  });

  const companyIds = linked
    .filter((l) => l.company_id !== null)
    .map((l) => l.company_id as number);

  if (companyIds.length === 0) return [];

  const stores = await prisma.store.findMany({
    where: { company_id: { in: companyIds }, deleted: 0 },
    select: {
      store_id: true,
      store_name: true,
      store_location: true,
      brand: { select: { brand_name_en: true } },
      mall: { select: { mall_name_en: true } },
      company: { select: { company_name: true } },
      contact: { select: { contact_name: true } },
    },
    orderBy: { store_updated_at: "desc" },
  });

  const result = stores.map((s) => ({
    id: s.store_id,
    name: s.store_name,
    location: s.store_location,
    mallName: s.mall?.mall_name_en ?? "—",
    brandName: s.brand?.brand_name_en ?? "—",
    companyName: s.company?.company_name ?? "—",
    managerName: s.contact?.contact_name ?? "—",
  }));

  // Validate output shape
  const outputParsed = z.array(storeRowOutputSchema).safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listStoresRows", outputParsed.error.issues);
  }

  return result;
}

/**
 * Fetch malls and brands for the AddStoreForm dropdowns.
 * Mirrors getCompanyMallsAndBrands from @/modules/company/data.
 */
export async function listMallsAndBrands(
  contactUuid: string,
): Promise<MallsAndBrandsResult> {
  await requireCapability("company.read.linked");

  const parsed = listMallsAndBrandsSchema.safeParse({ contactUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact UUID");
  }

  // Get companies linked to this contact
  const linked = await prisma.company_contact.findMany({
    where: { contact_uuid: parsed.data.contactUuid, allow_access: true },
    select: { company_id: true },
  });

  const companyIds = linked
    .filter((l) => l.company_id !== null)
    .map((l) => l.company_id as number);

  const [malls, brands] = await Promise.all([
    prisma.mall.findMany({
      select: { mall_uuid: true, mall_name_en: true },
      orderBy: { mall_name_en: "asc" },
    }),
    prisma.brand.findMany({
      where: companyIds.length > 0 ? { company_id: { in: companyIds } } : undefined,
      select: { brand_uuid: true, brand_name_en: true },
      orderBy: { brand_name_en: "asc" },
    }),
  ]);

  const result = {
    malls: malls.map((m) => ({ uuid: m.mall_uuid, name: m.mall_name_en })),
    brands: brands.map((b) => ({ uuid: b.brand_uuid, name: b.brand_name_en })),
  };

  // Validate output shape
  const outputParsed = mallsAndBrandsResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listMallsAndBrands", outputParsed.error.issues);
  }

  return result;
}

/**
 * List company select options for the AddStoreForm dropdown.
 * Mirrors getCompanySelectOptions from @/modules/company/data.
 */
export async function listCompanySelectOptions(
  contactUuid: string,
): Promise<CompanySelectOption[]> {
  await requireCapability("company.read.linked");

  const parsed = listCompanySelectOptionsSchema.safeParse({ contactUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact UUID");
  }

  const links = await prisma.company_contact.findMany({
    where: { contact_uuid: parsed.data.contactUuid, allow_access: true },
    select: { company_id: true, company: { select: { company_name: true } } },
  });

  const result = links
    .filter((l) => l.company_id !== null && l.company !== null)
    .map((l) => ({ id: l.company_id as number, name: l.company!.company_name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Validate output shape
  const outputParsed = z.array(companySelectOptionOutputSchema).safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCompanySelectOptions", outputParsed.error.issues);
  }

  return result;
}
