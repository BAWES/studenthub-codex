import { z } from "zod";

// ---------------------------------------------------------------------------
// Output validation schemas for src/modules/student actions
// ---------------------------------------------------------------------------

/**
 * Schema for a single skill item returned from listSkills / getStudentProfile.
 */
export const skillItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
});

/**
 * Schema for a single experience item returned from listExperience / getStudentProfile.
 */
export const experienceItemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  employer: z.string().nullable(),
  startYear: z.number().int().nullable(),
  endYear: z.number().int().nullable(),
});

/**
 * Schema for the full student profile returned from getStudentProfile.
 */
export const studentProfileSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable(),
  photo: z.string().nullable(),
  objective: z.string().nullable(),
  intro: z.string().nullable(),
  address: z.string().nullable(),
  skills: z.array(skillItemSchema),
  experience: z.array(experienceItemSchema),
});

/**
 * Schema for getStudentProfile result (profile or null).
 */
export const studentProfileResultSchema = studentProfileSchema.nullable();

/**
 * Schema for the skills list returned from listSkills.
 */
export const skillListSchema = z.array(skillItemSchema);

/**
 * Schema for the experience list returned from listExperience.
 */
export const experienceListSchema = z.array(experienceItemSchema);

/**
 * Schema for simple success-only responses (updateStudentProfile, removeSkill, updateExperience, removeExperience).
 */
export const successResultSchema = z.object({
  success: z.literal(true),
});

/**
 * Schema for create responses that return an id (addSkill, addExperience).
 */
export const createResultSchema = z.object({
  success: z.literal(true),
  id: z.number().int().positive(),
});
