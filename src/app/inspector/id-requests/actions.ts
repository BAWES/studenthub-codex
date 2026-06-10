"use server";

import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import {
  listIdRequestsSchema,
  getIdRequestSchema,
  type ListIdRequestsInput,
  type GetIdRequestInput,
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
  await requireRoleCapability("inspector", "id_review.read");

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

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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
  await requireRoleCapability("inspector", "id_review.read");

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

  return {
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
        value: formatDate(request.updated_at),
        note: request.staff_candidate_id_request_updated_byTostaff?.staff_name ?? "System",
      },
    ],
    candidates: candidates.map((candidate) => ({
      id: candidate.candidate_id,
      title: candidate.candidate_name ?? "Unknown",
      subtitle: candidate.candidate_email ?? "No email",
      meta: `${candidate.candidate_civil_need_verification ? "Needs verification" : "No flag"} · expires ${formatDate(candidate.candidate_civil_expiry_date)}`,
    })),
  };
}
