"use server";

import { revalidatePath } from "next/cache";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  listCandidateReferences as moduleListReferences,
  getCandidateReference as moduleGetReference,
  createCandidateReference as moduleCreateReference,
  updateCandidateReference as moduleUpdateReference,
  deleteCandidateReference as moduleDeleteReference,
} from "@/modules/references/actions";
import {
  listReferenceSchema,
  getReferenceSchema,
  createReferenceSchema,
  updateReferenceSchema,
  deleteReferenceSchema,
  referenceItemOutputSchema,
  referenceListOutputSchema,
  referenceActionResultOutputSchema,
  type ListReferenceInput,
  type CreateReferenceInput,
  type UpdateReferenceInput,
  type ReferenceItem,
  type ReferenceActionResult,
} from "./schemas";

// Re-export types for client components
export type { ReferenceItem, ReferenceActionResult };

// ---------------------------------------------------------------------------
// Delegating Server Actions
// ---------------------------------------------------------------------------

/**
 * List reference records for the current candidate (non-deleted, newest first).
 */
export async function listCandidateReferences(
  input: ListReferenceInput = {},
): Promise<ReferenceItem[]> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = listReferenceSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid reference list params",
    );
  }

  const result = await moduleListReferences(Number(session.id), parsed.data);

  // Validate output shape
  const outputParsed = referenceListOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/references] list output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single reference record by UUID.
 * Only returns records belonging to the current candidate.
 */
export async function getCandidateReference(
  referenceUuid: string,
): Promise<ReferenceItem | null> {
  await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getReferenceSchema.safeParse({ referenceUuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid reference UUID",
    );
  }

  const result = await moduleGetReference(parsed.data.referenceUuid);

  // Validate output shape
  if (result !== null) {
    const outputParsed = referenceItemOutputSchema.safeParse(result);
    if (!outputParsed.success) {
      console.error(
        "[candidate/references] get output validation failed:",
        outputParsed.error.issues,
      );
    }
  }

  return result;
}

/**
 * Create a new reference record for the current candidate.
 */
export async function createCandidateReference(
  data: CreateReferenceInput,
): Promise<ReferenceActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = createReferenceSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid reference data",
    };
  }

  const result = await moduleCreateReference(Number(session.id), parsed.data);

  // Validate output shape
  const outputParsed = referenceActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/references] create output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.success) {
    revalidatePath("/candidate/references");
  }

  return result;
}

/**
 * Update an existing reference record.
 * Verifies ownership before updating.
 */
export async function updateCandidateReference(
  data: UpdateReferenceInput,
): Promise<ReferenceActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateReferenceSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid reference data",
    };
  }

  const result = await moduleUpdateReference(Number(session.id), parsed.data);

  // Validate output shape
  const outputParsed = referenceActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/references] update output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.success) {
    revalidatePath("/candidate/references");
  }

  return result;
}

/**
 * Delete a reference record (soft-delete using the `deleted` flag).
 */
export async function deleteCandidateReference(
  referenceUuid: string,
): Promise<ReferenceActionResult> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = deleteReferenceSchema.safeParse({ referenceUuid });
  if (!parsed.success) {
    return { success: false, error: "Invalid reference UUID" };
  }

  const result = await moduleDeleteReference(parsed.data.referenceUuid, Number(session.id));

  // Validate output shape
  const outputParsed = referenceActionResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/references] delete output validation failed:",
      outputParsed.error.issues,
    );
  }

  if (result.success) {
    revalidatePath("/candidate/references");
  }

  return result;
}
