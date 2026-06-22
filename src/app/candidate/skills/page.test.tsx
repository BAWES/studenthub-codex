import { describe, it, expect } from "vitest";
import {
  skillItemOutputSchema,
  skillListOutputSchema,
  skillActionResultOutputSchema,
} from "./schemas";

describe("candidate skills page — data contract", () => {
  it("skillItemOutputSchema validates a valid skill", () => {
    const r = skillItemOutputSchema.safeParse({
      candidate_skill_id: 1, skill: "JavaScript", created_at: new Date("2024-01-01"),
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.skill).toBe("JavaScript");
  });

  it("skillItemOutputSchema rejects missing candidate_skill_id", () => {
    const r = skillItemOutputSchema.safeParse({ skill: "Python" });
    expect(r.success).toBe(false);
  });

  it("skillListOutputSchema validates paginated list", () => {
    const r = skillListOutputSchema.safeParse({
      items: [{ candidate_skill_id: 1, skill: "JS", created_at: null }],
      total: 1, page: 1, pageSize: 20,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.items.length).toBe(1);
  });

  it("skillListOutputSchema rejects non-array items", () => {
    const r = skillListOutputSchema.safeParse({ items: "bad", total: 0, page: 0, pageSize: 0 });
    expect(r.success).toBe(false);
  });

  it("skillActionResultOutputSchema validates success", () => {
    const r = skillActionResultOutputSchema.safeParse({ success: true, skillId: 1 });
    expect(r.success).toBe(true);
  });

  it("skillActionResultOutputSchema validates failure", () => {
    const r = skillActionResultOutputSchema.safeParse({ success: false, error: "Error" });
    expect(r.success).toBe(true);
  });
});
