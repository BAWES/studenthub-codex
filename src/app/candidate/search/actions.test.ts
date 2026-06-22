import { describe, it, expect } from "vitest";
import {
  searchCandidatesSchema,
  candidateSearchRowSchema,
  candidateSearchResultSchema,
  searchParamStateSchema,
  searchMetricRowSchema,
  facetOptionSchema,
  candidateSearchFacetSchema,
  openTabSchema,
  sourceInfoSchema,
} from "./schemas";

describe("searchCandidatesSchema", () => {
  it("accepts empty params", () => {
    const r = searchCandidatesSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("accepts query and page", () => {
    const r = searchCandidatesSchema.safeParse({ query: "Engineer", page: 1 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.query).toBe("Engineer");
      expect(r.data.page).toBe(1);
    }
  });

  it("accepts all optional filters", () => {
    const r = searchCandidatesSchema.safeParse({
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
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid filter value", () => {
    expect(searchCandidatesSchema.safeParse({ filter: "invalid" }).success).toBe(false);
  });

  it("rejects invalid role value", () => {
    expect(searchCandidatesSchema.safeParse({ role: "CEO" }).success).toBe(false);
  });

  it("rejects invalid profile value", () => {
    expect(searchCandidatesSchema.safeParse({ profile: "partial" }).success).toBe(false);
  });

  it("accepts tabIds and selectedIds arrays", () => {
    const r = searchCandidatesSchema.safeParse({
      tabIds: [1, 2, 3],
      selectedIds: [10, 20],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tabIds).toEqual([1, 2, 3]);
    }
  });

  it("rejects negative candidateId", () => {
    expect(searchCandidatesSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });
});

describe("candidateSearchRowSchema", () => {
  it("accepts valid search row", () => {
    const r = candidateSearchRowSchema.safeParse({
      id: 1,
      uid: "STU-001",
      name: "Ahmed Al-Kuwaiti",
      email: "ahmed@test.com",
      phone: "+965****",
      status: "active",
      signal: "green",
      country: "Kuwait",
      university: "KU",
      company: "GCC",
      store: "HQ",
      rate: "5.0",
      updated: "2026-06-01",
      flags: ["urgent"],
      skills: ["React", "Node"],
      score: 85,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required id", () => {
    expect(candidateSearchRowSchema.safeParse({ name: "Test" }).success).toBe(false);
  });
});

describe("searchParamStateSchema", () => {
  it("accepts all param fields", () => {
    const r = searchParamStateSchema.safeParse({
      country: "Kuwait",
      university: "KU",
      company: "GCC",
      skill: "React",
      gender: "male",
      profile: "complete",
      assignment: "assigned",
      document: "resume",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(searchParamStateSchema.safeParse({ country: "Kuwait" }).success).toBe(false);
  });
});

describe("searchMetricRowSchema", () => {
  it("accepts valid metric", () => {
    expect(
      searchMetricRowSchema.safeParse({ label: "Total", value: 100, note: "active" }).success,
    ).toBe(true);
  });

  it("rejects non-integer value", () => {
    expect(
      searchMetricRowSchema.safeParse({ label: "Total", value: 10.5, note: "" }).success,
    ).toBe(false);
  });
});

describe("facetOptionSchema", () => {
  it("accepts valid facet option", () => {
    const r = facetOptionSchema.safeParse({
      label: "Kuwait",
      value: "Kuwait",
      count: 42,
      active: false,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.count).toBe(42);
      expect(r.data.active).toBe(false);
    }
  });

  it("rejects missing count", () => {
    expect(
      facetOptionSchema.safeParse({ label: "Test", value: "test", active: true }).success,
    ).toBe(false);
  });
});

describe("candidateSearchFacetSchema", () => {
  it("accepts valid facet", () => {
    const r = candidateSearchFacetSchema.safeParse({
      key: "country",
      label: "Country",
      options: [
        { label: "Kuwait", value: "Kuwait", count: 10, active: false },
      ],
    });
    expect(r.success).toBe(true);
  });
});

describe("openTabSchema", () => {
  it("accepts valid open tab", () => {
    expect(
      openTabSchema.safeParse({ id: 1, title: "Ahmed", subtitle: "Engineer", status: "active" })
        .success,
    ).toBe(true);
  });
});

describe("sourceInfoSchema", () => {
  it("accepts valid source info", () => {
    expect(
      sourceInfoSchema.safeParse({ current: "typesense", target: "typesense", note: "ok" }).success,
    ).toBe(true);
  });
});

describe("candidateSearchResultSchema", () => {
  const baseResult = {
    role: "staff",
    query: "",
    filter: "all",
    visibility: "all",
    page: 1,
    totalPages: 1,
    assignedCount: 0,
    matchingCount: 0,
    selectedId: undefined,
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
    rows: [
      {
        id: 1,
        uid: "STU-001",
        name: "Test",
        email: "test@test.com",
        phone: "",
        status: "active",
        signal: "green",
        country: "",
        university: "",
        company: "",
        store: "",
        rate: "",
        updated: "",
        flags: [],
        skills: [],
        score: 0,
      },
    ],
    metrics: [{ label: "Total", value: 1, note: "" }],
    facets: [],
    source: { current: "typesense", target: "typesense", note: "" },
    selected: null,
    selectedActions: {},
  };

  it("accepts valid search result", () => {
    const r = candidateSearchResultSchema.safeParse(baseResult);
    expect(r.success).toBe(true);
  });

  it("accepts page 0 (Typesense return), page is int", () => {
    expect(
      candidateSearchResultSchema.safeParse({ ...baseResult, page: 0 }).success,
    ).toBe(true);
  });
});
