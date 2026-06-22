import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listQuestionsSchema = z.object({
  deptId: z.number().int().positive("Department ID is required"),
});

export const createEvaluationSchema = z.object({
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

export const listReportsSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
});

export const viewReportSchema = z.object({
  evaluationUuid: z.string().min(1, "Evaluation UUID is required"),
});

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single evaluation question item.
 */
export const evalQuestionItemSchema = z.object({
  ceq_uuid: z.string(),
  question: z.string().nullable(),
});

/**
 * Schema for a single evaluation list item.
 */
export const evaluationListItemSchema = z.object({
  can_eval_uuid: z.string(),
  candidate_id: z.number().int().nullable(),
  dept_id: z.number().int().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  staff_id: z.number().int().nullable(),
  created_at: z.date().nullable(),
});

/**
 * Schema for evaluation answer in report detail.
 */
export const evaluationAnswerSchema = z.object({
  ceq_uuid: z.string().nullable(),
  question: z.string().nullable(),
  answer: z.string().nullable(),
  rating: z.number().int().nullable(),
});

/**
 * Schema for evaluation detail (list item + answers).
 */
export const evaluationDetailSchema = evaluationListItemSchema.extend({
  answers: z.array(evaluationAnswerSchema).optional(),
});

/**
 * Schema for createEvaluation result.
 */
export const createEvaluationResultSchema = z.object({
  can_eval_uuid: z.string(),
  operation: z.string(),
  message: z.string(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListQuestionsInput = z.input<typeof listQuestionsSchema>;
export type CreateEvaluationInput = z.input<typeof createEvaluationSchema>;
export type ListReportsInput = z.input<typeof listReportsSchema>;
export type ViewReportInput = z.input<typeof viewReportSchema>;

export type EvalQuestionItem = z.output<typeof evalQuestionItemSchema>;
export type EvaluationListItem = z.output<typeof evaluationListItemSchema>;
export type EvaluationDetail = z.output<typeof evaluationDetailSchema>;
export type CreateEvaluationResult = z.output<
  typeof createEvaluationResultSchema
>;
/**
 * Schema for PDF report: candidate info with evaluation detail + staff info.
 */
export const evaluationPdfCandidateSchema = z.object({
  candidate_name: z.string().nullable(),
  candidate_email: z.string().nullable(),
});

export const evaluationPdfStaffSchema = z.object({
  staff_name: z.string().nullable(),
});

export const evaluationPdfDataSchema = evaluationDetailSchema.extend({
  candidate: evaluationPdfCandidateSchema.nullable(),
  staff: evaluationPdfStaffSchema.nullable(),
});

export const listQuestionsResultSchema = z.array(evalQuestionItemSchema);
export type ListQuestionsResult = z.output<typeof listQuestionsResultSchema>;
export const listReportsResultSchema = z.array(evaluationListItemSchema);
export type ListReportsResult = z.output<typeof listReportsResultSchema>;
export const viewReportResultSchema = evaluationDetailSchema.nullable();
export type ViewReportResult = z.output<typeof viewReportResultSchema>;
export type EvaluationPdfData = z.output<typeof evaluationPdfDataSchema>;
