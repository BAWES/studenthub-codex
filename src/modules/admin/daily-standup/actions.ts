import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listDailyStandupsSchema,
  listDailyStandupsResultSchema,
} from "./schemas";
import type {
  ListDailyStandupsInput,
  ListDailyStandupsResult,
  DailyStandupAnswerItem,
} from "./schemas";

export async function listDailyStandups(
  input: ListDailyStandupsInput = {},
): Promise<ListDailyStandupsResult> {
  await requireRoleCapability("admin", "admin.system");
  const parsed = listDailyStandupsSchema.safeParse(input);
  if (!parsed.success) {
    return { answers: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.daily_standup_answer.findMany({
      orderBy: { updated_at: "desc" },
      skip,
      take: limit,
      select: {
        answer_uuid: true,
        staff_id: true,
        question_uuid: true,
        question: true,
        answer: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.daily_standup_answer.count(),
  ]);

  const answers = rows.map((row) => ({
    answer_uuid: row.answer_uuid,
    staff_id: row.staff_id,
    question_uuid: row.question_uuid,
    question: row.question,
    answer: row.answer,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  const result = {
    answers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listDailyStandupsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/daily-standup] listDailyStandups output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

export async function getDailyStandupAnswer(
  answerUuid: string,
): Promise<{ answer: DailyStandupAnswerItem | null }> {
  await requireRoleCapability("admin", "admin.system");

  const row = await prisma.daily_standup_answer.findUnique({
    where: { answer_uuid: answerUuid },
    select: {
      answer_uuid: true,
      staff_id: true,
      question_uuid: true,
      question: true,
      answer: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!row) return { answer: null };
  return { answer: row };
}
