import { describe, it, expect } from "vitest";
import { candidateInitials, toggleCandidateId, candidateSearchHref } from "./CandidateSearchOS";
import type { CandidateSearchParams } from "./search";

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

describe("candidateSearchHref", () => {
  const basePath = "/admin/candidates" as const;

  it("returns base path when no params or overrides", () => {
    const result = candidateSearchHref(basePath, emptyParams() as any, {});
    expect(result).toBe("/admin/candidates");
  });

  it("includes query param", () => {
    const result = candidateSearchHref(basePath, emptyParams() as any, { q: "john" });
    expect(result).toBe("/admin/candidates?q=john");
  });

  it("includes filter override", () => {
    const result = candidateSearchHref(basePath, emptyParams() as any, { filter: "active" });
    expect(result).toBe("/admin/candidates?filter=active");
  });

  it("adds candidate to tabs when opening a candidate", () => {
    const result = candidateSearchHref(basePath, emptyParams() as any, { candidate: "42" });
    expect(result).toContain("candidate=42");
    expect(result).toContain("tabs=42");
  });

  it("preserves existing tabs when opening a candidate", () => {
    const result = candidateSearchHref(basePath, paramsWith({ tabIds: [1, 2] }) as any, { candidate: "3" });
    expect(result).toContain("tabs=1%2C2%2C3");
    expect(result).toContain("candidate=3");
  });

  it("encodes multiple parameters", () => {
    const result = candidateSearchHref(basePath, emptyParams() as any, { q: "john", filter: "active", country: "kw" });
    expect(result).toContain("q=john");
    expect(result).toContain("filter=active");
    expect(result).toContain("country=kw");
  });
});

// Helper types and function
interface SearchParams {
  role?: string;
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
    role: "admin" as const,
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
