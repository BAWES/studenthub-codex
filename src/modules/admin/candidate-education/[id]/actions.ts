"use server";

// ---------------------------------------------------------------------------
// Admin Candidate Education [id] — server actions wrapper
// ---------------------------------------------------------------------------

import { getCandidateEducation as _getCandidateEducation } from "../actions";
import type { CandidateEducationDetailResult, GetCandidateEducationInput } from "../schemas";

/**
 * Get a single candidate education record by UUID.
 */
export async function getCandidateEducation(params: GetCandidateEducationInput): Promise<CandidateEducationDetailResult> {
  return _getCandidateEducation(params);
}
