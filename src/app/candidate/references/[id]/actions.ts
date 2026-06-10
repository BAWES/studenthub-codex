"use server";

// ---------------------------------------------------------------------------
// Candidate References [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Thin convenience wrappers that delegate to the parent list-level actions.
//
// Actions:
//   - getReferenceEntry      — fetch single reference by UUID
//   - updateReferenceEntry   — update reference
//   - deleteReferenceEntry   — remove a reference
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import {
  getCandidateReference as parentGetCandidateReference,
  updateCandidateReference as parentUpdateCandidateReference,
  deleteCandidateReference as parentDeleteCandidateReference,
} from "../actions";

// Re-export parent types so consumers have a single import path
import type { ReferenceItem, ReferenceActionResult } from "../schemas";
export type { ReferenceItem, ReferenceActionResult };

import {
  getReferenceEntrySchema,
  updateReferenceEntrySchema,
  deleteReferenceEntrySchema,
} from "./schemas";
import type { ReferenceEntryResponse } from "./schemas";

// ---------------------------------------------------------------------------
// getReferenceEntry
// ---------------------------------------------------------------------------

/**
 * Get a single reference entry with full detail.
 * Delegates to the parent `getCandidateReference` action.
 */
export async function getReferenceEntry(
  referenceUuid: string,
): Promise<ReferenceItem | null> {
  const session = await requireRoleCapability("candidate", "candidate.read.own");

  const parsed = getReferenceEntrySchema.safeParse({ referenceUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid reference entry params");
  }

  return parentGetCandidateReference(parsed.data.referenceUuid);
}

// ---------------------------------------------------------------------------
// updateReferenceEntry
// ---------------------------------------------------------------------------

/**
 * Update an existing reference entry.
 *
 * - Delegates to parent `updateCandidateReference` for the update.
 * - Returns `{ success: true }` on success, `{ success: false, error }` on failure.
 */
export async function updateReferenceEntry(
  referenceUuid: string,
  name: string,
  company?: string,
  position?: string,
  phone?: string,
  email?: string,
  relationship?: string,
): Promise<ReferenceEntryResponse> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = updateReferenceEntrySchema.safeParse({
    referenceUuid,
    name,
    company,
    position,
    phone,
    email,
    relationship,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Verify the entry exists and belongs to the candidate before mutating
  const existing = await prisma.candidate_reference.findFirst({
    where: {
      reference_uuid: parsed.data.referenceUuid,
      candidate_id: Number(session.id),
      deleted: 0,
    },
    select: { reference_uuid: true },
  });

  if (!existing) {
    return { success: false, error: "Reference entry not found or access denied" };
  }

  // Delegate the update to the parent action
  await parentUpdateCandidateReference(parsed.data);

  revalidatePath("/candidate/references");
  revalidatePath(`/candidate/references/${parsed.data.referenceUuid}`);

  return { success: true };
}

// ---------------------------------------------------------------------------
// deleteReferenceEntry
// ---------------------------------------------------------------------------

/**
 * Delete a reference entry by UUID.
 * Only the owning candidate can delete their own reference entries.
 * Returns `{ success: true }` on success, `{ success: false, error }` on error.
 */
export async function deleteReferenceEntry(
  referenceUuid: string,
): Promise<ReferenceEntryResponse> {
  const session = await requireRoleCapability("candidate", "candidate.profile.edit");

  const parsed = deleteReferenceEntrySchema.safeParse({ referenceUuid });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Verify ownership before deleting
  const existing = await prisma.candidate_reference.findFirst({
    where: {
      reference_uuid: parsed.data.referenceUuid,
      candidate_id: Number(session.id),
      deleted: 0,
    },
    select: { reference_uuid: true },
  });

  if (!existing) {
    return { success: false, error: "Reference entry not found or access denied" };
  }

  await parentDeleteCandidateReference(parsed.data.referenceUuid);

  revalidatePath("/candidate/references");

  return { success: true };
}
