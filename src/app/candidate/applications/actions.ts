"use server";

// ---------------------------------------------------------------------------
// Candidate Applications — server actions for /candidate/applications
// ---------------------------------------------------------------------------
// Route-level wrappers that delegate to modules/candidates/applications for
// listing and withdrawing job applications.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listApplications as moduleListApplications,
  updateApplicationStatus as moduleUpdateApplicationStatus,
} from "@/modules/candidates/applications/actions";
import {
  listApplicationsSchema,
  listApplicationsResultSchema,
  withdrawApplicationResultSchema,
} from "./schemas";
import type {
  ListApplicationsInput,
  ApplicationItem,
  ListApplicationsResult,
  WithdrawApplicationResult,
} from "./schemas";

// Re-export types for client components
export type { ApplicationItem, ListApplicationsResult, WithdrawApplicationResult };

// ---------------------------------------------------------------------------
// Server actions — delegate to module-level implementations
// ---------------------------------------------------------------------------

/**
 * List the current candidate's job applications (paginated).
 * Delegates to modules/candidates/applications with the session's candidate ID.
 */
export async function listMyApplications(
  input: ListApplicationsInput = {},
): Promise<ListApplicationsResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const { page, limit, status } = listApplicationsSchema.parse(input);

  const result = await moduleListApplications({
    candidateId,
    page,
    limit,
    status,
  });

  // Map module shape { items, pageSize } → app router shape { applications, limit }
  const mapped = {
    applications: result.items,
    total: result.total,
    page: result.page,
    limit,
  };

  // Validate output shape
  const outputParsed = listApplicationsResultSchema.safeParse(mapped);
  if (!outputParsed.success) {
    console.error(
      "[candidate/applications] listMyApplications output validation failed:",
      outputParsed.error.issues,
    );
  }

  return mapped;
}

/**
 * Withdraw a job application (set status to 'withdrawn').
 * Delegates to modules/candidates/applications.
 */
export async function withdrawApplication(
  applicationId: number,
): Promise<WithdrawApplicationResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  // The module's updateApplicationStatus verifies ownership via applicationId
  const result = await moduleUpdateApplicationStatus({
    applicationId,
    status: "withdrawn" as const,
  });

  if (!result.success) {
    const failResult = { success: false as const, error: result.error ?? "Application not found" };
    const failParsed = withdrawApplicationResultSchema.safeParse(failResult);
    if (!failParsed.success) {
      console.error(
        "[candidate/applications] withdrawApplication output validation failed:",
        failParsed.error.issues,
      );
    }
    return failResult;
  }

  revalidatePath("/candidate/applications");
  revalidatePath("/candidate/jobs");

  const successResult = { success: true as const };
  const successParsed = withdrawApplicationResultSchema.safeParse(successResult);
  if (!successParsed.success) {
    console.error(
      "[candidate/applications] withdrawApplication output validation failed:",
      successParsed.error.issues,
    );
  }

  return successResult;
}
