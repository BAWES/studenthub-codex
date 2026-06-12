import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listJobApplicationsSchema,
  listJobApplicationsByEmployerSchema,
  updateApplicationStatusSchema,
  ListJobApplicationsInput,
  ListJobApplicationsByEmployerInput,
  UpdateApplicationStatusInput,
  JobApplicationRow,
  jobApplicationListOutputSchema,
  jobApplicationListByEmployerOutputSchema,
  updateApplicationStatusOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listJobApplications — view applications for a specific job listing
// ---------------------------------------------------------------------------

export async function listJobApplications(
  input: ListJobApplicationsInput,
): Promise<{ success: true; applications: JobApplicationRow[]; total: number }> {
  await requireCapability("company.read.linked");

  const { jobListingId, page, limit, status } = listJobApplicationsSchema.parse(input);

  const where: Record<string, unknown> = { jobListingId };
  if (status) where.status = status;

  const [dbRows, total] = await Promise.all([
    prisma.job_listing_application.findMany({
      where: where as any,
      include: {
        candidate: {
          select: {
            candidate_id: true,
            candidate_name: true,
            candidate_name_ar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job_listing_application.count({ where: where as any }),
  ]);

  const applications: JobApplicationRow[] = dbRows.map((r) => ({
    applicationId: r.id,
    candidateId: r.candidateId,
    candidateName: r.candidate?.candidate_name ?? r.candidate?.candidate_name_ar ?? null,
    status: r.status,
    coverLetter: r.coverLetter,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  const result = { success: true as const, applications, total };

  // Validate output shape
  const outputParsed = jobApplicationListOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[employer/jobs/applications] listJobApplications output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// listJobApplicationsByEmployer — view all applications across all employer's jobs
// ---------------------------------------------------------------------------

export async function listJobApplicationsByEmployer(
  input: ListJobApplicationsByEmployerInput = {},
): Promise<{ success: true; applications: (JobApplicationRow & { jobTitle: string })[]; total: number }> {
  await requireCapability("company.read.linked");

  const { page, limit, status } = listJobApplicationsByEmployerSchema.parse(input);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [dbRows, total] = await Promise.all([
    prisma.job_listing_application.findMany({
      where: where as any,
      include: {
        jobListing: { select: { title: true } },
        candidate: {
          select: {
            candidate_id: true,
            candidate_name: true,
            candidate_name_ar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job_listing_application.count({ where: where as any }),
  ]);

  const applications = dbRows.map((r) => ({
    applicationId: r.id,
    candidateId: r.candidateId,
    candidateName: r.candidate?.candidate_name ?? r.candidate?.candidate_name_ar ?? null,
    jobTitle: r.jobListing.title,
    status: r.status,
    coverLetter: r.coverLetter,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  const result = { success: true as const, applications, total };

  // Validate output shape
  const outputParsed = jobApplicationListByEmployerOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[employer/jobs/applications] listJobApplicationsByEmployer output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateApplicationStatus — update the status of an application
// ---------------------------------------------------------------------------

export async function updateApplicationStatus(
  input: UpdateApplicationStatusInput,
): Promise<{ success: true }> {
  await requireCapability("company.write.linked");

  const { applicationId, status } = updateApplicationStatusSchema.parse(input);

  await prisma.job_listing_application.update({
    where: { id: applicationId },
    data: { status },
  });

  const result = { success: true as const };

  // Validate output shape
  const outputParsed = updateApplicationStatusOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[employer/jobs/applications] updateApplicationStatus output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
