"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import crypto from "crypto";
import {
  listDesignationsSchema,
  createDesignationSchema,
  updateDesignationSchema,
  listDesignationsResultSchema,
  actionResponseSchema,
  type ListDesignationsInput,
  type ListDesignationsResult,
  type CreateDesignationInput,
  type UpdateDesignationInput,
  type ActionResponse,
} from "./schemas";

function generateUuid(): string {
  return crypto.randomUUID();
}

export async function listDesignations(
  input: ListDesignationsInput = {},
): Promise<ListDesignationsResult> {
  await requireCapability("admin.read");
  const parsed = listDesignationsSchema.safeParse(input);
  if (!parsed.success) {
    return { designations: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }

  const { page, limit, nameFilter } = parsed.data;
  const skip = (page - 1) * limit;

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
      skip,
      take: limit,
    }),
    prisma.designation.count({ where: where as any }),
  ]);

  const result = {
    designations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listDesignationsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/designations] listDesignations output failed:", outputParsed.error.issues);
  }

  return result;
}

export async function createDesignation(
  data: CreateDesignationInput,
): Promise<ActionResponse> {
  await requireCapability("admin.write");
  const parsed = createDesignationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    await prisma.designation.create({
      data: {
        designation_uuid: generateUuid(),
        designation_name_en: parsed.data.nameEn,
        designation_name_ar: parsed.data.nameAr ?? null,
        designation_created_at: new Date(),
        designation_updated_at: new Date(),
      },
    });
    revalidatePath("/admin/designations");
    const result: ActionResponse = { operation: "success", message: "Designation created" };
    actionResponseSchema.parse(result);
    return result;
  } catch {
    return { operation: "error", message: "Failed to create designation" };
  }
}

export async function updateDesignation(
  data: UpdateDesignationInput,
): Promise<ActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateDesignationSchema.safeParse(data);
  if (!parsed.success) {
    return { operation: "error", message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const updateData: Record<string, unknown> = { designation_updated_at: new Date() };
    if (parsed.data.nameEn !== undefined) updateData.designation_name_en = parsed.data.nameEn;
    if (parsed.data.nameAr !== undefined) updateData.designation_name_ar = parsed.data.nameAr;

    await prisma.designation.update({
      where: { designation_uuid: parsed.data.uuid },
      data: updateData as any,
    });
    revalidatePath("/admin/designations");
    const result: ActionResponse = { operation: "success", message: "Designation updated" };
    actionResponseSchema.parse(result);
    return result;
  } catch {
    return { operation: "error", message: "Failed to update designation" };
  }
}

export async function deleteDesignation(
  uuid: string,
): Promise<ActionResponse> {
  await requireCapability("admin.write");

  try {
    await prisma.designation.delete({ where: { designation_uuid: uuid } });
    revalidatePath("/admin/designations");
    const result: ActionResponse = { operation: "success", message: "Designation deleted" };
    actionResponseSchema.parse(result);
    return result;
  } catch {
    return { operation: "error", message: "Failed to delete designation" };
  }
}
