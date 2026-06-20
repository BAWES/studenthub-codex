"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability, requireRoleCapability } from "@/modules/auth/session";
import {
  APPEAL_STATUS_PENDING,
  APPEAL_STATUS_RESOLVED,
  APPEAL_STATUS_REJECTED,
  listAppealsSchema,
  getAppealSchema,
  createAppealSchema,
  updateAppealStatusSchema,
  listAppealUpdatesSchema,
  createAppealUpdateSchema,
  appealRowSchema,
  appealUpdateRowSchema,
  actionResultSchema,
  appealsPaginatedResultSchema,
  appealUpdatesPaginatedResultSchema,
  listAppealsResultSchema,
  getAppealResultSchema,
  createAppealResultSchema,
  updateAppealStatusResultSchema,
  listAppealUpdatesResultSchema,
  createAppealUpdateResultSchema,
  type ListAppealsParams,
  type CreateAppealParams,
  type UpdateAppealStatusParams,
  type CreateAppealUpdateParams,
  type AppealRow,
  type AppealUpdateRow,
  type PaginatedResult,
  type ActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helper — build date range filter
// ---------------------------------------------------------------------------

function buildDateFilter(
  startDate?: string,
  endDate?: string,
): Record<string, Date> | undefined {
  if (!startDate && !endDate) return undefined;
  const filter: Record<string, Date> = {};
  if (startDate) filter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.lte = end;
  }
  return filter;
}

// ---------------------------------------------------------------------------
// 1. listAppeals — Paginated list with filters
// ---------------------------------------------------------------------------

/**
 * List work-log appeals with pagination and optional filters.
 *
 * @param params - Filters: candidateId, status, startDate, endDate, page, limit
 * @returns Paginated list of appeals
 */
