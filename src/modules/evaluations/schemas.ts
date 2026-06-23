import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const getEvaluationParamsSchema = z.object({
  uuid: z.string().uuid("Invalid evaluation UUID"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EvaluationDetail = z.output<typeof evaluationDetailOutputSchema>;
export type EvaluationAnswer = z.output<typeof evaluationAnswerOutputSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const evaluationDetailOutputSchema = z.object({
  uuid: z.string(),
  candidateId: z.number().int().nullable(),
  staffId: z.number().int().nullable(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  createdAt: z.date().nullable(),
  candidateName: z.string().nullable(),
  candidateEmail: z.string().nullable(),
  staffName: z.string().nullable(),
});

export const evaluationAnswerOutputSchema = z.object({
  ceqUuid: z.string().nullable(),
  question: z.string().nullable(),
  answer: z.string().nullable(),
  rating: z.number().nullable(),
});

export const evaluationAnswersOutputSchema = z.array(evaluationAnswerOutputSchema);

export type EvaluationDetailOutput = EvaluationDetail;
