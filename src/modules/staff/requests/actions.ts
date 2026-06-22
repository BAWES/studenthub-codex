"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listStaffRequestsSchema,
  getStaffRequestDetailSchema,
  updateRequestStatusSchema,
  staffRequestListOutputSchema,
  staffRequestDetailOutputSchema,
  updateRequestStatusOutputSchema,
  type ListStaffRequestsInput,
  type StaffRequestRow,
  type StaffRequestDetail,
  type UpdateRequestStatusResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listStaffRequests — paginated list of requests for the current staff member
// ---------------------------------------------------------------------------

/**
 * List staff requests assigned to the current user, paginated.
 * Maps to the legacy StaffRequestController actionList or equivalent.
 * Ordered by updated datetime descending.
 */
export async function listStaffRequests(
  params: z.input<typeof listStaffRequestsSchema> = {},
): Promise<{ items: StaffRequestRow[]; total: number; page: number; limit: number; totalPages: number }> {
  const session = await requireRoleCapability("staff", "request.read.assigned");

  const parsed = listStaffRequestsSchema.safeParse(params);
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
    where.request_status = status;
  }

  if (q !== undefined && q.trim().length > 0) {
    where.OR = [
      { request_position_title: { contains: q.trim() } },
      { company: { company_name: { contains: q.trim() } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.request.findMany({
      where: where as any,
      orderBy: { request_updated_datetime: "desc" },
      skip,
      take: limit,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_status: true,
        request_number_of_employees: true,
        request_updated_datetime: true,
        company: { select: { company_name: true } },
      },
    }),
    prisma.request.count({ where: where as any }),
  ]);

  const formatDate = (d: Date | null | undefined): string => {
    if (!d) return "N/A";
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

  const items: StaffRequestRow[] = rows.map((row) => ({
    id: row.request_uuid,
    title: row.request_position_title ?? "Untitled request",
    company: row.company?.company_name ?? "No company",
    seats: row.request_number_of_employees ?? 0,
    status: row.request_status ?? "No status",
    updated: formatDate(row.request_updated_datetime),
  }));

  const listResult = {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = staffRequestListOutputSchema.safeParse(listResult);
  if (!outputParsed.success) {
    console.error(
      "[staff/requests] listStaffRequests output validation failed:",
      outputParsed.error.issues,
    );
  }

  return listResult;
}

// ---------------------------------------------------------------------------
// getStaffRequestDetail — get a single request by UUID
// ---------------------------------------------------------------------------

/**
 * Get detailed information about a staff request, including company info,
 * contact, staff, and candidate applications.
 * Verifies the request belongs to the current staff member.
 * Returns null if not found or not owned.
 */
export async function getStaffRequestDetail(
  params: z.input<typeof getStaffRequestDetailSchema>,
): Promise<StaffRequestDetail | null> {
  const session = await requireRoleCapability("staff", "request.read.assigned");

  const parsed = getStaffRequestDetailSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { requestUuid } = parsed.data;
  const staffId = Number(session.id);

  const request = await prisma.request.findFirst({
    where: {
      request_uuid: requestUuid,
      staff_id: staffId,
    },
    select: {
      request_uuid: true,
      request_position_title: true,
      request_job_description: true,
      request_compensation: true,
      request_number_of_employees: true,
      request_location: true,
      request_status: true,
      request_priority: true,
      request_assigned_at: true,
      request_started_at: true,
      request_finished_at: true,
      request_updated_datetime: true,
      request_created_datetime: true,
      company: {
        select: {
          company_id: true,
          company_name: true,
          company_email: true,
        },
      },
      contact: {
        select: {
          contact_name: true,
          contact_email: true,
        },
      },
      staff: {
        select: {
          staff_name: true,
          staff_email: true,
        },
      },
      request_application: {
        orderBy: { created_at: "desc" },
        take: 50,
        select: {
          application_uuid: true,
          status: true,
          created_at: true,
          candidate: {
            select: {
              candidate_id: true,
              candidate_name: true,
              candidate_email: true,
            },
          },
        },
      },
    },
  });

  if (!request) return null;

  const detailResult = {
    requestUuid: request.request_uuid,
    positionTitle: request.request_position_title,
    jobDescription: request.request_job_description,
    compensation: request.request_compensation,
    seats: request.request_number_of_employees ?? 0,
    location: request.request_location,
    status: request.request_status,
    priority: request.request_priority,
    assignedAt: request.request_assigned_at,
    startedAt: request.request_started_at,
    finishedAt: request.request_finished_at,
    updatedAt: request.request_updated_datetime,
    createdAt: request.request_created_datetime,
    company: request.company,
    contact: request.contact,
    staff: request.staff,
    candidates: (request.request_application ?? []).map((app) => ({
      uuid: app.application_uuid,
      name: app.candidate?.candidate_name ?? null,
      email: app.candidate?.candidate_email ?? null,
      applicationStatus: app.status,
      appliedAt: app.created_at,
    })),
  };

  // Validate output shape
  const outputParsed = staffRequestDetailOutputSchema.safeParse(detailResult);
  if (!outputParsed.success) {
    console.error(
      "[staff/requests] getStaffRequestDetail output validation failed:",
      outputParsed.error.issues,
    );
  }

  return detailResult;
}

// ---------------------------------------------------------------------------
// updateRequestStatus — update the status of a staff request
// ---------------------------------------------------------------------------

/**
 * Update the status of a staff request (pending → started → delivered).
 * Verifies the request belongs to the current staff member.
 * Automatically sets started_at / finished_at timestamps.
 * Revalidates the /staff/requests path on success.
 */
export async function updateRequestStatus(
  params: z.input<typeof updateRequestStatusSchema>,
): Promise<UpdateRequestStatusResult> {
  const session = await requireRoleCapability("staff", "request.read.assigned");

  const parsed = updateRequestStatusSchema.safeParse(params);
  if (!parsed.success) {
    return {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { requestUuid, status, feedback } = parsed.data;
  const staffId = Number(session.id);

  // Verify the request exists and belongs to this staff member
  const existing = await prisma.request.findFirst({
    where: {
      request_uuid: requestUuid,
      staff_id: staffId,
    },
    select: { request_uuid: true, request_status: true },
  });

  if (!existing) {
    return {
      operation: "error",
      message: "Request not found",
    };
  }

  // Build update payload with appropriate timestamps
  const now = new Date();
  const updateData: Record<string, unknown> = {
    request_status: status,
    request_updated_datetime: now,
  };

  if (status === "started" && existing.request_status === "pending") {
    updateData.request_started_at = now;
  }

  if (status === "delivered") {
    updateData.request_finished_at = now;
    if (feedback) {
      updateData.request_feedback = feedback;
    }
  }

  try {
    await prisma.request.update({
      where: { request_uuid: requestUuid },
      data: updateData as any,
    });

    revalidatePath("/staff/requests");

    return {
      operation: "success",
      message: `Request status updated to "${status}"`,
    };
  } catch (err) {
    return {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update request status",
    };
  }
}
