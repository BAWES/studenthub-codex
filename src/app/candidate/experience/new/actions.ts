"use server";

// ---------------------------------------------------------------------------
// Candidate Experience New — server action for the create page
// ---------------------------------------------------------------------------
// Route-specific wrapper that validates input and delegates to the parent
// list-level action.
//
// Actions:
//   - createExperience  — create a new experience record (via parent)
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  createCandidateExperience as parentCreateCandidateExperience,
} from "../actions";
import type { ExperienceActionResult } from "../schemas";
import { createExperienceSchema } from "../schemas";
import type { CreateExperienceInput } from "../schemas";

// Re-export types for convenience
export type { ExperienceActionResult, CreateExperienceInput };

// ---------------------------------------------------------------------------
// createExperience
// ---------------------------------------------------------------------------

/**
 * Create a new experience record for the current candidate.
 * Validates input, checks date range, then delegates to the parent
 * `createCandidateExperience` action.
 */
export async function createExperience(
  data: CreateExperienceInput,
): Promise<ExperienceActionResult> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = createExperienceSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid experience data",
    };
  }

  // Validate date range client-side is not enough — verify server-side too
  if (
    parsed.data.startYear !== undefined &&
    parsed.data.endYear !== undefined &&
    parsed.data.endYear < parsed.data.startYear
  ) {
    return { success: false, error: "End year cannot be before start year" };
  }

  return parentCreateCandidateExperience(parsed.data);
}
