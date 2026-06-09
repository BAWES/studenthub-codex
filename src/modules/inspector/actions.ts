"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const listRequestsSchema = z.object({
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getRequestSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
});

export const verifyRequestSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
  notes: z.string().optional(),
});

export const rejectRequestSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
  reason: z.string().min(1, "Rejection reason is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListRequestsParams = z.input<typeof listRequestsSchema>;
export type GetRequestParams = z.input<typeof getRequestSchema>;
export type VerifyRequestInput = z.input<typeof verifyRequestSchema>;
export type RejectRequestInput = z.input<typeof rejectRequestSchema>;

export type IdRequestListItem = {
  cir_uuid: string;
  candidate_count: number;
  status: string | null;
  rejection_reason: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  created_by_name: string | null;
};

export type IdRequestDetail = {
  cir_uuid: string;
  status: string | null;
  rejection_reason: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  created_by_name: string | null;
  updated_by_name: string | null;
};

export type ListRequestsResult = {
  requests: IdRequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

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

  return {
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

  if (!request) return null;

  return {
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
  return { success: true };
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
  return { success: true };
}

// ---------------------------------------------------------------------------
// Inspector account actions (STU-1292)
// ---------------------------------------------------------------------------

export const listInspectorsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getInspectorSchema = z.object({
  uuid: z.string().min(1, "Inspector UUID is required"),
});

export type ListInspectorsInput = z.input<typeof listInspectorsSchema>;
export type GetInspectorInput = z.input<typeof getInspectorSchema>;

export type InspectorAccountItem = {
  inspector_uuid: string;
  inspector_name: string;
  inspector_email: string;
  inspector_status: number;
  inspector_created_at: Date;
  inspector_updated_at: Date;
};

export type ListInspectorsResult = {
  inspectors: InspectorAccountItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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

  const { page = 1, limit = 20 } = parsed.data;

  const where: Record<string, unknown> = {
    inspector_deleted: 0,
  };

  const [inspectors, total] = await Promise.all([
    prisma.inspector.findMany({
      where: where as any,
      orderBy: { inspector_name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inspector.count({ where: where as any }),
  ]);

  return {
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

  return {
    inspector_uuid: inspector.inspector_uuid,
    inspector_name: inspector.inspector_name,
    inspector_email: inspector.inspector_email,
    inspector_status: inspector.inspector_status,
    inspector_created_at: inspector.inspector_created_at,
    inspector_updated_at: inspector.inspector_updated_at,
  };
}
