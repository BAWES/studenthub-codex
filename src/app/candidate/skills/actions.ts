"use server";

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCandidateSkills as moduleListSkills,
  getCandidateSkill as moduleGetSkill,
  createCandidateSkill as moduleCreateSkill,
  updateCandidateSkill as moduleUpdateSkill,
  deleteCandidateSkill as moduleDeleteSkill,
} from "@/modules/candidates/skills/actions";
import type {
  ListSkillsInput,
  CreateSkillInput,
  UpdateSkillInput,
  SkillActionResult,
  SkillItem,
} from "./schemas";
import {
  listSkillsSchema,
  getSkillSchema,
  createSkillSchema,
  updateSkillSchema,
  deleteSkillSchema,
  skillItemOutputSchema,
  skillListOutputSchema,
  skillActionResultOutputSchema,
} from "./schemas";

// Re-export types for client components
export type { SkillActionResult, SkillItem };

// ---------------------------------------------------------------------------
// Server actions — delegate to module-level implementations
// ---------------------------------------------------------------------------

/**
 * List skill records for the current candidate (paginated).
 * Delegates to modules/candidates/skills with the session's candidate ID.
 */
export async function listCandidateSkills(
  input: ListSkillsInput = {},
): Promise<SkillItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listSkillsSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid skills list params",
    );
  }

  const result = await moduleListSkills({
    candidateId: Number(session.id),
    page: parsed.data.page,
    limit: parsed.data.limit,
  });

  // Validate output shape
  const outputParsed = skillListOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/skills] listCandidateSkills output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result.items;
}

/**
 * Get a single skill record by ID.
 * Delegates to modules/candidates/skills.
 */
export async function getCandidateSkill(
  skillId: number,
): Promise<SkillItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getSkillSchema.safeParse({ skillId });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid skill ID",
    );
  }

  const result = await moduleGetSkill({
    candidateId: Number(session.id),
    skillId: parsed.data.skillId,
  });

  // Validate output shape
  if (result) {
    const outputParsed = skillItemOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[candidate/skills] getCandidateSkill output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

/**
 * Create a new skill record for the current candidate.
 * Delegates to modules/candidates/skills with the session's candidate ID.
 */
export async function createCandidateSkill(
  data: CreateSkillInput,
): Promise<SkillActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = createSkillSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid skill data",
    };
  }

  const result = await moduleCreateSkill({
    candidateId: Number(session.id),
    skill: parsed.data.skill,
  });

  revalidatePath("/candidate/skills");

  // Validate output shape
  const outputParsed = skillActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/skills] createCandidateSkill output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Update an existing skill record.
 * Delegates to modules/candidates/skills with ownership verification.
 */
export async function updateCandidateSkill(
  data: UpdateSkillInput,
): Promise<SkillActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = updateSkillSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid skill data",
    };
  }

  const result = await moduleUpdateSkill({
    candidateId: Number(session.id),
    skillId: parsed.data.skillId,
    skill: parsed.data.skill,
  });

  revalidatePath("/candidate/skills");
  revalidatePath(`/candidate/skills/${parsed.data.skillId}`);

  // Validate output shape
  const outputParsed = skillActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/skills] updateCandidateSkill output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Delete a skill record by ID (soft-delete using the `deleted` flag).
 * Delegates to modules/candidates/skills with ownership verification.
 */
export async function deleteCandidateSkill(
  skillId: number,
): Promise<SkillActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = deleteSkillSchema.safeParse({ skillId });
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid skill ID",
    };
  }

  const result = await moduleDeleteSkill({
    candidateId: Number(session.id),
    skillId: parsed.data.skillId,
  });

  revalidatePath("/candidate/skills");

  // Validate output shape
  const outputParsed = skillActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/skills] deleteCandidateSkill output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
