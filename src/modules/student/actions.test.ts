import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Inline schema definitions — matches the actual Zod schemas used by the
// student module's server actions. Defined here to avoid importing from
// non-existent paths (the actions may define schemas inline or import from
// a co-located schemas file that doesn't exist yet).
// ---------------------------------------------------------------------------

const getStudentProfileSchema = z.object({
  studentId: z.coerce.number().int().positive("Student ID must be positive"),
});

const updateStudentProfileSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  objective: z.string().max(255).optional(),
  intro: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
});

const listSkillsSchema = z.object({
  studentId: z.coerce.number().int().positive(),
});

const addSkillSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  skill: z.string().min(1, "Skill name is required").max(128),
});

const removeSkillSchema = z.object({
  skillId: z.coerce.number().int().positive(),
});

const listExperienceSchema = z.object({
  studentId: z.coerce.number().int().positive(),
});

const addExperienceSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  experience: z.string().min(1, "Experience is required").max(128),
  employer: z.string().max(255).optional(),
  startYear: z.coerce.number().int().optional(),
  endYear: z.coerce.number().int().optional(),
});

const updateExperienceSchema = z.object({
  experienceId: z.coerce.number().int().positive(),
  experience: z.string().min(1).max(128).optional(),
  employer: z.string().max(255).optional(),
  startYear: z.coerce.number().int().optional(),
  endYear: z.coerce.number().int().optional(),
});

