// ---------------------------------------------------------------------------
// E2E Smoke: Company company-settings page
//
// CI only. Uses USE_MOCK_FIXTURES=true.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let company: FixtureUser;

test.describe("Company settings page", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    company = fixtures.get("company")!;
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

  test("company settings page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/company-settings");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company settings page renders heading or content", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/company/company-settings");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page.locator("h1, h2, table, [role='list'], main, form").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });
});
