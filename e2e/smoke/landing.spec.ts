import { test, expect } from "@playwright/test";

test.describe("Landing page smoke tests (STU-154)", () => {
  test("landing page loads with hero content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

    // Hero copy (changed in STU-154)
    await expect(page.locator(".landingHeroCopy")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("Every role gets its own workspace.");
    await expect(page.locator(".landingHeroCopy .eyebrow")).toHaveText("The StudentHub platform");
  });

  test("hero CTA buttons render", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".landingActions")).toBeVisible();
    await expect(page.locator(".landingActions >> text=Get started")).toBeVisible();
    await expect(page.locator(".landingActions >> text=Explore portals")).toBeVisible();
  });

  test("platform highlights strip renders", async ({ page }) => {
    await page.goto("/");
    const stats = page.locator(".landingHeroStats");
    await expect(stats).toBeVisible();
    await expect(stats).toHaveAttribute("aria-label", "Platform highlights");
    await expect(stats).toContainText("5 role-specific portals");
    await expect(stats).toContainText("Unified search & documents");
    await expect(stats).toContainText("End-to-end workflows");
  });

  test("portal grid renders all 5 portal cards with icons", async ({ page }) => {
    await page.goto("/");
    const portalGrid = page.locator("section[aria-label='StudentHub portals']");
    await expect(portalGrid).toBeVisible();

    const portalLinks = portalGrid.locator("a");
    await expect(portalLinks).toHaveCount(5);

    // Each portal card has an emoji icon (aria-hidden)
    const icons = portalGrid.locator(".portalIcon");
    await expect(icons).toHaveCount(5);
    for (const icon of await icons.all()) {
      await expect(icon).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("benefits section renders with all cards", async ({ page }) => {
    await page.goto("/");
    const benefitsSection = page.locator(".landingBenefitsSection");
    await expect(benefitsSection).toBeVisible();
    await expect(benefitsSection.locator(".eyebrow")).toHaveText("Why StudentHub");
    await expect(benefitsSection.locator("h2")).toHaveText("Built for how staffing actually works.");

    const benefitCards = benefitsSection.locator(".benefitGrid article");
    await expect(benefitCards).toHaveCount(4);

    await expect(benefitCards.nth(0)).toContainText("Purpose-built portals");
    await expect(benefitCards.nth(1)).toContainText("Smart candidate search");
    await expect(benefitCards.nth(2)).toContainText("End-to-end workflows");
    await expect(benefitCards.nth(3)).toContainText("Production-grade foundation");
  });

  test("nav renders brand and sign in link", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav[aria-label='StudentHub public navigation']");
    await expect(nav).toBeVisible();
    await expect(nav).toContainText("StudentHub");
    await expect(nav).toContainText("Sign in");
  });

  test("decorative ops frame is aria-hidden", async ({ page }) => {
    await page.goto("/");
    const stage = page.locator(".landingHeroStage");
    await expect(stage).toHaveAttribute("aria-hidden", "true");
    await expect(stage.locator(".landingOpsSearch")).toContainText("find talent");
  });

  test.describe("mobile", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("landing page renders on mobile without overflow", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toHaveText("Every role gets its own workspace.");
      await expect(page.locator(".landingActions")).toBeVisible();
      await expect(page.locator(".landingBenefitsSection")).toBeVisible();
    });
  });
});
