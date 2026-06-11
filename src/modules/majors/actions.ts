"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listMajorsSchema,
  majorItemSchema,
  listMajorsResultSchema,
  type ListMajorsInput,
  type MajorItem,
  type ListMajorsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List majors with optional name filter and pagination.
 * Mirrors the legacy Yii2 MajorController::actionList().
 */
export async function listMajors(
  params: ListMajorsInput = {},
): Promise<ListMajorsResult> {
  await requireCapability("admin.read");

  const parsed = listMajorsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { nameFilter, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { major_name_en: { contains: nameFilter, mode: "insensitive" } },
      { major_name_ar: { contains: nameFilter, mode: "insensitive" } },
    ];
  }

  const [majors, total] = await Promise.all([
    prisma.major.findMany({
      where: where as any,
      orderBy: { major_name_en: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.major.count({ where: where as any }),
  ]);

  const result = {
    majors: majors as MajorItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listMajorsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/majors] listMajors output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
