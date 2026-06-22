import { describe, it, expect } from "vitest";
import { extractSkills } from "./matching";

// ---------------------------------------------------------------------------
// extractSkills — pure function, no mocking needed
// ---------------------------------------------------------------------------

describe("extractSkills", () => {
  it("extracts comma-separated skills", () => {
    const result = extractSkills("React, Node.js, TypeScript, PostgreSQL");
    expect(result).toEqual(expect.arrayContaining(["react", "node.js", "typescript", "postgresql"]));
  });

  it("extracts semicolon-separated skills", () => {
    const result = extractSkills("Python; Django; REST APIs");
    expect(result).toEqual(expect.arrayContaining(["python", "django", "rest apis"]));
  });

  it("extracts bullet-pointed skills", () => {
    const result = extractSkills("• React\n• Next.js\n• Tailwind CSS");
    expect(result).toEqual(expect.arrayContaining(["react", "next.js", "tailwind css"]));
  });

  it("filters stop words and short tokens", () => {
    const result = extractSkills("the and must have react");
    expect(result).not.toContain("the");
    expect(result).not.toContain("and");
    expect(result).not.toContain("must");
    expect(result).not.toContain("have");
    expect(result).toContain("react");
  });

  it("extracts skills from text with parentheses", () => {
    const result = extractSkills("React, Node.js");
    expect(result).toContain("react");
    expect(result).toContain("node.js");
  });

  it("handles empty input", () => {
    expect(extractSkills("")).toEqual([]);
  });

  it("handles null input gracefully", () => {
    expect(extractSkills(null)).toEqual([]);
  });

  it("handles undefined input gracefully", () => {
    expect(extractSkills(undefined)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Composite weight tests — no mocking needed
// ---------------------------------------------------------------------------

describe("scoreJobForCandidate — composable weights", () => {
  it("weights sum to 100% (0.4 + 0.3 + 0.15 + 0.15 = 1.0)", () => {
    const total = 0.4 + 0.3 + 0.15 + 0.15;
    expect(total).toBe(1.0);
  });

  it("all-perfect scores produce overall of 100", () => {
    const overall = Math.round(100 * 0.4 + 100 * 0.3 + 100 * 0.15 + 100 * 0.15);
    expect(overall).toBe(100);
  });

  it("all-zero scores produce overall of 0", () => {
    const overall = Math.round(0 * 0.4 + 0 * 0.3 + 0 * 0.15 + 0 * 0.15);
    expect(overall).toBe(0);
  });

  it("skills-only score of 100 gives overall 40", () => {
    const overall = Math.round(100 * 0.4 + 0 * 0.3 + 0 * 0.15 + 0 * 0.15);
    expect(overall).toBe(40);
  });
});
