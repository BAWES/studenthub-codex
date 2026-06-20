import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas — colocated with student public profile server actions
// ---------------------------------------------------------------------------
// Uses Prisma `candidate` model (StudentHub's student entity).
// Public-facing profile data viewable by employers and authenticated users.
// ---------------------------------------------------------------------------

export const getStudentProfileSchema = z.object({
  studentId: z.coerce.number().finite().int().positive("Student ID is required"),
});

export const updateStudentProfileSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  objective: z.string().max(255).optional(),
  intro: z.string().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
});

export const listSkillsSchema = z.object({
  studentId: z.coerce.number().int().positive(),
});

export const addSkillSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  skill: z.string().min(1, "Skill name is required").max(128),
});

export const removeSkillSchema = z.object({
  skillId: z.coerce.number().int().positive(),
});

export const listExperienceSchema = z.object({
  studentId: z.coerce.number().int().positive(),
});

export const addExperienceSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  experience: z.string().min(1, "Experience title is required").max(128),
  employer: z.string().max(255).optional(),
  startYear: z.coerce.number().int().optional(),
  endYear: z.coerce.number().int().optional(),
});

export const updateExperienceSchema = z.object({
  experienceId: z.coerce.number().int().positive(),
  experience: z.string().min(1).max(128).optional(),
  employer: z.string().max(255).optional(),
  startYear: z.coerce.number().int().optional(),
  endYear: z.coerce.number().int().optional(),
});

export const removeExperienceSchema = z.object({
  experienceId: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GetStudentProfileInput = z.input<typeof getStudentProfileSchema>;
export type UpdateStudentProfileInput = z.input<typeof updateStudentProfileSchema>;
export type ListSkillsInput = z.input<typeof listSkillsSchema>;
export type AddSkillInput = z.input<typeof addSkillSchema>;
export type RemoveSkillInput = z.input<typeof removeSkillSchema>;
export type ListExperienceInput = z.input<typeof listExperienceSchema>;
export type AddExperienceInput = z.input<typeof addExperienceSchema>;
export type UpdateExperienceInput = z.input<typeof updateExperienceSchema>;
export type RemoveExperienceInput = z.input<typeof removeExperienceSchema>;
