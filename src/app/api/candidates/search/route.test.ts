import { describe, it, expect, vi, beforeEach } from "vitest";

// =============================================================================
// Mock @/lib/typesense before importing route
// =============================================================================

const mockHealthRetrieve = vi.hoisted(() => vi.fn());
const mockSearchDocuments = vi.hoisted(() => vi.fn());

const mockGetTypesenseClient = vi.hoisted(() =>
  vi.fn(() => ({
    health: { retrieve: mockHealthRetrieve },
    collections: () => ({
      documents: () => ({ search: mockSearchDocuments }),
    }),
  })),
);

vi.mock("@/lib/typesense", () => ({
  getTypesenseClient: mockGetTypesenseClient,
  CANDIDATES_COLLECTION: "candidates",
}));

// =============================================================================
// Import route handler
// =============================================================================

import { GET } from "./route";
import { NextRequest } from "next/server";

// =============================================================================
// Fixtures
// =============================================================================

function makeCandidateDoc(overrides: Record<string, unknown> = {}) {
  return {
    candidate_id: 42,
    candidate_name: "Ahmed Al-Mutairi",
    candidate_name_ar: "أحمد المطيري",
    candidate_email: "ahmed@example.com",
    candidate_phone: "+965 5555 1234",
    candidate_uid: "C-001",
    country_id: 1,
    country_name: "Kuwait",
    university_id: 5,
    university_name: "Kuwait University",
    company_id: 0,
    company_name: "",
    store_name: "",
    store_id: 0,
    skills: ["JavaScript", "React", "Node.js"],
    tags: ["top-performer"],
    candidate_gender: 1,
    candidate_status: 10,
    approved: 1,
    is_incomplete_profile: false,
    candidate_civil_need_verification: false,
    has_resume: true,
    candidate_hourly_rate: 5.5,
    currency_code: "KWD",
    candidate_updated_at: 1700000000,
    ...overrides,
  };
}

function makeSearchHit(overrides: Record<string, unknown> = {}) {
  return {
    document: makeCandidateDoc(overrides),
    text_match: 100,
    text_match_info: {
      best_field_score: "100",
      best_field_weight: 10,
      fields_matched: 2,
      score: "1.0",
      tokens_matched: 2,
    },
  };
}

function makeTypesenseSearchResult(
  hits = [makeSearchHit()],
  found = 1,
  facetCounts: Array<Record<string, unknown>> = [],
) {
  return {
    hits,
    found,
    facet_counts: facetCounts,
    search_time_ms: 15,
  };
}

// =============================================================================
// Helpers
// =============================================================================

function makeRequest(searchParams: Record<string, string> = {}): NextRequest {
  const params = new URLSearchParams(searchParams).toString();
  const url = `http://localhost:3000/api/candidates/search${params ? `?${params}` : ""}`;
  return new NextRequest(url);
}

// =============================================================================
// Tests
// =============================================================================

