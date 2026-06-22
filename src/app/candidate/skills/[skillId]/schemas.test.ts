import { describe, it, expect } from "vitest";
import {
  getSkillSchema,
  updateSkillSchema,
  deleteSkillSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema validation tests — candidate/skills/[skillId]
// ---------------------------------------------------------------------------
// These schemas are re-exported from the parent skills/schemas.ts.

describe("getSkillSchema", () => {
  it("accepts a valid skill ID", () => {
    expect(getSkillSchema.safeParse({ skillId: 1 }).success).toBe(true);
  });

  it("accepts string skill ID (coerced)", () => {
    expect(getSkillSchema.safeParse({ skillId: "1" }).success).toBe(true);
  });

  it("rejects missing skillId", () => {
    expect(getSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero skillId", () => {
    expect(getSkillSchema.safeParse({ skillId: 0 }).success).toBe(false);
  });

  it("rejects negative skillId", () => {
    expect(getSkillSchema.safeParse({ skillId: -1 }).success).toBe(false);
  });
});

describe("updateSkillSchema", () => {
  it("accepts a valid update", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 1, skill: "JavaScript" }).success,
    ).toBe(true);
  });

  it("trims whitespace from skill name", () => {
    const result = updateSkillSchema.safeParse({
      skillId: 1,
      skill: "  JavaScript  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skill).toBe("JavaScript");
    }
  });

  it("rejects missing skillId", () => {
    expect(updateSkillSchema.safeParse({ skill: "JS" }).success).toBe(false);
  });

  it("rejects empty skill name", () => {
    expect(updateSkillSchema.safeParse({ skillId: 1, skill: "" }).success).toBe(
      false,
    );
  });

  it("rejects skill name over 128 characters", () => {
    expect(
      updateSkillSchema.safeParse({
        skillId: 1,
        skill: "A".repeat(129),
      }).success,
    ).toBe(false);
  });
});

describe("deleteSkillSchema", () => {
  it("accepts a valid skill ID", () => {
    expect(deleteSkillSchema.safeParse({ skillId: 1 }).success).toBe(true);
  });

  it("rejects missing skillId", () => {
    expect(deleteSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero skillId", () => {
    expect(deleteSkillSchema.safeParse({ skillId: 0 }).success).toBe(false);
  });
});
