"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  degreeItemSchema,
  listDegreesResultSchema,
} from "./schemas";
import type { ListDegreesResult } from "./schemas";
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
