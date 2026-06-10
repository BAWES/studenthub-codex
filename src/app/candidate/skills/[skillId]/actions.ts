"use server";

// ---------------------------------------------------------------------------
// Candidate Skill [skillId] — server actions for the detail page
// ---------------------------------------------------------------------------
// Detail-level convenience wrappers that delegate to the parent list-level
// actions after validating input.
//
// Actions:
//   - getSkill    — fetch single skill detail by ID (delegates to parent)
//   - updateSkill — update a skill entry (delegates to parent)
//   - deleteSkill — soft-delete a skill entry (delegates to parent)
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getCandidateSkill as parentGetSkill,
  updateCandidateSkill as parentUpdateSkill,
  deleteCandidateSkill as parentDeleteSkill,
} from "../actions";

// Re-export parent types so consumers have a single import path
export type {
  SkillActionResult,
  SkillItem,
} from "../actions";

import { getSkillSchema, updateSkillSchema, deleteSkillSchema } from "./schemas";

// ---------------------------------------------------------------------------
// getSkill
// ---------------------------------------------------------------------------

/**
 * Get a single skill record by ID.
 * Delegates to the parent `getCandidateSkill` action.
 * Returns the skill item, or null if not found / access denied.
 */
export async function getSkill(
  skillId: number,
): Promise<import("../actions").SkillItem | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getSkillSchema.safeParse({ skillId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid skill ID");
  }

  return parentGetSkill(parsed.data.skillId);
}

// ---------------------------------------------------------------------------
// updateSkill
// ---------------------------------------------------------------------------

/**
 * Update an existing skill record.
 * Delegates to the parent `updateCandidateSkill` action.
 *
 * Returns `{ success, skillId }` or `{ success: false, error }`.
 */
export async function updateSkill(
  skillId: number,
  skill: string,
): Promise<import("../actions").SkillActionResult> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateSkillSchema.safeParse({ skillId, skill });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const result = await parentUpdateSkill({
    skillId: parsed.data.skillId,
    skill: parsed.data.skill,
  });

  if (result.success) {
    revalidatePath("/candidate/skills");
    revalidatePath(`/candidate/skills/${skillId}`);
  }

  return result;
}

// ---------------------------------------------------------------------------
// deleteSkill
// ---------------------------------------------------------------------------

/**
 * Delete a skill record by ID (soft-delete using the `deleted` flag).
 * Delegates to the parent `deleteCandidateSkill` action.
 *
 * Returns `{ success, skillId }` or `{ success: false, error }`.
 */
export async function deleteSkill(
  skillId: number,
): Promise<import("../actions").SkillActionResult> {
  await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = deleteSkillSchema.safeParse({ skillId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid skill ID",
    };
  }

  const result = await parentDeleteSkill(parsed.data.skillId);

  if (result.success) {
    revalidatePath("/candidate/skills");
  }

  return result;
}
