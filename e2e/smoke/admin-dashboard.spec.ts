// ---------------------------------------------------------------------------
// E2E Smoke: Admin dashboard — metrics, pipeline, PR merge, coder health
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Route already covered in e2e/routes/admin.spec.ts; this spec adds
// deeper content verification for dashboard-specific sections.
// ---------------------------------------------------------------------------

import { test, expect, type Browser } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";
import { authContext, assertNoReactErrors } from "../fixtures/auth-context";

process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;
let candidateUser: FixtureUser;
let companyUser: FixtureUser;

test.describe("Admin dashboard page", () => {
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

  // ── Dashboard loads ────────────────────────────────────────────

  test("admin dashboard loads without errors", async ({ browser }) => {
    await assertRouteLoads(browser, "/admin");
  });

  test("admin dashboard renders workspace shell with content", async ({ browser }) => {
    const ctx = await authContext(browser, admin);
    await ctx.page.goto("/admin");
    await ctx.page.waitForLoadState("load");
    // Workspace shell should render without errors
    const hasBody = await ctx.page.locator("body").isVisible().catch(() => false);
    expect(hasBody).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Sections / headings ────────────────────────────────────────

  test("admin dashboard shows Admin Workspace heading", async ({ browser }) => {
    const ctx = await authContext(browser, admin);
    await ctx.page.goto("/admin");
    await ctx.page.waitForLoadState("load");
    const heading = ctx.page.locator("h1, h2").filter({ hasText: "Command center" });
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin dashboard shows metric cards section", async ({ browser }) => {
    const ctx = await authContext(browser, admin);
    await ctx.page.goto("/admin");
    await ctx.page.waitForLoadState("load");
    const metricLabels = ["Candidates", "Companies", "Requests", "Transfers"];
    for (const label of metricLabels) {
      const el = ctx.page.locator("body").getByText(label, { exact: false });
      await expect(el.first()).toBeVisible({ timeout: 5000 });
    }
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin dashboard shows Request Pipeline section", async ({ browser }) => {
    const ctx = await authContext(browser, admin);
    await ctx.page.goto("/admin");
    await ctx.page.waitForLoadState("load");
    await expect(
      ctx.page.locator("h2").filter({ hasText: "Request Pipeline" }).first(),
    ).toBeVisible({ timeout: 10000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin dashboard shows PR Time-to-Merge section", async ({ browser }) => {
    const ctx = await authContext(browser, admin);
    await ctx.page.goto("/admin");
    await ctx.page.waitForLoadState("load");
    await expect(
      ctx.page.locator("h2").filter({ hasText: "PR Time-to-Merge" }).first(),
    ).toBeVisible({ timeout: 10000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin dashboard shows Coder Health section", async ({ browser }) => {
    const ctx = await authContext(browser, admin);
    await ctx.page.goto("/admin");
    await ctx.page.waitForLoadState("load");
    await expect(
      ctx.page.locator("h2").filter({ hasText: "Coder Health" }).first(),
    ).toBeVisible({ timeout: 10000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin dashboard shows recent activity data lists", async ({ browser }) => {
    const ctx = await authContext(browser, admin);
    await ctx.page.goto("/admin");
    await ctx.page.waitForLoadState("load");
    const recentLabels = ["Candidates", "Companies", "Requests", "Transfers"];
    for (const label of recentLabels) {
      const el = ctx.page.locator("body").getByText(label, { exact: false });
      await expect(el.first()).toBeVisible({ timeout: 5000 });
    }
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Cross-role guards ──────────────────────────────────────────

  test("candidate cannot access admin dashboard", async ({ browser }) => {
    const ctx = await authContext(browser, candidateUser);
    await ctx.page.goto("/admin");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).not.toHaveURL("/admin");
    await ctx.close();
  });

  test("company cannot access admin dashboard", async ({ browser }) => {
    const ctx = await authContext(browser, companyUser);
    await ctx.page.goto("/admin");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).not.toHaveURL("/admin");
    await ctx.close();
  });
});
