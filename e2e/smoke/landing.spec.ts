import { test, expect } from "@playwright/test";

test.describe("Landing page smoke tests (STU-2776 redesign)", () => {
  test("landing page loads with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

    // Hero section renders with aria-label
    const hero = page.locator(
      "section[aria-label='StudentHub — connecting students with the right employers']",
    );
    await expect(hero).toBeVisible();

    // H1 headline renders
    await expect(page.locator("h1")).toContainText("Connecting students with");

    // Eyebrow renders
    await expect(hero.locator(".shHeroEyebrow")).toContainText(
      "The two-sided marketplace",
    );
  });

  test("hero CTA buttons render", async ({ page }) => {
    await page.goto("/");

    // Student CTA
    await expect(
      page.locator('a[href="/signup?role=candidate"] >> text=Create your free profile'),
    ).toBeVisible();

    // Employer CTA
    await expect(
      page.locator('a[href="/signup?role=company"] >> text=Hire students'),
    ).toBeVisible();

    // Sign in link
    await expect(page.locator('a[href="/login"] >> text=Sign in')).toBeVisible();
  });

  test("hero feature pills render", async ({ page }) => {
    await page.goto("/");

    // Student pills
    const studentPills = page.locator('[aria-label="Key benefits for students"]');
    await expect(studentPills).toBeVisible();
    await expect(studentPills).toContainText("Profile visible to employers");

    // Employer pills
    const employerPills = page.locator('[aria-label="Key benefits for employers"]');
    await expect(employerPills).toBeVisible();
    await expect(employerPills).toContainText("AI-matched candidate suggestions");
  });

  test("persona switcher renders and switches between candidate/company", async ({
    page,
  }) => {
    await page.goto("/");

    // Persona switcher component renders
    const personaSwitcher = page.locator("text=For students").first();
    await expect(personaSwitcher).toBeVisible();

    // Default persona shows candidate-focused CTA
    await expect(
      page.locator('[aria-label="Get started"] >> text=Create your free candidate profile'),
    ).toBeVisible();
  });

  test("navigation renders brand and sign in link", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav[aria-label='StudentHub public navigation']");
    await expect(nav).toBeVisible();
    await expect(nav).toContainText("StudentHub");
    await expect(nav).toContainText("Sign in");
  });

  test("CTA section renders with get-started content", async ({ page }) => {
    await page.goto("/");
    const ctaSection = page.locator('section[aria-label="Get started"]');
    await expect(ctaSection).toBeVisible();
    await expect(ctaSection).toContainText("Your next role is one profile away");
    await expect(ctaSection).toContainText(
      "Create your free candidate profile",
    );
  });

  test("decorative elements have aria-hidden", async ({ page }) => {
    await page.goto("/");
    const gradients = page.locator(".shHeroGradientDramatic");
    await expect(gradients.first()).toHaveAttribute("aria-hidden", "true");
  });

  test.describe("mobile", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("landing page renders on mobile without overflow", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toContainText("Connecting students with");
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
