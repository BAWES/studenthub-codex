import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const COMPONENT_PATH = path.resolve(
  __dirname,
  "_components/candidate-chat.tsx",
);

describe("candidate chat page — CSS theme variables", () => {
  const source = fs.readFileSync(COMPONENT_PATH, "utf-8");

  // These hardcoded hex colors should never appear — use shadcn/Tailwind tokens instead
  const HARDCODED_HEXES_THAT_SHOULD_BE_CSS_VARS = [
    { hex: "#eb6651", expected: "bg-coral / border-coral / text-coral" },
    { hex: "#d45441", expected: "bg-coral-hover" },
    { hex: "#fef1ef", expected: "bg-coral-light" },
    { hex: "#1d1c1a", expected: "text-foreground" },
    { hex: "#6e6b66", expected: "text-muted-foreground" },
    { hex: "#e8e6e3", expected: "border-border / bg-border" },
    { hex: "#a09d98", expected: "text-muted-foreground" },
    { hex: "#d32f2f", expected: "text-destructive" },
    { hex: "#b42318", expected: "text-destructive" },
  ];

  for (const { hex, expected } of HARDCODED_HEXES_THAT_SHOULD_BE_CSS_VARS) {
    it(`does NOT use hardcoded ${hex} — should use Tailwind token (${expected}) instead`, () => {
      const regex = new RegExp(`${hex}`, "g");
      const matches = source.match(regex);
      if (matches) {
        // Only skeleton animation exempted
        const lines = source.split("\n");
        const nonSkeletonMatches = lines.filter(
          (l) => l.includes(hex) && !l.includes("animate-pulse"),
        );
        expect(nonSkeletonMatches.length).toBe(0);
      }
    });
  }

  it("uses shadcn border-border class for borders", () => {
    const borderClassCount = (source.match(/\bborder-border\b/g) || []).length;
    expect(borderClassCount).toBeGreaterThanOrEqual(5);
  });

  it("uses shadcn bg-card for card surfaces", () => {
    const bgCardCount = (source.match(/\bbg-card\b/g) || []).length;
    expect(bgCardCount).toBeGreaterThanOrEqual(3);
  });

  it("uses shadcn bg-background for page backgrounds", () => {
    const bgBackgroundCount = (source.match(/\bbg-background\b/g) || []).length;
    expect(bgBackgroundCount).toBeGreaterThanOrEqual(1);
  });

  it("uses shadcn text-foreground for primary text", () => {
    const textForegroundCount = (source.match(/\btext-foreground\b/g) || []).length;
    expect(textForegroundCount).toBeGreaterThanOrEqual(3);
  });

  it("uses shadcn text-muted-foreground for secondary text", () => {
    const mutedForegroundCount = (source.match(/\btext-muted-foreground\b/g) || []).length;
    expect(mutedForegroundCount).toBeGreaterThanOrEqual(4);
  });

  it("uses Tailwind bg-coral / text-coral / border-coral for the accent color", () => {
    const coralClassCount = (source.match(/\b(bg-coral|text-coral|border-coral)\b/g) || []).length;
    expect(coralClassCount).toBeGreaterThanOrEqual(3);
  });

  it("uses bg-coral/20 instead of color-mix for skeleton loading", () => {
    expect(source).toContain("bg-coral/20");
    expect(source).not.toContain("color-mix(in_srgb,var(--sh-coral)_20%,transparent)");
  });
});
