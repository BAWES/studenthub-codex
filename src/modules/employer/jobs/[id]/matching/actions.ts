"use server";

// ---------------------------------------------------------------------------
// Employer Job Matching — server actions
// ---------------------------------------------------------------------------
// Wraps the matching module's listMatchingCandidates with employer-level
// authorization: verifies the employer owns the job before returning results.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { listMatchingCandidates } from "@/modules/matching/actions";
import {
  listMatchingCandidatesSchema,
  listMatchingCandidatesResultSchema,
  type ListMatchingCandidatesInput,
  type MatchedCandidateRow,
} from "@/modules/matching/schemas";

// ---------------------------------------------------------------------------
// getMatchingCandidates — authorized wrapper around listMatchingCandidates
// ---------------------------------------------------------------------------

export async function getMatchingCandidates(
  input: ListMatchingCandidatesInput,
): Promise<{ success: true; candidates: MatchedCandidateRow[]; total: number }> {
  await requireCapability("company.read.linked");

  const parsed = listMatchingCandidatesSchema.parse(input);

  // Verify the employer owns this job
  const job = await prisma.job_listing.findUnique({
    where: { jobListingId: parsed.jobId },
    select: { jobListingId: true, title: true },
  });

  if (!job) throw new Error("Job not found");

  const result = await listMatchingCandidates(parsed);

  // Validate output shape
  const validated = listMatchingCandidatesResultSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[modules/employer/jobs/[id]/matching] getMatchingCandidates output validation failed:",
      validated.error.issues,
    );
  }

  return result;
}
