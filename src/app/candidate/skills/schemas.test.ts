import { describe, it, expect } from "vitest";
import {
  listSkillsSchema,
  getSkillSchema,
  createSkillSchema,
  updateSkillSchema,
  deleteSkillSchema,
  skillItemOutputSchema,
  skillListOutputSchema,
  skillActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests
// ---------------------------------------------------------------------------

describe("listSkillsSchema", () => {
  it("accepts valid pagination input", () => {
    const r = listSkillsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("defaults page and limit", () => {
    const r = listSkillsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listSkillsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listSkillsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("coerces string page and limit to number", () => {
    const r = listSkillsSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });
});

describe("getSkillSchema", () => {
  it("accepts valid skill ID", () => {
    const r = getSkillSchema.safeParse({ skillId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skillId).toBe(42);
    }
  });

  it("coerces string skill ID to number", () => {
    const r = getSkillSchema.safeParse({ skillId: "42" });
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
    expect(getSkillSchema.safeParse({ skillId: -5 }).success).toBe(false);
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

  it("trims whitespace from skill name", () => {
    const r = createSkillSchema.safeParse({ skill: "  React  " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skill).toBe("React");
    }
  });

  it("rejects empty skill name", () => {
    expect(createSkillSchema.safeParse({ skill: "" }).success).toBe(false);
  });

  it("rejects missing skill field", () => {
    expect(createSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects skill name exceeding 128 characters", () => {
    expect(
      createSkillSchema.safeParse({ skill: "a".repeat(129) }).success,
    ).toBe(false);
  });

  it("accepts skill name exactly 128 characters", () => {
    expect(
      createSkillSchema.safeParse({ skill: "a".repeat(128) }).success,
    ).toBe(true);
  });

  it("rejects non-string skill", () => {
    expect(createSkillSchema.safeParse({ skill: 123 }).success).toBe(false);
  });
});

describe("updateSkillSchema", () => {
  it("accepts valid skill ID and name", () => {
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

  it("coerces string skill ID", () => {
    const r = updateSkillSchema.safeParse({
      skillId: "42",
      skill: "TypeScript",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skillId).toBe(42);
    }
  });

  it("trims skill name", () => {
    const r = updateSkillSchema.safeParse({
      skillId: 1,
      skill: "  Vue  ",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skill).toBe("Vue");
    }
  });

  it("rejects missing skillId", () => {
    expect(
      updateSkillSchema.safeParse({ skill: "React" }).success,
    ).toBe(false);
  });

  it("rejects missing skill", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 1 }).success,
    ).toBe(false);
  });

  it("rejects empty skill name", () => {
    expect(
      updateSkillSchema.safeParse({ skillId: 1, skill: "" }).success,
    ).toBe(false);
  });
});

describe("deleteSkillSchema", () => {
  it("accepts valid skill ID", () => {
    const r = deleteSkillSchema.safeParse({ skillId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skillId).toBe(42);
    }
  });

  it("coerces string skill ID to number", () => {
    const r = deleteSkillSchema.safeParse({ skillId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.skillId).toBe(42);
    }
  });

  it("rejects missing skillId", () => {
    expect(deleteSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero skillId", () => {
    expect(deleteSkillSchema.safeParse({ skillId: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("skillItemOutputSchema", () => {
  const validItem = {
    candidate_skill_id: 1,
    skill: "JavaScript",
    created_at: null,
  };

  it("accepts valid skill item", () => {
    expect(skillItemOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts valid Date for created_at", () => {
    expect(
      skillItemOutputSchema.safeParse({
        ...validItem,
        created_at: new Date("2026-01-01"),
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_skill_id", () => {
    const { candidate_skill_id: _, ...rest } = validItem;
    expect(skillItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing skill", () => {
    const { skill: _, ...rest } = validItem;
    expect(skillItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects string for candidate_skill_id", () => {
    expect(
      skillItemOutputSchema.safeParse({
        ...validItem,
        candidate_skill_id: "1",
      }).success,
    ).toBe(false);
  });

  it("rejects string for created_at", () => {
    expect(
      skillItemOutputSchema.safeParse({
        ...validItem,
        created_at: "2026-01-01",
      }).success,
    ).toBe(false);
  });
});

describe("skillListOutputSchema", () => {
  const validList = {
    items: [
      {
        candidate_skill_id: 1,
        skill: "JavaScript",
        created_at: null,
      },
      {
        candidate_skill_id: 2,
        skill: "TypeScript",
        created_at: null,
      },
    ],
    total: 2,
    page: 1,
    pageSize: 20,
  };

  it("accepts valid skill list", () => {
    expect(skillListOutputSchema.safeParse(validList).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      skillListOutputSchema.safeParse({
        ...validList,
        items: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validList;
    expect(skillListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validList;
    expect(skillListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      skillListOutputSchema.safeParse({ ...validList, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      skillListOutputSchema.safeParse({ ...validList, page: 0 }).success,
    ).toBe(false);
  });

  it("rejects string for total", () => {
    expect(
      skillListOutputSchema.safeParse({ ...validList, total: "2" }).success,
    ).toBe(false);
  });

  it("rejects invalid item in items array", () => {
    expect(
      skillListOutputSchema.safeParse({
        ...validList,
        items: [{ candidate_skill_id: 1 }],
      }).success,
    ).toBe(false);
  });
});

describe("skillActionResultOutputSchema", () => {
  it("accepts success result with skillId", () => {
    const r = skillActionResultOutputSchema.safeParse({
      success: true,
      skillId: 42,
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result with error message", () => {
    const r = skillActionResultOutputSchema.safeParse({
      success: false,
      error: "Skill already exists",
    });
    expect(r.success).toBe(true);
  });

  it("rejects success result without skillId", () => {
    expect(
      skillActionResultOutputSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error result without error field", () => {
    expect(
      skillActionResultOutputSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("accepts success: true with error field (Zod strips unknown keys)", () => {
    expect(
      skillActionResultOutputSchema.safeParse({
        success: true,
        skillId: 42,
        error: "should not be here",
      }).success,
    ).toBe(true);
  });
});
