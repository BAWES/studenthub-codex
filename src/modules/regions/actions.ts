"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listRegionsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  countryId: z.number().int().positive().optional(),
  search: z.string().optional(),
});

const getRegionSchema = z.object({
  areaUuid: z.string().min(1, "Area UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListRegionsParams = z.input<typeof listRegionsSchema>;

export type RegionListItem = {
  area_uuid: string;
  country_id: number;
  area_name_en: string;
  area_name_ar: string;
  area_latitude: number | null;
  area_longitude: number | null;
};

export type ListRegionsResult = {
  regions: RegionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type RegionDetail = RegionListItem & {
  area_created_at: Date | null;
  area_updated_at: Date | null;
};

export type GetRegionResult = {
  region: RegionDetail;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List regions (areas) with pagination and optional country/search filters.
 * Maps to the legacy area concept in the system.
 */
export async function listRegions(
  params: ListRegionsParams = {},
): Promise<ListRegionsResult> {
  await requireCapability("candidate.read.own");

  const parsed = listRegionsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page = 1, limit = 20, countryId, search } = parsed.data;

  // Build where clause
  const where: Record<string, unknown> = {};
  if (countryId !== undefined) where.country_id = countryId;
  if (search) {
    where.OR = [
      { area_name_en: { contains: search } },
      { area_name_ar: { contains: search } },
    ];
  }

  const [regions, total] = await Promise.all([
    prisma.area.findMany({
      where: where as any,
      orderBy: { area_name_en: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        area_uuid: true,
        country_id: true,
        area_name_en: true,
        area_name_ar: true,
        area_latitude: true,
        area_longitude: true,
      },
    }),
    prisma.area.count({ where: where as any }),
  ]);

  return {
    regions: regions as RegionListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single region (area) by UUID.
 */
export async function getRegion(
  params: z.input<typeof getRegionSchema>,
): Promise<GetRegionResult> {
  await requireCapability("candidate.read.own");

  const parsed = getRegionSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid area UUID");
  }

  const { areaUuid } = parsed.data;

  const area = await prisma.area.findUnique({
    where: { area_uuid: areaUuid },
    select: {
      area_uuid: true,
      country_id: true,
      area_name_en: true,
      area_name_ar: true,
      area_latitude: true,
      area_longitude: true,
      area_created_at: true,
      area_updated_at: true,
    },
  });

  if (!area) {
    throw new Error("Region not found");
  }

  return { region: area as RegionDetail };
}
