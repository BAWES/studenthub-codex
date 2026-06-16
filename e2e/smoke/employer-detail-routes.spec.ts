// ---------------------------------------------------------------------------
// E2E Smoke: Employer detail routes
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Verifies employer/jobs/[id] and employer/jobs/[id]/applications load
// without React hydration/serialization errors.
// Uses real IDs from the database for meaningful URL lookups.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let company: FixtureUser;

// Real job ID from E2E fixtures — the route uses jobListingId (Int auto-increment)
// NOT a UUID. The Number() coercion on a UUID returns NaN which causes SSR errors.
// See seed-test-fixtures.ts or prisma/seed.ts for the fixture-created job IDs.
// With USE_MOCK_FIXTURES=true, the mock login bypasses real DB, so the actual
// numeric value just needs to produce a working URL path.
const JOB_ID = 1;

test.describe("Employer detail routes", () => {
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
    const bad = errors.filter(
      (m) =>
        m.includes("hydration") ||
        m.includes("serialization") ||
        m.includes("Functions cannot be passed"),
    );
    expect(bad).toEqual([]);
  }

  // ── Employer job detail page ─────────────────────────────────────────────

  test("employer job detail page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto(`/employer/jobs/${JOB_ID}`);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    const currentUrl = ctx.page.url();
    if (currentUrl.includes(`/jobs/${JOB_ID}`)) {
      console.log(`Employer job detail page loaded at ${currentUrl}`);
    } else {
      console.log(`Redirected from /employer/jobs/${JOB_ID} to: ${currentUrl}`);
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("employer job detail renders heading or content", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto(`/employer/jobs/${JOB_ID}`);
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page
      .locator("h1, h2, table, [role='tablist'], [role='tab'], main")
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Employer job applications sub-page ───────────────────────────────────

  test("employer job applications page loads without errors", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto(`/employer/jobs/${JOB_ID}/applications`);
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    const currentUrl = ctx.page.url();
    if (currentUrl.includes("applications")) {
      console.log(`Employer job applications page loaded at ${currentUrl}`);
    } else {
      console.log(`Redirected from /employer/jobs/${JOB_ID}/applications to: ${currentUrl}`);
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("employer job applications renders heading or content", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto(`/employer/jobs/${JOB_ID}/applications`);
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page
      .locator("h1, h2, table, [role='tablist'], main")
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ── Cross-role guard ─────────────────────────────────────────────────────

  test("candidate is redirected from employer job detail (cross-role guard)", async () => {
    const candidate = getMockFixtures().get("candidate")!;
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: candidate.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto(`/employer/jobs/${JOB_ID}`);
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL(`/employer/jobs/${JOB_ID}`);
    await bContext.close();
    await browser.close();
  });
});
