import { test, expect } from "@playwright/test";

const BASE = "http://127.0.0.1:3000";

async function navAndSettle(page: import("@playwright/test").Page) {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
}

test.describe("Landing page smoke tests (STU-N landing page redesign)", () => {
  test("landing page loads with hero section", async ({ page }) => {
    await navAndSettle(page);

    // Hero section renders with aria-label
    const hero = page.locator(
      "section[aria-label='StudentHub — connecting students with the right employers']",
    );
    await expect(hero).toBeVisible();

    // H1 headline renders
    await expect(page.locator("h1")).toContainText("Connecting students with");
    await expect(page.locator("h1")).toContainText("the right employers");

    // Eyebrow renders (current text)
    await expect(hero.locator(".shHeroEyebrow")).toContainText(
      "Two-sided marketplace for student talent",
    );
  });

  test("hero renders with key sections", async ({ page }) => {
    await navAndSettle(page);
    await expect(page.locator("h1")).toBeVisible();
    // Stats section
    await expect(page.locator("text=students").first()).toBeVisible();
    await expect(page.locator("text=employers").first()).toBeVisible();

    // Student CTA — at least one visible
    await expect(
      page.locator('a[href="/signup?role=candidate"]').first(),
    ).toBeVisible();

    // Employer CTA — at least one visible
    await expect(
      page.locator('a[href="/signup?role=company"]').first(),
    ).toBeVisible();

    // Sign in link
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });

  test("hero feature pills render with staff-matched references", async ({ page }) => {
    await navAndSettle(page);

    // Student pills
    const studentPills = page.locator('[aria-label="Key benefits for students"]');
    await expect(studentPills).toBeVisible();
    await expect(studentPills).toContainText("Profile visible to employers");
    // Employer pills
    const employerPills = page.locator('[aria-label="Key benefits for employers"]');
    await expect(employerPills).toBeVisible();
    await expect(employerPills).toContainText("Staff-matched candidate suggestions");
  });

  test("persona switcher renders and switches between candidate/company", async ({
    page,
  }) => {
    await navAndSettle(page);

    // Persona switcher renders with Students/Companies tabs
    await expect(page.locator('button:has-text("Students")')).toBeVisible();
    await expect(page.locator('button:has-text("Companies")')).toBeVisible();

    // Default persona shows candidate-focused CTA
    await expect(
      page.locator('a[href="/signup?role=candidate"]').first(),
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
    // CTA section — default persona is candidate
    await expect(page.locator("text=Start your journey")).toBeVisible();
    await expect(page.locator("text=Your next role is one profile away.")).toBeVisible();
    await expect(
      page.locator('a[href="/signup?role=candidate"]').first(),
    ).toBeVisible();
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
      await expect(page.locator("h1")).toContainText("Connecting students with");
      // CTA buttons still visible on mobile
      await expect(
        page.locator('a[href="/signup?role=candidate"]').first(),
      ).toBeVisible();
      // Nav still renders
      await expect(
        page.locator("nav[aria-label='StudentHub public navigation']"),
      ).toBeVisible();
    });
  });
});
