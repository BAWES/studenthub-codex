"use server";

// ---------------------------------------------------------------------------
// Candidate root page — server actions
// ---------------------------------------------------------------------------
// Provides the candidate profile detail + metrics for the candidate's own
// dashboard.  Follows the pattern from src/app/admin/dashboard/actions.ts:
// auth gate inside the action + Zod output validation.
// ---------------------------------------------------------------------------

import { requireCapability } from "@/modules/auth/session";
import { getCandidateDetail } from "@/modules/candidates/candidate-detail";
import {
  getCandidateProfileSchema,
  candidateProfileOutputSchema,
  type GetCandidateProfileInput,
} from "./schemas";

/**
 * Fetch the full candidate profile detail + metrics.
 *
 * Auth: requires the candidate role + candidate.read.own capability (defense-in-depth,
 * matching the admin dashboard pattern where the page-level and action-level checks
 * both guard the route).
 */
export async function getCandidateProfile(input: GetCandidateProfileInput) {
  const parsed = getCandidateProfileSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  // Defense-in-depth: action-level auth gate (matches admin/dashboard pattern)
  await requireCapability("candidate.read.own");

  const result = await getCandidateDetail(
    parsed.data.candidateId,
    "/candidate/invitations",
  );

  // Validate the output shape (matches admin/dashboard output validation pattern)
  const validated = candidateProfileOutputSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[candidate] Output validation failed:",
      validated.error.issues,
    );
  }

  return result;
}
