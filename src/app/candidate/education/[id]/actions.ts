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
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getCandidateEducation as parentGetCandidateEducation,
  updateCandidateEducation as parentUpdateCandidateEducation,
  deleteCandidateEducation as parentDeleteCandidateEducation,
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
  const session = await requireRoleCapability("candidate", "candidate.read.own");

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
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

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

  // Verify the entry exists and belongs to the candidate before mutating
  const existing = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: parsed.data.educationUuid,
      candidate_id: Number(session.id),
    },
    select: { education_uuid: true },
  });

  if (!existing) {
    return { success: false, error: "Education entry not found or access denied" };
  }

  // Delegate the update to the parent action
  await parentUpdateCandidateEducation(parsed.data);

  revalidatePath("/candidate/education");
  revalidatePath(`/candidate/education/${parsed.data.educationUuid}`);

  return { success: true };
}

// ---------------------------------------------------------------------------
// deleteEducationEntry
// ---------------------------------------------------------------------------

/**
 * Delete an education entry by UUID.
 * Only the owning candidate can delete their own education entries.
 * Returns `{ success: true }` on success, `{ success: false, error }` on error.
 */
export async function deleteEducationEntry(
  educationUuid: string,
): Promise<EducationEntryResponse> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = deleteEducationEntrySchema.safeParse({ educationUuid });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Verify ownership before deleting
  const existing = await prisma.candidate_education.findFirst({
    where: {
      education_uuid: parsed.data.educationUuid,
      candidate_id: Number(session.id),
    },
    select: { education_uuid: true },
  });

  if (!existing) {
    return { success: false, error: "Education entry not found or access denied" };
  }

  await parentDeleteCandidateEducation(parsed.data.educationUuid);

  revalidatePath("/candidate/education");

  return { success: true };
}
