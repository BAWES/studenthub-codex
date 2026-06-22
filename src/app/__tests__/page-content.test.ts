import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Landing page content discipline", () => {
  const pagePath = path.resolve(process.cwd(), "src/app/page.tsx");
  const content = fs.readFileSync(pagePath, "utf-8");

  const forbidden = [
    "Next-generation",
    "modern platform",
    "Silicon Valley",
    "purpose-built",
    "Why StudentHub",
    "Role-specific workspaces",
    "portalContent",
    "portal-chooser",
  ];

  for (const phrase of forbidden) {
    it(`should not contain "${phrase}" marketing bloat`, () => {
      expect(content).not.toContain(phrase);
    });
  }

  it("should be under 120 lines (lean page)", () => {
    const lines = content.split("\n").length;
    expect(lines).toBeLessThan(120);
  });
});
