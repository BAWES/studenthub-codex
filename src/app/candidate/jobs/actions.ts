"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCandidateJobsSchema,
  getCandidateJobSchema,
  applyToJobSchema,
  listMyApplicationsSchema,
} from "./schemas";
import type { CandidateJobRow, ApplicationRow, ApplyToJobResult, GetCandidateJobInput, ApplyToJobInput } from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List active job listings visible to candidates.
 */
export async function listCandidateJobs(
  input?: Record<string, unknown>,
): Promise<CandidateJobRow[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listCandidateJobsSchema.safeParse(input ?? {});
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { q, employmentType, location, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: "active" };

  if (employmentType) {
    where.employmentType = employmentType;
  }

  if (location) {
    where.location = { contains: location };
  }

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const rows = await prisma.job_listing.findMany({
    where: where as Parameters<typeof prisma.job_listing.findMany>[0]["where"],
    orderBy: [{ createdAt: "desc" }, { jobListingId: "desc" }],
    skip,
    take: limit,
    include: {
      employer: {
        select: { company_name: true },
      },
    },
  });

  return rows.map((r) => ({
    jobListingId: r.jobListingId,
    title: r.title,
    description: r.description,
    requirements: r.requirements,
    location: r.location,
    employmentType: r.employmentType,
    salaryRange: r.salaryRange,
    employerName: r.employer.company_name,
    createdAt: r.createdAt,
  }));
}

/**
 * Get a single job listing by ID.
 */
export async function getCandidateJob(
  input: GetCandidateJobInput,
): Promise<CandidateJobRow | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getCandidateJobSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const row = await prisma.job_listing.findFirst({
    where: { jobListingId: parsed.data.jobId, status: "active" },
    include: {
      employer: {
        select: { company_name: true },
      },
    },
  });

  if (!row) return null;

  return {
    jobListingId: row.jobListingId,
    title: row.title,
    description: row.description,
    requirements: row.requirements,
    location: row.location,
    employmentType: row.employmentType,
    salaryRange: row.salaryRange,
    createdAt: row.createdAt,
    employerName: row.employer.company_name,
  };
}

/**
 * Apply to a job listing.
 */
export async function applyToJob(
  input: ApplyToJobInput,
): Promise<ApplyToJobResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = applyToJobSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { jobId, coverLetter } = parsed.data;

  // Verify job exists and is active
  const job = await prisma.job_listing.findFirst({
    where: { jobListingId: jobId, status: "active" },
  });

  if (!job) {
    return { success: false, error: "Job listing not found or no longer active" };
  }

  // Check for duplicate application
  const existing = await prisma.job_listing_application.findFirst({
    where: {
      jobListingId: jobId,
      candidateId,
    },
  });

  if (existing) {
    return { success: false, error: "You have already applied to this job" };
  }

  const application = await prisma.job_listing_application.create({
    data: {
      jobListingId: jobId,
      candidateId,
      status: "new",
      coverLetter: coverLetter ?? null,
    },
  });

  revalidatePath("/candidate/jobs");
  revalidatePath("/candidate/applications");

  return { success: true, applicationId: application.applicationId };
}

/**
 * List applications for the current candidate.
 */
export async function listMyApplications(
  input?: Record<string, unknown>,
): Promise<ApplicationRow[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listMyApplicationsSchema.safeParse(input ?? {});
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const rows = await prisma.job_listing_application.findMany({
    where: { candidateId },
    orderBy: [{ createdAt: "desc" }, { applicationId: "desc" }],
    skip,
    take: limit,
    include: {
      jobListing: {
        select: {
          title: true,
          location: true,
          employmentType: true,
          salaryRange: true,
          employer: {
            select: { company_name: true },
          },
        },
      },
    },
  });

  return rows.map((r) => ({
    id: r.applicationId,
    jobListingId: r.jobListingId,
    jobTitle: r.jobListing.title,
    employerName: r.jobListing.employer.company_name,
    location: r.jobListing.location,
    employmentType: r.jobListing.employmentType,
    salaryRange: r.jobListing.salaryRange,
    status: r.status,
    coverLetter: r.coverLetter,
    appliedAt: r.createdAt,
  }));
}
