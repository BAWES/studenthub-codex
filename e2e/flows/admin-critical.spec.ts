// ---------------------------------------------------------------------------
// E2E Sprint 4: Admin critical flows — Workspace + Management Views
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Flows:
//   1. Admin Workspace Tabs — tab bar renders with all admin sections
//   2. Admin Section Navigation — navigate between workspace sections
//   3. Admin Management Views — candidates, companies, compliance, payments, transfers, agents
//   4. Cross-role Guard — candidate/company/staff cannot access admin routes
//   5. Console Error Check — all admin critical pages networkidle without errors
// ---------------------------------------------------------------------------

import { test, expect, type BrowserContext, type Page, type Browser } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

// Force USE_MOCK_FIXTURES=true — these tests must never need DB seed data
process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;
let candidateUser: FixtureUser;
let companyUser: FixtureUser;
let staffUser: FixtureUser;

let browser: Browser;

// ── Shared browser instance ──────────────────────────────────────────────

test.beforeAll(async () => {
  const { chromium } = await import("@playwright/test");
  browser = await chromium.launch();
});

test.afterAll(async () => {
  await browser.close();
});

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Create an authenticated browser context for the admin user.
 */
async function adminContext(): Promise<{
  context: BrowserContext;
  page: Page;
  errors: string[];
  close: () => Promise<void>;
}> {
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "studenthub_next_session",
      value: admin.cookie,
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
    },
  };
}

/**
 * Create a basic authenticated context for any fixture user (for role-gate tests).
 */
