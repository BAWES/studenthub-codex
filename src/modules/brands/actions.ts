"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

const listBrandsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListBrandsParams = z.input<typeof listBrandsSchema>;

export type BrandListItem = {
  brand_uuid: string;
  company_id: number | null;
  brand_name_en: string;
  brand_name_ar: string;
  brand_logo: string | null;
};

export type ListBrandsResult = {
  brands: BrandListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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

  return {
    brands: brands as BrandListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
