import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listEvaluationsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
});

export type ListEvaluationsInput = z.input<typeof listEvaluationsSchema>;

export const getEvaluationInputSchema = z.object({
  uuid: z.string().min(1, "Evaluation UUID is required"),
});

export type GetEvaluationInput = z.input<typeof getEvaluationInputSchema>;

export const createEvaluationSchema = z.object({
  candidateId: z.number().int().positive("Candidate is required"),
  deptId: z.number().int().positive("Department is required"),
  staffId: z.number().int().positive("Staff is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export type CreateEvaluationInput = z.input<typeof createEvaluationSchema>;

export const updateEvaluationSchema = z.object({
  uuid: z.string().min(1, "Evaluation UUID is required"),
  candidateId: z.number().int().positive().optional(),
  deptId: z.number().int().positive().optional(),
  staffId: z.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type UpdateEvaluationInput = z.input<typeof updateEvaluationSchema>;

// ---------------------------------------------------------------------------
// Output types and schemas
// ---------------------------------------------------------------------------

export const evaluationRowSchema = z.object({
  uuid: z.string(),
  candidateId: z.number().int().nullable(),
  candidateName: z.string().nullable(),
  deptId: z.number().int().nullable(),
  staffId: z.number().int().nullable(),
  staffName: z.string().nullable(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  createdAt: z.date().nullable(),
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
  uuid: z.string(),
  candidateId: z.number().int().nullable(),
  candidateName: z.string().nullable(),
  deptId: z.number().int().nullable(),
  staffId: z.number().int().nullable(),
  staffName: z.string().nullable(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export type EvaluationDetail = z.output<typeof evaluationDetailSchema>;

export const evaluationDetailResultSchema = z.object({
  evaluation: evaluationDetailSchema.nullable(),
});

export type EvaluationDetailResult = z.output<typeof evaluationDetailResultSchema>;
