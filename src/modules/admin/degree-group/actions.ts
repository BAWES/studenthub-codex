"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listDegreeGroupsSchema,
  createDegreeGroupSchema,
  updateDegreeGroupSchema,
  deleteDegreeGroupSchema,
  listDegreeGroupsResultSchema,
  degreeGroupActionResponseSchema,
} from "./schemas";
import type {
  ListDegreeGroupsInput,
  ListDegreeGroupsResult,
  DegreeGroupActionResponse,
  DegreeGroupItem,
} from "./schemas";

export async function listDegreeGroups(
  input: ListDegreeGroupsInput = {},
): Promise<ListDegreeGroupsResult> {
  await requireCapability("admin.read");
  const parsed = listDegreeGroupsSchema.safeParse(input);
  if (!parsed.success)
    return {
      degree_groups: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    };
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.degree_group.findMany({
      orderBy: { degree_group_sort_order: "asc" },
      skip,
      take: limit,
    }),
    prisma.degree_group.count(),
  ]);
  const degree_groups = rows.map((r) => ({
    degree_group_uuid: r.degree_group_uuid,
    degree_group_name_en: r.degree_group_name_en,
    degree_group_name_ar: r.degree_group_name_ar,
    degree_group_sort_order: r.degree_group_sort_order,
    skip_major: r.skip_major,
    degree_group_created_at: r.degree_group_created_at,
    degree_group_updated_at: r.degree_group_updated_at,
  }));
  const result = {
    degree_groups,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listDegreeGroupsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/degree-group] listDegreeGroups output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

export async function getDegreeGroup(input: {
  degree_group_uuid: string;
}): Promise<{ degree_group: DegreeGroupItem | null }> {
  await requireCapability("admin.read");
  const row = await prisma.degree_group.findUnique({
    where: { degree_group_uuid: input.degree_group_uuid },
  });
  if (!row) return { degree_group: null };
  return {
    degree_group: {
      degree_group_uuid: row.degree_group_uuid,
      degree_group_name_en: row.degree_group_name_en,
      degree_group_name_ar: row.degree_group_name_ar,
      degree_group_sort_order: row.degree_group_sort_order,
      skip_major: row.skip_major,
      degree_group_created_at: row.degree_group_created_at,
      degree_group_updated_at: row.degree_group_updated_at,
    },
  };
}

export async function createDegreeGroup(
  name_en: string,
  name_ar?: string,
  sort_order?: number,
  skip_major?: number,
): Promise<DegreeGroupActionResponse> {
  await requireCapability("admin.write");
  const parsed = createDegreeGroupSchema.safeParse({
    degree_group_name_en: name_en,
    degree_group_name_ar: name_ar,
    degree_group_sort_order: sort_order,
    skip_major: skip_major,
  });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  try {
    await prisma.degree_group.create({
      data: {
        degree_group_uuid: crypto.randomUUID(),
        degree_group_name_en: parsed.data.degree_group_name_en,
        degree_group_name_ar: parsed.data.degree_group_name_ar ?? null,
        degree_group_sort_order: parsed.data.degree_group_sort_order ?? null,
        skip_major: parsed.data.skip_major ?? null,
      },
    });
    revalidatePath("/admin/degree-group");
    const result = {
      operation: "success" as const,
      message: "Degree group created successfully",
    };
    const outputParsed = degreeGroupActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/degree-group] createDegreeGroup output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    return {
      operation: "error",
      message:
        "We've faced a problem creating the degree group, please contact us for assistance.",
    };
  }
}

export async function updateDegreeGroup(
  uuid: string,
  name_en: string,
  name_ar?: string | null,
  sort_order?: number | null,
  skip_major?: number | null,
): Promise<DegreeGroupActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateDegreeGroupSchema.safeParse({
    degree_group_uuid: uuid,
    degree_group_name_en: name_en,
    degree_group_name_ar: name_ar,
    degree_group_sort_order: sort_order,
    skip_major: skip_major,
  });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid parameters",
    };
  try {
    const existing = await prisma.degree_group.findUnique({
      where: { degree_group_uuid: parsed.data.degree_group_uuid },
      select: { degree_group_uuid: true },
    });
    if (!existing)
      return { operation: "error", message: "Degree group not found" };
    await prisma.degree_group.update({
      where: { degree_group_uuid: parsed.data.degree_group_uuid },
      data: {
        degree_group_name_en: parsed.data.degree_group_name_en,
        degree_group_name_ar: parsed.data.degree_group_name_ar ?? null,
        degree_group_sort_order: parsed.data.degree_group_sort_order ?? null,
        skip_major: parsed.data.skip_major ?? null,
      },
    });
    revalidatePath("/admin/degree-group");
    const result = {
      operation: "success" as const,
      message: "Degree group successfully updated",
    };
    const outputParsed = degreeGroupActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/degree-group] updateDegreeGroup output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    return {
      operation: "error",
      message:
        "We've faced a problem updating the degree group, please contact us for assistance.",
    };
  }
}

export async function deleteDegreeGroup(
  uuid: string,
): Promise<DegreeGroupActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteDegreeGroupSchema.safeParse({
    degree_group_uuid: uuid,
  });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid UUID",
    };
  try {
    const existing = await prisma.degree_group.findUnique({
      where: { degree_group_uuid: parsed.data.degree_group_uuid },
      select: { degree_group_uuid: true },
    });
    if (!existing)
      return { operation: "error", message: "Degree group not found" };
    await prisma.degree_group.delete({
      where: { degree_group_uuid: parsed.data.degree_group_uuid },
    });
    revalidatePath("/admin/degree-group");
    const result = {
      operation: "success" as const,
      message: "Degree group deleted successfully",
    };
    const outputParsed = degreeGroupActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/degree-group] deleteDegreeGroup output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    return {
      operation: "error",
      message:
        "We've faced a problem deleting the degree group, please contact us for assistance.",
    };
  }
}
