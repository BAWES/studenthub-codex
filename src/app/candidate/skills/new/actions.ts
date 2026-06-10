"use server";

// ---------------------------------------------------------------------------
// Candidate Skill New — server actions for the create-skill page
// ---------------------------------------------------------------------------
// Route-level convenience wrapper that delegates to the parent list-level
// createCandidateSkill action after validating input.
//
// Actions:
//   - createSkill — create a skill entry (delegates to parent)
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import { createCandidateSkill as parentCreateSkill } from "../actions";

// Re-export parent types so consumers have a single import path
export type { SkillActionResult } from "../actions";

import { createSkillSchema } from "./schemas";

// ---------------------------------------------------------------------------
// createSkill
// ---------------------------------------------------------------------------

/**
 * Create a new skill record for the current candidate.
 * Delegates to the parent `createCandidateSkill` action.
 *
 * Returns `{ success, skillId }` or `{ success: false, error }`.
 */
export async function createSkill(
  skill: string,
): Promise<import("../actions").SkillActionResult> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = createSkillSchema.safeParse({ skill });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid skill data",
    };
  }

  const result = await parentCreateSkill({ skill: parsed.data.skill });

  if (result.success) {
    revalidatePath("/candidate/skills");
  }

  return result;
}
