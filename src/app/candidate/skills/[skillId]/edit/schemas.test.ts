import { describe, it, expect } from "vitest";
import {
  updateSkillSchema,
  skillActionResultOutputSchema,
} from "./schemas";

describe("updateSkillSchema", () => {
  it("accepts valid input", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 1, skill: "TypeScript" }).success
    ).toBe(true);
  });

  it("accepts string-coercible skillId", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: "1", skill: "TypeScript" }).success
    ).toBe(true);
  });

  it("trims whitespace from skill name", () => {
    const result = updateSkillSchema.safeParse({ skillId: 1, skill: "  React  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skill).toBe("React");
    }
  });

  it("rejects empty object", () => {
    expect(updateSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects missing skillId", () => {
    expect(updateSkillSchema.safeParse({ skill: "TypeScript" }).success).toBe(false);
  });

  it("rejects missing skill", () => {
    expect(updateSkillSchema.safeParse({ skillId: 1 }).success).toBe(false);
  });

  it("rejects non-positive skillId", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 0, skill: "TypeScript" }).success
    ).toBe(false);
    expect(
      updateSkillSchema.safeParse({ skillId: -5, skill: "TypeScript" }).success
    ).toBe(false);
  });

  it("rejects empty skill name", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 1, skill: "" }).success
    ).toBe(false);
  });

  it("rejects skill name exceeding 128 characters", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 1, skill: "A".repeat(129) }).success
    ).toBe(false);
  });

  it("rejects non-string skill", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 1, skill: 123 }).success
    ).toBe(false);
  });

  it("rejects non-coercible skillId", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: "abc", skill: "React" }).success
    ).toBe(false);
  });
});

describe("skillActionResultOutputSchema", () => {
  it("accepts success branch", () => {
    expect(
      skillActionResultOutputSchema.safeParse({ success: true, skillId: 1 }).success
    ).toBe(true);
  });

  it("accepts failure branch", () => {
    expect(
      skillActionResultOutputSchema.safeParse({ success: false, error: "Not found" }).success
    ).toBe(true);
  });

  it("rejects success branch missing skillId", () => {
    expect(
      skillActionResultOutputSchema.safeParse({ success: true }).success
    ).toBe(false);
  });

  it("rejects failure branch missing error", () => {
    expect(
      skillActionResultOutputSchema.safeParse({ success: false }).success
    ).toBe(false);
  });

  it("rejects empty object", () => {
    expect(skillActionResultOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects invalid success value", () => {
    expect(
      skillActionResultOutputSchema.safeParse({ success: "yes", skillId: 1 }).success
    ).toBe(false);
  });

  it("rejects non-integer skillId in success branch", () => {
    expect(
      skillActionResultOutputSchema.safeParse({ success: true, skillId: 1.5 }).success
    ).toBe(false);
  });
});
