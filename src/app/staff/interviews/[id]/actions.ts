"use server";

import { z } from "zod";
import { requireRoleCapability } from "@/modules/auth/session";
import { getStaffInterviewDetail } from "@/modules/staff/interviews/actions";
import {
  getInterviewSchema,
  interviewDetailRouteOutputSchema,
  type InterviewDetail,
} from "./schemas";

// ---------------------------------------------------------------------------
// getInterview — get a single interview by UUID (route-level action)
// ---------------------------------------------------------------------------

/**
 * Get detailed information about a staff interview by UUID.
 * Wraps the module-level getStaffInterviewDetail as a route-level server action,
 * mapping internal field names for the route's expected shape.
 * Returns null if the interview is not found.
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

  // Delegate to the module action which handles auth + data fetching
  const detail = await getStaffInterviewDetail({ interviewUuid });

  if (!detail) return null;

  // Map the module's 'note' field to the [id] route's 'internalNote' expected type
  const detailResult = {
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

  // Validate output shape
  const outputParsed = interviewDetailRouteOutputSchema.safeParse(detailResult);
  if (!outputParsed.success) {
    console.error(
      "[staff/interviews/[id]] getInterview output validation failed:",
      outputParsed.error.issues,
    );
  }

  return detailResult;
}

// ---------------------------------------------------------------------------
// updateInterviewNotes — re-exported from module (now delegates to module)
// ---------------------------------------------------------------------------

export { updateInterviewNotes } from "@/modules/staff/interviews/actions";
