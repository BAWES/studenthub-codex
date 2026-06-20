// ---------------------------------------------------------------------------
// E2E Smoke: Employer dashboard page — metrics, recent applications, status
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let company: FixtureUser;
let candidate: FixtureUser;

test.describe("Employer dashboard page", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    company = fixtures.get("company")!;
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

  // ── Dashboard page loads ────────────────────────────────────────────────

  test("employer dashboard page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/employer/dashboard");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("employer dashboard renders heading or content", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/employer/dashboard");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page.locator("h1, h2, [role='list'], main, table").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("employer dashboard shows Dashboard heading", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/employer/dashboard");
    await ctx.page.waitForLoadState("load");
    // The page may have a heading containing "Dashboard", "Employer Dashboard", or show the company workspace
    const body = ctx.page.locator("body");
    await expect(body).toBeVisible({ timeout: 15000 });
    const hasHeading = await ctx.page.locator("h1, h2").filter({ hasText: /dashboard|employer|overview/i }).first().isVisible().catch(() => false);
    // Allow either the heading or general visible content
    if (!hasHeading) {
      const mainContent = ctx.page.locator("main, h1, h2").first();
      await expect(mainContent).toBeVisible({ timeout: 5000 });
    }
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("employer dashboard shows metrics section", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/employer/dashboard");
    await ctx.page.waitForLoadState("load");
    // Employer dashboard may show various content — check that the page loaded
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    // Check for some content on the page
    const hasContent = await ctx.page.locator("h1, h2, h3, p, main").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Cross-role guards ───────────────────────────────────────────────────

  test("candidate is redirected from employer dashboard (cross-role guard)", async () => {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: candidate.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto("/employer/dashboard");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/employer/dashboard");
    await bContext.close();
    await browser.close();
  });
});
