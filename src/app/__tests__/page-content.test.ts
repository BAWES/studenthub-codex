import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Landing page — shadcn only, no custom CSS bloat", () => {
  const pagePath = path.resolve(process.cwd(), "src/app/page.tsx");
  const content = fs.readFileSync(pagePath, "utf-8");

  const forbidden = [
    "backdrop-filter",
    "webkit-backdrop-filter",
    "glass",
    "var(--shadow-",
    "rgba(16,24,40,0.",
    "color-mix(in_srgb",
    "position: absolute",
    "position: fixed",
    "HeroSection",
    "TestimonialCarousel",
    "PersonaSwitcher",
    "ComparisonTable",
  ];

  for (const phrase of forbidden) {
    it(`should not contain "${phrase}" (no custom CSS / glass / old components)`, () => {
      expect(content).not.toContain(phrase);
    });
  }

  it("should use shadcn Card component", () => {
    const cardImport = content.includes('from "@/components/ui/card"');
    const cardUsage = content.includes("<Card");
    expect(cardImport && cardUsage).toBe(true);
  });

  it("should use shadcn Badge component", () => {
    const badgeImport = content.includes('from "@/components/ui/badge"');
    expect(badgeImport).toBe(true);
  });

  it("should use shadcn Button component", () => {
    const btnImport = content.includes('from "@/components/ui/button"');
    expect(btnImport).toBe(true);
  });
});
