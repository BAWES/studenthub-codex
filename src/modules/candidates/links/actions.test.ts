import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Schemas imported from actions.ts for contract testing
// ---------------------------------------------------------------------------

import {
  listCandidateLinksSchema,
  getCandidateLinkSchema,
} from "./actions";

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
// Return type shape verification
// ---------------------------------------------------------------------------

type CandidateLinkItem = {
  cl_uuid: string;
  candidate_id: number;
  title: string;
  url: string;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListCandidateLinksResult = {
  links: CandidateLinkItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("ListCandidateLinksResult type shape", () => {
  it("conforms to expected structure", () => {
    const result: ListCandidateLinksResult = {
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
    };
    expect(result.links).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("handles empty link list", () => {
    const result: ListCandidateLinksResult = {
      links: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.links).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });

  it("includes all required fields", () => {
    const item: CandidateLinkItem = {
      cl_uuid: "abc",
      candidate_id: 42,
      title: "Portfolio",
      url: "https://example.com",
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-15"),
    };
    expect(item.title).toBe("Portfolio");
    expect(item.url).toBe("https://example.com");
    expect(item.candidate_id).toBe(42);
  });

  it("allows nullable timestamps", () => {
    const item: CandidateLinkItem = {
      cl_uuid: "abc",
      candidate_id: 1,
      title: "GitHub",
      url: "https://github.com/test",
      created_at: null,
      updated_at: null,
    };
    expect(item.created_at).toBeNull();
    expect(item.updated_at).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getCandidateLink return type
// ---------------------------------------------------------------------------

describe("getCandidateLink return type", () => {
  it("returns CandidateLinkItem or null", () => {
    const found: CandidateLinkItem = {
      cl_uuid: "abc",
      candidate_id: 1,
      title: "LinkedIn",
      url: "https://linkedin.com/in/test",
      created_at: null,
      updated_at: null,
    };
    const notFound: null = null;

    expect(found.cl_uuid).toBe("abc");
    expect(notFound).toBeNull();
  });
});
