"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listJobApplicationsByEmployer,
  updateApplicationStatus as updateJobApplicationStatus,
} from "@/modules/employer/jobs/[id]/applications/actions";
import {
  listEmployerApplicationsSchema,
  getApplicationDetailSchema,
  getApplicationDetailOutputSchema,
  updateEmployerApplicationStatusSchema,
  updateEmployerApplicationStatusOutputSchema,
  employerApplicationListOutputSchema,
} from "./schemas";
import type {
  ListEmployerApplicationsInput,
  EmployerApplicationRow,
  GetApplicationDetailInput,
  UpdateEmployerApplicationStatusInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output validation helper
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/employer/applications] ${source} output validation failed:`, error);
}

// ---------------------------------------------------------------------------
// Output type from the module-level action
// ---------------------------------------------------------------------------

type EmployerApplicationsResult = {
  success: true;
  applications: EmployerApplicationRow[];
  total: number;
  metrics: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
};

/**
 * List all applications across all jobs for the current employer.
 * Wraps listJobApplicationsByEmployer with metric calculations.
 */
export async function listEmployerApplications(
  input: ListEmployerApplicationsInput,
): Promise<EmployerApplicationsResult> {
  await requireCapability("company.read.linked");

  const parsed = listEmployerApplicationsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: true,
      applications: [],
      total: 0,
      metrics: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    };
  }

  const { page, limit, status } = parsed.data;

  const result = await listJobApplicationsByEmployer({ page, limit, status });

  const output = {
    success: true as const,
    applications: result.applications.map((app) => ({
      id: app.applicationId,
      jobTitle: app.jobTitle,
      candidateName: app.candidateName,
      status: app.status,
      createdAt: app.createdAt,
    })),
    total: result.total,
    metrics: computeMetrics(result.applications),
  };

  // Validate output shape
  const validated = employerApplicationListOutputSchema.safeParse(output);
  if (!validated.success) {
    logOutputError("listEmployerApplications", validated.error.issues);
  }

  return output;
}

// ---------------------------------------------------------------------------
// Metric computation helper
// ---------------------------------------------------------------------------

/**
 * Get a single application's full details for the employer detail page.
 */
export async function getApplicationDetail(
  input: GetApplicationDetailInput,
): Promise<z.output<typeof getApplicationDetailOutputSchema>> {
  await requireCapability("company.read.linked");

  const parsed = getApplicationDetailSchema.safeParse(input);
  if (!parsed.success) {
    return { success: true, application: null };
  }

  const app = await prisma.job_listing_application.findUnique({
    where: { id: parsed.data.applicationId },
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
  });

  if (!app) {
    return { success: true as const, application: null };
  }

  const output = {
    success: true as const,
    application: {
      applicationId: app.id,
      jobListingId: app.jobListingId,
      candidateId: app.candidateId,
      candidateName: app.candidate?.candidate_name ?? app.candidate?.candidate_name_ar ?? null,
      jobTitle: app.jobListing?.title ?? "Unknown",
      status: app.status,
      coverLetter: app.coverLetter,
      notes: app.notes,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    },
  };

  // Validate output shape
  const validated = getApplicationDetailOutputSchema.safeParse(output);
  if (!validated.success) {
    logOutputError("getApplicationDetail", validated.error.issues);
  }

  return output;
}

function computeMetrics(
  applications: { status: string }[],
): EmployerApplicationsResult["metrics"] {
  const total = applications.length;
  const pending = applications.filter((a) =>
    ["applied", "pending_review", "shortlisted"].includes(a.status),
  ).length;
  const accepted = applications.filter((a) => a.status === "accepted").length;
  const rejected = applications.filter((a) =>
    ["rejected", "declined"].includes(a.status),
  ).length;

  return { total, pending, accepted, rejected };
}

// ---------------------------------------------------------------------------
// Update application status — accept or reject an application
// ---------------------------------------------------------------------------

/**
 * Update the status of an application (accept/reject/review).
 * Delegates to the jobs-level action for the actual DB mutation.
 */
export async function updateApplicationStatus(
  input: UpdateEmployerApplicationStatusInput,
): Promise<z.output<typeof updateEmployerApplicationStatusOutputSchema>> {
  await requireCapability("company.write.linked");

  const parsed = updateEmployerApplicationStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const output = await updateJobApplicationStatus(parsed.data);

  // Validate output shape
  const validated = updateEmployerApplicationStatusOutputSchema.safeParse(output);
  if (!validated.success) {
    logOutputError("updateApplicationStatus", validated.error.issues);
  }

  return output;
}
