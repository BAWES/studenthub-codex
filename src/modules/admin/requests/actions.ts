"use server";

// ---------------------------------------------------------------------------
// Admin RequestController — server actions (module level)
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/RequestController.php
//
// Actions:
//   - listRequests         — paginated list of all requests with filters
//   - getRequest           — single request detail with applications,
//                            invitations, and interviews
//   - updateRequestStatus  — update request status with timestamps
//   - approveRequest       — approve a pending request (→ started)
//   - rejectRequest        — reject a request with reason (→ cancelled)
//   - closeRequest         — close a request with resolution (→ delivered)
//
// Status enum: pending, started, delivered, cancelled, finished_by_recruitment,
//              re_work
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listRequestsSchema,
  getRequestSchema,
  updateRequestStatusSchema,
  approveRequestSchema,
  rejectRequestSchema,
  closeRequestSchema,
  listRequestsOutputSchema,
  getRequestOutputSchema,
  updateRequestStatusOutputSchema,
  approveRequestOutputSchema,
  rejectRequestOutputSchema,
  closeRequestOutputSchema,
  type ListRequestsInput,
  type GetRequestInput,
  type UpdateRequestStatusInput,
  type ApproveRequestInput,
  type RejectRequestInput,
  type CloseRequestInput,
  type RequestActionResponse,
  type RequestRow,
  type RequestDetail,
  type UpdateRequestStatusResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listRequests
// ---------------------------------------------------------------------------

/**
 * List all requests with pagination, search, and status filtering.
 */
