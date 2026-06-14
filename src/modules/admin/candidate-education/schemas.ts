import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listCandidateEducationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
});

export type ListCandidateEducationInput = z.input<typeof listCandidateEducationSchema>;

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const candidateEducationRowSchema = z.object({
  education_uuid: z.string(),
  candidate_id: z.number().int(),
  candidate_name: z.string().nullable(),
  university_name: z.string(),
  degree_name: z.string().nullable(),
  major_name: z.string().nullable(),
  graduation_year: z.number().int().nullable(),
  is_currently_studying: z.boolean(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type CandidateEducationRow = z.output<typeof candidateEducationRowSchema>;

export const listCandidateEducationResultSchema = z.object({
  items: z.array(candidateEducationRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ListCandidateEducationResult = z.output<typeof listCandidateEducationResultSchema>;

// ---------------------------------------------------------------------------
// getCandidateEducation — Single record detail
// ---------------------------------------------------------------------------

export const getCandidateEducationInputSchema = z.object({
  education_uuid: z.string().min(1, "education_uuid is required"),
});

export type GetCandidateEducationInput = z.input<typeof getCandidateEducationInputSchema>;

export const candidateEducationDetailSchema = z.object({
  education_uuid: z.string(),
  candidate_id: z.number().int(),
  candidate_name: z.string().nullable(),
  university_id: z.number().int(),
  university_name: z.string(),
  degree_uuid: z.string().nullable(),
  degree_name: z.string().nullable(),
  major_uuid: z.string().nullable(),
  major_name: z.string().nullable(),
  graduation_year: z.number().int().nullable(),
  is_currently_studying: z.boolean(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export type CandidateEducationDetail = z.output<typeof candidateEducationDetailSchema>;

export const candidateEducationDetailResultSchema = z.object({
  education: candidateEducationDetailSchema.nullable(),
});

export type CandidateEducationDetailResult = z.output<typeof candidateEducationDetailResultSchema>;
