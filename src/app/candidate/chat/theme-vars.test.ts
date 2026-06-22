import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const COMPONENT_PATH = path.resolve(
  __dirname,
  "_components/candidate-chat.tsx",
);

describe("candidate chat page — CSS theme variables", () => {
  const source = fs.readFileSync(COMPONENT_PATH, "utf-8");

  // These hardcoded hex colors should be replaced with CSS variables
  // for proper dark/light theme toggle support
  const HARDCODED_HEXES_THAT_SHOULD_BE_CSS_VARS = [
    { hex: "#eb6651", expected: "var(--sh-coral)" },
    { hex: "#d45441", expected: "var(--sh-coral-hover)" },
    { hex: "#fef1ef", expected: "var(--sh-coral-light)" },
    { hex: "#1d1c1a", expected: "var(--ink)" },
    { hex: "#6e6b66", expected: "var(--muted)" },
    { hex: "#e8e6e3", expected: "var(--border)" },
    { hex: "#a09d98", expected: "var(--muted)" },
    { hex: "#d32f2f", expected: "var(--destructive)" },
  ];

  for (const { hex, expected } of HARDCODED_HEXES_THAT_SHOULD_BE_CSS_VARS) {
    it(`does NOT use hardcoded ${hex} — should use ${expected} instead`, () => {
      // Count occurrences of the hardcoded hex in Tailwind classes
      const regex = new RegExp(`${hex}`, "g");
      const matches = source.match(regex);
      if (matches) {
        // Allow a few exceptions:
        // - The skeleton animation pulse colors are OK to keep as they're loading animations
        // - The read status "✓✓" doesn't involve colors
        // Filter out skeleton-related matches
        const nonSkeletonMatches = matches.filter(
          (_, i) => {
            // We check line by line for skeleton
            const lines = source.split("\n");
            const matchingLines = lines.filter(
              (l) => l.includes(hex) && !l.includes("animate-pulse"),
            );
            return matchingLines.length;
          },
        );
        expect(nonSkeletonMatches.length).toBe(0);
      }
    });
  }

  it("uses CSS variables for the sidebar background", () => {
    expect(source).toMatch(/var\(--(?:paper|surface)\)/);
  });

  it("uses CSS variables for borders", () => {
    const borderVarCount = (source.match(/var\(--(?:border|line)\)/g) || [])
          .length;
    expect(borderVarCount).toBeGreaterThanOrEqual(5);
  });

  it("uses var(--sh-coral) for the primary accent color", () => {
    const coralVarCount = (source.match(/var\(--sh-coral[^)]*\)/g) || [])
          .length;
    expect(coralVarCount).toBeGreaterThanOrEqual(3);
  });
});
