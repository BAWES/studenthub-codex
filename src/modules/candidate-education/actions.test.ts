import { describe, it, expect } from "vitest";
import {
  createEducationSchema,
  updateEducationSchema,
  deleteEducationSchema,
  getEducationSchema,
} from "./actions";
import type {
  EducationItem,
  CreateCandidateEducationResult,
  UpdateCandidateEducationResult,
  DeleteCandidateEducationResult,
} from "./actions";

// ---------------------------------------------------------------------------
// Tests: createEducationSchema
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
// Type shape tests
// ---------------------------------------------------------------------------

describe("EducationItem shape", () => {
  it("has required fields", () => {
    const item: EducationItem = {
      education_uuid: "edu_abc",
      candidate_id: 1,
      university_id: 5,
      degree_uuid: "deg_1",
      major_uuid: "maj_1",
      graduation_year: 2024,
      is_currently_studying: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    expect(item.education_uuid).toBe("edu_abc");
    expect(item.candidate_id).toBe(1);
  });

  it("supports optional university relation", () => {
    const item: EducationItem = {
      education_uuid: "edu_abc",
      candidate_id: 1,
      university_id: 5,
      degree_uuid: null,
      major_uuid: null,
      graduation_year: null,
      is_currently_studying: true,
      created_at: null,
      updated_at: null,
      university: { name: "Kuwait University", nameAr: "جامعة الكويت" },
    };
    expect(item.university?.name).toBe("Kuwait University");
  });
});

describe("Education result types", () => {
  it("accepts CreateCandidateEducationResult success", () => {
    const r: CreateCandidateEducationResult = { success: true, educationUuid: "edu_abc" };
    expect(r.success).toBe(true);
  });

  it("accepts CreateCandidateEducationResult error", () => {
    const r: CreateCandidateEducationResult = { success: false, error: "University not found" };
    expect(r.error).toBe("University not found");
  });

  it("accepts UpdateCandidateEducationResult success", () => {
    const r: UpdateCandidateEducationResult = { success: true };
    expect(r.success).toBe(true);
  });

  it("accepts DeleteCandidateEducationResult success", () => {
    const r: DeleteCandidateEducationResult = { success: true };
    expect(r.success).toBe(true);
  });
});
