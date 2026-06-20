"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  createDegreeSchema,
  updateDegreeSchema,
  deleteDegreeSchema,
  degreeItemSchema,
  listDegreesResultSchema,
  degreeActionResponseSchema,
} from "./schemas";
import type {
  ListDegreesResult,
  DegreeActionResponse,
  CreateDegreeInput,
  UpdateDegreeInput,
} from "./schemas";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const listDegreesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export type ListDegreesParams = z.input<typeof listDegreesSchema>;

// ---------------------------------------------------------------------------
// listDegrees
// ---------------------------------------------------------------------------

export async function listDegrees(
  params: ListDegreesParams = {},
): Promise<ListDegreesResult> {
  await requireCapability("admin.read");

  const parsed = listDegreesSchema.safeParse(params);
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

  const result: ListDegreesResult = {
    degrees,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listDegreesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/degree] listDegrees output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createDegree
// ---------------------------------------------------------------------------

export async function createDegree(
  name_en: string,
  name_ar?: string,
  degree_group_uuid?: string,
  sort_order?: number,
): Promise<DegreeActionResponse> {
  await requireCapability("admin.write");

  const parsed = createDegreeSchema.safeParse({
    degree_name_en: name_en,
    degree_name_ar: name_ar,
    degree_group_uuid: degree_group_uuid,
    degree_sort_order: sort_order,
  });

  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    await prisma.degree.create({
      data: {
        degree_uuid: crypto.randomUUID(),
        degree_name_en: parsed.data.degree_name_en,
        degree_name_ar: parsed.data.degree_name_ar ?? null,
        degree_group_uuid: parsed.data.degree_group_uuid ?? null,
        degree_sort_order: parsed.data.degree_sort_order ?? null,
      },
    });

    revalidatePath("/admin/degree");
    const result: DegreeActionResponse = {
      operation: "success",
      message: "Degree created successfully",
    };

    const outputParsed = degreeActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/degree] createDegree output failed:",
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

// ---------------------------------------------------------------------------
// updateDegree
// ---------------------------------------------------------------------------

export async function updateDegree(
  uuid: string,
  name_en: string,
  name_ar?: string | null,
  degree_group_uuid?: string | null,
  sort_order?: number | null,
): Promise<DegreeActionResponse> {
  await requireCapability("admin.write");

  const parsed = updateDegreeSchema.safeParse({
    degree_uuid: uuid,
    degree_name_en: name_en,
    degree_name_ar: name_ar,
    degree_group_uuid: degree_group_uuid,
    degree_sort_order: sort_order,
  });

  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid parameters",
    };
  }

  try {
    const existing = await prisma.degree.findUnique({
      where: { degree_uuid: parsed.data.degree_uuid },
      select: { degree_uuid: true },
    });

    if (!existing) {
      return { operation: "error", message: "Degree not found" };
    }

    await prisma.degree.update({
      where: { degree_uuid: parsed.data.degree_uuid },
      data: {
        degree_name_en: parsed.data.degree_name_en,
        degree_name_ar: parsed.data.degree_name_ar ?? null,
        degree_group_uuid: parsed.data.degree_group_uuid ?? null,
        degree_sort_order: parsed.data.degree_sort_order ?? null,
      },
    });

    revalidatePath("/admin/degree");
    const result: DegreeActionResponse = {
      operation: "success",
      message: "Degree updated successfully",
    };

    const outputParsed = degreeActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/degree] updateDegree output failed:",
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

// ---------------------------------------------------------------------------
// deleteDegree
// ---------------------------------------------------------------------------

export async function deleteDegree(
  uuid: string,
): Promise<DegreeActionResponse> {
  await requireCapability("admin.write");

  const parsed = deleteDegreeSchema.safeParse({ degree_uuid: uuid });

  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid UUID",
    };
  }

  try {
    const existing = await prisma.degree.findUnique({
      where: { degree_uuid: parsed.data.degree_uuid },
      select: { degree_uuid: true },
    });

    if (!existing) {
      return { operation: "error", message: "Degree not found" };
    }

    await prisma.degree.delete({
      where: { degree_uuid: parsed.data.degree_uuid },
    });

    revalidatePath("/admin/degree");
    const result: DegreeActionResponse = {
      operation: "success",
      message: "Degree deleted successfully",
    };

    const outputParsed = degreeActionResponseSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/admin/degree] deleteDegree output failed:",
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
