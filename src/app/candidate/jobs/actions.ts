"use server";

// -----------------------------------------------------------------------
// Candidate Job Browsing & Applications — server actions
// -----------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCandidateJobsSchema,
  getCandidateJobSchema,
  applyToJobSchema,
  listMyApplicationsSchema,
} from "./schemas";
import type {
  ListCandidateJobsInput,
  GetCandidateJobInput,
  ApplyToJobInput,
  ListMyApplicationsInput,
  CandidateJobRow,
  ApplicationRow,
  ApplyToJobResult,
} from "./schemas";

// -----------------------------------------------------------------------
// listCandidateJobs — list active job postings for candidates to browse
// -----------------------------------------------------------------------

export async function listCandidateJobs(
  input: ListCandidateJobsInput = {},
): Promise<{
  items: CandidateJobRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listCandidateJobsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, q, employmentType, location } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    status: "active",
  };

  if (employmentType) where.employmentType = employmentType;
  if (location) where.location = { contains: location };

  if (q && q.trim().length > 0) {
    where.OR = [
      { title: { contains: q.trim() } },
      { description: { contains: q.trim() } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.job_listing.findMany({
      where,
      include: {
        employer: { select: { company_name: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.job_listing.count({ where }),
  ]);

  return {
    items: items.map((j) => ({
      jobListingId: j.jobListingId,
      title: j.title,
      description: j.description,
      requirements: j.requirements,
      location: j.location,
      employmentType: j.employmentType,
      salaryRange: j.salaryRange,
      employerName: j.employer.company_name,
      createdAt: j.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// -----------------------------------------------------------------------
// getCandidateJob — fetch a single active job posting for candidates
// -----------------------------------------------------------------------

export async function getCandidateJob(
  input: GetCandidateJobInput,
): Promise<CandidateJobRow | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getCandidateJobSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const job = await prisma.job_listing.findFirst({
    where: { jobListingId: parsed.data.jobId, status: "active" },
    include: {
      employer: { select: { company_name: true } },
    },
  });

  if (!job) return null;

  return {
    jobListingId: job.jobListingId,
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    location: job.location,
    employmentType: job.employmentType,
    salaryRange: job.salaryRange,
    employerName: job.employer.company_name,
    createdAt: job.createdAt,
  };
}

// -----------------------------------------------------------------------
// applyToJob — candidate applies to a job listing
// -----------------------------------------------------------------------

export async function applyToJob(
  input: ApplyToJobInput,
): Promise<ApplyToJobResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = applyToJobSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const candidateId = Number(session.id);
  const { jobId, coverLetter } = parsed.data;

  // Check if the job exists and is active
  const job = await prisma.job_listing.findUnique({
    where: { jobListingId: jobId },
    select: { jobListingId: true, status: true },
  });

  if (!job) throw new Error("Job not found");
  if (job.status !== "active") throw new Error("This job is no longer accepting applications");

  // Check if already applied
  const existing = await prisma.job_listing_application.findFirst({
    where: { jobListingId: jobId, candidateId },
  });

  if (existing) {
    return { success: true, applicationId: existing.applicationId, alreadyApplied: true };
  }

  const application = await prisma.job_listing_application.create({
    data: {
      jobListingId: jobId,
      candidateId,
      status: "new",
      coverLetter,
    },
  });

  revalidatePath("/candidate/jobs");
  revalidatePath("/candidate/applications");

  return { success: true, applicationId: application.applicationId, alreadyApplied: false };
}

// -----------------------------------------------------------------------
// listMyApplications — list the candidate's job applications
// -----------------------------------------------------------------------

export async function listMyApplications(
  input: ListMyApplicationsInput = {},
): Promise<{
  items: ApplicationRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listMyApplicationsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const candidateId = Number(session.id);
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.job_listing_application.findMany({
      where: { candidateId },
      include: {
        jobListing: {
          select: {
            title: true,
            location: true,
            employmentType: true,
            salaryRange: true,
            employer: { select: { company_name: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.job_listing_application.count({ where: { candidateId } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.applicationId,
      jobListingId: a.jobListingId,
      jobTitle: a.jobListing.title,
      employerName: a.jobListing.employer.company_name,
      location: a.jobListing.location,
      employmentType: a.jobListing.employmentType,
      salaryRange: a.jobListing.salaryRange,
      status: a.status,
      coverLetter: a.coverLetter,
      appliedAt: a.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
