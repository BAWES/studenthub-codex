"use server";

// ---------------------------------------------------------------------------
// Candidate Applications — server actions for /candidate/applications
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ApplicationItem = {
  applicationId: number;
  jobListingId: number;
  jobTitle: string;
  employerName: string;
  status: string;
  coverLetter: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ListApplicationsResult = {
  applications: ApplicationItem[];
  total: number;
  page: number;
  limit: number;
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listApplicationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.string().optional(),
});

export type ListApplicationsInput = z.input<typeof listApplicationsSchema>;

// ---------------------------------------------------------------------------
// listMyApplications
// ---------------------------------------------------------------------------

/**
 * List the current candidate's job applications.
 */
export async function listMyApplications(
  input: ListApplicationsInput = {},
): Promise<ListApplicationsResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const { page, limit, status } = listApplicationsSchema.parse(input);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    candidateId: candidateId,
  };
  if (status) {
    where.status = status;
  }

  const [rows, total] = await Promise.all([
    prisma.job_listing_application.findMany({
      where: where as any,
      include: {
        jobListing: {
          select: {
            title: true,
            employer: { select: { company_name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.job_listing_application.count({ where: where as any }),
  ]);

  return {
    applications: rows.map((r) => ({
      applicationId: (r as any).applicationId ?? (r as any).id,
      jobListingId: (r as any).jobListingId ?? (r as any).job_listing_id,
      jobTitle: (r as any).jobListing?.title ?? "Unknown",
      employerName: (r as any).jobListing?.employer?.company_name ?? "Unknown",
      status: (r as any).status ?? "applied",
      coverLetter: (r as any).coverLetter ?? null,
      createdAt: (r as any).createdAt ?? (r as any).created_at ?? new Date(),
      updatedAt: (r as any).updatedAt ?? (r as any).updated_at ?? new Date(),
    })),
    total,
    page,
    limit,
  };
}

// ---------------------------------------------------------------------------
// withdrawApplication
// ---------------------------------------------------------------------------

/**
 * Withdraw a job application (set status to 'withdrawn').
 */
export async function withdrawApplication(
  applicationId: number,
): Promise<{ success: boolean; error?: string }> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  // Verify ownership
  const application = await prisma.job_listing_application.findFirst({
    where: { applicationId, candidateId } as any,
  });

  if (!application) {
    return { success: false, error: "Application not found" };
  }

  await prisma.job_listing_application.update({
    where: { applicationId } as any,
    data: { status: "withdrawn" } as any,
  });

  revalidatePath("/candidate/applications");
  revalidatePath("/candidate/jobs");

  return { success: true };
}
