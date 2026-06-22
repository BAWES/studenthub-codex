"use server";

import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Student Public Profile — module-level server actions
// ---------------------------------------------------------------------------
// Uses Prisma `candidate` model (StudentHub's student entity).
// - Read operations: require `app.access` (any authenticated user)
// - Write operations: require `candidate.profile.edit` (profile owner only)
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getStudentProfileSchema,
  updateStudentProfileSchema,
  listSkillsSchema,
  addSkillSchema,
  removeSkillSchema,
  listExperienceSchema,
  addExperienceSchema,
  updateExperienceSchema,
  removeExperienceSchema,
} from "@/app/student/schemas";
import type {
  GetStudentProfileInput,
  UpdateStudentProfileInput,
  ListSkillsInput,
  AddSkillInput,
  RemoveSkillInput,
  ListExperienceInput,
  AddExperienceInput,
  UpdateExperienceInput,
  RemoveExperienceInput,
} from "@/app/student/schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StudentProfile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  photo: string | null;
  objective: string | null;
  intro: string | null;
  address: string | null;
  skills: { id: number; name: string }[];
  experience: {
    id: number;
    title: string;
    employer: string | null;
    startYear: number | null;
    endYear: number | null;
  }[];
};

export type SkillItem = {
  id: number;
  name: string;
};

export type ExperienceItem = {
  id: number;
  title: string;
  employer: string | null;
  startYear: number | null;
  endYear: number | null;
};

// ---------------------------------------------------------------------------
// getStudentProfile
// ---------------------------------------------------------------------------

/**
 * Fetch a student's public profile by their candidate ID.
 * Viewable by any authenticated user (employers, staff, candidates).
 */
export async function getStudentProfile(
  input: GetStudentProfileInput,
): Promise<StudentProfile | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getStudentProfileSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { studentId } = parsed.data;

  const candidate = await prisma.candidate.findUnique({
    where: { candidate_id: studentId, deleted: 0 },
    select: {
      candidate_id: true,
      candidate_name: true,
      candidate_email: true,
      candidate_phone: true,
      candidate_personal_photo: true,
      candidate_objective: true,
      candidate_intro: true,
      candidate_address_line1: true,
      candidate_skill: {
        where: { deleted: 0 },
        select: { candidate_skill_id: true, skill: true },
      },
      candidate_experience: {
        where: { deleted: 0 },
        select: {
          candidate_experience_id: true,
          experience: true,
          employer: true,
          start_year: true,
          end_year: true,
        },
      },
    },
  });

  if (!candidate) return null;

  return {
    id: candidate.candidate_id,
    name: candidate.candidate_name,
    email: candidate.candidate_email,
    phone: candidate.candidate_phone,
    photo: candidate.candidate_personal_photo,
    objective: candidate.candidate_objective,
    intro: candidate.candidate_intro,
    address: candidate.candidate_address_line1,
    skills: candidate.candidate_skill.map((s) => ({
      id: s.candidate_skill_id,
      name: s.skill,
    })),
    experience: candidate.candidate_experience.map((e) => ({
      id: e.candidate_experience_id,
      title: e.experience,
      employer: e.employer,
      startYear: e.start_year,
      endYear: e.end_year,
    })),
  };
}

// ---------------------------------------------------------------------------
// updateStudentProfile
// ---------------------------------------------------------------------------

/**
 * Update a student's public profile information.
 * Only the profile owner (candidate) can update.
 */
export async function updateStudentProfile(
  input: UpdateStudentProfileInput,
): Promise<{ success: true }> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateStudentProfileSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { studentId, name, objective, intro, phone, address } = parsed.data;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.candidate_name = name;
  if (objective !== undefined) data.candidate_objective = objective;
  if (intro !== undefined) data.candidate_intro = intro;
  if (phone !== undefined) data.candidate_phone = phone;
  if (address !== undefined) data.candidate_address_line1 = address;

  if (Object.keys(data).length > 0) {
    await prisma.candidate.update({
      where: { candidate_id: studentId },
      data,
    });
  }

  revalidatePath(`/student/${studentId}`);

  return { success: true };
}

// ---------------------------------------------------------------------------
// listSkills
// ---------------------------------------------------------------------------

/**
 * List skills for a student's public profile.
 * Viewable by any authenticated user.
 */
