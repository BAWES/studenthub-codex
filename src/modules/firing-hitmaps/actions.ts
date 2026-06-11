"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listFiringHitmapsSchema,
  getFiringHitmapSchema,
  listFiringHitmapsResultSchema,
  getFiringHitmapResultSchema,
  type ListFiringHitmapsParams,
  type GetFiringHitmapParams,
  type ListFiringHitmapsResult,
  type GetFiringHitmapResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listFiringHitmaps
// ---------------------------------------------------------------------------

/**
 * List firing hitmaps with pagination and optional company/year/month filtering.
 * Mirrors the legacy Yii2 FiringHitmapController::actionList().
 */
export async function listFiringHitmaps(
  params: ListFiringHitmapsParams = {},
): Promise<ListFiringHitmapsResult> {
  await requireCapability("admin.read");

  const parsed = listFiringHitmapsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { companyId, year, month, page, limit } = parsed.data;

  const where: Record<string, unknown> = {};
  if (companyId) where.company_id = companyId;
  if (year) where.firing_year = year;
  if (month) where.firing_month = month;

  const [rows, total] = await Promise.all([
    prisma.firing_hitmap.findMany({
      where: where as any,
      orderBy: [{ firing_year: "desc" }, { firing_month: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.firing_hitmap.count({ where: where as any }),
  ]);

  const result = {
    hitmaps: rows.map((r) => ({
      fh_uuid: r.fh_uuid,
      company_id: r.company_id,
      firing_month: r.firing_month,
      firing_year: r.firing_year,
      total: r.total,
      is_alerted: r.is_alerted,
      created_at: r.created_at ? r.created_at.toISOString() : null,
      updated_at: r.updated_at ? r.updated_at.toISOString() : null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listFiringHitmapsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/firing-hitmaps] listFiringHitmaps output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getFiringHitmap
// ---------------------------------------------------------------------------

/**
 * Get a single firing hitmap by UUID.
 * Mirrors the legacy Yii2 FiringHitmapController::actionView($id).
 */
export async function getFiringHitmap(
  params: GetFiringHitmapParams,
): Promise<GetFiringHitmapResult> {
  await requireCapability("admin.read");

  const parsed = getFiringHitmapSchema.safeParse(params);
  if (!parsed.success) {
    return { hitmap: null, error: parsed.error.issues[0]?.message ?? "Invalid parameters" };
  }

  const row = await prisma.firing_hitmap.findUnique({
    where: { fh_uuid: parsed.data.uuid },
  });

  if (!row) {
    return { hitmap: null, error: "Firing hitmap not found" };
  }

  const result = {
    hitmap: {
      fh_uuid: row.fh_uuid,
      company_id: row.company_id,
      firing_month: row.firing_month,
      firing_year: row.firing_year,
      total: row.total,
      is_alerted: row.is_alerted,
      created_at: row.created_at ? row.created_at.toISOString() : null,
      updated_at: row.updated_at ? row.updated_at.toISOString() : null,
    },
  };

  // Validate output shape
  const outputParsed = getFiringHitmapResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/firing-hitmaps] getFiringHitmap output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
