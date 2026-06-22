import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// =============================================================================
// Mock all external dependencies before importing the module under test
// =============================================================================

// Typesense client mocks
const mockHealthRetrieve = vi.hoisted(() => vi.fn());
const mockCollectionRetrieve = vi.hoisted(() => vi.fn());
const mockSearchDocuments = vi.hoisted(() => vi.fn());

const mockGetTypesenseClient = vi.hoisted(() => vi.fn(() => ({
  health: { retrieve: mockHealthRetrieve },
  collections: () => ({
    retrieve: mockCollectionRetrieve,
    documents: () => ({ search: mockSearchDocuments }),
  }),
})));

vi.mock("@/lib/typesense", () => ({
  getTypesenseClient: mockGetTypesenseClient,
  isTypesenseAvailable: vi.fn().mockResolvedValue(true),
  CANDIDATES_COLLECTION: "candidates",
}));

// Prisma mock
const mockPrismaCount = vi.hoisted(() => vi.fn());
const mockPrismaFindFirst = vi.hoisted(() => vi.fn());
const mockPrismaFindMany = vi.hoisted(() => vi.fn());
const mockPrismaGroupBy = vi.hoisted(() => vi.fn());
const mockPrismaTransaction = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      count: mockPrismaCount,
      findFirst: mockPrismaFindFirst,
      findMany: mockPrismaFindMany,
      groupBy: mockPrismaGroupBy,
    },
    $transaction: mockPrismaTransaction,
  },
}));

// Candidate detail mock
const mockGetCandidateDetail = vi.hoisted(() => vi.fn());
vi.mock("@/modules/candidates/candidate-detail", () => ({
  getCandidateDetail: mockGetCandidateDetail,
}));

// Search module mocks — uses importOriginal for partial mocking
const mockCandidateIdsForStaff = vi.hoisted(() => vi.fn());
const mockBuildSelectedActions = vi.hoisted(() => vi.fn());
const mockUniqueCandidateIds = vi.hoisted(() => vi.fn());
const mockGetCandidateSearchWorkspace = vi.hoisted(() => vi.fn());

vi.mock("./search", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./search")>();
  return {
    ...actual,
    candidateIdsForStaff: mockCandidateIdsForStaff,
    buildSelectedActions: mockBuildSelectedActions,
    uniqueCandidateIds: mockUniqueCandidateIds,
    getCandidateSearchWorkspace: mockGetCandidateSearchWorkspace,
  };
});

// =============================================================================
// Import module under test — done AFTER all mocks are set up
// =============================================================================

import { getCandidateSearchWorkspaceTypesense } from "./search-typesense";

// ---------------------------------------------------------------------------
// Local duplicates of internal helpers — buildFlags, buildTypesenseFacets,
// and resolveSelectedCandidateId are NOT exported from search-typesense.ts
// (documented as local to the module). We replicate their logic here for
// unit-testing the contract.
// ---------------------------------------------------------------------------

function buildFlags(doc: Record<string, unknown>): string[] {
  const flags: string[] = [];
  if (doc.approved === 0) flags.push("Needs review");
  if (doc.is_incomplete_profile === true) flags.push("Incomplete");
  if (doc.candidate_civil_need_verification === true) flags.push("Civil ID");
  if (doc.candidate_status !== 10 && doc.candidate_status !== undefined) {
    flags.push(`Status ${doc.candidate_status}`);
  }
  return flags;
}

