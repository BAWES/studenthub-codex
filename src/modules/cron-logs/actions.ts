"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listCronLogsSchema = z.object({
  task: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getCronLogSchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CronLogItem = {
  id: number;
  task: string;
  last_ran_at: Date | null;
  last_output: string | null;
};

export type ListCronLogsInput = z.input<typeof listCronLogsSchema>;
export type GetCronLogInput = z.input<typeof getCronLogSchema>;

export type ListCronLogsResult = {
  cronLogs: CronLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation in tests)
// ---------------------------------------------------------------------------

export { listCronLogsSchema, getCronLogSchema };

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List cron log entries with optional task filter and pagination.
 * Ordered by last_ran_at descending, matching the legacy Yii2
 * CronLogController (admin & staff modules).
 */
export async function listCronLogs(
  params: ListCronLogsInput = {},
): Promise<ListCronLogsResult> {
  await requireCapability("admin.read");

  const parsed = listCronLogsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { task, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};
  if (task && task.trim()) {
    where.task = task;
  }

  const [cronLogs, total] = await Promise.all([
    prisma.cron_log.findMany({
      where: where as any,
      orderBy: { last_ran_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.cron_log.count({ where: where as any }),
  ]);

  return {
    cronLogs: cronLogs as CronLogItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single cron log entry by ID.
 * Returns null if not found.
 */
export async function getCronLog(
  id: number,
): Promise<CronLogItem | null> {
  await requireCapability("admin.read");

  const parsed = getCronLogSchema.safeParse({ id });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid cron log ID");
  }

  const cronLog = await prisma.cron_log.findUnique({
    where: { id: parsed.data.id },
  });

  return cronLog as CronLogItem | null;
}