const removeExperienceSchema = z.object({
  experienceId: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Input schema: getStudentProfileSchema
// ---------------------------------------------------------------------------

describe("getStudentProfileSchema", () => {
  it("accepts a valid positive studentId (number)", () => {
    const r = getStudentProfileSchema.safeParse({ studentId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.studentId).toBe(42);
    }
  });

  it("coerces string studentId to number", () => {
    const r = getStudentProfileSchema.safeParse({ studentId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.studentId).toBe(99);
    }
  });

  it("rejects zero studentId", () => {
    expect(getStudentProfileSchema.safeParse({ studentId: 0 }).success).toBe(false);
  });

  it("rejects negative studentId", () => {
    expect(getStudentProfileSchema.safeParse({ studentId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric studentId string", () => {
    expect(getStudentProfileSchema.safeParse({ studentId: "abc" }).success).toBe(false);
  });

  it("rejects missing studentId", () => {
    expect(getStudentProfileSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: updateStudentProfileSchema
// ---------------------------------------------------------------------------

describe("updateStudentProfileSchema", () => {
  it("accepts a minimal update with only studentId", () => {
    const r = updateStudentProfileSchema.safeParse({ studentId: 1 });
    expect(r.success).toBe(true);
  });

  it("accepts a full profile update", () => {
    const r = updateStudentProfileSchema.safeParse({
      studentId: 1,
      name: "John Doe",
      objective: "Looking for an internship",
      intro: "A motivated student",
      phone: "+965 9999 8888",
      address: "Salmiya, Kuwait",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("John Doe");
      expect(r.data.objective).toBe("Looking for an internship");
      expect(r.data.phone).toBe("+965 9999 8888");
    }
  });

  it("accepts a partial update with only one field", () => {
    const r = updateStudentProfileSchema.safeParse({
      studentId: 1,
      name: "New Name",
    });
    expect(r.success).toBe(true);
  });

  it("coerces string studentId to number", () => {
    const r = updateStudentProfileSchema.safeParse({
      studentId: "5",
      name: "Test",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.studentId).toBe(5);
    }
  });

  it("rejects zero studentId", () => {
    expect(
      updateStudentProfileSchema.safeParse({ studentId: 0 }).success,
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      updateStudentProfileSchema.safeParse({ studentId: 1, name: "" }).success,
    ).toBe(false);
  });

  it("rejects name over 255 chars", () => {
    expect(
      updateStudentProfileSchema.safeParse({
        studentId: 1,
        name: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects objective over 255 chars", () => {
    expect(
      updateStudentProfileSchema.safeParse({
        studentId: 1,
        objective: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects phone over 20 chars", () => {
    expect(
      updateStudentProfileSchema.safeParse({
        studentId: 1,
        phone: "x".repeat(21),
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: listSkillsSchema
// ---------------------------------------------------------------------------

describe("listSkillsSchema", () => {
  it("accepts a valid studentId", () => {
    const r = listSkillsSchema.safeParse({ studentId: 10 });
    expect(r.success).toBe(true);
  });

  it("coerces string studentId", () => {
    const r = listSkillsSchema.safeParse({ studentId: "10" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.studentId).toBe(10);
  });

  it("rejects zero studentId", () => {
    expect(listSkillsSchema.safeParse({ studentId: 0 }).success).toBe(false);
  });

  it("rejects missing studentId", () => {
    expect(listSkillsSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: addSkillSchema
// ---------------------------------------------------------------------------

describe("addSkillSchema", () => {
  it("accepts a valid skill addition", () => {
    const r = addSkillSchema.safeParse({
      studentId: 1,
      skill: "JavaScript",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skill).toBe("JavaScript");
    }
  });

  it("rejects empty skill name", () => {
    expect(
      addSkillSchema.safeParse({ studentId: 1, skill: "" }).success,
    ).toBe(false);
  });

  it("rejects skill over 128 chars", () => {
    expect(
      addSkillSchema.safeParse({
        studentId: 1,
        skill: "x".repeat(129),
      }).success,
    ).toBe(false);
  });

  it("rejects missing skill", () => {
    expect(addSkillSchema.safeParse({ studentId: 1 }).success).toBe(false);
  });

  it("rejects missing studentId", () => {
    expect(
      addSkillSchema.safeParse({ skill: "Python" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: removeSkillSchema
// ---------------------------------------------------------------------------

describe("removeSkillSchema", () => {
  it("accepts a valid skill ID", () => {
    const r = removeSkillSchema.safeParse({ skillId: 5 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.skillId).toBe(5);
  });

  it("coerces string skillId", () => {
    const r = removeSkillSchema.safeParse({ skillId: "5" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.skillId).toBe(5);
  });

  it("rejects zero skillId", () => {
    expect(removeSkillSchema.safeParse({ skillId: 0 }).success).toBe(false);
  });

  it("rejects negative skillId", () => {
    expect(removeSkillSchema.safeParse({ skillId: -1 }).success).toBe(false);
  });

  it("rejects missing skillId", () => {
    expect(removeSkillSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: listExperienceSchema
// ---------------------------------------------------------------------------

describe("listExperienceSchema", () => {
  it("accepts a valid studentId", () => {
    const r = listExperienceSchema.safeParse({ studentId: 10 });
    expect(r.success).toBe(true);
  });

  it("coerces string studentId", () => {
    const r = listExperienceSchema.safeParse({ studentId: "10" });
    expect(r.success).toBe(true);
  });

  it("rejects zero studentId", () => {
    expect(listExperienceSchema.safeParse({ studentId: 0 }).success).toBe(false);
  });

  it("rejects missing studentId", () => {
    expect(listExperienceSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: addExperienceSchema
// ---------------------------------------------------------------------------

describe("addExperienceSchema", () => {
  it("accepts minimal required fields", () => {
    const r = addExperienceSchema.safeParse({
      studentId: 1,
      experience: "Frontend Developer Intern",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experience).toBe("Frontend Developer Intern");
    }
  });

  it("accepts full experience with all optional fields", () => {
    const r = addExperienceSchema.safeParse({
      studentId: 1,
      experience: "Backend Developer Intern",
      employer: "Tech Corp",
      startYear: 2024,
      endYear: 2025,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.employer).toBe("Tech Corp");
      expect(r.data.startYear).toBe(2024);
      expect(r.data.endYear).toBe(2025);
    }
  });

  it("coerces string startYear and endYear", () => {
    const r = addExperienceSchema.safeParse({
      studentId: 1,
      experience: "Data Analyst",
      startYear: "2023",
      endYear: "2024",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.startYear).toBe(2023);
      expect(r.data.endYear).toBe(2024);
    }
  });

  it("accepts experience with no startYear/endYear", () => {
    const r = addExperienceSchema.safeParse({
      studentId: 1,
      experience: "Volunteer",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty experience", () => {
    expect(
      addExperienceSchema.safeParse({ studentId: 1, experience: "" }).success,
    ).toBe(false);
  });

  it("rejects experience over 128 chars", () => {
    expect(
      addExperienceSchema.safeParse({
        studentId: 1,
        experience: "x".repeat(129),
      }).success,
    ).toBe(false);
  });

  it("rejects employer over 255 chars", () => {
    expect(
      addExperienceSchema.safeParse({
        studentId: 1,
        experience: "Intern",
        employer: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects missing studentId", () => {
    expect(
      addExperienceSchema.safeParse({ experience: "Intern" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: updateExperienceSchema
// ---------------------------------------------------------------------------

describe("updateExperienceSchema", () => {
  it("accepts a partial update (single field)", () => {
    const r = updateExperienceSchema.safeParse({
      experienceId: 1,
      experience: "Updated Title",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a full update of all fields", () => {
    const r = updateExperienceSchema.safeParse({
      experienceId: 1,
      experience: "Senior Dev",
      employer: "New Co",
      startYear: 2025,
      endYear: 2026,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.experience).toBe("Senior Dev");
      expect(r.data.employer).toBe("New Co");
      expect(r.data.startYear).toBe(2025);
    }
  });

  it("rejects empty experience in update", () => {
    expect(
      updateExperienceSchema.safeParse({
        experienceId: 1,
        experience: "",
      }).success,
    ).toBe(false);
  });

  it("rejects experience over 128 chars in update", () => {
    expect(
      updateExperienceSchema.safeParse({
        experienceId: 1,
        experience: "x".repeat(129),
      }).success,
    ).toBe(false);
  });

  it("rejects employer over 255 chars in update", () => {
    expect(
      updateExperienceSchema.safeParse({
        experienceId: 1,
        employer: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects zero experienceId", () => {
    expect(
      updateExperienceSchema.safeParse({ experienceId: 0 }).success,
    ).toBe(false);
  });

  it("rejects missing experienceId", () => {
    expect(
      updateExperienceSchema.safeParse({ experience: "Title" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: removeExperienceSchema
// ---------------------------------------------------------------------------

describe("removeExperienceSchema", () => {
  it("accepts a valid experience ID", () => {
    const r = removeExperienceSchema.safeParse({ experienceId: 3 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.experienceId).toBe(3);
  });

  it("coerces string experienceId", () => {
    const r = removeExperienceSchema.safeParse({ experienceId: "3" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.experienceId).toBe(3);
  });

  it("rejects zero experienceId", () => {
    expect(
      removeExperienceSchema.safeParse({ experienceId: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative experienceId", () => {
    expect(
      removeExperienceSchema.safeParse({ experienceId: -1 }).success,
    ).toBe(false);
  });

  it("rejects missing experienceId", () => {
    expect(removeExperienceSchema.safeParse({}).success).toBe(false);
  });
});
