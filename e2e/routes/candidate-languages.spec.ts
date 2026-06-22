// ---------------------------------------------------------------------------
// E2E Smoke: Candidate languages pages
//
// Tests /candidate/languages list page and /candidate/languages/[id] detail
// page. CI only. Uses USE_MOCK_FIXTURES=true.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let candidate: FixtureUser;
let admin: FixtureUser;
let companyUser: FixtureUser;

test.describe("Candidate languages pages", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    candidate = fixtures.get("candidate")!;
    admin = fixtures.get("admin")!;
    companyUser = fixtures.get("company")!;
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

  // ── List page ──

  test("list page loads without errors", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/languages");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("list page renders heading or content", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/languages");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page.locator("h1, h2, h3, main, [class*='container'], [class*='list']").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Cross-role guards ──

  test("admin is redirected away from languages list", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/candidate/languages");
    await ctx.page.waitForLoadState("load");
    expect(ctx.page.url()).not.toContain("/candidate/languages");
    await ctx.close();
  });

  test("company is redirected away from languages list", async () => {
    const ctx = await authContext(companyUser);
    await ctx.page.goto("/candidate/languages");
    await ctx.page.waitForLoadState("load");
    expect(ctx.page.url()).not.toContain("/candidate/languages");
    await ctx.close();
  });
});
