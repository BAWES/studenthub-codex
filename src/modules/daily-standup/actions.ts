"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listQuestionsSchema,
  listQuestionsResultSchema,
  createAbsenceSchema,
  createAbsenceResultSchema,
  getSessionResultSchema,
} from "./schemas";
import type {
  ListQuestionsInput,
  CreateAbsenceInput,
  ListQuestionsResult,
  GetSessionResult,
  CreateAbsenceResult,
  WorkSessionItem,
  LeaveItem,
} from "./schemas";

// ---------------------------------------------------------------------------
// listQuestions
// ---------------------------------------------------------------------------

/**
 * List daily standup questions with pagination.
 * Mirrors the legacy DailyStandupController.
 */
export async function listQuestions(
  params: FormData | ListQuestionsInput = {},
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

  const result = {
    questions: questions.map((q) => ({
      question_uuid: q.question_uuid,
      question: q.question ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const output = listQuestionsResultSchema.safeParse(result);
  if (!output.success) {
    console.error("listQuestions output validation failed", output.error.issues);
    return { questions: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  return output.data;
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

  const result = { session, leave };

  // Validate output shape
  const output = getSessionResultSchema.safeParse(result);
  if (!output.success) {
    console.error("getSession output validation failed", output.error.issues);
    return { session: null, leave: null };
  }

  return output.data;
}

// ---------------------------------------------------------------------------
// createAbsence
// ---------------------------------------------------------------------------

/**
 * Create a leave/absence request.
 * Mirrors the legacy DailyStandupController::actionLeaveRequest().
 */
export async function createAbsence(
  data: CreateAbsenceInput,
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

  const result = { staff_leave_uuid: leave.staff_leave_uuid };

  // Validate output shape
  const output = createAbsenceResultSchema.safeParse(result);
  if (!output.success) {
    console.error("createAbsence output validation failed", output.error.issues);
    throw new Error("Failed to return valid absence result");
  }

  return output.data;
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
