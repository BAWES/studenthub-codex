"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AreaItem = {
  area_uuid: string;
  country_id: number;
  area_name_en: string;
  area_name_ar: string | null;
  area_latitude: number | null;
  area_longitude: number | null;
};

export type ListAreasResult = {
  areas: AreaItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const listAreasSchema = z.object({
  nameFilter: z.string().optional(),
  countryId: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListAreasInput = z.input<typeof listAreasSchema>;

const getAreaSchema = z.object({
  areaUuid: z.string().min(1),
});

export type GetAreaInput = z.input<typeof getAreaSchema>;

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List areas/regions with optional name filter, country filter, and pagination.
 * Mirrors the legacy Yii2 area listing pattern.
 * Areas are location data used in candidate address fields and job listings.
 */
export async function listAreas(
  params: ListAreasInput = {},
): Promise<ListAreasResult> {
  await requireCapability("candidate.read.own");

  const parsed = listAreasSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { nameFilter, countryId, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { area_name_en: { contains: nameFilter, mode: "insensitive" } },
      { area_name_ar: { contains: nameFilter, mode: "insensitive" } },
    ];
  }
  if (countryId !== undefined) {
    where.country_id = countryId;
  }

  const [rawAreas, total] = await Promise.all([
    prisma.area.findMany({
      where: where as any,
      orderBy: [{ area_name_en: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.area.count({ where: where as any }),
  ]);

  const areas: AreaItem[] = rawAreas.map((a) => ({
    area_uuid: a.area_uuid,
    country_id: a.country_id,
    area_name_en: a.area_name_en,
    area_name_ar: a.area_name_ar,
    area_latitude: a.area_latitude ? Number(a.area_latitude) : null,
    area_longitude: a.area_longitude ? Number(a.area_longitude) : null,
  }));

  return {
    areas,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single area/region by UUID. Returns null if not found.
 * Mirrors the legacy Yii2 area view pattern.
 */
export async function getArea(params: GetAreaInput): Promise<AreaItem | null> {
  await requireCapability("candidate.read.own");

  const parsed = getAreaSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid area UUID");
  }

  const { areaUuid } = parsed.data;

  const area = await prisma.area.findUnique({
    where: { area_uuid: areaUuid },
  });

  return (area as Record<string, unknown>)
    ? ({
        area_uuid: (area as Record<string, unknown>).area_uuid,
        country_id: (area as Record<string, unknown>).country_id,
        area_name_en: (area as Record<string, unknown>).area_name_en,
        area_name_ar: (area as Record<string, unknown>).area_name_ar,
        area_latitude: (area as Record<string, unknown>).area_latitude
          ? Number((area as Record<string, unknown>).area_latitude)
          : null,
        area_longitude: (area as Record<string, unknown>).area_longitude
          ? Number((area as Record<string, unknown>).area_longitude)
          : null,
      } as AreaItem)
    : null;
}
