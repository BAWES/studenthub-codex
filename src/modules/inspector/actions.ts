"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability, requireCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import {
  listRequestsSchema,
  getRequestSchema,
  verifyRequestSchema,
  rejectRequestSchema,
  listInspectorsSchema,
  getInspectorSchema,
  listRequestsResultSchema,
  getRequestResultSchema,
  inspectorActionResultSchema,
  listInspectorsResultSchema,
  getInspectorResultSchema,
  getInspectorWorkspaceSchema,
  inspectorWorkspaceOutputSchema,
  type ListRequestsParams,
  type GetRequestParams,
  type VerifyRequestInput,
  type RejectRequestInput,
  type ListRequestsResult,
  type ListInspectorsInput,
  type GetInspectorInput,
  type ListInspectorsResult,
  type InspectorAccountItem,
  type IdRequestDetail,
  type InspectWorkspaceResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// getInspectorWorkspace
// ---------------------------------------------------------------------------

/**
 * Get the inspector workspace data — metrics and recent ID requests.
 * Replaces the former `getInspectorWorkspace` from `@/modules/workspace/data`.
 */
export async function getInspectorWorkspace(
  inspectorUuid: string,
): Promise<InspectWorkspaceResult> {
  await requireRoleCapability("inspector", "id_review.read");

  const parsed = getInspectorWorkspaceSchema.safeParse({ inspectorUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid inspector UUID");
  }

  const [inspector, idRequests, idCards, needsVerification, recentIdRequests] =
    await prisma.$transaction([
      prisma.inspector.findUnique({
        where: { inspector_uuid: inspectorUuid },
        select: { inspector_name: true, inspector_email: true },
      }),
      prisma.candidate_id_request.count(),
      prisma.candidate_id_card.count({ where: { deleted: 0 } }),
      prisma.candidate.count({
        where: { deleted: 0, candidate_civil_need_verification: true },
      }),
      prisma.candidate_id_request.findMany({
        orderBy: { created_at: "desc" },
        take: 6,
        select: {
          cir_uuid: true,
          status: true,
          candidate_ids: true,
          created_at: true,
        },
      }),
    ]);

  const result: InspectWorkspaceResult = {
    inspector,
    metrics: [
      {
        label: "ID Requests",
        value: idRequests,
        note: "Verification request batches",
      },
      { label: "ID Cards", value: idCards, note: "Stored ID card records" },
      {
        label: "Needs Verification",
        value: needsVerification,
        note: "Candidates flagged for civil ID review",
      },
      { label: "Mode", value: "Review", note: "Inspector workspace" },
    ],
    requests: recentIdRequests.map((request) => ({
      id: request.cir_uuid,
      title: `Request ${request.cir_uuid.slice(0, 12)}`,
      subtitle: request.candidate_ids
        ? `${request.candidate_ids.length} chars of candidate ids`
        : "No candidates",
      meta: `${request.status ?? "pending"} · ${formatDate(request.created_at)}`,
    })),
  };

  // Validate output shape
  const outputParsed = inspectorWorkspaceOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/inspector] getInspectorWorkspace output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * List candidate ID verification requests with pagination and optional filters.
 * Mirrors the legacy Yii2 InspectorController for candidate_id_request records.
 */
export async function listRequests(
  params: ListRequestsParams = {},
): Promise<ListRequestsResult> {
  await requireCapability("id_review.read");

  const parsed = listRequestsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { status, dateFrom, dateTo, page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }
  if (dateFrom || dateTo) {
    const createdAt: Record<string, unknown> = {};
    if (dateFrom) {
      createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      createdAt.lte = new Date(dateTo);
    }
    where.created_at = createdAt;
  }

  const [requests, total] = await Promise.all([
    prisma.candidate_id_request.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
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
      },
    }),
    prisma.candidate_id_request.count({ where: where as any }),
  ]);

  const result: ListRequestsResult = {
    requests: requests.map((r) => ({
      cir_uuid: r.cir_uuid,
      candidate_count: r.candidate_ids
        ? r.candidate_ids.split(",").filter(Boolean).length
        : 0,
      status: r.status,
      rejection_reason: r.rejection_reason,
      created_at: r.created_at,
      updated_at: r.updated_at,
      created_by_name:
        r.staff_candidate_id_request_created_byTostaff?.staff_name ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listRequestsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/inspector] listRequests output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single ID verification request by UUID.
 */
export async function getRequest(
  params: GetRequestParams,
): Promise<IdRequestDetail | null> {
  await requireCapability("id_review.read");

  const parsed = getRequestSchema.safeParse(params);
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

  if (!request) {
    // Validate output shape (null case)
    const outputParsed = getRequestResultSchema.safeParse(null);
    if (!outputParsed.success) {
      console.error(
        "[modules/inspector] getRequest output validation failed (null):",
        outputParsed.error.issues,
      );
    }
    return null;
  }

  const result: IdRequestDetail = {
    cir_uuid: request.cir_uuid,
    status: request.status,
    rejection_reason: request.rejection_reason,
    created_at: request.created_at,
    updated_at: request.updated_at,
    created_by_name:
      request.staff_candidate_id_request_created_byTostaff?.staff_name ?? null,
    updated_by_name:
      request.staff_candidate_id_request_updated_byTostaff?.staff_name ?? null,
  };

  // Validate output shape
  const outputParsed = getRequestResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/inspector] getRequest output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Verify (approve) an ID verification request.
 * Sets status to "verified" and clears any rejection reason.
 */
export async function verifyRequest(
  input: VerifyRequestInput,
): Promise<{ success: boolean }> {
  const session = await requireCapability("id_review.mutate");

  const parsed = verifyRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid verify parameters");
  }

  const { id } = parsed.data;
  const staffId = Number(session.id);

  await prisma.candidate_id_request.update({
    where: { cir_uuid: id },
    data: {
      status: "verified",
      rejection_reason: null,
      updated_by: Number.isInteger(staffId) ? staffId : undefined,
      updated_at: new Date(),
    },
  });

  revalidatePath("/inspector/requests");

  const result = { success: true as const };

  // Validate output shape
  const outputParsed = inspectorActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/inspector] verifyRequest output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Reject an ID verification request with a reason.
 */
export async function rejectRequest(
  input: RejectRequestInput,
): Promise<{ success: boolean }> {
  const session = await requireCapability("id_review.mutate");

  const parsed = rejectRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid reject parameters");
  }

  const { id, reason } = parsed.data;
  const staffId = Number(session.id);

  await prisma.candidate_id_request.update({
    where: { cir_uuid: id },
    data: {
      status: "rejected",
      rejection_reason: reason,
      updated_by: Number.isInteger(staffId) ? staffId : undefined,
      updated_at: new Date(),
    },
  });

  revalidatePath("/inspector/requests");

  const result = { success: true as const };

  // Validate output shape
  const outputParsed = inspectorActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/inspector] rejectRequest output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Inspector account actions (STU-1292)
// ---------------------------------------------------------------------------

/**
 * List inspector accounts with pagination.
 * Excludes soft-deleted inspectors and sensitive fields (password hash,
 * auth key, reset token, IP address).
 * Mirrors the legacy Yii2 InspectorController::actionList().
 */
export async function listInspectors(
  params: ListInspectorsInput = {},
): Promise<ListInspectorsResult> {
  await requireCapability("app.access");

  const parsed = listInspectorsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { page, limit } = parsed.data;

  const where: Prisma.inspectorWhereInput = {
    inspector_deleted: 0,
  };

  const [inspectors, total] = await Promise.all([
    prisma.inspector.findMany({
      where,
      orderBy: { inspector_name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inspector.count({ where }),
  ]);

  const result: ListInspectorsResult = {
    inspectors: inspectors.map((i) => ({
      inspector_uuid: i.inspector_uuid,
      inspector_name: i.inspector_name,
      inspector_email: i.inspector_email,
      inspector_status: i.inspector_status,
      inspector_created_at: i.inspector_created_at,
      inspector_updated_at: i.inspector_updated_at,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listInspectorsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/inspector] listInspectors output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single inspector account by UUID.
 * Mirrors the legacy Yii2 InspectorController::actionView($id).
 * Excludes sensitive fields (password hash, auth key, reset token, IP).
 */
export async function getInspector(
  params: GetInspectorInput,
): Promise<InspectorAccountItem> {
  await requireCapability("app.access");

  const parsed = getInspectorSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parameters");
  }

  const { uuid } = parsed.data;

  const inspector = await prisma.inspector.findUnique({
    where: { inspector_uuid: uuid },
  });

  if (!inspector) {
    throw new Error("Inspector not found");
  }

  const result: InspectorAccountItem = {
    inspector_uuid: inspector.inspector_uuid,
    inspector_name: inspector.inspector_name,
    inspector_email: inspector.inspector_email,
    inspector_status: inspector.inspector_status,
    inspector_created_at: inspector.inspector_created_at,
    inspector_updated_at: inspector.inspector_updated_at,
  };

  // Validate output shape
  const outputParsed = getInspectorResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/inspector] getInspector output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
