"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
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
} from "./schemas";

// Re-export types for client components
export type { SkillActionResult, SkillItem };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_skill row to the API shape. */
function toItem(
  row: Awaited<ReturnType<typeof prisma.candidate_skill.findFirst>>,
): SkillItem | null {
  if (!row) return null;
  return {
    candidate_skill_id: row.candidate_skill_id,
    skill: row.skill,
    created_at: row.candidate_skill_created_at,
  };
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List skill records for the current candidate (paginated).
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

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const rows = await prisma.candidate_skill.findMany({
    where: {
      candidate_id: Number(session.id),
      deleted: 0,
    },
    orderBy: [{ candidate_skill_created_at: "desc" }, { candidate_skill_id: "desc" }],
    skip,
    take: limit,
  });

  return rows.map((r) => toItem(r)!);
}

/**
 * Get a single skill record by ID.
 * Only returns records belonging to the current candidate.
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

  const row = await prisma.candidate_skill.findFirst({
    where: {
      candidate_skill_id: parsed.data.skillId,
      candidate_id: Number(session.id),
      deleted: 0,
    },
  });

  return toItem(row);
}

/**
 * Create a new skill record for the current candidate.
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

  // Prevent duplicate skill names for the same candidate
  const existing = await prisma.candidate_skill.findFirst({
    where: {
      candidate_id: Number(session.id),
      skill: parsed.data.skill,
      deleted: 0,
    },
    select: { candidate_skill_id: true },
  });
  if (existing) {
    return { success: false, error: "This skill already exists" };
  }

  const now = new Date();

  const row = await prisma.candidate_skill.create({
    data: {
      candidate_id: Number(session.id),
      skill: parsed.data.skill,
      deleted: 0,
      candidate_skill_created_at: now,
    },
  });

  revalidatePath("/candidate/skills");
  return { success: true, skillId: row.candidate_skill_id };
}

/**
 * Update an existing skill record.
 * Uses direct update — skills have no child records depending on the ID,
 * so a soft-delete+recreate pattern would break the redirect to the detail page.
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

  const candidateId = Number(session.id);
  const skillId = parsed.data.skillId;

  // Verify ownership
  const existing = await prisma.candidate_skill.findFirst({
    where: {
      candidate_skill_id: skillId,
      candidate_id: candidateId,
      deleted: 0,
    },
    select: { candidate_skill_id: true },
  });
  if (!existing) {
    return { success: false, error: "Skill not found or access denied" };
  }

  // Check for duplicate skill name (excluding this record)
  const duplicate = await prisma.candidate_skill.findFirst({
    where: {
      candidate_id: candidateId,
      skill: parsed.data.skill,
      deleted: 0,
      candidate_skill_id: { not: skillId },
    },
    select: { candidate_skill_id: true },
  });
  if (duplicate) {
    return { success: false, error: "This skill already exists" };
  }

  // Direct update — skills have no child records depending on the ID
  await prisma.candidate_skill.update({
    where: { candidate_skill_id: skillId },
    data: { skill: parsed.data.skill },
  });

  revalidatePath("/candidate/skills");
  return { success: true, skillId };
}

/**
 * Delete a skill record by ID (soft-delete using the `deleted` flag).
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

  const existing = await prisma.candidate_skill.findFirst({
    where: {
      candidate_skill_id: parsed.data.skillId,
      candidate_id: Number(session.id),
      deleted: 0,
    },
    select: { candidate_skill_id: true },
  });
  if (!existing) {
    return { success: false, error: "Skill not found or access denied" };
  }

  // Soft-delete: set deleted flag
  await prisma.candidate_skill.update({
    where: { candidate_skill_id: parsed.data.skillId },
    data: { deleted: 1 },
  });

  revalidatePath("/candidate/skills");
  return { success: true, skillId: parsed.data.skillId };
}
