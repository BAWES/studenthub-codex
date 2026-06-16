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

export const createCandidateEducationSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  universityId: z.coerce.number().int().positive("University is required"),
  degreeUuid: z.string().optional().default(""),
  majorUuid: z.string().optional().default(""),
  graduationYear: z.coerce.number().int().min(1950).max(2035).optional(),
  isCurrentlyStudying: z
    .union([z.literal("1"), z.literal("0"), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === "1" || v === true) return true;
      if (v === "0" || v === false) return false;
      return false;
    }),
});

export const updateCandidateEducationSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  educationUuid: z.string().min(1, "Education UUID is required"),
  universityId: z.coerce.number().int().positive("University is required"),
  degreeUuid: z.string().optional().default(""),
  majorUuid: z.string().optional().default(""),
  graduationYear: z.coerce.number().int().min(1950).max(2035).optional(),
  isCurrentlyStudying: z
    .union([z.literal("1"), z.literal("0"), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === "1" || v === true) return true;
      if (v === "0" || v === false) return false;
      return false;
    }),
});

export const deleteCandidateEducationSchema = z.object({
  candidateId: z.number().int().positive("Candidate ID is required"),
  educationUuid: z.string().min(1, "Education UUID is required"),
});

// Input types
export type ListCandidateEducationParams = z.input<typeof listCandidateEducationSchema>;
export type GetCandidateEducationParams = z.input<typeof getCandidateEducationSchema>;
export type CreateCandidateEducationParams = z.input<typeof createCandidateEducationSchema>;
export type UpdateCandidateEducationParams = z.input<typeof updateCandidateEducationSchema>;
export type DeleteCandidateEducationParams = z.input<typeof deleteCandidateEducationSchema>;

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

/** Validates the EducationActionResult discriminated union. */
export const candidateEducationActionResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), educationUuid: z.string() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

// Output types
export type CandidateEducationItem = z.output<typeof candidateEducationItemSchema>;
export const candidateEducationDetailSchema =
  candidateEducationItemSchema.nullable();
export type CandidateEducationDetail = z.output<
  typeof candidateEducationDetailSchema
>;
export type ListCandidateEducationResult = z.output<typeof listCandidateEducationResultSchema>;
export type CandidateEducationActionResult = z.output<typeof candidateEducationActionResultSchema>;