describe("GET /api/candidates/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockSearchDocuments.mockResolvedValue(makeTypesenseSearchResult());
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  it("returns 200 with search results for a valid query", async () => {
    const request = makeRequest({ q: "Ahmed" });
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty("hits");
    expect(body).toHaveProperty("found");
    expect(body).toHaveProperty("page");
    expect(body).toHaveProperty("per_page");
    expect(body).toHaveProperty("total_pages");
    expect(body).toHaveProperty("facet_counts");
    expect(body).toHaveProperty("search_time_ms");
    expect(body.hits).toHaveLength(1);
    expect(body.found).toBe(1);
  });

  it("forwards the query to Typesense with correct query_by", async () => {
    const request = makeRequest({ q: "Ahmed" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.q).toBe("Ahmed");
    expect(args.query_by).toBe(
      "candidate_name,candidate_name_ar,candidate_email,candidate_phone,candidate_uid,skills,tags",
    );
  });

  it("maps Typesense hits to the correct response shape", async () => {
    const request = makeRequest({ q: "Ahmed" });
    const response = await GET(request);
    const body = await response.json();
    const hit = body.hits[0];

    expect(hit.candidate_id).toBe(42);
    expect(hit.candidate_name).toBe("Ahmed Al-Mutairi");
    expect(hit.candidate_name_ar).toBe("أحمد المطيري");
    expect(hit.candidate_email).toBe("ahmed@example.com");
    expect(hit.candidate_phone).toBe("+965 5555 1234");
    expect(hit.candidate_uid).toBe("C-001");
    expect(hit.country_id).toBe(1);
    expect(hit.country_name).toBe("Kuwait");
    expect(hit.university_id).toBe(5);
    expect(hit.university_name).toBe("Kuwait University");
    expect(hit.company_id).toBe(0);
    expect(hit.company_name).toBe("");
    expect(hit.store_name).toBe("");
    expect(hit.store_id).toBe(0);
    expect(hit.skills).toEqual(["JavaScript", "React", "Node.js"]);
    expect(hit.tags).toEqual(["top-performer"]);
    expect(hit.candidate_gender).toBe(1);
    expect(hit.candidate_status).toBe(10);
    expect(hit.approved).toBe(1);
    expect(hit.is_incomplete_profile).toBe(false);
    expect(hit.candidate_civil_need_verification).toBe(false);
    expect(hit.has_resume).toBe(true);
    expect(hit.candidate_hourly_rate).toBe(5.5);
    expect(hit.currency_code).toBe("KWD");
    expect(hit.text_match_info).toBeDefined();
    expect(hit.text_match_info.score).toBe("1.0");
  });

  // -------------------------------------------------------------------------
  // Empty query / match_all
  // -------------------------------------------------------------------------

  it("uses '*' as query when q is empty (match_all)", async () => {
    const request = makeRequest({ q: "" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.q).toBe("*");
  });

  it("uses '*' as query when q parameter is omitted", async () => {
    const request = makeRequest({});
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.q).toBe("*");
  });

  it("uses '*' when q is only whitespace", async () => {
    const request = makeRequest({ q: "   " });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.q).toBe("*");
  });

  // -------------------------------------------------------------------------
  // Filter params
  // -------------------------------------------------------------------------

  it("passes filter_by for active filter", async () => {
    const request = makeRequest({ filter: "active" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.filter_by).toContain("candidate_status: 10");
    expect(args.filter_by).toContain("approved: != 0");
  });

  it("passes filter_by for needs-review filter", async () => {
    const request = makeRequest({ filter: "needs-review" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.filter_by).toBe("approved: 0");
  });

  it("passes filter_by for incomplete filter", async () => {
    const request = makeRequest({ filter: "incomplete" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.filter_by).toBe("is_incomplete_profile: true");
  });

  it("passes filter_by for civil-id filter", async () => {
    const request = makeRequest({ filter: "civil-id" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.filter_by).toBe("candidate_civil_need_verification: true");
  });

  it("combines country_id filter correctly", async () => {
    const request = makeRequest({ country_id: "1" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.filter_by).toBe("country_id: 1");
  });

  it("combines university_id filter correctly", async () => {
    const request = makeRequest({ university_id: "5" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.filter_by).toBe("university_id: 5");
  });

  it("combines company_id filter correctly", async () => {
    const request = makeRequest({ company_id: "3" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.filter_by).toBe("company_id: 3");
  });

  it("combines skill filter correctly", async () => {
    const request = makeRequest({ skill: "JavaScript" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.filter_by).toBe("skills: [JavaScript]");
  });

  it("combines gender filter correctly", async () => {
    const request = makeRequest({ gender: "1" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.filter_by).toBe("candidate_gender: 1");
  });

  it("combines profile filters correctly", async () => {
    const completeReq = makeRequest({ profile: "complete" });
    await GET(completeReq);
    expect(mockSearchDocuments.mock.calls[0][0].filter_by).toBe(
      "is_incomplete_profile: false",
    );

    vi.clearAllMocks();
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockSearchDocuments.mockResolvedValue(makeTypesenseSearchResult());
    const incompleteReq = makeRequest({ profile: "incomplete" });
    await GET(incompleteReq);
    expect(mockSearchDocuments.mock.calls[0][0].filter_by).toBe(
      "is_incomplete_profile: true",
    );
  });

  it("combines assignment filters correctly", async () => {
    const assignedReq = makeRequest({ assignment: "assigned" });
    await GET(assignedReq);
    expect(mockSearchDocuments.mock.calls[0][0].filter_by).toBe(
      "store_id: != 0",
    );

    vi.clearAllMocks();
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockSearchDocuments.mockResolvedValue(makeTypesenseSearchResult());
    const unassignedReq = makeRequest({ assignment: "unassigned" });
    await GET(unassignedReq);
    expect(mockSearchDocuments.mock.calls[0][0].filter_by).toBe("store_id: 0");
  });

  it("combines document filters correctly", async () => {
    const resumeReq = makeRequest({ document: "resume" });
    await GET(resumeReq);
    expect(mockSearchDocuments.mock.calls[0][0].filter_by).toBe(
      "has_resume: true",
    );

    vi.clearAllMocks();
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockSearchDocuments.mockResolvedValue(makeTypesenseSearchResult());
    const noResumeReq = makeRequest({ document: "no-resume" });
    await GET(noResumeReq);
    expect(mockSearchDocuments.mock.calls[0][0].filter_by).toBe(
      "has_resume: false",
    );

    vi.clearAllMocks();
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockSearchDocuments.mockResolvedValue(makeTypesenseSearchResult());
    const civilIdReq = makeRequest({ document: "civil-id" });
    await GET(civilIdReq);
    expect(mockSearchDocuments.mock.calls[0][0].filter_by).toBe(
      "candidate_civil_need_verification: true",
    );
  });

  it("combines multiple filter params with AND", async () => {
    const request = makeRequest({
      country_id: "1",
      gender: "2",
      profile: "complete",
    });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.filter_by).toContain("country_id: 1");
    expect(args.filter_by).toContain("candidate_gender: 2");
    expect(args.filter_by).toContain("is_incomplete_profile: false");
    const parts = args.filter_by.split(" && ");
    expect(parts).toHaveLength(3);
  });

  it("omits filter_by when no filters are given", async () => {
    const request = makeRequest({ q: "test" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.filter_by).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------

  it("defaults page to 1 and per_page to 60", async () => {
    const request = makeRequest({ q: "test" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.page).toBe(1);
    expect(args.per_page).toBe(60);
  });

  it("accepts explicit page parameter", async () => {
    const request = makeRequest({ q: "test", page: "3" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.page).toBe(3);
  });

  it("accepts explicit per_page parameter", async () => {
    const request = makeRequest({ q: "test", per_page: "25" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.per_page).toBe(25);
  });

  it("coerces string page numbers to integers", async () => {
    const request = makeRequest({ q: "test", page: "2" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.page).toBe(2);
  });

  it("calculates correct total_pages", async () => {
    mockSearchDocuments.mockResolvedValue(
      makeTypesenseSearchResult([makeSearchHit()], 100),
    );
    const request = makeRequest({ per_page: "25" });
    const response = await GET(request);
    const body = await response.json();

    expect(body.total_pages).toBe(4); // ceil(100/25)
  });

  // -------------------------------------------------------------------------
  // Sort
  // -------------------------------------------------------------------------

  it("defaults sort_by to candidate_updated_at:desc", async () => {
    const request = makeRequest({ q: "test" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.sort_by).toBe("candidate_updated_at:desc");
  });

  it("accepts candidate_name:asc sort", async () => {
    const request = makeRequest({ q: "test", sort_by: "candidate_name:asc" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.sort_by).toBe("candidate_name:asc");
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  it("returns 400 for invalid parameters", async () => {
    const request = makeRequest({ page: "invalid" });
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid search parameters");
    expect(body.details).toBeDefined();
  });

  it("returns 400 for page less than 1", async () => {
    const request = makeRequest({ page: "0" });
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for per_page greater than 250", async () => {
    const request = makeRequest({ per_page: "300" });
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid gender value", async () => {
    const request = makeRequest({ gender: "5" });
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for q exceeding 500 characters", async () => {
    const request = makeRequest({ q: "a".repeat(501) });
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("returns 503 when Typesense health check fails", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: false });
    const request = makeRequest({ q: "test" });
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Search service is not available");
  });

  it("returns 503 when Typesense health check throws", async () => {
    mockHealthRetrieve.mockRejectedValue(new Error("Connection refused"));
    const request = makeRequest({ q: "test" });
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Search service is not available");
  });

  it("returns 500 when Typesense search fails with Error", async () => {
    mockSearchDocuments.mockRejectedValue(new Error("Search timeout"));
    const request = makeRequest({ q: "test" });
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Search request failed");
  });

  it("returns 500 when Typesense search fails with a non-Error rejection", async () => {
    mockSearchDocuments.mockRejectedValue("Raw string error");
    const request = makeRequest({ q: "test" });
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Search request failed");
  });

  // -------------------------------------------------------------------------
  // Response headers
  // -------------------------------------------------------------------------

  it("sets X-Total-Count header", async () => {
    mockSearchDocuments.mockResolvedValue(
      makeTypesenseSearchResult([makeSearchHit()], 42),
    );
    const request = makeRequest({ q: "test" });
    const response = await GET(request);

    expect(response.headers.get("X-Total-Count")).toBe("42");
  });

  it("sets X-Total-Pages header", async () => {
    mockSearchDocuments.mockResolvedValue(
      makeTypesenseSearchResult([makeSearchHit()], 60),
    );
    const request = makeRequest({ per_page: "10" });
    const response = await GET(request);

    expect(response.headers.get("X-Total-Pages")).toBe("6");
  });

  it("sets X-Page and X-Per-Page headers", async () => {
    const request = makeRequest({ page: "2", per_page: "20" });
    const response = await GET(request);

    expect(response.headers.get("X-Page")).toBe("2");
    expect(response.headers.get("X-Per-Page")).toBe("20");
  });

  it("sets Cache-Control header", async () => {
    const request = makeRequest({ q: "test" });
    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=60, stale-while-revalidate=120",
    );
  });

  it("returns JSON content type", async () => {
    const request = makeRequest({ q: "test" });
    const response = await GET(request);

    expect(response.headers.get("Content-Type")).toContain("application/json");
  });

  // -------------------------------------------------------------------------
  // Response shape and edge cases
  // -------------------------------------------------------------------------

  it("returns empty hits array when Typesense returns no results", async () => {
    mockSearchDocuments.mockResolvedValue(
      makeTypesenseSearchResult([], 0),
    );
    const request = makeRequest({ q: "nonexistent" });
    const response = await GET(request);
    const body = await response.json();

    expect(body.hits).toEqual([]);
    expect(body.found).toBe(0);
    expect(body.total_pages).toBe(0);
  });

  it("handles null/undefined hits gracefully", async () => {
    mockSearchDocuments.mockResolvedValue({
      found: 0,
      facet_counts: [],
      search_time_ms: 0,
    });
    const request = makeRequest({ q: "test" });
    const response = await GET(request);
    const body = await response.json();

    expect(body.hits).toEqual([]);
    expect(body.found).toBe(0);
  });

  it("maps facet_counts correctly", async () => {
    mockSearchDocuments.mockResolvedValue(
      makeTypesenseSearchResult([makeSearchHit()], 1, [
        {
          field_name: "country_name",
          counts: [
            { value: "Kuwait", count: 50, highlighted: "Kuwait" },
            { value: "Saudi Arabia", count: 30, highlighted: "Saudi Arabia" },
          ],
        },
      ]),
    );
    const request = makeRequest({ q: "test" });
    const response = await GET(request);
    const body = await response.json();

    expect(body.facet_counts).toHaveLength(1);
    expect(body.facet_counts[0].field_name).toBe("country_name");
    expect(body.facet_counts[0].counts).toHaveLength(2);
    expect(body.facet_counts[0].counts[0].value).toBe("Kuwait");
    expect(body.facet_counts[0].counts[0].count).toBe(50);
  });

  it("handles facet counts with null/undefined highlighted", async () => {
    mockSearchDocuments.mockResolvedValue(
      makeTypesenseSearchResult([makeSearchHit()], 1, [
        {
          field_name: "skills",
          counts: [{ value: "JavaScript", count: 10, highlighted: null }],
        },
      ]),
    );
    const request = makeRequest({ q: "test" });
    const response = await GET(request);
    const body = await response.json();

    expect(body.facet_counts[0].counts[0].highlighted).toBe("JavaScript");
  });

  it("forwards the correct facet_by to Typesense", async () => {
    const request = makeRequest({ q: "test" });
    await GET(request);

    const args = mockSearchDocuments.mock.calls[0][0];
    expect(args.facet_by).toBe(
      "country_name,university_name,company_name,skills,candidate_gender",
    );
    expect(args.max_facet_values).toBe(25);
  });
});
