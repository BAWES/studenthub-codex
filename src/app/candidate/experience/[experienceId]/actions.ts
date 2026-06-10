"use server";

// ---------------------------------------------------------------------------
// Candidate Experience [experienceId] — server actions for the detail page
// ---------------------------------------------------------------------------
// Convenience wrappers that validate input and delegate to the parent
// list-level actions with ownership checks.
//
// Actions:
//   - getExperienceEntry      — fetch single experience entry by ID
//   - updateExperienceEntry   — update an experience entry
//   - deleteExperienceEntry   — remove an experience entry (soft-delete)
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getCandidateExperience as parentGetCandidateExperience,
  updateCandidateExperience as parentUpdateCandidateExperience,
  deleteCandidateExperience as parentDeleteCandidateExperience,
} from "../actions";

// Re-export parent types so consumers have a single import path
import type { ExperienceItem, ExperienceActionResult } from "../schemas";
export type { ExperienceItem, ExperienceActionResult };

import {
  getExperienceEntrySchema,
  updateExperienceEntrySchema,
  deleteExperienceEntrySchema,
} from "./schemas";
import type { ExperienceEntryResponse } from "./schemas";

// ---------------------------------------------------------------------------
// getExperienceEntry
// ---------------------------------------------------------------------------

/**
 * Get a single experience entry by numeric ID.
 * Delegates to the parent `getCandidateExperience` action.
 */
export async function getExperienceEntry(
  experienceId: number,
): Promise<ExperienceItem | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getExperienceEntrySchema.safeParse({ experienceId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid experience entry params");
  }

  return parentGetCandidateExperience(parsed.data.experienceId);
}

// ---------------------------------------------------------------------------
// updateExperienceEntry
// ---------------------------------------------------------------------------

/**
 * Update an experience entry.
 * Verifies ownership before updating. Delegates to parent
 * `updateCandidateExperience`.
 */
export async function updateExperienceEntry(
  experienceId: number,
  experience: string,
  employer?: string,
  startYear?: number,
  endYear?: number,
): Promise<ExperienceActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateExperienceEntrySchema.safeParse({
    experienceId,
    experience,
    employer,
    startYear,
    endYear,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Verify the entry exists and belongs to the candidate before mutating
  const existing = await prisma.candidate_experience.findFirst({
    where: {
      candidate_experience_id: parsed.data.experienceId,
      candidate_id: Number(session.id),
      deleted: 0,
    },
    select: { candidate_experience_id: true },
  });

  if (!existing) {
    return { success: false, error: "Experience entry not found or access denied" };
  }

  // Validate date range
  if (
    parsed.data.startYear !== undefined &&
    parsed.data.endYear !== undefined &&
    parsed.data.endYear < parsed.data.startYear
  ) {
    return { success: false, error: "End year cannot be before start year" };
  }

  const result = await parentUpdateCandidateExperience({
    experienceId: parsed.data.experienceId,
    experience: parsed.data.experience,
    employer: parsed.data.employer,
    startYear: parsed.data.startYear,
    endYear: parsed.data.endYear,
  });

  revalidatePath("/candidate/experience");
  revalidatePath(`/candidate/experience/${parsed.data.experienceId}`);

  return result;
}

// ---------------------------------------------------------------------------
// deleteExperienceEntry
// ---------------------------------------------------------------------------

/**
 * Delete an experience entry (soft-delete).
 * Only the owning candidate can delete their own experience entries.
 * Returns `{ success: true, experienceId }` on success.
 */
export async function deleteExperienceEntry(
  experienceId: number,
): Promise<ExperienceActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = deleteExperienceEntrySchema.safeParse({ experienceId });
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid experience ID",
    };
  }

  // Verify ownership before deleting
  const existing = await prisma.candidate_experience.findFirst({
    where: {
      candidate_experience_id: parsed.data.experienceId,
      candidate_id: Number(session.id),
      deleted: 0,
    },
    select: { candidate_experience_id: true },
  });

  if (!existing) {
    return { success: false, error: "Experience entry not found or access denied" };
  }

  await prisma.candidate_experience.update({
    where: { candidate_experience_id: parsed.data.experienceId },
    data: { deleted: 1 },
  });

  revalidatePath("/candidate/experience");

  return { success: true, experienceId: parsed.data.experienceId };
}
