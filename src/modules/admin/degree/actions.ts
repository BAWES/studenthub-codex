"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listDegreesSchema,
  listDegreesResultSchema,
  createDegreeSchema,
  listDegreeResultSchema,
  degreeIdResultSchema,
  degreeListItemSchema,
} from "./schemas";
import type { ListDegreesInput, ListDegreesResult, DegreeIdResult } from "./schemas";

export async function updateDegree(
  degreeUuid: string,
  data: {
    degree_name_en: string;
    degree_name_ar: string | undefined;
    degree_sort_order: number;
    degree_group_uuid: string | null;
  },
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireCapability("admin.write");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized" };
  }

  if (!data.degree_name_en || data.degree_name_en.trim().length === 0) {
    return { error: "Degree name (English) is required" };
  }

  try {
    const updateData: Record<string, unknown> = {
      degree_name_en: data.degree_name_en,
      degree_sort_order: data.degree_sort_order,
      degree_name_ar: data.degree_name_ar || null,
      degree_group_uuid: data.degree_group_uuid || null,
    };

    await prisma.degree.update({
      where: { degree_uuid: degreeUuid },
      data: updateData as any,
    });

    revalidatePath("/admin/degree");
    revalidatePath(`/admin/degree/${degreeUuid}`);

    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to update degree",
    };
  }
}

export async function deleteDegree(
  degreeUuid: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireCapability("admin.write");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unauthorized" };
  }

  try {
    await prisma.degree.delete({
      where: { degree_uuid: degreeUuid },
    });

    revalidatePath("/admin/degree");

    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to delete degree",
    };
  }
}

export async function listDegrees(
  input: ListDegreesInput = {},
): Promise<ListDegreesResult> {
  await requireCapability("admin.read");
  const parsed = listDegreesSchema.safeParse(input);
  if (!parsed.success)
    return { degrees: [], total: 0, page: 1, limit: 50, totalPages: 0 };

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.degree.findMany({
      orderBy: { degree_name_en: "asc" },
      skip,
      take: limit,
      select: {
        degree_uuid: true,
        degree_group_uuid: true,
        degree_name_en: true,
        degree_name_ar: true,
        degree_sort_order: true,
        degree_created_at: true,
        degree_updated_at: true,
        degree_group: {
          select: { degree_group_name_en: true },
        },
      },
    }),
    prisma.degree.count(),
  ]);

  const degrees = rows.map((row) => ({
    ...row,
    degree_group_uuid: row.degree_group_uuid ?? null,
    degree_name_ar: row.degree_name_ar ?? null,
    degree_sort_order: row.degree_sort_order ?? null,
  }));

  const result = {
    degrees,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listDegreesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/degree] listDegrees output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getDegreeGroupOptions — for inline CRUD select
// ---------------------------------------------------------------------------

export async function getDegreeGroupOptions(): Promise<
  { degree_group_uuid: string; degree_group_name_en: string }[]
> {
  await requireCapability("admin.read");

  const groups = await prisma.degree_group.findMany({
    orderBy: { degree_group_sort_order: "asc" },
    select: {
      degree_group_uuid: true,
      degree_group_name_en: true,
    },
  });

  return groups;
}

// ---------------------------------------------------------------------------
// createDegree — for inline CRUD
// ---------------------------------------------------------------------------

export async function createDegree(
  data: {
    degree_name_en: string;
    degree_name_ar?: string;
    degree_sort_order?: number;
    degree_group_uuid?: string;
  },
): Promise<DegreeIdResult> {
  await requireCapability("admin.write");

  const parsed = createDegreeSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid degree data");
  }

  const { degree_name_en, degree_name_ar, degree_sort_order, degree_group_uuid } =
    parsed.data;

  const uuid = crypto.randomUUID();

  await prisma.degree.create({
    data: {
      degree_uuid: uuid,
      degree_name_en,
      degree_name_ar: degree_name_ar || null,
      degree_sort_order: degree_sort_order ?? null,
      degree_group_uuid: degree_group_uuid || null,
      degree_created_at: new Date(),
      degree_updated_at: new Date(),
    } as any,
  });

  revalidatePath("/admin/degree");

  const result: DegreeIdResult = { degree_uuid: uuid };

  const outputParsed = degreeIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/degree] createDegree output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
