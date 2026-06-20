import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for admin/evaluations actions
// ---------------------------------------------------------------------------

export const listEvaluationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
});

export type ListEvaluationsInput = z.input<typeof listEvaluationsSchema>;

export const getEvaluationSchema = z.object({
  canEvalUuid: z.string().min(1, "Evaluation UUID is required"),
});

export type GetEvaluationInput = z.input<typeof getEvaluationSchema>;

export const createEvaluationSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate is required"),
  deptId: z.coerce.number().int().positive().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  staffId: z.coerce.number().int().positive("Staff is required"),
});

export type CreateEvaluationInput = z.input<typeof createEvaluationSchema>;

export const updateEvaluationSchema = z.object({
  canEvalUuid: z.string().min(1, "Evaluation UUID is required"),
  candidateId: z.coerce.number().int().positive().optional(),
  deptId: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  staffId: z.coerce.number().int().positive().optional(),
});

export type UpdateEvaluationInput = z.input<typeof updateEvaluationSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const evaluationRowSchema = z.object({
  can_eval_uuid: z.string(),
  candidate_id: z.number().int().nullable(),
  candidate_name: z.string().nullable(),
  dept_id: z.number().int().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  staff_id: z.number().int().nullable(),
  staff_name: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type EvaluationRow = z.output<typeof evaluationRowSchema>;

export const listEvaluationsResultSchema = z.object({
  items: z.array(evaluationRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListEvaluationsResult = z.output<typeof listEvaluationsResultSchema>;

export const evaluationDetailSchema = z.object({
  can_eval_uuid: z.string(),
  candidate_id: z.number().int().nullable(),
  candidate_name: z.string().nullable(),
  dept_id: z.number().int().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  staff_id: z.number().int().nullable(),
  staff_name: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type EvaluationDetail = z.output<typeof evaluationDetailSchema>;

export const getEvaluationResultSchema = z.object({
  evaluation: evaluationDetailSchema.nullable(),
});

export type GetEvaluationResult = z.output<typeof getEvaluationResultSchema>;

export const evaluationActionResultSchema = z.object({
  success: z.boolean(),
  canEvalUuid: z.string().optional(),
  error: z.string().optional(),
});

export type EvaluationActionResult = z.output<typeof evaluationActionResultSchema>;
