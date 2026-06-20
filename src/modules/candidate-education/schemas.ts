import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/candidate-education actions
// ---------------------------------------------------------------------------

export const createEducationSchema = z.object({
  universityId: z.coerce.number().int().positive("University is required."),
  degreeUuid: z.string().optional().default(""),
  majorUuid: z.string().optional().default(""),
  graduationYear: z
    .union([z.coerce.number().int().min(1950).max(2035), z.literal("")])
    .optional()
    .default(""),
  isCurrentlyStudying: z
    .union([z.literal("1"), z.literal("0")])
    .optional()
    .default("0"),
});
export const updateEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
  universityId: z.coerce.number().int().positive("University is required."),
  degreeUuid: z.string().optional().default(""),
  majorUuid: z.string().optional().default(""),
  graduationYear: z
    .union([z.coerce.number().int().min(1950).max(2035), z.literal("")])
    .optional()
    .default(""),
  isCurrentlyStudying: z
    .union([z.literal("1"), z.literal("0")])
    .optional()
    .default("0"),
});
export const deleteEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});
export const getEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});
export type CreateEducationInput = z.input<typeof createEducationSchema>;
export type UpdateEducationInput = z.input<typeof updateEducationSchema>;

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

export const educationItemSchema = z.object({
  education_uuid: z.string(),
  candidate_id: z.number().int(),
  university_id: z.number().int(),
  degree_uuid: z.string().nullable(),
  major_uuid: z.string().nullable(),
  graduation_year: z.number().int().nullable(),
  is_currently_studying: z.boolean(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  university: z
    .object({
      name: z.string(),
      nameAr: z.string().optional(),
    })
    .optional(),
});

export type EducationItem = z.output<typeof educationItemSchema>;

export const createCandidateEducationResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), educationUuid: z.string() }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export type CreateCandidateEducationResult = z.output<typeof createCandidateEducationResultSchema>;

export const updateCandidateEducationResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export type UpdateCandidateEducationResult = z.output<typeof updateCandidateEducationResultSchema>;

export const deleteCandidateEducationResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export type DeleteCandidateEducationResult = z.output<typeof deleteCandidateEducationResultSchema>;