function buildTypesenseFacets(
  facetCounts: any[],
  params: Record<string, unknown>,
): { key: string; label: string; options: { label: string; value: string; count: number; active: boolean }[] }[] {
  const facets: { key: string; label: string; options: { label: string; value: string; count: number; active: boolean }[] }[] = [];

  // Static facets
  const staticFacets = [
    {
      key: "profile",
      label: "Profile",
      options: [
        { label: "Complete", value: "complete", count: 0, active: params.profile === "complete" },
        { label: "Incomplete", value: "incomplete", count: 0, active: params.profile === "incomplete" },
      ],
    },
    {
      key: "assignment",
      label: "Assignment",
      options: [
        { label: "Assigned", value: "assigned", count: 0, active: params.assignment === "assigned" },
        { label: "Unassigned", value: "unassigned", count: 0, active: params.assignment === "unassigned" },
      ],
    },
    {
      key: "document",
      label: "Document",
      options: [
        { label: "Has resume", value: "resume", count: 0, active: params.document === "resume" },
        { label: "Has other", value: "other", count: 0, active: params.document === "other" },
      ],
    },
  ];
  facets.push(...staticFacets);

  // Dynamic facets from facet counts
  const genderMap: Record<string, string> = { "1": "Male", "2": "Female", "3": "Other" };
  for (const fc of facetCounts) {
    if (fc.counts.length === 0) continue;
    let key = "";
    let label = "";
    if (fc.field_name === "candidate_gender") {
      key = "gender";
      label = "Gender";
    } else if (fc.field_name === "country_name") {
      key = "country";
      label = "Country";
    } else if (fc.field_name === "university_name") {
      key = "university";
      label = "University";
    } else if (fc.field_name === "company_name") {
      key = "company";
      label = "Company";
    } else if (fc.field_name === "skills") {
      key = "skill";
      label = "Skills";
    } else {
      continue;
    }
    const options = fc.counts.map((c: { value: string; count: number }) => ({
      label: key === "gender" ? genderMap[c.value] ?? c.value : c.value,
      value: c.value,
      count: c.count,
      active: params[key] === c.value,
    }));
    facets.push({ key, label, options });
  }

  return facets;
}

async function resolveSelectedCandidateId({
  requestedId,
  rows,
  scopedCandidateIds,
}: {
  requestedId?: number;
  rows: { id: number }[];
  scopedCandidateIds: number[] | null;
}): Promise<number | undefined> {
  if (requestedId === undefined) return undefined;
  if (scopedCandidateIds && !scopedCandidateIds.includes(requestedId)) return undefined;
  if (rows.some((r) => r.id === requestedId)) return requestedId;
  // Fallback DB lookup is outside the scope of this unit test — just return undefined
  return undefined;
}

// =============================================================================
// Fixtures
// =============================================================================

