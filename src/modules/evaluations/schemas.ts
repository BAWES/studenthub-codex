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

export type EvaluationDetail = {
  uuid: string;
  candidateId: number | null;
  staffId: number | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date | null;
  candidateName: string | null;
  candidateEmail: string | null;
  staffName: string | null;
};

export type EvaluationAnswer = {
  ceqUuid: string | null;
  question: string | null;
  answer: string | null;
  rating: number | null;
};

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

export type EvaluationDetailOutput = z.infer<typeof evaluationDetailOutputSchema>;
