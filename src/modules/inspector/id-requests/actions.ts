"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listIdRequestsSchema,
  getIdRequestSchema,
  updateIdRequestStatusSchema,
  approveIdRequestSchema,
  rejectIdRequestSchema,
  listIdRequestsResultSchema,
  idRequestDetailSchema,
  type ListIdRequestsInput,
  type GetIdRequestInput,
  type UpdateIdRequestStatusInput,
  type ApproveIdRequestInput,
  type RejectIdRequestInput,
  type IdRequestRow,
  type IdRequestDetail,
  type ListIdRequestsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listIdRequests — paginated list of candidate ID verification requests
// ---------------------------------------------------------------------------

/**
 * List candidate ID verification requests for the inspector view.
 * Supports pagination, status filtering, and search by request UUID.
 * Maps to the legacy Yii2 InspectorController action for candidate_id_request.
 * Ordered by created_at descending (newest first).
 */
export async function listIdRequests(
  params: ListIdRequestsInput = {},
): Promise<ListIdRequestsResult> {
  await requireCapability("id_review.read");

  const parsed = listIdRequestsSchema.safeParse(params);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page = 1, limit = 20, q, status } = parsed.data;
  const skip = (page - 1) * limit;

  // Build Prisma where clause
  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (q && q.trim().length > 0) {
    where.cir_uuid = { contains: q.trim() };
  }

  const [rows, total] = await Promise.all([
    prisma.candidate_id_request.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      select: {
        cir_uuid: true,
        candidate_ids: true,
        status: true,
        rejection_reason: true,
        created_at: true,
        updated_at: true,
        staff_candidate_id_request_created_byTostaff: {
          select: { staff_name: true },
        },
        staff_candidate_id_request_updated_byTostaff: {
          select: { staff_name: true },
        },
      },
    }),
    prisma.candidate_id_request.count({ where: where as any }),
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

  const items: IdRequestRow[] = rows.map((row) => ({
    id: row.cir_uuid,
    request: row.cir_uuid.slice(0, 18),
    candidates: row.candidate_ids
      ? row.candidate_ids.split(",").filter(Boolean).length
      : 0,
    status: row.status ?? "pending",
    createdBy:
      row.staff_candidate_id_request_created_byTostaff?.staff_name ?? "System",
    updatedBy:
      row.staff_candidate_id_request_updated_byTostaff?.staff_name ?? "System",
    created: formatDate(row.created_at),
    updated: formatDate(row.updated_at),
  }));

  const result = {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Output validation — log mismatches without throwing
  const outputParsed = listIdRequestsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/inspector/id-requests] listIdRequests output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getIdRequest — get a single candidate ID verification request by UUID
// ---------------------------------------------------------------------------

