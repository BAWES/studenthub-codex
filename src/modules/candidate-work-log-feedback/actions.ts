"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listWorkLogFeedbackSchema,
  getWorkLogFeedbackSchema,
  workLogFeedbackItemSchema,
  listWorkLogFeedbackResultSchema,
  type ListWorkLogFeedbackParams,
  type GetWorkLogFeedbackParams,
} from "./schemas";
import type { WorkLogFeedbackItem, ListWorkLogFeedbackResult } from "./schemas";

// ---------------------------------------------------------------------------
// CandidateWorkLogFeedbackController — feedback on candidate work logs
// ---------------------------------------------------------------------------
// Ported from Yii2 company/modules/v1/controllers/CandidateWorkLogFeedbackController.php
// Actions: listWorkLogFeedback, getWorkLogFeedback
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation)
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// listWorkLogFeedback
// ---------------------------------------------------------------------------

/**
 * List work log feedback entries with pagination and optional filters.
 *
 * Mirrors the legacy CandidateWorkLogFeedbackController.
 * - Filters by candidate_id when provided
 * - Filters by status when provided
 * - Filters by date range (date_from / date_to) when provided
 * - Paginated with configurable page/limit
 * - Ordered by created_at DESC
 */
export async function listWorkLogFeedback(
  params: ListWorkLogFeedbackParams = {},
): Promise<ListWorkLogFeedbackResult> {
  const { candidate_id, status, date_from, date_to, page, limit } =
    listWorkLogFeedbackSchema.parse(params);

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
    where.date = dateFilter;
  }

  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.candidate_work_log_feedback.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
    }),
    prisma.candidate_work_log_feedback.count({ where }),
  ]);

  const result = {
    workLogFeedbacks: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listWorkLogFeedbackResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-work-log-feedback] listWorkLogFeedback output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getWorkLogFeedback
// ---------------------------------------------------------------------------

/**
 * Get a single work log feedback entry by UUID.
 *
 * Mirrors the legacy CandidateWorkLogFeedbackController view action.
 */
export async function getWorkLogFeedback(
  params: GetWorkLogFeedbackParams,
): Promise<WorkLogFeedbackItem> {
  const { uuid } = getWorkLogFeedbackSchema.parse(params);

  const feedback = await prisma.candidate_work_log_feedback.findUnique({
    where: { cwlf_uuid: uuid },
  });

  if (!feedback) {
    throw new Error(`Work log feedback not found: ${uuid}`);
  }

  // Validate output shape
  const outputParsed = workLogFeedbackItemSchema.safeParse(feedback);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidate-work-log-feedback] getWorkLogFeedback output validation failed:",
      outputParsed.error.issues,
    );
  }

  return feedback;
}
