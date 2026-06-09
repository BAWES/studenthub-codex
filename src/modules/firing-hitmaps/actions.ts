"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listFiringHitmapsSchema = z.object({
  companyId: z.coerce.number().int().positive().optional(),
  year: z.coerce.number().int().positive().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getFiringHitmapSchema = z.object({
  uuid: z.string().min(1, "Firing hitmap UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FiringHitmapItem = {
  fh_uuid: string;
  company_id: number;
  firing_month: number;
  firing_year: number;
  total: number | null;
  is_alerted: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ListFiringHitmapsResult = {
  hitmaps: FiringHitmapItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetFiringHitmapResult = {
  hitmap: FiringHitmapItem | null;
  error?: string;
};

// Keep schemas exported for tests
export { listFiringHitmapsSchema, getFiringHitmapSchema };

// ---------------------------------------------------------------------------
// listFiringHitmaps
// ---------------------------------------------------------------------------

/**
 * List firing hitmaps with pagination and optional company/year/month filtering.
 * Mirrors the legacy Yii2 FiringHitmapController::actionList().
 */
export async function listFiringHitmaps(
  params: z.input<typeof listFiringHitmapsSchema> = {},
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

  return {
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
}

// ---------------------------------------------------------------------------
// getFiringHitmap
// ---------------------------------------------------------------------------

/**
 * Get a single firing hitmap by UUID.
 * Mirrors the legacy Yii2 FiringHitmapController::actionView($id).
 */
export async function getFiringHitmap(
  params: z.input<typeof getFiringHitmapSchema>,
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

  return {
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
}
