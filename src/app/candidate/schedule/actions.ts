"use server";

// ---------------------------------------------------------------------------
// Candidate Schedule — server actions for /candidate/schedule
// ---------------------------------------------------------------------------
// Route-level wrappers that delegate to modules/candidates/schedule for
// listing, viewing, and updating working dates for the current candidate.
// ---------------------------------------------------------------------------

import { requireRoleCapability } from "@/modules/auth/session";
import {
  listSchedule as moduleListSchedule,
  getScheduleItem as moduleGetScheduleItem,
  getScheduleDetail as moduleGetScheduleDetail,
  updateScheduleStatus as moduleUpdateScheduleStatus,
} from "@/modules/candidates/schedule/actions";
import {
  listScheduleSchema,
  getScheduleItemSchema,
  getScheduleDetailSchema,
  updateScheduleStatusSchema,
  scheduleItemOutputSchema,
  scheduleDetailOutputSchema,
  scheduleStatusResultOutputSchema,
} from "./schemas";
import type {
  ListScheduleInput,
  ScheduleItem,
  ScheduleDetail,
  ScheduleStatusResult,
  UpdateScheduleStatusInput,
} from "./schemas";

// Re-export types for client components
export type { ScheduleItem, ScheduleDetail, ScheduleStatusResult, UpdateScheduleStatusInput };

// ---------------------------------------------------------------------------
// Server actions — delegate to module-level implementations
// ---------------------------------------------------------------------------

/**
 * List working dates for the current candidate (paginated, with optional date filter).
 * Delegates to modules/candidates/schedule with the session candidate ID.
 */
export async function listSchedule(
  input: ListScheduleInput = {},
): Promise<ScheduleItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listScheduleSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule list params");
  }

  return moduleListSchedule(Number(session.id), parsed.data);
}

/**
 * Get a single working date by UUID.
 * Delegates to modules/candidates/schedule with the session candidate ID.
 */
export async function getScheduleItem(
  cwd_uuid: string,
): Promise<ScheduleItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getScheduleItemSchema.safeParse({ cwd_uuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid working date UUID",
    );
  }

  const result = await moduleGetScheduleItem(
    Number(session.id),
    parsed.data.cwd_uuid,
  );

  // Validate output shape
  if (result) {
    const outputParsed = scheduleItemOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[candidate/schedule] getScheduleItem output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

/**
 * Get a single working date detail with full store/company nesting.
 * Delegates to modules/candidates/schedule with the session candidate ID.
 */
export async function getScheduleDetail(
  cwd_uuid: string,
): Promise<ScheduleDetail | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getScheduleDetailSchema.safeParse({ cwd_uuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid working date UUID",
    );
  }

  const result = await moduleGetScheduleDetail(
    Number(session.id),
    parsed.data.cwd_uuid,
  );

  // Validate output shape
  if (result) {
    const outputParsed = scheduleDetailOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[candidate/schedule] getScheduleDetail output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

/**
 * Update the status of a working date (confirm/cancel).
 * Only the owning candidate can update their own schedule items.
 * Delegates to modules/candidates/schedule for ownership verification.
 */
export async function updateScheduleStatus(
  data: UpdateScheduleStatusInput,
): Promise<ScheduleStatusResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateScheduleStatusSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid schedule status data",
    );
  }

  const result = await moduleUpdateScheduleStatus(
    Number(session.id),
    parsed.data,
  );

  // Validate output shape
  const outputParsed = scheduleStatusResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/schedule] updateScheduleStatus output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
