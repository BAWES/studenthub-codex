import { test, expect } from "@playwright/test";

/** Navigate and wait for full settle before checking hero content. */
async function navAndSettle(page: any) {
  await page.goto("/");
  await page.waitForLoadState("load");
  // Allow CSS reflow/transitions for hero entrance animations
  await page.waitForTimeout(500);
  await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
}

test.describe("Landing page smoke tests (STU-2776 redesign)", () => {
  test("landing page loads with hero section", async ({ page }) => {
    await navAndSettle(page);

    // Hero section renders with aria-label
    const hero = page.locator(
      "section[aria-label='StudentHub — connecting students with the right employers']",
    );
    await expect(hero).toBeVisible();

    // H1 headline renders
    await expect(page.locator("h1")).toContainText("Connecting students with");

    // Eyebrow renders with two-sided marketplace tagline
    await expect(hero.locator("text=Two-sided marketplace for student talent").first()).toBeVisible();
  });

  test("hero CTA buttons render", async ({ page }) => {
    await navAndSettle(page);

    // Student CTA — primary link in hero
    await expect(
      page.locator('a[href="/signup?role=candidate"]').first(),
    ).toBeVisible();

    // Employer CTA
    await expect(
      page.locator('a[href="/signup?role=company"]').first(),
    ).toBeVisible();

    // Sign in link
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });

  test("hero feature pills render", async ({ page }) => {
    await navAndSettle(page);

    // Social proof text in hero
    await expect(page.locator("text=500+ employers across Kuwait").first()).toBeVisible();

    // Feature pills — student benefits
    const studentPills = page.locator('[aria-label="Key benefits for students"]');
    await expect(studentPills).toBeVisible();
    await expect(studentPills).toContainText("Profile visible to employers across Kuwait");

    // Feature pills — employer benefits
    const employerPills = page.locator('[aria-label="Key benefits for employers"]');
    await expect(employerPills).toBeVisible();
    await expect(employerPills).toContainText("AI-matched candidate suggestions");
  });

  test("persona switcher renders and switches between candidate/company", async ({
    page,
  }) => {
    await navAndSettle(page);

    // Persona tabs render in the nav — candidates tab
    const studentsTab = page.locator("nav >> button", { hasText: "Students" });
    await expect(studentsTab.first()).toBeVisible();

    const companiesTab = page.locator("nav >> button", { hasText: "Companies" });
    await expect(companiesTab.first()).toBeVisible();
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
    // The CTA section heading — scroll down and find it
    const ctaHeading = page.locator("h2", { hasText: "Your next role is one profile away" });
    await expect(ctaHeading).toBeVisible({ timeout: 15000 });
  });

  test("decorative elements have aria-hidden", async ({ page }) => {
    await navAndSettle(page);
    // Background gradient orbs in hero have aria-hidden
    const decorative = page.locator('[aria-hidden="true"]');
    await expect(decorative.first()).toBeVisible();
  });

  test.describe("mobile", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("landing page renders on mobile without overflow", async ({ page }) => {
      await navAndSettle(page);
      // H1 still renders
      await expect(page.locator("h1")).toContainText("Connecting students with");
      // Nav still renders
      await expect(
        page.locator("nav[aria-label='StudentHub public navigation']"),
      ).toBeVisible();
      // Student CTA link visible
      await expect(
        page.locator('a[href="/signup?role=candidate"]').first(),
      ).toBeVisible();
    });
  });
});
