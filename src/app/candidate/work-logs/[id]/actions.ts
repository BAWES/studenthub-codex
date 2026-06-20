"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@/modules/auth/session";
import {
  getCandidateWorkLogDetailSchema,
  approveWorkLogAppealSchema,
  rejectWorkLogAppealSchema,
  updateWorkLogSchema,
  deleteWorkLogSchema,
  getWorkLogAppealsSchema,
  getWorkLogFeedbackSchema,
  workLogDetailForAppealOutputSchema,
  workLogAppealRowOutputSchema,
  workLogFeedbackRowOutputSchema,
  workLogActionOutputSchema,
  workLogUpdateOutputSchema,
  type GetCandidateWorkLogDetailInput,
  type ApproveWorkLogAppealInput,
  type RejectWorkLogAppealInput,
  type UpdateWorkLogInput,
  type DeleteWorkLogInput,
  type WorkLogAppealDetail,
  type WorkLogDetailForAppeal,
  type WorkLogAppealRow,
  type WorkLogFeedbackRow,
} from "./schemas";

// Module-level implementations (handle Prisma queries)
import {
  getWorkLogDetailWithStore as moduleGetWorkLogDetail,
  approveWorkLogAppeal as moduleApproveWorkLogAppeal,
  rejectWorkLogAppeal as moduleRejectWorkLogAppeal,
  updateWorkLogEntry as moduleUpdateWorkLogEntry,
  deleteWorkLogEntry as moduleDeleteWorkLogEntry,
  getWorkLogAppeals as moduleGetWorkLogAppeals,
  getWorkLogFeedback as moduleGetWorkLogFeedback,
} from "@/modules/candidate/work-logs/actions";

// ---------------------------------------------------------------------------
// getCandidateWorkLogDetail
// ---------------------------------------------------------------------------

/**
 * Get a single work log by UUID with full detail for the [id] route.
 * Verifies the record belongs to the current candidate.
 * Delegates Prisma queries through the module layer.
 */
export async function getCandidateWorkLogDetail(
  workLogUuid: string,
): Promise<WorkLogDetailForAppeal | null> {
  const session = await requireCapability("candidate.read.own");

  const parsed = getCandidateWorkLogDetailSchema.safeParse({ workLogUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const row = await moduleGetWorkLogDetail(parsed.data.workLogUuid);

  if (!row) return null;

  const result = {
    candidate_working_hour_uuid: row.candidate_working_hour_uuid,
    date: row.date,
    start_time: row.start_time,
    end_time: row.end_time,
    total_time: row.total_time,
    status: row.status,
    via: row.via,
    note: row.note,
    store_name: row.store?.store_name ?? null,
    store_location: row.store?.store_location ?? null,
    company_name: row.store?.company?.company_name ?? null,
  };

  // Validate output shape
  const outputParsed = workLogDetailForAppealOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/work-logs/[id]] getCandidateWorkLogDetail output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// approveWorkLogAppeal — approve a work log appeal by updating status
// ---------------------------------------------------------------------------

/**
 * Approve a work log appeal.
 * Updates the appeal status to approved (1).
 * The caller must have company-time.write permission.
 * Delegates Prisma queries through the module layer.
 */
export async function approveWorkLogAppeal(
  data: ApproveWorkLogAppealInput,
): Promise<{ appeal_uuid: string }> {
  await requireCapability("company.time.write");

  const parsed = approveWorkLogAppealSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const result = await moduleApproveWorkLogAppeal(parsed.data.appealUuid);

  revalidatePath("/candidate/work-logs");

  // Validate output shape
  const approveOutputParsed = workLogActionOutputSchema.safeParse(result);
  if (!approveOutputParsed.success) {
    console.error(
      "[candidate/work-logs/[id]] approveWorkLogAppeal output validation failed:",
      approveOutputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// rejectWorkLogAppeal — reject a work log appeal with a reason
// ---------------------------------------------------------------------------

/**
 * Reject a work log appeal with a required reason.
 * Updates the appeal status to rejected (2).
 * The caller must have company-time.write permission.
 * Delegates Prisma queries through the module layer.
 */
export async function rejectWorkLogAppeal(
  data: RejectWorkLogAppealInput,
): Promise<{ appeal_uuid: string }> {
  await requireCapability("company.time.write");

  const parsed = rejectWorkLogAppealSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const result = await moduleRejectWorkLogAppeal(parsed.data.appealUuid, parsed.data.reason);

  revalidatePath("/candidate/work-logs");

  // Validate output shape
  const rejectOutputParsed = workLogActionOutputSchema.safeParse(result);
  if (!rejectOutputParsed.success) {
    console.error(
      "[candidate/work-logs/[id]] rejectWorkLogAppeal output validation failed:",
      rejectOutputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateWorkLog — update a work log entry status and optional note
// ---------------------------------------------------------------------------

/**
 * Update a work log entry.
 * Validates the UUID, status, and optional note.
 * The caller must have candidate.write.own permission.
 * Delegates Prisma queries through the module layer.
 */
export async function updateWorkLog(
  data: UpdateWorkLogInput,
): Promise<{ workLogUuid: string }> {
  await requireCapability("candidate.write");

  const parsed = updateWorkLogSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const result = await moduleUpdateWorkLogEntry(parsed.data.workLogUuid, {
    status: parsed.data.status,
    note: parsed.data.note,
  });

  revalidatePath("/candidate/work-logs");

  // Validate output shape
  const updateOutputParsed = workLogUpdateOutputSchema.safeParse(result);
  if (!updateOutputParsed.success) {
    console.error(
      "[candidate/work-logs/[id]] updateWorkLog output validation failed:",
      updateOutputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteWorkLog — soft-delete a work log entry
// ---------------------------------------------------------------------------

/**
 * Delete a work log entry by UUID.
 * The caller must have candidate.write permission.
 * Delegates Prisma queries through the module layer.
 */
export async function deleteWorkLog(
  data: DeleteWorkLogInput,
): Promise<{ workLogUuid: string }> {
  await requireCapability("candidate.write");

  const parsed = deleteWorkLogSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const result = await moduleDeleteWorkLogEntry(parsed.data.workLogUuid);

  revalidatePath("/candidate/work-logs");
  return result;
}

// ---------------------------------------------------------------------------
// getWorkLogAppeals — fetch appeals for a work log (migrated from page.tsx)
// ---------------------------------------------------------------------------

/**
 * Get work log appeals for the current candidate.
 * The caller must have candidate.read.own capability.
 * Returns up to 8 most recent appeals.
 * Delegates Prisma queries through the module layer.
 */
export async function getWorkLogAppeals(
  workLogUuid: string,
): Promise<WorkLogAppealRow[]> {
  await requireCapability("candidate.read.own");

  const parsed = getWorkLogAppealsSchema.safeParse({ workLogUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const rows = await moduleGetWorkLogAppeals(parsed.data.workLogUuid);

  return rows;
}

// ---------------------------------------------------------------------------
// getWorkLogFeedback — fetch feedback for a work log (migrated from page.tsx)
// ---------------------------------------------------------------------------

/**
 * Get work log feedback for the current candidate.
 * The caller must have candidate.read.own capability.
 * Returns up to 8 most recent feedback records.
 * Delegates Prisma queries through the module layer.
 */
export async function getWorkLogFeedback(
  workLogUuid: string,
): Promise<WorkLogFeedbackRow[]> {
  await requireCapability("candidate.read.own");

  const parsed = getWorkLogFeedbackSchema.safeParse({ workLogUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const rows = await moduleGetWorkLogFeedback(parsed.data.workLogUuid);

  return rows;
}
