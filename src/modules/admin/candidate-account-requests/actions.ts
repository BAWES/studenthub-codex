"use server";

// ---------------------------------------------------------------------------
// Admin CandidateIdRequest — server actions (module level)
// ---------------------------------------------------------------------------
// DB table: candidate_id_request
// PK:       cir_uuid (String @db.Char(60))
// Fields:   candidate_ids (Text), status (VarChar: pending/approved/rejected),
//           rejection_reason (Text), created_by (Int), updated_by (Int),
//           created_at (DateTime), updated_at (DateTime)
//
// Prisma model: candidate_id_request (auto-generated from schema)
// Relations:
//   - staff_candidate_id_request_created_byTostaff: staff?
//   - staff_candidate_id_request_updated_byTostaff: staff?
//
// Actions:
//   - listCandidateIdRequests       — paginated list with optional status filter
//   - getCandidateIdRequest         — single request detail
//   - updateCandidateIdRequestStatus — update status (pending/approved/rejected)
//
// Capabilities: admin.read, admin.write (same pattern as admin/employees)
// Status enum: pending, approved, rejected (varchar)
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCandidateIdRequestsSchema,
  getCandidateIdRequestSchema,
  updateCandidateIdRequestStatusSchema,
  listCandidateIdRequestsOutputSchema,
  getCandidateIdRequestOutputSchema,
  updateCandidateIdRequestStatusOutputSchema,
  type ListCandidateIdRequestsInput,
  type GetCandidateIdRequestInput,
  type UpdateCandidateIdRequestStatusInput,
  type CandidateIdRequestRow,
  type CandidateIdRequestDetail,
  type UpdateCandidateIdRequestStatusResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/admin/candidate-account-requests] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_id_request row to the shared row shape. */
function toRow(r: any): CandidateIdRequestRow {
  return {
    cir_uuid: r.cir_uuid,
    candidate_ids: r.candidate_ids ?? null,
    status: r.status ?? null,
    rejection_reason: r.rejection_reason ?? null,
    created_by_name: r.staff_candidate_id_request_created_byTostaff?.staff_name ?? null,
    updated_by_name: r.staff_candidate_id_request_updated_byTostaff?.staff_name ?? null,
    created_at: r.created_at?.toISOString() ?? null,
    updated_at: r.updated_at?.toISOString() ?? null,
  };
}

// ---------------------------------------------------------------------------
// listCandidateIdRequests
// ---------------------------------------------------------------------------

/**
 * List all candidate ID requests with pagination and optional status filter.
 * Requires admin.read capability.
 */
export async function listCandidateIdRequests(
  input: ListCandidateIdRequestsInput = {},
): Promise<{
  items: CandidateIdRequestRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("admin.read");

  const parsed = listCandidateIdRequestsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, status } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status !== undefined) where.status = status;

  const [rows, total] = await Promise.all([
    prisma.candidate_id_request.findMany({
      where: where as any,
      orderBy: [{ created_at: { sort: "desc", nulls: "last" } }],
      skip,
      take: limit,
      include: {
        staff_candidate_id_request_created_byTostaff: { select: { staff_name: true } },
        staff_candidate_id_request_updated_byTostaff: { select: { staff_name: true } },
      },
    }),
    prisma.candidate_id_request.count({ where: where as any }),
  ]);

  const result = {
    items: rows.map(toRow),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listCandidateIdRequestsOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCandidateIdRequests", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCandidateIdRequest
// ---------------------------------------------------------------------------

/**
 * Get a single candidate ID request by UUID with staff info.
 * Requires admin.read capability.
 */
export async function getCandidateIdRequest(
  cirUuid: string,
): Promise<CandidateIdRequestDetail> {
  await requireCapability("admin.read");

  const parsed = getCandidateIdRequestSchema.safeParse({ cirUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid CIR UUID");
  }

  const row = await prisma.candidate_id_request.findFirst({
    where: { cir_uuid: parsed.data.cirUuid },
    include: {
      staff_candidate_id_request_created_byTostaff: { select: { staff_name: true } },
      staff_candidate_id_request_updated_byTostaff: { select: { staff_name: true } },
    },
  });

  if (!row) {
    const result = { request: null };

    const outputParsed = getCandidateIdRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("getCandidateIdRequest", outputParsed.error.issues);
    }

    return result;
  }

  const result = {
    request: toRow(row),
  };

  const outputParsed = getCandidateIdRequestOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("getCandidateIdRequest", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateCandidateIdRequestStatus
// ---------------------------------------------------------------------------

/**
 * Update a candidate ID request's status (pending <-> approved <-> rejected).
 * Requires admin.write capability.
 *
 * - "pending"  → pending
 * - "approved" → approved
 * - "rejected" → rejected (optionally with rejection_reason)
 */
export async function updateCandidateIdRequestStatus(
  input: UpdateCandidateIdRequestStatusInput,
): Promise<UpdateCandidateIdRequestStatusResult> {
  await requireCapability("admin.write");

  const parsed = updateCandidateIdRequestStatusSchema.safeParse(input);
  if (!parsed.success) {
    const result: UpdateCandidateIdRequestStatusResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };

    const outputParsed = updateCandidateIdRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("updateCandidateIdRequestStatus", outputParsed.error.issues);
    }

    return result;
  }

  const { cirUuid, status, rejectionReason } = parsed.data;

  // Verify the request exists
  const existing = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: cirUuid },
    select: { cir_uuid: true, status: true },
  });

  if (!existing) {
    const result: UpdateCandidateIdRequestStatusResult = {
      operation: "error",
      message: "Candidate ID request not found",
    };

    const outputParsed = updateCandidateIdRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("updateCandidateIdRequestStatus", outputParsed.error.issues);
    }

    return result;
  }

  try {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date(),
    };

    // If rejecting, store the rejection reason
    if (status === "rejected" && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    await prisma.candidate_id_request.update({
      where: { cir_uuid: cirUuid },
      data: updateData as any,
    });

    revalidatePath("/admin/candidate-account-requests");

    const result: UpdateCandidateIdRequestStatusResult = {
      operation: "success",
      message: `Candidate ID request status updated to "${status}"`,
    };

    const outputParsed = updateCandidateIdRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("updateCandidateIdRequestStatus", outputParsed.error.issues);
    }

    return result;
  } catch (err) {
    const result: UpdateCandidateIdRequestStatusResult = {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update candidate ID request status",
    };

    const outputParsed = updateCandidateIdRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("updateCandidateIdRequestStatus", outputParsed.error.issues);
    }

    return result;
  }
}
