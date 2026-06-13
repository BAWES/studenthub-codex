// ---------------------------------------------------------------------------
// Candidate Skill [skillId]/edit — colocated server actions
// Delegates to module-level actions in @/modules/candidates/skills/actions
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { updateCandidateSkill } from "@/modules/candidates/skills/actions";
import type { SkillActionResult } from "@/modules/candidates/skills/schemas";
import { skillActionResultOutputSchema } from "./schemas";

/** Re-export types for client components */
export type { SkillActionResult };

/**
 * Update a skill entry. Delegates to the module-level action.
 * Re-validates the edit page path on success.
 */
export async function updateSkill(
  skillId: number,
  skill: string,
): Promise<SkillActionResult> {
  const result = await updateCandidateSkill({ skillId, skill });

  // Validate output shape
  const outputParsed = skillActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/skills/[id]/edit] updateSkill output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.success) {
    revalidatePath(`/candidate/skills/${skillId}`);
  }

  return result;
}
