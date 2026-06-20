"use server";

// ---------------------------------------------------------------------------
// Admin Evaluations — server actions
// ---------------------------------------------------------------------------
// Ported from Yii2 admin/modules/v1/controllers/EvaluationController.php
//
// Actions:
//   - listEvaluations   — paginated list of evaluations with candidate/staff info
//   - getEvaluation     — single evaluation by UUID
//   - createEvaluation  — create a new evaluation record
//   - updateEvaluation  — update an existing evaluation
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  listEvaluationsSchema,
  getEvaluationSchema,
  createEvaluationSchema,
  updateEvaluationSchema,
  listEvaluationsResultSchema,
  getEvaluationResultSchema,
  evaluationActionResultSchema,
  type EvaluationRow,
  type ListEvaluationsInput,
  type ListEvaluationsResult,
  type GetEvaluationInput,
  type GetEvaluationResult,
  type CreateEvaluationInput,
  type UpdateEvaluationInput,
  type EvaluationActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listEvaluations
// ---------------------------------------------------------------------------

/**
 * List evaluations with pagination and optional search by candidate/staff name.
 */
export async function listEvaluations(
  input: ListEvaluationsInput = {},
): Promise<ListEvaluationsResult> {
  await requireCapability("admin.read");

  const parsed = listEvaluationsSchema.safeParse(input);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search && search.trim().length > 0) {
    where.OR = [
      { candidate: { candidate_name: { contains: search.trim() } } },
      { staff: { staff_name: { contains: search.trim() } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.candidate_evaluation.findMany({
      where: where as any,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        candidate: { select: { candidate_name: true } },
        staff: { select: { staff_name: true } },
      },
    }),
    prisma.candidate_evaluation.count({ where: where as any }),
  ]);

  const result = {
    items: rows.map((row: any): EvaluationRow => ({
      can_eval_uuid: row.can_eval_uuid,
      candidate_id: row.candidate_id ?? null,
      candidate_name: row.candidate?.candidate_name ?? null,
      dept_id: row.dept_id ?? null,
      start_date: row.start_date?.toISOString() ?? null,
      end_date: row.end_date?.toISOString() ?? null,
      staff_id: row.staff_id ?? null,
      staff_name: row.staff?.staff_name ?? null,
      created_at: row.created_at ?? null,
      updated_at: row.updated_at ?? null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Validate output shape
  const outputParsed = listEvaluationsResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/evaluations] listEvaluations output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// getEvaluation
// ---------------------------------------------------------------------------

/**
 * Get a single evaluation by its UUID.
 */
export async function getEvaluation(
  input: GetEvaluationInput,
): Promise<GetEvaluationResult> {
  await requireCapability("admin.read");

  const parsed = getEvaluationSchema.safeParse(input);
  if (!parsed.success) {
    return { evaluation: null };
  }

  const row = await prisma.candidate_evaluation.findUnique({
    where: { can_eval_uuid: parsed.data.canEvalUuid },
    include: {
      candidate: { select: { candidate_name: true } },
      staff: { select: { staff_name: true } },
    },
  });

  if (!row) {
    const result: GetEvaluationResult = { evaluation: null };

    // Validate output shape
    const outputParsed = getEvaluationResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/evaluations] getEvaluation output validation failed (not found):",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const result: GetEvaluationResult = {
    evaluation: {
      can_eval_uuid: row.can_eval_uuid,
      candidate_id: row.candidate_id ?? null,
      candidate_name: (row as any).candidate?.candidate_name ?? null,
      dept_id: row.dept_id ?? null,
      start_date: row.start_date?.toISOString() ?? null,
      end_date: row.end_date?.toISOString() ?? null,
      staff_id: row.staff_id ?? null,
      staff_name: (row as any).staff?.staff_name ?? null,
      created_at: row.created_at ?? null,
      updated_at: row.updated_at ?? null,
    },
  };

  // Validate output shape
  const outputParsed = getEvaluationResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[admin/evaluations] getEvaluation output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// createEvaluation
// ---------------------------------------------------------------------------

/**
 * Create a new evaluation record.
 */
export async function createEvaluation(
  input: CreateEvaluationInput,
): Promise<EvaluationActionResult> {
  await requireCapability("admin.write");

  const parsed = createEvaluationSchema.safeParse(input);
  if (!parsed.success) {
    const result: EvaluationActionResult = {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };

    // Validate output shape
    const outputParsed = evaluationActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/evaluations] createEvaluation output validation failed (validation error):",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  try {
    const { candidateId, deptId, startDate, endDate, staffId } = parsed.data;

    const evaluation = await prisma.candidate_evaluation.create({
      data: {
        can_eval_uuid: crypto.randomUUID(),
        candidate_id: candidateId,
        dept_id: deptId ?? null,
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        staff_id: staffId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    revalidatePath("/admin/evaluations");

    const result: EvaluationActionResult = {
      success: true,
      canEvalUuid: evaluation.can_eval_uuid,
    };

    // Validate output shape
    const outputParsed = evaluationActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/evaluations] createEvaluation output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (err) {
    const result: EvaluationActionResult = {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create evaluation",
    };

    // Validate output shape
    const outputParsed = evaluationActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/evaluations] createEvaluation output validation failed (catch):",
        outputParsed.error.issues,
      );
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// updateEvaluation
// ---------------------------------------------------------------------------

/**
 * Update an existing evaluation. Only provided fields are updated.
 */
export async function updateEvaluation(
  input: UpdateEvaluationInput,
): Promise<EvaluationActionResult> {
  await requireCapability("admin.write");

  const parsed = updateEvaluationSchema.safeParse(input);
  if (!parsed.success) {
    const result: EvaluationActionResult = {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };

    // Validate output shape
    const outputParsed = evaluationActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/evaluations] updateEvaluation output validation failed (validation error):",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  const { canEvalUuid, ...fields } = parsed.data;

  const existing = await prisma.candidate_evaluation.findUnique({
    where: { can_eval_uuid: canEvalUuid },
    select: { can_eval_uuid: true },
  });

  if (!existing) {
    const result: EvaluationActionResult = {
      success: false,
      error: "Evaluation not found",
    };

    // Validate output shape
    const outputParsed = evaluationActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/evaluations] updateEvaluation output validation failed (not found):",
        outputParsed.error.issues,
      );
    }

    return result;
  }

  try {
    const updateData: Record<string, unknown> = { updated_at: new Date() };
    if (fields.candidateId !== undefined) updateData.candidate_id = fields.candidateId;
    if (fields.deptId !== undefined) updateData.dept_id = fields.deptId;
    if (fields.startDate !== undefined) updateData.start_date = new Date(fields.startDate);
    if (fields.endDate !== undefined) updateData.end_date = new Date(fields.endDate);
    if (fields.staffId !== undefined) updateData.staff_id = fields.staffId;

    await prisma.candidate_evaluation.update({
      where: { can_eval_uuid: canEvalUuid },
      data: updateData as any,
    });

    revalidatePath("/admin/evaluations");

    const result: EvaluationActionResult = { success: true, canEvalUuid };

    // Validate output shape
    const outputParsed = evaluationActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/evaluations] updateEvaluation output validation failed:",
        outputParsed.error.issues,
      );
    }

    return result;
  } catch (err) {
    const result: EvaluationActionResult = {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update evaluation",
    };

    // Validate output shape
    const outputParsed = evaluationActionResultSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[admin/evaluations] updateEvaluation output validation failed (catch):",
        outputParsed.error.issues,
      );
    }

    return result;
  }
}
