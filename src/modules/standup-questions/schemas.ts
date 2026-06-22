import { z } from "zod";

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const standupQuestionItemSchema = z.object({
  question_uuid: z.string(),
  question: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type StandupQuestionItem = z.output<typeof standupQuestionItemSchema>;

export const listStandupQuestionsResultSchema = z.object({
  standupQuestions: z.array(standupQuestionItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().nonnegative(),
});

export type ListStandupQuestionsResult = z.output<
  typeof listStandupQuestionsResultSchema
>;

export const mutateResultSchema = z.object({
  operation: z.string(),
  message: z.string(),
});

export type MutateResult = z.output<typeof mutateResultSchema>;
