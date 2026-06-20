"use server";

// ---------------------------------------------------------------------------
// Candidate Profile — server actions for profile view
// ---------------------------------------------------------------------------
// Provides profile data for the /candidate/profile page, including metrics
// (experience count, education count, skills, etc.) and the basic profile.
// Delegates all data fetching to modules/candidates/profile.
// ---------------------------------------------------------------------------

import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateProfile } from "@/app/candidate/actions";
import {
  getCandidateProfileMetrics,
} from "@/modules/candidates/profile/actions";
import {
  getCandidateProfileDetailResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCandidateProfileDetail — full profile + metrics
// ---------------------------------------------------------------------------

/**
 * Fetch the candidate's full profile detail and aggregate metrics for the
 * profile page.  Delegates detail fetching to the parent route's shared
 * action for consistency with the candidate home page; metrics to the
 * module-level profile action.
 */
export async function getCandidateProfileDetail() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const [detail, metrics] = await Promise.all([
    getCandidateProfile({ candidateId }),
    getCandidateProfileMetrics({ candidateId }),
  ]);

  const result = { detail, metrics };

  // Validate output shape
  const validated = getCandidateProfileDetailResultSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[app/candidate/profile] getCandidateProfileDetail output validation failed:",
      validated.error.issues,
    );
  }

  return result;
}
