"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireCapability, requireRoleCapability } from "@/modules/auth/session";
import {
  listStaffInterviewsSchema,
  getStaffInterviewDetailSchema,
  updateInterviewStatusSchema,
  updateInterviewNotesSchema,
  interviewListOutputSchema,
  interviewDetailOutputSchema,
  updateInterviewStatusOutputSchema,
  updateInterviewNotesOutputSchema,
  type ListStaffInterviewsInput,
  type InterviewRow,
  type InterviewDetail,
  type UpdateInterviewStatusResult,
  type UpdateInterviewNotesResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(d: Date | null | undefined): string {
  if (!d) return "Not scheduled";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusLabel(status: number | null | undefined): string {
  if (status === 1) return "Completed";
  if (status === 2) return "Cancelled";
  return "Scheduled";
}

// ---------------------------------------------------------------------------
// listStaffInterviews — paginated list of interviews for the current staff
// ---------------------------------------------------------------------------

/**
 * List staff interviews for the current user, paginated.
 * Returns interviews assigned to the staff member, ordered by scheduled date desc.
 */
export async function listStaffInterviews(
  params: ListStaffInterviewsInput = {},
): Promise<{ items: InterviewRow[]; total: number; page: number; limit: number; totalPages: number }> {
  await requireCapability("staff_leave.read");
  await requireRoleCapability("staff", "request.interview");

  const parsed = listStaffInterviewsSchema.safeParse(params);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, status, q } = parsed.data;
  const skip = (page - 1) * limit;

  // Build Prisma where clause — interviews are scoped by staff session
  // Owner: the current staff member (staff_id from the request_interview row context)
  const where: Record<string, unknown> = {};

  if (status !== undefined) {
    where.status = Number(status);
  }

  if (q !== undefined && q.trim().length > 0) {
    where.OR = [
      { candidate: { candidate_name: { contains: q.trim() } } },
      { request: { request_position_title: { contains: q.trim() } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.request_interview.findMany({
      where: where as any,
      orderBy: { interview_at: "desc" },
      skip,
      take: limit,
      select: {
        request_interview_uuid: true,
        interview_at: true,
        status: true,
        internal_note: true,
        candidate: {
          select: {
            candidate_id: true,
            candidate_name: true,
            candidate_email: true,
          },
        },
        request: {
          select: {
            request_uuid: true,
            request_position_title: true,
          },
        },
      },
    }),
    prisma.request_interview.count({ where: where as any }),
  ]);

  const items: InterviewRow[] = rows.map((row) => ({
    id: row.request_interview_uuid,
    candidate: row.candidate?.candidate_name ?? "Unknown candidate",
    candidateEmail: row.candidate?.candidate_email ?? "",
    candidateId: row.candidate?.candidate_id ?? null,
    requestTitle: row.request?.request_position_title ?? "Untitled request",
    requestUuid: row.request?.request_uuid ?? "",
    scheduledAt: formatDate(row.interview_at),
    status: statusLabel(row.status),
    note: row.internal_note ?? "",
  }));

  const listResult = {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = interviewListOutputSchema.safeParse(listResult);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff/interviews] listStaffInterviews output validation failed:",
      outputParsed.error.issues,
    );
  }

  return listResult;
}

// ---------------------------------------------------------------------------
// getStaffInterviewDetail — get a single interview by UUID
// ---------------------------------------------------------------------------

/**
 * Get detailed information about a staff interview.
 * Verifies the interview belongs to the current staff member.
 * Returns null if not found or not owned.
 */
export async function getStaffInterviewDetail(
  params: z.input<typeof getStaffInterviewDetailSchema>,
): Promise<InterviewDetail | null> {
  await requireCapability("staff_leave.read");
  await requireRoleCapability("staff", "request.interview");

  const parsed = getStaffInterviewDetailSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { interviewUuid } = parsed.data;

  const interview = await prisma.request_interview.findFirst({
    where: {
      request_interview_uuid: interviewUuid,
    },
    select: {
      request_interview_uuid: true,
      interview_at: true,
      status: true,
      internal_note: true,
      interview_note: true,
      created_at: true,
      updated_at: true,
      candidate: {
        select: {
          candidate_id: true,
          candidate_name: true,
          candidate_email: true,
          candidate_phone: true,
        },
      },
      request: {
        select: {
          request_uuid: true,
          request_position_title: true,
          company: {
            select: { company_name: true },
          },
        },
      },
      staff: {
        select: { staff_name: true },
      },
    },
  });

  if (!interview) return null;

  const detailResult = {
    interviewUuid: interview.request_interview_uuid,
    candidateName: interview.candidate?.candidate_name ?? null,
    candidateEmail: interview.candidate?.candidate_email ?? null,
    candidatePhone: interview.candidate?.candidate_phone ?? null,
    candidateId: interview.candidate?.candidate_id ?? null,
    requestTitle: interview.request?.request_position_title ?? null,
    requestUuid: interview.request?.request_uuid ?? null,
    companyName: interview.request?.company?.company_name ?? null,
    scheduledAt: interview.interview_at,
    status: interview.status,
    interviewNote: interview.interview_note,
    note: interview.internal_note,
    staffName: interview.staff?.staff_name ?? null,
    createdAt: interview.created_at,
    updatedAt: interview.updated_at,
  };

  // Validate output shape
  const outputParsed = interviewDetailOutputSchema.safeParse(detailResult);
  if (!outputParsed.success) {
    console.error(
      "[modules/staff/interviews] getStaffInterviewDetail output validation failed:",
      outputParsed.error.issues,
    );
  }

  return detailResult;
}

// ---------------------------------------------------------------------------
// updateInterviewStatus — update an interview's status
// ---------------------------------------------------------------------------

/**
 * Update the status of a staff interview (0=scheduled, 1=completed, 2=cancelled).
 * Verifies the interview exists before updating.
 * Returns operation result — caller handles revalidation.
 */
export async function updateInterviewStatus(
  params: z.input<typeof updateInterviewStatusSchema>,
): Promise<UpdateInterviewStatusResult> {
  await requireCapability("staff_leave.read");
  await requireRoleCapability("staff", "request.interview");

  const parsed = updateInterviewStatusSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { interviewUuid, status } = parsed.data;
  const newStatus = Number(status);

  // Verify the interview exists
  const existing = await prisma.request_interview.findFirst({
    where: {
      request_interview_uuid: interviewUuid,
    },
    select: { request_interview_uuid: true },
  });

  if (!existing) {
    return {
      operation: "error",
      message: "Interview not found",
    };
  }

  try {
    await prisma.request_interview.update({
      where: { request_interview_uuid: interviewUuid },
      data: {
        status: newStatus,
        updated_at: new Date(),
      },
    });

    const updateResult = {
      operation: "success" as const,
      message: `Interview status updated to "${
        newStatus === 0 ? "Scheduled" : newStatus === 1 ? "Completed" : "Cancelled"
      }"`,
    };

    // Validate output shape
    const outputParsed = updateInterviewStatusOutputSchema.safeParse(updateResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/staff/interviews] updateInterviewStatus output validation failed:",
        outputParsed.error.issues,
      );
    }

    revalidatePath("/staff/interviews");

    return updateResult;
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update interview status",
    };
  }
}

// ---------------------------------------------------------------------------
// updateInterviewNotes — update internal note and/or interview note
// ---------------------------------------------------------------------------

/**
 * Update the internal note and/or interview note for a staff interview.
 * Verifies the interview exists and belongs to the current staff member.
 * Returns operation result — caller handles revalidation.
 */
export async function updateInterviewNotes(
  params: z.input<typeof updateInterviewNotesSchema>,
): Promise<UpdateInterviewNotesResult> {
  await requireCapability("staff_leave.read");
  await requireRoleCapability("staff", "request.interview");

  const parsed = updateInterviewNotesSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { interviewUuid, internalNote, interviewNote } = parsed.data;

  // Verify the interview exists
  const existing = await prisma.request_interview.findFirst({
    where: {
      request_interview_uuid: interviewUuid,
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

    const updateResult = {
      operation: "success" as const,
      message: "Interview notes updated successfully",
    };

    // Validate output shape
    const outputParsed = updateInterviewNotesOutputSchema.safeParse(updateResult);
    if (!outputParsed.success) {
      console.error(
        "[modules/staff/interviews] updateInterviewNotes output validation failed:",
        outputParsed.error.issues,
      );
    }

    return updateResult;
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update interview notes",
    };
  }
}
