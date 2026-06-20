import { describe, it, expect } from "vitest";
import {
  listSkillsSchema,
  getSkillSchema,
  createSkillSchema,
  updateSkillSchema,
  deleteSkillSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Barrel re-export test — verify module-level actions resolve correctly
// ---------------------------------------------------------------------------

describe("barrel exports", () => {
  it("exports all candidate skill actions", async () => {
    const mod = await import("./actions");
    expect(mod).toHaveProperty("listCandidateSkills");
    expect(mod).toHaveProperty("getCandidateSkill");
    expect(mod).toHaveProperty("createCandidateSkill");
    expect(mod).toHaveProperty("updateCandidateSkill");
    expect(mod).toHaveProperty("deleteCandidateSkill");
    expect(typeof mod.listCandidateSkills).toBe("function");
    expect(typeof mod.getCandidateSkill).toBe("function");
    expect(typeof mod.createCandidateSkill).toBe("function");
    expect(typeof mod.updateCandidateSkill).toBe("function");
    expect(typeof mod.deleteCandidateSkill).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// Schema tests for candidate/skills actions (pure unit — no DB required)
// ---------------------------------------------------------------------------

describe("listSkillsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listSkillsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listSkillsSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(listSkillsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listSkillsSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

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

describe("createSkillSchema", () => {
  it("accepts valid skill name", () => {
    const r = createSkillSchema.safeParse({ skill: "JavaScript" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skill).toBe("JavaScript");
    }
  });

  it("rejects empty skill name", () => {
    expect(createSkillSchema.safeParse({ skill: "" }).success).toBe(false);
  });

  it("rejects missing skill name", () => {
    expect(createSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects skill name that is too long", () => {
    expect(createSkillSchema.safeParse({ skill: "A".repeat(129) }).success).toBe(
      false,
    );
  });

  it("trims whitespace from skill name", () => {
    const r = createSkillSchema.safeParse({ skill: "  React  " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skill).toBe("React");
    }
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
