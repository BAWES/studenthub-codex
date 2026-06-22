import { describe, it, expect } from "vitest";
import { createSkillSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/skills/new actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("createSkillSchema", () => {
  it("accepts a valid skill name", () => {
    const r = createSkillSchema.safeParse({ skill: "TypeScript" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skill).toBe("TypeScript");
    }
  });

  it("rejects empty skill name", () => {
    expect(createSkillSchema.safeParse({ skill: "" }).success).toBe(false);
  });

  it("rejects missing skill field", () => {
    expect(createSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects skill name over 128 characters", () => {
    expect(
      createSkillSchema.safeParse({ skill: "A".repeat(129) }).success,
    ).toBe(false);
  });

  it("accepts skill name exactly 128 characters", () => {
    const r = createSkillSchema.safeParse({ skill: "A".repeat(128) });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skill).toBe("A".repeat(128));
    }
  });

  it("trims whitespace from skill name", () => {
    const r = createSkillSchema.safeParse({ skill: "  React  " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skill).toBe("React");
    }
  });

  it("accepts skill name with special characters", () => {
    const r = createSkillSchema.safeParse({ skill: "C++ / C# Programming" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skill).toBe("C++ / C# Programming");
    }
  });
});
