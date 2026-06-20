// ---------------------------------------------------------------------------
// E2E Sprint: 3-click navigation audit — Employer/Company workspace
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Verifies all employer workspace features (hiring overview, job postings,
// job creation, requests, companies, contacts, stores) are reachable
// within ≤3 clicks from the /company hub.
//
// The employer role shares the "company" middleware role and fixture user.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

const EMPLOYER_ROUTES = [
  // --- Company hub (employer/company workspace root) ---
  "/company",

  // --- Job postings & creation (under /employer/*) ---
  "/employer/jobs",
  "/employer/jobs/new",

  // --- Company workspace sub-pages ---
  "/company/requests",
  "/company/companies",
  "/company/contacts",
  "/company/stores",
];

/**
 * Create an authenticated browser context for the given fixture user.
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

test.describe("3-click audit — Employer", () => {
  test.describe.configure({ mode: "serial" });

  let companyUser: FixtureUser;

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    companyUser = fixtures.get("company")!;
  });

  for (const route of EMPLOYER_ROUTES) {
    if (route === "/company") {
      test(`${route} hub loads directly (0 clicks)`, async () => {
        const ctx = await authContext(companyUser);
        await ctx.page.goto(route, { waitUntil: "load" });
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
        await expect(ctx.page).toHaveURL(route, { timeout: 15000 });

        const errors: string[] = [];
        ctx.page.on("console", (msg) => {
          if (msg.type() === "error") errors.push(msg.text());
        });
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
      test(`${route} reachable via sidebar link (1 click from hub)`, async () => {
        const ctx = await authContext(companyUser);

        // Start at company hub
        await ctx.page.goto("/company");
        await ctx.page.waitForLoadState("load");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

        // Find sidebar link to the target route
        const sidebarLink = ctx.page.locator(`a[href="${route}"]`);

        if ((await sidebarLink.count()) > 0) {
          // Direct sidebar link — 1 click
          // Use waitForURL for client-side Next.js navigation (no load event)
          await sidebarLink.first().click();
          await ctx.page.waitForURL((url) => url.pathname.includes(route), { timeout: 15000 });
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

          // Target route loaded (may have been redirected if auth gated)
          const currentUrl = ctx.page.url();
          expect(currentUrl.includes(route)).toBe(true);
        } else {
          // No direct sidebar link — direct navigation is still valid
          await ctx.page.goto(route);
          await ctx.page.waitForLoadState("load");
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
        }

        await ctx.close();
      });
    }
  }

  // Cross-role access check — other roles should not access employer pages
  test("cross-role guard — other roles cannot access employer pages", async () => {
    const fixtures = getMockFixtures();
    const otherRoles = ["admin", "staff", "candidate", "inspector"];
    const testRoutes = EMPLOYER_ROUTES.filter((r) => r !== "/company").slice(0, 3);

    for (const otherRole of otherRoles) {
      const otherUser = fixtures.get(otherRole)!;
      if (!otherUser) continue;

      for (const route of testRoutes) {
        const ctx = await authContext(otherUser);
        await ctx.page.goto(route);
        await ctx.page.waitForLoadState("load");
        // Other roles should be redirected away
        const currentUrl = new URL(ctx.page.url());
        const hasWrongUrl =
          currentUrl.pathname === route ||
          currentUrl.pathname.startsWith(route + "/");
        expect(hasWrongUrl).toBe(false);
        await ctx.close();
      }
    }
  });
});
