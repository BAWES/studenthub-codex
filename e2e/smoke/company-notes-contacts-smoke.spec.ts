// ---------------------------------------------------------------------------
// E2E Smoke: Company notes and contacts pages
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Verifies /company/notes and /company/contacts list pages load
// without React hydration/serialization errors.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let company: FixtureUser;
let candidate: FixtureUser;

test.describe("Company notes and contacts pages", () => {
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

  // ── Company Notes list page ─────────────────────────────────────────────

  test("company notes list page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/notes");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company notes list page renders heading or content", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/notes");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page.locator("h1, h2, table, [role='list'], main").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Company Contacts list page ──────────────────────────────────────────

  test("company contacts list page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/contacts");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company contacts list page renders heading or content", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/contacts");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page.locator("h1, h2, table, [role='list'], main").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company contacts list page shows Linked Contacts heading", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/contacts");
    await ctx.page.waitForLoadState("load");
    const heading = ctx.page.locator("h1, h2").filter({ hasText: "Linked Contacts" });
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Cross-role guards ───────────────────────────────────────────────────

  test("candidate is redirected from company notes (cross-role guard)", async () => {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: candidate.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto("/company/notes");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/company/notes");
    await bContext.close();
    await browser.close();
  });
});
