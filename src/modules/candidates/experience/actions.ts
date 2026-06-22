"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import {
  experienceListItemSchema,
  listExperienceResultSchema,
  experienceActionResultSchema,
  type ExperienceListItem,
  type ListExperienceResult,
  type ExperienceActionResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const listExperienceSchema = z.object({
  candidateId: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const createExperienceSchema = z.object({
  candidateId: z.number().int().positive(),
  experience: z.string().min(1, "Experience is required").max(128),
  employer: z.string().max(255).optional(),
  startYear: z.number().int().min(1900).max(2100).optional(),
  endYear: z.number().int().min(1900).max(2100).optional(),
});

const updateExperienceSchema = z.object({
  candidateId: z.number().int().positive(),
  id: z.number().int().positive(),
  experience: z.string().min(1).max(128).optional(),
  employer: z.string().max(255).optional(),
  startYear: z.number().int().min(1900).max(2100).optional(),
  endYear: z.number().int().min(1900).max(2100).optional(),
});

const deleteExperienceSchema = z.object({
  candidateId: z.number().int().positive(),
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListExperienceParams = z.input<typeof listExperienceSchema>;
export type CreateExperienceParams = z.input<typeof createExperienceSchema>;
export type UpdateExperienceParams = z.input<typeof updateExperienceSchema>;
export type DeleteExperienceParams = z.input<typeof deleteExperienceSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateDateRange(startYear?: number, endYear?: number): string | null {
  if (startYear !== undefined && endYear !== undefined && endYear < startYear) {
    return "End year cannot be before start year";
  }
  return null;
}

/** Log output validation errors without throwing. */
function logOutputError(source: string, error: unknown): void {
  console.error(`[modules/candidates/experience] ${source} output failed:`, error);
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List candidate experience entries with pagination and optional candidate filter.
 * Excludes soft-deleted records (deleted = 0).
 */
export async function listExperience(
  params: ListExperienceParams = {},
): Promise<ListExperienceResult> {
  await requireCapability("candidate.read.own");

  const parsed = listExperienceSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid list parameters");
  }

  const { candidateId, page = 1, limit = 20 } = parsed.data;

  const where: { deleted: number; candidate_id?: number } = { deleted: 0 };
  if (candidateId !== undefined) {
    where.candidate_id = candidateId;
  }

  const [items, total] = await Promise.all([
    prisma.candidate_experience.findMany({
      where,
      orderBy: { candidate_experience_id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.candidate_experience.count({ where }),
  ]);

  const result: ListExperienceResult = {
    items: items as ExperienceListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  const outputParsed = listExperienceResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("listExperience", outputParsed.error.issues);
  }

  return result;
}

/**
 * Create a new candidate experience entry.
 * Requires candidate.read.own capability.
 */
export async function createExperience(
  params: CreateExperienceParams,
): Promise<ExperienceActionResult> {
  await requireCapability("candidate.read.own");

  const parsed = createExperienceSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const dateError = validateDateRange(parsed.data.startYear, parsed.data.endYear);
  if (dateError) {
    return { success: false, error: dateError };
  }

  const { candidateId, experience, employer, startYear, endYear } = parsed.data;

  const item = await prisma.candidate_experience.create({
    data: {
      candidate_id: candidateId,
      experience,
      employer: employer ?? null,
      start_year: startYear ?? null,
      end_year: endYear ?? null,
      deleted: 0,
    },
  });

  revalidatePath("/candidate/profile");

  const result: ExperienceActionResult = {
    success: true,
    experienceId: item.candidate_experience_id,
  };

  const outputParsed = experienceActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("createExperience", outputParsed.error.issues);
  }

  return result;
}

/**
 * Update an existing candidate experience entry.
 * Verifies ownership via candidateId before updating.
 * Requires candidate.read.own capability.
 */
export async function updateExperience(
  params: UpdateExperienceParams,
): Promise<ExperienceActionResult> {
  await requireCapability("candidate.read.own");

  const parsed = updateExperienceSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const dateError = validateDateRange(parsed.data.startYear, parsed.data.endYear);
  if (dateError) {
    return { success: false, error: dateError };
  }

  const { candidateId, id, ...fields } = parsed.data;

  // Verify the record exists, is owned by the candidate, and is not deleted
  const existing = await prisma.candidate_experience.findFirst({
    where: {
      candidate_experience_id: id,
      candidate_id: candidateId,
      deleted: 0,
    },
  });
  if (!existing) {
    return { success: false, error: "Experience entry not found or access denied" };
  }

  await prisma.candidate_experience.update({
    where: { candidate_experience_id: id },
    data: {
      ...(fields.experience !== undefined && { experience: fields.experience }),
      ...(fields.employer !== undefined && { employer: fields.employer }),
      ...(fields.startYear !== undefined && { start_year: fields.startYear }),
      ...(fields.endYear !== undefined && { end_year: fields.endYear }),
    },
  });

  revalidatePath("/candidate/profile");

  const result: ExperienceActionResult = { success: true, experienceId: id };

  const outputParsed = experienceActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("updateExperience", outputParsed.error.issues);
  }

  return result;
}

/**
 * Soft-delete a candidate experience entry by setting deleted = 1.
 * Verifies ownership via candidateId before deleting.
 * Requires candidate.read.own capability.
 */
export async function deleteExperience(
  params: DeleteExperienceParams,
): Promise<ExperienceActionResult> {
  await requireCapability("candidate.read.own");

  const parsed = deleteExperienceSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid experience ID",
    };
  }

  const { candidateId, id } = parsed.data;

  // Verify the record exists, is owned by the candidate, and is not deleted
  const existing = await prisma.candidate_experience.findFirst({
    where: {
      candidate_experience_id: id,
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
    where: { candidate_experience_id: id },
    data: { deleted: 1 },
  });

  revalidatePath("/candidate/profile");

  const result: ExperienceActionResult = { success: true, experienceId: id };

  const outputParsed = experienceActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    logOutputError("deleteExperience", outputParsed.error.issues);
  }

  return result;
}