function parseCandidateIds(value: string | null | undefined): number[] {
  if (!value) return [];
  return value
    .split(/[^0-9]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

/**
 * Get detailed information about a single candidate ID verification request.
 * Includes metrics and matched candidate records.
 * Returns null if not found.
 */
export async function getIdRequest(
  params: GetIdRequestInput,
): Promise<IdRequestDetail | null> {
  await requireCapability("id_review.read");

  const parsed = getIdRequestSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid request ID");
  }

  const { id } = parsed.data;

  const request = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: id },
    select: {
      cir_uuid: true,
      candidate_ids: true,
      status: true,
      rejection_reason: true,
      created_at: true,
      updated_at: true,
      staff_candidate_id_request_created_byTostaff: {
        select: { staff_name: true },
      },
      staff_candidate_id_request_updated_byTostaff: {
        select: { staff_name: true },
      },
    },
  });

  if (!request) return null;

  const candidateIds = parseCandidateIds(request.candidate_ids);
  const candidates = candidateIds.length
    ? await prisma.candidate.findMany({
        where: { candidate_id: { in: candidateIds } },
        select: {
          candidate_id: true,
          candidate_name: true,
          candidate_email: true,
          candidate_civil_need_verification: true,
          candidate_civil_expiry_date: true,
          candidate_status: true,
          approved: true,
        },
      })
    : [];

  const result = {
    cir_uuid: request.cir_uuid,
    status: request.status,
    rejection_reason: request.rejection_reason,
    candidate_ids: request.candidate_ids,
    created_at: request.created_at,
    updated_at: request.updated_at,
    created_by_name:
      request.staff_candidate_id_request_created_byTostaff?.staff_name ?? null,
    updated_by_name:
      request.staff_candidate_id_request_updated_byTostaff?.staff_name ?? null,
    metrics: [
      { label: "Status", value: request.status ?? "Missing", note: "Legacy ID request status" },
      { label: "Candidates", value: candidateIds.length, note: "IDs included in this batch" },
      { label: "Matched", value: candidates.length, note: "Candidate rows found in prod clone" },
      {
        label: "Updated",
        value: request.updated_at?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) ?? "N/A",
        note: request.staff_candidate_id_request_updated_byTostaff?.staff_name ?? "System",
      },
    ],
    candidates: candidates.map((candidate) => ({
      id: candidate.candidate_id,
      title: candidate.candidate_name ?? "Unknown",
      subtitle: candidate.candidate_email ?? "No email",
      meta: `${candidate.candidate_civil_need_verification ? "Needs verification" : "No flag"} \u00b7 expires ${candidate.candidate_civil_expiry_date?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) ?? "N/A"}`,
    })),
  };

  // Output validation — log mismatches without throwing (only when not null)
  if (result !== null) {
    const outputParsed = idRequestDetailSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[modules/inspector/id-requests] getIdRequest output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// approveIdRequest — approve a pending ID verification request
// ---------------------------------------------------------------------------

/**
 * Approve a candidate ID verification request by UUID.
 * Only 'pending' requests can be approved.
 * Requires id_review.mutate capability.
 * Returns { success: true } on success, or { error: string } on failure.
 */
export async function approveIdRequest(
  params: ApproveIdRequestInput,
): Promise<{ success: true } | { error: string }> {
  await requireCapability("id_review.mutate");

  const parsed = approveIdRequestSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { id } = parsed.data;

  const existing = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: id },
    select: { cir_uuid: true, status: true },
  });

  if (!existing) {
    return { error: "ID request not found." };
  }

  if (existing.status !== "pending") {
    return {
      error: `Cannot update a request with status "${existing.status}". Only 'pending' requests can be updated.`,
    };
  }

  await prisma.candidate_id_request.update({
    where: { cir_uuid: id },
    data: {
      status: "approved",
      updated_at: new Date(),
    },
  });

  return { success: true } as const;
}

// ---------------------------------------------------------------------------
// rejectIdRequest — reject a pending ID verification request with a reason
// ---------------------------------------------------------------------------

/**
 * Reject a candidate ID verification request with a required reason.
 * Only 'pending' requests can be rejected.
 * The comment (used as rejection_reason) must be 10–500 characters.
 * Requires id_review.mutate capability.
 * Returns { success: true } on success, or { error: string } on failure.
 */
export async function rejectIdRequest(
  params: RejectIdRequestInput,
): Promise<{ success: true } | { error: string }> {
  await requireCapability("id_review.mutate");

  const parsed = rejectIdRequestSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { id, comment } = parsed.data;

  const existing = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: id },
    select: { cir_uuid: true, status: true },
  });

  if (!existing) {
    return { error: "ID request not found." };
  }

  if (existing.status !== "pending") {
    return {
      error: `Cannot update a request with status "${existing.status}". Only 'pending' requests can be updated.`,
    };
  }

  await prisma.candidate_id_request.update({
    where: { cir_uuid: id },
    data: {
      status: "rejected",
      rejection_reason: comment,
      updated_at: new Date(),
    },
  });

  return { success: true } as const;
}

// ---------------------------------------------------------------------------
// updateIdRequestStatusCore — shared mutation logic for approve/reject
// ---------------------------------------------------------------------------

async function updateIdRequestStatusCore(
  params: UpdateIdRequestStatusInput,
): Promise<{ success: true } | { error: string }> {
  await requireCapability("id_review.mutate");

  const parsed = updateIdRequestStatusSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { id, status, rejection_reason } = parsed.data;

  const existing = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: id },
    select: { cir_uuid: true, status: true },
  });

  if (!existing) {
    return { error: "ID request not found." };
  }

  if (existing.status !== "pending") {
    return {
      error: `Cannot update a request with status "${existing.status}". Only 'pending' requests can be updated.`,
    };
  }

  if (status === "rejected" && !rejection_reason) {
    return {
      error:
        "Rejection reason is required when rejecting an ID verification request.",
    };
  }

  await prisma.candidate_id_request.update({
    where: { cir_uuid: id },
    data: {
      status,
      ...(rejection_reason ? { rejection_reason } : {}),
      updated_at: new Date(),
    },
  });

  return { success: true } as const;
}
