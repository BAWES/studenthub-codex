import { test, expect } from "@playwright/test";

test.describe("Login flow", () => {
  test("renders unified login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Sign in once");
    await expect(page.locator(".eyebrow")).toContainText("One StudentHub login");
  });

  test("login form has email and password fields", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("unauthenticated access redirects to login", async ({ page }) => {
    const protectedPaths = ["/app", "/admin", "/staff", "/candidate", "/company", "/inspector", "/hub"];
    for (const path of protectedPaths) {
      await page.goto(path);
      // Should redirect to /login (Next.js uses 307, browser follows)
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("session redirects logged-in user away from login", async ({ page, browser }) => {
    // This test requires a running database with fixture records.
    // Skip in CI environments without a DB unless PLAYWRIGHT_DB_TESTS is set.
    if (process.env.CI && !process.env.PLAYWRIGHT_DB_TESTS) {
      test.skip();
      return;
    }
    // When a valid session cookie exists, /login should redirect to /app
    // This behavior is tested in the role portal smoke tests instead.
    test.skip();
  });
});
