"use server";

import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCandidateSkillsSchema,
  getCandidateSkillSchema,
  createCandidateSkillSchema,
  updateCandidateSkillSchema,
  deleteCandidateSkillSchema,
  skillItemSchema,
  skillListOutputSchema,
  skillActionResultSchema,
  type ListCandidateSkillsParams,
  type GetCandidateSkillParams,
  type CreateCandidateSkillParams,
  type UpdateCandidateSkillParams,
  type DeleteCandidateSkillParams,
  type SkillItem,
  type SkillListResult,
  type SkillActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_skill row to the shared item shape. */
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

/** Log output validation errors without throwing. */
function logOutputError(source: string, error: unknown): void {
  console.error(
    `[modules/candidates/skills] ${source} output failed:`,
    error,
  );
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * List skill records for a candidate (paginated).
 * Requires candidate.read capability.
 */
export async function listCandidateSkills(
  params: ListCandidateSkillsParams,
): Promise<SkillListResult> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listCandidateSkillsSchema.safeParse(params);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, pageSize: 20 };
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const where = { candidate_id: candidateId, deleted: 0 };

  const [rows, total] = await Promise.all([
    prisma.candidate_skill.findMany({
      where,
      orderBy: [
        { candidate_skill_created_at: "desc" },
        { candidate_skill_id: "desc" },
      ],
      skip,
      take: limit,
    }),
    prisma.candidate_skill.count({ where }),
  ]);

  const result: SkillListResult = {
    items: rows.map((r) => toItem(r)!),
    total,
    page,
    pageSize: limit,
  };

  // Output validation
  const outputParsed = skillListOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listCandidateSkills", outputParsed.error.issues);
  }

  return result;
}

/**
 * Get a single skill record by ID with ownership verification.
 * Requires candidate.read capability.
 * Returns null if not found or access denied.
 */
export async function getCandidateSkill(
  params: GetCandidateSkillParams,
): Promise<SkillItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = getCandidateSkillSchema.safeParse(params);
  if (!parsed.success) return null;

  const { skillId } = parsed.data;

  const row = await prisma.candidate_skill.findFirst({
    where: {
      candidate_skill_id: skillId,
      candidate_id: candidateId,
      deleted: 0,
    },
  });

  const result = toItem(row);

  // Output validation
  if (result) {
    const outputParsed = skillItemSchema.safeParse(result);
    if (!outputParsed.success) {
      logOutputError("getCandidateSkill", outputParsed.error.issues);
    }
  }

  return result;
}

/**
 * Create a new skill record for a candidate.
 * Requires candidate.profile.edit capability.
 */
export async function createCandidateSkill(
  params: CreateCandidateSkillParams,
): Promise<SkillActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = createCandidateSkillSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid skill data",
    };
  }

  const { skill } = parsed.data;

  // Prevent duplicate skill names for the same candidate
  const existing = await prisma.candidate_skill.findFirst({
    where: {
      candidate_id: candidateId,
      skill,
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
      candidate_id: candidateId,
      skill,
      deleted: 0,
      candidate_skill_created_at: now,
    },
  });

  const result: SkillActionResult = {
    success: true,
    skillId: row.candidate_skill_id,
  };

  // Output validation
  const outputParsed = skillActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("createCandidateSkill", outputParsed.error.issues);
  }

  return result;
}

/**
 * Update an existing skill record.
 * Requires candidate.profile.edit capability.
 */
export async function updateCandidateSkill(
  params: UpdateCandidateSkillParams,
): Promise<SkillActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updateCandidateSkillSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid skill data",
    };
  }

  const { skillId, skill } = parsed.data;

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
      skill,
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
    data: { skill },
  });

  const result: SkillActionResult = { success: true, skillId };

  // Output validation
  const outputParsed = skillActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateCandidateSkill", outputParsed.error.issues);
  }

  return result;
}

/**
 * Delete a skill record by ID (soft-delete using the `deleted` flag).
 * Requires candidate.profile.edit capability.
 */
export async function deleteCandidateSkill(
  params: DeleteCandidateSkillParams,
): Promise<SkillActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = deleteCandidateSkillSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid skill ID",
    };
  }

  const { skillId } = parsed.data;

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

  // Soft-delete: set deleted flag
  await prisma.candidate_skill.update({
    where: { candidate_skill_id: skillId },
    data: { deleted: 1 },
  });

  const result: SkillActionResult = { success: true, skillId };

  // Output validation
  const outputParsed = skillActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteCandidateSkill", outputParsed.error.issues);
  }

  return result;
}
