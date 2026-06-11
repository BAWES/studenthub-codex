"use server";

// ---------------------------------------------------------------------------
// Candidate Profile — server actions for profile view
// ---------------------------------------------------------------------------
// Provides profile data for the /candidate/profile page, including metrics
// (experience count, education count, skills, etc.) and the basic profile.
// Uses getCandidateProfile from the parent candidate route for the full
// profile detail and the Prisma aggregate counts for metrics.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateProfile } from "../actions";
import {
  profileMetricsSchema,
  getCandidateProfileDetailResultSchema,
} from "./schemas";
import type { ProfileMetrics } from "./schemas";

// ---------------------------------------------------------------------------
// getCandidateProfileDetail — full profile + metrics
// ---------------------------------------------------------------------------

/**
 * Fetch the candidate's full profile detail and aggregate metrics for the
 * profile page.  Delegates detail fetching to the parent route's shared
 * action for consistency with the candidate home page.
 */
export async function getCandidateProfileDetail() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const [detail, metrics] = await Promise.all([
    getCandidateProfile({ candidateId }),
    getProfileMetricsFor(candidateId),
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

// ---------------------------------------------------------------------------
// getProfileMetricsFor — internal helper
// ---------------------------------------------------------------------------

async function getProfileMetricsFor(candidateId: number): Promise<ProfileMetrics> {
  const [experienceCount, educationCount, skillCount, certificationCount, languageCount] =
    await Promise.all([
      prisma.candidate_experience.count({ where: { candidate_id: candidateId } }),
      prisma.candidate_education.count({ where: { candidate_id: candidateId } }),
      prisma.candidate_skill.count({ where: { candidate_id: candidateId } }),
      prisma.candidate_certification.count({ where: { candidate_id: candidateId } }),
      prisma.candidate_language.count({ where: { candidate_id: candidateId } }),
    ]);

  // applicationCount via job_listing_application uses candidateId (snake_case not mapped)
  let applicationCount = 0;
  try {
    applicationCount = await prisma.job_listing_application.count({
      where: { candidateId: candidateId } as any,
    });
  } catch {
    // model may not exist yet in some environments
  }

  return {
    experienceCount,
    educationCount,
    skillCount,
    certificationCount,
    languageCount,
    applicationCount,
  };
}
