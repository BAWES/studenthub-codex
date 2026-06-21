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
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validCandidateLinkItem = (): CandidateLinkItem => ({
  cl_uuid: "cl_abc123",
  candidate_id: 42,
  title: "LinkedIn Profile",
  url: "https://linkedin.com/in/johndoe",
  created_at: new Date("2026-01-15T10:00:00Z"),
  updated_at: new Date("2026-01-15T10:00:00Z"),
});

const nullableCandidateLinkItem = (): CandidateLinkItem => ({
  cl_uuid: "cl_def456",
  candidate_id: 99,
  title: "Portfolio",
  url: "https://example.com",
  created_at: null,
  updated_at: null,
});

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

describe("listCandidateLinksSchema", () => {
  it("accepts a valid input with all fields", () => {
    const r = listCandidateLinksSchema.safeParse({
      candidateId: 42,
      page: 1,
      limit: 20,
    });
    expect(r.success).toBe(true);
  });

  it("accepts input with only candidateId (uses defaults for page/limit)", () => {
    const r = listCandidateLinksSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("coerces string candidateId to number", () => {
    expect(listCandidateLinksSchema.safeParse({ candidateId: "42" }).success).toBe(true);
  });

  it("coerces string page to number", () => {
    expect(listCandidateLinksSchema.safeParse({ candidateId: 1, page: "2" }).success).toBe(true);
  });

  it("coerces string limit to number", () => {
    expect(listCandidateLinksSchema.safeParse({ candidateId: 1, limit: "10" }).success).toBe(true);
  });

  it("rejects negative candidateId", () => {
    expect(listCandidateLinksSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(listCandidateLinksSchema.safeParse({ candidateId: 0 }).success).toBe(false);
  });

  it("rejects non-numeric string for candidateId", () => {
    expect(listCandidateLinksSchema.safeParse({ candidateId: "abc" }).success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(listCandidateLinksSchema.safeParse({}).success).toBe(false);
  });

  it("rejects page below 1", () => {
    expect(listCandidateLinksSchema.safeParse({ candidateId: 1, page: 0 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listCandidateLinksSchema.safeParse({ candidateId: 1, limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listCandidateLinksSchema.safeParse({ candidateId: 1, limit: 101 }).success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    expect(listCandidateLinksSchema.safeParse({ candidateId: 1, page: "abc" }).success).toBe(false);
  });

  it("rejects non-numeric limit", () => {
    expect(listCandidateLinksSchema.safeParse({ candidateId: 1, limit: "abc" }).success).toBe(false);
  });
});

describe("getCandidateLinkSchema", () => {
  it("accepts a valid clUuid", () => {
    expect(getCandidateLinkSchema.safeParse({ clUuid: "link_uuid_123" }).success).toBe(true);
  });

  it("rejects empty string clUuid", () => {
    expect(getCandidateLinkSchema.safeParse({ clUuid: "" }).success).toBe(false);
  });

  it("rejects missing clUuid", () => {
    expect(getCandidateLinkSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string clUuid", () => {
    expect(getCandidateLinkSchema.safeParse({ clUuid: 123 }).success).toBe(false);
  });
});

describe("createCandidateLinkSchema", () => {
  it("accepts a valid input", () => {
    const r = createCandidateLinkSchema.safeParse({
      candidateId: 1,
      title: "My Resume",
      url: "https://example.com/resume.pdf",
    });
    expect(r.success).toBe(true);
  });

  it("coerces string candidateId to number", () => {
    expect(
      createCandidateLinkSchema.safeParse({
        candidateId: "1",
        title: "Resume",
        url: "https://example.com",
      }).success,
    ).toBe(true);
  });

  it("rejects negative candidateId", () => {
    expect(
      createCandidateLinkSchema.safeParse({
        candidateId: -1,
        title: "Test",
        url: "https://example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(
      createCandidateLinkSchema.safeParse({
        candidateId: 0,
        title: "Test",
        url: "https://example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects missing candidateId", () => {
    expect(
      createCandidateLinkSchema.safeParse({ title: "Test", url: "https://example.com" }).success,
    ).toBe(false);
  });

  it("rejects missing title", () => {
    expect(
      createCandidateLinkSchema.safeParse({ candidateId: 1, url: "https://example.com" }).success,
    ).toBe(false);
  });

  it("rejects missing url", () => {
    expect(
      createCandidateLinkSchema.safeParse({ candidateId: 1, title: "Test" }).success,
    ).toBe(false);
  });

  it("rejects empty title", () => {
    expect(
      createCandidateLinkSchema.safeParse({
        candidateId: 1,
        title: "",
        url: "https://example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects empty url", () => {
    expect(
      createCandidateLinkSchema.safeParse({
        candidateId: 1,
        title: "Test",
        url: "",
      }).success,
    ).toBe(false);
  });

  it("rejects title exceeding 255 characters", () => {
    expect(
      createCandidateLinkSchema.safeParse({
        candidateId: 1,
        title: "x".repeat(256),
        url: "https://example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects url exceeding 255 characters", () => {
    expect(
      createCandidateLinkSchema.safeParse({
        candidateId: 1,
        title: "Test",
        url: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects non-string title", () => {
    expect(
      createCandidateLinkSchema.safeParse({
        candidateId: 1,
        title: 123,
        url: "https://example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects non-string url", () => {
    expect(
      createCandidateLinkSchema.safeParse({
        candidateId: 1,
        title: "Test",
        url: 456,
      }).success,
    ).toBe(false);
  });

  it("rejects non-numeric candidateId", () => {
    expect(
      createCandidateLinkSchema.safeParse({
        candidateId: "abc",
        title: "Test",
        url: "https://example.com",
      }).success,
    ).toBe(false);
  });
});

describe("updateCandidateLinkSchema", () => {
  it("accepts a valid input", () => {
    const r = updateCandidateLinkSchema.safeParse({
      clUuid: "link_abc",
      title: "Updated Title",
      url: "https://example.com/updated",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty clUuid", () => {
    expect(
      updateCandidateLinkSchema.safeParse({
        clUuid: "",
        title: "Title",
        url: "https://example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects missing clUuid", () => {
    expect(
      updateCandidateLinkSchema.safeParse({ title: "Title", url: "https://example.com" }).success,
    ).toBe(false);
  });

  it("rejects missing title", () => {
    expect(
      updateCandidateLinkSchema.safeParse({ clUuid: "abc", url: "https://example.com" }).success,
    ).toBe(false);
  });

  it("rejects missing url", () => {
    expect(
      updateCandidateLinkSchema.safeParse({ clUuid: "abc", title: "Title" }).success,
    ).toBe(false);
  });

  it("rejects empty title", () => {
    expect(
      updateCandidateLinkSchema.safeParse({
        clUuid: "abc",
        title: "",
        url: "https://example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects empty url", () => {
    expect(
      updateCandidateLinkSchema.safeParse({
        clUuid: "abc",
        title: "Title",
        url: "",
      }).success,
    ).toBe(false);
  });

  it("rejects title exceeding 255 characters", () => {
    expect(
      updateCandidateLinkSchema.safeParse({
        clUuid: "abc",
        title: "x".repeat(256),
        url: "https://example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects url exceeding 255 characters", () => {
    expect(
      updateCandidateLinkSchema.safeParse({
        clUuid: "abc",
        title: "Title",
        url: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects non-string clUuid", () => {
    expect(
      updateCandidateLinkSchema.safeParse({
        clUuid: 123,
        title: "Title",
        url: "https://example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects non-string title", () => {
    expect(
      updateCandidateLinkSchema.safeParse({
        clUuid: "abc",
        title: 123,
        url: "https://example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects non-string url", () => {
    expect(
      updateCandidateLinkSchema.safeParse({
        clUuid: "abc",
        title: "Title",
        url: 456,
      }).success,
    ).toBe(false);
  });
});

describe("deleteCandidateLinkSchema", () => {
  it("accepts a valid clUuid", () => {
    expect(deleteCandidateLinkSchema.safeParse({ clUuid: "link_to_delete" }).success).toBe(true);
  });

  it("rejects empty string clUuid", () => {
    expect(deleteCandidateLinkSchema.safeParse({ clUuid: "" }).success).toBe(false);
  });

  it("rejects missing clUuid", () => {
    expect(deleteCandidateLinkSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string clUuid", () => {
    expect(deleteCandidateLinkSchema.safeParse({ clUuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schemas
// ---------------------------------------------------------------------------

describe("candidateLinkItemSchema", () => {
  it("accepts a full candidate link item with all fields populated", () => {
    const r = candidateLinkItemSchema.safeParse(validCandidateLinkItem());
    expect(r.success).toBe(true);
  });

  it("accepts a candidate link item with nullable fields set to null", () => {
    const r = candidateLinkItemSchema.safeParse(nullableCandidateLinkItem());
    expect(r.success).toBe(true);
  });

  it("rejects missing required field 'cl_uuid'", () => {
    const { cl_uuid: _, ...rest } = validCandidateLinkItem();
    expect(candidateLinkItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing required field 'candidate_id'", () => {
    const { candidate_id: _, ...rest } = validCandidateLinkItem();
    expect(candidateLinkItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing required field 'title'", () => {
    const { title: _, ...rest } = validCandidateLinkItem();
    expect(candidateLinkItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing required field 'url'", () => {
    const { url: _, ...rest } = validCandidateLinkItem();
    expect(candidateLinkItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string cl_uuid", () => {
    expect(
      candidateLinkItemSchema.safeParse({ ...validCandidateLinkItem(), cl_uuid: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-number candidate_id", () => {
    expect(
      candidateLinkItemSchema.safeParse({
        ...validCandidateLinkItem(),
        candidate_id: "not-a-number",
      }).success,
    ).toBe(false);
  });

  it("rejects non-string title", () => {
    expect(
      candidateLinkItemSchema.safeParse({ ...validCandidateLinkItem(), title: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-string url", () => {
    expect(
      candidateLinkItemSchema.safeParse({ ...validCandidateLinkItem(), url: 123 }).success,
    ).toBe(false);
  });

  it("rejects non-date created_at", () => {
    expect(
      candidateLinkItemSchema.safeParse({
        ...validCandidateLinkItem(),
        created_at: "not-a-date",
      }).success,
    ).toBe(false);
  });

  it("rejects non-date updated_at", () => {
    expect(
      candidateLinkItemSchema.safeParse({
        ...validCandidateLinkItem(),
        updated_at: "not-a-date",
      }).success,
    ).toBe(false);
  });

  it("rejects completely empty object", () => {
    expect(candidateLinkItemSchema.safeParse({}).success).toBe(false);
  });
});

describe("listCandidateLinksResultSchema", () => {
  it("accepts a full paginated result", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: [validCandidateLinkItem(), nullableCandidateLinkItem()],
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty links array", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects zero page", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: -1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const r = listCandidateLinksResultSchema.safeParse({ links: [] });
    expect(r.success).toBe(false);
  });

  it("rejects non-array links", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: "not-an-array",
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer total", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: [],
      total: 1.5,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer page", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: [],
      total: 0,
      page: 1.5,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: [],
      total: 0,
      page: 1,
      limit: 1.5,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer totalPages", () => {
    const r = listCandidateLinksResultSchema.safeParse({
      links: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1.5,
    });
    expect(r.success).toBe(false);
  });

  it("rejects completely empty object", () => {
    expect(listCandidateLinksResultSchema.safeParse({}).success).toBe(false);
  });
});
