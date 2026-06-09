"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Source: created by a candidate during profile edit. */
const FROM_CANDIDATE = 1;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listUniversitiesSchema = z.object({
  q: z.string().optional().default(""),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(500).optional().default(200),
});

const createUniversitySchema = z.object({
  name: z.string().min(1, "University name is required").max(100),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UniversityItem = {
  university_id: number;
  university_name_en: string | null;
  university_name_ar: string | null;
};

export type ListUniversitiesResult = {
  universities: UniversityItem[];
  total: number;
  page: number;
  limit: number;
};

export type CreateUniversityResult =
  | { operation: "success"; message: string; university: UniversityItem }
  | { operation: "error"; message: string };

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * List universities with optional name filter and pagination.
 *
 * Mirrors the Yii2 UniversityController::actionList behaviour:
 * - Filters by name when `q` is provided
 * - Defaults to page 1, limit 200
 * - Returns universities ordered alphabetically by English name
 */
export async function listUniversities(
  params: FormData | { q?: string; page?: number; limit?: number },
): Promise<ListUniversitiesResult> {
  await requireCapability("app.access");

  const raw =
    params instanceof FormData
      ? {
          q: (params.get("q") ?? "") as string,
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listUniversitiesSchema.safeParse(raw);
  if (!parsed.success) {
    return { universities: [], total: 0, page: 1, limit: 200 };
  }

  const { q, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where = {
    deleted: 0,
    ...(q
      ? {
          OR: [
            { university_name_en: { contains: q } },
            { university_name_ar: { contains: q } },
          ],
        }
      : {}),
  };

  const [universities, total] = await Promise.all([
    prisma.university.findMany({
      where,
      select: {
        university_id: true,
        university_name_en: true,
        university_name_ar: true,
      },
      skip,
      take: limit,
      orderBy: { university_name_en: "asc" },
    }),
    prisma.university.count({ where }),
  ]);

  return { universities, total, page, limit };
}

/**
 * Create a university if it doesn't already exist.
 *
 * Mirrors the Yii2 UniversityController::actionCreate behaviour:
 * - Sets both en/ar names to the provided name
 * - Marks data source as FROM_CANDIDATE
 * - Does NOT create a duplicate if a university with the same name exists
 */
export async function createUniversity(
  formData: FormData,
): Promise<CreateUniversityResult> {
  await requireCapability("candidate.profile.edit");

  const raw = {
    name: (formData.get("name") ?? "") as string,
  };

  const parsed = createUniversitySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { name } = parsed.data;

  // Check if a university with this name already exists
  // (matches the Yii2 isExists check that the frontend calls before create)
  const existing = await prisma.university.findFirst({
    where: {
      OR: [
        { university_name_en: name },
        { university_name_ar: name },
      ],
      deleted: 0,
    },
    select: { university_id: true },
  });

  if (existing) {
    return {
      operation: "error",
      message: "University already exists",
    };
  }

  const university = await prisma.university.create({
    data: {
      university_name_en: name,
      university_name_ar: name,
      university_data_source: FROM_CANDIDATE,
      university_created_at: new Date(),
      university_updated_at: new Date(),
    },
    select: {
      university_id: true,
      university_name_en: true,
      university_name_ar: true,
    },
  });

  revalidatePath("/candidate/edit");
  revalidatePath("/staff/universities");

  return {
    operation: "success",
    message: "University created successfully",
    university,
  };
}
