import { describe, it, expect } from "vitest";
import {
  listCandidateLinksSchema,
  getCandidateLinkSchema,
  candidateLinkItemSchema,
  listCandidateLinksResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

describe("listCandidateLinksSchema", () => {
  it("accepts empty input (defaults)", () => {
    const r = listCandidateLinksSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts candidateId filter", () => {
    const r = listCandidateLinksSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(1);
  });

  it("coerces string candidateId", () => {
    const r = listCandidateLinksSchema.safeParse({ candidateId: "3" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.candidateId).toBe(3);
  });

  it("rejects limit over 100", () => {
    expect(listCandidateLinksSchema.safeParse({ limit: 999 }).success).toBe(false);
  });
});

describe("getCandidateLinkSchema", () => {
  it("accepts valid UUID", () => {
    expect(getCandidateLinkSchema.safeParse({ uuid: "link_abc" }).success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getCandidateLinkSchema.safeParse({ uuid: "" }).success).toBe(false);
  });

  it("rejects missing uuid", () => {
    expect(getCandidateLinkSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("candidateLinkItemSchema", () => {
  const valid = {
    cl_uuid: "link_abc",
    candidate_id: 1,
    title: "Portfolio",
    url: "https://example.com",
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-06-20"),
  };

  it("accepts a valid link item", () => {
    expect(candidateLinkItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable dates", () => {
    expect(
      candidateLinkItemSchema.safeParse({ ...valid, created_at: null, updated_at: null }).success,
    ).toBe(true);
  });

  it("rejects missing cl_uuid", () => {
    const { cl_uuid: _, ...rest } = valid;
    expect(candidateLinkItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = valid;
    expect(candidateLinkItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing url", () => {
    const { url: _, ...rest } = valid;
    expect(candidateLinkItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("listCandidateLinksResultSchema", () => {
  it("accepts valid result with empty list", () => {
    expect(
      listCandidateLinksResultSchema.safeParse({
        links: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing links", () => {
    expect(
      listCandidateLinksResultSchema.safeParse({ total: 0, page: 1, limit: 20, totalPages: 0 })
        .success,
    ).toBe(false);
  });
});
