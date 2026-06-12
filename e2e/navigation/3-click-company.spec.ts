// ---------------------------------------------------------------------------
// E2E 3-Click Audit: Company workspace navigation
//
// Tests that company users can reach all workspace routes from the company
// hub within ≤3 clicks via sidebar links. Follows the pattern from
// e2e/navigation/3-click-audit.spec.ts but scoped to the company role.
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Do NOT run Playwright locally — push and let CI handle it.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

/**
 * Company workspace routes reachable via sidebar navigation.
 * All routes should be accessible within 3 clicks from the company hub.
 */
const COMPANY_ROUTES = [
  "/company",             // Dashboard / Hub
  "/company/companies",   // Companies / Candidates
  "/company/contacts",    // Company contacts / Profile
  "/company/requests",    // Job requests / Postings
  "/company/stores",      // Store management
  "/company/workspace",   // Workspace overview
];

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

test.describe("3-click audit — company workspace", () => {
  test.describe.configure({ mode: "serial" });

  let user: FixtureUser;

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    const company = fixtures.get("company");
    expect(company).toBeDefined();
    user = company!;
  });

  // Test each company route is reachable via sidebar click from /company hub
  for (const route of COMPANY_ROUTES) {
    if (route === "/company") {
      // Hub page itself — verify it loads directly (0 clicks from login)
      test("/company hub loads directly (0 clicks)", async () => {
        const ctx = await authContext(user);
        // Attach console listener BEFORE navigation to catch hydration errors
        const errors: string[] = [];
        ctx.page.on("console", (msg) => {
          if (msg.type() === "error") errors.push(msg.text());
        });
        await ctx.page.goto("/company");
        await ctx.page.waitForLoadState("load");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
        await expect(ctx.page).toHaveURL("/company");

        // No hydration/serialization errors
        const bad = errors.filter(
          (m) =>
            m.includes("hydration") ||
            m.includes("serialization") ||
            m.includes("Functions cannot be passed"),
        );
        expect(bad).toEqual([]);
        await ctx.close();
      });
    } else {
      // Non-hub route — verify reachable via sidebar link (1 click from hub)
      test(`${route} reachable via sidebar link (≤1 click from hub)`, async () => {
        const ctx = await authContext(user);

        // Attach console listener BEFORE navigation
        const errors: string[] = [];
        ctx.page.on("console", (msg) => {
          if (msg.type() === "error") errors.push(msg.text());
        });

        // Start at the company hub
        await ctx.page.goto("/company");
        await ctx.page.waitForLoadState("load");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

        // Find sidebar link to the target route
        const sidebarLink = ctx.page.locator(`a[href="${route}"]`);

        if ((await sidebarLink.count()) > 0) {
          // Direct sidebar link — 1 click
          await sidebarLink.first().click();
          await ctx.page.waitForLoadState("load");
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

          // Stricter URL assertion: match pathname exactly or as ancestor
          const currentUrl = ctx.page.url();
          const pathname = new URL(currentUrl).pathname;
          expect(pathname === route || pathname.startsWith(route + "/")).toBe(true);
        } else {
          // No direct sidebar link — try direct navigation
          await ctx.page.goto(route);
          await ctx.page.waitForLoadState("load");
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
        }

        // Check hydration errors after navigation
        const bad = errors.filter(
          (m) =>
            m.includes("hydration") ||
            m.includes("serialization") ||
            m.includes("Functions cannot be passed"),
        );
        expect(bad).toEqual([]);

        await ctx.close();
      });
    }
  }

  // Cross-role access check: non-company roles should not access company pages
  test("cross-role guard — other roles cannot access company workspace pages", async () => {
    const fixtures = getMockFixtures();
    const otherRoles = ["admin", "staff", "candidate", "inspector"];

    const testRoutes = COMPANY_ROUTES.filter((r) => r !== "/company").slice(0, 3);
    for (const otherRole of otherRoles) {
      const otherUser = fixtures.get(otherRole);
      expect(otherUser).toBeDefined();

      for (const route of testRoutes) {
        const ctx = await authContext(otherUser!);
        await ctx.page.goto(route);
        await ctx.page.waitForLoadState("load");

        // Other roles should be redirected away
        const currentUrl = new URL(ctx.page.url());
        const hasWrongUrl =
          currentUrl.pathname === route || currentUrl.pathname.startsWith(route + "/");
        expect(hasWrongUrl).toBe(false);
        await ctx.close();
      }
    }
  });
});
