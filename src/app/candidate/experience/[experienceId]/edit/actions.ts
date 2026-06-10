"use server";

// ---------------------------------------------------------------------------
// Candidate Experience [experienceId]/edit — server actions for the edit page
// ---------------------------------------------------------------------------
// Re-exports from the parent [experienceId] actions layer so the edit route
// has a clean import path. The ExperienceEditForm component imports from
// "./actions", which resolves to this file when rendered under /edit.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import type { ExperienceActionResult } from "../../schemas";
import { updateExperienceEntry as parentUpdateExperienceEntry } from "../actions";

/** Re-export types for client components */
export type { ExperienceActionResult };

/**
 * Update an experience entry. Delegates to the parent [experienceId] action.
 * Re-validates the edit page path on success.
 */
export async function updateExperienceEntry(
  experienceId: number,
  experience: string,
  employer?: string,
  startYear?: number,
  endYear?: number,
): Promise<ExperienceActionResult> {
  const result = await parentUpdateExperienceEntry(
    experienceId,
    experience,
    employer,
    startYear,
    endYear,
  );

  if (result.success) {
    revalidatePath(`/candidate/experience/${experienceId}`);
  }

  return result;
}
