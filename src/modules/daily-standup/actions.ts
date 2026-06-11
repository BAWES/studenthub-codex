"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

import {
  listQuestionsSchema,
  createAbsenceSchema,
  dailyStandupQuestionItemSchema,
  listQuestionsResultSchema,
  workSessionItemSchema,
  leaveItemSchema,
  getSessionResultSchema,
  createAbsenceResultSchema,
  type DailyStandupQuestionItem,
  type ListQuestionsResult,
  type WorkSessionItem,
  type LeaveItem,
  type GetSessionResult,
  type CreateAbsenceResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listQuestions
// ---------------------------------------------------------------------------

/**
 * List daily standup questions with pagination.
 * Mirrors the legacy DailyStandupController.
 */
export async function listQuestions(
  params: FormData | z.input<typeof listQuestionsSchema> = {},
): Promise<ListQuestionsResult> {
  await requireCapability("time.read.own");

  const raw =
    params instanceof FormData
      ? {
          page: params.get("page"),
          limit: params.get("limit"),
        }
      : params;

  const parsed = listQuestionsSchema.safeParse(raw);
  if (!parsed.success) {
    return { questions: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [questions, total] = await Promise.all([
    prisma.daily_standup_question.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.daily_standup_question.count(),
  ]);

  const result: ListQuestionsResult = {
    questions: questions.map((q) => ({
      question_uuid: q.question_uuid,
      question: q.question ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listQuestionsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/daily-standup] listQuestions output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getSession
// ---------------------------------------------------------------------------

/**
 * Get the current work session and today's leave for the authenticated user.
 * Mirrors the legacy DailyStandupController::actionSession().
 */
export async function getSession(): Promise<GetSessionResult> {
  await requireCapability("time.read.own");

  const session = await getActiveSession();
  const leave = await getTodayLeave();

  const result: GetSessionResult = { session, leave };

  const outputParsed = getSessionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/daily-standup] getSession output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createAbsence
// ---------------------------------------------------------------------------

/**
 * Create a leave/absence request.
 * Mirrors the legacy DailyStandupController::actionLeaveRequest().
 */
export async function createAbsence(
  data: z.input<typeof createAbsenceSchema>,
): Promise<CreateAbsenceResult> {
  await requireCapability("staff_leave.write");

  const parsed = createAbsenceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid absence data");
  }

  const { from_date, to_date, note, type } = parsed.data;

  const leave = await prisma.staff_leave.create({
    data: {
      staff_leave_uuid: `lv_${crypto.randomUUID()}`,
      staff_id: 0, // placeholder — set from session when auth is wired
      from_date: new Date(from_date),
      to_date: new Date(to_date),
      note: note ?? null,
      category: type,
      status: 0,
    } as any,
  });

  const result: CreateAbsenceResult = {
    staff_leave_uuid: leave.staff_leave_uuid,
  };

  const outputParsed = createAbsenceResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/daily-standup] createAbsence output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Get the active work session for the authenticated staff member.
 * A session is "active" when it has no total_minutes (not yet ended).
 */
async function getActiveSession(): Promise<WorkSessionItem | null> {
  const session = await prisma.staff_work_session.findFirst({
    where: {
      staff_id: 0, // placeholder — use session staff_id when auth is wired
      total_minutes: null,
    },
    orderBy: { created_at: "desc" },
  });

  if (!session) return null;

  const raw = session as any;
  return {
    work_session_uuid: raw.work_session_uuid,
    staff_id: raw.staff_id,
    total_minutes: raw.total_minutes,
    created_at: raw.created_at?.toISOString() ?? null,
    updated_at: raw.updated_at?.toISOString() ?? null,
  };
}

/**
 * Get today's leave request for the authenticated staff member.
 */
async function getTodayLeave(): Promise<LeaveItem | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const leave = await prisma.staff_leave.findFirst({
    where: {
      staff_id: 0, // placeholder — use session staff_id when auth is wired
      from_date: { lte: today },
      to_date: { gte: today },
    },
    orderBy: { created_at: "desc" },
  });

  if (!leave) return null;

  const raw = leave as any;
  return {
    staff_leave_uuid: raw.staff_leave_uuid,
    staff_id: raw.staff_id,
    from_date: raw.from_date?.toISOString() ?? null,
    to_date: raw.to_date?.toISOString() ?? null,
    note: raw.note ?? null,
    category: raw.category ?? null,
    status: raw.status,
  };
}
