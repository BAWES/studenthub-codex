"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import type {
  ListExperienceInput,
  CreateExperienceInput,
  UpdateExperienceInput,
  ExperienceActionResult,
  ExperienceItem,
} from "./schemas";
import {
  listExperienceSchema,
  getExperienceSchema,
  createExperienceSchema,
  updateExperienceSchema,
  deleteExperienceSchema,
} from "./schemas";

import {
  experienceItemSchema,
  experienceActionResultSchema,
  experienceListOutputSchema,
} from "../schemas";

// Re-export types for client components
export type { ExperienceActionResult, ExperienceItem };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Prisma candidate_experience row to the API shape. */
function toItem(
  row: Awaited<ReturnType<typeof prisma.candidate_experience.findFirst>>,
): ExperienceItem | null {
  if (!row) return null;
  return {
    candidate_experience_id: row.candidate_experience_id,
    candidate_id: row.candidate_id,
    experience: row.experience,
    employer: row.employer,
    start_year: row.start_year,
    end_year: row.end_year,
    created_at: row.candidate_experience_created_at,
  };
}

/** Validate that end year is not before start year. */
function validateDateRange(
  startYear?: number,
  endYear?: number,
): string | null {
  if (
    startYear !== undefined &&
    endYear !== undefined &&
    endYear < startYear
  ) {
    return "End year cannot be before start year";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * List experience records for the current candidate (non-deleted, newest first).
 */
export async function listCandidateExperience(
  input: ListExperienceInput = {},
): Promise<ExperienceItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listExperienceSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid experience list params",
    );
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const candidateId = Number(session.id);

  const rows = await prisma.candidate_experience.findMany({
    where: {
      candidate_id: candidateId,
      deleted: 0,
    },
    orderBy: [
      { candidate_experience_created_at: "desc" },
      { candidate_experience_id: "desc" },
    ],
    skip,
    take: limit,
  });

  const items = rows.map((r) => toItem(r)!);

  // Validate output shape
  const validatedList = experienceListOutputSchema.safeParse(items);
  if (!validatedList.success) {
    console.error(
      "[candidate/experience] listCandidateExperience output validation failed:",
      validatedList.error.issues,
    );
  }

  return items;
}

/**
 * Get a single experience record by ID.
 * Only returns records belonging to the current candidate.
 */
export async function getCandidateExperience(
  experienceId: number,
): Promise<ExperienceItem | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getExperienceSchema.safeParse({ experienceId });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid experience ID",
    );
  }

  const row = await prisma.candidate_experience.findFirst({
    where: {
      candidate_experience_id: parsed.data.experienceId,
      deleted: 0,
    },
  });

  const item = toItem(row);

  // Validate output shape
  const validatedItem = experienceItemSchema.nullable().safeParse(item);
  if (!validatedItem.success) {
    console.error(
      "[candidate/experience] getCandidateExperience output validation failed:",
      validatedItem.error.issues,
    );
  }

  return item;
}

/**
 * Create a new experience record for the current candidate.
 */
export async function createCandidateExperience(
  data: CreateExperienceInput,
): Promise<ExperienceActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = createExperienceSchema.safeParse(data);
  if (!parsed.success) {
    const errorResult: ExperienceActionResult = {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid experience data",
    };

    // Validate output shape
    const validatedActionResult = experienceActionResultSchema.safeParse(errorResult);
    if (!validatedActionResult.success) {
      console.error(
        "[candidate/experience] createCandidateExperience output validation failed:",
        validatedActionResult.error.issues,
      );
    }

    return errorResult;
  }

  const dateError = validateDateRange(
    parsed.data.startYear,
    parsed.data.endYear,
  );
  if (dateError) {
    const errorResult: ExperienceActionResult = { success: false, error: dateError };

    // Validate output shape
    const validatedActionResult = experienceActionResultSchema.safeParse(errorResult);
    if (!validatedActionResult.success) {
      console.error(
        "[candidate/experience] createCandidateExperience output validation failed:",
        validatedActionResult.error.issues,
      );
    }

    return errorResult;
  }

  const now = new Date();

  const row = await prisma.candidate_experience.create({
    data: {
      candidate_id: Number(session.id),
      experience: parsed.data.experience,
      employer: parsed.data.employer || null,
      start_year: parsed.data.startYear ?? null,
      end_year: parsed.data.endYear ?? null,
      deleted: 0,
      candidate_experience_created_at: now,
    },
  });

  revalidatePath("/candidate/experience");

  const successResult: ExperienceActionResult = { success: true, experienceId: row.candidate_experience_id };

  // Validate output shape
  const validatedActionResult = experienceActionResultSchema.safeParse(successResult);
  if (!validatedActionResult.success) {
    console.error(
      "[candidate/experience] createCandidateExperience output validation failed:",
      validatedActionResult.error.issues,
    );
  }

  return successResult;
}

