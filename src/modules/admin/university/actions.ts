"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  universityListItemSchema,
  listUniversitiesResultSchema,
  universityIdResultSchema,
} from "./schemas";
import type {
  UniversityListItem,
  ListUniversitiesResult,
  UniversityIdResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/admin/university] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const listUniversitiesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
});

const getUniversitySchema = z.object({
  universityId: z.coerce.number().int().positive("University ID is required"),
});

const createUniversitySchema = z.object({
  university_name_en: z
    .string()
    .max(100, "English name must be at most 100 characters")
    .optional()
    .default(""),
  university_name_ar: z
    .string()
    .max(100, "Arabic name must be at most 100 characters")
    .optional()
    .default(""),
});

const updateUniversitySchema = z.object({
  universityId: z.coerce.number().int().positive(),
  university_name_en: z
    .string()
    .max(100, "English name must be at most 100 characters")
    .optional(),
  university_name_ar: z
    .string()
    .max(100, "Arabic name must be at most 100 characters")
    .optional(),
});

const deleteUniversitySchema = z.object({
  universityId: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// listUniversities
// ---------------------------------------------------------------------------

/**
 * List universities with pagination and optional search.
 * Filters out soft-deleted records (deleted = 0).
 */
export async function listUniversities(
  params: FormData | z.input<typeof listUniversitiesSchema> = {},
): Promise<ListUniversitiesResult> {
  await requireCapability("admin.read");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
          search: params.get("search"),
        }
      : params;

  const parsed = listUniversitiesSchema.safeParse(raw);
  if (!parsed.success) {
    return { records: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deleted: 0 };
  if (search) {
    where.OR = [
      { university_name_en: { contains: search } },
      { university_name_ar: { contains: search } },
    ];
  }

  const [records, total] = await Promise.all([
    prisma.university.findMany({
      where: where as any,
      orderBy: { university_name_en: "asc" },
      skip,
      take: limit,
    }),
    prisma.university.count({ where: where as any }),
  ]);

  const result: ListUniversitiesResult = {
    records: records.map((r: any): UniversityListItem => ({
      university_id: r.university_id,
      university_name_en: r.university_name_en ?? null,
      university_name_ar: r.university_name_ar ?? null,
      university_data_source: r.university_data_source ?? null,
      university_created_at: r.university_created_at?.toISOString() ?? null,
      university_updated_at: r.university_updated_at?.toISOString() ?? null,
      deleted: r.deleted ?? 0,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listUniversitiesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listUniversities", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getUniversity
// ---------------------------------------------------------------------------

/**
 * Get a single university by ID.
 * Returns null if not found or soft-deleted.
 */
export async function getUniversity(
  universityId: number,
): Promise<UniversityListItem | null> {
  await requireCapability("admin.read");

  const parsed = getUniversitySchema.safeParse({ universityId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid university ID");
  }

  const record = await prisma.university.findFirst({
    where: { university_id: parsed.data.universityId, deleted: 0 },
  });

  if (!record) return null;

  const raw = record as any;
  const result: UniversityListItem = {
    university_id: raw.university_id,
    university_name_en: raw.university_name_en ?? null,
    university_name_ar: raw.university_name_ar ?? null,
    university_data_source: raw.university_data_source ?? null,
    university_created_at: raw.university_created_at?.toISOString() ?? null,
    university_updated_at: raw.university_updated_at?.toISOString() ?? null,
    deleted: raw.deleted ?? 0,
  };

  // Validate output shape
  const outputParsed = universityListItemSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getUniversity", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// createUniversity
// ---------------------------------------------------------------------------

/**
 * Create a new university.
 */
export async function createUniversity(
  data: z.input<typeof createUniversitySchema>,
): Promise<UniversityIdResult> {
  await requireCapability("admin.write");

  const parsed = createUniversitySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid university data");
  }

  const { university_name_en, university_name_ar } = parsed.data;

  const record = await prisma.university.create({
    data: {
      university_name_en: university_name_en || null,
      university_name_ar: university_name_ar || null,
      university_created_at: new Date(),
      university_updated_at: new Date(),
    } as any,
  });

  revalidatePath("/admin/university");
  const result: UniversityIdResult = { university_id: record.university_id };

  const outputParsed = universityIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("createUniversity", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateUniversity
// ---------------------------------------------------------------------------

/**
 * Update an existing university.
 * Throws an error if the record does not exist.
 */
export async function updateUniversity(
  data: z.input<typeof updateUniversitySchema>,
): Promise<UniversityIdResult> {
  await requireCapability("admin.write");

  const parsed = updateUniversitySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid university data");
  }

  const { universityId, university_name_en, university_name_ar } = parsed.data;

  // Verify the record exists
  const existing = await prisma.university.findFirst({
    where: { university_id: universityId, deleted: 0 },
  });
  if (!existing) {
    throw new Error(`University record not found: ${universityId}`);
  }

  const updateData: Record<string, unknown> = { university_updated_at: new Date() };
  if (university_name_en !== undefined) updateData.university_name_en = university_name_en || null;
  if (university_name_ar !== undefined) updateData.university_name_ar = university_name_ar || null;

  await prisma.university.update({
    where: { university_id: universityId },
    data: updateData as any,
  });

  revalidatePath("/admin/university");
  const result: UniversityIdResult = { university_id: universityId };

  const outputParsed = universityIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateUniversity", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteUniversity (soft-delete)
// ---------------------------------------------------------------------------

/**
 * Soft-delete a university by setting deleted = 1.
 * Throws an error if the record does not exist.
 */
export async function deleteUniversity(
  universityId: number,
): Promise<UniversityIdResult> {
  await requireCapability("admin.write");

  const parsed = deleteUniversitySchema.safeParse({ universityId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid university ID");
  }

  // Verify the record exists
  const existing = await prisma.university.findFirst({
    where: { university_id: parsed.data.universityId, deleted: 0 },
  });
  if (!existing) {
    throw new Error(`University record not found: ${parsed.data.universityId}`);
  }

  await prisma.university.update({
    where: { university_id: parsed.data.universityId },
    data: { deleted: 1, university_updated_at: new Date() } as any,
  });

  revalidatePath("/admin/university");
  const result: UniversityIdResult = { university_id: parsed.data.universityId };

  const outputParsed = universityIdResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteUniversity", outputParsed.error.issues);
  }

  return result;
}
