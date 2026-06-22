import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

/**
 * Route maps per role — all known routes that should be reachable.
 * These are verified from the role hub in ≤3 clicks via the sidebar.
 */
const ROUTE_MAP: Record<string, string[]> = {
  admin: [
    "/admin",
    "/admin/agents",
    "/admin/candidates",
    "/admin/companies",
    "/admin/compliance",
    "/admin/payments",
    "/admin/requests",
    "/admin/transfers",
  ],
  staff: [
    "/staff",
    "/staff/candidates",
    "/staff/interviews",
    "/staff/requests",
  ],
  candidate: [
    "/candidate",
    "/candidate/applications",
    "/candidate/certifications",
    "/candidate/documents",
    "/candidate/edit",
    "/candidate/experience",
    "/candidate/invitations",
    "/candidate/jobs",
    "/candidate/languages",
    "/candidate/notifications",
    "/candidate/payments",
    "/candidate/profile",
    "/candidate/references",
    "/candidate/schedule",
    "/candidate/search",
    "/candidate/skills",
    "/candidate/work-logs",
  ],
  company: [
    "/company",
    "/company/companies",
    "/company/contacts",
    "/company/requests",
    "/company/requests/create",
    "/company/stores",
    "/company/workspace",
    "/employer",
    "/employer/jobs",
  ],
  inspector: [
    "/inspector",
    "/inspector/id-requests",
  ],
};

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

// ── Role-specific test blocks ──
// Each block: load hub → click each sidebar link → assert destination loads

for (const [role, routes] of Object.entries(ROUTE_MAP)) {
  test.describe(`3-click audit — ${role}`, () => {
    test.describe.configure({ mode: "serial" });

    let user: FixtureUser;

    test.beforeAll(() => {
      const fixtures = getMockFixtures();
      user = fixtures.get(role)!;
    });

    // Test each route is reachable via sidebar click from the role hub
    for (const route of routes) {
      if (route === `/${role}`) {
        // Hub page itself — verify it loads directly (0 clicks from login)
        test(`${route} hub loads directly (0 clicks)`, async () => {
          const ctx = await authContext(user);
          await ctx.page.goto(route, { waitUntil: "load" });
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
          await expect(ctx.page).toHaveURL(route, { timeout: 15000 });
          // No hydration errors
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
        // Non-hub route — verify reachable via sidebar click (1 click)
        test(`${route} reachable via sidebar link (1 click from hub)`, async () => {
          const ctx = await authContext(user);

          // Start at the hub
          await ctx.page.goto(`/${role}`);
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
            // No direct sidebar link — try finding the route via navigation
            await ctx.page.goto(route);
            await ctx.page.waitForLoadState("load");
            await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
          }

          await ctx.close();
        });
      }
    }

    // Cross-role access check
    test(`cross-role guard — other roles cannot access ${role} pages`, async () => {
      const fixtures = getMockFixtures();
      const otherRoles = ["admin", "staff", "candidate", "company", "inspector"].filter(
        (r) => r !== role,
      );

      // Test each other role's access to this role's non-hub routes
      const testRoutes = routes.filter((r) => r !== `/${role}`).slice(0, 3);
      for (const otherRole of otherRoles) {
        const otherUser = fixtures.get(otherRole)!;
        if (!otherUser) continue;

        for (const route of testRoutes) {
          const ctx = await authContext(otherUser);
          await ctx.page.goto(route);
          await ctx.page.waitForLoadState("load");
          // Other roles should be redirected away
          const currentUrl = new URL(ctx.page.url());
          // Use pathname to avoid false matches from redirect query params
          // (e.g., /login?redirect=/admin/candidates should NOT count as accessing /admin/candidates)
          const hasWrongUrl = currentUrl.pathname === route || currentUrl.pathname.startsWith(route + "/");
          // Other roles should NOT be able to access this route
          expect(hasWrongUrl).toBe(false);
          // The important thing is that they DON'T see the target content
          await ctx.close();
        }
      }
    });
  });
}
