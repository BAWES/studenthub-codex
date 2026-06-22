// ---------------------------------------------------------------------------
// E2E Smoke: Staff company relations — requests and detail pages
//
// CI only. Uses USE_MOCK_FIXTURES=true.
// ---------------------------------------------------------------------------

import { test, expect, type Browser } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";
import { authContext, assertNoReactErrors } from "../fixtures/auth-context";

process.env.USE_MOCK_FIXTURES = "true";

let staff: FixtureUser;
let candidateUser: FixtureUser;
let companyUser: FixtureUser;

test.describe("Staff company relations", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    staff = fixtures.get("staff")!;
    candidateUser = fixtures.get("candidate")!;
    companyUser = fixtures.get("company")!;
  });

  async function assertRouteLoads(browser: Browser, route: string) {
    const ctx = await authContext(browser, staff);
    await ctx.page.goto(route);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  }

  test("staff hub loads with pipeline content", async ({ browser }) => {
    const ctx = await authContext(browser, staff);
    await ctx.page.goto("/staff");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    // Pipeline table / workspace shell should be present
    const hasContent = await ctx.page
      .locator("main, [role='region'], table, section")
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff requests list loads without errors", async ({ browser }) => {
    await assertRouteLoads(browser, "/staff/requests");
  });

  test("staff requests list renders table or heading", async ({ browser }) => {
    const ctx = await authContext(browser, staff);
    await ctx.page.goto("/staff/requests");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page
      .locator("h1, h2, table, [role='list'], main, [role='grid']")
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff interactions page loads without errors", async ({ browser }) => {
    await assertRouteLoads(browser, "/staff/interviews");
  });

  // ── Cross-role guards ──

  test("candidate cannot access staff hub (company-relations guard)", async ({ browser }) => {
    const ctx = await authContext(browser, candidateUser);
    await ctx.page.goto("/staff");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).not.toHaveURL("/staff");
    await ctx.close();
  });

  test("company user cannot access staff requests (company-relations guard)", async ({ browser }) => {
    const ctx = await authContext(browser, companyUser);
    await ctx.page.goto("/staff/requests");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).not.toHaveURL("/staff/requests");
    await ctx.close();
  });
});
