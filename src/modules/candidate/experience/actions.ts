"use server";

// ---------------------------------------------------------------------------
// Candidate Experience — module-level server actions
// ---------------------------------------------------------------------------
// Ported from app/candidate/experience and src/modules/candidates/experience.
// Handles session extraction, Zod validation, Prisma queries, and output
// validation in one cohesive layer.
//
// Actions:
//   - listCandidateExperience   — list non-deleted experiences (newest first)
//   - getCandidateExperience    — single experience entry by ID
//   - createCandidateExperience — create a new experience entry
//   - updateCandidateExperience — update an existing entry (ownership verified)
//   - deleteCandidateExperience — soft-delete an entry (ownership verified)
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listExperienceSchema,
  getExperienceSchema,
  createExperienceSchema,
  updateExperienceSchema,
  deleteExperienceSchema,
  experienceItemOutputSchema,
  experienceActionResultOutputSchema,
  type ListExperienceInput,
  type CreateExperienceInput,
  type UpdateExperienceInput,
  type ExperienceActionResult,
  type ExperienceItem,
} from "./schemas";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function validateDateRange(startYear?: number, endYear?: number): string | null {
  if (startYear !== undefined && endYear !== undefined && endYear < startYear) {
    return "End year cannot be before start year";
  }
  return null;
}

