import { describe, it, expect } from "vitest";
import { createSkillSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Schema validation tests — candidate/skills/new
// ---------------------------------------------------------------------------
// Re-exported from the parent skills/schemas.ts.

describe("createSkillSchema", () => {
  it("accepts a valid skill name", () => {
    expect(createSkillSchema.safeParse({ skill: "Python" }).success).toBe(true);
  });

  it("trims whitespace from skill name", () => {
    const result = createSkillSchema.safeParse({ skill: "  Python  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skill).toBe("Python");
    }
  });

  it("rejects missing skill", () => {
    expect(createSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty skill name", () => {
    expect(createSkillSchema.safeParse({ skill: "" }).success).toBe(false);
  });

  it("rejects skill name over 128 characters", () => {
    expect(
      createSkillSchema.safeParse({ skill: "A".repeat(129) }).success,
    ).toBe(false);
  });
});
