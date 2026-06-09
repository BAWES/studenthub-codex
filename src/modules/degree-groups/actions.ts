"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DegreeGroupItem = {
  degree_group_uuid: string;
  degree_group_name_en: string;
  degree_group_name_ar: string | null;
  degree_group_sort_order: number | null;
  skip_major: number | null;
  degree_group_created_at: Date | null;
  degree_group_updated_at: Date | null;
};

export type ListDegreeGroupsResult = {
  degreeGroups: DegreeGroupItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const listDegreeGroupsSchema = z.object({
  nameFilter: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getDegreeGroupSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
});

export type ListDegreeGroupsInput = z.input<typeof listDegreeGroupsSchema>;
export type GetDegreeGroupInput = z.input<typeof getDegreeGroupSchema>;

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List degree groups with optional name search and pagination.
 * Mirrors the legacy Yii2 DegreeGroupController::actionList().
 * Degree groups are used in candidate onboarding for degree category selection.
 */
export async function listDegreeGroups(
  params: ListDegreeGroupsInput = {},
): Promise<ListDegreeGroupsResult> {
  await requireCapability("admin.read");

  const parsed = listDegreeGroupsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { nameFilter, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { degree_group_name_en: { contains: nameFilter, mode: "insensitive" } },
      { degree_group_name_ar: { contains: nameFilter, mode: "insensitive" } },
    ];
  }

  const [degreeGroups, total] = await Promise.all([
    prisma.degree_group.findMany({
      where: where as any,
      orderBy: [
        { degree_group_sort_order: "asc" },
        { degree_group_name_en: "asc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.degree_group.count({ where: where as any }),
  ]);

  return {
    degreeGroups,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single degree group by UUID.
 * Mirrors the legacy Yii2 DegreeGroupController::actionView($id).
 */
export async function getDegreeGroup(
  params: GetDegreeGroupInput,
): Promise<DegreeGroupItem> {
  await requireCapability("admin.read");

  const parsed = getDegreeGroupSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { uuid } = parsed.data;

  const group = await prisma.degree_group.findUnique({
    where: { degree_group_uuid: uuid },
  });

  if (!group) {
    throw new Error("Degree group not found");
  }

  return group;
}
