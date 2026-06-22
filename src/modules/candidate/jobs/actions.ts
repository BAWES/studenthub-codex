"use server";

// ---------------------------------------------------------------------------
// Candidate Job Browsing & Applications — module-level server actions
// ---------------------------------------------------------------------------
// Jobs page: lists active job postings from all employers.
// Apply: creates a job_listing_application record.
// My Applications: lists the candidate's applications with status.
// Uses the matching module to show per-candidate match scores.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { matchCandidateToJob } from "@/modules/matching/actions";
import {
  listCandidateJobsSchema,
  getCandidateJobSchema,
  applyToJobSchema,
  listMyApplicationsSchema,
  listCandidateJobsResultSchema,
  getCandidateJobResultSchema,
  applyToJobResultSchema,
  listMyApplicationsResultSchema,
  type ListCandidateJobsInput,
  type GetCandidateJobInput,
  type ApplyToJobInput,
  type ListMyApplicationsInput,
  type CandidateJobRow,
  type CandidateJobDetail,
  type ApplicationRow,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Get the current candidate's ID from the session. */
async function getCandidateId(): Promise<number> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  return Number(session.id);
}

// ---------------------------------------------------------------------------
// listCandidateJobs — browse active job postings
// ---------------------------------------------------------------------------

export async function listCandidateJobs(
  input: ListCandidateJobsInput = {},
): Promise<{ success: true; jobs: CandidateJobRow[]; total: number }> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const { page, limit, q, employmentType, location, sortBy } =
    listCandidateJobsSchema.parse(input);

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

  // Score each job for this candidate using the matching module
  const scoredJobs = await Promise.all(
    dbRows.map(async (r) => {
      let matchScore: number | null = null;
      try {
        const result = await matchCandidateToJob({
          candidateId,
          jobId: r.jobListingId,
        });
        matchScore = result.score.overall;
      } catch {
        // If matching fails (e.g. missing data), leave score null
        matchScore = null;
      }
      return { ...r, matchScore };
    }),
  );

  // Sort by match score descending when requested
  if (sortBy === "match") {
    scoredJobs.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }

  const jobs: CandidateJobRow[] = scoredJobs.map((r) => ({
    jobListingId: r.jobListingId,
    title: r.title,
    description: r.description,
    requirements: r.requirements,
    location: r.location,
    employmentType: r.employmentType,
    salaryRange: r.salaryRange,
    employerName: r.employer.company_name,
    matchScore: r.matchScore,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  const result = { success: true as const, jobs, total };

  const validated = listCandidateJobsResultSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[candidate/jobs] listCandidateJobs output validation failed:",
      validated.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCandidateJob — full detail for a single job posting
// ---------------------------------------------------------------------------

export async function getCandidateJob(
  input: GetCandidateJobInput,
): Promise<{ success: true; job: CandidateJobDetail }> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const { jobId } = getCandidateJobSchema.parse(input);

  const job = await prisma.job_listing.findUnique({
    where: { jobListingId: jobId },
    include: { employer: { select: { company_name: true } } },
  });

  if (!job) throw new Error("Job not found");
  if (job.status !== "active") throw new Error("This job is no longer accepting applications");

  // Check if candidate already applied
  const existing = await prisma.job_listing_application.findFirst({
    where: { jobListingId: jobId, candidateId },
    select: { status: true },
  });

  // Get match score for this candidate-job pair
  let matchScore: number | null = null;
  let skillScore: number | null = null;
  let educationScore: number | null = null;
  let locationScore: number | null = null;
  let breakdown: string[] = [];
  try {
    const result = await matchCandidateToJob({ candidateId, jobId });
    matchScore = result.score.overall;
    skillScore = result.score.skillMatch;
    educationScore = result.score.educationMatch;
    locationScore = result.score.locationMatch;
    breakdown = result.score.breakdown;
  } catch {
    matchScore = null;
  }

  const result = {
    success: true as const,
    job: {
      jobListingId: job.jobListingId,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      employmentType: job.employmentType,
      salaryRange: job.salaryRange,
      employerName: job.employer.company_name,
      matchScore,
      skillScore,
      educationScore,
      locationScore,
      breakdown,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      hasApplied: existing !== null,
      applicationStatus: existing?.status ?? null,
    },
  };

  const validated = getCandidateJobResultSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[candidate/jobs] getCandidateJob output validation failed:",
      validated.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// applyToJob — candidate applies to a job listing
// ---------------------------------------------------------------------------

export async function applyToJob(
  input: ApplyToJobInput,
): Promise<{ success: true; applicationId: number; message: string }> {
  const candidateId = await getCandidateId();

  const { jobListingId, coverLetter } = applyToJobSchema.parse(input);

  // Verify job exists and is active
  const job = await prisma.job_listing.findUnique({
    where: { jobListingId },
    select: { jobListingId: true, status: true },
  });

  if (!job) throw new Error("Job listing not found");
  if (job.status !== "active") throw new Error("This job listing is closed");

  // Check for duplicate application
  const existing = await prisma.job_listing_application.findFirst({
    where: { jobListingId, candidateId },
    select: { id: true },
  });

  if (existing) throw new Error("You have already applied to this position");

  const application = await prisma.job_listing_application.create({
    data: {
      jobListingId,
      candidateId,
      status: "applied",
      coverLetter: coverLetter ?? null,
    },
  });

  revalidatePath("/candidate/jobs");
  revalidatePath("/candidate/applications");

  const result = {
    success: true as const,
    applicationId: application.id,
    message: "Application submitted successfully",
  };

  const validated = applyToJobResultSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[candidate/jobs] applyToJob output validation failed:",
      validated.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// listMyApplications — candidate's own applications
// ---------------------------------------------------------------------------

export async function listMyApplications(
  input: ListMyApplicationsInput = {},
): Promise<{ success: true; applications: ApplicationRow[]; total: number }> {
  const candidateId = await getCandidateId();

  const { page, limit, status } = listMyApplicationsSchema.parse(input);

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

  const applications: ApplicationRow[] = dbRows.map((r) => ({
    applicationId: r.id,
    jobListingId: r.jobListingId,
    jobTitle: r.jobListing.title,
    employerName: r.jobListing.employer.company_name,
    status: r.status,
    coverLetter: r.coverLetter,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  const result = { success: true as const, applications, total };

  const validated = listMyApplicationsResultSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[candidate/jobs] listMyApplications output validation failed:",
      validated.error.issues,
    );
  }

  return result;
}