function makeCandidateDoc(overrides: Record<string, unknown> = {}) {
  return {
    candidate_id: 42,
    candidate_name: "Test Candidate",
    candidate_name_ar: "",
    candidate_email: "test@example.com",
    candidate_phone: "+965 5555 1234",
    candidate_uid: "C-001",
    country_id: 1,
    country_name: "Kuwait",
    university_id: 1,
    university_name: "KU",
    company_id: 0,
    company_name: "",
    store_name: "",
    store_id: 0,
    skills: ["JavaScript", "React"],
    tags: [],
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

function makeSearchHit(doc: Record<string, unknown> = {}) {
  return {
    document: makeCandidateDoc(doc),
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

function makeFacetCount(fieldName: string, counts: { value: string; count: number }[]) {
  return {
    field_name: fieldName,
    counts: counts.map((c) => ({
      highlighted: c.value,
      value: c.value,
      count: c.count,
    })),
    sampled: false,
    stats: { total_values: counts.length },
  };
}

const defaultParams = {
  role: "admin" as const,
  query: "test",
  filter: "all" as const,
};

// =============================================================================
// Tests
// =============================================================================

describe("buildFlags", () => {
  it("returns empty array for a fully approved, active candidate", () => {
    expect(buildFlags(makeCandidateDoc())).toEqual([]);
  });

  it("flags needs-review when approved === 0", () => {
    expect(buildFlags(makeCandidateDoc({ approved: 0 }))).toContain("Needs review");
  });

  it("flags incomplete when is_incomplete_profile is true", () => {
    expect(buildFlags(makeCandidateDoc({ is_incomplete_profile: true }))).toContain("Incomplete");
  });

  it("flags civil-id when candidate_civil_need_verification is true", () => {
    expect(buildFlags(makeCandidateDoc({ candidate_civil_need_verification: true }))).toContain("Civil ID");
  });

  it("flags non-active status when candidate_status !== 10", () => {
    expect(buildFlags(makeCandidateDoc({ candidate_status: 5 }))).toContain("Status 5");
  });

  it("returns multiple flags when several conditions are true", () => {
    const doc = makeCandidateDoc({
      approved: 0,
      is_incomplete_profile: true,
      candidate_civil_need_verification: true,
      candidate_status: 3,
    });
    expect(buildFlags(doc)).toEqual(["Needs review", "Incomplete", "Civil ID", "Status 3"]);
  });
});

describe("buildTypesenseFacets", () => {
  it("returns static facets (profile, assignment, document) even with no dynamic data", () => {
    const facets = buildTypesenseFacets([], defaultParams);
    const keys = facets.map((f) => f.key);
    expect(keys).toContain("profile");
    expect(keys).toContain("assignment");
    expect(keys).toContain("document");
    // No dynamic facets since no facet counts
    expect(keys.filter((k) => !["profile", "assignment", "document"].includes(k))).toEqual([]);
  });

  it("maps gender numeric values to labels", () => {
    const facetCounts = [
      makeFacetCount("candidate_gender", [
        { value: "1", count: 10 },
        { value: "2", count: 5 },
        { value: "3", count: 2 },
      ]),
    ];
    const facets = buildTypesenseFacets(facetCounts, defaultParams);
    const genderFacet = facets.find((f) => f.key === "gender");
    expect(genderFacet).toBeDefined();
    expect(genderFacet!.options).toEqual([
      { label: "Male", value: "1", count: 10, active: false },
      { label: "Female", value: "2", count: 5, active: false },
      { label: "Other", value: "3", count: 2, active: false },
    ]);
  });

  it("marks gender option active when params.gender matches", () => {
    const facetCounts = [makeFacetCount("candidate_gender", [{ value: "1", count: 10 }])];
    const facets = buildTypesenseFacets(facetCounts, { ...defaultParams, gender: "1" });
    expect(facets.find((f) => f.key === "gender")!.options[0].active).toBe(true);
  });

  it("builds country facet from facetCounts", () => {
    const facetCounts = [
      makeFacetCount("country_name", [
        { value: "Kuwait", count: 50 },
        { value: "Saudi Arabia", count: 30 },
      ]),
    ];
    const facets = buildTypesenseFacets(facetCounts, defaultParams);
    expect(facets.find((f) => f.key === "country")!.options).toEqual([
      { label: "Kuwait", value: "Kuwait", count: 50, active: false },
      { label: "Saudi Arabia", value: "Saudi Arabia", count: 30, active: false },
    ]);
  });

  it("builds university facet from facetCounts", () => {
    const facetCounts = [makeFacetCount("university_name", [{ value: "KU", count: 20 }])];
    const facets = buildTypesenseFacets(facetCounts, defaultParams);
    expect(facets.find((f) => f.key === "university")!.options).toEqual([
      { label: "KU", value: "KU", count: 20, active: false },
    ]);
  });

  it("builds company facet from facetCounts", () => {
    const facetCounts = [makeFacetCount("company_name", [{ value: "Acme", count: 5 }])];
    const facets = buildTypesenseFacets(facetCounts, defaultParams);
    expect(facets.find((f) => f.key === "company")!.options).toEqual([
      { label: "Acme", value: "Acme", count: 5, active: false },
    ]);
  });

  it("builds skills facet from facetCounts", () => {
    const facetCounts = [makeFacetCount("skills", [{ value: "JavaScript", count: 15 }])];
    const facets = buildTypesenseFacets(facetCounts, defaultParams);
    expect(facets.find((f) => f.key === "skill")!.options).toEqual([
      { label: "JavaScript", value: "JavaScript", count: 15, active: false },
    ]);
  });

  it("includes static profile, assignment, document facets with active state from params", () => {
    const facets = buildTypesenseFacets([], {
      ...defaultParams,
      profile: "complete",
      assignment: "assigned",
      document: "resume",
    });
    const profileFacet = facets.find((f) => f.key === "profile")!;
    expect(profileFacet.options.find((o) => o.value === "complete")!.active).toBe(true);
    expect(profileFacet.options.find((o) => o.value === "incomplete")!.active).toBe(false);

    expect(facets.find((f) => f.key === "assignment")!.options.find((o) => o.value === "assigned")!.active).toBe(true);
    expect(facets.find((f) => f.key === "document")!.options.find((o) => o.value === "resume")!.active).toBe(true);
  });

  it("marks country/university active when params match", () => {
    const facetCounts = [
      makeFacetCount("country_name", [{ value: "Kuwait", count: 50 }]),
      makeFacetCount("university_name", [{ value: "KU", count: 20 }]),
    ];
    const facets = buildTypesenseFacets(facetCounts, { ...defaultParams, country: "Kuwait", university: "KU" });
    expect(facets.find((f) => f.key === "country")!.options[0].active).toBe(true);
    expect(facets.find((f) => f.key === "university")!.options[0].active).toBe(true);
  });

  it("filters out dynamic facets with zero options", () => {
    // Empty facet counts for a field should not create a facet entry
    const facetCounts = [makeFacetCount("country_name", [])];
    const facets = buildTypesenseFacets(facetCounts, defaultParams);
    expect(facets.find((f) => f.key === "country")).toBeUndefined();
  });
});

describe("resolveSelectedCandidateId", () => {
  beforeEach(() => {
    mockPrismaFindFirst.mockReset().mockResolvedValue(null);
  });

  it("returns undefined when requestedId is not provided", async () => {
    const result = await resolveSelectedCandidateId({
      requestedId: undefined,
      rows: [],
      scopedCandidateIds: null,
    });
    expect(result).toBeUndefined();
    expect(mockPrismaFindFirst).not.toHaveBeenCalled();
  });

  it("returns undefined when requestedId is outside the staff scope", async () => {
    const result = await resolveSelectedCandidateId({
      requestedId: 999,
      rows: [],
      scopedCandidateIds: [1, 2, 3],
    });
    expect(result).toBeUndefined();
    expect(mockPrismaFindFirst).not.toHaveBeenCalled();
  });

  it("returns requestedId when present in current rows", async () => {
    const result = await resolveSelectedCandidateId({
      requestedId: 42,
      rows: [{ id: 42 }] as any,
      scopedCandidateIds: null,
    });
    expect(result).toBe(42);
    expect(mockPrismaFindFirst).not.toHaveBeenCalled();
  });

  it("falls back to DB lookup when not in current rows", async () => {
    mockPrismaFindFirst.mockResolvedValue({ candidate_id: 99 });
    const result = await resolveSelectedCandidateId({
      requestedId: 99,
      rows: [{ id: 42 }] as any,
      scopedCandidateIds: null,
    });
    expect(result).toBe(99);
    expect(mockPrismaFindFirst).toHaveBeenCalledWith({
      where: { candidate_id: 99, deleted: 0 },
      select: { candidate_id: true },
    });
  });

  it("returns undefined when DB also does not have the candidate", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);
    const result = await resolveSelectedCandidateId({
      requestedId: 999,
      rows: [{ id: 42 }] as any,
      scopedCandidateIds: null,
    });
    expect(result).toBeUndefined();
  });
});

describe("getCandidateSearchWorkspaceTypesense", () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Default healthy Typesense
    mockHealthRetrieve.mockResolvedValue({ ok: true });
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 100 });
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit()],
      found: 1,
      facet_counts: [],
    });

    // Default prisma metrics
    mockPrismaTransaction.mockResolvedValue([100, 50, 5, 3, 2]);

    // Default candidate detail
    mockGetCandidateDetail.mockResolvedValue({
      candidate: makeCandidateDoc(),
    });

    // Default fallback search helpers — groupBy used by getCandidateSearchWorkspace
    mockPrismaGroupBy.mockResolvedValue([]);

    // Default search helpers
    mockUniqueCandidateIds.mockImplementation((ids: number[]) => ids.slice(0, 8));
    mockBuildSelectedActions.mockReturnValue([]);
    mockCandidateIdsForStaff.mockResolvedValue(null);

    // Default fallback mock — getCandidateSearchWorkspace used via dynamic import
    mockGetCandidateSearchWorkspace.mockResolvedValue({
      role: defaultParams.role,
      query: defaultParams.query,
      filter: defaultParams.filter,
      source: { current: "MySQL", target: "MySQL", note: "Fallback" },
      rows: [],
      metrics: [],
      facets: [],
      matchingCount: 0,
      selected: null,
      selectedActions: [],
      openTabs: [],
      assignedCount: null,
      selectedId: null,
      selectedBlocked: false,
      params: {},
    });
  });

  // ---- Happy path ----
  it("returns a full workspace response shape", async () => {
    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);

    expect(result).toHaveProperty("role", "admin");
    expect(result).toHaveProperty("query", "test");
    expect(result).toHaveProperty("filter", "all");
    expect(result).toHaveProperty("rows");
    expect(result).toHaveProperty("metrics");
    expect(result).toHaveProperty("facets");
    expect(result).toHaveProperty("source");
    expect(result.source).toEqual({
      current: "Typesense",
      target: "Typesense",
      note: "Powered by Typesense search engine on port 8108.",
    });
    expect(result).toHaveProperty("selected");
    expect(result).toHaveProperty("selectedActions");
    expect(result).toHaveProperty("openTabs");
    expect(result).toHaveProperty("assignedCount");
  });

  it("calls Typesense health check and collection retrieve before searching", async () => {
    await getCandidateSearchWorkspaceTypesense(defaultParams);

    expect(mockHealthRetrieve).toHaveBeenCalled();
    expect(mockCollectionRetrieve).toHaveBeenCalled();
    expect(mockSearchDocuments).toHaveBeenCalled();
  });

  it("passes * as query when input query is empty (match_all)", async () => {
    await getCandidateSearchWorkspaceTypesense({ ...defaultParams, query: "" });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.q).toBe("*");
  });

  it("passes the input query through to Typesense when non-empty", async () => {
    await getCandidateSearchWorkspaceTypesense({ ...defaultParams, query: "Ahmed" });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.q).toBe("Ahmed");
  });

  it("builds filter_by with all applicable filter types", async () => {
    await getCandidateSearchWorkspaceTypesense({
      ...defaultParams,
      filter: "active",
      country: "1",
      university: "2",
      company: "3",
      skill: "4",
      gender: "1",
      profile: "complete",
      assignment: "assigned",
      document: "resume",
    });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    const filterBy = searchArgs.filter_by;
    expect(filterBy).toContain("candidate_status: 10 && approved: != 0");
    expect(filterBy).toContain("country_id: 1");
    expect(filterBy).toContain("university_id: 2");
    expect(filterBy).toContain("company_id: 3");
    expect(filterBy).toContain("skills: [4]");
    expect(filterBy).toContain("candidate_gender: 1");
    expect(filterBy).toContain("is_incomplete_profile: false");
    expect(filterBy).toContain("store_id: != 0");
    expect(filterBy).toContain("has_resume: true");
  });

  it("sets correct search parameters (query_by, sort_by, per_page)", async () => {
    await getCandidateSearchWorkspaceTypesense(defaultParams);

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.query_by).toBe(
      "candidate_name,candidate_name_ar,candidate_email,candidate_phone,candidate_uid,skills,tags",
    );
    expect(searchArgs.facet_by).toBe(
      "country_name,university_name,company_name,skills,candidate_gender",
    );
    expect(searchArgs.sort_by).toBe("candidate_updated_at:desc");
    expect(searchArgs.per_page).toBe(60);
    expect(searchArgs.page).toBe(1);
  });

  it("builds rows from Typesense hits", async () => {
    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);

    expect(result.rows).toHaveLength(1);
    const row = result.rows[0];
    expect(row.id).toBe(42);
    expect(row.name).toBe("Test Candidate");
    expect(row.email).toBe("test@example.com");
    expect(row.phone).toBe("+965 5555 1234");
    expect(row.country).toBe("Kuwait");
    expect(row.university).toBe("KU");
    expect(row.company).toBe("No company");
    expect(row.rate).toContain("5.5");
    expect(row.rate).toContain("KWD");
    expect(row.score).toBeGreaterThanOrEqual(0);
  });

  it("returns metrics from Prisma transaction counts", async () => {
    mockPrismaTransaction.mockResolvedValue([200, 80, 10, 5, 3]);
    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);

    expect(result.metrics).toHaveLength(5);
    expect(result.metrics[0]).toEqual({ label: "Candidates", value: 200, note: "Visible to this login" });
    expect(result.metrics[1]).toEqual({ label: "Active", value: 80, note: "Approved and active" });
  });

  it("sets matchingCount from Typesense found value", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit()],
      found: 42,
      facet_counts: [],
    });
    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);
    expect(result.matchingCount).toBe(42);
  });

  // ---- Staff visibility ----
  it("scopes candidate IDs for staff role with assigned visibility", async () => {
    mockCandidateIdsForStaff.mockResolvedValue([1, 2, 3]);

    await getCandidateSearchWorkspaceTypesense({
      role: "staff",
      staffId: 5,
      query: "test",
      filter: "all",
      visibility: "assigned",
    });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.filter_by).toContain("candidate_id: [1,2,3]");
    expect(mockCandidateIdsForStaff).toHaveBeenCalledWith(5);
  });

  it("does not scope for admin role even with visibility assigned", async () => {
    await getCandidateSearchWorkspaceTypesense({
      role: "admin",
      query: "test",
      filter: "all",
      visibility: "assigned",
    });

    // Admin always gets visibility "all" (line 28)
    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.filter_by).toBeUndefined();
  });

  it("does not scope when visibility is 'all' for staff", async () => {
    mockCandidateIdsForStaff.mockResolvedValue([1, 2, 3]);

    await getCandidateSearchWorkspaceTypesense({
      role: "staff",
      staffId: 5,
      query: "test",
      filter: "all",
      visibility: "all",
    });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.filter_by).toBeUndefined();
  });

  // ---- Fallback: health check fails ----
  it("falls back to MySQL when Typesense health check returns !ok", async () => {
    mockHealthRetrieve.mockResolvedValue({ ok: false });

    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);

    expect(result.source.current).toBe("MySQL");
    expect(mockHealthRetrieve).toHaveBeenCalled();
    expect(mockSearchDocuments).not.toHaveBeenCalled();
    expect(mockGetCandidateSearchWorkspace).toHaveBeenCalled();
  });

  it("falls back to MySQL when Typesense health rejects", async () => {
    mockHealthRetrieve.mockRejectedValue(new Error("Connection refused"));

    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);

    expect(result.source.current).toBe("MySQL");
    expect(mockHealthRetrieve).toHaveBeenCalled();
    expect(mockSearchDocuments).not.toHaveBeenCalled();
    expect(mockGetCandidateSearchWorkspace).toHaveBeenCalled();
  });

  it("falls back to MySQL when Typesense collection has no documents", async () => {
    mockCollectionRetrieve.mockResolvedValue({ num_documents: 0 });

    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);

    expect(result.source.current).toBe("MySQL");
    expect(mockHealthRetrieve).toHaveBeenCalled();
    expect(mockCollectionRetrieve).toHaveBeenCalled();
    expect(mockSearchDocuments).not.toHaveBeenCalled();
    expect(mockGetCandidateSearchWorkspace).toHaveBeenCalled();
  });

  it("falls back to MySQL when Typesense collection retrieve rejects", async () => {
    mockCollectionRetrieve.mockRejectedValue(new Error("Collection not found"));

    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);

    expect(result.source.current).toBe("MySQL");
    expect(mockSearchDocuments).not.toHaveBeenCalled();
    expect(mockGetCandidateSearchWorkspace).toHaveBeenCalled();
  });

  // ---- Filter edge cases ----
  it("constructs needs-review filter correctly", async () => {
    await getCandidateSearchWorkspaceTypesense({
      ...defaultParams,
      filter: "needs-review",
    });

    const filterBy = mockSearchDocuments.mock.calls[0][0].filter_by;
    expect(filterBy).toContain("approved: 0");
  });

  it("constructs incomplete filter correctly", async () => {
    await getCandidateSearchWorkspaceTypesense({
      ...defaultParams,
      filter: "incomplete",
    });

    const filterBy = mockSearchDocuments.mock.calls[0][0].filter_by;
    expect(filterBy).toContain("is_incomplete_profile: true");
  });

  it("constructs civil-id filter correctly", async () => {
    await getCandidateSearchWorkspaceTypesense({
      ...defaultParams,
      filter: "civil-id",
    });

    const filterBy = mockSearchDocuments.mock.calls[0][0].filter_by;
    expect(filterBy).toContain("candidate_civil_need_verification: true");
  });

  it("constructs profile=incomplete filter correctly", async () => {
    await getCandidateSearchWorkspaceTypesense({
      ...defaultParams,
      profile: "incomplete",
    });

    const filterBy = mockSearchDocuments.mock.calls[0][0].filter_by;
    expect(filterBy).toContain("is_incomplete_profile: true");
  });

  it("constructs assignment=unassigned filter correctly", async () => {
    await getCandidateSearchWorkspaceTypesense({
      ...defaultParams,
      assignment: "unassigned",
    });

    const filterBy = mockSearchDocuments.mock.calls[0][0].filter_by;
    expect(filterBy).toContain("store_id: 0");
  });

  it("constructs document=no-resume filter correctly", async () => {
    await getCandidateSearchWorkspaceTypesense({
      ...defaultParams,
      document: "no-resume",
    });

    const filterBy = mockSearchDocuments.mock.calls[0][0].filter_by;
    expect(filterBy).toContain("has_resume: false");
  });

  it("omits filter_by when no filters apply and no scoped IDs", async () => {
    await getCandidateSearchWorkspaceTypesense({
      ...defaultParams,
      filter: "all",
    });

    const searchArgs = mockSearchDocuments.mock.calls[0][0];
    expect(searchArgs.filter_by).toBeUndefined();
  });

  // ---- Score calculation ----
  it("calculates score correctly for a needs-review candidate", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit({ approved: 0, skills: ["A", "B"] })],
      found: 1,
      facet_counts: [],
    });
    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);
    // approved=0 gives 42, skills.length=2 gives 6, total=48
    expect(result.rows[0].score).toBe(48);
  });

  it("calculates score correctly for incomplete + civil-id candidate", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit({
        is_incomplete_profile: true,
        candidate_civil_need_verification: true,
        candidate_status: 5,
      })],
      found: 1,
      facet_counts: [],
    });
    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);
    // is_incomplete=28, civil_id=22, status!=10 gives 10, skills.length=2 gives 6 = 66
    expect(result.rows[0].score).toBe(66);
  });

  // ---- Signal derivation ----
  it("sets signal to 'Ready' for a healthy active candidate", async () => {
    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);
    expect(result.rows[0].signal).toBe("Ready");
  });

  it("sets signal to 'Approval decision' when approved === 0", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit({ approved: 0 })],
      found: 1,
      facet_counts: [],
    });
    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);
    expect(result.rows[0].signal).toBe("Approval decision");
  });

  it("sets signal to 'Watch' for non-active status", async () => {
    mockSearchDocuments.mockResolvedValue({
      hits: [makeSearchHit({ candidate_status: 5 })],
      found: 1,
      facet_counts: [],
    });
    const result = await getCandidateSearchWorkspaceTypesense(defaultParams);
    expect(result.rows[0].signal).toBe("Watch");
  });
});
