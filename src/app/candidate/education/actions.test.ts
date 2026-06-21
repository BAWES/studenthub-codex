import { describe, it, expect } from "vitest";
import {
  listEducationSchema,
  getEducationSchema,
  createEducationSchema,
  updateEducationSchema,
  deleteEducationSchema,
} from "./schemas";
import {
  educationItemOutputSchema,
  educationListOutputSchema,
  educationActionResultOutputSchema,
} from "@/app/candidate/schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/education actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("listEducationSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listEducationSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listEducationSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listEducationSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listEducationSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

describe("getEducationSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getEducationSchema.safeParse({ educationUuid: "edu_abc123" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getEducationSchema.safeParse({ educationUuid: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing UUID", () => {
    expect(getEducationSchema.safeParse({}).success).toBe(false);
  });
});

describe("createEducationSchema", () => {
  it("accepts valid create params", () => {
    const r = createEducationSchema.safeParse({
      universityId: 5,
      degreeUuid: "deg_001",
      majorUuid: "maj_001",
      graduationYear: 2024,
      isCurrentlyStudying: false,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.universityId).toBe(5);
      expect(r.data.isCurrentlyStudying).toBe(false);
    }
  });

  it("rejects missing universityId", () => {
    expect(createEducationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero universityId", () => {
    expect(
      createEducationSchema.safeParse({ universityId: 0 }).success,
    ).toBe(false);
  });

  it("accepts minimal params (universityId only)", () => {
    const r = createEducationSchema.safeParse({ universityId: 1 });
    expect(r.success).toBe(true);
  });

  it("coerces graduationYear from string", () => {
    const r = createEducationSchema.safeParse({
      universityId: 1,
      graduationYear: "2023",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.graduationYear).toBe(2023);
    }
  });
});

describe("updateEducationSchema", () => {
  it("accepts valid update params", () => {
    const r = updateEducationSchema.safeParse({
      educationUuid: "edu_abc",
      universityId: 10,
      degreeUuid: "deg_002",
      majorUuid: "maj_002",
      graduationYear: 2025,
      isCurrentlyStudying: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.educationUuid).toBe("edu_abc");
      expect(r.data.universityId).toBe(10);
    }
  });

  it("rejects missing educationUuid", () => {
    expect(
      updateEducationSchema.safeParse({ universityId: 1 }).success,
    ).toBe(false);
  });

  it("rejects empty educationUuid", () => {
    expect(
      updateEducationSchema.safeParse({
        educationUuid: "",
        universityId: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects missing universityId", () => {
    expect(
      updateEducationSchema.safeParse({ educationUuid: "edu_abc" }).success,
    ).toBe(false);
  });

  it("accepts optional fields omitted", () => {
    const r = updateEducationSchema.safeParse({
      educationUuid: "edu_abc",
      universityId: 1,
    });
    expect(r.success).toBe(true);
  });
});

describe("deleteEducationSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      deleteEducationSchema.safeParse({ educationUuid: "edu_xyz" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(deleteEducationSchema.safeParse({ educationUuid: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing UUID", () => {
    expect(deleteEducationSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("educationItemOutputSchema", () => {
  const validItem = {
    education_uuid: "edu_abc123",
    university_id: 5,
    university_name_en: "Kuwait University",
    university_name_ar: "جامعة الكويت",
    degree_uuid: "deg_001",
    degree_name_en: "Bachelor's",
    degree_name_ar: "بكالوريوس",
    major_uuid: "maj_001",
    major_name_en: "Computer Science",
    major_name_ar: "علوم الحاسوب",
    graduation_year: 2024,
    is_currently_studying: false,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-06-01"),
  };

  it("accepts a valid education item", () => {
    const r = educationItemOutputSchema.safeParse(validItem);
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = educationItemOutputSchema.safeParse({
      ...validItem,
      university_name_en: null,
      degree_name_ar: null,
      major_name_en: null,
      graduation_year: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing education_uuid", () => {
    const { education_uuid, ...without } = validItem;
    expect(educationItemOutputSchema.safeParse(without).success).toBe(false);
  });

  it("rejects wrong type for university_id", () => {
    expect(
      educationItemOutputSchema.safeParse({ ...validItem, university_id: "abc" })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for is_currently_studying", () => {
    expect(
      educationItemOutputSchema.safeParse({
        ...validItem,
        is_currently_studying: "yes",
      }).success,
    ).toBe(false);
  });
});

describe("educationListOutputSchema", () => {
  it("accepts an array of valid items", () => {
    const r = educationListOutputSchema.safeParse([
      {
        education_uuid: "edu_001",
        university_id: 1,
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
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts empty array", () => {
    expect(educationListOutputSchema.safeParse([]).success).toBe(true);
  });

  it("rejects non-array", () => {
    expect(educationListOutputSchema.safeParse(null).success).toBe(false);
  });
});

describe("educationActionResultOutputSchema", () => {
  it("accepts success result", () => {
    const r = educationActionResultOutputSchema.safeParse({
      success: true as const,
      educationUuid: "edu_abc",
    });
    expect(r.success).toBe(true);
  });

  it("accepts failure result", () => {
    const r = educationActionResultOutputSchema.safeParse({
      success: false as const,
      error: "University not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects success without educationUuid", () => {
    expect(
      educationActionResultOutputSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects invalid success value", () => {
    expect(
      educationActionResultOutputSchema.safeParse({
        success: true,
        educationUuid: 123,
      }).success,
    ).toBe(false);
  });

  it("rejects failure without error", () => {
    expect(
      educationActionResultOutputSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });
});