export async function listRequests(
  input: ListRequestsInput = {},
): Promise<{
  items: RequestRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("request.read.any");

  const parsed = listRequestsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, companyId, status, q } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (companyId !== undefined) where.company_id = companyId;
  if (status !== undefined) where.request_status = status;
  if (q && q.trim().length > 0) {
    where.OR = [
      { request_position_title: { contains: q.trim() } },
      { request_job_description: { contains: q.trim() } },
    ];
  }

  const [requests, total] = await Promise.all([
    prisma.request.findMany({
      where: where as any,
      orderBy: { request_created_datetime: "desc" },
      skip,
      take: limit,
      include: {
        company: { select: { company_name: true } },
        staff: { select: { staff_name: true } },
      },
    }),
    prisma.request.count({ where: where as any }),
  ]);

  const result = {
    items: requests.map((r: any): RequestRow => ({
      request_uuid: r.request_uuid,
      title: r.request_position_title ?? "Untitled request",
      company_name: r.company?.company_name ?? null,
      staff_name: r.staff?.staff_name ?? null,
      position_type: r.request_position_type?.toString() ?? "—",
      no_of_employees: r.request_number_of_employees ?? null,
      status: r.request_status ?? "pending",
      priority: r.request_priority ?? null,
      created_at: r.request_created_datetime?.toISOString() ?? null,
      updated_at: r.request_updated_datetime?.toISOString() ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listRequestsOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/requests] listRequests output failed:", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getRequest
// ---------------------------------------------------------------------------

/**
 * Get a single request with applications, invitations, and interviews.
 */
export async function getRequest(
  requestUuid: string,
): Promise<RequestDetail> {
  await requireCapability("request.read.any");

  const parsed = getRequestSchema.safeParse({ requestUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid request UUID");
  }

  const request = await prisma.request.findFirst({
    where: { request_uuid: parsed.data.requestUuid },
    include: {
      company: { select: { company_name: true, company_email: true } },
      staff: { select: { staff_name: true, staff_email: true } },
      request_application: {
        include: {
          candidate: {
            select: {
              candidate_name: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      },
      invitation: {
        include: {
          candidate: {
            select: {
              candidate_name: true,
            },
          },
        },
        orderBy: { invitation_created_at: "desc" },
      },
      request_interview: {
        include: {
          candidate: {
            select: {
              candidate_name: true,
            },
          },
        },
        orderBy: { interview_at: "desc" },
      },
    },
  });

  if (!request) {
    const result = {
      request: null,
      applications: [],
      invitations: [],
      interviews: [],
      metrics: [],
    };

    // Validate output shape
    const outputParsed = getRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] getRequest (not found) output failed:", outputParsed.error.issues);
    }

    return result;
  }

  const r = request as any;

  const applications = (r.request_application ?? []).map((a: any) => ({
    application_uuid: a.application_uuid,
    candidate_name: a.candidate
      ? a.candidate.candidate_name ?? null
      : null,
    status: a.status ?? null,
    created_at: a.created_at?.toISOString() ?? null,
  }));

  const invitations = (r.invitation ?? []).map((inv: any) => ({
    invitation_uuid: inv.invitation_uuid,
    candidate_name: inv.candidate
      ? inv.candidate.candidate_name ?? null
      : null,
    status: inv.invitation_status ?? null,
    created_at: inv.invitation_created_at?.toISOString() ?? null,
  }));

  const interviews = (r.request_interview ?? []).map((ri: any) => ({
    request_interview_uuid: ri.request_interview_uuid,
    candidate_name: ri.candidate
      ? ri.candidate.candidate_name ?? null
      : null,
    interview_at: ri.interview_at?.toISOString() ?? null,
    status: ri.status ?? null,
  }));

  const metrics = [
    { label: "Applications", value: applications.length, note: "Candidates applied" },
    { label: "Invitations", value: invitations.length, note: "Candidates invited" },
    { label: "Interviews", value: interviews.length, note: "Scheduled" },
    { label: "Status", value: r.request_status ?? "pending", note: r.request_priority ? `Priority: ${r.request_priority}` : "" },
  ];

  const result = {
    request: {
      request_uuid: r.request_uuid,
      request_position_title: r.request_position_title ?? null,
      request_job_description: r.request_job_description,
      request_compensation: r.request_compensation,
      request_status: r.request_status ?? null,
      request_feedback: r.request_feedback ?? null,
      request_priority: r.request_priority ?? null,
      request_started_at: r.request_started_at?.toISOString() ?? null,
      request_finished_at: r.request_finished_at?.toISOString() ?? null,
      request_created_datetime: r.request_created_datetime?.toISOString() ?? null,
      request_updated_datetime: r.request_updated_datetime?.toISOString() ?? null,
      company: r.company
        ? { company_name: r.company.company_name, company_email: r.company.company_email }
        : null,
      staff: r.staff
        ? { staff_name: r.staff.staff_name, staff_email: r.staff.staff_email }
        : null,
    },
    applications,
    invitations,
    interviews,
    metrics,
  };

  // Validate output shape
  const outputParsed = getRequestOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[admin/requests] getRequest output failed:", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateRequestStatus
// ---------------------------------------------------------------------------

/**
 * Update a request's status with appropriate timestamps.
 * Mirrors the staff updateRequestStatus pattern with admin capability.
 *
 * - started       → sets request_started_at
 * - delivered     → sets request_finished_at + optional feedback
 * - cancelled     → sets request_cancelled_at
 * - re_work       → sets request_re_worked_at
 * - finished_by_recruitment → sets request_finished_at
 */
export async function updateRequestStatus(
  input: UpdateRequestStatusInput,
): Promise<UpdateRequestStatusResult> {
  await requireCapability("request.write.any");

  const parsed = updateRequestStatusSchema.safeParse(input);
  if (!parsed.success) {
    const result: UpdateRequestStatusResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };

    // Validate output shape
    const outputParsed = updateRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] updateRequestStatus output failed:", outputParsed.error.issues);
    }

    return result;
  }

  const { requestUuid, status, feedback } = parsed.data;

  // Verify the request exists
  const existing = await prisma.request.findUnique({
    where: { request_uuid: requestUuid },
    select: { request_uuid: true, request_status: true },
  });

  if (!existing) {
    const result: UpdateRequestStatusResult = { operation: "error", message: "Request not found" };

    // Validate output shape
    const outputParsed = updateRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] updateRequestStatus output failed:", outputParsed.error.issues);
    }

    return result;
  }

  const now = new Date();
  const updateData: Record<string, unknown> = {
    request_status: status,
    request_updated_datetime: now,
  };

  // Set appropriate timestamps based on transition
  if (status === "started") {
    updateData.request_started_at = now;
  } else if (status === "delivered") {
    updateData.request_finished_at = now;
    updateData.request_delivered_at = now;
    if (feedback) {
      updateData.request_feedback = feedback;
    }
  } else if (status === "cancelled") {
    updateData.request_cancelled_at = now;
  } else if (status === "re_work") {
    updateData.request_re_worked_at = now;
  } else if (status === "finished_by_recruitment") {
    updateData.request_finished_at = now;
  }

  try {
    await prisma.request.update({
      where: { request_uuid: requestUuid },
      data: updateData as any,
    });

    revalidatePath("/admin/requests");

    const result: UpdateRequestStatusResult = {
      operation: "success",
      message: `Request status updated to "${status}"`,
    };

    // Validate output shape
    const outputParsed = updateRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] updateRequestStatus output failed:", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    const result: UpdateRequestStatusResult = {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update request status",
    };

    // Validate output shape
    const outputParsed = updateRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] updateRequestStatus output failed:", outputParsed.error.issues);
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// approveRequest
// ---------------------------------------------------------------------------

/**
 * Approve a request. Sets status to "started" with a reason.
 */
