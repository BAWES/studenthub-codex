"use server";

// ---------------------------------------------------------------------------
// Candidate Search — module-level server actions
// ---------------------------------------------------------------------------
// Handles Zod input/output validation and delegates to the Typesense search
// implementation. This is the module-level counterpart that replaced the
// app-level wrapper.
// ---------------------------------------------------------------------------

import { getCandidateSearchWorkspaceTypesense } from "@/modules/candidates/search-typesense";
import { searchCandidatesSchema, candidateSearchResultSchema } from "./schemas";
import type { CandidateSearchResult } from "./schemas";

// ---------------------------------------------------------------------------
// searchCandidates
// ---------------------------------------------------------------------------

/**
 * Search candidates via Typesense. Returns paginated search results with
 * candidate cards, facet data, metrics, and open-tab state.
 *
 * Wraps getCandidateSearchWorkspaceTypesense with Zod input + output validation.
 */
export async function searchCandidates(
  params: Record<string, unknown>,
): Promise<CandidateSearchResult> {
  // Input validation
  const parsed = searchCandidatesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid search parameters",
    );
  }

  const result = await getCandidateSearchWorkspaceTypesense(parsed.data as any);

  // Output validation
  const outputParsed = candidateSearchResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/search] searchCandidates output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
