import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const COMPONENT_PATH = path.resolve(
  __dirname,
  "_components/candidate-chat.tsx",
);

describe("candidate chat page — CSS theme variables", () => {
  const source = fs.readFileSync(COMPONENT_PATH, "utf-8");

  // These hardcoded hex colors should never appear — use theme tokens instead
  const HARDCODED_HEXES_THAT_SHOULD_BE_CSS_VARS = [
    { hex: "#eb6651", expected: "bg-coral / border-coral / text-coral" },
    { hex: "#d45441", expected: "bg-coral-hover" },
    { hex: "#fef1ef", expected: "bg-coral-light" },
    { hex: "#1d1c1a", expected: "text-ink" },
    { hex: "#6e6b66", expected: "text-muted-text" },
    { hex: "#e8e6e3", expected: "border-border / bg-border" },
    { hex: "#a09d98", expected: "text-muted-text" },
    { hex: "#d32f2f", expected: "text-destructive" },
  ];

  for (const { hex, expected } of HARDCODED_HEXES_THAT_SHOULD_BE_CSS_VARS) {
    it(`does NOT use hardcoded ${hex} — should use Tailwind token (${expected}) instead`, () => {
      // Count occurrences of the hardcoded hex in Tailwind classes
      const regex = new RegExp(`${hex}`, "g");
      const matches = source.match(regex);
      if (matches) {
        // Filter out skeleton-related matches (animate-pulse / color-mix)
        const lines = source.split("\n");
        const nonSkeletonMatches = lines.filter(
          (l) => l.includes(hex) && !l.includes("animate-pulse"),
        );
        expect(nonSkeletonMatches.length).toBe(0);
      }
    });
  }

  it("uses Tailwind border-border class for borders", () => {
    const borderClassCount = (source.match(/\bborder-border\b/g) || []).length;
    expect(borderClassCount).toBeGreaterThanOrEqual(5);
  });

  it("uses Tailwind bg-coral / text-coral / border-coral for the primary accent", () => {
    const coralClassCount = (source.match(/\b(bg-coral|text-coral|border-coral)\b/g) || []).length;
    expect(coralClassCount).toBeGreaterThanOrEqual(3);
  });

  it("uses Tailwind bg-surface / bg-paper for backgrounds", () => {
    const bgSurfaceCount = (source.match(/\bbg-surface\b/g) || []).length;
    const bgPaperCount = (source.match(/\bbg-paper\b/g) || []).length;
    expect(bgSurfaceCount + bgPaperCount).toBeGreaterThanOrEqual(3);
  });

  it("uses Tailwind text-muted-text for secondary text", () => {
    const mutedTextCount = (source.match(/\btext-muted-text\b/g) || []).length;
    expect(mutedTextCount).toBeGreaterThanOrEqual(4);
  });
});
