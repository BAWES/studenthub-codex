import { describe, it, expect } from "vitest";
import {
  listCandidatesSchema,
  getCandidateSchema,
  searchCandidatesSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listCandidatesSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listCandidatesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listCandidatesSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCandidatesSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCandidatesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("coerces string values to numbers", () => {
    const r = listCandidatesSchema.safeParse({ page: "2", limit: "15" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(15);
    }
  });
});

describe("getCandidateSchema", () => {
  it("accepts a valid positive candidate ID", () => {
    const r = getCandidateSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects zero ID", () => {
    expect(getCandidateSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects negative ID", () => {
    expect(getCandidateSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric ID", () => {
    expect(getCandidateSchema.safeParse({ candidateId: "abc" }).success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const r = getCandidateSchema.safeParse({ candidateId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(99);
    }
  });
});

describe("searchCandidatesSchema", () => {
  it("accepts a search query", () => {
    const r = searchCandidatesSchema.safeParse({ q: "Ahmed" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("Ahmed");
    }
  });

  it("accepts a search query with pagination", () => {
    const r = searchCandidatesSchema.safeParse({ q: "test", page: 1, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("test");
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(10);
    }
  });

  it("accepts an email search", () => {
    const r = searchCandidatesSchema.safeParse({ q: "test@example.com" });
    expect(r.success).toBe(true);
  });

  it("rejects empty query", () => {
    expect(searchCandidatesSchema.safeParse({ q: "" }).success).toBe(false);
  });

  it("rejects whitespace-only query", () => {
    expect(searchCandidatesSchema.safeParse({ q: "   " }).success).toBe(false);
  });

  it("rejects query over 100 chars", () => {
    expect(searchCandidatesSchema.safeParse({ q: "x".repeat(101) }).success).toBe(false);
  });

  it("rejects missing query", () => {
    expect(searchCandidatesSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(searchCandidatesSchema.safeParse({ q: "test", page: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(searchCandidatesSchema.safeParse({ q: "test", limit: 200 }).success).toBe(false);
  });
});
