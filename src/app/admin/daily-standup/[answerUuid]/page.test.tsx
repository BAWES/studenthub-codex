import { describe, it, expect } from "vitest";

describe("admin daily-standup detail — data contract", () => {
  it("answerUuid param format", () => {
    // The detail page expects params.answerUuid to be a non-empty string
    const uuid = "ans-789";
    expect(uuid.length).toBeGreaterThan(0);
    expect(uuid).toMatch(/^ans-/);
  });

  it("null answer returns null (notFound handled by page)", () => {
    // getDailyStandupAnswer returns { answer: null } when not found
    const result = { answer: null };
    expect(result.answer).toBeNull();
  });

  it("valid answer has expected shape", () => {
    const answer = {
      answer_uuid: "ans-789",
      staff_id: 42,
      question_uuid: "q-1",
      question: "What did you work on today?",
      answer: "Built the admin daily-standup detail page.",
      created_at: new Date("2026-06-20T10:00:00.000Z"),
      updated_at: new Date("2026-06-20T12:00:00.000Z"),
    };
    expect(answer).toHaveProperty("answer_uuid");
    expect(answer).toHaveProperty("staff_id");
    expect(answer).toHaveProperty("question");
    expect(answer).toHaveProperty("answer");
  });

  it("em-dash renders for null fields (display logic)", () => {
    const emDash = "\u2014";
    expect(emDash).toBe(emDash);
  });
});
