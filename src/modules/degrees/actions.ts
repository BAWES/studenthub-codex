"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  degreeItemSchema,
  listDegreesResultSchema,
  listDegreesSchema,
  type DegreeItem,
  type ListDegreesResult,
  type ListDegreesInput,
} from "./schemas";

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

  const { nameFilter, degreeGroupUuid, page, limit } = parsed.data;

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

  const result: ListDegreesResult = {
    degrees: degrees.map((d) => ({
      degree_uuid: d.degree_uuid,
      degree_group_uuid: d.degree_group_uuid,
      degree_name_en: d.degree_name_en,
      degree_name_ar: d.degree_name_ar,
      degree_sort_order: d.degree_sort_order,
      degree_created_at: d.degree_created_at,
      degree_updated_at: d.degree_updated_at,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listDegreesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/degrees] listDegrees output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
