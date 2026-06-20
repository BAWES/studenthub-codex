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

describe("listSkillsSchema", () => {
  it("accepts empty input (uses defaults)", () => {
    expect(listSkillsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid input", () => {
    expect(listSkillsSchema.safeParse({ page: 1, limit: 20 }).success).toBe(true);
  });

  it("rejects page less than 1", () => {
    expect(listSkillsSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(listSkillsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    expect(listSkillsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    expect(listSkillsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    expect(listSkillsSchema.safeParse({ page: "abc" }).success).toBe(false);
  });
});

describe("getSkillSchema", () => {
  it("accepts valid skillId", () => {
    expect(getSkillSchema.safeParse({ skillId: 1 }).success).toBe(true);
  });

  it("accepts string-coercible skillId", () => {
    expect(getSkillSchema.safeParse({ skillId: "1" }).success).toBe(true);
  });

  it("rejects empty object", () => {
    expect(getSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive skillId", () => {
    expect(getSkillSchema.safeParse({ skillId: 0 }).success).toBe(false);
    expect(getSkillSchema.safeParse({ skillId: -5 }).success).toBe(false);
  });

  it("rejects non-coercible skillId", () => {
    expect(getSkillSchema.safeParse({ skillId: "abc" }).success).toBe(false);
  });
});

describe("createSkillSchema", () => {
  it("accepts valid skill name", () => {
    expect(createSkillSchema.safeParse({ skill: "React" }).success).toBe(true);
  });

  it("trims whitespace from skill name", () => {
    const result = createSkillSchema.safeParse({ skill: "  React  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skill).toBe("React");
    }
  });

  it("rejects empty object", () => {
    expect(createSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty skill name", () => {
    expect(createSkillSchema.safeParse({ skill: "" }).success).toBe(false);
  });

  it("rejects skill name exceeding 128 characters", () => {
    expect(createSkillSchema.safeParse({ skill: "A".repeat(129) }).success).toBe(false);
  });

  it("rejects non-string skill", () => {
    expect(createSkillSchema.safeParse({ skill: 123 }).success).toBe(false);
  });
});

describe("updateSkillSchema", () => {
  it("accepts valid input", () => {
    expect(updateSkillSchema.safeParse({ skillId: 1, skill: "TypeScript" }).success).toBe(true);
  });

  it("accepts string-coercible skillId", () => {
    expect(updateSkillSchema.safeParse({ skillId: "1", skill: "TypeScript" }).success).toBe(true);
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
    expect(updateSkillSchema.safeParse({ skillId: 0, skill: "TypeScript" }).success).toBe(false);
  });

  it("rejects empty skill name", () => {
    expect(updateSkillSchema.safeParse({ skillId: 1, skill: "" }).success).toBe(false);
  });
});

describe("deleteSkillSchema", () => {
  it("accepts valid skillId", () => {
    expect(deleteSkillSchema.safeParse({ skillId: 1 }).success).toBe(true);
  });

  it("accepts string-coercible skillId", () => {
    expect(deleteSkillSchema.safeParse({ skillId: "5" }).success).toBe(true);
  });

  it("rejects empty object", () => {
    expect(deleteSkillSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive skillId", () => {
    expect(deleteSkillSchema.safeParse({ skillId: 0 }).success).toBe(false);
    expect(deleteSkillSchema.safeParse({ skillId: -3 }).success).toBe(false);
  });

  it("rejects non-coercible skillId", () => {
    expect(deleteSkillSchema.safeParse({ skillId: "abc" }).success).toBe(false);
  });
});

describe("skillItemOutputSchema", () => {
  const validItem = {
    candidate_skill_id: 1,
    skill: "React",
    created_at: new Date(),
  };

  it("accepts valid output", () => {
    expect(skillItemOutputSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null created_at", () => {
    expect(
      skillItemOutputSchema.safeParse({ ...validItem, created_at: null }).success
    ).toBe(true);
  });

  it("rejects missing candidate_skill_id", () => {
    const { candidate_skill_id, ...rest } = validItem;
    expect(skillItemOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer id", () => {
    expect(
      skillItemOutputSchema.safeParse({ ...validItem, candidate_skill_id: 1.5 }).success
    ).toBe(false);
  });

  it("rejects string for date", () => {
    expect(
      skillItemOutputSchema.safeParse({ ...validItem, created_at: "2025-01-01" }).success
    ).toBe(false);
  });
});

describe("skillListOutputSchema", () => {
  const validList = {
    items: [
      { candidate_skill_id: 1, skill: "React", created_at: new Date() },
      { candidate_skill_id: 2, skill: "Node", created_at: null },
    ],
    total: 2,
    page: 1,
    pageSize: 20,
  };

  it("accepts valid output", () => {
    expect(skillListOutputSchema.safeParse(validList).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      skillListOutputSchema.safeParse({ items: [], total: 0, page: 1, pageSize: 20 }).success
    ).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      skillListOutputSchema.safeParse({ ...validList, total: -1 }).success
    ).toBe(false);
  });

  it("rejects non-positive page", () => {
    expect(
      skillListOutputSchema.safeParse({ ...validList, page: 0 }).success
    ).toBe(false);
  });

  it("rejects non-positive pageSize", () => {
    expect(
      skillListOutputSchema.safeParse({ ...validList, pageSize: -5 }).success
    ).toBe(false);
  });

  it("rejects missing items", () => {
    const { items, ...rest } = validList;
    expect(skillListOutputSchema.safeParse(rest).success).toBe(false);
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
});