export async function approveRequest(
  input: ApproveRequestInput,
): Promise<RequestActionResponse> {
  await requireCapability("request.write.any");

  const parsed = approveRequestSchema.safeParse(input);
  if (!parsed.success) {
    const result: RequestActionResponse = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };

    // Validate output shape
    const outputParsed = approveRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] approveRequest output failed:", outputParsed.error.issues);
    }

    return result;
  }

  const existing = await prisma.request.findUnique({
    where: { request_uuid: parsed.data.requestUuid },
    select: { request_uuid: true, request_status: true },
  });

  if (!existing) {
    const result: RequestActionResponse = { operation: "error", message: "Request not found" };

    // Validate output shape
    const outputParsed = approveRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] approveRequest output failed:", outputParsed.error.issues);
    }

    return result;
  }

  if (existing.request_status !== "pending") {
    const result: RequestActionResponse = {
      operation: "error",
      message: `Request cannot be approved in current status (${existing.request_status}). Expected status: pending.`,
    };

    // Validate output shape
    const outputParsed = approveRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] approveRequest output failed:", outputParsed.error.issues);
    }

    return result;
  }

  const now = new Date();

  try {
    await prisma.request.update({
      where: { request_uuid: parsed.data.requestUuid },
      data: {
        request_status: "started",
        request_started_at: now,
        request_updated_datetime: now,
        request_feedback: parsed.data.reason,
      },
    });

    revalidatePath("/admin/requests");

    const result: RequestActionResponse = {
      operation: "success",
      message: `Request approved: ${parsed.data.reason}`,
    };

    // Validate output shape
    const outputParsed = approveRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] approveRequest output failed:", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    const result: RequestActionResponse = {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to approve request",
    };

    // Validate output shape
    const outputParsed = approveRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] approveRequest output failed:", outputParsed.error.issues);
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// rejectRequest
// ---------------------------------------------------------------------------

/**
 * Reject a request. Sets status to "cancelled" with a reason.
 */
export async function rejectRequest(
  input: RejectRequestInput,
): Promise<RequestActionResponse> {
  await requireCapability("request.write.any");

  const parsed = rejectRequestSchema.safeParse(input);
  if (!parsed.success) {
    const result: RequestActionResponse = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };

    // Validate output shape
    const outputParsed = rejectRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] rejectRequest output failed:", outputParsed.error.issues);
    }

    return result;
  }

  const existing = await prisma.request.findUnique({
    where: { request_uuid: parsed.data.requestUuid },
    select: { request_uuid: true, request_status: true },
  });

  if (!existing) {
    const result: RequestActionResponse = { operation: "error", message: "Request not found" };

    // Validate output shape
    const outputParsed = rejectRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] rejectRequest output failed:", outputParsed.error.issues);
    }

    return result;
  }

  if (existing.request_status === "delivered" || existing.request_status === "cancelled") {
    const result: RequestActionResponse = {
      operation: "error",
      message: `Cannot reject a request with status "${existing.request_status}".`,
    };

    // Validate output shape
    const outputParsed = rejectRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] rejectRequest output failed:", outputParsed.error.issues);
    }

    return result;
  }

  const now = new Date();

  try {
    await prisma.request.update({
      where: { request_uuid: parsed.data.requestUuid },
      data: {
        request_status: "cancelled",
        request_cancelled_at: now,
        request_updated_datetime: now,
        request_feedback: parsed.data.reason,
      },
    });

    revalidatePath("/admin/requests");

    const result: RequestActionResponse = {
      operation: "success",
      message: `Request rejected: ${parsed.data.reason}`,
    };

    // Validate output shape
    const outputParsed = rejectRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] rejectRequest output failed:", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    const result: RequestActionResponse = {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to reject request",
    };

    // Validate output shape
    const outputParsed = rejectRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] rejectRequest output failed:", outputParsed.error.issues);
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// closeRequest
// ---------------------------------------------------------------------------

/**
 * Close a request. Sets status to "delivered" with a resolution.
 */
export async function closeRequest(
  input: CloseRequestInput,
): Promise<RequestActionResponse> {
  await requireCapability("request.write.any");

  const parsed = closeRequestSchema.safeParse(input);
  if (!parsed.success) {
    const result: RequestActionResponse = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };

    // Validate output shape
    const outputParsed = closeRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] closeRequest output failed:", outputParsed.error.issues);
    }

    return result;
  }

  const existing = await prisma.request.findUnique({
    where: { request_uuid: parsed.data.requestUuid },
    select: { request_uuid: true, request_status: true },
  });

  if (!existing) {
    const result: RequestActionResponse = { operation: "error", message: "Request not found" };

    // Validate output shape
    const outputParsed = closeRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] closeRequest output failed:", outputParsed.error.issues);
    }

    return result;
  }

  if (existing.request_status === "delivered" || existing.request_status === "cancelled") {
    const result: RequestActionResponse = {
      operation: "error",
      message: `Cannot close a request with status "${existing.request_status}".`,
    };

    // Validate output shape
    const outputParsed = closeRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] closeRequest output failed:", outputParsed.error.issues);
    }

    return result;
  }

  const now = new Date();

  try {
    await prisma.request.update({
      where: { request_uuid: parsed.data.requestUuid },
      data: {
        request_status: "delivered",
        request_finished_at: now,
        request_delivered_at: now,
        request_updated_datetime: now,
        request_feedback: parsed.data.resolution,
      },
    });

    revalidatePath("/admin/requests");

    const result: RequestActionResponse = {
      operation: "success",
      message: `Request closed: ${parsed.data.resolution}`,
    };

    // Validate output shape
    const outputParsed = closeRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] closeRequest output failed:", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    const result: RequestActionResponse = {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to close request",
    };

    // Validate output shape
    const outputParsed = closeRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error("[admin/requests] closeRequest output failed:", outputParsed.error.issues);
    }

    return result;
  }
}
