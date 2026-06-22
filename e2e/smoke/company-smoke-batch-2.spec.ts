// ---------------------------------------------------------------------------
// E2E Smoke Batch 2: Company companies, requests, workspace, search
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Verifies company list pages load without React hydration/serialization errors.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let company: FixtureUser;
let candidate: FixtureUser;

test.describe("Company smoke batch 2 — companies, requests, workspace, search", () => {
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
    const bad = errors.filter(
      (m) =>
        m.includes("hydration") ||
        m.includes("serialization") ||
        m.includes("Functions cannot be passed"),
    );
    expect(bad).toEqual([]);
  }

  // ── Company Companies list page ────────────────────────────────────────

  test("company companies list page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/companies");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company companies list page renders heading or content", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/companies");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page.locator("h1, h2, table, [role='list'], main").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Company Requests list page ─────────────────────────────────────────

  test("company requests list page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/requests");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company requests list page renders heading or content", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/requests");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page.locator("h1, h2, table, [role='list'], main, ul").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Company Workspace page ─────────────────────────────────────────────

  test("company workspace page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/workspace");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company workspace page renders welcome message or content", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/workspace");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page.locator("h1, h2, table, [role='list'], main, section").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Company Search page ────────────────────────────────────────────────

  test("company search page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/search");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company search page renders heading or content", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/search");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page.locator("h1, h2, input[type='search'], input[placeholder*='Search'], input[placeholder*='search'], main").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Cross-role guards ──────────────────────────────────────────────────

  test("candidate is redirected from company requests (cross-role guard)", async () => {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: candidate.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto("/company/requests");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/company/requests");
    await bContext.close();
    await browser.close();
  });

  test("candidate is redirected from company workspace (cross-role guard)", async () => {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: candidate.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto("/company/workspace");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/company/workspace");
    await bContext.close();
    await browser.close();
  });

  test("candidate is redirected from company search (cross-role guard)", async () => {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: candidate.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto("/company/search");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/company/search");
    await bContext.close();
    await browser.close();
  });
});
