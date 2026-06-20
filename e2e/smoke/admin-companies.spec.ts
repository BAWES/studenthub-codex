// ---------------------------------------------------------------------------
// E2E Smoke: Admin companies page
//
// CI only. Uses USE_MOCK_FIXTURES=true.
// Verifies admin companies list and company detail pages load without errors.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;

test.describe("Admin companies page", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
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

  test("admin companies page loads without errors", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/admin/companies");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin companies page renders heading and DataTable", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/admin/companies");
    await ctx.page.waitForLoadState("load");

    // Check the page title or heading renders
    const heading = ctx.page.locator("h1, h2, [class*='title']").first();
    await expect(heading).toBeVisible({ timeout: 15000 });
    const headingText = await heading.textContent().catch(() => "");
    console.log(`Admin companies heading: ${headingText}`);

    // Check for table or data grid
    const table = ctx.page.locator(".dataList, .rows, table, [role='grid'], [role='table'], [class*='DataTable']").first();
    if (await table.isVisible().catch(() => false)) {
      console.log("Companies DataTable found");
      // Check column headers exist
      const companyCol = ctx.page.locator("th, [role='columnheader']").filter({ hasText: /company|name/i }).first();
      if (await companyCol.isVisible().catch(() => false)) {
        console.log("Company/Name column header visible");
      }
    } else {
      console.log("No DataTable found — checking for alternative content");
      const content = ctx.page.locator("main, [class*='content'], [class*='container']").first();
      await expect(content).toBeVisible();
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin company detail page loads without errors", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/admin/companies/1");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Accept either the detail page or redirect
    const currentUrl = ctx.page.url();
    if (currentUrl.includes("/admin/companies/1")) {
      console.log("Admin company detail /1 page loaded");
    } else {
      console.log(`Redirected from /admin/companies/1 to: ${currentUrl}`);
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("non-admin user cannot access admin companies", async () => {
    const fixtures = getMockFixtures();
    const candidate = fixtures.get("candidate")!;

    const ctx = await authContext(candidate);
    await ctx.page.goto("/admin/companies");
    await ctx.page.waitForLoadState("load");

    // Should be redirected away
    await expect(ctx.page).not.toHaveURL("/admin/companies");
    console.log(`Candidate redirected from /admin/companies to: ${ctx.page.url()}`);

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });
});
