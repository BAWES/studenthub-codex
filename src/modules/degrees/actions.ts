"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DegreeItem = {
  degree_uuid: string;
  degree_group_uuid: string | null;
  degree_name_en: string;
  degree_name_ar: string | null;
  degree_sort_order: number | null;
  degree_created_at: Date | null;
  degree_updated_at: Date | null;
};

export type ListDegreesResult = {
  degrees: DegreeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const listDegreesSchema = z.object({
  nameFilter: z.string().optional(),
  degreeGroupUuid: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListDegreesInput = z.input<typeof listDegreesSchema>;

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List degrees with optional name filter, degree group filter, and pagination.
 * Mirrors the legacy Yii2 DegreeController::actionList().
 * Degrees are simple lookup data used in candidate onboarding dropdowns.
 */
export async function listDegrees(
  params: ListDegreesInput = {},
): Promise<ListDegreesResult> {
  await requireCapability("admin.read");

  const parsed = listDegreesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { nameFilter, degreeGroupUuid, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { degree_name_en: { contains: nameFilter, mode: "insensitive" } },
      { degree_name_ar: { contains: nameFilter, mode: "insensitive" } },
    ];
  }
  if (degreeGroupUuid && degreeGroupUuid.trim()) {
    where.degree_group_uuid = degreeGroupUuid;
  }

  const [degrees, total] = await Promise.all([
    prisma.degree.findMany({
      where: where as any,
      orderBy: [{ degree_sort_order: "asc" }, { degree_name_en: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.degree.count({ where: where as any }),
  ]);

  return {
    degrees,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