function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/candidate/experience] ${source} output validation failed:`, error);
}

/** Map a Prisma row to the consumer-facing ExperienceItem shape. */
function toExperienceItem(i: Record<string, unknown>): ExperienceItem {
  return {
    candidate_experience_id: i.candidate_experience_id as number,
    candidate_id: i.candidate_id as number,
    experience: i.experience as string,
    employer: i.employer as string | null,
    start_year: i.start_year as number | null,
    end_year: i.end_year as number | null,
    created_at: i.candidate_experience_created_at as Date,
  } as ExperienceItem;
}

// ---------------------------------------------------------------------------
// listCandidateExperience
// ---------------------------------------------------------------------------

/**
 * List experience records for the current candidate (non-deleted, newest first).
 */
export async function listCandidateExperience(
  input: ListExperienceInput = {},
): Promise<ExperienceItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = listExperienceSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid experience list params",
    );
  }

  const { page, limit } = parsed.data;

  const where: { deleted: number; candidate_id?: number } = { deleted: 0 };
  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }

  const [items, total] = await Promise.all([
    prisma.candidate_experience.findMany({
      where,
      orderBy: { candidate_experience_id: "desc" },
      skip: page && limit ? (page - 1) * limit : undefined,
      take: limit,
    }),
    prisma.candidate_experience.count({ where }),
  ]);

  const mapped = items.map((i) => toExperienceItem(i as unknown as Record<string, unknown>));

  // Validate output shape
  const listSchema = z.array(experienceItemOutputSchema);
  const validatedList = listSchema.safeParse(mapped);
  if (!validatedList.success) {
    logOutputError("listCandidateExperience", validatedList.error.issues);
  }

  return mapped;
}

// ---------------------------------------------------------------------------
// getCandidateExperience
// ---------------------------------------------------------------------------

/**
 * Get a single experience record by ID, scoped to the current candidate.
 */
export async function getCandidateExperience(
  experienceId: number,
): Promise<ExperienceItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const parsed = getExperienceSchema.safeParse({ experienceId });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid experience ID",
    );
  }

  const item = await prisma.candidate_experience.findFirst({
    where: {
      candidate_experience_id: parsed.data.experienceId,
      candidate_id: candidateId,
      deleted: 0,
    },
  });

  const experienceItem: ExperienceItem | null = item
    ? toExperienceItem(item as unknown as Record<string, unknown>)
    : null;

  // Validate output shape
  const validatedItem = experienceItemOutputSchema.nullable().safeParse(experienceItem);
  if (!validatedItem.success) {
    logOutputError("getCandidateExperience", validatedItem.error.issues);
  }

  return experienceItem;
}

// ---------------------------------------------------------------------------
// createCandidateExperience
// ---------------------------------------------------------------------------

/**
 * Create a new experience record for the current candidate.
 */
export async function createCandidateExperience(
  data: CreateExperienceInput,
): Promise<ExperienceActionResult> {
  const parsed = createExperienceSchema.safeParse(data);
  if (!parsed.success) {
    const errorResult: ExperienceActionResult = {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid experience data",
    };
    const validated = experienceActionResultOutputSchema.safeParse(errorResult);
    if (!validated.success) logOutputError("createCandidateExperience", validated.error.issues);
    return errorResult;
  }

  const dateError = validateDateRange(parsed.data.startYear, parsed.data.endYear);
  if (dateError) {
    return { success: false, error: dateError };
  }

  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const newItem = await prisma.candidate_experience.create({
    data: {
      candidate_id: Number(session.id),
      experience: parsed.data.experience,
      employer: parsed.data.employer ?? null,
      start_year: parsed.data.startYear ?? null,
      end_year: parsed.data.endYear ?? null,
      deleted: 0,
    },
  });

  revalidatePath("/candidate/experience");

  const result: ExperienceActionResult = {
    success: true,
    experienceId: newItem.candidate_experience_id,
  };

  const validated = experienceActionResultOutputSchema.safeParse(result);
  if (!validated.success) logOutputError("createCandidateExperience", validated.error.issues);

  return result;
}

// ---------------------------------------------------------------------------
// updateCandidateExperience
// ---------------------------------------------------------------------------

/**
 * Update an existing experience record with ownership verification.
 */
export async function updateCandidateExperience(
  data: UpdateExperienceInput,
): Promise<ExperienceActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = updateExperienceSchema.safeParse(data);
  if (!parsed.success) {
    const errorResult: ExperienceActionResult = {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid experience data",
    };
    const validated = experienceActionResultOutputSchema.safeParse(errorResult);
    if (!validated.success) logOutputError("updateCandidateExperience", validated.error.issues);
    return errorResult;
  }

  const dateError = validateDateRange(parsed.data.startYear, parsed.data.endYear);
  if (dateError) {
    return { success: false, error: dateError };
  }

  // Verify ownership
  const existing = await prisma.candidate_experience.findFirst({
    where: {
      candidate_experience_id: parsed.data.experienceId,
      candidate_id: candidateId,
      deleted: 0,
    },
    select: { candidate_experience_id: true },
  });
  if (!existing) {
    return { success: false, error: "Experience entry not found or access denied" };
  }

  await prisma.candidate_experience.update({
    where: { candidate_experience_id: parsed.data.experienceId },
    data: {
      ...(parsed.data.experience !== undefined && { experience: parsed.data.experience }),
      ...(parsed.data.employer !== undefined && { employer: parsed.data.employer }),
      ...(parsed.data.startYear !== undefined && { start_year: parsed.data.startYear }),
      ...(parsed.data.endYear !== undefined && { end_year: parsed.data.endYear }),
    },
  });

  revalidatePath("/candidate/experience");

  const result: ExperienceActionResult = { success: true, experienceId: parsed.data.experienceId };

  const validated = experienceActionResultOutputSchema.safeParse(result);
  if (!validated.success) logOutputError("updateCandidateExperience", validated.error.issues);

  return result;
}

// ---------------------------------------------------------------------------
// deleteCandidateExperience
// ---------------------------------------------------------------------------

/**
 * Delete an experience record (soft-delete using the `deleted` flag).
 */
export async function deleteCandidateExperience(
  experienceId: number,
): Promise<ExperienceActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");
  const candidateId = Number(session.id);

  const parsed = deleteExperienceSchema.safeParse({ experienceId });
  if (!parsed.success) {
    const errorResult: ExperienceActionResult = {
      success: false,
      error: "Invalid experience ID",
    };
    const validated = experienceActionResultOutputSchema.safeParse(errorResult);
    if (!validated.success) logOutputError("deleteCandidateExperience", validated.error.issues);
    return errorResult;
  }

  // Verify ownership
  const existing = await prisma.candidate_experience.findFirst({
    where: {
      candidate_experience_id: parsed.data.experienceId,
      candidate_id: candidateId,
      deleted: 0,
    },
    select: { candidate_experience_id: true },
  });
  if (!existing) {
    return { success: false, error: "Experience entry not found or access denied" };
  }

  // Soft-delete
  await prisma.candidate_experience.update({
    where: { candidate_experience_id: parsed.data.experienceId },
    data: { deleted: 1 },
  });

  revalidatePath("/candidate/experience");

  const result: ExperienceActionResult = { success: true, experienceId: parsed.data.experienceId };

  const validated = experienceActionResultOutputSchema.safeParse(result);
  if (!validated.success) logOutputError("deleteCandidateExperience", validated.error.issues);

  return result;
}

// ---------------------------------------------------------------------------
// getExperienceEntry — [experienceId] route wrapper
// ---------------------------------------------------------------------------

/**
 * Get a single experience entry by ID (for the [experienceId] route).
 * Delegates to getCandidateExperience for session/auth/logic.
 */
export async function getExperienceEntry(
  experienceId: number,
): Promise<ExperienceItem | null> {
  const result = await getCandidateExperience(experienceId);

  const validatedItem = experienceItemOutputSchema.nullable().safeParse(result);
  if (!validatedItem.success) {
    logOutputError("getExperienceEntry", validatedItem.error.issues);
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateExperienceEntry — [experienceId] route wrapper
// ---------------------------------------------------------------------------

/**
 * Update an experience entry (for the [experienceId] edit route).
 * Takes positional params and delegates to updateCandidateExperience.
 */
export async function updateExperienceEntry(
  experienceId: number,
  experience: string,
  employer?: string,
  startYear?: number,
  endYear?: number,
): Promise<ExperienceActionResult> {
  const result = await updateCandidateExperience({
    experienceId,
    experience,
    employer,
    startYear,
    endYear,
  });

  if (result.success) {
    revalidatePath(`/candidate/experience/${experienceId}`);
  }

  // Validate output shape
  const validated = experienceActionResultOutputSchema.safeParse(result);
  if (!validated.success) {
    logOutputError("updateExperienceEntry", validated.error.issues);
  }
  return result;
}

// ---------------------------------------------------------------------------
// deleteExperienceEntry — [experienceId] route wrapper
// ---------------------------------------------------------------------------

/**
 * Delete an experience entry (for the [experienceId] route).
 * Delegates to deleteCandidateExperience.
 */
export async function deleteExperienceEntry(
  experienceId: number,
): Promise<ExperienceActionResult> {
  return deleteCandidateExperience(experienceId);
}

// ---------------------------------------------------------------------------
// createExperience — new route wrapper
// ---------------------------------------------------------------------------

/**
 * Create a new experience record (for the new route).
 * Delegates to createCandidateExperience.
 */
export async function createExperience(
  data: CreateExperienceInput,
): Promise<ExperienceActionResult> {
  const parsed = createExperienceSchema.safeParse(data);
  if (!parsed.success) {
    const errorResult: ExperienceActionResult = {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid experience data",
    };
    const validated = experienceActionResultOutputSchema.safeParse(errorResult);
    if (!validated.success) logOutputError("createExperience", validated.error.issues);
    return errorResult;
  }

  const dateError = validateDateRange(parsed.data.startYear, parsed.data.endYear);
  if (dateError) {
    return { success: false, error: dateError };
  }

  return createCandidateExperience(parsed.data);
}
