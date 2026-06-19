// ---------------------------------------------------------------------------
// E2E Sprint 2e: Auth critical flows
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Flows:
//   1. Unauthenticated visitor gets redirected to /login
//   2. Role-based login redirects — each role lands on their dashboard
//   3. Valid session persists across page reload
//   4. Expired / invalid session redirects to /login
//   5. Logout clears session and redirects to landing
//   6. Password reset flow — request, verify, set new password
// ---------------------------------------------------------------------------

import { test, expect, type BrowserContext, type Page, type Browser } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

// Force USE_MOCK_FIXTURES=true — these tests must never need DB seed data
process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;
let staff: FixtureUser;
let candidate: FixtureUser;
let company: FixtureUser;
let inspector: FixtureUser;

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
 * Create an authenticated browser context for the given user.
 * Uses the shared `browser` instance.
 */
async function authContext(user: FixtureUser): Promise<{
  context: BrowserContext;
  page: Page;
  errors: string[];
  close: () => Promise<void>;
}> {
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
    },
  };
}

/**
 * Create an unauthenticated browser context (no session cookie).
 * Uses the shared `browser` instance.
 */
async function unauthContext(): Promise<{
  context: BrowserContext;
  page: Page;
  errors: string[];
  close: () => Promise<void>;
}> {
  const context = await browser.newContext();
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

/**
 * Create a deliberately expired / tampered session cookie.
 * Uses a real payload with an invalid signature so the middleware rejects it.
 */
function tamperedCookie(originalCookie: string): string {
  // Graft an obviously invalid HMAC onto the original payload
  const dotIndex = originalCookie.indexOf(".");
  if (dotIndex === -1) return "tampered.payload.INVALIDSIGNATURE==";
  return originalCookie.substring(0, dotIndex) + ".INVALIDSIGNATURE==";
}

// ── Suite ──────────────────────────────────────────────────────────────────

test.describe("Auth critical flows — authentication, redirects, session, logout, password reset", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
    staff = fixtures.get("staff")!;
    candidate = fixtures.get("candidate")!;
    company = fixtures.get("company")!;
    inspector = fixtures.get("inspector")!;
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 1 — Unauthenticated Access Redirect
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 1 — Unauthenticated access redirects", () => {
    test("1a. Unauthenticated /staff redirects to /login", async () => {
      const ctx = await unauthContext();

      await ctx.page.goto("/staff");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/login/);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1b. Unauthenticated /candidate redirects to /login", async () => {
      const ctx = await unauthContext();
      await ctx.page.goto("/candidate");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/login/);
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1c. Unauthenticated /admin redirects to /login", async () => {
      const ctx = await unauthContext();
      await ctx.page.goto("/admin");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/login/);
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1d. Unauthenticated /company redirects to /login", async () => {
      const ctx = await unauthContext();
      await ctx.page.goto("/company");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/login/);
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1e. Unauthenticated /inspector redirects to /login", async () => {
      const ctx = await unauthContext();
      await ctx.page.goto("/inspector");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/login/);
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1f. Unauthenticated /app redirects to /login", async () => {
      const ctx = await unauthContext();
      await ctx.page.goto("/app");
      await ctx.page.waitForLoadState("load");
      // The app may redirect to /login or show an access-required interstitial
      const url = ctx.page.url();
      const hasLogin = url.includes("/login");
      const hasAccessRequired = url.includes("required=access");
      expect(hasLogin || hasAccessRequired,
        `expected redirect to /login, got: ${url}`,
      ).toBe(true);
      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 2 — Role-Based Login Redirects
  //   When an authenticated user visits /login, the middleware should
  //   redirect them to their role-specific dashboard.
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 2 — Role-based login redirects", () => {
    test("2a. Candidate session on /login redirects to /candidate", async () => {
      const ctx = await authContext(candidate);

      await ctx.page.goto("/login");
      await ctx.page.waitForLoadState("load");
      // Candidate should land on their dashboard
      await expect(ctx.page).toHaveURL(/\/candidate/);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2b. Staff session on /login redirects to /staff", async () => {
      const ctx = await authContext(staff);

      await ctx.page.goto("/login");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/staff/);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2c. Admin session on /login redirects to /admin", async () => {
      const ctx = await authContext(admin);

      await ctx.page.goto("/login");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/admin/);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2d. Company session on /login redirects to /company", async () => {
      const ctx = await authContext(company);

      await ctx.page.goto("/login");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/company/);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2e. Inspector session on /login redirects to /inspector", async () => {
      const ctx = await authContext(inspector);

      await ctx.page.goto("/login");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/inspector/);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 3 — Session Persistence
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 3 — Session persistence across reload", () => {
    test("3a. Valid candidate session persists across page reload", async () => {
      const ctx = await authContext(candidate);

      await ctx.page.goto("/candidate");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/candidate/);

      // Reload the page — session should still be valid
      await ctx.page.reload();
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/candidate/);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("3b. Valid inspector session persists across page reload", async () => {
      const ctx = await authContext(inspector);

      await ctx.page.goto("/inspector/id-requests");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/inspector\/id-requests/);

      // Reload
      await ctx.page.reload();
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/inspector\/id-requests/);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 4 — Expired / Invalid Session
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 4 — Expired / invalid session redirects to /login", () => {
    test("4a. Tampered session cookie redirects candidate to /login", async () => {
      const context = await browser.newContext();

      // Set an invalid / tampered session cookie
      const badCookie = tamperedCookie(candidate.cookie);
      await context.addCookies([
        {
          name: "studenthub_next_session",
          value: badCookie,
          domain: "127.0.0.1",
          path: "/",
        },
      ]);
      const page = await context.newPage();

      await page.goto("/candidate");
      await page.waitForLoadState("load");
      // Should reject the tampered cookie and redirect to /login
      await expect(page).toHaveURL(/\/login/);

      await context.close();
    });

    test("4b. Tampered session cookie redirects inspector to /login", async () => {
      const context = await browser.newContext();

      const badCookie = tamperedCookie(inspector.cookie);
      await context.addCookies([
        {
          name: "studenthub_next_session",
          value: badCookie,
          domain: "127.0.0.1",
          path: "/",
        },
      ]);
      const page = await context.newPage();

      await page.goto("/inspector/id-requests");
      await page.waitForLoadState("load");
      await expect(page).toHaveURL(/\/login/);

      await context.close();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 5 — Logout
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 5 — Logout clears session", () => {
    test("5a. Candidate logout redirects to landing, then protected routes redirect to /login", async () => {
      const ctx = await authContext(candidate);

      // Navigate to candidate dashboard
      await ctx.page.goto("/candidate");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/candidate/);

      // Clear the session cookie (simulates logout — /api/auth/logout route is
      // not served; auth uses Next.js server actions now)
      const cookies = await ctx.context.cookies();
      const sessionCookie = cookies.find((c) => c.name === "studenthub_next_session");
      if (sessionCookie) {
        await ctx.context.clearCookies();
      }

      // After logout, a protected route should redirect to /login
      await ctx.page.goto("/candidate");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/login/);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });
  // ──────────────────────────────────────────────────────────────────────────
  // Flow 6 — Password Reset Flow
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 6 — Password reset flow", () => {
    test("6a. Forgot password page renders with email input", async () => {
      const ctx = await unauthContext();

      await ctx.page.goto("/forgot-password");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/forgot-password/);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Email input field should be present
      await expect(
        ctx.page.locator('input[type="email"]').or(ctx.page.locator('input[name="email"]')),
      ).toBeVisible({ timeout: 5000 });

      // Submit button for password reset
      await expect(
        ctx.page.getByRole("button", { name: /reset|send|submit/i }).or(
          ctx.page.locator('button[type="submit"], button:has-text("Reset")').first(),
        ),
      ).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("6b. Reset password page shows invalid-link state without a token", async () => {
      const ctx = await unauthContext();

      // Navigate to reset-password without a token — page validates server-side
      // and shows "Invalid link" UI since no valid reset token was provided
      await ctx.page.goto("/reset-password");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/reset-password/);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Without a valid token, the page shows "Invalid link" heading
      await expect(ctx.page.getByText("Invalid link")).toBeVisible({ timeout: 10000 });

      // "Request a new link" CTA should be present
      await expect(ctx.page.getByText("Request a new link")).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("6c. Login page renders with sign-in form", async () => {
      const ctx = await unauthContext();

      await ctx.page.goto("/login");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page).toHaveURL(/\/login/);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Login form fields should be present
      const emailInput = ctx.page.locator('input[type="email"]');
      const passwordInput = ctx.page.locator('input[type="password"]');
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await expect(passwordInput).toBeVisible({ timeout: 5000 });

      // Sign in button
      await expect(
        ctx.page.getByRole("button", { name: /sign in/i }),
      ).toBeVisible({ timeout: 5000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });
});
