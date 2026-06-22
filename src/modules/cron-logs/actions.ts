"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCronLogsSchema,
  getCronLogSchema,
  listCronLogsResultSchema,
  cronLogItemSchema,
  type ListCronLogsInput,
  type GetCronLogInput,
  type ListCronLogsResult,
  type CronLogItem,
} from "./schemas";

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

  const result = {
    cronLogs: cronLogs as CronLogItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listCronLogsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/cron-logs] listCronLogs output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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

  const result = cronLog as CronLogItem | null;

  // Validate output shape
  const outputParsed = cronLogItemSchema.nullable().safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/cron-logs] getCronLog output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
