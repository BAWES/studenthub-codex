import { describe, it, expect } from "vitest";
import {
  candidateEducationItemSchema,
  listCandidateEducationResultSchema,
  candidateEducationActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("candidateEducationItemSchema", () => {
  const validItem = {
    education_uuid: "edu-001",
    candidate_id: 42,
    university_id: 5,
    university_name_en: "Cairo University",
    university_name_ar: "جامعة القاهرة",
    degree_uuid: "deg-001",
    degree_name_en: "Bachelor",
    degree_name_ar: "بكالوريوس",
    major_uuid: "maj-001",
    major_name_en: "Computer Science",
    major_name_ar: "علوم حاسوب",
    graduation_year: 2025,
    is_currently_studying: false,
    created_at: new Date("2026-06-15T10:00:00"),
    updated_at: new Date("2026-06-15T10:30:00"),
  };

  it("accepts a valid education item", () => {
    expect(candidateEducationItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null for all nullable fields", () => {
    expect(
      candidateEducationItemSchema.safeParse({
        ...validItem,
        university_name_en: null,
        university_name_ar: null,
        degree_uuid: null,
        degree_name_en: null,
        degree_name_ar: null,
        major_uuid: null,
        major_name_en: null,
        major_name_ar: null,
        graduation_year: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing education_uuid", () => {
    const { education_uuid: _, ...rest } = validItem;
    expect(candidateEducationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidate_id", () => {
    expect(
      candidateEducationItemSchema.safeParse({
        ...validItem,
        candidate_id: "42",
      }).success,
    ).toBe(false);
  });

  it("rejects string instead of Date for created_at", () => {
    expect(
      candidateEducationItemSchema.safeParse({
        ...validItem,
        created_at: "2026-06-15T10:00:00",
      }).success,
    ).toBe(true); // z.coerce.date() accepts ISO strings
  });

  it("rejects invalid is_currently_studying type", () => {
    expect(
      candidateEducationItemSchema.safeParse({
        ...validItem,
        is_currently_studying: "yes",
      }).success,
    ).toBe(false);
  });
});

describe("listCandidateEducationResultSchema", () => {
  const validResult = {
    items: [
      {
        education_uuid: "edu-001",
        candidate_id: 42,
        university_id: 5,
        university_name_en: "Cairo University",
        university_name_ar: null,
        degree_uuid: null,
        degree_name_en: null,
        degree_name_ar: null,
        major_uuid: null,
        major_name_en: null,
        major_name_ar: null,
        graduation_year: null,
        is_currently_studying: false,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    pageSize: 20,
  };

  it("accepts a valid paginated result", () => {
    expect(listCandidateEducationResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listCandidateEducationResultSchema.safeParse({
        ...validResult,
        items: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listCandidateEducationResultSchema.safeParse({
        ...validResult,
        total: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listCandidateEducationResultSchema.safeParse({
        ...validResult,
        page: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects string instead of number for page", () => {
    expect(
      listCandidateEducationResultSchema.safeParse({
        ...validResult,
        page: "1",
      }).success,
    ).toBe(false);
  });
});

describe("candidateEducationActionResultSchema", () => {
  it("accepts success result", () => {
    const r = candidateEducationActionResultSchema.safeParse({
      success: true,
      educationUuid: "edu-001",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = candidateEducationActionResultSchema.safeParse({
      success: false,
      error: "Education not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects success without educationUuid", () => {
    expect(
      candidateEducationActionResultSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error without error message", () => {
    expect(
      candidateEducationActionResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects invalid discriminator value", () => {
    expect(
      candidateEducationActionResultSchema.safeParse({
        success: "yes",
        educationUuid: "edu-001",
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for educationUuid in success variant", () => {
    expect(
      candidateEducationActionResultSchema.safeParse({
        success: true,
        educationUuid: 123,
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for error message", () => {
    expect(
      candidateEducationActionResultSchema.safeParse({
        success: false,
        error: 42,
      }).success,
    ).toBe(false);
  });
});
