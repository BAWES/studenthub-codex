"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  adminJobItemSchema,
  listAdminJobsResultSchema,
  listAdminJobsSchema,
} from "./schemas";
import type { AdminJobItem, ListAdminJobsResult } from "./schemas";

async function logOutputError(source: string, error: unknown): Promise<void> {
  console.error(`[modules/admin/jobs] ${source} output failed:`, error);
}

/**
 * List job records with pagination and optional search.
 */
export async function listAdminJobs(
  params: FormData | Record<string, unknown> = {},
): Promise<ListAdminJobsResult> {
  await requireCapability("admin.read");

  const raw =
    params instanceof FormData
      ? Object.fromEntries(params.entries())
      : params;

  const parsed = listAdminJobsSchema.safeParse(raw);
  if (!parsed.success) {
    return { jobs: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search, status } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { position: { contains: search } },
      { position_ar: { contains: search } },
    ];
  }
  if (status !== undefined) {
    where.status = status;
  }

  const [records, total] = await Promise.all([
    prisma.job.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.job.count({ where: where as any }),
  ]);

  const result: ListAdminJobsResult = {
    jobs: records.map((r: any): AdminJobItem => {
      const item: AdminJobItem = {
        job_uuid: r.job_uuid,
        position: r.position,
        position_ar: r.position_ar ?? null,
        description: r.description ?? null,
        status: r.status ?? null,
        hours_per_day: r.hours_per_day ?? null,
        compensation_type: r.compensation_type ?? null,
        compensation_amount: r.compensation_amount ?? null,
        area_uuid: r.area_uuid ?? null,
        request_uuid: r.request_uuid,
        created_at: r.created_at ?? null,
        updated_at: r.updated_at ?? null,
      };
      return item;
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listAdminJobsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listAdminJobs", outputParsed.error.issues);
  }

  return result;
}
