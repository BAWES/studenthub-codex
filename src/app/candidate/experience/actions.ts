"use server";

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listExperience as moduleListExperience,
  createExperience as moduleCreateExperience,
  updateExperience as moduleUpdateExperience,
  deleteExperience as moduleDeleteExperience,
} from "@/modules/candidates/experience/actions";
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
// Server actions — delegate to module-level implementations
// ---------------------------------------------------------------------------

/**
 * List experience records for the current candidate (non-deleted, newest first).
 * Delegates to modules/candidates/experience with the session's candidate ID.
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
  const candidateId = Number(session.id);

  const result = await moduleListExperience({
    candidateId,
    page,
    limit,
  });

  const items: ExperienceItem[] = result.items.map((i) => ({
    candidate_experience_id: i.candidate_experience_id,
    candidate_id: i.candidate_id,
    experience: i.experience,
    employer: i.employer,
    start_year: i.start_year,
    end_year: i.end_year,
    created_at: i.candidate_experience_created_at,
  }));

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
 * Get a single experience record by ID, scoped to the current candidate.
 * Delegates to module-level listExperience with candidateId filter.
 */
export async function getCandidateExperience(
  experienceId: number,
): Promise<ExperienceItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getExperienceSchema.safeParse({ experienceId });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid experience ID",
    );
  }

  const result = await moduleListExperience({
    candidateId: Number(session.id),
  });

  const item = result.items.find(
    (i) => i.candidate_experience_id === parsed.data.experienceId,
  );

  const experienceItem: ExperienceItem | null = item
    ? {
        candidate_experience_id: item.candidate_experience_id,
        candidate_id: item.candidate_id,
        experience: item.experience,
        employer: item.employer,
        start_year: item.start_year,
        end_year: item.end_year,
        created_at: item.candidate_experience_created_at,
      }
    : null;

  // Validate output shape
  const validatedItem = experienceItemSchema.nullable().safeParse(experienceItem);
  if (!validatedItem.success) {
    console.error(
      "[candidate/experience] getCandidateExperience output validation failed:",
      validatedItem.error.issues,
    );
  }

  return experienceItem;
}

/**
 * Create a new experience record for the current candidate.
 * Delegates to modules/candidates/experience with the session's candidate ID.
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

  // Delegate to module-level
  const result = await moduleCreateExperience({
    candidateId: Number(session.id),
    experience: parsed.data.experience,
    employer: parsed.data.employer || undefined,
    startYear: parsed.data.startYear,
    endYear: parsed.data.endYear,
  });

  revalidatePath("/candidate/experience");

  // Validate output shape
  const validatedActionResult = experienceActionResultSchema.safeParse(result);
  if (!validatedActionResult.success) {
    console.error(
      "[candidate/experience] createCandidateExperience output validation failed:",
      validatedActionResult.error.issues,
    );
  }

  return result;
}

/**
 * Update an existing experience record.
 * Delegates to modules/candidates/experience with ownership verification.
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

    const validatedResult = experienceActionResultSchema.safeParse(errorResult);
    if (!validatedResult.success) {
      console.error(
        "[candidate/experience] updateCandidateExperience output validation failed:",
        validatedResult.error.issues,
      );
    }

    return errorResult;
  }

  // Delegate to module-level (owns ownership check + output validation)
  const result = await moduleUpdateExperience({
    candidateId: Number(session.id),
    id: parsed.data.experienceId,
    experience: parsed.data.experience,
    employer: parsed.data.employer || undefined,
    startYear: parsed.data.startYear,
    endYear: parsed.data.endYear,
  });

  revalidatePath("/candidate/experience");

  const validatedResult = experienceActionResultSchema.safeParse(result);
  if (!validatedResult.success) {
    console.error(
      "[candidate/experience] updateCandidateExperience output validation failed:",
      validatedResult.error.issues,
    );
  }

  return result;
}

/**
 * Delete an experience record (soft-delete using the `deleted` flag).
 * Delegates to modules/candidates/experience with ownership verification.
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

    const validatedResult = experienceActionResultSchema.safeParse(errorResult);
    if (!validatedResult.success) {
      console.error(
        "[candidate/experience] deleteCandidateExperience output validation failed:",
        validatedResult.error.issues,
      );
    }

    return errorResult;
  }

  // Delegate to module-level (owns ownership check + output validation)
  const result = await moduleDeleteExperience({
    candidateId: Number(session.id),
    id: parsed.data.experienceId,
  });

  revalidatePath("/candidate/experience");

  const validatedResult = experienceActionResultSchema.safeParse(result);
  if (!validatedResult.success) {
    console.error(
      "[candidate/experience] deleteCandidateExperience output validation failed:",
      validatedResult.error.issues,
    );
  }

  return result;
}
