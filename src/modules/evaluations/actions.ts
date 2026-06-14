"use server";

import { prisma } from "@/lib/prisma";
import {
  getEvaluationParamsSchema,
  evaluationDetailOutputSchema,
  evaluationAnswersOutputSchema,
  type EvaluationDetail,
  type EvaluationAnswer,
} from "./schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * Fetch an evaluation's detail including candidate and staff names.
 * Uses a transaction for consistency.
 */
export async function getEvaluationDetail(uuid: string): Promise<EvaluationDetail | null> {
  const parsed = getEvaluationParamsSchema.safeParse({ uuid });
  if (!parsed.success) {
    return null;
  }

  const evaluation = await prisma.candidate_evaluation.findUnique({
    where: { can_eval_uuid: uuid },
  });

  if (!evaluation) {
    return null;
  }

  const [candidate, staff] = await Promise.all([
    evaluation.candidate_id
      ? prisma.candidate.findUnique({
          where: { candidate_id: evaluation.candidate_id },
          select: { candidate_name: true, candidate_email: true },
        })
      : null,
    evaluation.staff_id
      ? prisma.staff.findUnique({
          where: { staff_id: evaluation.staff_id },
          select: { staff_name: true },
        })
      : null,
  ]);

  const result: EvaluationDetail = {
    uuid: evaluation.can_eval_uuid,
    candidateId: evaluation.candidate_id,
    staffId: evaluation.staff_id,
    startDate: evaluation.start_date,
    endDate: evaluation.end_date,
    createdAt: evaluation.created_at,
    candidateName: candidate?.candidate_name ?? null,
    candidateEmail: candidate?.candidate_email ?? null,
    staffName: staff?.staff_name ?? null,
  };

  const outputParsed = evaluationDetailOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("[modules/evaluations] getEvaluationDetail output validation failed:", outputParsed.error.issues);
  }

  return result;
}

/**
 * Fetch evaluation answers via raw SQL.
 * The candidate_evaluation_answer table has no primary key (Prisma @@ignore'd),
 * so we use $queryRawUnsafe directly.
 */
export async function getEvaluationAnswers(
  uuid: string,
): Promise<EvaluationAnswer[]> {
  const parsed = getEvaluationParamsSchema.safeParse({ uuid });
  if (!parsed.success) {
    return [];
  }

  const rows = await prisma.$queryRawUnsafe<
    Array<{
      ceq_uuid: string | null;
      question: string | null;
      answer: string | null;
      rating: number | null;
    }>
  >(
    `SELECT ceq_uuid, question, answer, rating
     FROM candidate_evaluation_answer
     WHERE can_eval_uuid = ?`,
    uuid,
  );

  const answers: EvaluationAnswer[] = rows.map((r) => ({
    ceqUuid: r.ceq_uuid,
    question: r.question,
    answer: r.answer,
    rating: r.rating,
  }));

  const outputParsed = evaluationAnswersOutputSchema.safeParse(answers);
  if (!outputParsed.success) {
    console.error("[modules/evaluations] getEvaluationAnswers output validation failed:", outputParsed.error.issues);
  }

  return answers;
}
