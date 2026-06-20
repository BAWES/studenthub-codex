"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listJobsSchema,
  getJobSchema,
  listJobsResultSchema,
  jobDetailSchema,
  type ListJobsParams,
  type GetJobParams,
  type JobListItem,
  type JobDetail,
  type ListJobsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listJobs
// ---------------------------------------------------------------------------

/**
 * List jobs with optional filters and pagination.
 *
 * Mirrors the legacy JobController::actionList:
 * - Filters by status (active/inactive), company (via request relation),
 *   and keyword search on position / description
 * - Excludes soft-deleted jobs (deleted_at IS NULL)
 * - Paginated with configurable page/limit
 */
export async function listJobs(
  params: FormData | ListJobsParams = {},
): Promise<ListJobsResult> {
  await requireCapability("candidate.read.own");

  const raw =
    params instanceof FormData
      ? {
          status: params.get("status"),
          companyId: params.get("companyId"),
          search: params.get("search"),
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listJobsSchema.safeParse(raw);
  if (!parsed.success) {
    return { jobs: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { status, companyId, search, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  // Build Prisma where clause
  const where: Record<string, unknown> = { deleted_at: null };

  if (status !== undefined) {
    where.status = status;
  }

  if (companyId !== undefined) {
    where.request = { company_id: companyId };
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

  const [jobs, total] = await Promise.all([
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
        hours_per_day: true,
        days_per_week: true,
        status: true,
        area_uuid: true,
        request_uuid: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.job.count({ where: where as any }),
  ]);

  const result = {
    jobs: jobs as unknown as JobListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listJobsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/jobs] listJobs output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getJob
// ---------------------------------------------------------------------------

/**
 * Get a single job by UUID.
 *
 * Mirrors the legacy JobController::actionView.
 * Returns full detail including compensation fields and availability dates.
 * Throws if the job is not found or has been soft-deleted.
 */
export async function getJob(
  params: GetJobParams,
): Promise<JobDetail> {
  await requireCapability("candidate.read.own");

  const parsed = getJobSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { jobUuid } = parsed.data;

  const job = await prisma.job.findUnique({
    where: { job_uuid: jobUuid },
    include: {
      request: {
        select: {
          company_id: true,
          request_position_title: true,
        },
      },
      job_skills: {
        select: {
          skill: true,
          skill_ar: true,
        },
      },
    },
  });

  if (!job || job.deleted_at) {
    throw new Error("Job not found");
  }

  const result = {
    job_uuid: job.job_uuid,
    position: job.position,
    position_ar: job.position_ar ?? null,
    description: job.description ?? null,
    description_ar: job.description_ar ?? null,
    hours_per_day: job.hours_per_day ?? null,
    days_per_week: job.days_per_week ?? null,
    compensation_type: job.compensation_type ?? null,
    compensation_amount: job.compensation_amount ?? null,
    compensation_description: job.compensation_description ?? null,
    compensation_description_ar: job.compensation_description_ar ?? null,
    min_age: job.min_age ?? null,
    max_age: job.max_age ?? null,
    gender: job.gender ?? null,
    status: job.status,
    area_uuid: job.area_uuid ?? null,
    request_uuid: job.request_uuid,
    available_from: job.available_from ?? null,
    available_to: job.available_to ?? null,
    created_at: job.created_at ?? null,
    updated_at: job.updated_at ?? null,
  };

  // Output validation — log mismatches without throwing
  const outputParsed = jobDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/jobs] getJob output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