/**
 * Update an existing experience record.
 * Verifies ownership before updating.
 */
export async function updateCandidateExperience(
  data: UpdateExperienceInput,
): Promise<ExperienceActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = updateExperienceSchema.safeParse(data);
  if (!parsed.success) {
    const errorResult: ExperienceActionResult = {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid experience data",
    };

    // Validate output shape
    const validatedResult = experienceActionResultSchema.safeParse(errorResult);
    if (!validatedResult.success) {
      console.error(
        "[candidate/experience] updateCandidateExperience output validation failed:",
        validatedResult.error.issues,
      );
    }

    return errorResult;
  }

  const dateError = validateDateRange(
    parsed.data.startYear,
    parsed.data.endYear,
  );
  if (dateError) {
    const errorResult: ExperienceActionResult = { success: false, error: dateError };

    // Validate output shape
    const validatedResult = experienceActionResultSchema.safeParse(errorResult);
    if (!validatedResult.success) {
      console.error(
        "[candidate/experience] updateCandidateExperience output validation failed:",
        validatedResult.error.issues,
      );
    }

    return errorResult;
  }

  const candidateId = Number(session.id);
  const experienceId = parsed.data.experienceId;

  // Verify ownership
  const existing = await prisma.candidate_experience.findFirst({
    where: {
      candidate_experience_id: experienceId,
      candidate_id: candidateId,
      deleted: 0,
    },
    select: { candidate_experience_id: true },
  });
  if (!existing) {
    const errorResult: ExperienceActionResult = {
      success: false,
      error: "Experience record not found or access denied",
    };

    // Validate output shape
    const validatedActionResult = experienceActionResultSchema.safeParse(errorResult);
    if (!validatedActionResult.success) {
      console.error(
        "[candidate/experience] updateCandidateExperience output validation failed:",
        validatedActionResult.error.issues,
      );
    }

    return errorResult;
  }

  await prisma.candidate_experience.update({
    where: { candidate_experience_id: experienceId },
    data: {
      experience: parsed.data.experience,
      employer: parsed.data.employer || null,
      start_year: parsed.data.startYear ?? null,
      end_year: parsed.data.endYear ?? null,
    },
  });

  revalidatePath("/candidate/experience");

  const successResult: ExperienceActionResult = { success: true, experienceId };

  // Validate output shape
  const validatedActionResult = experienceActionResultSchema.safeParse(successResult);
  if (!validatedActionResult.success) {
    console.error(
      "[candidate/experience] updateCandidateExperience output validation failed:",
      validatedActionResult.error.issues,
    );
  }

  return successResult;
}

/**
 * Delete an experience record (soft-delete using the `deleted` flag).
 */
export async function deleteCandidateExperience(
  experienceId: number,
): Promise<ExperienceActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const parsed = deleteExperienceSchema.safeParse({ experienceId });
  if (!parsed.success) {
    const errorResult: ExperienceActionResult = {
      success: false,
      error: "Invalid experience ID",
    };

    // Validate output shape
    const validatedResult = experienceActionResultSchema.safeParse(errorResult);
    if (!validatedResult.success) {
      console.error(
        "[candidate/experience] deleteCandidateExperience output validation failed:",
        validatedResult.error.issues,
      );
    }

    return errorResult;
  }

  const existing = await prisma.candidate_experience.findFirst({
    where: {
      candidate_experience_id: parsed.data.experienceId,
      candidate_id: Number(session.id),
      deleted: 0,
    },
    select: { candidate_experience_id: true },
  });
  if (!existing) {
    const errorResult: ExperienceActionResult = {
      success: false,
      error: "Experience record not found or access denied",
    };

    // Validate output shape
    const validatedResult = experienceActionResultSchema.safeParse(errorResult);
    if (!validatedResult.success) {
      console.error(
        "[candidate/experience] deleteCandidateExperience output validation failed:",
        validatedResult.error.issues,
      );
    }

    return errorResult;
  }

  // Soft-delete
  await prisma.candidate_experience.update({
    where: { candidate_experience_id: parsed.data.experienceId },
    data: { deleted: 1 },
  });

  revalidatePath("/candidate/experience");

  const successResult: ExperienceActionResult = { success: true, experienceId: parsed.data.experienceId };

  // Validate output shape
  const validatedResult = experienceActionResultSchema.safeParse(successResult);
  if (!validatedResult.success) {
    console.error(
      "[candidate/experience] deleteCandidateExperience output validation failed:",
      validatedResult.error.issues,
    );
  }

  return successResult;
}
