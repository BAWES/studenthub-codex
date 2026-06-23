import { NextRequest, NextResponse } from "next/server";
import { getCandidateSearchWorkspaceTypesense } from "@/modules/candidates/search-typesense";
import type { CandidateSearchRole, CandidateSearchFilter } from "@/modules/candidates/search";
import { searchCandidatesQuerySchema } from "./schemas";

export const dynamic = "force-dynamic";

/**
 * GET /api/candidates/search
 *
 * Searches candidates via Typesense. Accepts query params for full-text search,
 * faceted filtering, and pagination. Returns the same workspace response shape
 * as getCandidateSearchWorkspace but sourced from Typesense.
 *
 * Query params:
 *   - q: search text (empty = match_all)
 *   - filter: preset filter (all, active, needs-review, incomplete, civil-id)
 *   - country, university, company, skill, gender: facet filters
 *   - profile: complete | incomplete
 *   - assignment: assigned | unassigned
 *   - document: resume | no-resume | civil-id
 *   - page: page number (default 1)
 *   - role: admin | staff | candidate (default admin)
 *   - staffId: staff user ID (required when role=staff)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const rawParams = Object.fromEntries(searchParams.entries());

    // Validate query params via Zod
    const parsed = searchCandidatesQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const {
      q: query,
      filter,
      role,
      staffId,
      page,
      country,
      university,
      company,
      skill,
      gender,
      profile,
      assignment,
      document,
      visibility,
    } = parsed.data;

    const result = await getCandidateSearchWorkspaceTypesense({
      role: role as CandidateSearchRole,
      ...(staffId !== undefined && { staffId }),
      query,
      filter: filter as CandidateSearchFilter,
      ...(visibility !== undefined && { visibility }),
      ...(country !== undefined && { country }),
      ...(university !== undefined && { university }),
      ...(company !== undefined && { company }),
      ...(skill !== undefined && { skill }),
      ...(gender !== undefined && { gender }),
      ...(profile !== undefined && { profile }),
      ...(assignment !== undefined && { assignment }),
      ...(document !== undefined && { document }),
      page,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
