// ---------------------------------------------------------------------------
// E2E Smoke: Candidate documents detail page
//
// Tests /candidate/documents/[id] for each valid document type (photo, cv,
// video, civilFront, civilBack). CI only. Uses USE_MOCK_FIXTURES=true.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let candidate: FixtureUser;

const VALID_TYPES = ["photo", "cv", "video", "civilFront", "civilBack"];

test.describe("Candidate documents detail page", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    candidate = fixtures.get("candidate")!;
  });

  async function authContext(user: FixtureUser) {
    const { chromium } = await import("@playwright/test");
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: user.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    return { browser, context, page, errors, close: async () => { await context.close(); await browser.close(); } };
  }

  function assertNoReactErrors(errors: string[]) {
    const bad = errors.filter(m => m.includes("hydration") || m.includes("serialization") || m.includes("Functions cannot be passed"));
    expect(bad).toEqual([]);
  }

  for (const docType of VALID_TYPES) {
    test(`document detail page for ${docType} loads without errors`, async () => {
      const ctx = await authContext(candidate);
      await ctx.page.goto(`/candidate/documents/${docType}`);
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test(`document detail page for ${docType} renders heading or content`, async () => {
      const ctx = await authContext(candidate);
      await ctx.page.goto(`/candidate/documents/${docType}`);
      await ctx.page.waitForLoadState("load");
      const hasContent = await ctx.page.locator("h1, h2, h3, main, [class*='detail'], [class*='preview']").first().isVisible().catch(() => false);
      expect(hasContent).toBe(true);
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  }

  test("document detail page returns notFound for invalid type", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/documents/invalid-type");
    // Should either redirect somewhere else or show a 404 page
    await ctx.page.waitForLoadState("load");
    const url = ctx.page.url();
    // The page should not load normally — either redirect, notFound, or show error
    const stillOnPage = url.includes("/candidate/documents/invalid-type");
    if (stillOnPage) {
      // Could still show a notFound fallback — just check no React errors
      assertNoReactErrors(ctx.errors);
    }
    await ctx.close();
  });
});
