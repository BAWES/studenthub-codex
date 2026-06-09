"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InterviewEvaluationListItem = {
  interview_evaluation_uuid: string;
  request_uuid: string | null;
  company_id: number | null;
  candidate_id: number;
  staff_id: number | null;
  candidate_name: string | null;
  created_at: Date | null;
};

export type InterviewEvaluationListResult = {
  evaluations: InterviewEvaluationListItem[];
  total: number;
};

export type InterviewEvaluationDetailResult = InterviewEvaluationListItem | null;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listInterviewEvaluationsSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
});

export type ListInterviewEvaluationsParams = z.input<typeof listInterviewEvaluationsSchema>;

const getInterviewEvaluationSchema = z.object({
  uuid: z.string().min(1, "Interview evaluation UUID is required"),
});

export type GetInterviewEvaluationParams = z.input<typeof getInterviewEvaluationSchema>;

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List interview evaluations with optional candidate_id filter.
 * Ordered by created_at DESC (most recent first).
 * Mirrors the legacy Yii2 InterviewEvaluationController::actionList().
 *
 * @param params - Optional candidateId filter
 * @returns Interview evaluations list with total count
 */
export async function listInterviewEvaluations(
  params: ListInterviewEvaluationsParams = {},
): Promise<InterviewEvaluationListResult> {
  await requireCapability("staff.read");

  const parsed = listInterviewEvaluationsSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { candidateId } = parsed.data;

  const where: Record<string, unknown> = {};
  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }

  const [evaluations, total] = await Promise.all([
    prisma.interview_evaluation.findMany({
      where: where as any,
      orderBy: { created_at: "desc" },
      include: {
        candidate: {
          select: { candidate_name: true },
        },
      },
    }),
    prisma.interview_evaluation.count({ where: where as any }),
  ]);

  return {
    evaluations: evaluations.map((e) => ({
      interview_evaluation_uuid: e.interview_evaluation_uuid,
      request_uuid: e.request_uuid,
      company_id: e.company_id,
      candidate_id: e.candidate_id,
      staff_id: e.staff_id,
      candidate_name: e.candidate?.candidate_name ?? null,
      created_at: e.created_at,
    })),
    total,
  };
}

/**
 * Get a single interview evaluation by UUID.
 * Returns null if not found.
 * Mirrors the legacy Yii2 InterviewEvaluationController::actionView($id).
 *
 * @param params - Object with `uuid` (interview evaluation UUID)
 * @returns The interview evaluation record, or null if not found
 */
export async function getInterviewEvaluation(
  params: GetInterviewEvaluationParams,
): Promise<InterviewEvaluationDetailResult> {
  await requireCapability("staff.read");

  const parsed = getInterviewEvaluationSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid interview evaluation UUID");
  }

  const { uuid } = parsed.data;

  const evaluation = await prisma.interview_evaluation.findFirst({
    where: { interview_evaluation_uuid: uuid },
    include: {
      candidate: {
        select: { candidate_name: true },
      },
    },
  });

  if (!evaluation) {
    return null;
  }

  return {
    interview_evaluation_uuid: evaluation.interview_evaluation_uuid,
    request_uuid: evaluation.request_uuid,
    company_id: evaluation.company_id,
    candidate_id: evaluation.candidate_id,
    staff_id: evaluation.staff_id,
    candidate_name: evaluation.candidate?.candidate_name ?? null,
    created_at: evaluation.created_at,
  };
}
