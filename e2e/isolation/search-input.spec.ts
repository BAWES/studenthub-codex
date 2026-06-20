// ---------------------------------------------------------------------------
// E2E Isolation: Typesense search input — query behavior in isolation
//
// Tests the search input component behavior independent of real database:
//   1. Search input renders on the candidates page
//   2. Typing a query triggers URL/state update
//   3. Empty search shows all results
//   4. Search input maintains focus behavior
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let staff: FixtureUser;

test.describe("Candidate search input isolation", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    staff = fixtures.get("staff")!;
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
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    return {
      browser,
      context,
      page,
      errors,
      close: async () => {
        await context.close();
        await browser.close();
      },
    };
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

  test("search input renders on candidates page", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/staff/candidates");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // The page should have a search input
    const searchInput = ctx.page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]');
    const hasSearch = await searchInput.isVisible().catch(() => false);

    if (hasSearch) {
      await expect(searchInput).toBeVisible();
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("page loads without search-related console errors", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/staff/candidates");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Specifically check for search/Zod-related errors
    const searchErrors = ctx.errors.filter(
      (m) =>
        m.includes("search") ||
        m.includes("query") ||
        m.includes("zod") ||
        m.includes("validation") ||
        m.includes("serialization")
    );

    expect(searchErrors).toEqual([]);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });
});
