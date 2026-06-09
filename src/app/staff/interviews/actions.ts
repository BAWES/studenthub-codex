"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listStaffInterviewsSchema,
  getStaffInterviewDetailSchema,
  updateInterviewStatusSchema,
  type InterviewRow,
  type InterviewDetail,
  type UpdateInterviewStatusResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listStaffInterviews — paginated list of interviews for the current staff
// ---------------------------------------------------------------------------

/**
 * List staff interviews for the current user, paginated.
 * Returns interviews assigned to the staff member, ordered by scheduled date desc.
 */
export async function listStaffInterviews(
  params: z.input<typeof listStaffInterviewsSchema> = {},
): Promise<{ items: InterviewRow[]; total: number; page: number; limit: number; totalPages: number }> {
  const session = await requireRoleCapability("staff", "request.interview");

  const parsed = listStaffInterviewsSchema.safeParse(params);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, status, q } = parsed.data;
  const skip = (page - 1) * limit;
  const staffId = Number(session.id);

  // Build Prisma where clause
  const where: Record<string, unknown> = {
    staff_id: staffId,
  };

  if (status !== undefined) {
    where.status = Number(status);
  }

  if (q !== undefined && q.trim().length > 0) {
    where.OR = [
      { candidate: { candidate_name: { contains: q.trim() } } },
      { request: { request_position_title: { contains: q.trim() } } },
    ];
  }

  const formatDate = (d: Date | null | undefined): string => {
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
  };

  const statusLabel = (status: number | null | undefined): string => {
    if (status === 1) return "Completed";
    if (status === 2) return "Cancelled";
    return "Scheduled";
  };

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

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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
  const session = await requireRoleCapability("staff", "request.interview");

  const parsed = getStaffInterviewDetailSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { interviewUuid } = parsed.data;
  const staffId = Number(session.id);

  const interview = await prisma.request_interview.findFirst({
    where: {
      request_interview_uuid: interviewUuid,
      staff_id: staffId,
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

  return {
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
}

// ---------------------------------------------------------------------------
// updateInterviewStatus — update an interview's status
// ---------------------------------------------------------------------------

/**
 * Update the status of a staff interview (0=scheduled, 1=completed, 2=cancelled).
 * Verifies the interview belongs to the current staff member.
 * Revalidates the /staff/interviews path on success.
 */
export async function updateInterviewStatus(
  params: z.input<typeof updateInterviewStatusSchema>,
): Promise<UpdateInterviewStatusResult> {
  const session = await requireRoleCapability("staff", "request.interview");

  const parsed = updateInterviewStatusSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { interviewUuid, status } = parsed.data;
  const staffId = Number(session.id);
  const newStatus = Number(status);

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

  try {
    await prisma.request_interview.update({
      where: { request_interview_uuid: interviewUuid },
      data: {
        status: newStatus,
        updated_at: new Date(),
      },
    });

    revalidatePath("/staff/interviews");

    return {
      operation: "success",
      message: `Interview status updated to "${
        newStatus === 0 ? "Scheduled" : newStatus === 1 ? "Completed" : "Cancelled"
      }"`,
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update interview status",
    };
  }
}
