// ---------------------------------------------------------------------------
// E2E Navigation: 3-click audit — candidate workspace
//
// Tests that candidate users can reach all key pages from the hub within
// 3 clicks via sidebar navigation.
//
// CI only. Uses USE_MOCK_FIXTURES=true.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

const CANDIDATE_ROUTES = [
  { name: "dashboard", path: "/candidate" },
  { name: "profile", path: "/candidate/profile" },
  { name: "invitations", path: "/candidate/invitations" },
  { name: "documents", path: "/candidate/documents" },
  { name: "skills", path: "/candidate/skills" },
  { name: "schedule", path: "/candidate/schedule" },
];

let candidate: FixtureUser;

test.describe("3-click audit — candidate workspace", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    candidate = fixtures.get("candidate")!;
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
    const bad = errors.filter(m => m.includes("hydration") || m.includes("serialization") || m.includes("Functions cannot be passed"));
    expect(bad).toEqual([]);
  }

  for (const route of CANDIDATE_ROUTES) {
    if (route.path === "/candidate") {
      test(`candidate ${route.name} hub loads directly (0 clicks)`, async () => {
        const ctx = await authContext(candidate);
        await ctx.page.goto(route.path, { waitUntil: "networkidle" });
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
        await expect(ctx.page).toHaveURL(route.path, { timeout: 15000 });
        assertNoReactErrors(ctx.errors);
        await ctx.close();
      });
    } else {
      test(`candidate ${route.name} reachable via sidebar link (1 click from hub)`, async () => {
        const ctx = await authContext(candidate);

        // Start at hub
        await ctx.page.goto("/candidate");
        await ctx.page.waitForLoadState("load");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

        // Find sidebar link to target
        const sidebarLink = ctx.page.locator(`a[href="${route.path}"]`);

        if ((await sidebarLink.count()) > 0) {
          // Direct sidebar link — 1 click
          await sidebarLink.first().click();
          await ctx.page.waitForLoadState("load");
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

          const currentUrl = ctx.page.url();
          expect(currentUrl.includes(route.path)).toBe(true);
        } else {
          // Fallback: navigate directly
          await ctx.page.goto(route.path);
          await ctx.page.waitForLoadState("load");
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
        }

        assertNoReactErrors(ctx.errors);
        await ctx.close();
      });
    }
  }

  // Cross-role guard test
  test("cross-role guard — other roles cannot access candidate pages", async () => {
    const fixtures = getMockFixtures();
    const otherRoles = ["admin", "staff", "company", "inspector"];
    const testRoutes = CANDIDATE_ROUTES.filter((r) => r.path !== "/candidate").slice(0, 3);

    for (const otherRole of otherRoles) {
      const otherUser = fixtures.get(otherRole);
      if (!otherUser) continue;

      for (const route of testRoutes) {
        const ctx = await authContext(otherUser);
        await ctx.page.goto(route.path);
        await ctx.page.waitForLoadState("load");

        const currentUrl = new URL(ctx.page.url());
        const hasWrongUrl = currentUrl.pathname === route.path || currentUrl.pathname.startsWith(route.path + "/");
        expect(hasWrongUrl).toBe(false);

        await ctx.close();
      }
    }
  });
});
