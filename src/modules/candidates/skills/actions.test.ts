import { describe, it, expect } from "vitest";
import {
  listCandidateSkillsSchema,
  getCandidateSkillSchema,
  createCandidateSkillSchema,
  updateCandidateSkillSchema,
  deleteCandidateSkillSchema,
  skillItemSchema,
  skillListOutputSchema,
  skillActionResultSchema,
} from "./schemas";

describe("listCandidateSkillsSchema", () => {
  it("accepts candidateId with defaults", () => {
    const r = listCandidateSkillsSchema.safeParse({ candidateId: 1 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects negative candidateId", () => {
    expect(listCandidateSkillsSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(listCandidateSkillsSchema.safeParse({ candidateId: 1, limit: 999 }).success).toBe(false);
  });
});

describe("getCandidateSkillSchema", () => {
  it("accepts valid candidateId and skillId", () => {
    const r = getCandidateSkillSchema.safeParse({ candidateId: 1, skillId: 5 });
    expect(r.success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    expect(getCandidateSkillSchema.safeParse({ skillId: 5 }).success).toBe(false);
  });
});

describe("createCandidateSkillSchema", () => {
  it("accepts valid input", () => {
    const r = createCandidateSkillSchema.safeParse({ candidateId: 1, skill: "React" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.skill).toBe("React");
  });

  it("rejects empty skill", () => {
    expect(createCandidateSkillSchema.safeParse({ candidateId: 1, skill: "" }).success).toBe(false);
  });
});

describe("updateCandidateSkillSchema", () => {
  it("accepts valid update", () => {
    const r = updateCandidateSkillSchema.safeParse({ candidateId: 1, skillId: 5, skill: "React Native" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.skill).toBe("React Native");
  });
});

describe("deleteCandidateSkillSchema", () => {
  it("accepts valid input", () => {
    expect(deleteCandidateSkillSchema.safeParse({ candidateId: 1, skillId: 5 }).success).toBe(true);
  });
});

describe("skillItemSchema", () => {
  it("accepts valid skill item", () => {
    const r = skillItemSchema.safeParse({
      candidate_skill_id: 1,
      skill: "React",
      created_at: null,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.skill).toBe("React");
  });

  it("rejects missing skill value", () => {
    expect(skillItemSchema.safeParse({ candidate_skill_id: 1 }).success).toBe(false);
  });
});

describe("skillListOutputSchema", () => {
  it("accepts valid output", () => {
    const r = skillListOutputSchema.safeParse({ items: [], total: 0, page: 1, pageSize: 20 });
    expect(r.success).toBe(true);
  });
});

describe("skillActionResultSchema", () => {
  it("accepts success", () => {
    expect(skillActionResultSchema.safeParse({ success: true, skillId: 1 }).success).toBe(true);
  });

  it("accepts error", () => {
    expect(skillActionResultSchema.safeParse({ success: false, error: "Failed" }).success).toBe(true);
  });
});
