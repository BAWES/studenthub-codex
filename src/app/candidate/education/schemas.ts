import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for candidate/education actions
// ---------------------------------------------------------------------------
// Move these OUT of actions.ts so the "use server" file only exports async
// functions — Next.js requires this for "use server" files.
// ---------------------------------------------------------------------------

export const listEducationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

export const createEducationSchema = z.object({
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

export const updateEducationSchema = z.object({
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

export const deleteEducationSchema = z.object({
  educationUuid: z.string().min(1, "Education UUID is required"),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListEducationInput = z.input<typeof listEducationSchema>;
export type GetEducationInput = z.input<typeof getEducationSchema>;
export type CreateEducationInput = z.input<typeof createEducationSchema>;
export type UpdateEducationInput = z.input<typeof updateEducationSchema>;
export type DeleteEducationInput = z.input<typeof deleteEducationSchema>;

export type EducationItem = {
  education_uuid: string;
  university_id: number;
  university_name_en: string | null;
  university_name_ar: string | null;
  degree_uuid: string | null;
  degree_name_en: string | null;
  degree_name_ar: string | null;
  major_uuid: string | null;
  major_name_en: string | null;
  major_name_ar: string | null;
  graduation_year: number | null;
  is_currently_studying: boolean;
  created_at: Date | null;
  updated_at: Date | null;
};

export type EducationActionResult =
  | { success: true; educationUuid: string }
  | { success: false; error: string };
