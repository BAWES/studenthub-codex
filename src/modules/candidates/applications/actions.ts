"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability, requireRoleCapability } from "@/modules/auth/session";
import {
  listApplicationsSchema,
  getApplicationSchema,
  createApplicationSchema,
  updateApplicationStatusSchema,
  deleteApplicationSchema,
  applicationItemSchema,
  listApplicationsResultSchema,
  applicationActionResultSchema,
  type ListApplicationsInput,
  type GetApplicationInput,
  type CreateApplicationInput,
  type UpdateApplicationStatusInput,
  type DeleteApplicationInput,
  type ApplicationItem,
  type ListApplicationsResult,
  type ApplicationActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a raw Prisma row to the shared ApplicationItem shape. */
function toItem(row: RawApplicationRow): ApplicationItem {
  return {
    applicationId: row.id,
    jobListingId: row.jobListingId,
    jobTitle: row.jobListing?.title ?? "Unknown",
    employerName: row.jobListing?.employer?.company_name ?? "Unknown",
    status: row.status,
    coverLetter: row.coverLetter ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Raw row shape with eagerly loaded relations. */
type RawApplicationRow = Awaited<ReturnType<typeof prisma.job_listing_application.findFirst>> & {
  jobListing?: {
    title: string;
    employer?: { company_name: string } | null;
  } | null;
};

/** Reusable include for job listing relations. */
const applicationIncludes = {
  jobListing: {
    select: {
      title: true,
      employer: { select: { company_name: true } },
    },
  },
} as const;

/** Log output validation errors without throwing. */
function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/candidates/applications] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List job applications for a candidate.
 * Requires candidate.read capability.
 */
export async function listApplications(
  params: ListApplicationsInput,
): Promise<ListApplicationsResult> {
  await requireCapability("candidate.read");

  const { candidateId, page, limit, status } =
    listApplicationsSchema.parse(params);

  const where: Record<string, unknown> = { candidateId };
  if (status) {
    where.status = status;
  }

  const [rows, total] = await Promise.all([
    prisma.job_listing_application.findMany({
      where: where as any,
      include: applicationIncludes,
      orderBy: { createdAt: "desc" as const },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job_listing_application.count({ where: where as any }),
  ]);

  const result = {
    items: rows.map(toItem),
    total,
    page,
    pageSize: limit,
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listApplicationsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listApplications", outputParsed.error.issues);
  }

  return result;
}

/**
 * Get a single job application by ID.
 * Requires candidate.read capability.
 * Returns null if not found or does not belong to the candidate.
 */
export async function getApplication(
  params: GetApplicationInput,
): Promise<ApplicationItem | null> {
  await requireCapability("candidate.read");

  const { applicationId } = getApplicationSchema.parse(params);

  const row = await prisma.job_listing_application.findUnique({
    where: { id: applicationId },
    include: applicationIncludes,
  });

  if (!row) return null;

  const result = toItem(row as RawApplicationRow);

  // Output validation
  const outputParsed = applicationItemSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getApplication", outputParsed.error.issues);
  }

  return result;
}

/**
 * Create a new job application.
 * Requires candidate.profile.edit capability.
 */
export async function createApplication(
  params: CreateApplicationInput,
): Promise<ApplicationActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = createApplicationSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid application data",
    };
  }

  // Verify job listing exists
  const listing = await prisma.job_listing.findUnique({
    where: { jobListingId: parsed.data.jobListingId },
    select: { jobListingId: true },
  });
  if (!listing) {
    return { success: false, error: "Job listing not found" };
  }

  // Check for duplicate application
  const existing = await prisma.job_listing_application.findFirst({
    where: {
      jobListingId: parsed.data.jobListingId,
      candidateId: parsed.data.candidateId,
      status: { not: "withdrawn" },
    } as any,
    select: { id: true },
  });
  if (existing) {
    return {
      success: false,
      error: "You have already applied to this job",
    };
  }

  const row = await prisma.job_listing_application.create({
    data: {
      jobListingId: parsed.data.jobListingId,
      candidateId: parsed.data.candidateId,
      coverLetter: parsed.data.coverLetter || null,
      status: "applied",
    },
    include: applicationIncludes,
  });

  revalidatePath("/candidate/applications");
  revalidatePath("/candidate/jobs");

  const result: ApplicationActionResult = {
    success: true,
    applicationId: row.id,
  };

  // Output validation
  const outputParsed = applicationActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("createApplication", outputParsed.error.issues);
  }

  return result;
}

/**
 * Update a job application's status.
 * Requires candidate.profile.edit capability.
 */
