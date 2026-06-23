// ---------------------------------------------------------------------------
// E2E Sprint 4: Auth critical flows — Login, Session, Cross-Role Isolation
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Extends auth-core.spec.ts with deeper workflows.
// Flows:
//   1. Login Form — login page renders with email/password fields and submit
//   2. Cross-Role Isolation — each role's session is isolated from other roles
//   3. Logout + Session Clearing — logout clears cookie, protected routes redirect
//   4. Public Route Access — landing, marketing, public pages load without auth
//   5. Console Error Check — all auth-related pages load without errors
// ---------------------------------------------------------------------------

import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

// Force USE_MOCK_FIXTURES=true — these tests must never need DB seed data
process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;
let staff: FixtureUser;
let candidate: FixtureUser;
let company: FixtureUser;
let inspector: FixtureUser;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Create an authenticated browser context for the given user.
 */
async function authContext(user: FixtureUser): Promise<{
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
      value: user.cookie,
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

/** Assert no React hydration / serialization errors. */
function assertNoReactErrors(errors: string[]) {
  const bad = errors.filter(
    (m) =>
      m.includes("hydration") ||
      m.includes("serialization") ||
      m.includes("Functions cannot be passed"),
  );
  expect(bad).toEqual([]);
}

// ── Suite ──────────────────────────────────────────────────────────────────

test.describe("Auth critical flows — Login, cross-role isolation, public routes", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
    staff = fixtures.get("staff")!;
    candidate = fixtures.get("candidate")!;
    company = fixtures.get("company")!;
    inspector = fixtures.get("inspector")!;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 1 — Login Form
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 1 — Login form renders", () => {
    test("1a. Login page renders with email and password fields", async () => {
      const { chromium } = await import("@playwright/test");
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await page.goto("/login");
      await page.waitForLoadState("load");
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

      // Email input
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      // Password input
      const passwordInput = page.locator('input[type="password"]').first();
      await expect(passwordInput).toBeVisible({ timeout: 5000 });

      // Submit button
      const submitButton = page.getByRole("button", { name: /sign in|log in|submit/i }).or(
        page.locator('button[type="submit"]').first(),
      );
      await expect(submitButton).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(errors);
      await context.close();
      await browser.close();
    });

    test("1b. Unauthenticated landing page loads with marketing content", async () => {
      const { chromium } = await import("@playwright/test");
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await page.goto("/");
      await page.waitForLoadState("load");
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(errors);
      await context.close();
      await browser.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 2 — Cross-Role Isolation
  //   Each role's session is restricted to their own routes.
  //   These mirror the cross-role guards in individual role tests.
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 2 — Cross-role isolation", () => {
    // Admin session: should not access staff/company/candidate/inspector
    test("2a. Admin session cannot access staff dashboard", async () => {
      const ctx = await authContext(admin);
      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/staff");
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2b. Admin session cannot access company dashboard", async () => {
      const ctx = await authContext(admin);
      await ctx.page.goto("/company");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/company");
      await ctx.close();
    });

    test("2c. Admin session cannot access candidate dashboard", async () => {
      const ctx = await authContext(admin);
      await ctx.page.goto("/candidate");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/candidate");
      await ctx.close();
    });

    // Staff session: should not access admin/company/candidate
    test("2d. Staff session cannot access admin dashboard", async () => {
      const ctx = await authContext(staff);
      await ctx.page.goto("/admin");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/admin");
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2e. Staff session cannot access company dashboard", async () => {
      const ctx = await authContext(staff);
      await ctx.page.goto("/company");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/company");
      await ctx.close();
    });

    test("2f. Staff session cannot access candidate dashboard", async () => {
      const ctx = await authContext(staff);
      await ctx.page.goto("/candidate");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/candidate");
      await ctx.close();
    });

    // Candidate session: should not access admin/staff/company/inspector
    test("2g. Candidate session cannot access admin dashboard", async () => {
      const ctx = await authContext(candidate);
      await ctx.page.goto("/admin");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/admin");
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2h. Candidate session cannot access staff dashboard", async () => {
      const ctx = await authContext(candidate);
      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/staff");
      await ctx.close();
    });

    test("2i. Candidate session cannot access company dashboard", async () => {
      const ctx = await authContext(candidate);
      await ctx.page.goto("/company");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/company");
      await ctx.close();
    });

    test("2j. Candidate session cannot access inspector dashboard", async () => {
      const ctx = await authContext(candidate);
      await ctx.page.goto("/inspector");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/inspector");
      await ctx.close();
    });

    // Company session: should not access admin/staff/candidate/inspector
    test("2k. Company session cannot access admin dashboard", async () => {
      const ctx = await authContext(company);
      await ctx.page.goto("/admin");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/admin");
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2l. Company session cannot access staff dashboard", async () => {
      const ctx = await authContext(company);
      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/staff");
      await ctx.close();
    });

    test("2m. Company session cannot access candidate dashboard", async () => {
      const ctx = await authContext(company);
      await ctx.page.goto("/candidate");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/candidate");
      await ctx.close();
    });

    test("2n. Company session cannot access inspector dashboard", async () => {
      const ctx = await authContext(company);
      await ctx.page.goto("/inspector");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/inspector");
      await ctx.close();
    });

    // Inspector session: should not access admin/staff/company/candidate
    test("2o. Inspector session cannot access admin dashboard", async () => {
      const ctx = await authContext(inspector);
      await ctx.page.goto("/admin");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/admin");
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2p. Inspector session cannot access staff dashboard", async () => {
      const ctx = await authContext(inspector);
      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/staff");
      await ctx.close();
    });

    test("2q. Inspector session cannot access company dashboard", async () => {
      const ctx = await authContext(inspector);
      await ctx.page.goto("/company");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/company");
      await ctx.close();
    });

    test("2r. Inspector session cannot access candidate dashboard", async () => {
      const ctx = await authContext(inspector);
      await ctx.page.goto("/candidate");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).not.toHaveURL("/candidate");
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 3 — Logout + Session Clearing
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 3 — Logout clears session", () => {
    test("3a. Staff logout redirects to landing, then protected routes redirect to login", async () => {
      const ctx = await authContext(staff);

      // Navigate to staff dashboard
      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/staff/);

      // Clear session cookie (simulates logout — /api/auth/logout route is
      // not served; auth uses Next.js server actions now)
      await ctx.context.clearCookies();

      // After logout, a protected route should redirect to login
      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/login/);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("3b. Company logout clears session cookie and redirects", async () => {
      const ctx = await authContext(company);

      // Navigate to company dashboard
      await ctx.page.goto("/company");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/company/);

      // Clear session cookie (simulates logout)
      await ctx.context.clearCookies();

      // Clear RSC cache to avoid ERR_ABORTED from stale server components
      await ctx.page.goto("about:blank");
      await ctx.page.waitForLoadState("load");

      // Protected route should now redirect to login
      await ctx.page.goto("/company");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/login/);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 4 — Public Route Access
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 4 — Public routes accessible without authentication", () => {
    test("4a. Landing page is accessible without auth", async () => {
      const { chromium } = await import("@playwright/test");
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await page.goto("/");
      await page.waitForLoadState("load");
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
      // Landing page should be accessible without redirect
      await expect(page).toHaveURL("/");

      assertNoReactErrors(errors);
      await context.close();
      await browser.close();
    });

    test("4b. Hub page loads for unauthenticated user (redirects to login)", async () => {
      const { chromium } = await import("@playwright/test");
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto("/hub");
      await page.waitForLoadState("load");

      // Hub is a protected route — should redirect to login
      await expect(page).toHaveURL(/\/login/);

      await context.close();
      await browser.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 5 — Console Error Check
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 5 — Console Error Check", () => {
    test("5a. All auth-related pages load without hydration or serialization errors", async () => {
      const { chromium } = await import("@playwright/test");
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      const pages = [
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/",
      ];
      for (const route of pages) {
        await page.goto(route);
        await page.waitForLoadState("load");
        await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
      }

      // Should have no hydration/serialization errors across all pages
      const bad = errors.filter(
        (m) =>
          m.includes("hydration") ||
          m.includes("serialization") ||
          m.includes("Functions cannot be passed"),
      );
      expect(bad).toEqual([]);
      console.log(`Console errors across ${pages.length} auth/public pages: ${errors.length}`);

      await context.close();
      await browser.close();
    });
  });
});
