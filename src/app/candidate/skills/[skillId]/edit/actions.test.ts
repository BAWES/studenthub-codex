import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema definitions — mirrors skills/schemas.ts/skills/[skillId]/schemas.ts
// for isolated unit testing of the edit route's validation layer.
// ---------------------------------------------------------------------------

const updateSkillSchema = z.object({
  skillId: z.coerce.number().int().positive("Skill ID is required"),
  skill: z
    .string()
    .min(1, "Skill name is required")
    .max(128, "Skill name must be 128 characters or fewer")
    .transform((v) => v.trim()),
});

// ---------------------------------------------------------------------------
// Tests — updateSkillSchema (the only schema the edit route uses)
// ---------------------------------------------------------------------------

describe("updateSkillSchema", () => {
  it("accepts valid update with all fields", () => {
    const result = updateSkillSchema.safeParse({
      skillId: "1",
      skill: "React",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skillId).toBe(1);
      expect(result.data.skill).toBe("React");
    }
  });

  it("rejects missing skillId", () => {
    const result = updateSkillSchema.safeParse({ skill: "React" });
    expect(result.success).toBe(false);
  });

  it("rejects empty skillId", () => {
    const result = updateSkillSchema.safeParse({ skillId: "", skill: "React" });
    expect(result.success).toBe(false);
  });

  it("rejects negative skillId", () => {
    const result = updateSkillSchema.safeParse({ skillId: "-1", skill: "React" });
    expect(result.success).toBe(false);
  });

  it("rejects missing skill name", () => {
    const result = updateSkillSchema.safeParse({ skillId: "1" });
    expect(result.success).toBe(false);
  });

  it("rejects empty skill name", () => {
    const result = updateSkillSchema.safeParse({ skillId: "1", skill: "" });
    expect(result.success).toBe(false);
  });

  it("rejects skill name over 128 chars", () => {
    const result = updateSkillSchema.safeParse({
      skillId: "1",
      skill: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from skill name", () => {
    const result = updateSkillSchema.safeParse({
      skillId: "1",
      skill: "  TypeScript  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skill).toBe("TypeScript");
    }
  });

  it("coerces string skillId to number", () => {
    const result = updateSkillSchema.safeParse({
      skillId: "42",
      skill: "Python",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skillId).toBe(42);
    }
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

type SkillActionResult =
  | { success: true; skillId: number }
  | { success: false; error: string };

describe("SkillActionResult type shape (edit route)", () => {
  it("accepts a success result with skillId", () => {
    const result: SkillActionResult = {
      success: true,
      skillId: 1,
    };
    expect(result.success).toBe(true);
    expect(result.skillId).toBe(1);
  });

  it("accepts an error result", () => {
    const result: SkillActionResult = {
      success: false,
      error: "Skill not found",
    };
    expect(result.success).toBe(false);
    expect(result.error).toBe("Skill not found");
  });
});
