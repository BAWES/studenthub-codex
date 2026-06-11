"use server";

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCandidateEducation,
  getCandidateEducation,
  createCandidateEducation as moduleCreate,
  updateCandidateEducation as moduleUpdate,
  deleteCandidateEducation as moduleDelete,
} from "@/modules/candidates/education/actions";
import {
  type ListEducationInput,
  type GetEducationInput,
  type CreateEducationInput,
  type UpdateEducationInput,
  type DeleteEducationInput,
  type EducationItem,
  type EducationActionResult,
} from "./schemas";
import {
  educationItemOutputSchema,
  educationListOutputSchema,
  educationActionResultOutputSchema,
} from "@/app/candidate/schemas";

// ---------------------------------------------------------------------------
// Server actions — delegate to module-level implementations
// ---------------------------------------------------------------------------

/**
 * List education records for the current candidate (paginated).
 * Delegates to modules/candidates/education with the session's candidate ID.
 */
export async function listCandidateEducationAction(
  input: ListEducationInput = {},
): Promise<EducationItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const result = await listCandidateEducation({
    candidateId: Number(session.id),
    page: input.page ?? 1,
    limit: input.limit ?? 20,
  });

  // Validate output shape
  const outputParsed = educationListOutputSchema.safeParse(result.items);
  if (!outputParsed.success) {
    console.error(
      "[candidate/education] listCandidateEducationAction output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result.items;
}

/**
 * Get a single education record by UUID.
 * Delegates to modules/candidates/education.
 */
export async function getCandidateEducationAction(
  educationUuid: string,
): Promise<EducationItem | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const result = await getCandidateEducation({ educationUuid });

  // Validate output shape
  const outputParsed = educationItemOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/education] getCandidateEducationAction output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Create a new education record for the current candidate.
 * Delegates to modules/candidates/education with the session's candidate ID.
 */
export async function createCandidateEducationAction(
  data: CreateEducationInput,
): Promise<EducationActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const result = await moduleCreate({
    candidateId: Number(session.id),
    universityId: data.universityId,
    degreeUuid: data.degreeUuid,
    majorUuid: data.majorUuid,
    graduationYear: data.graduationYear,
    isCurrentlyStudying: data.isCurrentlyStudying,
  });

  revalidatePath("/candidate/education");

  if (!result.success) {
    return result;
  }

  // Validate output shape
  const outputParsed = educationActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/education] createCandidateEducationAction output validation failed:",
      outputParsed.error.issues,
    );
  }

  return { success: true, educationUuid: result.educationUuid };
}

/**
 * Update an existing education record (delete + create in transaction).
 * Delegates to modules/candidates/education with the session's candidate ID.
 */
export async function updateCandidateEducationAction(
  data: UpdateEducationInput,
): Promise<EducationActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const result = await moduleUpdate({
    candidateId: Number(session.id),
    educationUuid: data.educationUuid,
    universityId: data.universityId,
    degreeUuid: data.degreeUuid,
    majorUuid: data.majorUuid,
    graduationYear: data.graduationYear,
    isCurrentlyStudying: data.isCurrentlyStudying,
  });

  revalidatePath("/candidate/education");

  if (!result.success) {
    return result;
  }

  // Validate output shape
  const outputParsed = educationActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/education] updateCandidateEducationAction output validation failed:",
      outputParsed.error.issues,
    );
  }

  return { success: true, educationUuid: result.educationUuid };
}

/**
 * Delete an education record by UUID.
 * Delegates to modules/candidates/education with ownership verification.
 */
export async function deleteCandidateEducationAction(
  educationUuid: string,
): Promise<EducationActionResult> {
  const session = await requireRoleCapability(
    "candidate",
    "candidate.profile.edit",
  );

  const result = await moduleDelete({
    candidateId: Number(session.id),
    educationUuid,
  });

  revalidatePath("/candidate/education");

  if (!result.success) {
    return result;
  }

  // Validate output shape
  const outputParsed = educationActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/education] deleteCandidateEducationAction output validation failed:",
      outputParsed.error.issues,
    );
  }

  return { success: true, educationUuid: result.educationUuid };
}
