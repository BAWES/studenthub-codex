import { describe, it, expect } from "vitest";
import { computeMatchScore, matchScoreLabel } from "./match-score";

// The parseCompensationToNumber helper is not exported, so we test it indirectly
// through the full pipeline in shared.ts tests. The function-level tests here
// cover the pure scoring and labeling logic.

describe("computeMatchScore", () => {
  // ===== Skill match ratio tests =====

  it("returns 100 when all skills match", () => {
    const score = computeMatchScore({
      matchedSkillCount: 5,
      totalRequestSkills: 5,
    });
    expect(score).toBe(100);
  });

  it("returns 0 when no skills match", () => {
    const score = computeMatchScore({
      matchedSkillCount: 0,
      totalRequestSkills: 5,
    });
    expect(score).toBe(0);
  });

  it("returns proportional score for partial match", () => {
    const score = computeMatchScore({
      matchedSkillCount: 3,
      totalRequestSkills: 10,
    });
    expect(score).toBe(30);
  });

  it("returns 100 when matched exceeds total (edge case)", () => {
    const score = computeMatchScore({
      matchedSkillCount: 10,
      totalRequestSkills: 5,
    });
    expect(score).toBe(100);
  });

  it("handles single skill request", () => {
    const score = computeMatchScore({
      matchedSkillCount: 1,
      totalRequestSkills: 1,
    });
    expect(score).toBe(100);
  });

  // ===== No-skills edge case =====

  it("returns 50 when request has no skills (neutral score)", () => {
    const score = computeMatchScore({
      matchedSkillCount: 0,
      totalRequestSkills: 0,
    });
    expect(score).toBe(50);
  });

  it("returns 50 when request has no skills even if candidate has matches", () => {
    const score = computeMatchScore({
      matchedSkillCount: 3,
      totalRequestSkills: 0,
    });
    expect(score).toBe(50);
  });

  // ===== Rounding =====

  it("rounds down to nearest integer", () => {
    const score = computeMatchScore({
      matchedSkillCount: 1,
      totalRequestSkills: 3,
    });
    expect(score).toBe(33);
  });

  it("rounds up at .5 boundary", () => {
    const score = computeMatchScore({
      matchedSkillCount: 1,
      totalRequestSkills: 6,
    });
    expect(score).toBe(17);
  });

  // ===== Rate proximity tests =====

  it("returns 100 when rate exactly matches compensation", () => {
    const score = computeMatchScore({
      matchedSkillCount: 5,
      totalRequestSkills: 5,
      candidateRate: 10,
      requestCompensation: 10,
    });
    expect(score).toBe(100);
  });

  it("penalizes when rate differs from compensation", () => {
    const score = computeMatchScore({
      matchedSkillCount: 5,
      totalRequestSkills: 5,
      candidateRate: 15,
      requestCompensation: 10,
    });
    // Skill: 100 * 0.6 = 60
    // Rate: (1 - |15-10|/10) * 0.4 = (1 - 0.5) * 0.4 = 0.2
    // Total: 60 + 20 = 80
    expect(score).toBe(80);
  });

  it("ignores rate proximity when compensation is null", () => {
    const score = computeMatchScore({
      matchedSkillCount: 5,
      totalRequestSkills: 5,
      candidateRate: 15,
      requestCompensation: null,
    });
    expect(score).toBe(100);
  });

  it("ignores rate proximity when candidate rate is null", () => {
    const score = computeMatchScore({
      matchedSkillCount: 5,
      totalRequestSkills: 5,
      candidateRate: null,
      requestCompensation: 10,
    });
    expect(score).toBe(100);
  });

  it("handles rate proximity when rate is above compensation", () => {
    const score = computeMatchScore({
      matchedSkillCount: 3,
      totalRequestSkills: 5,
      candidateRate: 30,
      requestCompensation: 20,
    });
    // Skill: 3/5 * 0.6 = 60 * 0.6 = 36
    // Rate: (1 - 10/20) * 0.4 = 0.5 * 0.4 = 20
    // Total: 36 + 20 = 56
    expect(score).toBe(56);
  });

  it("handles rate proximity when rate is below compensation", () => {
    const score = computeMatchScore({
      matchedSkillCount: 3,
      totalRequestSkills: 5,
      candidateRate: 8,
      requestCompensation: 20,
    });
    // Skill: 60 * 0.6 = 36
    // Rate: (1 - 12/20) * 0.4 = (1 - 0.6) * 0.4 = 0.16
    // Total: 36 + 16 = 52
    expect(score).toBe(52);
  });
});

describe("matchScoreLabel", () => {
  it('labels 90+ as "Excellent match"', () => {
    expect(matchScoreLabel(100)).toBe("Excellent match");
    expect(matchScoreLabel(95)).toBe("Excellent match");
    expect(matchScoreLabel(90)).toBe("Excellent match");
  });

  it('labels 70-89 as "Strong match"', () => {
    expect(matchScoreLabel(89)).toBe("Strong match");
    expect(matchScoreLabel(70)).toBe("Strong match");
  });

  it('labels 50-69 as "Good match"', () => {
    expect(matchScoreLabel(69)).toBe("Good match");
    expect(matchScoreLabel(50)).toBe("Good match");
  });

  it('labels 30-49 as "Partial match"', () => {
    expect(matchScoreLabel(49)).toBe("Partial match");
    expect(matchScoreLabel(30)).toBe("Partial match");
  });

  it('labels <30 as "Low match"', () => {
    expect(matchScoreLabel(29)).toBe("Low match");
    expect(matchScoreLabel(0)).toBe("Low match");
  });

  it("handles boundary values correctly", () => {
    expect(matchScoreLabel(90)).toBe("Excellent match");
    expect(matchScoreLabel(70)).toBe("Strong match");
    expect(matchScoreLabel(50)).toBe("Good match");
    expect(matchScoreLabel(30)).toBe("Partial match");
  });
});
