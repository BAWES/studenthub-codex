"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MajorItem = {
  major_uuid: string;
  major_name_en: string;
  major_name_ar: string;
  data_source: number | null;
  major_created_at: Date | null;
  major_updated_at: Date | null;
};

export type ListMajorsResult = {
  majors: MajorItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const listMajorsSchema = z.object({
  nameFilter: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListMajorsInput = z.input<typeof listMajorsSchema>;

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List majors with optional name filter and pagination.
 * Mirrors the legacy Yii2 MajorController::actionList().
 */
export async function listMajors(
  params: ListMajorsInput = {},
): Promise<ListMajorsResult> {
  await requireCapability("admin.read");

  const parsed = listMajorsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { nameFilter, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (nameFilter && nameFilter.trim()) {
    where.OR = [
      { major_name_en: { contains: nameFilter, mode: "insensitive" } },
      { major_name_ar: { contains: nameFilter, mode: "insensitive" } },
    ];
  }

  const [majors, total] = await Promise.all([
    prisma.major.findMany({
      where: where as any,
      orderBy: { major_name_en: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.major.count({ where: where as any }),
  ]);

  return {
    majors,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
