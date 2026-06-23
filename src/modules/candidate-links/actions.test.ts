import { describe, it, expect } from "vitest";
import {
  listCandidateLinksSchema,
  getCandidateLinkSchema,
  createCandidateLinkSchema,
  updateCandidateLinkSchema,
  deleteCandidateLinkSchema,
  candidateLinkItemSchema,
  listCandidateLinksResultSchema,
  type CandidateLinkItem,
  type ListCandidateLinksResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCandidateLinks schema validation
// ---------------------------------------------------------------------------

describe("listCandidateLinksSchema", () => {
  it("accepts candidate ID with default pagination", () => {
    const result = listCandidateLinksSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts custom pagination params", () => {
    const result = listCandidateLinksSchema.safeParse({ candidateId: 5, page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects negative candidate ID", () => {
    const result = listCandidateLinksSchema.safeParse({ candidateId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero candidate ID", () => {
    const result = listCandidateLinksSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listCandidateLinksSchema.safeParse({ candidateId: 1, limit: 999 });
    expect(result.success).toBe(false);
  });

  it("accepts string-coercible candidate ID", () => {
    const result = listCandidateLinksSchema.safeParse({ candidateId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });
});

// ---------------------------------------------------------------------------
// getCandidateLink schema validation
// ---------------------------------------------------------------------------

describe("getCandidateLinkSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getCandidateLinkSchema.safeParse({ clUuid: "abc-123-def" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.clUuid).toBe("abc-123-def");
    }
  });

  it("rejects empty UUID", () => {
    const result = getCandidateLinkSchema.safeParse({ clUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID field", () => {
    const result = getCandidateLinkSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCandidateLink schema validation
// ---------------------------------------------------------------------------

describe("createCandidateLinkSchema", () => {
  it("accepts valid link data", () => {
    const result = createCandidateLinkSchema.safeParse({
      candidateId: 1,
      title: "Portfolio",
      url: "https://example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Portfolio");
      expect(result.data.url).toBe("https://example.com");
    }
  });

  it("rejects empty title", () => {
    const result = createCandidateLinkSchema.safeParse({
      candidateId: 1,
      title: "",
      url: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty URL", () => {
    const result = createCandidateLinkSchema.safeParse({
      candidateId: 1,
      title: "Portfolio",
      url: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing candidate ID", () => {
    const result = createCandidateLinkSchema.safeParse({ title: "Portfolio", url: "https://example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects title exceeding 255 chars", () => {
    const result = createCandidateLinkSchema.safeParse({
      candidateId: 1,
      title: "x".repeat(256),
      url: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("accepts title at exactly 255 chars", () => {
    const result = createCandidateLinkSchema.safeParse({
      candidateId: 1,
      title: "x".repeat(255),
      url: "https://example.com",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// updateCandidateLink schema validation
// ---------------------------------------------------------------------------

describe("updateCandidateLinkSchema", () => {
  it("accepts valid update params", () => {
    const result = updateCandidateLinkSchema.safeParse({
      clUuid: "uuid-xyz",
      title: "Updated Link",
      url: "https://updated.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Updated Link");
      expect(result.data.url).toBe("https://updated.com");
    }
  });

  it("rejects missing clUuid", () => {
    const result = updateCandidateLinkSchema.safeParse({ title: "Test", url: "https://test.com" });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = updateCandidateLinkSchema.safeParse({ clUuid: "uuid", title: "", url: "https://test.com" });
    expect(result.success).toBe(false);
  });

  it("rejects empty URL", () => {
    const result = updateCandidateLinkSchema.safeParse({ clUuid: "uuid", title: "Test", url: "" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteCandidateLink schema validation
// ---------------------------------------------------------------------------

describe("deleteCandidateLinkSchema", () => {
  it("accepts a valid UUID", () => {
    const result = deleteCandidateLinkSchema.safeParse({ clUuid: "uuid-to-delete" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = deleteCandidateLinkSchema.safeParse({ clUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID field", () => {
    const result = deleteCandidateLinkSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: candidateLinkItemSchema
// ---------------------------------------------------------------------------

const validCandidateLinkItem: CandidateLinkItem = {
  cl_uuid: "abc-123-def",
  candidate_id: 1,
  title: "Portfolio",
  url: "https://example.com",
  created_at: null,
  updated_at: null,
};

describe("candidateLinkItemSchema", () => {
  it("accepts a valid candidate link item", () => {
    const result = candidateLinkItemSchema.parse(validCandidateLinkItem);
    expect(result.cl_uuid).toBe("abc-123-def");
  });

  it("accepts nullable date fields as null", () => {
    const result = candidateLinkItemSchema.parse({
      ...validCandidateLinkItem,
      created_at: null,
      updated_at: null,
    });
    expect(result.created_at).toBeNull();
    expect(result.updated_at).toBeNull();
  });

  it("rejects missing required string field", () => {
    const { title, ...rest } = validCandidateLinkItem;
    expect(() => candidateLinkItemSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for candidate_id", () => {
    expect(() =>
      candidateLinkItemSchema.parse({ ...validCandidateLinkItem, candidate_id: "not-a-number" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listCandidateLinksResultSchema
// ---------------------------------------------------------------------------

describe("listCandidateLinksResultSchema", () => {
  it("accepts a valid result with links", () => {
    const result = listCandidateLinksResultSchema.parse({
      links: [validCandidateLinkItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.links.length).toBe(1);
  });

  it("accepts an empty list", () => {
    const result = listCandidateLinksResultSchema.parse({
      links: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.links.length).toBe(0);
  });

  it("rejects negative page", () => {
    expect(() =>
      listCandidateLinksResultSchema.parse({
        links: [],
        total: 0,
        page: -1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });

  it("rejects negative total", () => {
    expect(() =>
      listCandidateLinksResultSchema.parse({
        links: [],
        total: -1,
        page: 1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Pure function: build candidate links filter
// ---------------------------------------------------------------------------

type CandidateLinkWhereInput = {
  candidate_id: number;
};

function buildCandidateLinksFilter(candidateId: number): CandidateLinkWhereInput {
  return { candidate_id: candidateId };
}

describe("buildCandidateLinksFilter", () => {
  it("returns filter with the candidate ID", () => {
    const result = buildCandidateLinksFilter(42);
    expect(result).toEqual({ candidate_id: 42 });
  });
});
