// ---------------------------------------------------------------------------
// E2E Smoke batch 6: Candidate agencies, business-development,
//                    certifications, chat
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// ---------------------------------------------------------------------------

import { test, expect, type Browser } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";
import { authContext, assertNoReactErrors } from "../fixtures/auth-context";

process.env.USE_MOCK_FIXTURES = "true";

let candidate: FixtureUser;
let companyUser: FixtureUser;

test.describe("Candidate smoke batch 6", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    candidate = fixtures.get("candidate")!;
    companyUser = fixtures.get("company")!;
  });

  async function assertRouteLoads(browser: Browser, route: string) {
    const ctx = await authContext(browser, candidate);
    await ctx.page.goto(route);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  }

  // ── Agencies ───────────────────────────────────────────────────

  test("candidate agencies page loads without errors", async ({ browser }) => {
    await assertRouteLoads(browser, "/candidate/agencies");
  });

  test("candidate agencies page renders content", async ({ browser }) => {
    const ctx = await authContext(browser, candidate);
    await ctx.page.goto("/candidate/agencies");
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

  // ── Business Development ───────────────────────────────────────

  test("candidate business-development page loads without errors", async ({ browser }) => {
    await assertRouteLoads(browser, "/candidate/business-development");
  });

  test("candidate business-development page renders content", async ({ browser }) => {
    const ctx = await authContext(browser, candidate);
    await ctx.page.goto("/candidate/business-development");
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

  // ── Certifications ─────────────────────────────────────────────

  test("candidate certifications page loads without errors", async ({ browser }) => {
    await assertRouteLoads(browser, "/candidate/certifications");
  });

  test("candidate certifications page renders content", async ({ browser }) => {
    const ctx = await authContext(browser, candidate);
    await ctx.page.goto("/candidate/certifications");
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

  // ── Chat (Messages) ────────────────────────────────────────────

  test("candidate chat page loads without errors", async ({ browser }) => {
    await assertRouteLoads(browser, "/candidate/chat");
  });

  test("candidate chat page shows Messages heading", async ({ browser }) => {
    const ctx = await authContext(browser, candidate);
    await ctx.page.goto("/candidate/chat");
    await ctx.page.waitForLoadState("load");
    const heading = ctx.page.locator("h1").filter({ hasText: "Messages" });
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Cross-role guards ──

  test("company cannot access candidate agencies", async ({ browser }) => {
    const ctx = await authContext(browser, companyUser);
    await ctx.page.goto("/candidate/agencies");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).not.toHaveURL("/candidate/agencies");
    await ctx.close();
  });

  test("company cannot access candidate certifications", async ({ browser }) => {
    const ctx = await authContext(browser, companyUser);
    await ctx.page.goto("/candidate/certifications");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).not.toHaveURL("/candidate/certifications");
    await ctx.close();
  });
});
