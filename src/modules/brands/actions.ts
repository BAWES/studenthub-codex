"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listBrandsSchema,
  getBrandSchema,
  listBrandsResultSchema,
  brandDetailSchema,
  type ListBrandsParams,
  type BrandListItem,
  type ListBrandsResult,
} from "./schemas";

/**
 * List brands with pagination.
 * Mirrors the legacy Admin BrandController::actionList().
 */
export async function listBrands(
  params: ListBrandsParams = {},
): Promise<ListBrandsResult> {
  await requireCapability("candidate.read.own");

  const parsed = listBrandsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20 } = parsed.data;

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      orderBy: { brand_name_en: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        brand_uuid: true,
        company_id: true,
        brand_name_en: true,
        brand_name_ar: true,
        brand_logo: true,
      },
    }),
    prisma.brand.count(),
  ]);

  const result = {
    brands: brands as BrandListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listBrandsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/brands] listBrands output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single brand by UUID.
 * Mirrors the legacy BrandController::actionView().
 */
export async function getBrand(
  uuid: string,
): Promise<BrandListItem | null> {
  await requireCapability("candidate.read.own");

  const parsed = getBrandSchema.safeParse({ uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid brand UUID");
  }

  const brand = await prisma.brand.findUnique({
    where: { brand_uuid: parsed.data.uuid },
    select: {
      brand_uuid: true,
      company_id: true,
      brand_name_en: true,
      brand_name_ar: true,
      brand_logo: true,
    },
  });

  if (!brand) return null;

  const result = brand as BrandListItem;

  // Validate output shape
  const outputParsed = brandDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/brands] getBrand output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
