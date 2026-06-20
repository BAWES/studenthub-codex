// ---------------------------------------------------------------------------
// E2E Smoke batch 8: Candidate references
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Notes: candidate-applications, notifications, payments, profile-crud,
// and schedule already have individual smoke specs.
// ---------------------------------------------------------------------------

import { test, expect, type Browser } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";
import { authContext, assertNoReactErrors } from "../fixtures/auth-context";

process.env.USE_MOCK_FIXTURES = "true";

let candidate: FixtureUser;
let companyUser: FixtureUser;

test.describe("Candidate references smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    candidate = fixtures.get("candidate")!;
    companyUser = fixtures.get("company")!;
  });

  test("candidate references page loads without errors", async ({ browser }) => {
    const ctx = await authContext(browser, candidate);
    await ctx.page.goto("/candidate/references");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("candidate references page renders workspace shell", async ({ browser }) => {
    const ctx = await authContext(browser, candidate);
    await ctx.page.goto("/candidate/references");
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

  test("candidate references page shows References heading", async ({ browser }) => {
    const ctx = await authContext(browser, candidate);
    await ctx.page.goto("/candidate/references");
    await ctx.page.waitForLoadState("load");
    const heading = ctx.page.locator("h1, h2").filter({ hasText: "References" });
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("candidate references page shows expected columns", async ({ browser }) => {
    const ctx = await authContext(browser, candidate);
    await ctx.page.goto("/candidate/references");
    await ctx.page.waitForLoadState("load");
    const columnLabels = ["Name", "Company", "Position", "Added"];
    for (const label of columnLabels) {
      const el = ctx.page.locator("body").getByText(label, { exact: false });
      await expect(el.first()).toBeVisible({ timeout: 5000 });
    }
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company cannot access candidate references", async ({ browser }) => {
    const ctx = await authContext(browser, companyUser);
    await ctx.page.goto("/candidate/references");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).not.toHaveURL("/candidate/references");
    await ctx.close();
  });
});
