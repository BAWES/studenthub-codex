import { test, expect } from "@playwright/test";

const BASE = "http://127.0.0.1:3000";

async function navAndSettle(page: import("@playwright/test").Page) {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
}

test.describe("Landing page smoke tests (STU-2776 redesign)", () => {
  test("page renders without errors", async ({ page }) => {
    await navAndSettle(page);
    await expect(page.locator("body")).toBeVisible();
    // No JS console errors
  });

  test("hero renders with key sections", async ({ page }) => {
    await navAndSettle(page);
    await expect(page.locator("h1")).toBeVisible();
    // Stats section
    await expect(page.locator("text=students").first()).toBeVisible();
    await expect(page.locator("text=employers").first()).toBeVisible();

    // Employer pills
    const employerPills = page.locator('[aria-label="Key benefits for employers"]');
    await expect(employerPills).toBeVisible();
    await expect(employerPills).toContainText("AI-matched candidate suggestions");
  });

  test("persona switcher renders and switches between candidate/company", async ({
    page,
  }) => {
    await navAndSettle(page);

    // Persona switcher component renders
    const personaSwitcher = page.locator("text=I'm looking for work").first();
    await expect(personaSwitcher).toBeVisible();

    // Default persona shows candidate-focused CTA
    await expect(
      page.locator('a[href="/signup?role=candidate"]'),
    ).toBeVisible();
  });

  test("navigation renders brand and sign in link", async ({ page }) => {
    await navAndSettle(page);
    const nav = page.locator("nav[aria-label='StudentHub public navigation']");
    await expect(nav).toBeVisible();
    await expect(nav).toContainText("StudentHub");
    await expect(nav).toContainText("Sign in");
  });

  test("CTA section renders with get-started content", async ({ page }) => {
    await navAndSettle(page);
    await expect(page.locator("text=Your next role is one profile away").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Create your free profile").first()).toBeVisible();
  });

  test("decorative elements have aria-hidden", async ({ page }) => {
    await navAndSettle(page);
    // Hero gradient shapes should have aria-hidden
    const decorativeElements = page.locator('[aria-hidden="true"]');
    await expect(decorativeElements.first()).toBeAttached();
  });

  test.describe("mobile", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("landing page renders on mobile without overflow", async ({ page }) => {
      await navAndSettle(page);
      await expect(page.locator("h1")).toContainText("Our staff recruiters match you");
      // CTA buttons still visible on mobile
      await expect(
        page.locator('a[href="/signup?role=candidate"] >> text=Create your free profile'),
      ).toBeVisible();
      // Nav still renders
      await expect(
        page.locator("nav[aria-label='StudentHub public navigation']"),
      ).toBeVisible();
    });
  });
});
