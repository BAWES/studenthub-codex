import { describe, it, expect } from "vitest";
import {
  candidateLinkItemSchema,
  listCandidateLinksResultSchema,
  type CandidateLinkItem,
  type ListCandidateLinksResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas imported from actions.ts for contract testing
// ---------------------------------------------------------------------------

import {
  listCandidateLinksSchema,
  getCandidateLinkSchema,
} from "./schemas";

describe("listCandidateLinksSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listCandidateLinksSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.candidateId).toBeUndefined();
    }
  });

  it("accepts explicit page and limit", () => {
    const result = listCandidateLinksSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts candidateId filter", () => {
    const result = listCandidateLinksSchema.safeParse({ candidateId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("rejects page less than 1", () => {
    const result = listCandidateLinksSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCandidateLinksSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = listCandidateLinksSchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    const result = listCandidateLinksSchema.safeParse({ limit: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listCandidateLinksSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listCandidateLinksSchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });
});

describe("getCandidateLinkSchema", () => {
  it("accepts valid UUID string", () => {
    const result = getCandidateLinkSchema.safeParse({
      uuid: "abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("abc-123-def-456");
    }
  });

  it("rejects empty UUID string", () => {
    const result = getCandidateLinkSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getCandidateLinkSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("candidateLinkItemSchema", () => {
  it("parses a valid link item", () => {
    const result = candidateLinkItemSchema.safeParse({
      cl_uuid: "abc-123",
      candidate_id: 1,
      title: "LinkedIn",
      url: "https://linkedin.com/in/test",
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cl_uuid).toBe("abc-123");
    }
  });

  it("accepts Date timestamps", () => {
    const result = candidateLinkItemSchema.safeParse({
      cl_uuid: "abc",
      candidate_id: 42,
      title: "Portfolio",
      url: "https://example.com",
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-15"),
    });
    expect(result.success).toBe(true);
  });

  it("allows nullable timestamps", () => {
    const result = candidateLinkItemSchema.safeParse({
      cl_uuid: "abc",
      candidate_id: 1,
      title: "GitHub",
      url: "https://github.com/test",
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = candidateLinkItemSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("listCandidateLinksResultSchema", () => {
  it("parses a valid result with links", () => {
    const result = listCandidateLinksResultSchema.safeParse({
      links: [
        {
          cl_uuid: "abc-123",
          candidate_id: 1,
          title: "LinkedIn",
          url: "https://linkedin.com/in/test",
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.links).toHaveLength(1);
      expect(result.data.total).toBe(1);
    }
  });

  it("handles empty link list", () => {
    const result = listCandidateLinksResultSchema.safeParse({
      links: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing total", () => {
    const result = listCandidateLinksResultSchema.safeParse({
      links: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});
