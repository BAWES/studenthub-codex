import { describe, it, expect } from "vitest";
import {
  listCandidateEducationSchema,
  candidateEducationRowSchema,
  listCandidateEducationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCandidateEducationSchema
// ---------------------------------------------------------------------------
describe("listCandidateEducationSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listCandidateEducationSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(
      listCandidateEducationSchema.safeParse({ page: 2, limit: 50, search: "engineering" }).success,
    ).toBe(true);
  });

  it("accepts input without search", () => {
    expect(listCandidateEducationSchema.safeParse({ page: 1, limit: 20 }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listCandidateEducationSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listCandidateEducationSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listCandidateEducationSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCandidateEducationSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateEducationRowSchema
// ---------------------------------------------------------------------------
describe("candidateEducationRowSchema", () => {
  const validRow = {
    education_uuid: "edu-123",
    candidate_id: 42,
    candidate_name: "John Doe",
    university_name: "MIT",
    degree_name: "Bachelor",
    major_name: "Computer Science",
    graduation_year: 2024,
    is_currently_studying: false,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-06-01"),
  };

  it("accepts a valid row", () => {
    expect(candidateEducationRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      candidateEducationRowSchema.safeParse({
        ...validRow,
        candidate_name: null,
        degree_name: null,
        major_name: null,
        graduation_year: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing education_uuid", () => {
    const { education_uuid: _, ...rest } = validRow;
    expect(candidateEducationRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for education_uuid", () => {
    expect(candidateEducationRowSchema.safeParse({ ...validRow, education_uuid: 123 }).success).toBe(false);
  });

  it("rejects missing candidate_id", () => {
    const { candidate_id: _, ...rest } = validRow;
    expect(candidateEducationRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing university_name", () => {
    const { university_name: _, ...rest } = validRow;
    expect(candidateEducationRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for university_name", () => {
    expect(candidateEducationRowSchema.safeParse({ ...validRow, university_name: 456 }).success).toBe(false);
  });

  it("rejects missing is_currently_studying", () => {
    const { is_currently_studying: _, ...rest } = validRow;
    expect(candidateEducationRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidate_id", () => {
    expect(
      candidateEducationRowSchema.safeParse({ ...validRow, candidate_id: "not-a-number" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for graduation_year", () => {
    expect(
      candidateEducationRowSchema.safeParse({ ...validRow, graduation_year: "not-a-number" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateEducationResultSchema
// ---------------------------------------------------------------------------
describe("listCandidateEducationResultSchema", () => {
  const validResult = {
    items: [
      {
        education_uuid: "edu-1",
        candidate_id: 1,
        candidate_name: "Alice",
        university_name: "Harvard",
        degree_name: null,
        major_name: null,
        graduation_year: null,
        is_currently_studying: true,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listCandidateEducationResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listCandidateEducationResultSchema.safeParse({ ...validResult, items: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listCandidateEducationResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(listCandidateEducationResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listCandidateEducationResultSchema.safeParse({ ...validResult, page: 0 }).success).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      listCandidateEducationResultSchema.safeParse({ ...validResult, totalPages: -1 }).success,
    ).toBe(false);
  });
});
