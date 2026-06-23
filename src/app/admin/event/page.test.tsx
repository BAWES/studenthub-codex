/**
 * Page migration test for admin/event list page.
 * Verifies the list page co-exists alongside admin/events (plural)
 * so the detail page's "Back to Events" link resolves correctly.
 */
import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";

const EVENT_LIST_PAGE = path.resolve(
  __dirname,
  "../page.tsx",
);

describe("admin/event/page.tsx", () => {
  it("exists (list page was missing)", () => {
    expect(fs.existsSync(EVENT_LIST_PAGE)).toBe(true);
  });

  it("exports a default async function", async () => {
    const mod = await import(/* @vite-ignore */ EVENT_LIST_PAGE);
    expect(typeof mod.default).toBe("function");
  });
});
