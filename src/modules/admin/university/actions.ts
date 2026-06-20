"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listUniversitiesSchema,
  createUniversitySchema,
  updateUniversitySchema,
  deleteUniversitySchema,
  listUniversitiesResultSchema,
  universityActionResponseSchema,
} from "./schemas";
import type { ListUniversitiesInput, ListUniversitiesResult, UniversityActionResponse, CreateUniversityInput, UpdateUniversityInput } from "./schemas";

export async function listUniversities(input: ListUniversitiesInput = {}): Promise<ListUniversitiesResult> {
  await requireCapability("admin.read");
  const parsed = listUniversitiesSchema.safeParse(input);
  if (!parsed.success) return { items: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.university.findMany({
      where: { deleted: 0 },
      orderBy: { university_name_en: "asc" },
      skip,
      take: limit,
    }),
    prisma.university.count({ where: { deleted: 0 } }),
  ]);
  const items = rows.map((row) => ({
    university_id: row.university_id,
    university_name_en: row.university_name_en,
    university_name_ar: row.university_name_ar,
    university_data_source: row.university_data_source,
  }));
  const result = { items, total, page, limit, totalPages: Math.ceil(total / limit) };

  const outputParsed = listUniversitiesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/university] listUniversities output failed:", outputParsed.error.issues);
  }

  return result;
}

export async function createUniversity(input: CreateUniversityInput): Promise<UniversityActionResponse> {
  await requireCapability("admin.write");
  const parsed = createUniversitySchema.safeParse(input);
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  try {
    await prisma.university.create({ data: { ...parsed.data, deleted: 0 } });
    revalidatePath("/admin/university");
    return { operation: "success", message: "University created successfully" };
  } catch (_e) {
    return { operation: "error", message: "We've faced a problem creating the university, please contact us for assistance." };
  }
}

export async function updateUniversity(input: UpdateUniversityInput): Promise<UniversityActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateUniversitySchema.safeParse(input);
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid parameters" };
  try {
    const existing = await prisma.university.findUnique({ where: { university_id: parsed.data.university_id }, select: { university_id: true } });
    if (!existing) return { operation: "error", message: "University not found" };
    await prisma.university.update({
      where: { university_id: parsed.data.university_id },
      data: parsed.data,
    });
    revalidatePath("/admin/university");
    return { operation: "success", message: "University successfully updated" };
  } catch (_e) {
    return { operation: "error", message: "We've faced a problem updating the university, please contact us for assistance." };
  }
}

export async function deleteUniversity(universityId: number): Promise<UniversityActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteUniversitySchema.safeParse({ universityId });
  if (!parsed.success) return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid parameters" };
  try {
    const existing = await prisma.university.findUnique({ where: { university_id: parsed.data.university_id }, select: { university_id: true } });
    if (!existing) return { operation: "error", message: "University not found" };
    await prisma.university.update({
      where: { university_id: parsed.data.university_id },
      data: { deleted: 1 },
    });
    revalidatePath("/admin/university");
    return { operation: "success", message: "University successfully deleted" };
  } catch (_e) {
    return { operation: "error", message: "We've faced a problem deleting the university, please contact us for assistance." };
  }
}
