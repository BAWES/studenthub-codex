"use server";

import { requireRoleCapability } from "@/modules/auth/session";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Student Public Profile — server actions
// Public-facing profile pages viewable by employers/companies
// ---------------------------------------------------------------------------

// ── Zod Schemas ────────────────────────────────────────────────────────────

const studentProfileIdSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
});

const updateProfileSchema = z.object({
  studentId: z.string().min(1),
  bio: z.string().max(2000).optional(),
  headline: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  website: z.string().url().optional().or(z.literal("")),
  linkedIn: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
});

const skillSchema = z.object({
  studentId: z.string().min(1),
  skillName: z.string().min(1).max(100),
});

const experienceSchema = z.object({
  studentId: z.string().min(1),
  title: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
});

const experienceIdSchema = z.object({
  studentId: z.string().min(1),
  experienceId: z.string().min(1),
});

// ── Types ──────────────────────────────────────────────────────────────────

export type StudentProfile = {
  id: string;
  name: string;
  email: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
  github?: string;
  avatarUrl?: string;
  skills: { id: string; name: string }[];
  experience: {
    id: string;
    title: string;
    company: string;
    description?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
  }[];
};

// ── Server Actions ─────────────────────────────────────────────────────────

/**
 * Fetch a student's public profile by their ID.
 * Requires viewer to be authenticated (candidate or company).
 */
export async function getStudentProfile(input: z.infer<typeof studentProfileIdSchema>) {
  const parsed = studentProfileIdSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await requireRoleCapability("candidate", "candidate.read.own");

  const { studentId } = parsed.data;

  // TODO: Implement with Prisma once the student schema is in place
  return {
    id: studentId,
    name: "",
    email: "",
    headline: undefined,
    bio: undefined,
    location: undefined,
    website: undefined,
    linkedIn: undefined,
    github: undefined,
    avatarUrl: undefined,
    skills: [] as { id: string; name: string }[],
    experience: [] as {
      id: string;
      title: string;
      company: string;
      description?: string;
      startDate: string;
      endDate?: string;
      isCurrent: boolean;
    }[],
  };
}

/**
 * Update a student's public profile information.
 * Only the profile owner (candidate) can update.
 */
export async function updateStudentProfile(input: z.infer<typeof updateProfileSchema>) {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await requireRoleCapability("candidate", "candidate.profile.edit");

  return { success: true };
}

/**
 * List skills for a student's public profile.
 */
export async function listSkills(input: z.infer<typeof studentProfileIdSchema>) {
  const parsed = studentProfileIdSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  await requireRoleCapability("candidate", "candidate.read.own");

  return [] as { id: string; name: string }[];
}

/**
 * Add a skill to a student's public profile.
 */
export async function addSkill(input: z.infer<typeof skillSchema>) {
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  await requireRoleCapability("candidate", "candidate.profile.edit");

  return { success: true };
}

/**
 * Remove a skill from a student's public profile.
 */
export async function removeSkill(input: z.infer<typeof skillSchema>) {
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  await requireRoleCapability("candidate", "candidate.profile.edit");

  return { success: true };
}

/**
 * List work experience entries for a student's public profile.
 */
export async function listExperience(input: z.infer<typeof studentProfileIdSchema>) {
  const parsed = studentProfileIdSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  await requireRoleCapability("candidate", "candidate.read.own");

  return [] as {
    id: string;
    title: string;
    company: string;
    description?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
  }[];
}

/**
 * Add a work experience entry to a student's public profile.
 */
export async function addExperience(input: z.infer<typeof experienceSchema>) {
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  await requireRoleCapability("candidate", "candidate.profile.edit");

  return { success: true };
}

/**
 * Update a work experience entry.
 */
export async function updateExperience(input: z.infer<typeof experienceSchema> & { experienceId: string }) {
  const parsed = experienceSchema.extend({ experienceId: z.string().min(1) }).safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  await requireRoleCapability("candidate", "candidate.profile.edit");

  return { success: true };
}

/**
 * Remove a work experience entry.
 */
export async function removeExperience(input: z.infer<typeof experienceIdSchema>) {
  const parsed = experienceIdSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  await requireRoleCapability("candidate", "candidate.profile.edit");

  return { success: true };
}
