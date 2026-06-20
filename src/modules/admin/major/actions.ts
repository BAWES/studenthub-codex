"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listMajorsSchema,
  createMajorSchema,
  updateMajorSchema,
  deleteMajorSchema,
  listMajorsResultSchema,
  majorActionResponseSchema,
} from "./schemas";
import type {
  ListMajorsInput,
  ListMajorsResult,
  MajorActionResponse,
} from "./schemas";

export async function listMajors(
  input: ListMajorsInput = {},
): Promise<ListMajorsResult> {
  await requireCapability("admin.read");
  const parsed = listMajorsSchema.safeParse(input);
  if (!parsed.success)
    return { majors: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    prisma.major.findMany({
      orderBy: { major_name_en: "asc" },
      skip,
      take: limit,
      select: {
        major_uuid: true,
        major_name_en: true,
        major_name_ar: true,
        data_source: true,
        major_created_at: true,
        major_updated_at: true,
      },
    }),
    prisma.major.count(),
  ]);
  const majors = rows.map((row) => ({
    major_uuid: row.major_uuid,
    major_name_en: row.major_name_en,
    major_name_ar: row.major_name_ar,
    data_source: row.data_source,
    major_created_at: row.major_created_at,
    major_updated_at: row.major_updated_at,
  }));
  const result = {
    majors,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listMajorsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/major] listMajors output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

export async function createMajor(
  major_name_en: string,
  major_name_ar: string,
  data_source?: number | null,
): Promise<MajorActionResponse> {
  await requireCapability("admin.write");
  const parsed = createMajorSchema.safeParse({
    major_name_en,
    major_name_ar,
    data_source,
  });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid parameters",
    };
  try {
    await prisma.major.create({
      data: {
        major_uuid: randomUUID(),
        major_name_en: parsed.data.major_name_en,
        major_name_ar: parsed.data.major_name_ar,
        data_source: parsed.data.data_source ?? null,
      },
    });
    revalidatePath("/admin/major");
    const result = { operation: "success", message: "Major created successfully" };
    const outputParsed = majorActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/major] createMajor output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    const result = {
      operation: "error",
      message:
        "We've faced a problem creating the major, please contact us for assistance.",
    };
    const outputParsed = majorActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/major] createMajor output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
}

export async function updateMajor(
  major_uuid: string,
  major_name_en: string,
  major_name_ar: string,
  data_source?: number | null,
): Promise<MajorActionResponse> {
  await requireCapability("admin.write");
  const parsed = updateMajorSchema.safeParse({
    major_uuid,
    major_name_en,
    major_name_ar,
    data_source,
  });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid parameters",
    };
  try {
    const existing = await prisma.major.findUnique({
      where: { major_uuid: parsed.data.major_uuid },
      select: { major_uuid: true },
    });
    if (!existing) return { operation: "error", message: "Major not found" };
    await prisma.major.update({
      where: { major_uuid: parsed.data.major_uuid },
      data: {
        major_name_en: parsed.data.major_name_en,
        major_name_ar: parsed.data.major_name_ar,
        data_source: parsed.data.data_source ?? null,
      },
    });
    revalidatePath("/admin/major");
    const result = {
      operation: "success",
      message: "Major successfully updated",
    };
    const outputParsed = majorActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/major] updateMajor output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    const result = {
      operation: "error",
      message:
        "We've faced a problem updating the major, please contact us for assistance.",
    };
    const outputParsed = majorActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/major] updateMajor output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
}

export async function deleteMajor(
  major_uuid: string,
): Promise<MajorActionResponse> {
  await requireCapability("admin.write");
  const parsed = deleteMajorSchema.safeParse({ major_uuid });
  if (!parsed.success)
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid major UUID",
    };
  try {
    const existing = await prisma.major.findUnique({
      where: { major_uuid: parsed.data.major_uuid },
      select: { major_uuid: true },
    });
    if (!existing) return { operation: "error", message: "Major not found" };
    await prisma.major.delete({
      where: { major_uuid: parsed.data.major_uuid },
    });
    revalidatePath("/admin/major");
    const result = {
      operation: "success",
      message: "Major deleted successfully",
    };
    const outputParsed = majorActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/major] deleteMajor output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  } catch (_e) {
    const result = {
      operation: "error",
      message:
        "We've faced a problem deleting the major, please contact us for assistance.",
    };
    const outputParsed = majorActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/major] deleteMajor output failed:",
        outputParsed.error.issues,
      );
    }
    return result;
  }
}
