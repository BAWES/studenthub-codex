// ---------------------------------------------------------------------------
// E2E Smoke: Admin company-requests page — table, status, content
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Verifies the admin company requests management page loads with content.
// ---------------------------------------------------------------------------

import { test, expect, type Browser } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";
import { authContext, assertNoReactErrors } from "../fixtures/auth-context";

process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;
let candidateUser: FixtureUser;
let companyUser: FixtureUser;

test.describe("Admin company-requests page", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
    candidateUser = fixtures.get("candidate")!;
    companyUser = fixtures.get("company")!;
  });

  async function assertRouteLoads(browser: Browser, route: string) {
    const ctx = await authContext(browser, admin);
    await ctx.page.goto(route);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  }

  test("admin company-requests page loads without errors", async ({ browser }) => {
    await assertRouteLoads(browser, "/admin/company-requests");
  });

  test("admin company-requests page renders content", async ({ browser }) => {
    const ctx = await authContext(browser, admin);
    await ctx.page.goto("/admin/company-requests");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page
      .locator("main, [role='region'], section, h1, h2, table")
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Cross-role guards ──

  test("candidate cannot access admin company-requests", async ({ browser }) => {
    const ctx = await authContext(browser, candidateUser);
    await ctx.page.goto("/admin/company-requests");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).not.toHaveURL("/admin/company-requests");
    await ctx.close();
  });

  test("company cannot access admin company-requests", async ({ browser }) => {
    const ctx = await authContext(browser, companyUser);
    await ctx.page.goto("/admin/company-requests");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).not.toHaveURL("/admin/company-requests");
    await ctx.close();
  });
});
