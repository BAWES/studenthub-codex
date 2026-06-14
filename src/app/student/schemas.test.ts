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
  it("accepts valid input", () => {
    expect(getStudentProfileSchema.safeParse({ studentId: 42 }).success).toBe(true);
  });

  it("accepts string number (coerce)", () => {
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
});

// ---------------------------------------------------------------------------
// updateStudentProfileSchema
// ---------------------------------------------------------------------------
describe("updateStudentProfileSchema", () => {
  it("accepts minimal input (just studentId)", () => {
    expect(updateStudentProfileSchema.safeParse({ studentId: 1 }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      updateStudentProfileSchema.safeParse({
        studentId: 1,
        name: "John Doe",
        objective: "Seeking internship",
        intro: "Computer Science student",
        phone: "+965 5000 0000",
        address: "Kuwait City",
      }).success,
    ).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(updateStudentProfileSchema.safeParse({ name: "John" }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(updateStudentProfileSchema.safeParse({ studentId: 1, name: "" }).success).toBe(false);
  });

  it("rejects name exceeding 255 chars", () => {
    expect(
      updateStudentProfileSchema.safeParse({ studentId: 1, name: "x".repeat(256) }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listSkillsSchema
// ---------------------------------------------------------------------------
describe("listSkillsSchema", () => {
  it("accepts valid input", () => {
    expect(listSkillsSchema.safeParse({ studentId: 1 }).success).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(listSkillsSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addSkillSchema
// ---------------------------------------------------------------------------
describe("addSkillSchema", () => {
  it("accepts valid input", () => {
    expect(addSkillSchema.safeParse({ studentId: 1, skill: "JavaScript" }).success).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(addSkillSchema.safeParse({ skill: "JavaScript" }).success).toBe(false);
  });

  it("rejects missing skill", () => {
    expect(addSkillSchema.safeParse({ studentId: 1 }).success).toBe(false);
  });

  it("rejects empty skill", () => {
    expect(addSkillSchema.safeParse({ studentId: 1, skill: "" }).success).toBe(false);
  });

  it("rejects skill exceeding 128 chars", () => {
    expect(addSkillSchema.safeParse({ studentId: 1, skill: "x".repeat(129) }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// removeSkillSchema
// ---------------------------------------------------------------------------
describe("removeSkillSchema", () => {
  it("accepts valid input", () => {
    expect(removeSkillSchema.safeParse({ skillId: 1 }).success).toBe(true);
  });

  it("rejects missing skillId", () => {
    expect(removeSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero skillId", () => {
    expect(removeSkillSchema.safeParse({ skillId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listExperienceSchema
// ---------------------------------------------------------------------------
describe("listExperienceSchema", () => {
  it("accepts valid input", () => {
    expect(listExperienceSchema.safeParse({ studentId: 1 }).success).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(listExperienceSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addExperienceSchema
// ---------------------------------------------------------------------------
describe("addExperienceSchema", () => {
  it("accepts minimal valid input", () => {
    expect(addExperienceSchema.safeParse({ studentId: 1, experience: "Software Intern" }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      addExperienceSchema.safeParse({
        studentId: 1,
        experience: "Software Intern",
        employer: "Test Corp",
        startYear: 2024,
        endYear: 2025,
      }).success,
    ).toBe(true);
  });

  it("rejects missing studentId", () => {
    expect(addExperienceSchema.safeParse({ experience: "Intern" }).success).toBe(false);
  });

  it("rejects missing experience", () => {
    expect(addExperienceSchema.safeParse({ studentId: 1 }).success).toBe(false);
  });

  it("rejects empty experience", () => {
    expect(addExperienceSchema.safeParse({ studentId: 1, experience: "" }).success).toBe(false);
  });

  it("rejects experience exceeding 128 chars", () => {
    expect(
      addExperienceSchema.safeParse({ studentId: 1, experience: "x".repeat(129) }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateExperienceSchema
// ---------------------------------------------------------------------------
describe("updateExperienceSchema", () => {
  it("accepts minimal input (experienceId only)", () => {
    expect(updateExperienceSchema.safeParse({ experienceId: 1 }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      updateExperienceSchema.safeParse({
        experienceId: 1,
        experience: "Updated Title",
        employer: "New Corp",
        startYear: 2023,
        endYear: 2024,
      }).success,
    ).toBe(true);
  });

  it("rejects missing experienceId", () => {
    expect(updateExperienceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty experience", () => {
    expect(updateExperienceSchema.safeParse({ experienceId: 1, experience: "" }).success).toBe(false);
  });

  it("rejects experience exceeding 128 chars", () => {
    expect(
      updateExperienceSchema.safeParse({ experienceId: 1, experience: "x".repeat(129) }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// removeExperienceSchema
// ---------------------------------------------------------------------------
describe("removeExperienceSchema", () => {
  it("accepts valid input", () => {
    expect(removeExperienceSchema.safeParse({ experienceId: 1 }).success).toBe(true);
  });

  it("rejects missing experienceId", () => {
    expect(removeExperienceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(removeExperienceSchema.safeParse({ experienceId: 0 }).success).toBe(false);
  });
});
