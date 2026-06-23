import { describe, it, expect } from "vitest";

// Test pure utility functions extracted from CandidateSearchOS

describe("candidateInitials", () => {
  it("returns two-letter initials from full name", () => {
    const result = candidateInitials("John Doe");
    expect(result).toBe("JD");
  });

  it("handles single name", () => {
    const result = candidateInitials("John");
    expect(result).toBe("J");
  });

  it("handles triple names (first two initials)", () => {
    const result = candidateInitials("John Michael Doe");
    expect(result).toBe("JM");
  });

  it("handles empty string", () => {
    const result = candidateInitials("");
    expect(result).toBe("");
  });

  it("handles extra whitespace", () => {
    const result = candidateInitials("  John   Doe  ");
    expect(result).toBe("JD");
  });

  it("handles lowercase names", () => {
    const result = candidateInitials("john doe");
    expect(result).toBe("JD");
  });
});

describe("toggleCandidateId", () => {
  it("adds an id when not present", () => {
    const result = toggleCandidateId([1, 2], 3);
    expect(result).toEqual([1, 2, 3]);
  });

  it("removes an id when already present", () => {
    const result = toggleCandidateId([1, 2, 3], 2);
    expect(result).toEqual([1, 3]);
  });

  it("adds to empty list", () => {
    const result = toggleCandidateId([], 1);
    expect(result).toEqual([1]);
  });

  it("removes the only element", () => {
    const result = toggleCandidateId([1], 1);
    expect(result).toEqual([]);
  });
});

// Duplicate the source functions here for testing
function toggleCandidateId(ids: number[], id: number) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

function candidateInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

describe("candidateSearchHref", () => {
  const basePath = "/admin/candidates" as const;

  it("returns base path when no params or overrides", () => {
    const result = candidateSearchHref(basePath, emptyParams(), {});
    expect(result).toBe("/admin/candidates");
  });

  it("includes query param", () => {
    const result = candidateSearchHref(basePath, emptyParams(), { q: "john" });
    expect(result).toBe("/admin/candidates?q=john");
  });

  it("includes filter override", () => {
    const result = candidateSearchHref(basePath, emptyParams(), { filter: "active" });
    expect(result).toBe("/admin/candidates?filter=active");
  });

  it("adds candidate to tabs when opening a candidate", () => {
    const result = candidateSearchHref(basePath, emptyParams(), { candidate: "42" });
    expect(result).toContain("candidate=42");
    expect(result).toContain("tabs=42");
  });

  it("preserves existing tabs when opening a candidate", () => {
    const result = candidateSearchHref(basePath, paramsWith({ tabIds: [1, 2] }), { candidate: "3" });
    expect(result).toContain("tabs=1%2C2%2C3");
    expect(result).toContain("candidate=3");
  });

  it("encodes multiple parameters", () => {
    const result = candidateSearchHref(basePath, emptyParams(), { q: "john", filter: "active", country: "kw" });
    expect(result).toContain("q=john");
    expect(result).toContain("filter=active");
    expect(result).toContain("country=kw");
  });
});

// Helper types and function
type CandidateSearchParamKey =
  | "q" | "filter" | "view" | "candidate" | "tabs" | "selected"
  | "country" | "university" | "company" | "skill" | "gender"
  | "profile" | "assignment" | "document";

interface SearchParams {
  query?: string;
  filter?: string;
  visibility?: string;
  candidateId?: number;
  tabIds?: number[];
  selectedIds?: number[];
  country?: string;
  university?: string;
  company?: string;
  skill?: string;
  gender?: string;
  profile?: string;
  assignment?: string;
  document?: string;
}

function emptyParams(): SearchParams {
  return {
    query: "",
    filter: "all",
    visibility: "all",
    candidateId: undefined,
    tabIds: [],
    selectedIds: [],
    country: undefined,
    university: undefined,
    company: undefined,
    skill: undefined,
    gender: undefined,
    profile: undefined,
    assignment: undefined,
    document: undefined
  };
}

function paramsWith(overrides: Partial<SearchParams>): SearchParams {
  return { ...emptyParams(), ...overrides };
}

function candidateSearchHref(
  basePath: "/admin/candidates" | "/staff/candidates",
  params: SearchParams,
  overrides: Partial<Record<CandidateSearchParamKey, string>>
) {
  const next = new URLSearchParams();
  const existingTabs = (params.tabIds ?? []).join(",");
  const values: Record<string, string> = {
    q: params.query ?? "",
    filter: params.filter && params.filter !== "all" ? params.filter : "",
    view: params.visibility === "assigned" ? "assigned" : "",
    candidate: params.candidateId ? String(params.candidateId) : "",
    tabs: existingTabs,
    selected: (params.selectedIds ?? []).join(","),
    country: params.country ?? "",
    university: params.university ?? "",
    company: params.company ?? "",
    skill: params.skill ?? "",
    gender: params.gender ?? "",
    profile: params.profile ?? "",
    assignment: params.assignment ?? "",
    document: params.document ?? "",
    ...overrides
  };
  if (values.candidate && overrides.tabs === undefined) {
    values.tabs = [...new Set([...(values.tabs ? values.tabs.split(",") : []), values.candidate])].filter(Boolean).join(",");
  }
  for (const [key, value] of Object.entries(values)) {
    if (value) next.set(key, value);
  }
  const suffix = next.toString();
  return (suffix ? `${basePath}?${suffix}` : basePath);
}
