"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  candidateIdRequestItemSchema,
  deleteIdRequestSchema,
  getIdRequestSchema,
  idRequestMutationResultSchema,
  listIdRequestsResultSchema,
  listIdRequestsSchema,
  regenerateIdRequestSchema,
} from "./schemas";
import type {
  CandidateIdRequestItem,
  IdRequestMutationResult,
  ListIdRequestsResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// CandidateIdRequestController — list/get/regenerate/delete ID requests
// ---------------------------------------------------------------------------
// Ported from Yii2 staff/modules/v1/controllers/CandidateIdRequestController.php
// Actions: listIdRequests, getIdRequest, regenerateIdRequest, deleteIdRequest
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListIdRequestsParams = z.input<typeof listIdRequestsSchema>;
export type GetIdRequestParams = z.input<typeof getIdRequestSchema>;
export type RegenerateIdRequestParams = z.input<typeof regenerateIdRequestSchema>;
export type DeleteIdRequestParams = z.input<typeof deleteIdRequestSchema>;

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List candidate ID requests with pagination.
 * Mirrors the legacy CandidateIdRequestController::actionList.
 */
export async function listIdRequests(
  params: ListIdRequestsParams = {},
): Promise<ListIdRequestsResult> {
  await requireCapability("admin.read");

  const parsed = listIdRequestsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { page, limit } = parsed.data;

  const [requests, total] = await Promise.all([
    prisma.candidate_id_request.findMany({
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.candidate_id_request.count(),
  ]);

  const result: ListIdRequestsResult = {
    requests: requests.map((r) => ({
      cir_uuid: r.cir_uuid,
      candidate_ids: r.candidate_ids,
      status: r.status,
      rejection_reason: r.rejection_reason,
      created_at: r.created_at?.toISOString() ?? null,
      updated_at: r.updated_at?.toISOString() ?? null,
      created_by: r.created_by,
      updated_by: r.updated_by,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listIdRequestsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-id-requests] listIdRequests output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single candidate ID request by UUID.
 * Mirrors the legacy CandidateIdRequestController::actionView.
 */
export async function getIdRequest(
  params: GetIdRequestParams,
): Promise<CandidateIdRequestItem | null> {
  await requireCapability("admin.read");

  const parsed = getIdRequestSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid ID request UUID",
    );
  }

  const { uuid } = parsed.data;

  const request = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: uuid },
  });

  if (!request) return null;

  const itemResult: CandidateIdRequestItem = {
    cir_uuid: request.cir_uuid,
    candidate_ids: request.candidate_ids,
    status: request.status,
    rejection_reason: request.rejection_reason,
    created_at: request.created_at?.toISOString() ?? null,
    updated_at: request.updated_at?.toISOString() ?? null,
    created_by: request.created_by,
    updated_by: request.updated_by,
  };

  const outputParsed = candidateIdRequestItemSchema.safeParse(itemResult);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-id-requests] getIdRequest output validation failed:",
      outputParsed.error.issues,
    );
  }

  return itemResult;
}

/**
 * Regenerate a candidate ID request (reset status to pending).
 * Mirrors the legacy CandidateIdRequestController::actionRegenerate.
 */
export async function regenerateIdRequest(
  params: RegenerateIdRequestParams,
): Promise<IdRequestMutationResult> {
  await requireCapability("admin.write");

  const parsed = regenerateIdRequestSchema.safeParse(params);
  if (!parsed.success) {
    const errorResult: IdRequestMutationResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid ID request UUID",
    };

    const parsed2 = idRequestMutationResultSchema.safeParse(errorResult);
    if (!parsed2.success) {
      console.error(
        "[modules/candidate-id-requests] regenerateIdRequest output validation failed:",
        parsed2.error.issues,
      );
    }

    return errorResult;
  }

  const { uuid } = parsed.data;

  const existing = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: uuid },
  });

  if (!existing) {
    const notFoundResult: IdRequestMutationResult = {
      operation: "error",
      message: "ID request not found",
    };

    const parsed2 = idRequestMutationResultSchema.safeParse(notFoundResult);
    if (!parsed2.success) {
      console.error(
        "[modules/candidate-id-requests] regenerateIdRequest output validation failed:",
        parsed2.error.issues,
      );
    }

    return notFoundResult;
  }

  try {
    await prisma.candidate_id_request.update({
      where: { cir_uuid: uuid },
      data: {
        status: "pending",
      },
    });

    const successResult: IdRequestMutationResult = { operation: "success" };

    const parsed2 = idRequestMutationResultSchema.safeParse(successResult);
    if (!parsed2.success) {
      console.error(
        "[modules/candidate-id-requests] regenerateIdRequest output validation failed:",
        parsed2.error.issues,
      );
    }

    return successResult;
  } catch (err) {
    const catchResult: IdRequestMutationResult = {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to regenerate ID request",
    };

    const parsed2 = idRequestMutationResultSchema.safeParse(catchResult);
    if (!parsed2.success) {
      console.error(
        "[modules/candidate-id-requests] regenerateIdRequest output validation failed:",
        parsed2.error.issues,
      );
    }

    return catchResult;
  }
}

/**
 * Delete a candidate ID request.
 * Mirrors the legacy CandidateIdRequestController::actionDelete.
 */
export async function deleteIdRequest(
  params: DeleteIdRequestParams,
): Promise<IdRequestMutationResult> {
  await requireCapability("admin.write");

  const parsed = deleteIdRequestSchema.safeParse(params);
  if (!parsed.success) {
    const errorResult: IdRequestMutationResult = {
      operation: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid ID request UUID",
    };

    const parsed2 = idRequestMutationResultSchema.safeParse(errorResult);
    if (!parsed2.success) {
      console.error(
        "[modules/candidate-id-requests] deleteIdRequest output validation failed:",
        parsed2.error.issues,
      );
    }

    return errorResult;
  }

  const { uuid } = parsed.data;

  const existing = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: uuid },
  });

  if (!existing) {
    const notFoundResult: IdRequestMutationResult = {
      operation: "error",
      message: "ID request not found",
    };

    const parsed2 = idRequestMutationResultSchema.safeParse(notFoundResult);
    if (!parsed2.success) {
      console.error(
        "[modules/candidate-id-requests] deleteIdRequest output validation failed:",
        parsed2.error.issues,
      );
    }

    return notFoundResult;
  }

  try {
    await prisma.candidate_id_request.delete({
      where: { cir_uuid: uuid },
    });

    const successResult: IdRequestMutationResult = { operation: "success" };

    const parsed2 = idRequestMutationResultSchema.safeParse(successResult);
    if (!parsed2.success) {
      console.error(
        "[modules/candidate-id-requests] deleteIdRequest output validation failed:",
        parsed2.error.issues,
      );
    }

    return successResult;
  } catch (err) {
    const catchResult: IdRequestMutationResult = {
      operation: "error",
      message: err instanceof Error ? err.message : "Failed to delete ID request",
    };

    const parsed2 = idRequestMutationResultSchema.safeParse(catchResult);
    if (!parsed2.success) {
      console.error(
        "[modules/candidate-id-requests] deleteIdRequest output validation failed:",
        parsed2.error.issues,
      );
    }

    return catchResult;
  }
}
