"use server";

// ---------------------------------------------------------------------------
// Candidate Experience [experienceId] — server actions for the detail page
// ---------------------------------------------------------------------------
// Convenience wrappers that validate input and delegate to the parent
// list-level actions with ownership checks via the module-level layer.
//
// Actions:
//   - getExperienceEntry      — fetch single experience entry by ID
//   - updateExperienceEntry   — update an experience entry
//   - deleteExperienceEntry   — remove an experience entry (soft-delete)
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
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
 * Delegates to parent `updateCandidateExperience` which handles
 * ownership verification via the module-level layer.
 */
export async function updateExperienceEntry(
  experienceId: number,
  experience: string,
  employer?: string,
  startYear?: number,
  endYear?: number,
): Promise<ExperienceActionResult> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

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

  // Delegate to the parent action (owns ownership verification via module-level)
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
 * Delegates to parent `deleteCandidateExperience` which handles
 * ownership verification via the module-level layer.
 * Returns `{ success: true, experienceId }` on success.
 */
export async function deleteExperienceEntry(
  experienceId: number,
): Promise<ExperienceActionResult> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = deleteExperienceEntrySchema.safeParse({ experienceId });
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid experience ID",
    };
  }

  // Delegate to the parent action (owns ownership verification via module-level)
  const result = await parentDeleteCandidateExperience(parsed.data.experienceId);

  revalidatePath("/candidate/experience");

  return result;
}
