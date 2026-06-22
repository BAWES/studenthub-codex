import { describe, it, expect } from "vitest";
import {
  listCandidateEducationSchema,
  candidateEducationRowSchema,
  listCandidateEducationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCandidateEducationSchema (input)
// ---------------------------------------------------------------------------
describe("listCandidateEducationSchema", () => {
  it("accepts empty input with defaults", () => {
    const r = listCandidateEducationSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
      expect(r.data.search).toBeUndefined();
    }
  });

  it("accepts explicit page and limit", () => {
    const r = listCandidateEducationSchema.safeParse({ page: 3, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(50);
    }
  });

  it("accepts search string", () => {
    const r = listCandidateEducationSchema.safeParse({ search: "Kuwait" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.search).toBe("Kuwait");
    }
  });

  it("coerces string page to number", () => {
    const r = listCandidateEducationSchema.safeParse({ page: "2" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
    }
  });

  it("rejects page of 0", () => {
    const r = listCandidateEducationSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative page", () => {
    const r = listCandidateEducationSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listCandidateEducationSchema.safeParse({ limit: 200 });
    expect(r.success).toBe(false);
  });

  it("rejects limit of 0", () => {
    const r = listCandidateEducationSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const r = listCandidateEducationSchema.safeParse({ page: "abc" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateEducationRowSchema (output row)
// ---------------------------------------------------------------------------
describe("candidateEducationRowSchema", () => {
  const validRow = {
    education_uuid: "edu-uuid-123",
    candidate_id: 42,
    candidate_name: "Ahmed Al-Sabah",
    university_name: "Kuwait University",
    degree_name: "Bachelor", // keep as non-null test
    major_name: "Computer Science", // keep as non-null test
    graduation_year: 2024,
    is_currently_studying: false,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-01"),
  };

  it("accepts a valid row with all fields", () => {
    const r = candidateEducationRowSchema.safeParse(validRow);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.education_uuid).toBe("edu-uuid-123");
      expect(r.data.candidate_id).toBe(42);
    }
  });

  it("accepts nullable fields as null", () => {
    const r = candidateEducationRowSchema.safeParse({
      ...validRow,
      candidate_name: null,
      degree_name: null,
      major_name: null,
      graduation_year: null,
      created_at: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing education_uuid", () => {
    const { education_uuid: _, ...rest } = validRow;
    const r = candidateEducationRowSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing candidate_id", () => {
    const { candidate_id: _, ...rest } = validRow;
    const r = candidateEducationRowSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects non-string education_uuid", () => {
    const r = candidateEducationRowSchema.safeParse({ ...validRow, education_uuid: 123 });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric candidate_id", () => {
    const r = candidateEducationRowSchema.safeParse({ ...validRow, candidate_id: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean is_currently_studying", () => {
    const r = candidateEducationRowSchema.safeParse({ ...validRow, is_currently_studying: "yes" });
    expect(r.success).toBe(false);
  });

  it("accepts empty university_name", () => {
    const r = candidateEducationRowSchema.safeParse({ ...validRow, university_name: "" });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listCandidateEducationResultSchema (output)
// ---------------------------------------------------------------------------
describe("listCandidateEducationResultSchema", () => {
  const sampleRow = {
    education_uuid: "edu-uuid-1",
    candidate_id: 1,
    candidate_name: "Alice",
    university_name: "KU",
    degree_name: null,
    major_name: null,
    graduation_year: null,
    is_currently_studying: false,
    created_at: null,
    updated_at: null,
  };

  it("accepts a valid paginated result", () => {
    const r = listCandidateEducationResultSchema.safeParse({
      items: [sampleRow],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = listCandidateEducationResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = listCandidateEducationResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects page of 0 in result", () => {
    const r = listCandidateEducationResultSchema.safeParse({
      items: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing total", () => {
    const r = listCandidateEducationResultSchema.safeParse({
      items: [sampleRow],
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects items that don't match row schema", () => {
    const r = listCandidateEducationResultSchema.safeParse({
      items: [{ invalid: true }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });
});
