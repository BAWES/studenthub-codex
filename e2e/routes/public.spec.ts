import { test, expect } from "@playwright/test";

test.describe("Public routes", () => {
  test.describe.configure({ mode: "parallel" });

  test("landing page loads", async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleMessages.push(msg.text());
    });

    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

    // No React hydration or serialization errors
    const errors = consoleMessages.filter(
      (m) =>
        m.includes("hydration") ||
        m.includes("serialization") ||
        m.includes("Functions cannot be passed"),
    );
    expect(errors).toEqual([]);
  });

  test("login page loads", async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleMessages.push(msg.text());
    });

    await page.goto("/login");
    await expect(page).toHaveURL("/login");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

    const errors = consoleMessages.filter(
      (m) =>
        m.includes("hydration") ||
        m.includes("serialization") ||
        m.includes("Functions cannot be passed"),
    );
    expect(errors).toEqual([]);
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/signup/);
  });

  test("forgot password page loads", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("reset password page loads", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/reset-password/);
  });

  test("hub page loads", async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleMessages.push(msg.text());
    });
    await page.goto("/hub");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    const errors = consoleMessages.filter(
      (m) => m.includes("hydration") || m.includes("serialization") || m.includes("Functions cannot be passed"),
    );
    expect(errors).toEqual([]);
  });

  test("student page loads", async ({ page }) => {
    await page.goto("/student");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });

  test("employee jobs page loads", async ({ page }) => {
    await page.goto("/employer/jobs");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });

  test("employee jobs new page loads", async ({ page }) => {
    await page.goto("/employer/jobs/new");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
  });

  test("unauthenticated access redirects to login", async ({ page }) => {
    const protectedPaths = [
      "/app",
      "/admin",
      "/staff",
      "/candidate",
      "/company",
      "/inspector",
      "/hub",
    ];
    for (const path of protectedPaths) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

test.describe("App and hub shells", () => {
  test.describe.configure({ mode: "parallel" });

  test("app shell loads for anonymous (redirects to login)", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/\/login/);
  });

  test("hub shell loads for anonymous (redirects to login)", async ({ page }) => {
    await page.goto("/hub");
    await expect(page).toHaveURL(/\/login/);
  });
});
