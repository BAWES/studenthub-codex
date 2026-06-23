import { describe, it, expect } from "vitest";
import {
  listCandidateEducationSchema,
  getCandidateEducationSchema,
  createCandidateEducationSchema,
  updateCandidateEducationSchema,
  deleteCandidateEducationSchema,
  candidateEducationItemSchema,
  listCandidateEducationResultSchema,
  candidateEducationActionResultSchema,
} from "./schemas";
import type {
  CandidateEducationItem,
  ListCandidateEducationResult,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("listCandidateEducationSchema", () => {
  it("requires candidateId", () => {
    const result = listCandidateEducationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts candidateId with defaults", () => {
    const result = listCandidateEducationSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listCandidateEducationSchema.safeParse({
      candidateId: 10,
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    const result = listCandidateEducationSchema.safeParse({
      candidateId: 1,
      limit: 999,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCandidateEducationSchema.safeParse({
      candidateId: 1,
      page: -1,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const result = listCandidateEducationSchema.safeParse({
      candidateId: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(15);
    }
  });

  it("rejects zero candidateId", () => {
    const result = listCandidateEducationSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });
});

describe("getCandidateEducationSchema", () => {
  it("accepts valid education UUID", () => {
    const result = getCandidateEducationSchema.safeParse({
      educationUuid: "edu_abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.educationUuid).toBe("edu_abc123");
    }
  });

  it("rejects empty education UUID", () => {
    const result = getCandidateEducationSchema.safeParse({
      educationUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing education UUID", () => {
    const result = getCandidateEducationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("candidateEducationItemSchema", () => {
  it("accepts valid education item", () => {
    const result = candidateEducationItemSchema.safeParse({
      education_uuid: "edu_test123",
      candidate_id: 42,
      university_id: 5,
      university_name_en: "Kuwait University",
      university_name_ar: null,
      degree_uuid: "deg_001",
      degree_name_en: "Bachelor",
      degree_name_ar: null,
      major_uuid: "maj_001",
      major_name_en: "CS",
      major_name_ar: null,
      graduation_year: 2024,
      is_currently_studying: false,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-06-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal item with null fields", () => {
    const result = candidateEducationItemSchema.safeParse({
      education_uuid: "edu_abc",
      candidate_id: 1,
      university_id: 5,
      university_name_en: null,
      university_name_ar: null,
      degree_uuid: null,
      degree_name_en: null,
      degree_name_ar: null,
      major_uuid: null,
      major_name_en: null,
      major_name_ar: null,
      graduation_year: null,
      is_currently_studying: true,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing education_uuid", () => {
    const result = candidateEducationItemSchema.safeParse({
      candidate_id: 1,
      university_id: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean is_currently_studying", () => {
    const result = candidateEducationItemSchema.safeParse({
      education_uuid: "edu_1",
      candidate_id: 1,
      university_id: 5,
      is_currently_studying: "yes",
    });
    expect(result.success).toBe(false);
  });
});

describe("listCandidateEducationResultSchema", () => {
  it("accepts empty result", () => {
    const result = listCandidateEducationResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(true);
  });

  it("accepts populated result", () => {
    const result = listCandidateEducationResultSchema.safeParse({
      items: [
        {
          education_uuid: "edu_abc",
          candidate_id: 1,
          university_id: 5,
          university_name_en: "KU",
          university_name_ar: null,
          degree_uuid: null,
          degree_name_en: null,
          degree_name_ar: null,
          major_uuid: null,
          major_name_en: null,
          major_name_ar: null,
          graduation_year: null,
          is_currently_studying: true,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = listCandidateEducationResultSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      pageSize: 20,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero page", () => {
    const result = listCandidateEducationResultSchema.safeParse({
      items: [],
      total: 0,
      page: 0,
      pageSize: 20,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Create/Update/Delete input schema tests
// ---------------------------------------------------------------------------

describe("createCandidateEducationSchema", () => {
  it("accepts valid create params with candidateId", () => {
    const result = createCandidateEducationSchema.safeParse({
      candidateId: 42,
      universityId: 5,
      degreeUuid: "deg_001",
      majorUuid: "maj_001",
      graduationYear: 2024,
      isCurrentlyStudying: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.universityId).toBe(5);
      expect(result.data.isCurrentlyStudying).toBe(false);
    }
  });

  it("rejects missing candidateId", () => {
    const result = createCandidateEducationSchema.safeParse({ universityId: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    const result = createCandidateEducationSchema.safeParse({
      candidateId: 0,
      universityId: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing universityId", () => {
    const result = createCandidateEducationSchema.safeParse({ candidateId: 1 });
    expect(result.success).toBe(false);
  });

  it("accepts minimal params (candidateId + universityId only)", () => {
    const result = createCandidateEducationSchema.safeParse({
      candidateId: 1,
      universityId: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateCandidateEducationSchema", () => {
  it("accepts valid update params", () => {
    const result = updateCandidateEducationSchema.safeParse({
      candidateId: 42,
      educationUuid: "edu_abc",
      universityId: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.educationUuid).toBe("edu_abc");
      expect(result.data.universityId).toBe(10);
    }
  });

  it("rejects missing candidateId", () => {
    const result = updateCandidateEducationSchema.safeParse({
      educationUuid: "edu_abc",
      universityId: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing educationUuid", () => {
    const result = updateCandidateEducationSchema.safeParse({
      candidateId: 1,
      universityId: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing universityId", () => {
    const result = updateCandidateEducationSchema.safeParse({
      candidateId: 1,
      educationUuid: "edu_abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteCandidateEducationSchema", () => {
  it("accepts valid delete params", () => {
    const result = deleteCandidateEducationSchema.safeParse({
      candidateId: 42,
      educationUuid: "edu_xyz",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.educationUuid).toBe("edu_xyz");
    }
  });

  it("rejects missing candidateId", () => {
    const result = deleteCandidateEducationSchema.safeParse({
      educationUuid: "edu_xyz",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty UUID", () => {
    const result = deleteCandidateEducationSchema.safeParse({
      candidateId: 1,
      educationUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = deleteCandidateEducationSchema.safeParse({ candidateId: 1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action result output schema tests
// ---------------------------------------------------------------------------

describe("candidateEducationActionResultSchema", () => {
  it("accepts success result", () => {
    const result = candidateEducationActionResultSchema.safeParse({
      success: true as const,
      educationUuid: "edu_abc",
    });
    expect(result.success).toBe(true);
  });

  it("accepts failure result", () => {
    const result = candidateEducationActionResultSchema.safeParse({
      success: false as const,
      error: "University not found",
    });
    expect(result.success).toBe(true);
  });

  it("rejects success without educationUuid", () => {
    const result = candidateEducationActionResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects failure without error", () => {
    const result = candidateEducationActionResultSchema.safeParse({
      success: false,
    });
    expect(result.success).toBe(false);
  });
});
