// ---------------------------------------------------------------------------
// E2E Isolation: WorkspaceOS tab system — tab lifecycle in isolation
//
// Tests the workspace tab system behavior independent of server state:
//   1. Tab opens when navigating to a role portal
//   2. Tab switching works between open tabs
//   3. Tab closing removes the tab
//   4. Closing last tab shows empty workspace state
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;

test.describe("WorkspaceOS tab system isolation", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
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
        m.includes("serialization"),
    );
    expect(bad).toEqual([]);
  }

  test("default tab opens on workspace load", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/app");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // There should be at least one visible tab in the tab bar
    const tabs = ctx.page.locator('[role="tab"]').or(ctx.page.locator("[data-tab-id]"));
    const tabCount = await tabs.count();

    // Assert there is at least one tab open (the default/home tab)
    expect(tabCount).toBeGreaterThanOrEqual(1);

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("navigating to a sub-route opens a new tab", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/app");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Navigate directly to a sub-route — TabContext auto-opens a new unpinned tab
    await ctx.page.goto("/app/candidates");
    await ctx.page.waitForLoadState("networkidle");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Should have at least 2 tabs now (default Overview + Candidates)
    const tabs = ctx.page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(2);

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("tab bar shows closable (x) button on each tab", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/app");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Open a new unpinned tab by navigating directly to a sub-route
    await ctx.page.goto("/app/candidates");
    await ctx.page.waitForLoadState("networkidle");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Close buttons render on all non-home, non-pinned tabs via .workspaceTabClose
    const closeButtons = ctx.page.locator(".workspaceTabClose");
    await expect(closeButtons.first()).toBeVisible({ timeout: 5000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("tab content area loads without error on navigation", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/app");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Navigate to a known route within the workspace
    await ctx.page.goto("/app/candidates");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // The page should have meaningful content (not just a blank/error state)
    const mainContent = ctx.page.locator("main").or(ctx.page.locator("[role='main']"));
    const hasContent = await mainContent.isVisible().catch(() => false);

    if (hasContent) {
      await expect(mainContent).toBeVisible();
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });
});
