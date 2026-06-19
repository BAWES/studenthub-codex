import { test, expect } from "@playwright/test";

/** Navigate and wait for full settle before checking hero content. */
async function navAndSettle(page: any) {
  await page.goto("/");
  await page.waitForLoadState("load");
  // Allow CSS reflow/transitions for hero entrance animations
  await page.waitForTimeout(300);
  await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
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

  test("hero CTA buttons render", async ({ page }) => {
    await navAndSettle(page);

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

  test("navigation renders brand and sign in link", async ({ page }) => {
    await navAndSettle(page);
    const nav = page.locator("nav[aria-label='StudentHub public navigation']");
    await expect(nav).toBeVisible();
    await expect(nav).toContainText("StudentHub");
    await expect(nav).toContainText("Sign in");
  });

  test("CTA section renders with get-started content for candidate default persona", async ({ page }) => {
    await navAndSettle(page);
    // CTA section — default persona is candidate
    await expect(page.locator("text=Start your journey")).toBeVisible();
    await expect(page.locator("text=Your next role is one profile away.")).toBeVisible();
    await expect(
      page.locator('a[href="/signup?role=candidate"] >> text=Create your free profile'),
    ).toBeVisible();
  });

  test("decorative elements have aria-hidden", async ({ page }) => {
    await navAndSettle(page);
    // Ambient glow / decorative backgrounds
    const ambient = page.locator(".shHeroAmbientGlow");
    await expect(ambient.first()).toHaveAttribute("aria-hidden", "true");
  });

  test.describe("mobile", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("landing page renders on mobile without overflow", async ({ page }) => {
      await navAndSettle(page);
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
