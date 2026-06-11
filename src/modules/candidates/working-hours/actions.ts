"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listCandidateWorkingHoursSchema,
  getCandidateWorkingHourSchema,
  listWorkLogFeedbackSchema,
  getWorkLogFeedbackSchema,
  listCandidateWorkingHoursResultSchema,
  candidateWorkingHourItemSchema,
  listWorkLogFeedbackResultSchema,
  workLogFeedbackItemSchema,
  type ListCandidateWorkingHoursParams,
  type GetCandidateWorkingHourParams,
  type CandidateWorkingHourItem,
  type CandidateWorkingHourDetail,
  type ListCandidateWorkingHoursResult,
  type ListWorkLogFeedbackParams,
  type GetWorkLogFeedbackParams,
  type WorkLogFeedbackItem,
  type ListWorkLogFeedbackResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Prisma row type (internal)
// ---------------------------------------------------------------------------

type PrismaCandidateWorkingHourRow = {
  candidate_working_hour_uuid: string;
  candidate_id: number | null;
  store_id: number | null;
  date: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  total_time: number | null;
  status: number | null;
  via: string | null;
  note: string | null;
  start_location_lat: unknown | null;
  start_location_long: unknown | null;
  end_location_lat: unknown | null;
  end_location_long: unknown | null;
  created_at: Date | null;
  updated_at: Date | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_working_hour row to the shared item shape. */
function toItem(row: PrismaCandidateWorkingHourRow): CandidateWorkingHourItem {
  return {
    candidate_working_hour_uuid: row.candidate_working_hour_uuid,
    candidate_id: row.candidate_id ?? null,
    store_id: row.store_id ?? null,
    date: row.date?.toISOString() ?? null,
    start_time: row.start_time?.toISOString() ?? null,
    end_time: row.end_time?.toISOString() ?? null,
    total_time: row.total_time ?? null,
    status: row.status ?? null,
    via: row.via ?? null,
    note: row.note ?? null,
    start_location_lat: row.start_location_lat
      ? Number(row.start_location_lat)
      : null,
    start_location_long: row.start_location_long
      ? Number(row.start_location_long)
      : null,
    end_location_lat: row.end_location_lat
      ? Number(row.end_location_lat)
      : null,
    end_location_long: row.end_location_long
      ? Number(row.end_location_long)
      : null,
    created_at: row.created_at?.toISOString() ?? null,
    updated_at: row.updated_at?.toISOString() ?? null,
  };
}

// ---------------------------------------------------------------------------
// listCandidateWorkingHours
// ---------------------------------------------------------------------------

/**
 * List candidate working hours with optional date filter and pagination.
 * Requires `candidate.read` or `staff.read` capability.
 *
 * Maps from Yii2 CandidateWorkingHourController::actionListHour().
 */
export async function listCandidateWorkingHours(
  params: ListCandidateWorkingHoursParams,
): Promise<ListCandidateWorkingHoursResult> {
  const session = await requireCapability("candidate.read");
  const parsed = listCandidateWorkingHoursSchema.parse(params);

  const where: Record<string, unknown> = {
    candidate_id: parsed.candidateId,
  };

  if (parsed.date) {
    where.date = new Date(parsed.date);
  }

  const skip = (parsed.page - 1) * parsed.limit;

  const [rows, total] = await Promise.all([
    prisma.candidate_working_hour.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: parsed.limit,
    }),
    prisma.candidate_working_hour.count({ where }),
  ]);


  const result = {
    items: rows.map(toItem),
    total,
    page: parsed.page,
    limit: parsed.limit,
    totalPages: Math.ceil(total / parsed.limit),
  };

  // Validate output shape
  const outputParsed = listCandidateWorkingHoursResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/working-hours] listCandidateWorkingHours output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getCandidateWorkingHour
// ---------------------------------------------------------------------------

/**
 * Get a single candidate working hour by its UUID.
 * Requires `candidate.read` or `staff.read` capability.
 *
 * Maps from Yii2 CandidateWorkingHourController::findModel().
 */
export async function getCandidateWorkingHour(
  params: GetCandidateWorkingHourParams,
): Promise<CandidateWorkingHourDetail> {
  const session = await requireCapability("candidate.read");
  const parsed = getCandidateWorkingHourSchema.parse(params);

  const row = await prisma.candidate_working_hour.findUnique({
    where: { candidate_working_hour_uuid: parsed.uuid },
  });

  if (!row) return null;

  // Validate output shape
  const result = toItem(row);
  const outputParsed = candidateWorkingHourItemSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/working-hours] getCandidateWorkingHour output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// listWorkLogFeedback
// ---------------------------------------------------------------------------

/**
 * List work log feedback entries with pagination and optional filters.
 * Requires `candidate.read` or `staff.read` capability.
 *
 * Maps from Yii2 CandidateWorkLogFeedbackController::actionListFeedback().
 */
export async function listWorkLogFeedback(
  params: ListWorkLogFeedbackParams = {},
): Promise<ListWorkLogFeedbackResult> {
  await requireCapability("candidate.read");
  const { candidate_id, status, date_from, date_to, page, limit } =
    listWorkLogFeedbackSchema.parse(params);

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
      "[modules/candidates/working-hours] listWorkLogFeedback output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getWorkLogFeedback
// ---------------------------------------------------------------------------

/**
 * Get a single work log feedback entry by its UUID.
 * Requires `candidate.read` capability.
 *
 * Maps from Yii2 CandidateWorkLogFeedbackController::actionViewFeedback().
 */
export async function getWorkLogFeedback(
  params: GetWorkLogFeedbackParams,
): Promise<WorkLogFeedbackItem> {
  await requireCapability("candidate.read");
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
      "[modules/candidates/working-hours] getWorkLogFeedback output validation failed:",
      outputParsed.error.issues,
    );
  }

  return feedback;
}
