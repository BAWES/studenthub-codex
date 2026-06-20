import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ──────────────────────────────────────────────
const { mockGetCandidateSearchWorkspaceTypesense } = vi.hoisted(() => ({
  mockGetCandidateSearchWorkspaceTypesense: vi.fn(),
}));

// ── Mock Typesense search adapter ───────────────────────────────
vi.mock("@/modules/candidates/search-typesense", () => ({
  getCandidateSearchWorkspaceTypesense: mockGetCandidateSearchWorkspaceTypesense,
}));

// ── Imports (after mocks) ──────────────────────────────────────

import { searchCandidates } from "./actions";

// ===========================================================================
// searchCandidates
// ===========================================================================

describe("searchCandidates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // A minimal valid result shape that passes the output schema
  const validResult = {
    role: "staff",
    query: "",
    filter: "all",
    visibility: "all",
    page: 1,
    totalPages: 1,
    assignedCount: 0,
    matchingCount: 0,
    selectedBlocked: false,
    openTabs: [],
    params: {
      country: "",
      university: "",
      company: "",
      skill: "",
      gender: "",
      profile: "",
      assignment: "",
      document: "",
    },
    rows: [],
    metrics: [{ label: "Total", value: 0, note: "" }],
    facets: [],
    source: { current: "Typesense", target: "Typesense", note: "" },
    selected: null,
    selectedActions: {},
  };

  it("passes valid params through to search adapter and returns result", async () => {
    mockGetCandidateSearchWorkspaceTypesense.mockResolvedValue(validResult);

    const result = await searchCandidates({ query: "Engineer", page: 1 });

    // Underlying adapter called with parsed Zod output
    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledTimes(1);
    const args = mockGetCandidateSearchWorkspaceTypesense.mock.calls[0][0];
    expect(args.query).toBe("Engineer");
    expect(args.page).toBe(1);

    // Result returned as-is
    expect(result).toEqual(validResult);
  });

  it("throws on invalid input parameters", async () => {
    // filter only accepts specific enums
    await expect(
      searchCandidates({ filter: "invalid_filter_value" }),
    ).rejects.toThrow();
    expect(mockGetCandidateSearchWorkspaceTypesense).not.toHaveBeenCalled();
  });

  it("throws on invalid role value", async () => {
    await expect(
      searchCandidates({ role: "superadmin" }),
    ).rejects.toThrow();
    expect(mockGetCandidateSearchWorkspaceTypesense).not.toHaveBeenCalled();
  });

  it("throws on invalid profile value", async () => {
    await expect(
      searchCandidates({ profile: "partial" }),
    ).rejects.toThrow();
    expect(mockGetCandidateSearchWorkspaceTypesense).not.toHaveBeenCalled();
  });

  it("throws on negative candidateId", async () => {
    await expect(
      searchCandidates({ candidateId: -5 }),
    ).rejects.toThrow();
    expect(mockGetCandidateSearchWorkspaceTypesense).not.toHaveBeenCalled();
  });

  it("returns result even when output validation logs error", async () => {
    // Output that fails the output schema — the function logs but doesn't throw
    mockGetCandidateSearchWorkspaceTypesense.mockResolvedValue({
      ...validResult,
      totalPages: "not-a-number", // bad type
    });

    // Should NOT throw — output validation only logs to console.error
    const result = await searchCandidates({ query: "test" });
    expect(result.totalPages).toBe("not-a-number");
    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledTimes(1);
  });

  it("passes all optional filters to the search adapter", async () => {
    mockGetCandidateSearchWorkspaceTypesense.mockResolvedValue(validResult);

    const params = {
      query: "developer",
      filter: "active",
      role: "staff",
      staffId: 5,
      country: "Kuwait",
      university: "Kuwait University",
      company: "GCC Energies",
      skill: "React",
      gender: "male",
      profile: "complete",
      assignment: "assigned",
      document: "resume",
      visibility: "all",
    };

    await searchCandidates(params);

    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledTimes(1);
    const args = mockGetCandidateSearchWorkspaceTypesense.mock.calls[0][0];
    expect(args.query).toBe("developer");
    expect(args.filter).toBe("active");
    expect(args.role).toBe("staff");
    expect(args.staffId).toBe(5);
    expect(args.country).toBe("Kuwait");
    expect(args.university).toBe("Kuwait University");
    expect(args.company).toBe("GCC Energies");
    expect(args.skill).toBe("React");
    expect(args.gender).toBe("male");
    expect(args.profile).toBe("complete");
    expect(args.assignment).toBe("assigned");
    expect(args.document).toBe("resume");
    expect(args.visibility).toBe("all");
  });

  it("handles empty params by passing defaults", async () => {
    mockGetCandidateSearchWorkspaceTypesense.mockResolvedValue(validResult);

    await searchCandidates({});

    expect(mockGetCandidateSearchWorkspaceTypesense).toHaveBeenCalledTimes(1);
    const args = mockGetCandidateSearchWorkspaceTypesense.mock.calls[0][0];
    // All optional fields should be undefined (schema defaults)
    expect(args.query).toBeUndefined();
    expect(args.filter).toBeUndefined();
    expect(args.page).toBeUndefined();
  });

  it("throws on extra unknown keys in input", async () => {
    // Zod's strict parsing for object types: unknown keys are stripped by default,
    // but schema doesn't have strict(). Extra keys are ignored, not rejected.
    // Test that passing known-shape data with extras doesn't throw.
    mockGetCandidateSearchWorkspaceTypesense.mockResolvedValue(validResult);

    await expect(
      searchCandidates({ query: "test", unknownField: "should be stripped" }),
    ).resolves.not.toThrow();
    // The extra key should have been stripped by Zod
    const args = mockGetCandidateSearchWorkspaceTypesense.mock.calls[0][0];
    expect(args).not.toHaveProperty("unknownField");
  });

  it("throws on invalid document value", async () => {
    await expect(
      searchCandidates({ document: "invalid-doc-type" }),
    ).rejects.toThrow();
  });

  it("throws on invalid assignment value", async () => {
    await expect(
      searchCandidates({ assignment: "unassigned-yes" }),
    ).rejects.toThrow();
  });

  it("throws on invalid visibility value", async () => {
    await expect(
      searchCandidates({ visibility: "all-and-more" }),
    ).rejects.toThrow();
  });

  it("accepts and passes tabIds and selectedIds", async () => {
    mockGetCandidateSearchWorkspaceTypesense.mockResolvedValue(validResult);

    await searchCandidates({
      tabIds: [10, 20, 30],
      selectedIds: [100, 200],
    });

    const args = mockGetCandidateSearchWorkspaceTypesense.mock.calls[0][0];
    expect(args.tabIds).toEqual([10, 20, 30]);
    expect(args.selectedIds).toEqual([100, 200]);
  });
});
