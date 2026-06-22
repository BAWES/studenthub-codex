// ---------------------------------------------------------------------------
// Candidate References [id] — colocated server actions
// Delegates to module-level actions in @/modules/candidates/references/actions
// ---------------------------------------------------------------------------

import {
  getCandidateReference,
  updateCandidateReference,
  deleteCandidateReference as moduleDeleteCandidateReference,
} from "@/modules/candidates/references/actions";
import type { CandidateReferenceItem, CandidateReferenceActionResult } from "@/modules/candidates/references";

// Re-export with renamed aliases (same signature)
export {
  getCandidateReference as getReferenceEntry,
  updateCandidateReference as updateReferenceEntry,
} from "@/modules/candidates/references/actions";

/**
 * Delete a reference entry by UUID.
 * Wraps the module-level action which expects { referenceUuid }.
 */
export async function deleteReferenceEntry(
  referenceUuid: string,
): Promise<CandidateReferenceActionResult> {
  return moduleDeleteCandidateReference({ referenceUuid });
}

export type {
  CandidateReferenceItem,
  CandidateReferenceActionResult,
} from "@/modules/candidates/references";
