import { describe, it, expect } from "vitest";
import {
  updateSkillSchema,
  skillActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema validation tests — candidate/skills/[skillId]/edit
// ---------------------------------------------------------------------------

describe("updateSkillSchema (edit route)", () => {
  it("accepts a valid update", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 1, skill: "TypeScript" }).success,
    ).toBe(true);
  });

  it("accepts string skill ID (coerced)", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: "1", skill: "TypeScript" })
        .success,
    ).toBe(true);
  });

  it("trims whitespace from skill name", () => {
    const result = updateSkillSchema.safeParse({
      skillId: 1,
      skill: "  TypeScript  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skill).toBe("TypeScript");
    }
  });

  it("rejects missing skillId", () => {
    expect(
      updateSkillSchema.safeParse({ skill: "TypeScript" }).success,
    ).toBe(false);
  });

  it("rejects empty skill name", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 1, skill: "" }).success,
    ).toBe(false);
  });

  it("rejects skill name over 128 characters", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 1, skill: "A".repeat(129) })
        .success,
    ).toBe(false);
  });
});

describe("skillActionResultOutputSchema (edit route)", () => {
  it("accepts success result", () => {
    expect(
      skillActionResultOutputSchema.safeParse({
        success: true,
        skillId: 1,
      }).success,
    ).toBe(true);
  });

  it("accepts failure result", () => {
    expect(
      skillActionResultOutputSchema.safeParse({
        success: false,
        error: "Skill not found",
      }).success,
    ).toBe(true);
  });

  it("rejects missing skillId on success", () => {
    expect(
      skillActionResultOutputSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects missing error on failure", () => {
    expect(
      skillActionResultOutputSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects invalid discriminant", () => {
    expect(
      skillActionResultOutputSchema.safeParse({ success: "yes" }).success,
    ).toBe(false);
  });
});
