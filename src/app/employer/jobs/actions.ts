"use server";

import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Employer Job Posting — server actions
// ---------------------------------------------------------------------------
// CRUD for job_listing table. Employers (company role) manage their own
// job postings for student recruitment.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listJobsSchema,
  getJobSchema,
  createJobSchema,
  updateJobSchema,
  deleteJobSchema,
} from "./schemas";
import type {
  ListJobsInput,
  GetJobInput,
  CreateJobInput,
  UpdateJobInput,
  DeleteJobInput,
  JobRow,
  CreateJobResult,
  UpdateJobResult,
  DeleteJobResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listJobs
// ---------------------------------------------------------------------------

/**
 * List job listings with pagination and optional filters.
 * Requires company.read.linked capability.
 */
export async function listJobs(
  input: ListJobsInput = {},
): Promise<{
  items: JobRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("company.read.linked");

  const parsed = listJobsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, status, q } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q && q.trim().length > 0) {
    where.OR = [
      { title: { contains: q.trim() } },
      { description: { contains: q.trim() } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.job_listing.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.job_listing.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getJob
// ---------------------------------------------------------------------------

/**
 * Fetch a single job listing by ID.
 * Requires company.read.linked capability.
 */
export async function getJob(
  input: GetJobInput,
): Promise<JobRow | null> {
  await requireCapability("company.read.linked");

  const parsed = getJobSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const job = await prisma.job_listing.findUnique({
    where: { jobListingId: parsed.data.jobId },
  });

  return job;
}

// ---------------------------------------------------------------------------
// createJob
// ---------------------------------------------------------------------------

/**
 * Create a new job listing.
 * Requires company.write.linked capability.
 */
export async function createJob(
  input: CreateJobInput,
): Promise<CreateJobResult> {
  await requireCapability("company.write.linked");

  const parsed = createJobSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { employerId, title, description, requirements, location, employmentType, salaryRange, status } = parsed.data;

  const job = await prisma.job_listing.create({
    data: {
      employerId,
      title,
      description,
      requirements,
      location,
      employmentType,
      salaryRange,
      status,
    },
  });

  revalidatePath("/employer/jobs");
  revalidatePath("/candidate/jobs");

  return { success: true, jobListingId: job.jobListingId };
}

// ---------------------------------------------------------------------------
// updateJob
// ---------------------------------------------------------------------------

/**
 * Update an existing job listing (partial update).
 * Requires company.write.linked capability.
 */
export async function updateJob(
  input: UpdateJobInput,
): Promise<UpdateJobResult> {
  await requireCapability("company.write.linked");

  const parsed = updateJobSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { jobId, ...fields } = parsed.data;

  await prisma.job_listing.update({
    where: { jobListingId: jobId },
    data: fields,
  });

  revalidatePath("/employer/jobs");
  revalidatePath("/candidate/jobs");

  return { success: true };
}

// ---------------------------------------------------------------------------
// deleteJob
// ---------------------------------------------------------------------------

/**
 * Delete (remove) a job listing.
 * Requires company.write.linked capability.
 */
export async function deleteJob(
  input: DeleteJobInput,
): Promise<DeleteJobResult> {
  await requireCapability("company.write.linked");

  const parsed = deleteJobSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await prisma.job_listing.delete({
    where: { jobListingId: parsed.data.jobId },
  });

  revalidatePath("/employer/jobs");
  revalidatePath("/candidate/jobs");

  return { success: true };
}
