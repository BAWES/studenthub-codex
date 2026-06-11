import { z } from "zod";

// ---------------------------------------------------------------------------
// Input validation schemas
// ---------------------------------------------------------------------------

export const listCandidateEducationSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getCandidateEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

// Input types
export type ListCandidateEducationParams = z.input<typeof listCandidateEducationSchema>;
export type GetCandidateEducationParams = z.input<typeof getCandidateEducationSchema>;

// ---------------------------------------------------------------------------
// Output validation schemas
// ---------------------------------------------------------------------------

export const candidateEducationItemSchema = z.object({
  education_uuid: z.string(),
  candidate_id: z.number().int(),
  university_id: z.number().int(),
  university_name_en: z.string().nullable(),
  university_name_ar: z.string().nullable(),
  degree_uuid: z.string().nullable(),
  degree_name_en: z.string().nullable(),
  degree_name_ar: z.string().nullable(),
  major_uuid: z.string().nullable(),
  major_name_en: z.string().nullable(),
  major_name_ar: z.string().nullable(),
  graduation_year: z.number().int().nullable(),
  is_currently_studying: z.boolean(),
  created_at: z.coerce.date().nullable(),
  updated_at: z.coerce.date().nullable(),
});

export const listCandidateEducationResultSchema = z.object({
  items: z.array(candidateEducationItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

// Output types
export type CandidateEducationItem = z.output<typeof candidateEducationItemSchema>;
export type CandidateEducationDetail = CandidateEducationItem | null;
export type ListCandidateEducationResult = z.output<typeof listCandidateEducationResultSchema>;
