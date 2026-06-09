"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listDesignationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  nameFilter: z.string().optional(),
});

const getDesignationSchema = z.object({
  uuid: z.string().min(1, "Designation UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListDesignationsParams = z.input<typeof listDesignationsSchema>;

export type GetDesignationParams = z.input<typeof getDesignationSchema>;

export type DesignationItem = {
  designation_uuid: string;
  designation_name_en: string;
  designation_name_ar: string | null;
};

export type ListDesignationsResult = {
  designations: DesignationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation)
// ---------------------------------------------------------------------------

export { listDesignationsSchema, getDesignationSchema };

// ---------------------------------------------------------------------------
// listDesignations
// ---------------------------------------------------------------------------

/**
 * List designations with pagination and optional name filter.
 *
 * Mirrors the legacy Yii2 designation reference concept used across
 * staff profiles, job postings, and candidate evaluations.
 * - Filters by name (case-insensitive) when nameFilter is provided
 * - Paginated with configurable page/limit
 * - Sorted alphabetically by English name
 */
export async function listDesignations(
  params: ListDesignationsParams = {},
): Promise<ListDesignationsResult> {
  await requireCapability("admin.read");

  const parsed = listDesignationsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page, limit, nameFilter } = parsed.data;

  const where: Record<string, unknown> = {};
  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { designation_name_en: { contains: nameFilter, mode: "insensitive" } },
      { designation_name_ar: { contains: nameFilter, mode: "insensitive" } },
    ];
  }

  const [designations, total] = await Promise.all([
    prisma.designation.findMany({
      where: where as any,
      orderBy: { designation_name_en: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.designation.count({ where: where as any }),
  ]);

  return {
    designations: designations.map((d) => ({
      designation_uuid: d.designation_uuid,
      designation_name_en: d.designation_name_en,
      designation_name_ar: d.designation_name_ar,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getDesignation
// ---------------------------------------------------------------------------

/**
 * Get a single designation by UUID.
 * Returns null if not found.
 */
export async function getDesignation(
  params: GetDesignationParams,
): Promise<DesignationItem | null> {
  await requireCapability("admin.read");

  const parsed = getDesignationSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid designation UUID");
  }

  const { uuid } = parsed.data;

  const designation = await prisma.designation.findUnique({
    where: { designation_uuid: uuid },
  });

  if (!designation) return null;

  return {
    designation_uuid: designation.designation_uuid,
    designation_name_en: designation.designation_name_en,
    designation_name_ar: designation.designation_name_ar,
  };
}
