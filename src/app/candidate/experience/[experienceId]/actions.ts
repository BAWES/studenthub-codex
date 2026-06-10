"use server";

// ---------------------------------------------------------------------------
// Candidate Experience [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Thin convenience wrappers that delegate to the parent list-level actions.
//
// Actions:
//   - getExperienceEntry      — fetch single experience record by ID
//   - updateExperienceEntry   — update experience record
//   - deleteExperienceEntry   — soft-delete an experience record
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
 * Get a single experience record by ID.
 * Delegates to the parent `getCandidateExperience` action.
 */
export async function getExperienceEntry(
  experienceId: number,
): Promise<ExperienceItem | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getExperienceEntrySchema.safeParse({ experienceId });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid experience entry params",
    );
  }

  return parentGetCandidateExperience(parsed.data.experienceId);
}

// ---------------------------------------------------------------------------
// updateExperienceEntry
// ---------------------------------------------------------------------------

/**
 * Update an existing experience record.
 *
 * - Delegates to parent `updateCandidateExperience`.
 * - Returns `{ success: true }` on success, `{ success: false, error }` on failure.
 */
export async function updateExperienceEntry(
  experienceId: number,
  experience: string,
  employer?: string,
  startYear?: number,
  endYear?: number,
): Promise<ExperienceEntryResponse> {
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
      error: parsed.error.issues[0]?.message ?? "Invalid update params",
    };
  }

  const result = await parentUpdateCandidateExperience({
    experienceId: parsed.data.experienceId,
    experience: parsed.data.experience,
    employer: parsed.data.employer,
    startYear: parsed.data.startYear,
    endYear: parsed.data.endYear,
  });

  revalidatePath(`/candidate/experience/${parsed.data.experienceId}`);
  return result;
}

// ---------------------------------------------------------------------------
// deleteExperienceEntry
// ---------------------------------------------------------------------------

/**
 * Delete an experience record (soft-delete). Delegates to parent action.
 */
export async function deleteExperienceEntry(
  experienceId: number,
): Promise<ExperienceEntryResponse> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = deleteExperienceEntrySchema.safeParse({ experienceId });
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid experience ID",
    };
  }

  const result = await parentDeleteCandidateExperience(
    parsed.data.experienceId,
  );

  revalidatePath("/candidate/experience");
  return result;
}
