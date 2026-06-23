"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  degreeListItemSchema,
  listDegreeResultSchema,
  degreeIdResultSchema,
} from "./schemas";
import type {
  DegreeListItem,
  ListDegreeResult,
  DegreeIdResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function logOutputError(source: string, error: unknown): Promise<void> {
  console.error(`[modules/admin/degree] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const listDegreeSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  search: z.string().optional(),
});

const getDegreeSchema = z.object({
  degreeUuid: z.string().min(1, "Degree UUID is required"),
});

const createDegreeSchema = z.object({
  degree_name_en: z
    .string()
    .min(1, "English name is required")
    .max(255, "English name must be at most 255 characters"),
  degree_name_ar: z
    .string()
    .max(255, "Arabic name must be at most 255 characters")
    .optional()
    .default(""),
  degree_sort_order: z.coerce.number().int().optional(),
  degree_group_uuid: z.string().optional(),
});

const updateDegreeSchema = z.object({
  degreeUuid: z.string().min(1),
  degree_name_en: z
    .string()
    .min(1, "English name is required")
    .max(255)
    .optional(),
  degree_name_ar: z
    .string()
    .max(255)
    .optional(),
  degree_sort_order: z.coerce.number().int().optional(),
  degree_group_uuid: z.string().optional(),
});

const deleteDegreeSchema = z.object({
  degreeUuid: z.string().min(1),
});

// ---------------------------------------------------------------------------
// listDegree
// ---------------------------------------------------------------------------

export async function listDegree(
  params: FormData | z.input<typeof listDegreeSchema> = {},
): Promise<ListDegreeResult> {
  await requireCapability("admin.system");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          search: params.get("search"),
        }
      : params;

  const parsed = listDegreeSchema.safeParse(raw);
  if (!parsed.success) {
    return { records: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { degree_name_en: { contains: search } },
      { degree_name_ar: { contains: search } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.degree.findMany({
      where: where as any,
      orderBy: [{ degree_sort_order: "asc" }, { degree_name_en: "asc" }],
      skip,
      take: limit,
      include: {
        degree_group: { select: { degree_group_name_en: true } },
      },
    }),
    prisma.degree.count({ where: where as any }),
  ]);

  const result: ListDegreeResult = {
    records: records.map((r: any): DegreeListItem => ({
      degree_uuid: r.degree_uuid,
      degree_name_en: r.degree_name_en,
      degree_name_ar: r.degree_name_ar ?? null,
      degree_sort_order: r.degree_sort_order ?? null,
      degree_group_uuid: r.degree_group_uuid ?? null,
      group_name_en: r.degree_group?.degree_group_name_en ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listDegreeResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listDegree", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getDegree
// ---------------------------------------------------------------------------

export async function getDegree(
  degreeUuid: string,
): Promise<DegreeListItem | null> {
  await requireCapability("admin.system");

  const parsed = getDegreeSchema.safeParse({ degreeUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid degree UUID");
  }

  const record = await prisma.degree.findFirst({
    where: { degree_uuid: parsed.data.degreeUuid },
    include: {
      degree_group: { select: { degree_group_name_en: true } },
    },
  });

  if (!record) return null;

  const raw = record as any;
  const result: DegreeListItem = {
    degree_uuid: raw.degree_uuid,
    degree_name_en: raw.degree_name_en,
    degree_name_ar: raw.degree_name_ar ?? null,
    degree_sort_order: raw.degree_sort_order ?? null,
    degree_group_uuid: raw.degree_group_uuid ?? null,
    group_name_en: raw.degree_group?.degree_group_name_en ?? null,
  };

  const outputParsed = degreeListItemSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getDegree", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getDegreeGroupOptions
// ---------------------------------------------------------------------------

export async function getDegreeGroupOptions(): Promise<{ degree_group_uuid: string; degree_group_name_en: string }[]> {
  await requireCapability("admin.system");

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
// createDegree
// ---------------------------------------------------------------------------

export async function createDegree(
  data: z.input<typeof createDegreeSchema>,
): Promise<DegreeIdResult> {
  await requireCapability("admin.system");

  const parsed = createDegreeSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid degree data");
  }

  const { degree_name_en, degree_name_ar, degree_sort_order, degree_group_uuid } = parsed.data;

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
    logOutputError("createDegree", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateDegree
// ---------------------------------------------------------------------------

export async function updateDegree(
  data: z.input<typeof updateDegreeSchema>,
): Promise<DegreeIdResult> {
  await requireCapability("admin.system");

  const parsed = updateDegreeSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid degree data");
  }

  const { degreeUuid, degree_name_en, degree_name_ar, degree_sort_order, degree_group_uuid } = parsed.data;

  const existing = await prisma.degree.findFirst({
    where: { degree_uuid: degreeUuid },
  });
  if (!existing) {
    throw new Error(`Degree record not found: ${degreeUuid}`);
  }

  const updateData: Record<string, unknown> = {
    degree_updated_at: new Date(),
  };
  if (degree_name_en !== undefined) updateData.degree_name_en = degree_name_en;
  if (degree_name_ar !== undefined) updateData.degree_name_ar = degree_name_ar || null;
  if (degree_sort_order !== undefined) updateData.degree_sort_order = degree_sort_order;
  if (degree_group_uuid !== undefined) updateData.degree_group_uuid = degree_group_uuid || null;

  await prisma.degree.update({
    where: { degree_uuid: degreeUuid },
    data: updateData as any,
  });

  revalidatePath("/admin/degree");
  const result: DegreeIdResult = { degree_uuid: degreeUuid };

  const outputParsed = degreeIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateDegree", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteDegree
// ---------------------------------------------------------------------------

export async function deleteDegree(
  degreeUuid: string,
): Promise<DegreeIdResult> {
  await requireCapability("admin.system");

  const parsed = deleteDegreeSchema.safeParse({ degreeUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid degree UUID");
  }

  const existing = await prisma.degree.findFirst({
    where: { degree_uuid: parsed.data.degreeUuid },
  });
  if (!existing) {
    throw new Error(`Degree record not found: ${parsed.data.degreeUuid}`);
  }

  await prisma.degree.delete({
    where: { degree_uuid: parsed.data.degreeUuid },
  });

  revalidatePath("/admin/degree");
  const result: DegreeIdResult = { degree_uuid: parsed.data.degreeUuid };

  const outputParsed = degreeIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteDegree", outputParsed.error.issues);
  }

  return result;
}
