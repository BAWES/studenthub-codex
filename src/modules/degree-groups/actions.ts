"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  degreeGroupItemSchema,
  listDegreeGroupsResultSchema,
  mutationResultSchema,
  listDegreeGroupsSchema,
  getDegreeGroupSchema,
  createDegreeGroupSchema,
  updateDegreeGroupSchema,
  type DegreeGroupItem,
  type ListDegreeGroupsResult,
  type ListDegreeGroupsInput,
  type GetDegreeGroupInput,
  type CreateDegreeGroupInput,
  type UpdateDegreeGroupInput,
  type MutationResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/** Log output validation failures without throwing. */
function validateMutationResult(result: MutationResult): MutationResult {
  const parsed = mutationResultSchema.safeParse(result);
  if (!parsed.success) {
    console.error(
      "[modules/degree-groups] mutation output validation failed:",
      parsed.error.issues,
    );
  }
  return result;
}

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

  const result: ListDegreeGroupsResult = {
    degreeGroups,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listDegreeGroupsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/degree-groups] listDegreeGroups output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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

  const result: DegreeGroupItem = {
    degree_group_uuid: group.degree_group_uuid,
    degree_group_name_en: group.degree_group_name_en,
    degree_group_name_ar: group.degree_group_name_ar ?? null,
    degree_group_sort_order: group.degree_group_sort_order ?? null,
    skip_major: group.skip_major ?? null,
    degree_group_created_at: group.degree_group_created_at ?? null,
    degree_group_updated_at: group.degree_group_updated_at ?? null,
  };

  const outputParsed = degreeGroupItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/degree-groups] getDegreeGroup output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Create a new degree group.
 *
 * Mirrors the legacy Yii2 DegreeGroupController::actionCreate().
 * Degree groups are used in candidate onboarding for degree category selection.
 */
export async function createDegreeGroup(
  params: CreateDegreeGroupInput,
): Promise<MutationResult> {
  await requireCapability("admin.write");

  const parsed = createDegreeGroupSchema.safeParse(params);
  if (!parsed.success) {
    const result: MutationResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid degree group data",
    };
    return validateMutationResult(result);
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

    const result: MutationResult = {
      operation: "success",
      message: "Degree group created successfully",
    };
    return validateMutationResult(result);
  } catch (err) {
    const result: MutationResult = {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to create degree group",
    };
    return validateMutationResult(result);
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
): Promise<MutationResult> {
  await requireCapability("admin.write");

  const parsed = updateDegreeGroupSchema.safeParse(params);
  if (!parsed.success) {
    const result: MutationResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid degree group data",
    };
    return validateMutationResult(result);
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

    const result: MutationResult = {
      operation: "success",
      message: "Degree group updated successfully",
    };
    return validateMutationResult(result);
  } catch (err) {
    const result: MutationResult = {
      operation: "error",
      message:
        err instanceof Error ? err.message : "Failed to update degree group",
    };
    return validateMutationResult(result);
  }
}
