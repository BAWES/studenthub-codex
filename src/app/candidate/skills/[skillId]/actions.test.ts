import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSkillSchema, updateSkillSchema, deleteSkillSchema } from "./schemas";

// Re-create the action signatures locally for type-level testing
// The actual server actions import from parent — we test schema + delegation contract here.

describe("getSkillSchema", () => {
  it("accepts a valid skill ID string", () => {
    const r = getSkillSchema.safeParse({ skillId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skillId).toBe(42);
    }
  });

  it("accepts a numeric skill ID", () => {
    const r = getSkillSchema.safeParse({ skillId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skillId).toBe(42);
    }
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
  it("accepts valid update params", () => {
    const r = updateSkillSchema.safeParse({
      skillId: 42,
      skill: "TypeScript",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skillId).toBe(42);
      expect(r.data.skill).toBe("TypeScript");
    }
  });

  it("rejects missing skillId", () => {
    expect(updateSkillSchema.safeParse({ skill: "TS" }).success).toBe(false);
  });

  it("rejects missing skill name", () => {
    expect(updateSkillSchema.safeParse({ skillId: 42 }).success).toBe(false);
  });

  it("rejects empty skill name", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 42, skill: "" }).success,
    ).toBe(false);
  });

  it("trims whitespace from skill name", () => {
    const r = updateSkillSchema.safeParse({ skillId: 42, skill: "  React  " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skill).toBe("React");
    }
  });

  it("rejects skill name over 128 chars", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 42, skill: "A".repeat(129) })
        .success,
    ).toBe(false);
  });
});

describe("deleteSkillSchema", () => {
  it("accepts valid skill ID", () => {
    const r = deleteSkillSchema.safeParse({ skillId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skillId).toBe(42);
    }
  });

  it("rejects zero skillId", () => {
    expect(deleteSkillSchema.safeParse({ skillId: 0 }).success).toBe(false);
  });

  it("rejects missing skillId", () => {
    expect(deleteSkillSchema.safeParse({}).success).toBe(false);
  });
});
