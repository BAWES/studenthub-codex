"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listDegreesSchema,
  createDegreeSchema,
  updateDegreeSchema,
  deleteDegreeSchema,
  listDegreesResultSchema,
  degreeActionResponseSchema,
} from "./schemas";
import type {
  ListDegreesInput,
  ListDegreesResult,
  DegreeActionResponse,
  DegreeItem,
} from "./schemas";

export async function listDegrees(
  input: ListDegreesInput = {},
): Promise<ListDegreesResult> {
  await requireCapability("admin.read");
  const parsed = listDegreesSchema.safeParse(input);
  if (!parsed.success)
    return {
      degrees: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.degree.findMany({
      orderBy: { degree_sort_order: "asc" },
      skip,
      take: limit,
    }),
    prisma.degree.count(),
  ]);
  const degrees = rows.map((r) => ({
    degree_uuid: r.degree_uuid,
    degree_group_uuid: r.degree_group_uuid,
    degree_name_en: r.degree_name_en,
    degree_name_ar: r.degree_name_ar,
    degree_sort_order: r.degree_sort_order,
    degree_created_at: r.degree_created_at,
    degree_updated_at: r.degree_updated_at,
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

export async function getDegree(input: {
  degree_uuid: string;
}): Promise<{ degree: DegreeItem | null }> {
  await requireCapability("admin.read");
  const row = await prisma.degree.findUnique({
    where: { degree_uuid: input.degree_uuid },
  });
  if (!row) return { degree: null };
  return {
    degree: {
      degree_uuid: row.degree_uuid,
      degree_group_uuid: row.degree_group_uuid,
      degree_name_en: row.degree_name_en,
      degree_name_ar: row.degree_name_ar,
      degree_sort_order: row.degree_sort_order,
      degree_created_at: row.degree_created_at,
      degree_updated_at: row.degree_updated_at,
    },
  };
}

export async function createDegree(
  name_en: string,
  name_ar?: string,
  sort_order?: number,
  degree_group_uuid?: string,
): Promise<DegreeActionResponse> {
  await requireCapability("admin.write");
  const parsed = createDegreeSchema.safeParse({
    degree_name_en: name_en,
    degree_name_ar: name_ar,
    degree_sort_order: sort_order,
    degree_group_uuid: degree_group_uuid,
  });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  try {
    await prisma.degree.create({
      data: {
        degree_uuid: crypto.randomUUID(),
        degree_name_en: parsed.data.degree_name_en,
        degree_name_ar: parsed.data.degree_name_ar ?? null,
        degree_sort_order: parsed.data.degree_sort_order ?? null,
        degree_group_uuid: parsed.data.degree_group_uuid ?? null,
      },
    });
    revalidatePath("/admin/degree");
    const result = {
      operation: "success" as const,
      message: "Degree created successfully",
    };
    const outputParsed = degreeActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/degree] createDegree output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    return {
      operation: "error",
      message:
        "We've faced a problem creating the degree, please contact us for assistance.",
    };
  }
}

export async function updateDegree(
  uuid: string,
  name_en: string,
  name_ar?: string | null,
  sort_order?: number | null,
  degree_group_uuid?: string | null,
): Promise<DegreeActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateDegreeSchema.safeParse({
    degree_uuid: uuid,
    degree_name_en: name_en,
    degree_name_ar: name_ar,
    degree_sort_order: sort_order,
    degree_group_uuid: degree_group_uuid,
  });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid parameters",
    };
  try {
    const existing = await prisma.degree.findUnique({
      where: { degree_uuid: parsed.data.degree_uuid },
      select: { degree_uuid: true },
    });
    if (!existing)
      return { operation: "error", message: "Degree not found" };
    await prisma.degree.update({
      where: { degree_uuid: parsed.data.degree_uuid },
      data: {
        degree_name_en: parsed.data.degree_name_en,
        degree_name_ar: parsed.data.degree_name_ar ?? null,
        degree_sort_order: parsed.data.degree_sort_order ?? null,
        degree_group_uuid: parsed.data.degree_group_uuid ?? null,
      },
    });
    revalidatePath("/admin/degree");
    const result = {
      operation: "success" as const,
      message: "Degree successfully updated",
    };
    const outputParsed = degreeActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/degree] updateDegree output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    return {
      operation: "error",
      message:
        "We've faced a problem updating the degree, please contact us for assistance.",
    };
  }
}

export async function deleteDegree(
  uuid: string,
): Promise<DegreeActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteDegreeSchema.safeParse({
    degree_uuid: uuid,
  });
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
  } catch (_e) {
    return {
      operation: "error",
      message:
        "We've faced a problem deleting the degree, please contact us for assistance.",
    };
  }
}
