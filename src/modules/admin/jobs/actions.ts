"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listAdminJobsSchema,
  listAdminJobsResultSchema,
} from "./schemas";
import type { ListAdminJobsInput, ListAdminJobsResult } from "./schemas";

// ---------------------------------------------------------------------------
// listAdminJobs
// ---------------------------------------------------------------------------

export async function listAdminJobs(
  input: ListAdminJobsInput = {},
): Promise<ListAdminJobsResult> {
  await requireCapability("admin.read");

  const parsed = listAdminJobsSchema.safeParse(input);
  if (!parsed.success) {
    return { jobs: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }

  const { search, status, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  // Build Prisma where clause
  const where: Record<string, unknown> = { deleted_at: null };

  if (status !== undefined) {
    where.status = status;
  }

  if (search !== undefined && search.trim().length > 0) {
    const term = search.trim();
    where.OR = [
      { position: { contains: term } },
      { position_ar: { contains: term } },
      { description: { contains: term } },
      { description_ar: { contains: term } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.job.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      select: {
        job_uuid: true,
        position: true,
        position_ar: true,
        description: true,
        status: true,
        hours_per_day: true,
        compensation_type: true,
        compensation_amount: true,
        area_uuid: true,
        request_uuid: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.job.count({ where: where as any }),
  ]);

  const result = { jobs: rows, total, page, limit, totalPages: Math.ceil(total / limit) };

  const outputParsed = listAdminJobsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/jobs] listAdminJobs output validation:", outputParsed.error.issues);
  }

  return result;
}
