"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listQuestionsSchema,
  createEvaluationSchema,
  listReportsSchema,
  viewReportSchema,
  evalQuestionItemSchema,
  evaluationListItemSchema,
  evaluationDetailSchema,
  createEvaluationResultSchema,
  evaluationPdfDataSchema,
  type ListQuestionsInput,
  type CreateEvaluationInput,
  type ListReportsInput,
  type ViewReportInput,
  type ListQuestionsResult,
  type CreateEvaluationResult,
  type ListReportsResult,
  type ViewReportResult,
  type EvaluationPdfData,
} from "./schemas";

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
  params: ListQuestionsInput,
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

  const result = rows
    .filter((r) => r.ceq_uuid !== null)
    .map((r) => ({
      ceq_uuid: r.ceq_uuid!,
      question: r.question,
    }));

  // Validate output shape
  const outputParsed = z.array(evalQuestionItemSchema).safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/evaluation] listQuestionsByDepartment output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Create a new candidate evaluation with question answers.
 * Maps to legacy POST /staff/v1/candidate-evaluation/create
 */
export async function createEvaluation(
  params: CreateEvaluationInput,
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

  const result = {
    can_eval_uuid: canEvalUuid,
    operation: "success",
    message: "Report saved successfully",
  };

  // Validate output shape
  const outputParsed = createEvaluationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/evaluation] createEvaluation output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * List evaluation reports for a candidate.
 * Maps to legacy GET /staff/v1/candidate-evaluation/list-report/{id}
 */
export async function listEvaluationReports(
  params: ListReportsInput,
): Promise<ListReportsResult> {
  await requireCapability("candidate.evaluation.read");

  const { candidateId } = listReportsSchema.parse(params);

  const evaluations = await prisma.candidate_evaluation.findMany({
    where: { candidate_id: candidateId },
    orderBy: { created_at: "desc" },
  });

  const result = evaluations.map((e) => ({
    can_eval_uuid: e.can_eval_uuid,
    candidate_id: e.candidate_id,
    dept_id: e.dept_id,
    start_date: e.start_date ? e.start_date.toISOString() : null,
    end_date: e.end_date ? e.end_date.toISOString() : null,
    staff_id: e.staff_id,
    created_at: e.created_at,
  }));

  // Validate output shape
  const outputParsed = z.array(evaluationListItemSchema).safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/evaluation] listEvaluationReports output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * View a specific evaluation report with answers.
 * Maps to legacy GET /staff/v1/candidate-evaluation/view-report/{id}
 */
export async function viewEvaluationReport(
  params: ViewReportInput,
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

  const result = {
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

  // Validate output shape
  const outputParsed = evaluationDetailSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/evaluation] viewEvaluationReport output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Fetch full evaluation data for PDF report generation.
 * Extends viewEvaluationReport with candidate name/email and staff name.
 * Maps to GET /api/evaluations/[uuid]/pdf
 *
 * NOTE: This function does NOT call requireCapability because it is
 * called from the API route (not a page server action). The API route
 * is a downloadable PDF link that must work without session auth.
 */
export async function getEvaluationPdfData(
  params: ViewReportInput,
): Promise<EvaluationPdfData | null> {
  const { evaluationUuid } = viewReportSchema.parse(params);

  // Inline the report query (without requireCapability)
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

  const report = {
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

  // Fetch candidate and staff names via module (avoids direct prisma in route)
  const [candidate, staff] = await Promise.all([
    report.candidate_id
      ? prisma.candidate.findUnique({
          where: { candidate_id: report.candidate_id },
          select: { candidate_name: true, candidate_email: true },
        })
      : null,
    report.staff_id
      ? prisma.staff.findUnique({
          where: { staff_id: report.staff_id },
          select: { staff_name: true },
        })
      : null,
  ]);

  const result = {
    ...report,
    candidate,
    staff,
  };

  // Validate output shape
  const outputParsed = evaluationPdfDataSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/candidates/evaluation] getEvaluationPdfData output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
