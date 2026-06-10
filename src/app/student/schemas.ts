import { z } from "zod";

// ---------------------------------------------------------------------------
// Student Public Profile — Zod validation schemas
// ---------------------------------------------------------------------------

export const getStudentProfileSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
});

export type GetStudentProfileInput = z.infer<typeof getStudentProfileSchema>;

export const updateStudentProfileSchema = z.object({
  studentId: z.string().min(1),
  bio: z.string().max(2000).optional(),
  headline: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  website: z.string().url().optional().or(z.literal("")),
  linkedIn: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
});

export const addSkillSchema = z.object({
  studentId: z.string().min(1),
  skillName: z.string().min(1).max(100),
});

export const removeSkillSchema = z.object({
  studentId: z.string().min(1),
  skillName: z.string().min(1).max(100),
});

export const addExperienceSchema = z.object({
  studentId: z.string().min(1),
  title: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
});

export const updateExperienceSchema = addExperienceSchema.extend({
  experienceId: z.string().min(1),
});

export const removeExperienceSchema = z.object({
  studentId: z.string().min(1),
  experienceId: z.string().min(1),
});
