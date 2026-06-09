"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { getStaffInterviewDetail } from "../actions";
import {
  getInterviewSchema,
  updateInterviewNotesSchema,
  type GetInterviewInput,
  type UpdateInterviewNotesInput,
  type InterviewDetail,
  type UpdateInterviewNotesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// getInterview — get a single interview by UUID (route-level action)
// ---------------------------------------------------------------------------

/**
 * Get detailed information about a staff interview by UUID.
 * Wraps the parent-level getStaffInterviewDetail as a route-level server action.
 * Returns null if the interview is not found or not owned by the current staff.
 */
export async function getInterview(
  params: z.input<typeof getInterviewSchema>,
): Promise<InterviewDetail | null> {
  await requireRoleCapability("staff", "request.interview");

  const parsed = getInterviewSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { interviewUuid } = parsed.data;

  // Delegate to the parent action which handles auth + ownership check
  const detail = await getStaffInterviewDetail({ interviewUuid });

  if (!detail) return null;

  // Map the parent's 'note' field to the [id] route's 'internalNote' expected type
  return {
    interviewUuid: detail.interviewUuid,
    candidateName: detail.candidateName,
    candidateEmail: detail.candidateEmail,
    candidatePhone: detail.candidatePhone,
    candidateId: detail.candidateId,
    requestTitle: detail.requestTitle,
    requestUuid: detail.requestUuid,
    companyName: detail.companyName,
    scheduledAt: detail.scheduledAt,
    status: detail.status,
    interviewNote: detail.interviewNote,
    internalNote: detail.note,
    staffName: detail.staffName,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// updateInterviewNotes — update internal note and/or interview note
// ---------------------------------------------------------------------------

/**
 * Update the internal note and/or interview note for a staff interview.
 * Verifies the interview belongs to the current staff member.
 * Revalidates the detail view path on success.
 */
export async function updateInterviewNotes(
  params: z.input<typeof updateInterviewNotesSchema>,
): Promise<UpdateInterviewNotesResult> {
  const session = await requireRoleCapability("staff", "request.interview");

  const parsed = updateInterviewNotesSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { interviewUuid, internalNote, interviewNote } = parsed.data;
  const staffId = Number(session.id);

  // Verify the interview exists and belongs to this staff member
  const existing = await prisma.request_interview.findFirst({
    where: {
      request_interview_uuid: interviewUuid,
      staff_id: staffId,
    },
    select: { request_interview_uuid: true },
  });

  if (!existing) {
    return {
      operation: "error",
      message: "Interview not found",
    };
  }

  // Build update data — only include fields that were provided
  const updateData: Record<string, unknown> = {
    updated_at: new Date(),
  };

  if (internalNote !== undefined) {
    updateData.internal_note = internalNote;
  }

  if (interviewNote !== undefined) {
    updateData.interview_note = interviewNote;
  }

  try {
    await prisma.request_interview.update({
      where: { request_interview_uuid: interviewUuid },
      data: updateData,
    });

    revalidatePath(`/staff/interviews/${interviewUuid}`);

    return {
      operation: "success",
      message: "Interview notes updated successfully",
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update interview notes",
    };
  }
}
