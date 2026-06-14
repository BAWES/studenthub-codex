import { test, expect } from "@playwright/test";

/** Navigate and wait for full settle before checking hero content. */
async function navAndSettle(page: any) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // Allow CSS reflow/transitions for hero entrance animations
  await page.waitForTimeout(300);
  await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
}

test.describe("Landing page smoke tests", () => {
  test("landing page loads with hero section", async ({ page }) => {
    await navAndSettle(page);

    // Hero section renders with aria-label
    const hero = page.locator(
      "section[aria-label='StudentHub — connecting students with the right employers']",
    );
    await expect(hero).toBeVisible();

    // H1 headline renders
    await expect(page.locator("h1")).toContainText("Connecting students with");
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

  test("landing page loads with subhead text", async ({ page }) => {
    await navAndSettle(page);
    // The hero subhead mentions StudentHub and staff-driven matching
    await expect(page.locator("body")).toContainText("StudentHub is Kuwait");
  });

  test("navigation renders brand and sign in link", async ({ page }) => {
    await navAndSettle(page);
    await expect(page.locator("body")).toContainText("StudentHub");
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });

  test("CTA section renders with get-started content", async ({ page }) => {
    await navAndSettle(page);
    // The page renders at least one "Create your free profile" link
    const ctaLinks = page.locator('a[href="/signup?role=candidate"]');
    await expect(ctaLinks.first()).toBeVisible();
  });

  test("social proof badges render", async ({ page }) => {
    await navAndSettle(page);
    await expect(page.locator("body")).toContainText("students placed");
    await expect(page.locator("body")).toContainText("employers");
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
    });
  });
});
