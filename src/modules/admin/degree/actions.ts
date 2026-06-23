"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listDegreesSchema,
  listDegreesResultSchema,
  updateDegreeSchema,
  deleteDegreeSchema,
  degreeActionResponseSchema,
} from "./schemas";
import type {
  ListDegreesInput,
  ListDegreesResult,
  UpdateDegreeInput,
  DegreeActionResponse,
} from "./schemas";

export async function updateDegree(
  degreeUuid: string,
  data: UpdateDegreeInput,
): Promise<{ success?: boolean; error?: string }> {
  await requireCapability("admin.write");
  const parsed = updateDegreeSchema.safeParse(data);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    const existing = await prisma.degree.findUnique({
      where: { degree_uuid: degreeUuid },
      select: { degree_uuid: true },
    });
    if (!existing) return { error: "Degree not found" };

    await prisma.degree.update({
      where: { degree_uuid: degreeUuid },
      data: {
        degree_name_en: parsed.data.degree_name_en,
        degree_name_ar: parsed.data.degree_name_ar ?? null,
        degree_sort_order: parsed.data.degree_sort_order ?? null,
        degree_group_uuid: parsed.data.degree_group_uuid ?? null,
        degree_updated_at: new Date(),
      },
    });

    revalidatePath("/admin/degree");
    return { success: true };
  } catch {
    return { error: "Failed to update degree" };
  }
}

export async function deleteDegree(
  degreeUuid: string,
): Promise<DegreeActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteDegreeSchema.safeParse({ degree_uuid: degreeUuid });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid UUID",
    };

  try {
    const existing = await prisma.degree.findUnique({
      where: { degree_uuid: parsed.data.degree_uuid },
      select: { degree_uuid: true },
    });
    if (!existing)
      return { operation: "error", message: "Degree not found" };

    await prisma.degree.delete({
      where: { degree_uuid: parsed.data.degree_uuid },
    });

    revalidatePath("/admin/degree");
    const result = {
      operation: "success" as const,
      message: "Degree deleted successfully",
    };

    const outputParsed = degreeActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/degree] deleteDegree output failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch {
    return {
      operation: "error",
      message:
        "We've faced a problem deleting the degree, please contact us for assistance.",
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
