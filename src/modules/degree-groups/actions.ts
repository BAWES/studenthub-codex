"use server";

import crypto from "node:crypto";
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

const createDegreeGroupSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().optional(),
  sortOrder: z.number().int().optional(),
  skipMajor: z.number().int().optional(),
});

const updateDegreeGroupSchema = z.object({
  uuid: z.string().min(1, "UUID is required"),
  nameEn: z.string().min(1, "English name is required").optional(),
  nameAr: z.string().optional(),
  sortOrder: z.number().int().optional(),
  skipMajor: z.number().int().optional(),
});

export type ListDegreeGroupsInput = z.input<typeof listDegreeGroupsSchema>;
export type GetDegreeGroupInput = z.input<typeof getDegreeGroupSchema>;
export type CreateDegreeGroupInput = z.input<typeof createDegreeGroupSchema>;
export type UpdateDegreeGroupInput = z.input<typeof updateDegreeGroupSchema>;

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

/**
 * Create a new degree group.
 *
 * Mirrors the legacy Yii2 DegreeGroupController::actionCreate().
 * Degree groups are used in candidate onboarding for degree category selection.
 */
export async function createDegreeGroup(
  params: CreateDegreeGroupInput,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");

  const parsed = createDegreeGroupSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid degree group data",
    };
  }

  const { nameEn, nameAr, sortOrder, skipMajor } = parsed.data;

  try {
    await prisma.degree_group.create({
      data: {
        degree_group_uuid: crypto.randomUUID(),
        degree_group_name_en: nameEn,
        degree_group_name_ar: nameAr ?? null,
        degree_group_sort_order: sortOrder ?? null,
        skip_major: skipMajor ?? null,
      },
    });

    return {
      operation: "success",
      message: "Degree group created successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to create degree group",
    };
  }
}

/**
 * Update an existing degree group.
 *
 * Mirrors the legacy Yii2 DegreeGroupController::actionUpdate().
 * Only updates fields that are provided (partial update).
 */
export async function updateDegreeGroup(
  params: UpdateDegreeGroupInput,
): Promise<{ operation: string; message: string }> {
  await requireCapability("admin.write");

  const parsed = updateDegreeGroupSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid degree group data",
    };
  }

  const { uuid, nameEn, nameAr, sortOrder, skipMajor } = parsed.data;

  // Build the update payload — only set fields that were provided
  const data: Record<string, unknown> = {};
  if (nameEn !== undefined) data.degree_group_name_en = nameEn;
  if (nameAr !== undefined) data.degree_group_name_ar = nameAr;
  if (sortOrder !== undefined) data.degree_group_sort_order = sortOrder;
  if (skipMajor !== undefined) data.skip_major = skipMajor;

  try {
    await prisma.degree_group.update({
      where: { degree_group_uuid: uuid },
      data,
    });

    return {
      operation: "success",
      message: "Degree group updated successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to update degree group",
    };
  }
}
