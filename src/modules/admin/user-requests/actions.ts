"use server";

// ---------------------------------------------------------------------------
// Admin StoreAssignmentRequest — server actions (module level)
// ---------------------------------------------------------------------------
// DB table: store_assignment_request
// PK:       sar_uuid (String @db.Char(60))
// FK:       candidate_id -> candidate.candidate_id
// FK:       store_id -> store.store_id
// Fields:   currency_code, status (TinyInt 0=pending, 1=approved),
//           created_at, updated_at
//
// Prisma model: store_assignment_request (auto-generated from schema)
// Relations:
//   - candidate?: candidate @relation(fields: [candidate_id], references: [candidate_id])
//   - store?: store        @relation(fields: [store_id], references: [store_id])
//
// Actions:
//   - listStoreAssignmentRequests  — paginated list with optional filters
//   - getStoreAssignmentRequest    — single request detail
//   - updateStoreAssignmentRequestStatus — update status (pending/approved)
//
// Capabilities: admin.read, admin.write (same pattern as admin/employees)
// Status enum: pending (0), approved (1)
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listStoreAssignmentRequestsSchema,
  getStoreAssignmentRequestSchema,
  updateStoreAssignmentRequestStatusSchema,
  listStoreAssignmentRequestsOutputSchema,
  getStoreAssignmentRequestOutputSchema,
  updateStoreAssignmentRequestStatusOutputSchema,
  type ListStoreAssignmentRequestsInput,
  type GetStoreAssignmentRequestInput,
  type UpdateStoreAssignmentRequestStatusInput,
  type StoreAssignmentRequestRow,
  type StoreAssignmentRequestDetail,
  type UpdateStoreAssignmentRequestStatusResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map status enum string to TinyInt. */
function statusToInt(status: "pending" | "approved"): number {
  return status === "approved" ? 1 : 0;
}

/** Map TinyInt to status enum string. */
function intToStatus(value: number | null): string {
  if (value === 1) return "approved";
  return "pending";
}

/** Map a Prisma store_assignment_request row to the shared row shape. */
function toRow(r: any): StoreAssignmentRequestRow {
  return {
    sar_uuid: r.sar_uuid,
    candidate_id: r.candidate_id ?? null,
    candidate_name: r.candidate?.candidate_name ?? null,
    store_id: r.store_id ?? null,
    store_name: r.store?.store_name ?? null,
    currency_code: r.currency_code ?? null,
    status: r.status ?? null,
    created_at: r.created_at?.toISOString() ?? null,
    updated_at: r.updated_at?.toISOString() ?? null,
  };
}

// ---------------------------------------------------------------------------
// listStoreAssignmentRequests
// ---------------------------------------------------------------------------

/**
 * List all store assignment requests with pagination and optional filters
 * by status (pending/approved), candidate ID, or store ID.
 * Requires admin.read capability.
 */
export async function listStoreAssignmentRequests(
  input: ListStoreAssignmentRequestsInput = {},
): Promise<{
  items: StoreAssignmentRequestRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await requireCapability("admin.read");

  const parsed = listStoreAssignmentRequestsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, candidateId, storeId, status } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (candidateId !== undefined) where.candidate_id = candidateId;
  if (storeId !== undefined) where.store_id = storeId;
  if (status !== undefined) where.status = statusToInt(status);

  const [rows, total] = await Promise.all([
    prisma.store_assignment_request.findMany({
      where: where as any,
      orderBy: [{ created_at: { sort: "desc", nulls: "last" } }],
      skip,
      take: limit,
      include: {
        candidate: { select: { candidate_name: true } },
        store: { select: { store_name: true } },
      },
    }),
    prisma.store_assignment_request.count({ where: where as any }),
  ]);

  const result = {
    items: rows.map(toRow),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listStoreAssignmentRequestsOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/user-requests] listStoreAssignmentRequests output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getStoreAssignmentRequest
// ---------------------------------------------------------------------------

/**
 * Get a single store assignment request by UUID with candidate and store info.
 * Requires admin.read capability.
 */
export async function getStoreAssignmentRequest(
  sarUuid: string,
): Promise<StoreAssignmentRequestDetail> {
  await requireCapability("admin.read");

  const parsed = getStoreAssignmentRequestSchema.safeParse({ sarUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid SAR UUID");
  }

  const row = await prisma.store_assignment_request.findFirst({
    where: { sar_uuid: parsed.data.sarUuid },
    include: {
      candidate: { select: { candidate_name: true } },
      store: { select: { store_name: true } },
    },
  });

  if (!row) {
    const result = { request: null };

    const outputParsed = getStoreAssignmentRequestOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/user-requests] getStoreAssignmentRequest (not found) output failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const result = {
    request: toRow(row),
  };

  const outputParsed = getStoreAssignmentRequestOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/user-requests] getStoreAssignmentRequest output failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateStoreAssignmentRequestStatus
// ---------------------------------------------------------------------------

/**
 * Update a store assignment request's status (pending <-> approved).
 * Requires admin.write capability.
 *
 * - "pending"  → sets status = 0
 * - "approved" → sets status = 1
 */
export async function updateStoreAssignmentRequestStatus(
  input: UpdateStoreAssignmentRequestStatusInput,
): Promise<UpdateStoreAssignmentRequestStatusResult> {
  await requireCapability("admin.write");

  const parsed = updateStoreAssignmentRequestStatusSchema.safeParse(input);
  if (!parsed.success) {
    const result: UpdateStoreAssignmentRequestStatusResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };

    const outputParsed = updateStoreAssignmentRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/user-requests] updateStoreAssignmentRequestStatus output failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const { sarUuid, status } = parsed.data;
  const statusInt = statusToInt(status);

  // Verify the request exists
  const existing = await prisma.store_assignment_request.findUnique({
    where: { sar_uuid: sarUuid },
    select: { sar_uuid: true, status: true },
  });

  if (!existing) {
    const result: UpdateStoreAssignmentRequestStatusResult = {
      operation: "error",
      message: "Store assignment request not found",
    };

    const outputParsed = updateStoreAssignmentRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/user-requests] updateStoreAssignmentRequestStatus output failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  try {
    await prisma.store_assignment_request.update({
      where: { sar_uuid: sarUuid },
      data: {
        status: statusInt,
        updated_at: new Date(),
      },
    });

    revalidatePath("/admin/user-requests");

    const result: UpdateStoreAssignmentRequestStatusResult = {
      operation: "success",
      message: `Store assignment request status updated to "${status}"`,
    };

    const outputParsed = updateStoreAssignmentRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/user-requests] updateStoreAssignmentRequestStatus output failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (err) {
    const result: UpdateStoreAssignmentRequestStatusResult = {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to update store assignment request status",
    };

    const outputParsed = updateStoreAssignmentRequestStatusOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/user-requests] updateStoreAssignmentRequestStatus output failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  }
}
