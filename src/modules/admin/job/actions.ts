"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listJobsSchema,
  listJobsResultSchema,
} from "./schemas";
import type { ListJobsInput, ListJobsResult } from "./schemas";

export async function listJobs(
  input: ListJobsInput = {},
): Promise<ListJobsResult> {
  await requireCapability("admin.read");
  const parsed = listJobsSchema.safeParse(input);
  if (!parsed.success)
    return { jobs: [], total: 0, page: 1, limit: 50, totalPages: 0 };

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.job.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      select: {
        job_uuid: true,
        story_uuid: true,
        request_uuid: true,
        area_uuid: true,
        position: true,
        position_ar: true,
        hours_per_day: true,
        days_per_week: true,
        compensation_type: true,
        compensation_amount: true,
        min_age: true,
        max_age: true,
        gender: true,
        available_from: true,
        available_to: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.job.count(),
  ]);

  const jobs = rows.map((row) => ({
    ...row,
    area_uuid: row.area_uuid ?? null,
    position_ar: row.position_ar ?? null,
    hours_per_day: row.hours_per_day ?? null,
    days_per_week: row.days_per_week ?? null,
    compensation_type: row.compensation_type ?? null,
    compensation_amount: row.compensation_amount ?? null,
    min_age: row.min_age ?? null,
    max_age: row.max_age ?? null,
    gender: row.gender ?? null,
    available_from: row.available_from ?? null,
    available_to: row.available_to ?? null,
    status: row.status ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  }));

  const result = {
    jobs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listJobsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/job] listJobs output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
