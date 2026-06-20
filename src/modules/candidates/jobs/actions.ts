"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCandidateJobsSchema,
  getCandidateJobSchema,
  applyToJobSchema,
  listMyApplicationsSchema,
  candidateJobRowSchema,
  candidateJobDetailSchema,
  applicationRowSchema,
  listJobsResultSchema,
  listApplicationsResultSchema,
  applyToJobResultSchema,
  type ListCandidateJobsParams,
  type GetCandidateJobParams,
  type ApplyToJobParams,
  type ListMyApplicationsParams,
  type CandidateJobRow,
  type CandidateJobDetail,
  type ApplicationRow,
  type ListJobsResult,
  type ListApplicationsResult,
  type ApplyToJobResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Log output validation errors without throwing. */
function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/candidates/jobs] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List active job postings with optional filters.
 * Requires candidate.read capability.
 * Returns paginated results without match scores (handled at the app layer).
 */
export async function listCandidateJobs(
  params: ListCandidateJobsParams,
): Promise<ListJobsResult> {
  await requireCapability("candidate.read");

  const { candidateId, page, limit, q, employmentType, location, sortBy } =
    listCandidateJobsSchema.parse(params);

  const where: Record<string, unknown> = { status: "active" };

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { employer: { company_name: { contains: q } } },
    ];
  }
  if (employmentType) where.employmentType = employmentType;
  if (location) where.location = { contains: location };

  const [dbRows, total] = await Promise.all([
    prisma.job_listing.findMany({
      where: where as any,
      include: { employer: { select: { company_name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job_listing.count({ where: where as any }),
  ]);

  const items: CandidateJobRow[] = dbRows.map((r) => ({
    jobListingId: r.jobListingId,
    title: r.title,
    description: r.description,
    requirements: r.requirements,
    location: r.location,
    employmentType: r.employmentType,
    salaryRange: r.salaryRange,
    employerName: r.employer.company_name,
    matchScore: null, // scoring done at app layer
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  // Sort by match score descending when requested
  if (sortBy === "match") {
    items.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }

  const result = { items, total, page, pageSize: limit };

  // Output validation — log mismatches without throwing
  const outputParsed = listJobsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCandidateJobs", outputParsed.error.issues);
  }

  return result;
}

/**
 * Get a single job listing with detail, plus check if the candidate has applied.
 * Requires candidate.read capability.
 * Match scores are handled at the app layer (not computed here).
 */
export async function getCandidateJob(
  params: GetCandidateJobParams,
): Promise<CandidateJobDetail | null> {
  await requireCapability("candidate.read");

  const { jobId, candidateId } = getCandidateJobSchema.parse(params);

  const job = await prisma.job_listing.findUnique({
    where: { jobListingId: jobId },
    include: { employer: { select: { company_name: true } } },
  });

  if (!job) return null;

  // Check if candidate already applied (when candidateId is provided)
  let hasApplied = false;
  let applicationStatus: string | null = null;
  if (candidateId) {
    const existing = await prisma.job_listing_application.findFirst({
      where: { jobListingId: jobId, candidateId },
      select: { status: true },
    });
    hasApplied = existing !== null;
    applicationStatus = existing?.status ?? null;
  }

  const result: CandidateJobDetail = {
    jobListingId: job.jobListingId,
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    location: job.location,
    employmentType: job.employmentType,
    salaryRange: job.salaryRange,
    employerName: job.employer.company_name,
    matchScore: null,
    skillScore: null,
    educationScore: null,
    locationScore: null,
    breakdown: [],
    status: job.status,
    hasApplied,
    applicationStatus,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };

  // Output validation — log mismatches without throwing
  const outputParsed = candidateJobDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getCandidateJob", outputParsed.error.issues);
  }

  return result;
}

/**
 * Apply to a job listing.
 * Requires candidate.profile.edit capability.
 * Verifies job exists and is active, checks for duplicate applications.
 */
export async function applyToJob(
  params: ApplyToJobParams,
): Promise<ApplyToJobResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = applyToJobSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid application data",
    };
  }

  const { candidateId, jobListingId, coverLetter } = parsed.data;

  // Verify job exists and is active
  const job = await prisma.job_listing.findUnique({
    where: { jobListingId },
    select: { jobListingId: true, status: true },
  });

  if (!job) {
    return { success: false, error: "Job listing not found" };
  }
  if (job.status !== "active") {
    return { success: false, error: "This job listing is closed" };
  }

  // Check for duplicate application
  const existing = await prisma.job_listing_application.findFirst({
    where: { jobListingId, candidateId },
    select: { id: true },
  });

  if (existing) {
    return { success: false, error: "You have already applied to this position" };
  }

  const application = await prisma.job_listing_application.create({
    data: {
      jobListingId,
      candidateId,
      status: "applied",
      coverLetter: coverLetter ?? null,
    },
  });

  const result: ApplyToJobResult = { success: true, applicationId: application.id };

  // Output validation
  const outputParsed = applyToJobResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("applyToJob", outputParsed.error.issues);
  }

  return result;
}

/**
 * List a candidate's job applications.
 * Requires candidate.read capability.
 */
export async function listMyApplications(
  params: ListMyApplicationsParams,
): Promise<ListApplicationsResult> {
  await requireCapability("candidate.read");

  const { candidateId, page, limit, status } =
    listMyApplicationsSchema.parse(params);

  const where: Record<string, unknown> = { candidateId };
  if (status) where.status = status;

  const [dbRows, total] = await Promise.all([
    prisma.job_listing_application.findMany({
      where: where as any,
      include: {
        jobListing: {
          select: {
            title: true,
            jobListingId: true,
            employer: { select: { company_name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job_listing_application.count({ where: where as any }),
  ]);

  const items: ApplicationRow[] = dbRows.map((r) => ({
    applicationId: r.id,
    jobListingId: r.jobListingId,
    jobTitle: r.jobListing.title,
    employerName: r.jobListing.employer.company_name,
    status: r.status,
    coverLetter: r.coverLetter,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  const result = { items, total, page, pageSize: limit };

  // Output validation — log mismatches without throwing
  const outputParsed = listApplicationsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listMyApplications", outputParsed.error.issues);
  }

  return result;
}
