"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// CandidateWorkLogFeedbackController — feedback on candidate work logs
// ---------------------------------------------------------------------------
// Ported from Yii2 company/modules/v1/controllers/CandidateWorkLogFeedbackController.php
// Actions: listWorkLogFeedback, getWorkLogFeedback
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listWorkLogFeedbackSchema = z.object({
  candidate_id: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().min(0).max(2).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getWorkLogFeedbackSchema = z.object({
  uuid: z.string().min(1, "Work log feedback UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListWorkLogFeedbackParams = z.input<typeof listWorkLogFeedbackSchema>;
export type GetWorkLogFeedbackParams = z.input<typeof getWorkLogFeedbackSchema>;

export type WorkLogFeedbackItem = {
  cwlf_uuid: string;
  candidate_id: number;
  store_id: number;
  company_id: number;
  date: Date;
  candidate_working_hour_uuid: string | null;
  status: number | null;
  note: string | null;
  reason: string | null;
  is_public: boolean | null;
  rating: boolean | null;
  created_by: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type ListWorkLogFeedbackResult = {
  workLogFeedbacks: WorkLogFeedbackItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Exported schemas (for shared validation)
// ---------------------------------------------------------------------------

export { listWorkLogFeedbackSchema, getWorkLogFeedbackSchema };

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

  return {
    workLogFeedbacks: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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

  return feedback;
}
