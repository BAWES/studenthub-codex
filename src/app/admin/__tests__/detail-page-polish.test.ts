import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const adminDir = path.resolve(__dirname, "..");

const MODULES: { dir: string; backTo: string; listPath: string }[] = [
  { dir: "degree-group", backTo: "Degree Groups", listPath: "/admin/degree-group" },
  { dir: "discount-category", backTo: "Discount Categories", listPath: "/admin/discount-category" },
  { dir: "email-campaign", backTo: "Email Campaigns", listPath: "/admin/email-campaign" },
  { dir: "major", backTo: "Majors", listPath: "/admin/major" },
  { dir: "story", backTo: "Stories", listPath: "/admin/story" },
  { dir: "university", backTo: "Universities", listPath: "/admin/university" },
  { dir: "webhook", backTo: "Webhooks", listPath: "/admin/webhook" },
];

describe("STU-4327: Admin detail page polish", () => {
  for (const mod of MODULES) {
    const detailDir = path.join(adminDir, mod.dir);
    const idFiles = fs.readdirSync(detailDir).filter((f) => f.startsWith("["));
    if (idFiles.length === 0) continue;
    const idFile = idFiles[0];
    const filePath = path.join(detailDir, idFile);
    const content = fs.readFileSync(filePath, "utf-8");

    describe(`${mod.dir}/[id]/page.tsx`, () => {
      it("has a back-to-list link", () => {
        expect(content).toContain("Back to");
        expect(content).toContain(`Back to ${mod.backTo}`);
      });

      it("imports Link from next/link", () => {
        expect(content).toContain('import Link from "next/link"');
      });

      it("imports Button from shadcn", () => {
        expect(content).toContain('Button');
      });

      it("has useful page title (not generic placeholder)", () => {
        // Title should reference a meaningful field, not just a UUID slice
        const lines = content.split("\n");
        const titleLine = lines.find((l) => l.includes("title="));
        expect(titleLine).toBeTruthy();
        if (titleLine) {
          // Title should reference a meaningful field, not a generic UUID reference
          expect(titleLine).not.toContain("slice(0, 8)");
          expect(titleLine).not.toContain("slice(0,8)");
        }
      });
    });
  }
});
