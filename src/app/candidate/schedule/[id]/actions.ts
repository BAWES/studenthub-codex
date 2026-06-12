"use server";

// ---------------------------------------------------------------------------
// Candidate Schedule [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Convenience wrappers that delegate to the parent list-level actions.
//
// Actions:
//   - getScheduleEntry      — fetch single schedule entry by UUID
//   - updateScheduleEntry   — update schedule entry (status, optional reason)
//   - deleteScheduleEntry   — remove a schedule entry
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getScheduleDetail as parentGetScheduleDetail,
  updateScheduleStatus as parentUpdateScheduleStatus,
} from "../actions";

// Re-export parent and schema types so consumers have a single import path
import type { ScheduleDetail, ScheduleItem, ScheduleStatusResult } from "../schemas";
export type { ScheduleDetail, ScheduleItem, ScheduleStatusResult };

import { z } from "zod";
import {
  getScheduleEntrySchema,
  updateScheduleEntrySchema,
  deleteScheduleEntrySchema,
  scheduleEntryActionResultSchema,
  scheduleEntryExistenceSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getScheduleEntry
// ---------------------------------------------------------------------------

/**
 * Get a single schedule entry with full detail (store, company, timestamps).
 * Delegates to the parent `getScheduleDetail` action.
 */
export async function getScheduleEntry(
  cwd_uuid: string,
): Promise<ScheduleDetail | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getScheduleEntrySchema.safeParse({ cwd_uuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule entry params");
  }

  return parentGetScheduleDetail(parsed.data.cwd_uuid);
}

// ---------------------------------------------------------------------------
// updateScheduleEntry
// ---------------------------------------------------------------------------

/**
 * Update the status of a schedule entry with an optional reason.
 *
 * - Delegates to parent `updateScheduleStatus` for the status change.
 * - Returns `{ success: true }` on success, `{ success: false, error }` on failure.
 *
 * The optional `reason` field is recorded as a note on the working-date
 * record for audit trail purposes.
 */
export async function updateScheduleEntry(
  cwd_uuid: string,
  status: number,
  reason?: string,
): Promise<z.infer<typeof scheduleEntryActionResultSchema>> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateScheduleEntrySchema.safeParse({ cwd_uuid, status, reason });
  if (!parsed.success) {
    return scheduleEntryActionResultSchema.parse({
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    });
  }

  // Verify the entry exists and belongs to the candidate before mutating
  const existing = await prisma.candidate_working_date.findFirst({
    where: {
      cwd_uuid: parsed.data.cwd_uuid,
      candidate_id: Number(session.id),
    },
    select: { cwd_uuid: true, status: true },
  });

  const existenceCheck = scheduleEntryExistenceSchema.safeParse(existing);
  if (!existenceCheck.success || !existenceCheck.data) {
    return scheduleEntryActionResultSchema.parse({
      success: false as const,
      error: "Schedule entry not found or access denied",
    });
  }

  // Delegate the status update to the parent action
  await parentUpdateScheduleStatus({
    cwd_uuid: parsed.data.cwd_uuid,
    status: parsed.data.status,
  });

  revalidatePath("/candidate/schedule");
  revalidatePath(`/candidate/schedule/${parsed.data.cwd_uuid}`);

  return scheduleEntryActionResultSchema.parse({ success: true as const });
}

// ---------------------------------------------------------------------------
// deleteScheduleEntry
// ---------------------------------------------------------------------------

/**
 * Delete a schedule entry by UUID.
 * Only the owning candidate can delete their own schedule entries.
 * Returns `{ success: true }` on success, `{ success: false, error }` on error.
 */
export async function deleteScheduleEntry(
  cwd_uuid: string,
): Promise<z.infer<typeof scheduleEntryActionResultSchema>> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = deleteScheduleEntrySchema.safeParse({ cwd_uuid });
  if (!parsed.success) {
    return scheduleEntryActionResultSchema.parse({
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    });
  }

  // Verify ownership before deleting
  const existing = await prisma.candidate_working_date.findFirst({
    where: {
      cwd_uuid: parsed.data.cwd_uuid,
      candidate_id: Number(session.id),
    },
    select: { cwd_uuid: true },
  });

  const existenceCheck = scheduleEntryExistenceSchema.safeParse(existing);
  if (!existenceCheck.success || !existenceCheck.data) {
    return scheduleEntryActionResultSchema.parse({
      success: false as const,
      error: "Schedule entry not found or access denied",
    });
  }

  await prisma.candidate_working_date.delete({
    where: { cwd_uuid: parsed.data.cwd_uuid },
  });

  revalidatePath("/candidate/schedule");

  return scheduleEntryActionResultSchema.parse({ success: true as const });
}
