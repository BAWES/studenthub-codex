// ---------------------------------------------------------------------------
// Shared authenticated context helper for E2E tests.
//
// Usage:
//   import { authContext, assertNoReactErrors } from "../fixtures/auth-context";
//
//   test("my test", async ({ browser }) => {
//     const ctx = await authContext(browser, adminUser);
//     await ctx.page.goto("/admin");
//     await expect(ctx.page.locator("body")).toBeVisible();
//     assertNoReactErrors(ctx.errors);
//     await ctx.close();
//   });
//
// IMPORTANT: Uses Playwright's built-in `browser` fixture (reused across
// tests) instead of launching a new Chromium per test. This prevents
// resource exhaustion in CI with fullyParallel: true.
// ---------------------------------------------------------------------------

import { type Browser, type Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { FixtureUser } from "./users";

export interface AuthContext {
  page: Page;
  errors: string[];
  /** Closes the context (not the browser — browser is shared/reused). */
  close: () => Promise<void>;
}

/**
 * Create an authenticated page for the given fixture user, reusing
 * Playwright's shared browser instance (no new browser launch).
 *
 * Console error listeners are attached BEFORE navigation so no early
 * errors are missed.
 */
export async function authContext(
  browser: Browser,
  user: FixtureUser,
): Promise<AuthContext> {
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

  page.on("pageerror", (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });

  return {
    page,
    errors,
    close: async () => {
      await context.close();
    },
  };
}

/**
 * Assert no React hydration/serialization errors in captured console errors.
 * @param errors Collected console error messages from authContext.
 */
export function assertNoReactErrors(errors: string[]) {
  const bad = errors.filter(
    (m) =>
      m.includes("hydration") ||
      m.includes("serialization"),
  );
  expect(bad).toEqual([]);
}
