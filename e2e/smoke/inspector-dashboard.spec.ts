// ---------------------------------------------------------------------------
// E2E Smoke: Inspector dashboard — hub, content, role guards
//
// CI only. Uses USE_MOCK_FIXTURES=true.
// ---------------------------------------------------------------------------

import { test, expect, type Browser } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";
import { authContext, assertNoReactErrors } from "../fixtures/auth-context";

process.env.USE_MOCK_FIXTURES = "true";

let inspector: FixtureUser;
let candidateUser: FixtureUser;
let companyUser: FixtureUser;

test.describe("Inspector dashboard", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    inspector = fixtures.get("inspector")!;
    candidateUser = fixtures.get("candidate")!;
    companyUser = fixtures.get("company")!;
  });

  async function assertRouteLoads(browser: Browser, route: string) {
    const ctx = await authContext(browser, inspector);
    await ctx.page.goto(route);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  }

  test("inspector dashboard loads without errors", async ({ browser }) => {
    await assertRouteLoads(browser, "/inspector");
  });

  test("inspector dashboard renders workspace shell with content", async ({ browser }) => {
    const ctx = await authContext(browser, inspector);
    await ctx.page.goto("/inspector");
    await ctx.page.waitForLoadState("load");
    // Workspace shell should show eyebrow, title, or primary content area
    const hasContent = await ctx.page
      .locator("main, [role='region'], section, h1, h2, table")
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("inspector dashboard mentions verification or ID requests", async ({ browser }) => {
    const ctx = await authContext(browser, inspector);
    await ctx.page.goto("/inspector");
    await ctx.page.waitForLoadState("load");
    // The WorkspaceShell primary section should show ID request rows
    const bodyText = await ctx.page.locator("body").innerText();
    expect(
      bodyText.toLowerCase().includes("verification") ||
        bodyText.toLowerCase().includes("id") ||
        bodyText.toLowerCase().includes("request"),
    ).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Cross-role guards ──

  test("candidate cannot access inspector dashboard", async ({ browser }) => {
    const ctx = await authContext(browser, candidateUser);
    await ctx.page.goto("/inspector");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).not.toHaveURL("/inspector");
    await ctx.close();
  });

  test("company cannot access inspector dashboard", async ({ browser }) => {
    const ctx = await authContext(browser, companyUser);
    await ctx.page.goto("/inspector");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).not.toHaveURL("/inspector");
    await ctx.close();
  });
});