export async function listSkills(
  input: ListSkillsInput,
): Promise<SkillItem[]> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listSkillsSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const skills = await prisma.candidate_skill.findMany({
    where: { candidate_id: parsed.data.studentId, deleted: 0 },
    select: { candidate_skill_id: true, skill: true },
    orderBy: { skill: "asc" },
  });

  return skills.map((s) => ({ id: s.candidate_skill_id, name: s.skill }));
}

// ---------------------------------------------------------------------------
// addSkill
// ---------------------------------------------------------------------------

/**
 * Add a skill to a student's profile.
 * Only the profile owner can add skills.
 */
export async function addSkill(
  input: AddSkillInput,
): Promise<{ success: true; id: number }> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = addSkillSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const skill = await prisma.candidate_skill.create({
    data: {
      candidate_id: parsed.data.studentId,
      skill: parsed.data.skill,
    },
    select: { candidate_skill_id: true },
  });

  revalidatePath(`/student/${parsed.data.studentId}`);

  return { success: true, id: skill.candidate_skill_id };
}

// ---------------------------------------------------------------------------
// removeSkill
// ---------------------------------------------------------------------------

/**
 * Remove (soft-delete) a skill from a student's profile.
 * Only the profile owner can remove skills.
 */
export async function removeSkill(
  input: RemoveSkillInput,
): Promise<{ success: true }> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = removeSkillSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await prisma.candidate_skill.update({
    where: { candidate_skill_id: parsed.data.skillId },
    data: { deleted: 1 },
  });

  revalidatePath(`/student/`);

  return { success: true };
}

// ---------------------------------------------------------------------------
// listExperience
// ---------------------------------------------------------------------------

/**
 * List work experience entries for a student's public profile.
 * Viewable by any authenticated user.
 */
export async function listExperience(
  input: ListExperienceInput,
): Promise<ExperienceItem[]> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listExperienceSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const experience = await prisma.candidate_experience.findMany({
    where: { candidate_id: parsed.data.studentId, deleted: 0 },
    select: {
      candidate_experience_id: true,
      experience: true,
      employer: true,
      start_year: true,
      end_year: true,
    },
    orderBy: { start_year: "desc" },
  });

  return experience.map((e) => ({
    id: e.candidate_experience_id,
    title: e.experience,
    employer: e.employer,
    startYear: e.start_year,
    endYear: e.end_year,
  }));
}

// ---------------------------------------------------------------------------
// addExperience
// ---------------------------------------------------------------------------

/**
 * Add a work experience entry to a student's profile.
 * Only the profile owner can add experience.
 */
export async function addExperience(
  input: AddExperienceInput,
): Promise<{ success: true; id: number }> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = addExperienceSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const exp = await prisma.candidate_experience.create({
    data: {
      candidate_id: parsed.data.studentId,
      experience: parsed.data.experience,
      employer: parsed.data.employer,
      start_year: parsed.data.startYear,
      end_year: parsed.data.endYear,
    },
    select: { candidate_experience_id: true },
  });

  revalidatePath(`/student/${parsed.data.studentId}`);

  return { success: true, id: exp.candidate_experience_id };
}

// ---------------------------------------------------------------------------
// updateExperience
// ---------------------------------------------------------------------------

/**
 * Update a work experience entry.
 * Only the profile owner can update experience.
 */
export async function updateExperience(
  input: UpdateExperienceInput,
): Promise<{ success: true }> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateExperienceSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.experience !== undefined) data.experience = parsed.data.experience;
  if (parsed.data.employer !== undefined) data.employer = parsed.data.employer;
  if (parsed.data.startYear !== undefined) data.start_year = parsed.data.startYear;
  if (parsed.data.endYear !== undefined) data.end_year = parsed.data.endYear;

  if (Object.keys(data).length > 0) {
    await prisma.candidate_experience.update({
      where: { candidate_experience_id: parsed.data.experienceId },
      data,
    });
  }

  revalidatePath(`/student/`);

  return { success: true };
}

// ---------------------------------------------------------------------------
// removeExperience
// ---------------------------------------------------------------------------

/**
 * Remove (soft-delete) a work experience entry.
 * Only the profile owner can remove experience.
 */
export async function removeExperience(
  input: RemoveExperienceInput,
): Promise<{ success: true }> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = removeExperienceSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await prisma.candidate_experience.update({
    where: { candidate_experience_id: parsed.data.experienceId },
    data: { deleted: 1 },
  });

  revalidatePath(`/student/`);

  return { success: true };
}
