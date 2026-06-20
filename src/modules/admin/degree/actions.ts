"use server";

import crypto from "node:crypto";
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
  DegreeItem,
  DegreeActionResponse,
} from "./schemas";

export async function listDegrees(input: ListDegreesInput = {}): Promise<ListDegreesResult> {
  await requireCapability("admin.read");
  const parsed = listDegreesSchema.safeParse(input);
  if (!parsed.success) return { degrees: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.degree.findMany({
      orderBy: { degree_name_en: "asc" },
      skip,
      take: limit,
      select: {
        degree_uuid: true,
        degree_name_en: true,
        degree_name_ar: true,
        degree_group_uuid: true,
        degree_sort_order: true,
        degree_created_at: true,
        degree_updated_at: true,
      },
    }),
    prisma.degree.count(),
  ]);
  const degrees = rows.map((row) => ({
    degree_uuid: row.degree_uuid,
    degree_name_en: row.degree_name_en,
    degree_name_ar: row.degree_name_ar,
    degree_group_uuid: row.degree_group_uuid,
    degree_sort_order: row.degree_sort_order,
    degree_created_at: row.degree_created_at,
    degree_updated_at: row.degree_updated_at,
  }));
  const result = { degrees, total, page, limit, totalPages: Math.ceil(total / limit) };

  const outputParsed = listDegreesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/degree] listDegrees output failed:", outputParsed.error.issues);
  }

  return result;
}

export async function getDegree(degreeUuid: string): Promise<{ degree: DegreeItem | null }> {
  await requireCapability("admin.read");
  const row = await prisma.degree.findUnique({
    where: { degree_uuid: degreeUuid },
    select: {
      degree_uuid: true,
      degree_name_en: true,
      degree_name_ar: true,
      degree_group_uuid: true,
      degree_sort_order: true,
      degree_created_at: true,
      degree_updated_at: true,
    },
  });
  if (!row) return { degree: null };
  return { degree: row };
}

export async function createDegree(
  nameEn: string,
  nameAr?: string,
  degreeGroupUuid?: string,
  degreeSortOrder?: number,
): Promise<DegreeActionResponse> {
  await requireCapability("admin.write");
  const parsed = createDegreeSchema.safeParse({
    degreeNameEn: nameEn,
    degreeNameAr: nameAr,
    degreeGroupUuid,
    degreeSortOrder,
  });
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid degree data" };
  }
  try {
    await prisma.degree.create({
      data: {
        degree_uuid: crypto.randomUUID(),
        degree_name_en: parsed.data.degreeNameEn,
        degree_name_ar: parsed.data.degreeNameAr ?? null,
        degree_group_uuid: parsed.data.degreeGroupUuid ?? null,
        degree_sort_order: parsed.data.degreeSortOrder ?? null,
      },
    });
    revalidatePath("/admin/degree");
    const result = { operation: "success", message: "Degree created successfully" };
    const outputParsed = degreeActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/degree] createDegree output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem creating the degree, please contact us for assistance." };
    const outputParsed = degreeActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/degree] createDegree output failed:", outputParsed.error.issues);
    }
    return result;
  }
}

export async function updateDegree(
  degreeUuid: string,
  nameEn: string,
  nameAr?: string,
  degreeGroupUuid?: string,
  degreeSortOrder?: number,
): Promise<DegreeActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateDegreeSchema.safeParse({
    degreeUuid,
    degreeNameEn: nameEn,
    degreeNameAr: nameAr,
    degreeGroupUuid,
    degreeSortOrder,
  });
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid parameters" };
  }
  try {
    const existing = await prisma.degree.findUnique({ where: { degree_uuid: parsed.data.degreeUuid }, select: { degree_uuid: true } });
    if (!existing) return { operation: "error", message: "Degree not found" };
    await prisma.degree.update({
      where: { degree_uuid: parsed.data.degreeUuid },
      data: {
        degree_name_en: parsed.data.degreeNameEn,
        degree_name_ar: parsed.data.degreeNameAr ?? null,
        degree_group_uuid: parsed.data.degreeGroupUuid ?? null,
        degree_sort_order: parsed.data.degreeSortOrder ?? null,
      },
    });
    revalidatePath("/admin/degree");
    const result = { operation: "success", message: "Degree updated successfully" };
    const outputParsed = degreeActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/degree] updateDegree output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem updating the degree, please contact us for assistance." };
    const outputParsed = degreeActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/degree] updateDegree output failed:", outputParsed.error.issues);
    }
    return result;
  }
}

export async function deleteDegree(degreeUuid: string): Promise<DegreeActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteDegreeSchema.safeParse({ degreeUuid });
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid degree UUID" };
  try {
    const existing = await prisma.degree.findUnique({ where: { degree_uuid: parsed.data.degreeUuid }, select: { degree_uuid: true } });
    if (!existing) return { operation: "error", message: "Degree not found" };
    await prisma.degree.delete({ where: { degree_uuid: parsed.data.degreeUuid } });
    revalidatePath("/admin/degree");
    const result = { operation: "success", message: "Degree deleted successfully" };
    const outputParsed = degreeActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/degree] deleteDegree output failed:", outputParsed.error.issues);
    }
    return result;
  } catch (_e) {
    const result = { operation: "error", message: "We've faced a problem deleting the degree, please contact us for assistance." };
    const outputParsed = degreeActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/degree] deleteDegree output failed:", outputParsed.error.issues);
    }
    return result;
  }
}
