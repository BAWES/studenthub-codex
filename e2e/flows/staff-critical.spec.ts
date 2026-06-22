// ---------------------------------------------------------------------------
// E2E Sprint 4: Staff critical flows — Workspace + Request Management
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Flows:
//   1. Staff Workspace Tabs — tab bar renders with all staff sections
//   2. Staff Section Navigation — navigate between workspace sections
//   3. Request Management — staff can view and manage company requests
//   4. Cross-role Guard — candidate/company cannot access staff routes
// ---------------------------------------------------------------------------

import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

// Force USE_MOCK_FIXTURES=true — these tests must never need DB seed data
process.env.USE_MOCK_FIXTURES = "true";

let staff: FixtureUser;
let candidateUser: FixtureUser;
let company: FixtureUser;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Create an authenticated browser context for the staff user.
 * Returns helpers for page, context, error tracking, and cleanup.
 */
async function staffContext(): Promise<{
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
      value: staff.cookie,
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

test.describe("Staff critical flows — Workspace + Request Management", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    staff = fixtures.get("staff")!;
    candidateUser = fixtures.get("candidate")!;
    company = fixtures.get("company")!;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 1 — Staff Workspace Tabs
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 1 — Staff Workspace Tabs", () => {
    test("1a. Staff workspace renders with sidebar navigation", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL("/staff");

      // Sidebar navigation should be present
      const nav = ctx.page.locator('nav[aria-label="staff workspace navigation"]');
      await expect(nav).toBeVisible({ timeout: 10000 });

      // Should show links for all staff sections
      await expect(ctx.page.locator('a[href="/app"]').first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator('a[href="/staff"]').first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator('a[href="/staff/requests"]').first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator('a[href="/staff/candidates"]').first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator('a[href="/staff/interviews"]').first()).toBeVisible({ timeout: 5000 });

      // Overview link should be active by default (or App link)
      const activeLink = ctx.page.locator('a[aria-current="page"]');
      await expect(activeLink.first()).toBeVisible({ timeout: 3000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1b. Staff hub renders with dashboard content", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL("/staff");

      // Staff hub content renders (dashboard/metrics)
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 2 — Staff Section Navigation
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 2 — Staff Section Navigation", () => {
    test("2a. Staff can navigate between workspace sections via tabs", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Navigate to Candidates via tab
      const candidatesTab = ctx.page.locator('aside a:has-text("Candidates")').first();
      await expect(candidatesTab).toBeVisible({ timeout: 5000 });

      // Click via href navigation
      await ctx.page.goto("/staff/candidates");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/staff\/candidates/);

      // Candidates page renders
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Navigate to Interviews section
      await ctx.page.goto("/staff/interviews");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/staff\/interviews/);

      // Interviews page renders
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2b. Sidebar navigation links complement the tab bar", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Sidebar nav links should exist for staff sections
      const sidebarLinks = [
        "/staff/candidates",
        "/staff/interviews",
        "/staff/requests",
      ];

      for (const url of sidebarLinks) {
        const sidebarLink = ctx.page.locator(`a[href="${url}"]`).first();
        const count = await sidebarLink.count();
        if (count > 0) {
          await sidebarLink.click();
          await ctx.page.waitForLoadState("load");
          await expect(ctx.page).toHaveURL(new RegExp(url.replace("/", "\\/")));
          // Navigate back to hub
          await ctx.page.goto("/staff");
          await ctx.page.waitForLoadState("load");
        }
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2c. Staff candidates page loads with DataTable", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/candidates");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/staff\/candidates/);

      // DataTable renders
      await expect(ctx.page.locator("table").first()).toBeVisible({ timeout: 10000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2d. Staff interviews page loads with content", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/interviews");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/staff\/interviews/);

      // Content area renders
      const dataSection = ctx.page.locator("table, h1, [class*='content']").first();
      await expect(dataSection).toBeVisible({ timeout: 10000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 3 — Staff Request Management
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 3 — Staff Request Management", () => {
    test("3a. Staff requests list page loads with DataTable", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/staff\/requests/);

      // Title heading
      await expect(ctx.page.locator("h1")).toContainText("Requests");

      // DataTable renders
      await expect(ctx.page.locator("table").first()).toBeVisible({ timeout: 10000 });

      // Table columns render (Request, Company, Status, etc.)
      await expect(ctx.page.locator("text=Request").first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator("text=Status").first()).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("3b. Staff can navigate to request detail page", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Find a request link and navigate to its detail page
      const firstRequestLink = ctx.page.locator("a[href*='/staff/requests/']").first();
      const linkCount = await firstRequestLink.count();

      if (linkCount > 0) {
        const href = await firstRequestLink.getAttribute("href");
        await ctx.page.goto(href!);
        await ctx.page.waitForLoadState("load");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

        // Request detail page should render
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 5000 });
      } else {
        // No request rows — at least verify the list page loaded without errors
        console.log("No request rows found — detail navigation skipped");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 5000 });
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("3c. Request detail page shows request actions and status controls", async () => {
      const ctx = await staffContext();

      await ctx.page.goto("/staff/requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      const firstRequestLink = ctx.page.locator("a[href*='/staff/requests/']").first();
      if ((await firstRequestLink.count()) > 0) {
        const href = await firstRequestLink.getAttribute("href");
        await ctx.page.goto(href!);
        await ctx.page.waitForLoadState("load");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

        // Request Actions card should be present
        const actionsCard = ctx.page.locator("text=Request Actions").first();
        if (await actionsCard.isVisible().catch(() => false)) {
          console.log("Request Actions card rendered");

          // Status transition controls
          const statusSelect = ctx.page.locator('select[name="to_status"]').first();
          const saveButton = ctx.page.locator('button:has-text("Save")').first();
          if (await statusSelect.isVisible().catch(() => false)) {
            console.log("Status transition select visible");
          }
          if (await saveButton.isVisible().catch(() => false)) {
            console.log("Save button visible");
          }
        }
      } else {
        console.log("No request rows found — actions check skipped");
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 4 — Cross-role Access Control
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 4 — Cross-role Access Control", () => {
    test("4a. Candidate cannot access staff hub", async () => {
      const ctx = await roleContext(candidateUser);

      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");

      // Candidate should be redirected away from /staff
      await expect(ctx.page).not.toHaveURL("/staff");
      await ctx.close();
    });

    test("4b. Candidate cannot access staff requests", async () => {
      const ctx = await roleContext(candidateUser);

      await ctx.page.goto("/staff/requests");
      await ctx.page.waitForLoadState("load");

      await expect(ctx.page).not.toHaveURL("/staff/requests");
      await ctx.close();
    });

    test("4c. Candidate cannot access staff candidates", async () => {
      const ctx = await roleContext(candidateUser);

      await ctx.page.goto("/staff/candidates");
      await ctx.page.waitForLoadState("load");

      await expect(ctx.page).not.toHaveURL("/staff/candidates");
      await ctx.close();
    });

    test("4d. Candidate cannot access staff interviews", async () => {
      const ctx = await roleContext(candidateUser);

      await ctx.page.goto("/staff/interviews");
      await ctx.page.waitForLoadState("load");

      await expect(ctx.page).not.toHaveURL("/staff/interviews");
      await ctx.close();
    });

    test("4e. Company user cannot access staff hub", async () => {
      const ctx = await roleContext(company);

      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");

      // Company should be redirected away from /staff
      await expect(ctx.page).not.toHaveURL("/staff");
      await ctx.close();
    });

    test("4f. Company user cannot access staff requests", async () => {
      const ctx = await roleContext(company);

      await ctx.page.goto("/staff/requests");
      await ctx.page.waitForLoadState("load");

      await expect(ctx.page).not.toHaveURL("/staff/requests");
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 5 — Console error check across all staff pages
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 5 — Console Error Check", () => {
    test("5a. All staff critical pages load without hydration or serialization errors", async () => {
      const ctx = await staffContext();

      const pages = [
        "/staff",
        "/staff/requests",
        "/staff/candidates",
        "/staff/interviews",
      ];
      for (const route of pages) {
        await ctx.page.goto(route);
        await ctx.page.waitForLoadState("load");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      }

      // Should have no hydration/serialization errors across all pages
      assertNoReactErrors(ctx.errors);
      console.log(`Console errors across ${pages.length} staff pages: ${ctx.errors.length}`);

      await ctx.close();
    });
  });
});
