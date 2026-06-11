"use server";

// ---------------------------------------------------------------------------
// Candidate Education [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Thin convenience wrappers that delegate to the parent list-level actions.
//
// Actions:
//   - getEducationEntry      — fetch single education entry by UUID
//   - updateEducationEntry   — update education entry
//   - deleteEducationEntry   — remove an education entry
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getCandidateEducationAction as parentGetCandidateEducation,
  updateCandidateEducationAction as parentUpdateCandidateEducation,
  deleteCandidateEducationAction as parentDeleteCandidateEducation,
} from "../actions";

// Re-export parent types so consumers have a single import path
import type { EducationItem, EducationActionResult } from "../schemas";
export type { EducationItem, EducationActionResult };

import {
  getEducationEntrySchema,
  updateEducationEntrySchema,
  deleteEducationEntrySchema,
} from "./schemas";
import type { EducationEntryResponse } from "./schemas";

// ---------------------------------------------------------------------------
// getEducationEntry
// ---------------------------------------------------------------------------

/**
 * Get a single education entry with full detail (university, degree, major).
 * Delegates to the parent `getCandidateEducation` action.
 */
export async function getEducationEntry(
  educationUuid: string,
): Promise<EducationItem | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getEducationEntrySchema.safeParse({ educationUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid education entry params");
  }

  return parentGetCandidateEducation(parsed.data.educationUuid);
}

// ---------------------------------------------------------------------------
// updateEducationEntry
// ---------------------------------------------------------------------------

/**
 * Update an existing education entry.
 *
 * - Delegates to parent `updateCandidateEducation` for the update (delete+create in transaction).
 *   Ownership verification is handled by the module-level action.
 * - Returns `{ success: true }` on success, `{ success: false, error }` on failure.
 */
export async function updateEducationEntry(
  educationUuid: string,
  universityId: number,
  degreeUuid?: string,
  majorUuid?: string,
  graduationYear?: number,
  isCurrentlyStudying?: boolean,
): Promise<EducationEntryResponse> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateEducationEntrySchema.safeParse({
    educationUuid,
    universityId,
    degreeUuid,
    majorUuid,
    graduationYear,
    isCurrentlyStudying,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Delegate to the parent action (owns ownership verification + output validation)
  const result = await parentUpdateCandidateEducation({
    educationUuid: parsed.data.educationUuid,
    universityId: parsed.data.universityId,
    degreeUuid: parsed.data.degreeUuid,
    majorUuid: parsed.data.majorUuid,
    graduationYear: parsed.data.graduationYear,
    isCurrentlyStudying: parsed.data.isCurrentlyStudying,
  });

  revalidatePath("/candidate/education");
  revalidatePath(`/candidate/education/${parsed.data.educationUuid}`);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// deleteEducationEntry
// ---------------------------------------------------------------------------

/**
 * Delete an education entry by UUID.
 * Delegates to parent action (which verifies ownership).
 * Returns `{ success: true }` on success, `{ success: false, error }` on error.
 */
export async function deleteEducationEntry(
  educationUuid: string,
): Promise<EducationEntryResponse> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = deleteEducationEntrySchema.safeParse({ educationUuid });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Delegate to the parent action (owns ownership verification + output validation)
  const result = await parentDeleteCandidateEducation(parsed.data.educationUuid);

  revalidatePath("/candidate/education");

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}
