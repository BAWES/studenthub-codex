import { describe, it, expect } from "vitest";
import {
  getStudentProfileSchema,
  updateStudentProfileSchema,
  listSkillsSchema,
  addSkillSchema,
  removeSkillSchema,
  listExperienceSchema,
  addExperienceSchema,
  updateExperienceSchema,
  removeExperienceSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// getStudentProfileSchema
// ---------------------------------------------------------------------------
describe("getStudentProfileSchema", () => {
  it("accepts valid numeric input", () => {
    expect(getStudentProfileSchema.safeParse({ studentId: 42 }).success).toBe(true);
  });

  it("accepts string that coerces to number", () => {
    expect(getStudentProfileSchema.safeParse({ studentId: "42" }).success).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(getStudentProfileSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero studentId", () => {
    expect(getStudentProfileSchema.safeParse({ studentId: 0 }).success).toBe(false);
  });

  it("rejects negative studentId", () => {
    expect(getStudentProfileSchema.safeParse({ studentId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    expect(getStudentProfileSchema.safeParse({ studentId: "abc" }).success).toBe(false);
  });

  it("rejects null studentId", () => {
    expect(getStudentProfileSchema.safeParse({ studentId: null }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateStudentProfileSchema
// ---------------------------------------------------------------------------
describe("updateStudentProfileSchema", () => {
  it("accepts valid input with only studentId", () => {
    expect(updateStudentProfileSchema.safeParse({ studentId: 1 }).success).toBe(true);
  });

  it("accepts string studentId that coerces to number", () => {
    expect(updateStudentProfileSchema.safeParse({ studentId: "1" }).success).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    expect(
      updateStudentProfileSchema.safeParse({
        studentId: 1,
        name: "John Doe",
        objective: "Looking for a software engineering role",
        intro: "A brief introduction about myself.",
        phone: "+965 1234 5678",
        address: "Kuwait City, Kuwait",
      }).success,
    ).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(updateStudentProfileSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero studentId", () => {
    expect(updateStudentProfileSchema.safeParse({ studentId: 0 }).success).toBe(false);
  });

  it("rejects negative studentId", () => {
    expect(updateStudentProfileSchema.safeParse({ studentId: -5 }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(updateStudentProfileSchema.safeParse({ studentId: 1, name: "" }).success).toBe(false);
  });

  it("rejects name exceeding 255 chars", () => {
    expect(
      updateStudentProfileSchema.safeParse({ studentId: 1, name: "a".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects objective exceeding 255 chars", () => {
    expect(
      updateStudentProfileSchema.safeParse({ studentId: 1, objective: "a".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects phone exceeding 20 chars", () => {
    expect(
      updateStudentProfileSchema.safeParse({ studentId: 1, phone: "a".repeat(21) }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listSkillsSchema
// ---------------------------------------------------------------------------
describe("listSkillsSchema", () => {
  it("accepts valid numeric input", () => {
    expect(listSkillsSchema.safeParse({ studentId: 42 }).success).toBe(true);
  });

  it("accepts string that coerces to number", () => {
    expect(listSkillsSchema.safeParse({ studentId: "42" }).success).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(listSkillsSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero studentId", () => {
    expect(listSkillsSchema.safeParse({ studentId: 0 }).success).toBe(false);
  });

  it("rejects negative studentId", () => {
    expect(listSkillsSchema.safeParse({ studentId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    expect(listSkillsSchema.safeParse({ studentId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addSkillSchema
// ---------------------------------------------------------------------------
describe("addSkillSchema", () => {
  it("accepts valid input", () => {
    expect(
      addSkillSchema.safeParse({ studentId: 1, skill: "React" }).success,
    ).toBe(true);
  });

  it("accepts string studentId that coerces to number", () => {
    expect(
      addSkillSchema.safeParse({ studentId: "1", skill: "React" }).success,
    ).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(addSkillSchema.safeParse({ skill: "React" }).success).toBe(false);
  });

  it("rejects missing skill", () => {
    expect(addSkillSchema.safeParse({ studentId: 1 }).success).toBe(false);
  });

  it("rejects empty skill", () => {
    expect(addSkillSchema.safeParse({ studentId: 1, skill: "" }).success).toBe(false);
  });

  it("rejects skill exceeding 128 chars", () => {
    expect(
      addSkillSchema.safeParse({ studentId: 1, skill: "a".repeat(129) }).success,
    ).toBe(false);
  });

  it("rejects zero studentId", () => {
    expect(addSkillSchema.safeParse({ studentId: 0, skill: "React" }).success).toBe(false);
  });

  it("rejects non-string skill", () => {
    expect(addSkillSchema.safeParse({ studentId: 1, skill: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// removeSkillSchema
// ---------------------------------------------------------------------------
describe("removeSkillSchema", () => {
  it("accepts valid numeric input", () => {
    expect(removeSkillSchema.safeParse({ skillId: 42 }).success).toBe(true);
  });

  it("accepts string that coerces to number", () => {
    expect(removeSkillSchema.safeParse({ skillId: "42" }).success).toBe(true);
  });

  it("rejects missing skillId", () => {
    expect(removeSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero skillId", () => {
    expect(removeSkillSchema.safeParse({ skillId: 0 }).success).toBe(false);
  });

  it("rejects negative skillId", () => {
    expect(removeSkillSchema.safeParse({ skillId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    expect(removeSkillSchema.safeParse({ skillId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listExperienceSchema
// ---------------------------------------------------------------------------
describe("listExperienceSchema", () => {
  it("accepts valid numeric input", () => {
    expect(listExperienceSchema.safeParse({ studentId: 42 }).success).toBe(true);
  });

  it("accepts string that coerces to number", () => {
    expect(listExperienceSchema.safeParse({ studentId: "42" }).success).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(listExperienceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero studentId", () => {
    expect(listExperienceSchema.safeParse({ studentId: 0 }).success).toBe(false);
  });

  it("rejects negative studentId", () => {
    expect(listExperienceSchema.safeParse({ studentId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    expect(listExperienceSchema.safeParse({ studentId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addExperienceSchema
// ---------------------------------------------------------------------------
describe("addExperienceSchema", () => {
  it("accepts valid input with only required fields", () => {
    expect(
      addExperienceSchema.safeParse({ studentId: 1, experience: "Software Engineer" }).success,
    ).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    expect(
      addExperienceSchema.safeParse({
        studentId: 1,
        experience: "Software Engineer",
        employer: "Acme Corp",
        startYear: 2020,
        endYear: 2023,
      }).success,
    ).toBe(true);
  });

  it("accepts string studentId that coerces", () => {
    expect(
      addExperienceSchema.safeParse({ studentId: "1", experience: "Engineer" }).success,
    ).toBe(true);
  });

  it("accepts string startYear that coerces", () => {
    expect(
      addExperienceSchema.safeParse({
        studentId: 1,
        experience: "Engineer",
        startYear: "2020",
      }).success,
    ).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(addExperienceSchema.safeParse({ experience: "Engineer" }).success).toBe(false);
  });

  it("rejects missing experience", () => {
    expect(addExperienceSchema.safeParse({ studentId: 1 }).success).toBe(false);
  });

  it("rejects empty experience", () => {
    expect(addExperienceSchema.safeParse({ studentId: 1, experience: "" }).success).toBe(false);
  });

  it("rejects experience exceeding 128 chars", () => {
    expect(
      addExperienceSchema.safeParse({ studentId: 1, experience: "a".repeat(129) }).success,
    ).toBe(false);
  });

  it("rejects employer exceeding 255 chars", () => {
    expect(
      addExperienceSchema.safeParse({ studentId: 1, experience: "Engineer", employer: "a".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects zero studentId", () => {
    expect(addExperienceSchema.safeParse({ studentId: 0, experience: "Engineer" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateExperienceSchema
// ---------------------------------------------------------------------------
describe("updateExperienceSchema", () => {
  it("accepts valid input with only experienceId", () => {
    expect(updateExperienceSchema.safeParse({ experienceId: 1 }).success).toBe(true);
  });

  it("accepts valid input with all fields", () => {
    expect(
      updateExperienceSchema.safeParse({
        experienceId: 1,
        experience: "Senior Engineer",
        employer: "Acme Corp",
        startYear: 2020,
        endYear: 2023,
      }).success,
    ).toBe(true);
  });

  it("accepts string experienceId that coerces", () => {
    expect(updateExperienceSchema.safeParse({ experienceId: "1" }).success).toBe(true);
  });

  it("rejects missing experienceId", () => {
    expect(updateExperienceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(updateExperienceSchema.safeParse({ experienceId: 0 }).success).toBe(false);
  });

  it("rejects negative experienceId", () => {
    expect(updateExperienceSchema.safeParse({ experienceId: -1 }).success).toBe(false);
  });

  it("rejects empty experience", () => {
    expect(updateExperienceSchema.safeParse({ experienceId: 1, experience: "" }).success).toBe(false);
  });

  it("rejects experience exceeding 128 chars", () => {
    expect(
      updateExperienceSchema.safeParse({ experienceId: 1, experience: "a".repeat(129) }).success,
    ).toBe(false);
  });

  it("rejects employer exceeding 255 chars", () => {
    expect(
      updateExperienceSchema.safeParse({ experienceId: 1, employer: "a".repeat(256) }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// removeExperienceSchema
// ---------------------------------------------------------------------------
describe("removeExperienceSchema", () => {
  it("accepts valid numeric input", () => {
    expect(removeExperienceSchema.safeParse({ experienceId: 42 }).success).toBe(true);
  });

  it("accepts string that coerces to number", () => {
    expect(removeExperienceSchema.safeParse({ experienceId: "42" }).success).toBe(true);
  });

  it("rejects missing experienceId", () => {
    expect(removeExperienceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(removeExperienceSchema.safeParse({ experienceId: 0 }).success).toBe(false);
  });

  it("rejects negative experienceId", () => {
    expect(removeExperienceSchema.safeParse({ experienceId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric string", () => {
    expect(removeExperienceSchema.safeParse({ experienceId: "abc" }).success).toBe(false);
  });
});
