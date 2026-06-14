import { describe, it, expect } from "vitest";
import {
  searchCandidatesSchema,
  candidateSearchRowSchema,
  searchParamStateSchema,
  searchMetricRowSchema,
  facetOptionSchema,
  candidateSearchFacetSchema,
  openTabSchema,
  sourceInfoSchema,
  candidateSearchResultSchema,
} from "./schemas";

describe("searchCandidatesSchema", () => {
  it("accepts empty input (all fields optional)", () => {
    expect(searchCandidatesSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    expect(
      searchCandidatesSchema.safeParse({
        query: "developer",
        filter: "active",
        role: "candidate",
        staffId: 1,
        page: 1,
        country: "Kuwait",
        university: "KU",
        company: "Acme",
        skill: "React",
        gender: "male",
        profile: "complete",
        assignment: "assigned",
        document: "resume",
        visibility: "all",
        candidateId: 42,
        tabIds: [1, 2, 3],
        selectedIds: [10, 20],
      }).success
    ).toBe(true);
  });

  it("rejects invalid filter enum", () => {
    expect(
      searchCandidatesSchema.safeParse({ filter: "invalid" }).success
    ).toBe(false);
  });

  it("rejects invalid role enum", () => {
    expect(
      searchCandidatesSchema.safeParse({ role: "superadmin" }).success
    ).toBe(false);
  });

  it("rejects non-positive staffId", () => {
    expect(
      searchCandidatesSchema.safeParse({ staffId: 0 }).success
    ).toBe(false);
  });

  it("rejects non-positive page", () => {
    expect(
      searchCandidatesSchema.safeParse({ page: -1 }).success
    ).toBe(false);
  });

  it("rejects invalid profile enum", () => {
    expect(
      searchCandidatesSchema.safeParse({ profile: "partial" }).success
    ).toBe(false);
  });

  it("rejects invalid assignment enum", () => {
    expect(
      searchCandidatesSchema.safeParse({ assignment: "partial" }).success
    ).toBe(false);
  });

  it("rejects invalid document enum", () => {
    expect(
      searchCandidatesSchema.safeParse({ document: "pdf" }).success
    ).toBe(false);
  });

  it("rejects invalid visibility enum", () => {
    expect(
      searchCandidatesSchema.safeParse({ visibility: "public" }).success
    ).toBe(false);
  });

  it("rejects non-positive candidateId", () => {
    expect(
      searchCandidatesSchema.safeParse({ candidateId: -5 }).success
    ).toBe(false);
  });

  it("rejects tabIds with non-positive values", () => {
    expect(
      searchCandidatesSchema.safeParse({ tabIds: [1, -1, 3] }).success
    ).toBe(false);
  });
});

describe("candidateSearchRowSchema", () => {
  const validRow = {
    id: 1,
    uid: "uid-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+965 1234",
    status: "active",
    signal: "green",
    country: "Kuwait",
    university: "KU",
    company: "Acme",
    store: "Main",
    rate: "5",
    updated: "2025-01-01",
    flags: ["flag1"],
    skills: ["React", "Node"],
    score: 85.5,
  };

  it("accepts valid row", () => {
    expect(candidateSearchRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id, ...rest } = validRow;
    expect(candidateSearchRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array flags", () => {
    expect(
      candidateSearchRowSchema.safeParse({ ...validRow, flags: "not-array" }).success
    ).toBe(false);
  });

  it("rejects non-array skills", () => {
    expect(
      candidateSearchRowSchema.safeParse({ ...validRow, skills: "not-array" }).success
    ).toBe(false);
  });

  it("rejects non-integer id", () => {
    expect(
      candidateSearchRowSchema.safeParse({ ...validRow, id: 1.5 }).success
    ).toBe(false);
  });
});

describe("searchParamStateSchema", () => {
  it("accepts valid params", () => {
    expect(
      searchParamStateSchema.safeParse({
        country: "Kuwait",
        university: "KU",
        company: "Acme",
        skill: "React",
        gender: "male",
        profile: "complete",
        assignment: "assigned",
        document: "resume",
      }).success
    ).toBe(true);
  });

  it("rejects missing field", () => {
    expect(
      searchParamStateSchema.safeParse({
        country: "Kuwait",
        university: "KU",
        company: "Acme",
        skill: "React",
        gender: "male",
        profile: "complete",
        assignment: "assigned",
        // document missing
      }).success
    ).toBe(false);
  });

  it("rejects non-string field", () => {
    expect(
      searchParamStateSchema.safeParse({
        country: "Kuwait",
        university: "KU",
        company: "Acme",
        skill: "React",
        gender: "male",
        profile: "complete",
        assignment: "assigned",
        document: 123,
      }).success
    ).toBe(false);
  });
});

describe("searchMetricRowSchema", () => {
  it("accepts valid metric", () => {
    expect(
      searchMetricRowSchema.safeParse({
        label: "Total",
        value: 100,
        note: "All candidates",
      }).success
    ).toBe(true);
  });

  it("rejects non-integer value", () => {
    expect(
      searchMetricRowSchema.safeParse({
        label: "Total",
        value: 100.5,
        note: "test",
      }).success
    ).toBe(false);
  });

  it("rejects missing label", () => {
    expect(
      searchMetricRowSchema.safeParse({ value: 100, note: "test" }).success
    ).toBe(false);
  });
});

describe("facetOptionSchema", () => {
  it("accepts valid facet option", () => {
    expect(
      facetOptionSchema.safeParse({
        label: "Active",
        value: "active",
        count: 42,
        active: true,
      }).success
    ).toBe(true);
  });

  it("rejects non-integer count", () => {
    expect(
      facetOptionSchema.safeParse({
        label: "Active",
        value: "active",
        count: 42.5,
        active: true,
      }).success
    ).toBe(false);
  });

  it("rejects non-boolean active", () => {
    expect(
      facetOptionSchema.safeParse({
        label: "Active",
        value: "active",
        count: 42,
        active: "yes",
      }).success
    ).toBe(false);
  });

  it("rejects missing label", () => {
    expect(
      facetOptionSchema.safeParse({ value: "active", count: 42, active: true }).success
    ).toBe(false);
  });
});

describe("candidateSearchFacetSchema", () => {
  it("accepts valid facet", () => {
    expect(
      candidateSearchFacetSchema.safeParse({
        key: "status",
        label: "Status",
        options: [
          { label: "Active", value: "active", count: 10, active: true },
        ],
      }).success
    ).toBe(true);
  });

  it("rejects non-array options", () => {
    expect(
      candidateSearchFacetSchema.safeParse({
        key: "status",
        label: "Status",
        options: "not-array",
      }).success
    ).toBe(false);
  });

  it("rejects missing key", () => {
    expect(
      candidateSearchFacetSchema.safeParse({
        label: "Status",
        options: [],
      }).success
    ).toBe(false);
  });
});

describe("openTabSchema", () => {
  it("accepts valid open tab", () => {
    expect(
      openTabSchema.safeParse({
        id: 1,
        title: "Tab Title",
        subtitle: "Subtitle",
        status: "open",
      }).success
    ).toBe(true);
  });

  it("rejects non-integer id", () => {
    expect(
      openTabSchema.safeParse({
        id: 1.5,
        title: "Tab Title",
        subtitle: "Subtitle",
        status: "open",
      }).success
    ).toBe(false);
  });

  it("rejects missing title", () => {
    expect(
      openTabSchema.safeParse({ id: 1, subtitle: "Sub", status: "open" }).success
    ).toBe(false);
  });
});

describe("sourceInfoSchema", () => {
  it("accepts valid source info", () => {
    expect(
      sourceInfoSchema.safeParse({
        current: "search",
        target: "results",
        note: "regular search",
      }).success
    ).toBe(true);
  });

  it("rejects missing current", () => {
    expect(
      sourceInfoSchema.safeParse({ target: "results", note: "test" }).success
    ).toBe(false);
  });
});

describe("candidateSearchResultSchema", () => {
  const validResult = {
    role: "admin",
    query: "developer",
    filter: "all",
    visibility: "all",
    page: 1,
    totalPages: 5,
    assignedCount: null,
    matchingCount: 42,
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
    metrics: [],
    facets: [],
    source: { current: "search", target: "results", note: "" },
    selected: null,
    selectedActions: {},
  };

  it("accepts valid result", () => {
    expect(candidateSearchResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts result with selectedId", () => {
    expect(
      candidateSearchResultSchema.safeParse({ ...validResult, selectedId: 42 }).success
    ).toBe(true);
  });

  it("rejects missing role", () => {
    const { role, ...rest } = validResult;
    expect(candidateSearchResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer page", () => {
    expect(
      candidateSearchResultSchema.safeParse({ ...validResult, page: 1.5 }).success
    ).toBe(false);
  });

  it("rejects invalid assignedCount", () => {
    expect(
      candidateSearchResultSchema.safeParse({ ...validResult, assignedCount: 1.5 }).success
    ).toBe(false);
  });

  it("rejects non-boolean selectedBlocked", () => {
    expect(
      candidateSearchResultSchema.safeParse({ ...validResult, selectedBlocked: "yes" }).success
    ).toBe(false);
  });
});
