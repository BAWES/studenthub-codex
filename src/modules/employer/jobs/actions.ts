"use server";

import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Employer Job Posting — server actions (module-level)
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability, getSession } from "@/modules/auth/session";
import { listJobsTypesense } from "./search-typesense";
import {
  listJobsSchema,
  getJobSchema,
  createJobSchema,
  updateJobSchema,
  deleteJobSchema,
  closeJobSchema,
} from "./schemas";
import {
  listJobsResultSchema,
  getJobResultSchema,
  createJobResultSchema,
  updateJobResultSchema,
  deleteJobResultSchema,
  closeJobResultSchema,
  getMyEmployerIdResultSchema,
  searchJobsResultSchema,
  jobRowSchema,
} from "./schemas";
import type {
  ListJobsInput,
  GetJobInput,
  CreateJobInput,
  UpdateJobInput,
  DeleteJobInput,
  CloseJobInput,
  JobRow,
  ListJobsResult,
  GetJobResult,
  CreateJobResult,
  UpdateJobResult,
  DeleteJobResult,
  CloseJobResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/employer/jobs] ${source} output validation failed:`, error);
}

// ---------------------------------------------------------------------------
// getMyEmployerId
// ---------------------------------------------------------------------------

/**
 * Get the logged-in company user's first linked company ID.
 */
export async function getMyEmployerId(): Promise<number | null> {
  await requireCapability("company.read.linked");
  const session = await getSession();
  if (!session) return null;

  const link = await prisma.company_contact.findFirst({
    where: { contact_uuid: session.id },
    select: { company: { select: { company_id: true } } },
  });

  const result = link?.company?.company_id ?? null;

  // Validate output shape
  const validated = getMyEmployerIdResultSchema.safeParse(result);
  if (!validated.success) {
    logOutputError("getMyEmployerId", validated.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// listJobs
// ---------------------------------------------------------------------------

/**
 * List job listings with pagination and optional filters.
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

  const result = {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const validatedList = listJobsResultSchema.safeParse(result);
  if (!validatedList.success) {
    logOutputError("listJobs", validatedList.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getJob
// ---------------------------------------------------------------------------

/**
 * Fetch a single job listing by ID.
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

  // Validate output shape
  const validated = jobRowSchema.nullable().safeParse(job);
  if (!validated.success) {
    logOutputError("getJob", validated.error.issues);
  }

  return job;
}

// ---------------------------------------------------------------------------
// createJob
// ---------------------------------------------------------------------------

/**
 * Create a new job listing.
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

  const result = { success: true as const, jobListingId: job.jobListingId };

  // Validate output shape
  const validated = createJobResultSchema.safeParse(result);
  if (!validated.success) {
    logOutputError("createJob", validated.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateJob
// ---------------------------------------------------------------------------

/**
 * Update an existing job listing (partial update).
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

  const result = { success: true as const };

  // Validate output shape
  const validated = updateJobResultSchema.safeParse(result);
  if (!validated.success) {
    logOutputError("updateJob", validated.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteJob
// ---------------------------------------------------------------------------

/**
 * Delete (remove) a job listing.
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

  const result = { success: true as const };

  // Validate output shape
  const validated = deleteJobResultSchema.safeParse(result);
  if (!validated.success) {
    logOutputError("deleteJob", validated.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// closeJob
// ---------------------------------------------------------------------------

/**
 * Close (deactivate) a job listing without deleting it.
 * Sets status to "closed" instead of hard-removing the record.
 */
export async function closeJob(
  input: CloseJobInput,
): Promise<CloseJobResult> {
  await requireCapability("company.write.linked");

  const parsed = closeJobSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await prisma.job_listing.update({
    where: { jobListingId: parsed.data.jobId },
    data: { status: "closed" },
  });

  revalidatePath("/employer/jobs");
  revalidatePath("/candidate/jobs");

  const result = { success: true as const };

  // Validate output shape
  const validated = closeJobResultSchema.safeParse(result);
  if (!validated.success) {
    logOutputError("closeJob", validated.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// searchJobs — Typesense-powered job search (for EmployerJobsSearchPage)
// ---------------------------------------------------------------------------

/**
 * Search job listings via Typesense, returning the shape expected by
 * EmployerJobsSearchPage. Falls back to MySQL if Typesense is unavailable.
 */
export async function searchJobs(
  params: Record<string, unknown>,
): Promise<{
  query: string;
  page: number;
  matchingCount: number;
  rows: Array<{
    jobListingId: number;
    title: string;
    description: string;
    location: string | null;
    employmentType: string | null;
    salaryRange: string | null;
    status: string | null;
    companyName: string;
    createdAt: string;
    score?: number;
  }>;
  source: { current: string; target: string };
}> {
  const q = typeof params.q === "string" ? params.q : "";
  const page = typeof params.page === "number" ? params.page : 1;

  const typesenseResult = await listJobsTypesense({ q, page, limit: 20 });

  const result = {
    query: q,
    page,
    matchingCount: typesenseResult.total,
    rows: typesenseResult.items.map((item) => ({
      jobListingId: item.jobListingId,
      title: item.title,
      description: item.description,
      location: item.location,
      employmentType: item.employmentType,
      salaryRange: item.salaryRange,
      status: item.status,
      companyName: "",
      createdAt: item.createdAt.toISOString().slice(0, 10),
    })),
    source: typesenseResult.source,
  };

  // Validate output shape
  const validated = searchJobsResultSchema.safeParse(result);
  if (!validated.success) {
    logOutputError("searchJobs", validated.error.issues);
  }

  return result;
}
