import { describe, it, expect } from "vitest";
import {
  educationItemSchema,
  createCandidateEducationResultSchema,
  updateCandidateEducationResultSchema,
  deleteCandidateEducationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// educationItemSchema
// ---------------------------------------------------------------------------
describe("educationItemSchema", () => {
  const valid = {
    education_uuid: "edu_abc",
    candidate_id: 1,
    university_id: 5,
    degree_uuid: "deg_1",
    major_uuid: "maj_1",
    graduation_year: 2024,
    is_currently_studying: false,
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-06-20"),
    university: { name: "Kuwait University", nameAr: "جامعة الكويت" },
  };

  it("accepts a valid education item with university", () => {
    expect(educationItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable degree_uuid", () => {
    expect(
      educationItemSchema.safeParse({ ...valid, degree_uuid: null }).success,
    ).toBe(true);
  });

  it("accepts nullable major_uuid", () => {
    expect(
      educationItemSchema.safeParse({ ...valid, major_uuid: null }).success,
    ).toBe(true);
  });

  it("accepts nullable graduation_year", () => {
    expect(
      educationItemSchema.safeParse({ ...valid, graduation_year: null }).success,
    ).toBe(true);
  });

  it("accepts nullable created_at", () => {
    expect(
      educationItemSchema.safeParse({ ...valid, created_at: null }).success,
    ).toBe(true);
  });

  it("accepts nullable updated_at", () => {
    expect(
      educationItemSchema.safeParse({ ...valid, updated_at: null }).success,
    ).toBe(true);
  });

  it("accepts all nullable fields simultaneously", () => {
    expect(
      educationItemSchema.safeParse({
        education_uuid: "edu_xyz",
        candidate_id: 2,
        university_id: 10,
        degree_uuid: null,
        major_uuid: null,
        graduation_year: null,
        is_currently_studying: true,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("accepts an item without university (optional)", () => {
    const { university: _, ...rest } = valid;
    expect(educationItemSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects missing education_uuid", () => {
    const { education_uuid: _, ...rest } = valid;
    expect(educationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidate_id", () => {
    const { candidate_id: _, ...rest } = valid;
    expect(educationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing university_id", () => {
    const { university_id: _, ...rest } = valid;
    expect(educationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing is_currently_studying", () => {
    const { is_currently_studying: _, ...rest } = valid;
    expect(educationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidate_id", () => {
    expect(
      educationItemSchema.safeParse({ ...valid, candidate_id: "not-a-number" })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for university_id", () => {
    expect(
      educationItemSchema.safeParse({ ...valid, university_id: "not-a-number" })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for is_currently_studying", () => {
    expect(
      educationItemSchema.safeParse({ ...valid, is_currently_studying: "maybe" })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCandidateEducationResultSchema (discriminated union)
// ---------------------------------------------------------------------------
describe("createCandidateEducationResultSchema", () => {
  it("accepts success result with educationUuid", () => {
    expect(
      createCandidateEducationResultSchema.safeParse({
        success: true,
        educationUuid: "edu_abc",
      }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      createCandidateEducationResultSchema.safeParse({
        success: false,
        error: "University not found.",
      }).success,
    ).toBe(true);
  });

  it("rejects success without educationUuid", () => {
    expect(
      createCandidateEducationResultSchema.safeParse({
        success: true,
      }).success,
    ).toBe(false);
  });

  it("rejects missing error on false", () => {
    expect(
      createCandidateEducationResultSchema.safeParse({
        success: false,
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(
      createCandidateEducationResultSchema.safeParse({
        success: "maybe",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCandidateEducationResultSchema (discriminated union)
// ---------------------------------------------------------------------------
describe("updateCandidateEducationResultSchema", () => {
  it("accepts success result", () => {
    expect(
      updateCandidateEducationResultSchema.safeParse({
        success: true,
      }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      updateCandidateEducationResultSchema.safeParse({
        success: false,
        error: "Not found.",
      }).success,
    ).toBe(true);
  });

  it("rejects missing error on false", () => {
    expect(
      updateCandidateEducationResultSchema.safeParse({
        success: false,
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for error", () => {
    expect(
      updateCandidateEducationResultSchema.safeParse({
        success: false,
        error: 123,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteCandidateEducationResultSchema (discriminated union)
// ---------------------------------------------------------------------------
describe("deleteCandidateEducationResultSchema", () => {
  it("accepts success result", () => {
    expect(
      deleteCandidateEducationResultSchema.safeParse({
        success: true,
      }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      deleteCandidateEducationResultSchema.safeParse({
        success: false,
        error: "Delete failed.",
      }).success,
    ).toBe(true);
  });

  it("rejects missing error on false", () => {
    expect(
      deleteCandidateEducationResultSchema.safeParse({
        success: false,
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(
      deleteCandidateEducationResultSchema.safeParse({
        success: "yes",
      }).success,
    ).toBe(false);
  });
});
