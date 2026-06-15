"use server";

import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listEvaluationsSchema,
  listEvaluationsResultSchema,
  type ListEvaluationsInput,
  type ListEvaluationsResult,
  getEvaluationInputSchema,
  evaluationDetailResultSchema,
  type GetEvaluationInput,
  type EvaluationDetailResult,
  createEvaluationSchema,
  type CreateEvaluationInput,
  updateEvaluationSchema,
  type UpdateEvaluationInput,
} from "./schemas";

// ---------------------------------------------------------------------------
// listEvaluations — List all evaluations (admin view)
// ---------------------------------------------------------------------------

export async function listEvaluations(
  params: ListEvaluationsInput = {},
): Promise<ListEvaluationsResult> {
  await requireRoleCapability("admin", "admin.read");

  const parsed = listEvaluationsSchema.safeParse(params);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { candidate: { candidate_name: { contains: search } } },
          { staff: { staff_name: { contains: search } } },
        ],
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.candidate_evaluation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        candidate: { select: { candidate_name: true } },
        staff: { select: { staff_name: true } },
      },
    }),
    prisma.candidate_evaluation.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const items = rows.map((row) => ({
    uuid: row.can_eval_uuid,
    candidateId: row.candidate_id,
    candidateName: row.candidate?.candidate_name ?? null,
    deptId: row.dept_id,
    staffId: row.staff_id,
    staffName: row.staff?.staff_name ?? null,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
  }));

  const result: ListEvaluationsResult = { items, total, page, limit, totalPages };

  const outputParsed = listEvaluationsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/evaluations] listEvaluations output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getEvaluation — Get single evaluation record
// ---------------------------------------------------------------------------

export async function getEvaluation(
  params: GetEvaluationInput,
): Promise<EvaluationDetailResult> {
  await requireRoleCapability("admin", "admin.read");

  const parsed = getEvaluationInputSchema.safeParse(params);
  if (!parsed.success) {
    return { evaluation: null };
  }

  const row = await prisma.candidate_evaluation.findUnique({
    where: { can_eval_uuid: parsed.data.uuid },
    include: {
      candidate: { select: { candidate_name: true } },
      staff: { select: { staff_name: true } },
    },
  });

  if (!row) {
    return { evaluation: null };
  }

  const evaluation = {
    uuid: row.can_eval_uuid,
    candidateId: row.candidate_id,
    candidateName: row.candidate?.candidate_name ?? null,
    deptId: row.dept_id,
    staffId: row.staff_id,
    staffName: row.staff?.staff_name ?? null,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  const result: EvaluationDetailResult = { evaluation };

  const outputParsed = evaluationDetailResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[modules/admin/evaluations] getEvaluation output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createEvaluation — Create a new evaluation record
// ---------------------------------------------------------------------------

export async function createEvaluation(
  params: CreateEvaluationInput,
): Promise<{ uuid: string | null }> {
  await requireRoleCapability("admin", "admin.mutate");

  const parsed = createEvaluationSchema.safeParse(params);
  if (!parsed.success) {
    return { uuid: null };
  }

  const { candidateId, deptId, staffId, startDate, endDate } = parsed.data;

  const row = await prisma.candidate_evaluation.create({
    data: {
      can_eval_uuid: crypto.randomUUID(),
      candidate_id: candidateId,
      dept_id: deptId,
      staff_id: staffId,
      start_date: new Date(startDate),
      end_date: new Date(endDate),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return { uuid: row.can_eval_uuid };
}

// ---------------------------------------------------------------------------
// updateEvaluation — Update an existing evaluation record
// ---------------------------------------------------------------------------

export async function updateEvaluation(
  params: UpdateEvaluationInput,
): Promise<{ success: boolean }> {
  await requireRoleCapability("admin", "admin.mutate");

  const parsed = updateEvaluationSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false };
  }

  const { uuid, ...data } = parsed.data;

  const updateData: Record<string, unknown> = {};
  if (data.candidateId !== undefined) updateData.candidate_id = data.candidateId;
  if (data.deptId !== undefined) updateData.dept_id = data.deptId;
  if (data.staffId !== undefined) updateData.staff_id = data.staffId;
  if (data.startDate !== undefined) updateData.start_date = new Date(data.startDate);
  if (data.endDate !== undefined) updateData.end_date = new Date(data.endDate);

  if (Object.keys(updateData).length === 0) {
    return { success: false };
  }

  await prisma.candidate_evaluation.update({
    where: { can_eval_uuid: uuid },
    data: updateData,
  });

  return { success: true };
}
