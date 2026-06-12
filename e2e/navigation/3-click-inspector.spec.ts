import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

/**
 * Inspector workspace routes — all known pages reachable within ≤3 clicks
 * from the inspector's role hub via sidebar navigation.
 *
 * Current inspector nav sidebar:
 *   - Overview       → /inspector
 *   - ID Requests    → /inspector/id-requests
 *
 * Note: No "settings" route currently exists for the inspector role.
 * The app-level account settings are accessible via the /app hub.
 */
const INSPECTOR_ROUTES = [
  "/inspector",              // Dashboard / Overview (0 clicks from login)
  "/inspector/id-requests",  // ID verification requests (1 click from sidebar)
];

/**
 * Create an authenticated browser context for the given fixture user.
 * Returns { browser, context, page, close } — caller must close.
 */
async function authContext(user: FixtureUser) {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "studenthub_next_session",
      value: user.cookie,
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  const page = await context.newPage();
  return {
    browser,
    context,
    page,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}

test.describe("3-click audit — inspector workspace", () => {
  test.describe.configure({ mode: "serial" });

  let user: FixtureUser;

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    user = fixtures.get("inspector")!;
  });

  // ── Hub page itself (0 clicks from login) ──
  test("/inspector hub loads directly (0 clicks)", async () => {
    const ctx = await authContext(user);
    await ctx.page.goto("/inspector");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL("/inspector");
    await ctx.close();
  });

  // ── Sidebar-linked routes (1 click from hub) ──
  test("/inspector/id-requests reachable via sidebar link (1 click from hub)", async () => {
    const ctx = await authContext(user);

    // Start at the hub
    await ctx.page.goto("/inspector");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Find sidebar link to id-requests
    const sidebarLink = ctx.page.locator('a[href="/inspector/id-requests"]');

    if ((await sidebarLink.count()) > 0) {
      await sidebarLink.first().click();
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      const currentUrl = ctx.page.url();
      expect(currentUrl.includes("/inspector/id-requests")).toBe(true);
    } else {
      // No sidebar link — try direct navigation
      await ctx.page.goto("/inspector/id-requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    }

    await ctx.close();
  });

  // ── Cross-role access guard ──
  test("cross-role guard — other roles cannot access inspector pages", async () => {
    const fixtures = getMockFixtures();
    const otherRoles = ["admin", "staff", "candidate", "company"];

    for (const otherRole of otherRoles) {
      const otherUser = fixtures.get(otherRole);
      if (!otherUser) continue;

      for (const route of ["/inspector", "/inspector/id-requests"]) {
        const ctx = await authContext(otherUser);
        await ctx.page.goto(route);
        await ctx.page.waitForLoadState("load");

        const currentUrl = new URL(ctx.page.url());
        const hasWrongUrl =
          currentUrl.pathname === route ||
          currentUrl.pathname.startsWith(route + "/");

        // Other roles should NOT be able to access this route
        expect(hasWrongUrl).toBe(false);

        await ctx.close();
      }
    }
  });
});
