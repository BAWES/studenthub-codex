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
  it("accepts a valid numeric studentId", () => {
    const result = getStudentProfileSchema.safeParse({ studentId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.studentId).toBe(42);
    }
  });

  it("accepts a direct numeric studentId", () => {
    const result = getStudentProfileSchema.safeParse({ studentId: 99 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.studentId).toBe(99);
    }
  });

  it("rejects zero studentId", () => {
    const result = getStudentProfileSchema.safeParse({ studentId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative studentId", () => {
    const result = getStudentProfileSchema.safeParse({ studentId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric studentId", () => {
    const result = getStudentProfileSchema.safeParse({ studentId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing studentId", () => {
    const result = getStudentProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateStudentProfileSchema
// ---------------------------------------------------------------------------

describe("updateStudentProfileSchema", () => {
  it("requires at least a studentId", () => {
    const result = updateStudentProfileSchema.safeParse({ studentId: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = updateStudentProfileSchema.safeParse({
      studentId: 1,
      name: "Ahmed Al-Rashid",
      objective: "Seeking software engineering placement",
      intro: "Computer science student with focus on full-stack development",
      phone: "+965 5000 0000",
      address: "Kuwait City",
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero studentId", () => {
    const result = updateStudentProfileSchema.safeParse({ studentId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 255 chars", () => {
    const result = updateStudentProfileSchema.safeParse({
      studentId: 1,
      name: "A".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("rejects phone exceeding 20 chars", () => {
    const result = updateStudentProfileSchema.safeParse({
      studentId: 1,
      phone: "+965 5000 0000 9999 8888",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name field (min 1 char)", () => {
    const result = updateStudentProfileSchema.safeParse({
      studentId: 1,
      name: "",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listSkillsSchema
// ---------------------------------------------------------------------------

describe("listSkillsSchema", () => {
  it("accepts a valid studentId", () => {
    const result = listSkillsSchema.safeParse({ studentId: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.studentId).toBe(5);
    }
  });

  it("rejects zero studentId", () => {
    const result = listSkillsSchema.safeParse({ studentId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative studentId", () => {
    const result = listSkillsSchema.safeParse({ studentId: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addSkillSchema
// ---------------------------------------------------------------------------

describe("addSkillSchema", () => {
  it("accepts a valid skill entry", () => {
    const result = addSkillSchema.safeParse({
      studentId: 1,
      skill: "TypeScript",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty skill name", () => {
    const result = addSkillSchema.safeParse({
      studentId: 1,
      skill: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects skill name exceeding 128 chars", () => {
    const result = addSkillSchema.safeParse({
      studentId: 1,
      skill: "A".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero studentId", () => {
    const result = addSkillSchema.safeParse({
      studentId: 0,
      skill: "React",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from skill name", () => {
    const result = addSkillSchema.safeParse({
      studentId: 1,
      skill: "  Python  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skill).toBe("  Python  ");
    }
  });
});

// ---------------------------------------------------------------------------
// removeSkillSchema
// ---------------------------------------------------------------------------

describe("removeSkillSchema", () => {
  it("accepts a valid positive skillId", () => {
    const result = removeSkillSchema.safeParse({ skillId: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skillId).toBe(3);
    }
  });

  it("rejects zero skillId", () => {
    const result = removeSkillSchema.safeParse({ skillId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative skillId", () => {
    const result = removeSkillSchema.safeParse({ skillId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric skillId", () => {
    const result = removeSkillSchema.safeParse({ skillId: "xyz" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listExperienceSchema
// ---------------------------------------------------------------------------

describe("listExperienceSchema", () => {
  it("accepts a valid studentId", () => {
    const result = listExperienceSchema.safeParse({ studentId: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.studentId).toBe(10);
    }
  });

  it("rejects zero studentId", () => {
    const result = listExperienceSchema.safeParse({ studentId: 0 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addExperienceSchema
// ---------------------------------------------------------------------------

describe("addExperienceSchema", () => {
  it("accepts a valid experience with title only", () => {
    const result = addExperienceSchema.safeParse({
      studentId: 1,
      experience: "Software Engineer Intern",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a full experience entry", () => {
    const result = addExperienceSchema.safeParse({
      studentId: 1,
      experience: "Junior Developer",
      employer: "Kuwait Tech Solutions",
      startYear: 2024,
      endYear: 2025,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty experience title", () => {
    const result = addExperienceSchema.safeParse({
      studentId: 1,
      experience: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects experience title exceeding 128 chars", () => {
    const result = addExperienceSchema.safeParse({
      studentId: 1,
      experience: "A".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero studentId", () => {
    const result = addExperienceSchema.safeParse({
      studentId: 0,
      experience: "Intern",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateExperienceSchema
// ---------------------------------------------------------------------------

describe("updateExperienceSchema", () => {
  it("requires at least experienceId", () => {
    const result = updateExperienceSchema.safeParse({ experienceId: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts a full update", () => {
    const result = updateExperienceSchema.safeParse({
      experienceId: 1,
      experience: "Senior Developer",
      employer: "Kuwait Fintech Co",
      startYear: 2023,
      endYear: 2026,
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero experienceId", () => {
    const result = updateExperienceSchema.safeParse({ experienceId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects experience title exceeding 128 chars", () => {
    const result = updateExperienceSchema.safeParse({
      experienceId: 1,
      experience: "A".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("accepts partial update with only employer change", () => {
    const result = updateExperienceSchema.safeParse({
      experienceId: 1,
      employer: "New Company",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty optional employer (will be trimmed)", () => {
    const result = updateExperienceSchema.safeParse({
      experienceId: 1,
      employer: "",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// removeExperienceSchema
// ---------------------------------------------------------------------------

describe("removeExperienceSchema", () => {
  it("accepts a valid positive experienceId", () => {
    const result = removeExperienceSchema.safeParse({ experienceId: "7" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experienceId).toBe(7);
    }
  });

  it("rejects zero experienceId", () => {
    const result = removeExperienceSchema.safeParse({ experienceId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative experienceId", () => {
    const result = removeExperienceSchema.safeParse({ experienceId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric experienceId", () => {
    const result = removeExperienceSchema.safeParse({ experienceId: "abc" });
    expect(result.success).toBe(false);
  });
});
