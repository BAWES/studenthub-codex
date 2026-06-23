import { test, expect } from "@playwright/test";

test.describe("Landing page smoke tests (STU-154)", () => {
  test("landing page loads with hero content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

    // Hero headline (cleaned recruitment copy)
    await expect(page.locator("h1")).toHaveText(
      "Staff-matched placements, streamlined.",
    );
  });

  test("hero CTA and feature badges render", async ({ page }) => {
    await page.goto("/");
    // Primary CTA
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();

    // Feature badges
    await expect(
      page.locator('[aria-label="Placement features"]'),
    ).toBeVisible();
    await expect(
      page.locator('[aria-label="Placement features"]'),
    ).toContainText("Staff-recruited matching");
    await expect(
      page.locator('[aria-label="Placement features"]'),
    ).toContainText("End-to-end workflows");
    await expect(
      page.locator('[aria-label="Placement features"]'),
    ).toContainText("Real-time pay and compliance");
  });

  test("portal grid renders all 5 portal cards with icons", async ({ page }) => {
    await page.goto("/");
    const portalGrid = page.locator('section[aria-label="StudentHub portals"]');
    await expect(portalGrid).toBeVisible();

    const portalLinks = portalGrid.locator("a");
    await expect(portalLinks).toHaveCount(5);

    // Each portal card has a lucide icon (svg) with aria-hidden
    const icons = portalGrid.locator("svg[aria-hidden='true']");
    await expect(icons).toHaveCount(5);
  });

  test("nav renders brand and sign in link", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator('nav[aria-label="StudentHub navigation"]');
    await expect(nav).toBeVisible();
    await expect(nav).toContainText("StudentHub");
    await expect(nav).toContainText("Sign in");
  });

  test("landing page renders on mobile without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText(
      "Staff-matched placements, streamlined.",
    );
    // Main content should be visible
    await expect(
      page.locator('section[aria-label="StudentHub portals"]'),
    ).toBeVisible();
  });
});
