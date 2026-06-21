import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas (Zod)
// ---------------------------------------------------------------------------

export const listExamsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().optional(),
  staffId: z.coerce.number().int().optional(),
});

export const getExamSchema = z.object({
  examUuid: z.string().min(1, "Exam UUID is required"),
});

export const examChoiceInputSchema = z.object({
  choiceValueEn: z.string().min(1).max(255),
  choiceValueAr: z.string().max(255).optional(),
  choiceSortOrder: z.number().int().optional(),
});

export const examQuestionInputSchema = z.object({
  questionType: z.number().int().optional(),
  questionEn: z.string().min(1, "Question text (EN) is required").max(255),
  questionAr: z.string().max(255).optional(),
  questionFileExtensions: z.string().max(255).optional(),
  questionFileMaxsize: z.number().int().optional(),
  questionSortOrder: z.number().int().optional(),
  choices: z.array(examChoiceInputSchema).optional().default([]),
});

export const createExamSchema = z.object({
  titleEn: z.string().min(1, "English title is required").max(255),
  titleAr: z.string().max(255).optional(),
  descriptionEn: z.string().max(255).optional(),
  descriptionAr: z.string().max(255).optional(),
  staffId: z.number().int().optional(),
  questions: z.array(examQuestionInputSchema).optional().default([]),
});

export const updateExamSchema = z.object({
  examUuid: z.string().min(1, "Exam UUID is required"),
  titleEn: z.string().max(255).optional(),
  titleAr: z.string().max(255).optional(),
  descriptionEn: z.string().max(255).optional(),
  descriptionAr: z.string().max(255).optional(),
  questions: z.array(examQuestionInputSchema).optional(),
});

export const deleteExamSchema = z.object({
  examUuid: z.string().min(1, "Exam UUID is required"),
});

export const listCandidateExamsSchema = z.object({
  candidateId: z.coerce.number().int().positive(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const submitExamAnswersSchema = z.object({
  examUuid: z.string().min(1, "Exam UUID is required"),
  candidateId: z.coerce.number().int().positive(),
  answers: z.array(
    z.object({
      questionUuid: z.string().min(1),
      answer: z.string().max(255).optional(),
    }),
  ).min(1, "At least one answer is required"),
});

export const gradeExamAnswerSchema = z.object({
  answerUuid: z.string().min(1, "Answer UUID is required"),
  grade: z.number().int().min(0).max(100),
});

export const assignExamToCandidateSchema = z.object({
  examUuid: z.string().min(1, "Exam UUID is required"),
  candidateId: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const examChoiceRowSchema = z.object({
  choice_uuid: z.string(),
  choice_value_en: z.string(),
  choice_value_ar: z.string().nullable(),
  choice_sort_order: z.number().int().nullable(),
});

export const examQuestionRowSchema = z.object({
  question_uuid: z.string(),
  question_type: z.number().int().nullable(),
  question_en: z.string(),
  question_ar: z.string().nullable(),
  question_file_extensions: z.string().nullable(),
  question_file_maxsize: z.number().int().nullable(),
  question_sort_order: z.number().int().nullable(),
  choices: z.array(examChoiceRowSchema),
});

export const examRowSchema = z.object({
  exam_uuid: z.string(),
  title_en: z.string(),
  title_ar: z.string().nullable(),
  description_en: z.string().nullable(),
  description_ar: z.string().nullable(),
  staff_id: z.number().int().nullable(),
  is_deleted: z.boolean().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  question_count: z.number().int().nonnegative(),
});

export const examDetailSchema = z.object({
  exam_uuid: z.string(),
  title_en: z.string(),
  title_ar: z.string().nullable(),
  description_en: z.string().nullable(),
  description_ar: z.string().nullable(),
  staff_id: z.number().int().nullable(),
  is_deleted: z.boolean().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  questions: z.array(examQuestionRowSchema),
});

export const listExamsResultSchema = z.object({
  exams: z.array(examRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const examActionResponseSchema = z.object({
  operation: z.enum(["success", "error"]),
  message: z.string(),
  data: examRowSchema.optional(),
});

export const submitExamAnswersResultSchema = z.object({
  answerCount: z.number().int().nonnegative(),
  examUuid: z.string(),
});

export const examAnswerRowSchema = z.object({
  answer_uuid: z.string(),
  question_uuid: z.string(),
  question_en: z.string(),
  answer: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const listCandidateExamsResultSchema = z.object({
  exams: z.array(examRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const examGradeResultSchema = z.object({
  answer_uuid: z.string(),
  candidate_id: z.number().int(),
  question_en: z.string(),
  answer: z.string().nullable(),
});

// ---------------------------------------------------------------------------
// TypeScript types (co-located for readability)
// ---------------------------------------------------------------------------

export type ListExamsInput = z.input<typeof listExamsSchema>;
export type GetExamInput = z.input<typeof getExamSchema>;
export type CreateExamInput = z.input<typeof createExamSchema>;
export type UpdateExamInput = z.input<typeof updateExamSchema>;
export type DeleteExamInput = z.input<typeof deleteExamSchema>;
export type ListCandidateExamsInput = z.input<typeof listCandidateExamsSchema>;
export type SubmitExamAnswersInput = z.input<typeof submitExamAnswersSchema>;
export type GradeExamAnswerInput = z.input<typeof gradeExamAnswerSchema>;
export type AssignExamToCandidateInput = z.input<typeof assignExamToCandidateSchema>;

export type ExamRow = z.output<typeof examRowSchema>;
export type ExamDetail = z.output<typeof examDetailSchema>;
export type ExamQuestionRow = z.output<typeof examQuestionRowSchema>;
export type ExamChoiceRow = z.output<typeof examChoiceRowSchema>;
export type ExamActionResponse = z.output<typeof examActionResponseSchema>;
export type SubmitExamAnswersResult = z.output<typeof submitExamAnswersResultSchema>;
export type ListCandidateExamsResult = z.output<typeof listCandidateExamsResultSchema>;
export type ExamAnswerRow = z.output<typeof examAnswerRowSchema>;
export type ExamGradeResult = z.output<typeof examGradeResultSchema>;