export async function updateApplicationStatus(
  params: UpdateApplicationStatusInput,
): Promise<ApplicationActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = updateApplicationStatusSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid status update",
    };
  }

  // Verify the application exists
  const existing = await prisma.job_listing_application.findUnique({
    where: { id: parsed.data.applicationId },
    select: { id: true, status: true },
  });
  if (!existing) {
    return { success: false, error: "Application not found" };
  }

  await prisma.job_listing_application.update({
    where: { id: parsed.data.applicationId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/candidate/applications");
  revalidatePath("/candidate/jobs");

  const result: ApplicationActionResult = {
    success: true,
    applicationId: parsed.data.applicationId,
  };

  // Output validation
  const outputParsed = applicationActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateApplicationStatus", outputParsed.error.issues);
  }

  return result;
}

/**
 * Delete a job application.
 * Requires candidate.profile.edit capability.
 */
export async function deleteApplication(
  params: DeleteApplicationInput,
): Promise<ApplicationActionResult> {
  await requireCapability("candidate.profile.edit");

  const parsed = deleteApplicationSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid application ID",
    };
  }

  // Verify the application exists
  const existing = await prisma.job_listing_application.findUnique({
    where: { id: parsed.data.applicationId },
    select: { id: true },
  });
  if (!existing) {
    return { success: false, error: "Application not found" };
  }

  await prisma.job_listing_application.delete({
    where: { id: parsed.data.applicationId },
  });

  revalidatePath("/candidate/applications");
  revalidatePath("/candidate/jobs");

  const result: ApplicationActionResult = {
    success: true,
    applicationId: parsed.data.applicationId,
  };

  // Output validation
  const outputParsed = applicationActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteApplication", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Candidate-specific wrappers (for /candidate/applications route)
// ---------------------------------------------------------------------------

/** Input schema for listMyApplications — no candidateId (extracted from session). */
const listMyApplicationsInputSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.string().optional(),
});

export type ListMyApplicationsInput = z.input<typeof listMyApplicationsInputSchema>;

/** Output shape for listMyApplications — maps module's { items } to { applications }. */
const listMyApplicationsOutputSchema = z.object({
  applications: z.array(applicationItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

type ListMyApplicationsOutput = z.output<typeof listMyApplicationsOutputSchema>;

/** Withdraw result schema — simple success/fail. */
const withdrawApplicationOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

type WithdrawApplicationOutput = z.output<typeof withdrawApplicationOutputSchema>;

/**
 * List the current user's applications — extracts candidateId from session.
 * Delegates to listApplications with the session's candidate ID.
 */
export async function listMyApplications(
  input: ListMyApplicationsInput = {},
): Promise<ListMyApplicationsOutput> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const { page, limit, status } = listMyApplicationsInputSchema.parse(input);

  const result = await listApplications({ candidateId, page, limit, status });

  const mapped: ListMyApplicationsOutput = {
    applications: result.items,
    total: result.total,
    page: result.page,
    limit,
  };

  // Validate output shape
  const outputParsed = listMyApplicationsOutputSchema.safeParse(mapped);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/applications] listMyApplications output validation failed:",
      outputParsed.error.issues,
    );
  }

  return mapped;
}

/**
 * Get the current user's single application by ID.
 * Extracts candidateId from session and filters by ownership.
 */
export async function getMyApplication(
  applicationId: number,
): Promise<ApplicationItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const row = await prisma.job_listing_application.findFirst({
    where: { id: applicationId, candidateId },
    include: applicationIncludes,
  });

  if (!row) return null;

  const result = toItem(row as RawApplicationRow);

  // Output validation
  const outputParsed = applicationItemSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getMyApplication", outputParsed.error.issues);
  }

  return result;
}

/**
 * Withdraw a job application — delegates to updateApplicationStatus.
 */
export async function withdrawApplication(
  applicationId: number,
): Promise<WithdrawApplicationOutput> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const result = await updateApplicationStatus({
    applicationId,
    status: "withdrawn" as const,
  });

  if (!result.success) {
    const failResult: WithdrawApplicationOutput = {
      success: false,
      error: result.error ?? "Application not found",
    };
    const failParsed = withdrawApplicationOutputSchema.safeParse(failResult);
    if (!failParsed.success) {
      console.error(
        "[modules/candidates/applications] withdrawApplication output validation failed:",
        failParsed.error.issues,
      );
    }
    return failResult;
  }

  revalidatePath("/candidate/applications");
  revalidatePath("/candidate/jobs");

  const successResult: WithdrawApplicationOutput = { success: true };
  const successParsed = withdrawApplicationOutputSchema.safeParse(successResult);
  if (!successParsed.success) {
    console.error(
      "[modules/candidates/applications] withdrawApplication output validation failed:",
      successParsed.error.issues,
    );
  }

  return successResult;
}
