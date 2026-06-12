// ---------------------------------------------------------------------------
// E2E Smoke: Admin transfers page
//
// CI only. Uses database fixtures for authenticated sessions.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getFixtures, disconnectPrisma } from "../fixtures/auth";

test.afterAll(async () => {
  await disconnectPrisma();
});

test.describe("Admin transfers page", () => {
  test.describe.configure({ mode: "serial" });

  let adminCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    adminCookie = fixtures.get("admin")!.cookie;
  });

  async function adminContext(browser: import("@playwright/test").Browser) {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: adminCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    return { context, page, errors };
  }

  function assertNoReactErrors(errors: string[]) {
    const bad = errors.filter(m => m.includes("hydration") || m.includes("serialization") || m.includes("Functions cannot be passed"));
    expect(bad).toEqual([]);
  }

  test("admin transfers page loads without errors", async ({ browser }) => {
    const { context, page, errors } = await adminContext(browser);
    await page.goto("/admin/transfers");
    await page.waitForLoadState("load");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(errors);
    await context.close();
  });

  test("admin transfers page renders finance intro section", async ({ browser }) => {
    const { context, page, errors } = await adminContext(browser);
    await page.goto("/admin/transfers");
    await page.waitForLoadState("load");

    // The finance workflow intro section should render
    const financeIntro = page.locator("section[aria-label='Finance workflow']");
    await expect(financeIntro).toBeVisible({ timeout: 15000 });

    // Should show the "Finance path" heading
    await expect(page.locator("text=Start with a transfer run")).toBeVisible({ timeout: 10000 });

    assertNoReactErrors(errors);
    await context.close();
  });

  test("admin transfers page shows transfer runs table or empty state", async ({ browser }) => {
    const { context, page, errors } = await adminContext(browser);
    await page.goto("/admin/transfers");
    await page.waitForLoadState("load");

    // Either the DataTable or an empty transfer runs state should render
    const dataTable = page.locator("table, [role='table'], [class*='DataTable']");
    const emptyState = page.locator("text=Transfers").or(page.locator("text=transfer"));

    // The page should have a transfer-related title/description
    await expect(emptyState.first()).toBeVisible({ timeout: 10000 });

    // Verify metric cards render (Runs shown, Latest run, etc.)
    const metricCards = page.locator("[class*='MetricCard'], [class*='metric']");
    await expect(metricCards.first()).toBeVisible({ timeout: 10000 });

    assertNoReactErrors(errors);
    await context.close();
  });

  test("admin transfers page links to latest transfer run", async ({ browser }) => {
    const { context, page, errors } = await adminContext(browser);
    await page.goto("/admin/transfers");
    await page.waitForLoadState("load");

    // Look for a link to open or navigate to the latest transfer
    const latestLink = page.locator("a").filter({ hasText: /Open latest|Transfer #|Open run/i });
    const hasLink = await latestLink.isVisible().catch(() => false);

    if (hasLink) {
      await latestLink.first().click();
      await page.waitForLoadState("load");
      // Should land on a transfer detail page
      await expect(page).toHaveURL(/\/admin\/transfers\/\d+/);
    }

    assertNoReactErrors(errors);
    await context.close();
  });

  test("admin transfers page redirects staff users to their portal", async ({ browser }) => {
    const fixtures = await getFixtures();
    const staffCookie = fixtures.get("staff")!.cookie;

    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: staffCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/transfers");
    await page.waitForLoadState("load");

    // Staff should be redirected away from admin routes
    await expect(page).not.toHaveURL("/admin/transfers");

    await context.close();
  });
});
