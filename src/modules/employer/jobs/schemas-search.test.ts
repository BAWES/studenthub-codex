import { describe, it, expect } from "vitest";
import {
  searchJobsSchema,
  searchJobsRowSchema,
  sourceInfoSchema,
  searchJobsResultSchema,
} from "./schemas-search";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validRow = () => ({
  jobListingId: 42,
  title: "Software Engineer",
  description: "Build things",
  requirements: "3+ years",
  location: "Kuwait City",
  employmentType: "full-time",
  salaryRange: "800-1200 KWD",
  status: "active",
  companyName: "Acme Corp",
  createdAt: "2026-01-15T10:00:00Z",
});

const minimalRow = () => ({
  jobListingId: 1,
  title: "Dev",
  description: "Do stuff",
  requirements: null,
  location: null,
  employmentType: null,
  salaryRange: null,
  status: null,
  companyName: "Acme Corp",
  createdAt: "2026-01-15T10:00:00Z",
});

// ---------------------------------------------------------------------------
// searchJobsSchema
// ---------------------------------------------------------------------------

describe("searchJobsSchema", () => {
  it("accepts full input with all fields", () => {
    const r = searchJobsSchema.safeParse({ q: "engineer", page: "2", limit: "10", status: "active" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.q).toBe("engineer");
      expect(r.data.status).toBe("active");
    }
  });

  it("applies defaults for missing optional fields", () => {
    const r = searchJobsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
      expect(r.data.q).toBeUndefined();
      expect(r.data.status).toBeUndefined();
    }
  });

  it("coerces string page and limit to numbers", () => {
    const r = searchJobsSchema.safeParse({ page: "3", limit: "50" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects negative page", () => {
    const r = searchJobsSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = searchJobsSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects limit above 100", () => {
    const r = searchJobsSchema.safeParse({ limit: 101 });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = searchJobsSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const r = searchJobsSchema.safeParse({ page: "abc" });
    expect(r.success).toBe(false);
  });

  it("accepts empty string q", () => {
    const r = searchJobsSchema.safeParse({ q: "" });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// searchJobsRowSchema
// ---------------------------------------------------------------------------

describe("searchJobsRowSchema", () => {
  it("accepts a full row", () => {
    const r = searchJobsRowSchema.safeParse(validRow());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal row (nullable fields set to null)", () => {
    const r = searchJobsRowSchema.safeParse(minimalRow());
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = searchJobsRowSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = searchJobsRowSchema.safeParse({ ...validRow(), jobListingId: "not-a-number" });
    expect(r.success).toBe(false);
  });

  it("rejects missing title", () => {
    const r = searchJobsRowSchema.safeParse({ ...validRow(), title: undefined });
    expect(r.success).toBe(false);
  });

  it("rejects missing description", () => {
    const r = searchJobsRowSchema.safeParse({ ...validRow(), description: undefined });
    expect(r.success).toBe(false);
  });

  it("rejects missing companyName", () => {
    const r = searchJobsRowSchema.safeParse({ ...validRow(), companyName: undefined });
    expect(r.success).toBe(false);
  });

  it("accepts optional score field", () => {
    const r = searchJobsRowSchema.safeParse({ ...validRow(), score: 0.95 });
    expect(r.success).toBe(true);
  });

  it("accepts row without score", () => {
    const r = searchJobsRowSchema.safeParse(validRow());
    expect(r.success).toBe(true);
  });

  it("rejects non-numeric score", () => {
    const r = searchJobsRowSchema.safeParse({ ...validRow(), score: "high" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// sourceInfoSchema
// ---------------------------------------------------------------------------

describe("sourceInfoSchema", () => {
  it("accepts valid source info", () => {
    const r = sourceInfoSchema.safeParse({ current: "Typesense", target: "Typesense" });
    expect(r.success).toBe(true);
  });

  it("rejects missing current", () => {
    const r = sourceInfoSchema.safeParse({ target: "MySQL" });
    expect(r.success).toBe(false);
  });

  it("rejects missing target", () => {
    const r = sourceInfoSchema.safeParse({ current: "Typesense" });
    expect(r.success).toBe(false);
  });

  it("accepts empty current (z.string() allows empty by default)", () => {
    const r = sourceInfoSchema.safeParse({ current: "", target: "MySQL" });
    expect(r.success).toBe(true);
  });

  it("rejects non-string values", () => {
    const r = sourceInfoSchema.safeParse({ current: 123, target: "MySQL" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// searchJobsResultSchema
// ---------------------------------------------------------------------------

describe("searchJobsResultSchema", () => {
  it("accepts a full search result", () => {
    const r = searchJobsResultSchema.safeParse({
      query: "engineer",
      page: 1,
      matchingCount: 42,
      rows: [validRow(), minimalRow()],
      source: { current: "Typesense", target: "Typesense" },
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty rows array", () => {
    const r = searchJobsResultSchema.safeParse({
      query: "",
      page: 1,
      matchingCount: 0,
      rows: [],
      source: { current: "MySQL", target: "Typesense" },
    });
    expect(r.success).toBe(true);
  });

  it("allows negative matchingCount (output schema — no min constraint)", () => {
    const r = searchJobsResultSchema.safeParse({
      query: "test",
      page: 1,
      matchingCount: -1,
      rows: [],
      source: { current: "MySQL", target: "Typesense" },
    });
    expect(r.success).toBe(true);
  });

  it("allows zero page (output schema — no positive constraint)", () => {
    const r = searchJobsResultSchema.safeParse({
      query: "test",
      page: 0,
      matchingCount: 0,
      rows: [],
      source: { current: "MySQL", target: "Typesense" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-array rows", () => {
    const r = searchJobsResultSchema.safeParse({
      query: "test",
      page: 1,
      matchingCount: 0,
      rows: "not-an-array",
      source: { current: "MySQL", target: "Typesense" },
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing source", () => {
    const r = searchJobsResultSchema.safeParse({
      query: "test",
      page: 1,
      matchingCount: 0,
      rows: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required query", () => {
    const r = searchJobsResultSchema.safeParse({
      page: 1,
      matchingCount: 0,
      rows: [],
      source: { current: "MySQL", target: "Typesense" },
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid rows data", () => {
    const r = searchJobsResultSchema.safeParse({
      query: "test",
      page: 1,
      matchingCount: 1,
      rows: [{ jobListingId: "bad", title: "test", description: "test", companyName: "test", createdAt: "now" }],
      source: { current: "MySQL", target: "Typesense" },
    });
    expect(r.success).toBe(false);
  });

  it("accepts rows with optional score field", () => {
    const r = searchJobsResultSchema.safeParse({
      query: "engineer",
      page: 1,
      matchingCount: 1,
      rows: [{ ...validRow(), score: 0.95 }],
      source: { current: "Typesense", target: "Typesense" },
    });
    expect(r.success).toBe(true);
  });
});
