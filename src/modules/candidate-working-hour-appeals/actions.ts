"use server";

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

import {
  listAppealsSchema,
  getAppealSchema,
  createAppealSchema,
  updateAppealStatusSchema,
  listAppealUpdatesSchema,
  createAppealUpdateSchema,
  listAppealsResultSchema,
  appealItemSchema,
  appealUpdateItemSchema,
  type ListAppealsParams,
  type GetAppealParams,
  type CreateAppealParams,
  type UpdateAppealStatusParams,
  type ListAppealUpdatesParams,
  type CreateAppealUpdateParams,
  type AppealItem,
  type AppealUpdateItem,
  type ListAppealsResult,
} from "./schemas";

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

  const result = {
    appeals: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listAppealsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-working-hour-appeals] listAppeals output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
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

  // Validate output shape
  const outputParsed = appealItemSchema.safeParse(appeal);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-working-hour-appeals] getAppeal output validation failed:",
      outputParsed.error.issues,
    );
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

  // Validate output shape
  const outputParsed = appealItemSchema.safeParse(appeal);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-working-hour-appeals] createAppeal output validation failed:",
      outputParsed.error.issues,
    );
  }

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

  // Validate output shape
  const outputParsed = appealItemSchema.safeParse(appeal);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-working-hour-appeals] updateAppealStatus output validation failed:",
      outputParsed.error.issues,
    );
  }

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

  // Validate output shape
  for (const update of updates) {
    const outputParsed = appealUpdateItemSchema.safeParse(update);
    if (!outputParsed.success) {
      console.error(
        "[modules/candidate-working-hour-appeals] listAppealUpdates output validation failed:",
        outputParsed.error.issues,
      );
      break;
    }
  }

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

  // Validate output shape
  const outputParsed = appealUpdateItemSchema.safeParse(appealUpdate);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-working-hour-appeals] createAppealUpdate output validation failed:",
      outputParsed.error.issues,
    );
  }

  return appealUpdate;
}
