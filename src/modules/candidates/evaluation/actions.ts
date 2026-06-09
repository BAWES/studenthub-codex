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
 */
export async function listQuestionsByDepartment(
  params: ListQuestionsParams,
): Promise<ListQuestionsResult> {
  await requireCapability("candidate.evaluation.read");

  const { deptId } = listQuestionsSchema.parse(params);

  const deptQuestions = await prisma.candidate_eval_dept_ques.findMany({
    where: { dept_id: deptId },
    include: {
      candidate_eval_ques: {
        select: {
          ceq_uuid: true,
          question: true,
        },
      },
    },
  });

  return deptQuestions
    .filter((dq) => dq.candidate_eval_ques !== null)
    .map((dq) => ({
      ceq_uuid: dq.candidate_eval_ques!.ceq_uuid,
      question: dq.candidate_eval_ques!.question,
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

  // Insert answers
  for (const answer of questionAnswers) {
    await prisma.candidate_evaluation_answer.create({
      data: {
        can_eval_uuid: canEvalUuid,
        ceq_uuid: answer.ceqUuid ?? null,
        question: answer.question ?? null,
        answer: answer.answer ?? null,
        rating: answer.rating ?? null,
      },
    });
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
    include: {
      candidate_evaluation_answer: {
        where: { can_eval_uuid: evaluationUuid },
      },
    },
  });

  if (!evaluation) return null;

  return {
    can_eval_uuid: evaluation.can_eval_uuid,
    candidate_id: evaluation.candidate_id,
    dept_id: evaluation.dept_id,
    start_date: evaluation.start_date ? evaluation.start_date.toISOString() : null,
    end_date: evaluation.end_date ? evaluation.end_date.toISOString() : null,
    staff_id: evaluation.staff_id,
    created_at: evaluation.created_at,
    answers: evaluation.candidate_evaluation_answer.map((a) => ({
      ceq_uuid: a.ceq_uuid,
      question: a.question,
      answer: a.answer,
      rating: a.rating,
    })),
  };
}
