import { describe, it, expect } from "vitest";
import {
  skillItemSchema,
  skillListOutputSchema,
  skillActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("skillItemSchema", () => {
  const validItem = {
    candidate_skill_id: 1,
    skill: "JavaScript",
    created_at: new Date("2026-06-15T10:00:00"),
  };

  it("accepts a valid skill item", () => {
    expect(skillItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null created_at", () => {
    expect(
      skillItemSchema.safeParse({ ...validItem, created_at: null }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_skill_id", () => {
    const { candidate_skill_id: _, ...rest } = validItem;
    expect(skillItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for skill_id", () => {
    expect(
      skillItemSchema.safeParse({ ...validItem, candidate_skill_id: "1" })
        .success,
    ).toBe(false);
  });

  it("rejects string instead of Date for created_at", () => {
    expect(
      skillItemSchema.safeParse({
        ...validItem,
        created_at: "2026-06-15T10:00:00",
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
    ],
    total: 1,
    page: 1,
    pageSize: 20,
  };

  it("accepts a valid paginated list", () => {
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

  it("rejects negative total", () => {
    expect(
      skillListOutputSchema.safeParse({ ...validList, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects invalid page type", () => {
    expect(
      skillListOutputSchema.safeParse({ ...validList, page: "1" }).success,
    ).toBe(false);
  });
});

describe("skillActionResultSchema", () => {
  it("accepts success result", () => {
    const r = skillActionResultSchema.safeParse({
      success: true,
      skillId: 42,
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = skillActionResultSchema.safeParse({
      success: false,
      error: "Skill not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects success without skillId", () => {
    expect(
      skillActionResultSchema.safeParse({ success: true }).success,
    ).toBe(false);
  });

  it("rejects error without error message", () => {
    expect(
      skillActionResultSchema.safeParse({ success: false }).success,
    ).toBe(false);
  });

  it("rejects invalid discriminators", () => {
    expect(
      skillActionResultSchema.safeParse({ success: "yes", skillId: 42 }).success,
    ).toBe(false);
  });
});