export async function listAppeals(
  params: ListAppealsParams = {},
): Promise<PaginatedResult<AppealRow> | { error: string }> {
  const session = await requireCapability("time.approve");
  const staffId = Number(session.id);
  const role = session.role;

  const parsed = listAppealsSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid params." };
  }

  const { candidateId, status, startDate, endDate, page, limit } = parsed.data;

  const where: Record<string, unknown> = {};

  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }
  if (status !== undefined) {
    where.status = status;
  }

  const dateFilter = buildDateFilter(startDate, endDate);
  if (dateFilter) {
    where.created_at = dateFilter;
  }

  // Non-admin staff should only see appeals for candidates they're assigned to
  if (role !== "admin") {
    const assigned = await prisma.candidate_work_history.findMany({
      where: { staff_id: staffId },
      select: { candidate_id: true },
    });
    if (assigned.length === 0) {
      const result = { items: [] as AppealRow[], total: 0, page, limit, totalPages: 0 };
      const outputParsed = appealsPaginatedResultSchema.safeParse(result);
      if (!outputParsed.success) {
        console.error("[modules/appeals] listAppeals output validation failed:", outputParsed.error.issues);
      }
      return result;
    }
    const candidateIds = assigned.map((a) => a.candidate_id);
    if (where.candidate_id !== undefined) {
      // If a candidateId filter is applied, it must be in their scope
      if (!candidateIds.includes(Number(where.candidate_id))) {
        return { error: "You are not assigned to this candidate." };
      }
    } else {
      where.candidate_id = { in: candidateIds };
    }
  }

  const [total, rows] = await Promise.all([
    prisma.candidate_working_hour_appeal.count({ where: where as any }),
    prisma.candidate_working_hour_appeal.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const result = {
    items: rows.map((r) => ({
      appealUuid: r.appeal_uuid,
      worklogUuid: r.candidate_working_hour_uuid,
      candidateId: r.candidate_id,
      reason: r.reason ?? null,
      status: r.status ?? 0,
      createdAt: r.created_at ? r.created_at.toISOString() : "",
      updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listAppealsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[modules/appeals] listAppeals output validation failed:", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// 2. getAppeal — Single appeal by UUID
// ---------------------------------------------------------------------------

/**
 * Get a single work-log appeal by UUID.
 *
 * @param params - { appealUuid }
 * @returns The appeal record or error
 */
export async function getAppeal(
  params: z.input<typeof getAppealSchema>,
): Promise<{ appeal: AppealRow | null; error?: string }> {
  const session = await requireCapability("time.approve");
  const staffId = Number(session.id);
  const role = session.role;

  const parsed = getAppealSchema.safeParse(params);
  if (!parsed.success) {
    return { appeal: null, error: parsed.error.errors[0]?.message ?? "Invalid params." };
  }

  const row = await prisma.candidate_working_hour_appeal.findFirst({
    where: { appeal_uuid: parsed.data.appealUuid },
  });

  if (!row) {
    return { appeal: null, error: "Appeal not found." };
  }

  // Non-admin staff scope check
  if (role !== "admin") {
    const inScope = await prisma.candidate_work_history.findFirst({
      where: { staff_id: staffId, candidate_id: row.candidate_id },
      select: { id: true },
    });
    if (!inScope) {
      return { appeal: null, error: "You are not assigned to this candidate." };
    }
  }

  const result = {
    appeal: {
      appealUuid: row.appeal_uuid,
      worklogUuid: row.candidate_working_hour_uuid,
      candidateId: row.candidate_id,
      reason: row.reason ?? null,
      status: row.status ?? 0,
      createdAt: row.created_at ? row.created_at.toISOString() : "",
      updatedAt: row.updated_at ? row.updated_at.toISOString() : null,
    },
  };

  const outputParsed = getAppealResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[modules/appeals] getAppeal output validation failed:", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// 3. createAppeal — Create a new appeal
// ---------------------------------------------------------------------------

/**
 * Create a new work-log appeal as a candidate.
 *
 * @param params - { worklogUuid, reason }
 * @returns Result with success flag or error
 */
export async function createAppeal(
  params: CreateAppealParams,
): Promise<ActionResult & { appealUuid?: string }> {
  const session = await requireRoleCapability("candidate", "time.read.own");
  const candidateId = Number(session.id);

  const parsed = createAppealSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }

  const workLog = await prisma.candidate_working_hour.findFirst({
    where: {
      candidate_working_hour_uuid: parsed.data.worklogUuid,
      candidate_id: candidateId,
    },
    select: { candidate_working_hour_uuid: true },
  });

  if (!workLog) {
    return { success: false, error: "Work log not found." };
  }

  const appealUuid = `appeal_${crypto.randomUUID()}`;
  const now = new Date();

  await prisma.$transaction([
    prisma.candidate_working_hour_appeal.create({
      data: {
        appeal_uuid: appealUuid,
        candidate_working_hour_uuid: parsed.data.worklogUuid,
        candidate_id: candidateId,
        reason: parsed.data.reason,
        status: APPEAL_STATUS_PENDING,
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.candidate_working_hour.update({
      where: { candidate_working_hour_uuid: parsed.data.worklogUuid },
      data: { appeal_uuid: appealUuid, updated_at: now },
    }),
  ]);

  revalidatePath("/candidate/work-logs");
  const result = { success: true as const, appealUuid };
  const outputParsed = createAppealResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[modules/appeals] createAppeal output validation failed:", outputParsed.error.issues);
  }
  return result;
}

// ---------------------------------------------------------------------------
// 4. updateAppealStatus — Update appeal status (approve/reject)
// ---------------------------------------------------------------------------

/**
 * Update the status of a work-log appeal (staff-facing).
 *
 * @param params - { appealUuid, resolution, note? }
 * @returns Result with success flag or error
 */
export async function updateAppealStatus(
  params: UpdateAppealStatusParams,
): Promise<ActionResult> {
  const session = await requireCapability("time.approve");
  const staffId = Number(session.id);
  const role = session.role;

  const parsed = updateAppealStatusSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }

  const { appealUuid, resolution, note } = parsed.data;

  // Verify appeal exists and check scope
  const appeal = await prisma.candidate_working_hour_appeal.findFirst({
    where: { appeal_uuid: appealUuid },
    select: { appeal_uuid: true, status: true, candidate_id: true },
  });

  if (!appeal) {
    return { success: false, error: "Appeal not found." };
  }

  if (role !== "admin") {
    const inScope = await prisma.candidate_work_history.findFirst({
      where: { staff_id: staffId, candidate_id: appeal.candidate_id },
      select: { id: true },
    });
    if (!inScope) {
      return { success: false, error: "You are not assigned to this candidate." };
    }
  }

  const newStatus =
    resolution === "approve" ? APPEAL_STATUS_RESOLVED : APPEAL_STATUS_REJECTED;

  const now = new Date();
  const operations: any[] = [
    prisma.candidate_working_hour_appeal.update({
      where: { appeal_uuid: appealUuid },
      data: { status: newStatus, updated_at: now },
    }),
  ];

  if (note) {
    operations.push(
      prisma.candidate_working_hour_appeal_updates.create({
        data: {
          appeal_update_uuid: `appeal_update_${crypto.randomUUID()}`,
          appeal_uuid: appealUuid,
          update: resolution === "approve" ? "Appeal approved" : "Appeal rejected",
          detail: note,
          created_by: staffId,
          created_at: now,
          updated_at: now,
        },
      }),
    );
  }

  await prisma.$transaction(operations);

  revalidatePath("/staff/candidates");
  revalidatePath("/candidate/work-logs");
  const result = { success: true as const };
  const outputParsed = updateAppealStatusResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[modules/appeals] updateAppealStatus output validation failed:", outputParsed.error.issues);
  }
  return result;
}

// ---------------------------------------------------------------------------
// 5. listAppealUpdates — List updates for an appeal
// ---------------------------------------------------------------------------

/**
 * List all updates for a specific work-log appeal.
 *
 * @param params - { appealUuid, page?, limit? }
 * @returns Paginated list of appeal updates
 */
export async function listAppealUpdates(
  params: z.input<typeof listAppealUpdatesSchema>,
): Promise<PaginatedResult<AppealUpdateRow> | { error: string }> {
  const session = await requireCapability("time.approve");

  const parsed = listAppealUpdatesSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid params." };
  }

  const { appealUuid, page, limit } = parsed.data;

  // Verify the appeal exists
  const appeal = await prisma.candidate_working_hour_appeal.findFirst({
    where: { appeal_uuid: appealUuid },
    select: { appeal_uuid: true },
  });

  if (!appeal) {
    return { error: "Appeal not found." };
  }

  const [total, rows] = await Promise.all([
    prisma.candidate_working_hour_appeal_updates.count({
      where: { appeal_uuid: appealUuid },
    }),
    prisma.candidate_working_hour_appeal_updates.findMany({
      where: { appeal_uuid: appealUuid },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const result = {
    items: rows.map((r) => ({
      appealUpdateUuid: r.appeal_update_uuid,
      appealUuid: r.appeal_uuid,
      update: r.update ?? null,
      detail: r.detail ?? null,
      createdBy: r.created_by,
      isNew: r.is_new,
      createdAt: r.created_at ? r.created_at.toISOString() : "",
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listAppealUpdatesResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[modules/appeals] listAppealUpdates output validation failed:", outputParsed.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// 6. createAppealUpdate — Add an update to an appeal
// ---------------------------------------------------------------------------

/**
 * Add a new update/comment to a work-log appeal (staff-facing).
 *
 * @param params - { appealUuid, update, detail? }
 * @returns Result with success flag or error
 */
export async function createAppealUpdate(
  params: CreateAppealUpdateParams,
): Promise<ActionResult & { appealUpdateUuid?: string }> {
  const session = await requireCapability("time.approve");
  const staffId = Number(session.id);
  const role = session.role;

  const parsed = createAppealUpdateSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }

  const { appealUuid, update, detail } = parsed.data;

  // Verify appeal exists and check scope
  const appeal = await prisma.candidate_working_hour_appeal.findFirst({
    where: { appeal_uuid: appealUuid },
    select: { appeal_uuid: true, candidate_id: true },
  });

  if (!appeal) {
    return { success: false, error: "Appeal not found." };
  }

  if (role !== "admin") {
    const inScope = await prisma.candidate_work_history.findFirst({
      where: { staff_id: staffId, candidate_id: appeal.candidate_id },
      select: { id: true },
    });
    if (!inScope) {
      return { success: false, error: "You are not assigned to this candidate." };
    }
  }

  const appealUpdateUuid = `appeal_update_${crypto.randomUUID()}`;
  const now = new Date();

  await prisma.candidate_working_hour_appeal_updates.create({
    data: {
      appeal_update_uuid: appealUpdateUuid,
      appeal_uuid: appealUuid,
      update,
      detail: detail || undefined,
      created_by: staffId,
      updated_by: staffId,
      created_at: now,
      updated_at: now,
    },
  });

  revalidatePath("/staff/candidates");
  revalidatePath("/candidate/work-logs");
  const result = { success: true as const, appealUpdateUuid };
  const outputParsed = createAppealUpdateResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[modules/appeals] createAppealUpdate output validation failed:", outputParsed.error.issues);
  }
  return result;
}
