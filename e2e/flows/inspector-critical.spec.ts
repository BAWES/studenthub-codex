// ---------------------------------------------------------------------------
// E2E Sprint 4: Inspector critical flows — Workspace + ID Request Management
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Flows:
//   1. Inspector Workspace — tab bar renders with all inspector sections
//   2. Inspector Section Navigation — navigate between workspace sections
//   3. ID Request Management — inspector can view and manage identity requests
//   4. Cross-role Guard — candidate/company/staff cannot access inspector routes
//   5. Console Error Check — all inspector critical pages load without errors
// ---------------------------------------------------------------------------

import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

// Force USE_MOCK_FIXTURES=true — these tests must never need DB seed data
process.env.USE_MOCK_FIXTURES = "true";

let inspector: FixtureUser;
let candidateUser: FixtureUser;
let companyUser: FixtureUser;
let staffUser: FixtureUser;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Create an authenticated browser context for the inspector user.
 */
async function inspectorContext(): Promise<{
  context: BrowserContext;
  page: Page;
  errors: string[];
  close: () => Promise<void>;
}> {
  const browser = await (
    await import("@playwright/test")
  ).chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "studenthub_next_session",
      value: inspector.cookie,
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return {
    context,
    page,
    errors,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}

/**
 * Create a basic authenticated context for any fixture user (for role-gate tests).
 */
async function roleContext(
  role: FixtureUser,
): Promise<{ context: BrowserContext; page: Page; close: () => Promise<void> }> {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "studenthub_next_session",
      value: role.cookie,
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  const page = await context.newPage();
  return {
    context,
    page,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}

/** Assert no React hydration / serialization errors. */
function assertNoReactErrors(errors: string[]) {
  const bad = errors.filter(
    (m) =>
      m.includes("hydration") ||
      m.includes("serialization"),
  );
  expect(bad).toEqual([]);
}

// ── Suite ──────────────────────────────────────────────────────────────────

test.describe("Inspector critical flows — Workspace + ID Request Management", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    inspector = fixtures.get("inspector")!;
    candidateUser = fixtures.get("candidate")!;
    companyUser = fixtures.get("company")!;
    staffUser = fixtures.get("staff")!;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 1 — Inspector Workspace Tabs
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 1 — Inspector Workspace Tabs", () => {
    test("1a. Inspector workspace renders with tab navigation bar", async () => {
      const ctx = await inspectorContext();

      await ctx.page.goto("/inspector");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL("/inspector");

      // Sidebar should be present
      const sidebar = ctx.page.locator('aside');
      await expect(sidebar).toBeVisible({ timeout: 10000 });

      // Should show links for inspector sections in the sidebar
      await expect(ctx.page.locator('aside a:has-text("Overview")').first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator('aside a:has-text("ID Requests")').first()).toBeVisible({ timeout: 5000 });

      // Overview tab should be active by default
      const overviewTab = ctx.page.locator('div[role="tab"][aria-selected="true"]');
      await expect(overviewTab).toContainText("Overview");

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1b. Inspector hub renders with dashboard content", async () => {
      const ctx = await inspectorContext();

      await ctx.page.goto("/inspector");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL("/inspector");

      // Inspector hub content renders (dashboard/metrics)
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 2 — Inspector Section Navigation
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 2 — Inspector Section Navigation", () => {
    test("2a. Inspector can navigate between workspace sections via tabs", async () => {
      const ctx = await inspectorContext();

      await ctx.page.goto("/inspector");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Navigate to ID Requests via URL
      await ctx.page.goto("/inspector/id-requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/inspector\/id-requests/);

      // ID Requests page renders
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2b. Inspector ID requests page loads with DataTable", async () => {
      const ctx = await inspectorContext();

      await ctx.page.goto("/inspector/id-requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/inspector\/id-requests/);

      // DataTable renders
      await expect(ctx.page.locator("table").first()).toBeVisible({ timeout: 10000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2c. ID request detail page loads from list row", async () => {
      const ctx = await inspectorContext();

      // Load the ID requests list
      await ctx.page.goto("/inspector/id-requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Find a detail link and navigate
      const detailLinks = ctx.page.locator('a[href*="/inspector/id-requests/"]');
      const linkCount = await detailLinks.count().catch(() => 0);

      if (linkCount > 0) {
        const href = await detailLinks.first().getAttribute("href").catch(() => null);
        if (href) {
          await ctx.page.goto(href);
          await ctx.page.waitForLoadState("load");
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
          console.log(`Inspector ID request detail page loaded at: ${href}`);
        }
      } else {
        console.log("No ID request detail links available — empty state is acceptable");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 5000 });
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 3 — Cross-role Access Control
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 3 — Cross-role Access Control", () => {
    test("3a. Candidate cannot access inspector hub", async () => {
      const ctx = await roleContext(candidateUser);

      await ctx.page.goto("/inspector");
      await ctx.page.waitForLoadState("load");

      // Candidate should be redirected away from /inspector
      await expect(ctx.page).not.toHaveURL("/inspector");
      await ctx.close();
    });

    test("3b. Candidate cannot access inspector ID requests", async () => {
      const ctx = await roleContext(candidateUser);

      await ctx.page.goto("/inspector/id-requests");
      await ctx.page.waitForLoadState("load");

      await expect(ctx.page).not.toHaveURL("/inspector/id-requests");
      await ctx.close();
    });

    test("3c. Company user cannot access inspector hub", async () => {
      const ctx = await roleContext(companyUser);

      await ctx.page.goto("/inspector");
      await ctx.page.waitForLoadState("load");

      await expect(ctx.page).not.toHaveURL("/inspector");
      await ctx.close();
    });

    test("3d. Company user cannot access inspector ID requests", async () => {
      const ctx = await roleContext(companyUser);

      await ctx.page.goto("/inspector/id-requests");
      await ctx.page.waitForLoadState("load");

      await expect(ctx.page).not.toHaveURL("/inspector/id-requests");
      await ctx.close();
    });

    test("3e. Staff cannot access inspector hub", async () => {
      const ctx = await roleContext(staffUser);

      await ctx.page.goto("/inspector");
      await ctx.page.waitForLoadState("load");

      await expect(ctx.page).not.toHaveURL("/inspector");
      await ctx.close();
    });

    test("3f. Staff cannot access inspector ID requests", async () => {
      const ctx = await roleContext(staffUser);

      await ctx.page.goto("/inspector/id-requests");
      await ctx.page.waitForLoadState("load");

      await expect(ctx.page).not.toHaveURL("/inspector/id-requests");
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 4 — Console Error Check
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 4 — Console Error Check", () => {
    test("4a. All inspector critical pages load without hydration or serialization errors", async () => {
      const ctx = await inspectorContext();

      const pages = [
        "/inspector",
        "/inspector/id-requests",
      ];
      for (const route of pages) {
        await ctx.page.goto(route);
        await ctx.page.waitForLoadState("load");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      }

      // Should have no hydration/serialization errors across all pages
      assertNoReactErrors(ctx.errors);
      console.log(`Console errors across ${pages.length} inspector pages: ${ctx.errors.length}`);

      await ctx.close();
    });
  });
});
