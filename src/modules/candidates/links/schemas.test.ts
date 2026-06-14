import { describe, it, expect } from "vitest";
import {
  candidateLinkItemSchema,
  listCandidateLinksResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// candidateLinkItemSchema
// ---------------------------------------------------------------------------

describe("candidateLinkItemSchema", () => {
  const validItem = () => ({
    cl_uuid: "link-001",
    candidate_id: 123,
    title: "Portfolio",
    url: "https://example.com/portfolio",
    created_at: new Date("2026-06-01"),
    updated_at: new Date("2026-06-10"),
  });

  it("accepts a valid link item", () => {
    const r = candidateLinkItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable date fields", () => {
    const r = candidateLinkItemSchema.safeParse({
      ...validItem(),
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing cl_uuid", () => {
    const { cl_uuid: _, ...rest } = validItem();
    expect(candidateLinkItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string url", () => {
    expect(
      candidateLinkItemSchema.safeParse({ ...validItem(), url: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateLinksResultSchema
// ---------------------------------------------------------------------------

describe("listCandidateLinksResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: [{
        cl_uuid: "l-1",
        candidate_id: 1,
        title: "Link",
        url: "http://example.com",
        created_at: null,
        updated_at: null,
      }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty links array", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: [], total: 0, page: 1, limit: 20, totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: [], page: 1, limit: 20, totalPages: 0,
    });
    expect(r.success).toBe(false);
  });
});
