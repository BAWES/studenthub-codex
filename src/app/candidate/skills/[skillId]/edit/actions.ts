"use server";

// ---------------------------------------------------------------------------
// Candidate Skill [skillId]/edit — server actions for the edit page
// ---------------------------------------------------------------------------
// Re-exports from the parent [skillId] actions layer so the edit route
// has a clean import path. The SkillEditForm component imports from
// "./actions", which resolves to this file when rendered under /edit.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import type { SkillActionResult } from "../actions";
import { updateSkill as parentUpdateSkill } from "../actions";

/** Re-export types for client components */
export type { SkillActionResult };

/**
 * Update a skill entry. Delegates to the parent [skillId] action.
 * Re-validates the edit page path on success.
 */
export async function updateSkill(
  skillId: number,
  skill: string,
): Promise<SkillActionResult> {
  const result = await parentUpdateSkill(skillId, skill);

  if (result.success) {
    revalidatePath(`/candidate/skills/${skillId}`);
  }

  return result;
}
