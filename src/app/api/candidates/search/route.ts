import { NextRequest, NextResponse } from "next/server";
import { getCandidateSearchWorkspaceTypesense } from "@/modules/candidates/search-typesense";
import type { CandidateSearchRole, CandidateSearchFilter } from "@/modules/candidates/search";

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

    const query = searchParams.get("q") ?? "";
    const filter = (searchParams.get("filter") ?? "all") as CandidateSearchFilter;
    const role = (searchParams.get("role") ?? "admin") as CandidateSearchRole;
    const staffId = searchParams.get("staffId") ? Number(searchParams.get("staffId")) : undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

    // Facet filters
    const country = searchParams.get("country") ?? undefined;
    const university = searchParams.get("university") ?? undefined;
    const company = searchParams.get("company") ?? undefined;
    const skill = searchParams.get("skill") ?? undefined;
    const gender = searchParams.get("gender") ?? undefined;
    const profile = searchParams.get("profile") ?? undefined;
    const assignment = searchParams.get("assignment") ?? undefined;
    const document = searchParams.get("document") ?? undefined;
    const visibility = (searchParams.get("visibility") ?? undefined) as "all" | "assigned" | undefined;

    const result = await getCandidateSearchWorkspaceTypesense({
      role,
      ...(staffId !== undefined && { staffId }),
      query,
      filter,
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
