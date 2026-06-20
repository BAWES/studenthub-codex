import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { NextRequest } from "next/server";

// =============================================================================
// Mock the underlying search module before importing the route handler
// =============================================================================

const mockGetCandidateSearchWorkspaceTypesense = vi.hoisted(() => vi.fn());

vi.mock("@/modules/candidates/search-typesense", () => ({
  getCandidateSearchWorkspaceTypesense: mockGetCandidateSearchWorkspaceTypesense,
}));

// =============================================================================
// Import module under test — the API route handler
// =============================================================================

const { GET } = await import("./route");

// =============================================================================
// Fixtures
// =============================================================================

const defaultWorkspaceResult = {
  role: "admin" as const,
  query: "test",
  filter: "all" as const,
  source: { current: "Typesense", target: "Typesense", note: "Powered by Typesense search engine on port 8108." },
  rows: [
    {
      id: 42,
      uid: "C-001",
      name: "Test Candidate",
      email: "test@example.com",
      phone: "+965 5555 1234",
      status: "Active",
      signal: "Ready",
      country: "Kuwait",
      university: "KU",
      company: "No company",
      store: "No store",
      rate: "5.500 KWD",
      updated: "Jun 10, 2026",
      flags: [],
      skills: ["JavaScript", "React"],
      score: 6,
    },
  ],
  metrics: [
    { label: "Candidates", value: 100, note: "Visible to this login" },
    { label: "Active", value: 50, note: "Approved and active" },
    { label: "Needs review", value: 5, note: "Approval queue" },
    { label: "Incomplete", value: 3, note: "Profile cleanup" },
    { label: "Civil ID", value: 2, note: "Document review" },
  ],
  facets: [],
  matchingCount: 1,
  selected: null,
  selectedActions: [],
  openTabs: [],
  selectedId: null,
  selectedBlocked: false,
  assignedCount: null,
  params: {},
};

function mockRequest(url: string): NextRequest {
  return new NextRequest(url);
}

// =============================================================================
// Tests
// =============================================================================

describe("GET /api/candidates/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCandidateSearchWorkspaceTypesense.mockResolvedValue(defaultWorkspaceResult);
  });

  // ---- Happy path ----

  it("returns 200 with search results for a valid query", async () => {
    const response = await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty("rows");
    expect(body.rows).toHaveLength(1);
    expect(body.rows[0].name).toBe("Test Candidate");
    expect(body.matchingCount).toBe(1);

    // Verify the underlying function was called with expected params
    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "test",
        role: "admin",
      }),
    );
  });

  it("returns 200 with match_all when no query param provided", async () => {
    const response = await GET(mockRequest("http://localhost:3000/api/candidates/search"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "",
      }),
    );
  });

  it("returns 200 with empty query string", async () => {
    const response = await GET(mockRequest("http://localhost:3000/api/candidates/search?q="));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "",
      }),
    );
  });

  // ---- Filter params ----

  it("passes filter param to search function", async () => {
    await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test&filter=active"));

    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledWith(
      expect.objectContaining({ filter: "active" }),
    );
  });

  it("passes country and university filter params", async () => {
    await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test&country=1&university=2"));

    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledWith(
      expect.objectContaining({ country: "1", university: "2" }),
    );
  });

  it("passes all facet filter params", async () => {
    const url =
      "http://localhost:3000/api/candidates/search?q=test&filter=active&country=1&university=2&company=3&skill=JavaScript&gender=1&profile=complete&assignment=assigned&document=resume";

    await GET(mockRequest(url));

    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: "active",
        country: "1",
        university: "2",
        company: "3",
        skill: "JavaScript",
        gender: "1",
        profile: "complete",
        assignment: "assigned",
        document: "resume",
      }),
    );
  });

  it("defaults filter to 'all' when not provided", async () => {
    await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test"));

    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledWith(
      expect.objectContaining({ filter: "all" }),
    );
  });

  // ---- Pagination ----

  it("passes page param to search function", async () => {
    await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test&page=2"));

    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });

  it("defaults page to 1 when not provided", async () => {
    await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test"));

    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 }),
    );
  });

  it("accepts page as string and coerces to number", async () => {
    await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test&page=3"));

    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3 }),
    );
  });

  // ---- Search response shape ----

  it("returns complete workspace response shape", async () => {
    const response = await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty("rows");
    expect(body).toHaveProperty("metrics");
    expect(body).toHaveProperty("facets");
    expect(body).toHaveProperty("source");
    expect(body).toHaveProperty("matchingCount");
    expect(body).toHaveProperty("selected");
    expect(body).toHaveProperty("selectedActions");
    expect(body).toHaveProperty("openTabs");
    expect(body).toHaveProperty("selectedId");
    expect(body).toHaveProperty("selectedBlocked");
    expect(body).toHaveProperty("assignedCount");
    expect(body).toHaveProperty("params");
  });

  it("returns JSON content-type header", async () => {
    const response = await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test"));
    expect(response.headers.get("content-type")).toBe("application/json");
  });

  // ---- Error handling ----

  it("returns 500 when underlying search function rejects", async () => {
    mockGetCandidateSearchWorkspaceTypesense.mockRejectedValue(new Error("Typesense connection refused"));

    const response = await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toHaveProperty("error");
    expect(body.error).toContain("Typesense");
  });

  it("returns a generic error message for unknown errors", async () => {
    mockGetCandidateSearchWorkspaceTypesense.mockRejectedValue(new Error("Something went wrong"));

    const response = await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toHaveProperty("error");
  });

  it("handles non-Error rejections gracefully", async () => {
    mockGetCandidateSearchWorkspaceTypesense.mockRejectedValue("string error");

    const response = await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toHaveProperty("error");
  });

  it("returns empty rows array when no matches found", async () => {
    mockGetCandidateSearchWorkspaceTypesense.mockResolvedValue({
      ...defaultWorkspaceResult,
      rows: [],
      matchingCount: 0,
    });

    const response = await GET(mockRequest("http://localhost:3000/api/candidates/search?q=nonexistent"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.rows).toHaveLength(0);
    expect(body.matchingCount).toBe(0);
  });

  // ---- Search result field integrity ----

  it("each row has all required fields", async () => {
    const response = await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test"));
    const body = await response.json();

    for (const row of body.rows) {
      expect(row).toHaveProperty("id");
      expect(row).toHaveProperty("uid");
      expect(row).toHaveProperty("name");
      expect(row).toHaveProperty("email");
      expect(row).toHaveProperty("phone");
      expect(row).toHaveProperty("status");
      expect(row).toHaveProperty("signal");
      expect(row).toHaveProperty("country");
      expect(row).toHaveProperty("university");
      expect(row).toHaveProperty("company");
      expect(row).toHaveProperty("rate");
      expect(row).toHaveProperty("updated");
      expect(row).toHaveProperty("flags");
      expect(row).toHaveProperty("skills");
      expect(row).toHaveProperty("score");
    }
  });

  // ---- Staff role params ----

  it("passes role and staffId when provided", async () => {
    await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test&role=staff&staffId=5"));

    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledWith(
      expect.objectContaining({ role: "staff", staffId: 5 }),
    );
  });

  it("defaults role to admin when not provided", async () => {
    await GET(mockRequest("http://localhost:3000/api/candidates/search?q=test"));

    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledWith(
      expect.objectContaining({ role: "admin" }),
    );
  });
});
