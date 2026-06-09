"use server";

import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability, requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// CandidateWorkingHourAppealController — work-log appeals
// ---------------------------------------------------------------------------
// Ported from Yii2: CandidateWorkingHourAppealController
// Actions: listAppeals, getAppeal, createAppeal, updateAppealStatus,
//          listAppealUpdates, createAppealUpdate
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listAppealsSchema = z.object({
  candidate_id: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().min(0).max(4).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getAppealSchema = z.object({
  uuid: z.string().min(1, "Appeal UUID is required"),
});

const createAppealSchema = z.object({
  candidate_working_hour_uuid: z.string().min(1, "Working hour UUID is required"),
  candidate_id: z.coerce.number().int().positive("Candidate ID is required"),
  reason: z.string().min(1, "Reason is required"),
});

const updateAppealStatusSchema = z.object({
  uuid: z.string().min(1, "Appeal UUID is required"),
  status: z.coerce.number().int().min(0).max(4, "Status must be between 0 and 4"),
});

const listAppealUpdatesSchema = z.object({
  appeal_uuid: z.string().min(1, "Appeal UUID is required"),
});

const createAppealUpdateSchema = z.object({
  appeal_uuid: z.string().min(1, "Appeal UUID is required"),
  update: z.string().min(1, "Update text is required"),
  detail: z.string().optional().default(""),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListAppealsParams = z.input<typeof listAppealsSchema>;
export type GetAppealParams = z.input<typeof getAppealSchema>;
export type CreateAppealParams = z.input<typeof createAppealSchema>;
export type UpdateAppealStatusParams = z.input<typeof updateAppealStatusSchema>;
export type ListAppealUpdatesParams = z.input<typeof listAppealUpdatesSchema>;
export type CreateAppealUpdateParams = z.input<typeof createAppealUpdateSchema>;

export type AppealItem = {
  appeal_uuid: string;
  candidate_working_hour_uuid: string;
  candidate_id: number;
  reason: string | null;
  status: number;
  created_at: Date | null;
  updated_at: Date | null;
};

export type AppealUpdateItem = {
  appeal_update_uuid: string;
  appeal_uuid: string;
  update: string | null;
  detail: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  created_by: number | null;
  updated_by: number | null;
  is_new: boolean | null;
};

export type ListAppealsResult = {
  appeals: AppealItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Exported schemas
// ---------------------------------------------------------------------------

export {
  listAppealsSchema,
  getAppealSchema,
  createAppealSchema,
  updateAppealStatusSchema,
  listAppealUpdatesSchema,
  createAppealUpdateSchema,
};

// ---------------------------------------------------------------------------
// listAppeals
// ---------------------------------------------------------------------------

/**
 * List work-log appeals with pagination and optional filters.
 *
 * Mirrors the legacy CandidateWorkingHourAppealController.
 * - Filters by candidate_id, status, date range
 * - Paginated with configurable page/limit
 * - Ordered by created_at DESC
 */
export async function listAppeals(
  params: ListAppealsParams = {},
): Promise<ListAppealsResult> {
  const { candidate_id, status, date_from, date_to, page, limit } =
    listAppealsSchema.parse(params);

  // Build where clause
  const where: Record<string, unknown> = {};

  if (candidate_id !== undefined) {
    where.candidate_id = candidate_id;
  }

  if (status !== undefined) {
    where.status = status;
  }

  if (date_from !== undefined || date_to !== undefined) {
    const dateFilter: Record<string, Date> = {};
    if (date_from) dateFilter.gte = new Date(date_from);
    if (date_to) dateFilter.lte = new Date(date_to);
    where.created_at = dateFilter;
  }

  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.candidate_working_hour_appeal.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
    }),
    prisma.candidate_working_hour_appeal.count({ where }),
  ]);

  return {
    appeals: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getAppeal
// ---------------------------------------------------------------------------

/**
 * Get a single work-log appeal by UUID.
 */
export async function getAppeal(
  params: GetAppealParams,
): Promise<AppealItem> {
  const { uuid } = getAppealSchema.parse(params);

  const appeal = await prisma.candidate_working_hour_appeal.findUnique({
    where: { appeal_uuid: uuid },
  });

  if (!appeal) {
    throw new Error(`Work-log appeal not found: ${uuid}`);
  }

  return appeal;
}

// ---------------------------------------------------------------------------
// createAppeal
// ---------------------------------------------------------------------------

/**
 * Create a new work-log appeal.
 *
 * Requires candidate role with candidate.read.own capability.
 * Generates a UUID for the appeal.
 */
export async function createAppeal(
  params: CreateAppealParams,
): Promise<AppealItem> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const { candidate_working_hour_uuid, candidate_id, reason } =
    createAppealSchema.parse(params);

  const appeal = await prisma.candidate_working_hour_appeal.create({
    data: {
      appeal_uuid: crypto.randomUUID(),
      candidate_working_hour_uuid,
      candidate_id,
      reason,
      status: 0, // Default: pending
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return appeal;
}

// ---------------------------------------------------------------------------
// updateAppealStatus
// ---------------------------------------------------------------------------

/**
 * Update the status of a work-log appeal.
 *
 * Status values (typical convention):
 *   0 = pending
 *   1 = approved
 *   2 = rejected
 *   3 = in_review
 *   4 = escalated
 */
export async function updateAppealStatus(
  params: UpdateAppealStatusParams,
): Promise<AppealItem> {
  const { uuid, status } = updateAppealStatusSchema.parse(params);

  const appeal = await prisma.candidate_working_hour_appeal.update({
    where: { appeal_uuid: uuid },
    data: {
      status,
      updated_at: new Date(),
    },
  });

  return appeal;
}

// ---------------------------------------------------------------------------
// listAppealUpdates
// ---------------------------------------------------------------------------

/**
 * List updates/history for a specific appeal.
 * Ordered by created_at DESC (newest first).
 */
export async function listAppealUpdates(
  params: ListAppealUpdatesParams,
): Promise<AppealUpdateItem[]> {
  const { appeal_uuid } = listAppealUpdatesSchema.parse(params);

  const updates = await prisma.candidate_working_hour_appeal_updates.findMany({
    where: { appeal_uuid },
    orderBy: { created_at: "desc" },
  });

  return updates;
}

// ---------------------------------------------------------------------------
// createAppealUpdate
// ---------------------------------------------------------------------------

/**
 * Add an update to an appeal.
 * Generates a UUID and marks it as new.
 */
export async function createAppealUpdate(
  params: CreateAppealUpdateParams,
): Promise<AppealUpdateItem> {
  const { appeal_uuid, update, detail } = createAppealUpdateSchema.parse(params);

  const appealUpdate = await prisma.candidate_working_hour_appeal_updates.create({
    data: {
      appeal_update_uuid: crypto.randomUUID(),
      appeal_uuid,
      update,
      detail: detail || null,
      created_at: new Date(),
      updated_at: new Date(),
      is_new: true,
    },
  });

  return appealUpdate;
}
