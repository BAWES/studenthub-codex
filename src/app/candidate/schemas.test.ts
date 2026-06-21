import { describe, it, expect } from "vitest";
import {
  getCandidateProfileSchema,
  candidateProfileMetricSchema,
  candidateProfileListItemSchema,
  candidateProfileOutputSchema,
  educationItemOutputSchema,
  educationListOutputSchema,
  educationActionResultOutputSchema,
  experienceItemSchema,
  experienceActionResultSchema,
  experienceListOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getCandidateProfileSchema tests
// ---------------------------------------------------------------------------

describe("getCandidateProfileSchema", () => {
  it("accepts valid candidate ID", () => {
    const r = getCandidateProfileSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });

  it("coerces string candidate ID to number", () => {
    const r = getCandidateProfileSchema.safeParse({ candidateId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateProfileSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero candidateId", () => {
    expect(
      getCandidateProfileSchema.safeParse({ candidateId: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(
      getCandidateProfileSchema.safeParse({ candidateId: -1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateProfileMetricSchema tests
// ---------------------------------------------------------------------------

describe("candidateProfileMetricSchema", () => {
  const validMetric = {
    label: "Applications",
    value: 10,
    note: "Total applications submitted",
  };

  it("accepts valid metric with number value", () => {
    expect(
      candidateProfileMetricSchema.safeParse(validMetric).success,
    ).toBe(true);
  });

  it("accepts valid metric with string value", () => {
    expect(
      candidateProfileMetricSchema.safeParse({
        ...validMetric,
        value: "10+",
      }).success,
    ).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(candidateProfileMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validMetric;
    expect(candidateProfileMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing note", () => {
    const { note: _, ...rest } = validMetric;
    expect(candidateProfileMetricSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateProfileListItemSchema tests
// ---------------------------------------------------------------------------

describe("candidateProfileListItemSchema", () => {
  const validItem = {
    id: 1,
    title: "Job Application",
    subtitle: "Software Engineer",
    meta: "Pending",
    href: "/applications/1",
    status: 1,
  };

  it("accepts valid item with all fields", () => {
    expect(
      candidateProfileListItemSchema.safeParse(validItem).success,
    ).toBe(true);
  });

  it("accepts item with string id", () => {
    expect(
      candidateProfileListItemSchema.safeParse({
        ...validItem,
        id: "uuid-123",
      }).success,
    ).toBe(true);
  });

  it("accepts item without optional fields (href, status)", () => {
    const { href: _, status: _s, ...minimal } = validItem;
    expect(
      candidateProfileListItemSchema.safeParse(minimal).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validItem;
    expect(candidateProfileListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validItem;
    expect(candidateProfileListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing subtitle", () => {
    const { subtitle: _, ...rest } = validItem;
    expect(candidateProfileListItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateProfileOutputSchema tests
// ---------------------------------------------------------------------------

describe("candidateProfileOutputSchema", () => {
  const validProfile = {
    candidate: { id: 1, name: "John" },
    metrics: [{ label: "Apps", value: 5, note: "Total" }],
    invitations: [{ id: 1, title: "Inv", subtitle: "Sub", meta: "M" }],
    workHours: [{ id: 1, title: "WH", subtitle: "Sub", meta: "M" }],
    histories: [{ id: 1, title: "H", subtitle: "Sub", meta: "M" }],
    notes: [{ id: 1, title: "N", subtitle: "Sub", meta: "M" }],
    skills: [{ id: 1, title: "S", subtitle: "Sub", meta: "M" }],
    tags: [{ id: 1, title: "T", subtitle: "Sub", meta: "M" }],
    warnings: [{ id: 1, title: "W", subtitle: "Sub", meta: "M" }],
    links: [{ id: 1, title: "L", subtitle: "Sub", meta: "M" }],
    idCards: [{ id: 1, title: "IC", subtitle: "Sub", meta: "M" }],
    applications: [{ id: 1, title: "A", subtitle: "Sub", meta: "M" }],
    interviews: [{ id: 1, title: "Int", subtitle: "Sub", meta: "M" }],
    suggestions: [{ id: 1, title: "Sug", subtitle: "Sub", meta: "M" }],
    education: [{ id: 1, title: "E", subtitle: "Sub", meta: "M" }],
    experiences: [{ id: 1, title: "Exp", subtitle: "Sub", meta: "M" }],
    certificates: [{ id: 1, title: "C", subtitle: "Sub", meta: "M" }],
    languages: [{ id: 1, title: "Lang", subtitle: "Sub", meta: "M" }],
    stats: { total: 100 },
  };

  it("accepts valid profile with all fields", () => {
    expect(
      candidateProfileOutputSchema.safeParse(validProfile).success,
    ).toBe(true);
  });

  it("accepts candidate as null", () => {
    expect(
      candidateProfileOutputSchema.safeParse({
        ...validProfile,
        candidate: null,
      }).success,
    ).toBe(true);
  });

  it("accepts stats as null", () => {
    expect(
      candidateProfileOutputSchema.safeParse({
        ...validProfile,
        stats: null,
      }).success,
    ).toBe(true);
  });

  it("accepts optional educationEntries", () => {
    expect(
      candidateProfileOutputSchema.safeParse({
        ...validProfile,
        educationEntries: [{ id: 1 }],
      }).success,
    ).toBe(true);
  });

  it("accepts empty metrics array (z.array() without .min() accepts empty)", () => {
    expect(
      candidateProfileOutputSchema.safeParse({
        ...validProfile,
        metrics: [],
      }).success,
    ).toBe(true);
  });

  it("accepts missing candidate (z.any().nullable() accepts undefined)", () => {
    const { candidate: _, ...rest } = validProfile;
    expect(candidateProfileOutputSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects invalid item in metrics array", () => {
    expect(
      candidateProfileOutputSchema.safeParse({
        ...validProfile,
        metrics: [{ label: "Only label" }],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// educationItemOutputSchema tests
// ---------------------------------------------------------------------------

describe("educationItemOutputSchema", () => {
  const validItem = {
    education_uuid: "edu_abc-123",
    university_id: 42,
    university_name_en: "Harvard",
    university_name_ar: null,
    degree_uuid: null,
    degree_name_en: null,
    degree_name_ar: null,
    major_uuid: null,
    major_name_en: null,
    major_name_ar: null,
    graduation_year: 2024,
    is_currently_studying: false,
    created_at: null,
    updated_at: null,
  };

  it("accepts valid education item with all fields", () => {
    expect(educationItemOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null string fields", () => {
    expect(
      educationItemOutputSchema.safeParse({
        ...validItem,
        university_name_en: null,
        university_name_ar: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null dates", () => {
    expect(
      educationItemOutputSchema.safeParse({
        ...validItem,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("accepts valid dates", () => {
    expect(
      educationItemOutputSchema.safeParse({
        ...validItem,
        created_at: new Date("2026-01-01"),
        updated_at: new Date("2026-06-01"),
      }).success,
    ).toBe(true);
  });

  it("rejects missing education_uuid", () => {
    const { education_uuid: _, ...rest } = validItem;
    expect(educationItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing university_id", () => {
    const { university_id: _, ...rest } = validItem;
    expect(educationItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing is_currently_studying", () => {
    const { is_currently_studying: _, ...rest } = validItem;
    expect(educationItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string instead of number for university_id", () => {
    expect(
      educationItemOutputSchema.safeParse({
        ...validItem,
        university_id: "42",
      }).success,
    ).toBe(false);
  });

  it("rejects string instead of boolean for is_currently_studying", () => {
    expect(
      educationItemOutputSchema.safeParse({
        ...validItem,
        is_currently_studying: "true",
      }).success,
    ).toBe(false);
  });

  it("rejects float for university_id", () => {
    expect(
      educationItemOutputSchema.safeParse({
        ...validItem,
        university_id: 42.5,
      }).success,
    ).toBe(false);
  });

  it("rejects string for graduation_year", () => {
    expect(
      educationItemOutputSchema.safeParse({
        ...validItem,
        graduation_year: "2024",
      }).success,
    ).toBe(false);
  });

  it("rejects string for created_at", () => {
    expect(
      educationItemOutputSchema.safeParse({
        ...validItem,
        created_at: "2026-01-01",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// educationListOutputSchema tests
// ---------------------------------------------------------------------------

describe("educationListOutputSchema", () => {
  const validItem = {
    education_uuid: "edu_abc-123",
    university_id: 42,
    university_name_en: "Harvard",
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
  };

  it("accepts non-empty array", () => {
    expect(
      educationListOutputSchema.safeParse([validItem]).success,
    ).toBe(true);
  });

  it("accepts empty array", () => {
    expect(educationListOutputSchema.safeParse([]).success).toBe(true);
  });

  it("accepts multiple items", () => {
    expect(
      educationListOutputSchema.safeParse([validItem, validItem]).success,
    ).toBe(true);
  });

  it("rejects invalid item in array", () => {
    expect(
      educationListOutputSchema.safeParse([
        { education_uuid: "missing-fields" },
      ]).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// educationActionResultOutputSchema tests (discriminatedUnion on "success")
// ---------------------------------------------------------------------------

describe("educationActionResultOutputSchema", () => {
  it("accepts success result with educationUuid", () => {
    const r = educationActionResultOutputSchema.safeParse({
      success: true,
      educationUuid: "edu_abc-123",
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result with error message", () => {
    const r = educationActionResultOutputSchema.safeParse({
      success: false,
      error: "Something went wrong",
    });
    expect(r.success).toBe(true);
  });

  it("rejects success result without educationUuid", () => {
    expect(
      educationActionResultOutputSchema.safeParse({
        success: true,
      }).success,
    ).toBe(false);
  });

  it("rejects error result without error", () => {
    expect(
      educationActionResultOutputSchema.safeParse({
        success: false,
      }).success,
    ).toBe(false);
  });

  it("rejects error result without error", () => {
    expect(
      educationActionResultOutputSchema.safeParse({
        success: false,
      }).success,
    ).toBe(false);
  });

  it("accepts success with extra error field (Zod strips unknown keys)", () => {
    expect(
      educationActionResultOutputSchema.safeParse({
        success: true,
        educationUuid: "edu_1",
        error: "should not be here",
      }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// experienceItemSchema tests
// ---------------------------------------------------------------------------

describe("experienceItemSchema", () => {
  const validItem = {
    candidate_experience_id: 1,
    candidate_id: 42,
    experience: "Software Engineer at Acme",
    employer: "Acme Corp",
    start_year: 2020,
    end_year: 2023,
    created_at: null,
  };

  it("accepts valid experience item with all fields", () => {
    expect(experienceItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null optional fields", () => {
    expect(
      experienceItemSchema.safeParse({
        ...validItem,
        candidate_id: null,
        employer: null,
        start_year: null,
        end_year: null,
        created_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_experience_id", () => {
    const { candidate_experience_id: _, ...rest } = validItem;
    expect(experienceItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing experience", () => {
    const { experience: _, ...rest } = validItem;
    expect(experienceItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty experience string", () => {
    expect(
      experienceItemSchema.safeParse({
        ...validItem,
        experience: "",
      }).success,
    ).toBe(false);
  });

  it("rejects string for candidate_experience_id", () => {
    expect(
      experienceItemSchema.safeParse({
        ...validItem,
        candidate_experience_id: "1",
      }).success,
    ).toBe(false);
  });

  it("rejects string for start_year", () => {
    expect(
      experienceItemSchema.safeParse({
        ...validItem,
        start_year: "2020",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// experienceActionResultSchema tests (discriminatedUnion on "success")
// ---------------------------------------------------------------------------

describe("experienceActionResultSchema", () => {
  it("accepts success result with experienceId", () => {
    const r = experienceActionResultSchema.safeParse({
      success: true,
      experienceId: 42,
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result with error message", () => {
    const r = experienceActionResultSchema.safeParse({
      success: false,
      error: "Failed to create experience",
    });
    expect(r.success).toBe(true);
  });

  it("rejects success result without experienceId", () => {
    expect(
      experienceActionResultSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error result without error", () => {
    expect(
      experienceActionResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: true,
        experienceId: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative experienceId", () => {
    expect(
      experienceActionResultSchema.safeParse({
        success: true,
        experienceId: -1,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// experienceListOutputSchema tests
// ---------------------------------------------------------------------------

describe("experienceListOutputSchema", () => {
  const validItem = {
    candidate_experience_id: 1,
    candidate_id: null,
    experience: "Engineer",
    employer: null,
    start_year: null,
    end_year: null,
    created_at: null,
  };

  it("accepts non-empty array", () => {
    expect(experienceListOutputSchema.safeParse([validItem]).success).toBe(
      true,
    );
  });

  it("accepts empty array", () => {
    expect(experienceListOutputSchema.safeParse([]).success).toBe(true);
  });

  it("rejects invalid item in array", () => {
    expect(
      experienceListOutputSchema.safeParse([
        { candidate_experience_id: 1 },
      ]).success,
    ).toBe(false);
  });
});
