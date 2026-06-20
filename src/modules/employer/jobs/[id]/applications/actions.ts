"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listJobApplicationsSchema,
  listJobApplicationsByEmployerSchema,
  updateApplicationStatusSchema,
  jobApplicationListOutputSchema,
  jobApplicationListByEmployerOutputSchema,
  updateApplicationStatusOutputSchema,
  type ListJobApplicationsInput,
  type ListJobApplicationsByEmployerInput,
  type UpdateApplicationStatusInput,
  type JobApplicationRow,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output validation helper
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/employer/jobs/[id]/applications] ${source} output validation failed:`, error);
}

/**
 * List applications for a specific job listing.
 */
export async function listJobApplications(
  input: ListJobApplicationsInput,
): Promise<{ success: true; applications: JobApplicationRow[]; total: number }> {
  await requireCapability("company.read.linked");

  const parsed = listJobApplicationsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: true, applications: [], total: 0 };
  }

  const { jobListingId, page = 1, limit = 20, status } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { jobListingId };
  if (status) where.status = status;

  const [applications, total] = await Promise.all([
    prisma.job_listing_application.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        candidate: {
          select: {
            candidate_id: true,
            candidate_name: true,
            candidate_name_ar: true,
          },
        },
      },
    }),
    prisma.job_listing_application.count({ where: where as any }),
  ]);

  const result = {
    success: true as const,
    applications: applications.map((app) => ({
      applicationId: app.id,
      candidateId: app.candidateId,
      candidateName: app.candidate?.candidate_name ?? app.candidate?.candidate_name_ar ?? null,
      status: app.status,
      coverLetter: app.coverLetter,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    })),
    total,
  };

  // Validate output shape
  const validated = jobApplicationListOutputSchema.safeParse(result);
  if (!validated.success) {
    logOutputError("listJobApplications", validated.error.issues);
  }

  return result;
}

/**
 * List all applications across all jobs for the current employer.
 */
export async function listJobApplicationsByEmployer(
  input: ListJobApplicationsByEmployerInput,
): Promise<{
  success: true;
  applications: (JobApplicationRow & { jobTitle: string })[];
  total: number;
}> {
  await requireCapability("company.read.linked");

  const parsed = listJobApplicationsByEmployerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: true, applications: [], total: 0 };
  }

  const { page = 1, limit = 20, status } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [applications, total] = await Promise.all([
    prisma.job_listing_application.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        candidate: {
          select: {
            candidate_id: true,
            candidate_name: true,
            candidate_name_ar: true,
          },
        },
        jobListing: {
          select: { title: true },
        },
      },
    }),
    prisma.job_listing_application.count({ where: where as any }),
  ]);

  const result = {
    success: true as const,
    applications: applications.map((app) => ({
      applicationId: app.id,
      candidateId: app.candidateId,
      candidateName: app.candidate?.candidate_name ?? app.candidate?.candidate_name_ar ?? null,
      status: app.status,
      coverLetter: app.coverLetter,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      jobTitle: app.jobListing?.title ?? "Unknown",
    })),
    total,
  };

  // Validate output shape
  const validated = jobApplicationListByEmployerOutputSchema.safeParse(result);
  if (!validated.success) {
    logOutputError("listJobApplicationsByEmployer", validated.error.issues);
  }

  return result;
}

/**
 * Update the status of a job application.
 */
export async function updateApplicationStatus(
  input: UpdateApplicationStatusInput,
): Promise<{ success: true }> {
  await requireCapability("company.write.linked");

  const parsed = updateApplicationStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { applicationId, status, rejectionReason } = parsed.data;

  const updateData: Record<string, unknown> = { status };

  if (status === "rejected" && rejectionReason) {
    updateData.notes = `Rejection reason: ${rejectionReason}`;
  }

  await prisma.job_listing_application.update({
    where: { id: applicationId },
    data: updateData,
  });

  const result = { success: true as const };

  // Validate output shape
  const validated = updateApplicationStatusOutputSchema.safeParse(result);
  if (!validated.success) {
    logOutputError("updateApplicationStatus", validated.error.issues);
  }

  return result;
}