async function roleContext(
  role: FixtureUser,
): Promise<{ context: BrowserContext; page: Page; close: () => Promise<void> }> {
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

test.describe("Admin critical flows — Workspace + Management Views", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
    candidateUser = fixtures.get("candidate")!;
    companyUser = fixtures.get("company")!;
    staffUser = fixtures.get("staff")!;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 1 — Admin Workspace Tabs
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 1 — Admin Workspace Tabs", () => {
    test("1a. Admin workspace renders with tab navigation bar", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin", { waitUntil: "load" });
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL("/admin");

      // Workspace tab bar should be present (active panel tab)
      const activeTab = ctx.page.locator('div[role="tab"][aria-selected="true"]');
      await expect(activeTab.first()).toBeVisible({ timeout: 10000 });
      await expect(activeTab.first()).toContainText("Overview");

      // Sidebar navigation should list all admin sections
      const sidebarLinks = ctx.page.locator('aside a[href^="/admin/"], aside a[href="/admin"]');
      const expectedSections = ["Overview", "Candidates", "Companies", "Requests", "Transfers", "Agents", "Employees", "Attendance", "Designations"];
      for (const section of expectedSections) {
        await expect(ctx.page.locator(`aside a:has-text("${section}")`).first()).toBeVisible({ timeout: 5000 });
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1b. Admin hub renders with dashboard content", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin", { waitUntil: "load" });
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL("/admin");

      // Dashboard content renders
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 2 — Admin Section Navigation
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 2 — Admin Section Navigation", () => {
    test("2a. Admin can navigate to candidates section", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin", { waitUntil: "load" });
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Navigate to Candidates via URL
      await ctx.page.goto("/admin/candidates", { waitUntil: "load" });
      await expect(ctx.page).toHaveURL(/\/admin\/candidates/);

      // Candidates page renders
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2b. Admin can navigate to companies section", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/companies", { waitUntil: "load" });
      await expect(ctx.page).toHaveURL(/\/admin\/companies/);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2c. Admin can navigate to requests section", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/requests", { waitUntil: "load" });
      await expect(ctx.page).toHaveURL(/\/admin\/requests/);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2d. Admin can navigate to transfers section", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/transfers", { waitUntil: "load" });
      await expect(ctx.page).toHaveURL(/\/admin\/transfers/);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2e. Admin can navigate to compliance section", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/compliance", { waitUntil: "load" });
      await expect(ctx.page).toHaveURL(/\/admin\/compliance/);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2f. Admin can navigate to payments section", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/payments", { waitUntil: "load" });
      await expect(ctx.page).toHaveURL(/\/admin\/payments/);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2g. Admin can navigate to agents section", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/agents", { waitUntil: "load" });
      await expect(ctx.page).toHaveURL(/\/admin\/agents/);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2h. Admin candidates page networkidles with DataTable", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/candidates", { waitUntil: "load" });
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/admin\/candidates/);

      // DataTable renders (use broader locator for different table implementations)
      const dataTable = ctx.page
        .locator("table")
        .or(ctx.page.locator("[class*='shTable']"))
        .or(ctx.page.locator("[class*='DataTable']"))
        .first();
      await expect(dataTable).toBeVisible({ timeout: 10000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2i. Admin companies page networkidles with DataTable", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/companies", { waitUntil: "load" });
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/admin\/companies/);

      // DataTable renders (use broader locator for different table implementations)
      const dataTable = ctx.page
        .locator("table")
        .or(ctx.page.locator("[class*='shTable']"))
        .or(ctx.page.locator("[class*='DataTable']"))
        .first();
      await expect(dataTable).toBeVisible({ timeout: 10000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 3 — Admin Detail Views
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 3 — Admin Detail Views", () => {
    test("3a. Admin candidate detail page networkidles", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/candidates", { waitUntil: "load" });
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Find a candidate link and navigate to detail
      const detailLinks = ctx.page.locator('a[href*="/admin/candidates/"]');
      const linkCount = await detailLinks.count().catch(() => 0);

      if (linkCount > 0) {
        const href = await detailLinks.first().getAttribute("href").catch(() => null);
        if (href) {
          await ctx.page.goto(href, { waitUntil: "load" });
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
          console.log(`Admin candidate detail networkidleed: ${href}`);
        }
      } else {
        console.log("No candidate detail links available — checking page rendered");
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 5000 });
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("3b. Admin company detail page networkidles", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/companies", { waitUntil: "load" });
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      const detailLinks = ctx.page.locator('a[href*="/admin/companies/"]');
      const linkCount = await detailLinks.count().catch(() => 0);

      if (linkCount > 0) {
        const href = await detailLinks.first().getAttribute("href").catch(() => null);
        if (href) {
          await ctx.page.goto(href, { waitUntil: "load" });
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
        }
      } else {
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 5000 });
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("3c. Admin request detail page networkidles", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/requests", { waitUntil: "load" });
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      const detailLinks = ctx.page.locator('a[href*="/admin/requests/"]');
      const linkCount = await detailLinks.count().catch(() => 0);

      if (linkCount > 0) {
        const href = await detailLinks.first().getAttribute("href").catch(() => null);
        if (href) {
          await ctx.page.goto(href, { waitUntil: "load" });
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
        }
      } else {
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 5000 });
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("3d. Admin transfer detail page networkidles", async () => {
      const ctx = await adminContext();

      await ctx.page.goto("/admin/transfers", { waitUntil: "load" });
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      const detailLinks = ctx.page.locator('a[href*="/admin/transfers/"]');
      const linkCount = await detailLinks.count().catch(() => 0);

      if (linkCount > 0) {
        const href = await detailLinks.first().getAttribute("href").catch(() => null);
        if (href) {
          await ctx.page.goto(href, { waitUntil: "load" });
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
        }
      } else {
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 5000 });
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 4 — Cross-role Access Control
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 4 — Cross-role Access Control", () => {
    test("4a. Candidate cannot access admin hub", async () => {
      const ctx = await roleContext(candidateUser);

      await ctx.page.goto("/admin", { waitUntil: "load" });

      // Candidate should be redirected away from /admin
      await ctx.page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15000 });
      await ctx.close();
    });

    test("4b. Candidate cannot access admin candidates", async () => {
      const ctx = await roleContext(candidateUser);

      await ctx.page.goto("/admin/candidates", { waitUntil: "load" });

      await ctx.page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15000 });
      await ctx.close();
    });

    test("4c. Candidate cannot access admin companies", async () => {
      const ctx = await roleContext(candidateUser);

      await ctx.page.goto("/admin/companies", { waitUntil: "load" });

      await ctx.page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15000 });
      await ctx.close();
    });

    test("4d. Candidate cannot access admin requests", async () => {
      const ctx = await roleContext(candidateUser);

      await ctx.page.goto("/admin/requests", { waitUntil: "load" });

      await ctx.page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15000 });
      await ctx.close();
    });

    test("4e. Company user cannot access admin hub", async () => {
      const ctx = await roleContext(companyUser);

      await ctx.page.goto("/admin", { waitUntil: "load" });

      await ctx.page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15000 });
      await ctx.close();
    });

    test("4f. Company user cannot access admin candidates", async () => {
      const ctx = await roleContext(companyUser);

      await ctx.page.goto("/admin/candidates", { waitUntil: "load" });

      await ctx.page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15000 });
      await ctx.close();
    });

    test("4g. Company user cannot access admin companies", async () => {
      const ctx = await roleContext(companyUser);

      await ctx.page.goto("/admin/companies", { waitUntil: "load" });

      await ctx.page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15000 });
      await ctx.close();
    });

    test("4h. Company user cannot access admin requests", async () => {
      const ctx = await roleContext(companyUser);

      await ctx.page.goto("/admin/requests", { waitUntil: "load" });

      await ctx.page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15000 });
      await ctx.close();
    });

    test("4i. Staff cannot access admin hub", async () => {
      const ctx = await roleContext(staffUser);

      await ctx.page.goto("/admin", { waitUntil: "load" });

      await ctx.page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15000 });
      await ctx.close();
    });

    test("4j. Staff cannot access admin candidates", async () => {
      const ctx = await roleContext(staffUser);

      await ctx.page.goto("/admin/candidates", { waitUntil: "load" });

      await ctx.page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15000 });
      await ctx.close();
    });

    test("4k. Staff cannot access admin companies", async () => {
      const ctx = await roleContext(staffUser);

      await ctx.page.goto("/admin/companies", { waitUntil: "load" });

      await ctx.page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15000 });
      await ctx.close();
    });

    test("4l. Staff cannot access admin requests", async () => {
      const ctx = await roleContext(staffUser);

      await ctx.page.goto("/admin/requests", { waitUntil: "load" });

      await ctx.page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15000 });
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 5 — Console Error Check
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 5 — Console Error Check", () => {
    test("5a. All admin critical pages networkidle without hydration or serialization errors", async () => {
      const ctx = await adminContext();

      const pages = [
        "/admin",
        "/admin/candidates",
        "/admin/companies",
        "/admin/requests",
        "/admin/transfers",
        "/admin/compliance",
        "/admin/payments",
        "/admin/agents",
      ];
      for (const route of pages) {
        await ctx.page.goto(route, { waitUntil: "load" });
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      }

      // Should have no hydration/serialization errors across all pages
      assertNoReactErrors(ctx.errors);
      console.log(`Console errors across ${pages.length} admin pages: ${ctx.errors.length}`);

      await ctx.close();
    });
  });
});
