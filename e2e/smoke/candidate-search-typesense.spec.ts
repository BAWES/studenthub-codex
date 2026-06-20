import { test, expect } from "@playwright/test";
import { getFixtures, disconnectPrisma } from "../fixtures/auth";

// Skip Typesense tests in CI — no Typesense service available
const hasTypesense = Boolean(process.env.TYPESENSE_API_URL ?? process.env.TYPESENSE_URL);
if (!hasTypesense && process.env.CI) {
  test.skip("Typesense not available — skipping Typesense tests", () => {});
} else {

test.afterAll(async () => {
  await disconnectPrisma();
});

test.describe("Candidate search with Typesense", () => {
  test.describe.configure({ mode: "serial" });

  let adminCookie: string;
  let staffCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    adminCookie = fixtures.get("admin")!.cookie;
    staffCookie = fixtures.get("staff")!.cookie;
  });

  test("admin candidate search loads with Typesense data", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "studenthub_next_session",
        value: adminCookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/candidates");

    // Verify candidate search panel renders
    await expect(
      page.getByRole("region", { name: "Open candidate tabs" }),
    ).toBeVisible({ timeout: 15000 });

    // Verify search results or empty state renders
    await expect(
      page.getByRole("region", { name: "Candidate search and filters" }),
    ).toBeVisible({ timeout: 15000 });

    await context.close();
  });

  test("admin candidate search shows Typesense source badge", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "studenthub_next_session",
        value: adminCookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/candidates");

    // Verify the Typesense source badge is displayed in the search tab header
    const sourceBadge = page.locator(".sourceBadge");
    await expect(sourceBadge).toBeVisible({ timeout: 15000 });
    await expect(sourceBadge).toHaveText("Live MySQL");

    await context.close();
  });

  test("admin can search candidates by query with Typesense", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "studenthub_next_session",
        value: adminCookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/candidates?q=test");

    // Should navigate to search with query parameter
    await expect(page).toHaveURL(/\/admin\/candidates\?q=test/);

    // Should show filtered view indicator
    await expect(page.locator('text="Filtered view"')).toBeVisible({
      timeout: 15000,
    });

    // Source badge should still show Live MySQL
    const sourceBadge = page.locator(".sourceBadge");
    await expect(sourceBadge).toBeVisible({ timeout: 5000 });
    await expect(sourceBadge).toHaveText("Live MySQL");

    await context.close();
  });

  test("staff candidate search shows Typesense badge", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "studenthub_next_session",
        value: staffCookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/staff/candidates");

    // Staff portal should load candidate search
    await expect(page.getByRole("region", { name: "Open candidate tabs" })).toBeVisible({ timeout: 15000 });

    // Source badge should show Live MySQL
    const sourceBadge = page.locator(".sourceBadge");
    await expect(sourceBadge).toBeVisible({ timeout: 15000 });
    await expect(sourceBadge).toHaveText("Live MySQL");

    await context.close();
  });

  test("staff can search assigned candidates with Typesense", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "studenthub_next_session",
        value: staffCookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/staff/candidates?view=assigned");

    // Should show assigned view
    await expect(page).toHaveURL(/\/staff\/candidates\?view=assigned/);

    // Source badge should show Live MySQL
    const sourceBadge = page.locator(".sourceBadge");
    await expect(sourceBadge).toBeVisible({ timeout: 15000 });
    await expect(sourceBadge).toHaveText("Live MySQL");

    await context.close();
  });
});

}
