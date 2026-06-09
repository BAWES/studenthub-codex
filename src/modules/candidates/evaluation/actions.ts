"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listQuestionsSchema = z.object({
  deptId: z.number().int().positive("Department ID is required"),
});

const createEvaluationSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  deptId: z.number().int().positive("Department ID is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  questionAnswers: z
    .array(
      z.object({
        ceqUuid: z.string().optional(),
        question: z.string().optional(),
        answer: z.string().optional().nullable(),
        rating: z.number().int().min(1).max(5).optional(),
      }),
    )
    .min(1, "At least one question answer is required"),
});

const listReportsSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
});

const viewReportSchema = z.object({
  evaluationUuid: z.string().min(1, "Evaluation UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListQuestionsParams = z.input<typeof listQuestionsSchema>;
export type CreateEvaluationParams = z.input<typeof createEvaluationSchema>;
export type ListReportsParams = z.input<typeof listReportsSchema>;
export type ViewReportParams = z.input<typeof viewReportSchema>;

export type EvalQuestionItem = {
  ceq_uuid: string;
  question: string | null;
};

export type EvaluationListItem = {
  can_eval_uuid: string;
  candidate_id: number | null;
  dept_id: number | null;
  start_date: string | null;
  end_date: string | null;
  staff_id: number | null;
  created_at: Date | null;
};

export type EvaluationDetail = EvaluationListItem & {
  answers?: Array<{
    ceq_uuid: string | null;
    question: string | null;
    answer: string | null;
    rating: number | null;
  }>;
};

export type CreateEvaluationResult = {
  can_eval_uuid: string;
  operation: string;
  message: string;
};

export type ListQuestionsResult = EvalQuestionItem[];
export type ListReportsResult = EvaluationListItem[];
export type ViewReportResult = EvaluationDetail | null;

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List evaluation questions by department ID.
 * Maps to legacy GET /staff/v1/candidate-evaluation/list-question-by-dept/{id}
 *
 * NOTE: candidate_eval_dept_ques and candidate_evaluation_answer are
 * @@ignore in Prisma (no valid unique identifier). Use raw SQL for these
 * tables.
 */
export async function listQuestionsByDepartment(
  params: ListQuestionsParams,
): Promise<ListQuestionsResult> {
  await requireCapability("candidate.evaluation.read");

  const { deptId } = listQuestionsSchema.parse(params);

  const rows = await prisma.$queryRawUnsafe<Array<{ ceq_uuid: string | null; question: string | null }>>(
    `SELECT deq.ceq_uuid, eq.question
     FROM candidate_eval_dept_ques deq
     LEFT JOIN candidate_eval_ques eq ON eq.ceq_uuid = deq.ceq_uuid
     WHERE deq.dept_id = ?`,
    deptId,
  );

  return rows
    .filter((r) => r.ceq_uuid !== null)
    .map((r) => ({
      ceq_uuid: r.ceq_uuid!,
      question: r.question,
    }));
}

/**
 * Create a new candidate evaluation with question answers.
 * Maps to legacy POST /staff/v1/candidate-evaluation/create
 */
export async function createEvaluation(
  params: CreateEvaluationParams,
): Promise<CreateEvaluationResult> {
  await requireCapability("candidate.evaluation.write");

  const { candidateId, deptId, startDate, endDate, questionAnswers } =
    createEvaluationSchema.parse(params);

  const canEvalUuid = `can_eval_${crypto.randomUUID()}`;
  const now = new Date();

  await prisma.candidate_evaluation.create({
    data: {
      can_eval_uuid: canEvalUuid,
      candidate_id: candidateId,
      dept_id: deptId,
      start_date: startDate ? new Date(startDate) : null,
      end_date: endDate ? new Date(endDate) : null,
      staff_id: null,
      created_at: now,
      updated_at: now,
    },
  });

  // Insert answers via raw SQL
  for (const answer of questionAnswers) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO candidate_evaluation_answer (can_eval_uuid, ceq_uuid, question, answer, rating)
       VALUES (?, ?, ?, ?, ?)`,
      canEvalUuid,
      answer.ceqUuid ?? null,
      answer.question ?? null,
      answer.answer ?? null,
      answer.rating ?? null,
    );
  }

  revalidatePath("/staff/candidates/evaluation");

  return {
    can_eval_uuid: canEvalUuid,
    operation: "success",
    message: "Report saved successfully",
  };
}

/**
 * List evaluation reports for a candidate.
 * Maps to legacy GET /staff/v1/candidate-evaluation/list-report/{id}
 */
export async function listEvaluationReports(
  params: ListReportsParams,
): Promise<ListReportsResult> {
  await requireCapability("candidate.evaluation.read");

  const { candidateId } = listReportsSchema.parse(params);

  const evaluations = await prisma.candidate_evaluation.findMany({
    where: { candidate_id: candidateId },
    orderBy: { created_at: "desc" },
  });

  return evaluations.map((e) => ({
    can_eval_uuid: e.can_eval_uuid,
    candidate_id: e.candidate_id,
    dept_id: e.dept_id,
    start_date: e.start_date ? e.start_date.toISOString() : null,
    end_date: e.end_date ? e.end_date.toISOString() : null,
    staff_id: e.staff_id,
    created_at: e.created_at,
  }));
}

/**
 * View a specific evaluation report with answers.
 * Maps to legacy GET /staff/v1/candidate-evaluation/view-report/{id}
 */
export async function viewEvaluationReport(
  params: ViewReportParams,
): Promise<ViewReportResult> {
  await requireCapability("candidate.evaluation.read");

  const { evaluationUuid } = viewReportSchema.parse(params);

  const evaluation = await prisma.candidate_evaluation.findUnique({
    where: { can_eval_uuid: evaluationUuid },
  });

  if (!evaluation) return null;

  // Fetch answers via raw SQL (candidate_evaluation_answer has no PK, @@ignore'd)
  const answers = await prisma.$queryRawUnsafe<
    Array<{ ceq_uuid: string | null; question: string | null; answer: string | null; rating: number | null }>
  >(
    `SELECT ceq_uuid, question, answer, rating
     FROM candidate_evaluation_answer
     WHERE can_eval_uuid = ?`,
    evaluationUuid,
  );

  return {
    can_eval_uuid: evaluation.can_eval_uuid,
    candidate_id: evaluation.candidate_id,
    dept_id: evaluation.dept_id,
    start_date: evaluation.start_date ? evaluation.start_date.toISOString() : null,
    end_date: evaluation.end_date ? evaluation.end_date.toISOString() : null,
    staff_id: evaluation.staff_id,
    created_at: evaluation.created_at,
    answers: answers.map((a) => ({
      ceq_uuid: a.ceq_uuid,
      question: a.question,
      answer: a.answer,
      rating: a.rating,
    })),
  };
}
