// ---------------------------------------------------------------------------
// E2E Smoke: Employer workspace pages — jobs listing, creation, and guards
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let company: FixtureUser;
let candidate: FixtureUser;

test.describe("Employer workspace pages", () => {
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

  // ── Jobs listing page ───────────────────────────────────────────────────

  test("employer jobs listing page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/employer/jobs");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("employer jobs listing renders heading or content", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/employer/jobs");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page.locator("h1, h2, table, [role='list'], main").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("employer jobs listing shows Job Postings heading", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/employer/jobs");
    await ctx.page.waitForLoadState("load");
    const heading = ctx.page.locator("h1, h2").filter({ hasText: "Job Postings" });
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── New job posting page ────────────────────────────────────────────────

  test("employer new job page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/employer/jobs/new");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("employer new job page renders New Job Posting heading", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/employer/jobs/new");
    await ctx.page.waitForLoadState("load");
    const heading = ctx.page.locator("h1").filter({ hasText: "New Job Posting" });
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Workspace root ──────────────────────────────────────────────────────

  test("employer workspace page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/employer");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Cross-role guards ───────────────────────────────────────────────────

  test("candidate is redirected from employer jobs (cross-role guard)", async () => {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: candidate.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto("/employer/jobs");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/employer/jobs");
    await bContext.close();
    await browser.close();
  });

  test("candidate is redirected from employer new job (cross-role guard)", async () => {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: candidate.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto("/employer/jobs/new");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/employer/jobs/new");
    await bContext.close();
    await browser.close();
  });
});
