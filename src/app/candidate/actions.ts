"use server";

import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateDetail } from "@/modules/workspace/data/candidate";
import { getCandidateProfileSchema, type GetCandidateProfileInput } from "./schemas";

// ---------------------------------------------------------------------------
// Candidate root page — server actions
// ---------------------------------------------------------------------------

/**
 * Fetch the full candidate profile detail + metrics.
 * Delegates to the existing data layer; colocated for the root candidate page.
 */
export async function getCandidateProfile(input: GetCandidateProfileInput) {
  const parsed = getCandidateProfileSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  return getCandidateDetail(parsed.data.candidateId, "/candidate/invitations");
}
