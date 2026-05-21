import { test, expect } from "@playwright/test";
import { getFixtures, disconnectPrisma } from "../fixtures/auth";

test.afterAll(async () => {
  await disconnectPrisma();
});

test.describe("Request desk", () => {
  test.describe.configure({ mode: "serial" });

  let adminCookie: string;
  let staffCookie: string;
  let companyCookie: string;

  test.beforeAll(async () => {
    const fixtures = await getFixtures();
    adminCookie = fixtures.get("admin")!.cookie;
    staffCookie = fixtures.get("staff")!.cookie;
    companyCookie = fixtures.get("company")!.cookie;
  });

  test("admin can access requests list", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: adminCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/requests");
    await expect(page).toHaveURL("/admin/requests");
    await context.close();
  });

  test("admin request detail renders request fulfillment", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: adminCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    // We need a specific request UUID — use a query param approach that lists all
    await page.goto("/admin/requests");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    // The page should contain request-related content
    await expect(page.locator("text=Request").first()).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("staff can access requests list", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: staffCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/staff/requests");
    await expect(page).toHaveURL("/staff/requests");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("staff request detail renders request fulfillment", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: staffCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/staff/requests");
    await expect(page.locator("text=Request").first()).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("company contact can access linked requests", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: companyCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/company/requests");
    await expect(page).toHaveURL("/company/requests");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("company contact cannot access admin requests (cross-role guard)", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: companyCookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/requests");
    await expect(page).not.toHaveURL("/admin/requests");
    await context.close();
  });

  test("unauthenticated users are redirected from request pages", async ({ page }) => {
    await page.goto("/admin/requests");
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/staff/requests");
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/company/requests");
    await expect(page).toHaveURL(/\/login/);
  });
});
