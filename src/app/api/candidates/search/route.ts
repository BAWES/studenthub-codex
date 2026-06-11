import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTypesenseClient, CANDIDATES_COLLECTION, type CandidateDocument } from "@/lib/typesense";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Zod schemas for request validation
// ---------------------------------------------------------------------------

const searchParamsSchema = z.object({
  q: z.string().max(500).optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(250).optional().default(60),
  filter: z.string().max(500).optional(),
  country_id: z.coerce.number().int().optional(),
  university_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  skill: z.string().max(100).optional(),
  gender: z.coerce.number().int().min(1).max(3).optional(),
  profile: z.enum(["complete", "incomplete"]).optional(),
  assignment: z.enum(["assigned", "unassigned"]).optional(),
  document: z.enum(["resume", "no-resume", "civil-id"]).optional(),
  sort_by: z.enum(["candidate_updated_at:desc", "candidate_name:asc"]).optional().default("candidate_updated_at:desc"),
});

type SearchParams = z.infer<typeof searchParamsSchema>;

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

interface SearchHit {
  candidate_id: number;
  candidate_name: string;
  candidate_name_ar: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_uid: string;
  country_id: number;
  country_name: string;
  university_id: number;
  university_name: string;
  company_id: number;
  company_name: string;
  store_name: string;
  store_id: number;
  skills: string[];
  tags: string[];
  candidate_gender: number;
  candidate_status: number;
  approved: number;
  is_incomplete_profile: boolean;
  candidate_civil_need_verification: boolean;
  has_resume: boolean;
  candidate_hourly_rate: number;
  currency_code: string;
  score?: number;
  text_match_info?: { score: number };
}

interface SearchResponse {
  hits: SearchHit[];
  found: number;
  page: number;
  per_page: number;
  total_pages: number;
  facet_counts: Array<{
    field_name: string;
    counts: Array<{ value: string; count: number; highlighted: string }>;
  }>;
  search_time_ms: number;
}

// ---------------------------------------------------------------------------
// Build filter expression from parsed params
// ---------------------------------------------------------------------------

function buildFilterExpression(params: SearchParams): string | undefined {
  const parts: string[] = [];

  if (params.filter === "active") {
    parts.push("candidate_status: 10 && approved: != 0");
  } else if (params.filter === "needs-review") {
    parts.push("approved: 0");
  } else if (params.filter === "incomplete") {
    parts.push("is_incomplete_profile: true");
  } else if (params.filter === "civil-id") {
    parts.push("candidate_civil_need_verification: true");
  }

  if (params.country_id) parts.push(`country_id: ${params.country_id}`);
  if (params.university_id) parts.push(`university_id: ${params.university_id}`);
  if (params.company_id) parts.push(`company_id: ${params.company_id}`);
  if (params.skill) parts.push(`skills: [${params.skill}]`);
  if (params.gender) parts.push(`candidate_gender: ${params.gender}`);
  if (params.profile === "complete") parts.push("is_incomplete_profile: false");
  else if (params.profile === "incomplete") parts.push("is_incomplete_profile: true");
  if (params.assignment === "assigned") parts.push("store_id: != 0");
  else if (params.assignment === "unassigned") parts.push("store_id: 0");
  if (params.document === "resume") parts.push("has_resume: true");
  else if (params.document === "no-resume") parts.push("has_resume: false");
  else if (params.document === "civil-id") parts.push("candidate_civil_need_verification: true");

  return parts.length > 0 ? parts.join(" && ") : undefined;
}

// ---------------------------------------------------------------------------
// GET /api/candidates/search
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // 1. Parse and validate query parameters
  const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = searchParamsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid search parameters",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const params = parsed.data;
  const query = params.q?.trim() || "*";
  const filterBy = buildFilterExpression(params);

  // 2. Get Typesense client
  const client = getTypesenseClient();

  // 3. Health check
  try {
    const health = await client.health.retrieve();
    if (!health.ok) {
      return NextResponse.json(
        { error: "Search service is not available" },
        { status: 503 },
      );
    }
  } catch (err) {
    console.error("[api/candidates/search] Typesense health check failed:", err);
    return NextResponse.json(
      { error: "Search service is not available" },
      { status: 503 },
    );
  }

  // 4. Execute search
  try {
    const searchResult = await client
      .collections(CANDIDATES_COLLECTION)
      .documents()
      .search(
        {
          q: query,
          query_by: "candidate_name,candidate_name_ar,candidate_email,candidate_phone,candidate_uid,skills,tags",
          filter_by: filterBy,
          facet_by: "country_name,university_name,company_name,skills,candidate_gender",
          max_facet_values: 25,
          sort_by: params.sort_by,
          per_page: params.per_page,
          page: params.page,
        },
        {},
      );

    const hits = searchResult.hits ?? [];
    const found = searchResult.found ?? 0;
    const facetCounts = searchResult.facet_counts ?? [];
    const searchTimeMs = searchResult.search_time_ms ?? 0;

    // 5. Map hits to clean response objects
    const mappedHits: SearchHit[] = hits.map((hit: any) => {
      const doc = hit.document as CandidateDocument;
      return {
        candidate_id: doc.candidate_id,
        candidate_name: doc.candidate_name,
        candidate_name_ar: doc.candidate_name_ar,
        candidate_email: doc.candidate_email,
        candidate_phone: doc.candidate_phone,
        candidate_uid: doc.candidate_uid,
        country_id: doc.country_id,
        country_name: doc.country_name,
        university_id: doc.university_id,
        university_name: doc.university_name,
        company_id: doc.company_id,
        company_name: doc.company_name,
        store_name: doc.store_name,
        store_id: doc.store_id,
        skills: doc.skills,
        tags: doc.tags,
        candidate_gender: doc.candidate_gender,
        candidate_status: doc.candidate_status,
        approved: doc.approved,
        is_incomplete_profile: doc.is_incomplete_profile,
        candidate_civil_need_verification: doc.candidate_civil_need_verification,
        has_resume: doc.has_resume,
        candidate_hourly_rate: doc.candidate_hourly_rate,
        currency_code: doc.currency_code,
        text_match_info: hit.text_match_info,
      };
    });

    const totalPages = Math.ceil(found / params.per_page);

    const response: SearchResponse = {
      hits: mappedHits,
      found,
      page: params.page,
      per_page: params.per_page,
      total_pages: totalPages,
      facet_counts: facetCounts.map((fc: any) => ({
        field_name: fc.field_name,
        counts: (fc.counts ?? []).map((c: any) => ({
          value: String(c.value),
          count: c.count,
          highlighted: c.highlighted ?? String(c.value),
        })),
      })),
      search_time_ms: searchTimeMs,
    };

    return NextResponse.json(response, {
      headers: {
        "X-Total-Count": String(found),
        "X-Total-Pages": String(totalPages),
        "X-Page": String(params.page),
        "X-Per-Page": String(params.per_page),
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    console.error("[api/candidates/search] Typesense search failed:", err);
    return NextResponse.json(
      { error: "Search request failed" },
      { status: 500 },
    );
  }
}
