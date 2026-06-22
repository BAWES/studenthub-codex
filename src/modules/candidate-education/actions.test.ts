import { describe, it, expect } from "vitest";
import {
  createEducationSchema,
  updateEducationSchema,
  deleteEducationSchema,
  getEducationSchema,
  educationItemSchema,
  createCandidateEducationResultSchema,
  updateCandidateEducationResultSchema,
  deleteCandidateEducationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Tests: input schemas
// ---------------------------------------------------------------------------

describe("createEducationSchema", () => {
  it("accepts valid education with all fields", () => {
    const result = createEducationSchema.safeParse({
      universityId: 1,
      degreeUuid: "deg123",
      majorUuid: "maj456",
      graduationYear: 2024,
      isCurrentlyStudying: "0",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.universityId).toBe(1);
      expect(result.data.degreeUuid).toBe("deg123");
    }
  });

  it("fills defaults for optional fields", () => {
    const result = createEducationSchema.safeParse({
      universityId: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.degreeUuid).toBe("");
      expect(result.data.majorUuid).toBe("");
      expect(result.data.graduationYear).toBe("");
      expect(result.data.isCurrentlyStudying).toBe("0");
    }
  });

  it("coerces string universityId to number", () => {
    const result = createEducationSchema.safeParse({
      universityId: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.universityId).toBe(5);
    }
  });

  it("rejects empty universityId", () => {
    const result = createEducationSchema.safeParse({
      universityId: undefined,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero universityId", () => {
    const result = createEducationSchema.safeParse({
      universityId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts currently studying flag", () => {
    const result = createEducationSchema.safeParse({
      universityId: 1,
      isCurrentlyStudying: "1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects graduation year before 1950", () => {
    const result = createEducationSchema.safeParse({
      universityId: 1,
      graduationYear: 1900,
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty graduation year", () => {
    const result = createEducationSchema.safeParse({
      universityId: 1,
      graduationYear: "",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: updateEducationSchema
// ---------------------------------------------------------------------------

describe("updateEducationSchema", () => {
  it("accepts valid update input", () => {
    const result = updateEducationSchema.safeParse({
      educationUuid: "edu_abc123",
      universityId: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.educationUuid).toBe("edu_abc123");
    }
  });

  it("rejects empty educationUuid", () => {
    const result = updateEducationSchema.safeParse({
      educationUuid: "",
      universityId: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing educationUuid", () => {
    const result = updateEducationSchema.safeParse({
      universityId: 1,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: deleteEducationSchema
// ---------------------------------------------------------------------------

describe("deleteEducationSchema", () => {
  it("accepts valid delete input", () => {
    const result = deleteEducationSchema.safeParse({
      educationUuid: "edu_abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty educationUuid", () => {
    const result = deleteEducationSchema.safeParse({
      educationUuid: "",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: getEducationSchema
// ---------------------------------------------------------------------------

describe("getEducationSchema", () => {
  it("accepts valid get input", () => {
    const result = getEducationSchema.safeParse({
      educationUuid: "edu_abc123",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: output schema validation
// ---------------------------------------------------------------------------

describe("educationItemSchema", () => {
  it("validates a complete education item with university", () => {
    const item = {
      education_uuid: "edu_abc",
      candidate_id: 1,
      university_id: 5,
      degree_uuid: "deg_1",
      major_uuid: "maj_1",
      graduation_year: 2024,
      is_currently_studying: false,
      created_at: new Date(),
      updated_at: new Date(),
      university: { name: "Kuwait University", nameAr: "جامعة الكويت" },
    };
    const result = educationItemSchema.safeParse(item);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.education_uuid).toBe("edu_abc");
      expect(result.data.university?.name).toBe("Kuwait University");
    }
  });

  it("validates an education item without university", () => {
    const item = {
      education_uuid: "edu_xyz",
      candidate_id: 2,
      university_id: 10,
      degree_uuid: null,
      major_uuid: null,
      graduation_year: null,
      is_currently_studying: true,
      created_at: null,
      updated_at: null,
    };
    const result = educationItemSchema.safeParse(item);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.university).toBeUndefined();
      expect(result.data.is_currently_studying).toBe(true);
    }
  });

  it("rejects missing required fields", () => {
    const result = educationItemSchema.safeParse({
      education_uuid: "edu_abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("createCandidateEducationResultSchema", () => {
  it("validates success result", () => {
    const result = createCandidateEducationResultSchema.safeParse({
      success: true,
      educationUuid: "edu_abc",
    });
    expect(result.success).toBe(true);
  });

  it("validates error result", () => {
    const result = createCandidateEducationResultSchema.safeParse({
      success: false,
      error: "University not found.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects success without educationUuid", () => {
    const result = createCandidateEducationResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCandidateEducationResultSchema", () => {
  it("validates success result", () => {
    const result = updateCandidateEducationResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(true);
  });

  it("validates error result", () => {
    const result = updateCandidateEducationResultSchema.safeParse({
      success: false,
      error: "Not found.",
    });
    expect(result.success).toBe(true);
  });
});

describe("deleteCandidateEducationResultSchema", () => {
  it("validates success result", () => {
    const result = deleteCandidateEducationResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(true);
  });

  it("validates error result", () => {
    const result = deleteCandidateEducationResultSchema.safeParse({
      success: false,
      error: "Delete failed.",
    });
    expect(result.success).toBe(true);
  });
});
