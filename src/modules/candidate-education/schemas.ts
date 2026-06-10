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
export type EducationItem = {
  education_uuid: string;
  candidate_id: number;
  university_id: number;
  degree_uuid: string | null;
  major_uuid: string | null;
  graduation_year: number | null;
  is_currently_studying: boolean;
  created_at: Date | null;
  updated_at: Date | null;
  university?: { name: string; nameAr?: string };
};
export type CreateCandidateEducationResult =
  | { success: true; educationUuid: string }
  | { success: false; error: string };
export type UpdateCandidateEducationResult =
  | { success: true }
  | { success: false; error: string };
export type DeleteCandidateEducationResult =
  | { success: true }
  | { success: false; error: string };
