// ---------------------------------------------------------------------------
// E2E Smoke: Admin transfers page
//
// CI only. Uses USE_MOCK_FIXTURES=true.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;

test.describe("Admin transfers page", () => {
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

  test("admin transfers page loads without errors", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/admin/transfers");
    await ctx.page.waitForLoadState("networkidle");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin transfers page renders heading and DataTable", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/admin/transfers");
    await ctx.page.waitForLoadState("networkidle");

    // Check the page title appears
    await expect(ctx.page.locator("h2").filter({ hasText: "Start with a transfer run" })).toBeVisible({ timeout: 15000 });

    // Check the DataTable renders with expected column labels
    const table = ctx.page.locator(".dataList, .rows, table, [role='grid'], [role='table']").first();
    await expect(table).toBeVisible();
    await expect(ctx.page.locator("th, [role='columnheader']").filter({ hasText: "Company" })).toBeVisible();
    await expect(ctx.page.locator("th, [role='columnheader']").filter({ hasText: "Period" })).toBeVisible();
    await expect(ctx.page.locator("th, [role='columnheader']").filter({ hasText: "Status" })).toBeVisible();

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });
});
