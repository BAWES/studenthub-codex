"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listIdRequestsSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getIdRequestSchema = z.object({
  cirUuid: z.string().min(1, "ID Request UUID is required"),
});

const createIdRequestSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  candidateIds: z.string().min(1, "At least one candidate ID is required"),
});

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type ListIdRequestsParams = z.input<typeof listIdRequestsSchema>;
export type GetIdRequestParams = z.input<typeof getIdRequestSchema>;
export type CreateIdRequestParams = z.input<typeof createIdRequestSchema>;

export type IdRequestListItem = {
  cir_uuid: string;
  candidate_count: number;
  status: string | null;
  rejection_reason: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type IdRequestDetail = {
  cir_uuid: string;
  candidate_ids: string | null;
  status: string | null;
  rejection_reason: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  created_by_name: string | null;
  updated_by_name: string | null;
};

export type ListIdRequestsResult = {
  requests: IdRequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateIdRequestResult = {
  cir_uuid: string;
  status: string;
};

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List candidate ID verification requests for a specific candidate.
 * Filters by candidate_ids column containing the candidate ID.
 * Requires candidate.read capability.
 */
export async function listIdRequests(
  params: ListIdRequestsParams,
): Promise<ListIdRequestsResult> {
  await requireRoleCapability("candidate", "candidate.read");

  const parsed = listIdRequestsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid list parameters",
    );
  }

  const { candidateId, page = 1, limit = 20 } = parsed.data;

  const where = {
    candidate_ids: { contains: String(candidateId) },
  };

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
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single ID verification request by UUID.
 * Requires candidate.read capability.
 */
export async function getIdRequest(
  params: GetIdRequestParams,
): Promise<IdRequestDetail | null> {
  await requireRoleCapability("candidate", "candidate.read");

  const parsed = getIdRequestSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid request parameters",
    );
  }

  const { cirUuid } = parsed.data;

  const request = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: cirUuid },
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
    candidate_ids: request.candidate_ids,
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
 * Create a new candidate ID verification request.
 * Requires candidate.mutate capability.
 */
export async function createIdRequest(
  params: CreateIdRequestParams,
): Promise<CreateIdRequestResult> {
  const session = await requireRoleCapability("candidate", "candidate.write");

  const parsed = createIdRequestSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid create parameters",
    );
  }

  const { candidateIds } = parsed.data;
  const staffId = Number(session.id);
  const now = new Date();
  const cirUuid = crypto.randomUUID();

  await prisma.candidate_id_request.create({
    data: {
      cir_uuid: cirUuid,
      candidate_ids: candidateIds,
      status: "pending",
      created_by: Number.isInteger(staffId) ? staffId : undefined,
      created_at: now,
      updated_at: now,
    },
  });

  revalidatePath("/candidate/id-requests");

  return {
    cir_uuid: cirUuid,
    status: "pending",
  };
}
