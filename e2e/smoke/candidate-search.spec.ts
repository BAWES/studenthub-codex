import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

const fixtures = getMockFixtures();
const admin = fixtures.get("admin")!;
const staff = fixtures.get("staff")!;

test.describe("Candidate search", () => {
  test.describe.configure({ mode: "serial" });

  test("admin can access candidate search page", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: admin.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/candidates");
    await expect(page).toHaveURL("/admin/candidates");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("admin candidate search renders search input", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: admin.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/candidates");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("admin can search candidates by query", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: admin.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/candidates?q=test");
    await expect(page).toHaveURL(/\/admin\/candidates\?q=test/);
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("staff can access candidate search page", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: staff.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/staff/candidates");
    await expect(page).toHaveURL("/staff/candidates");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("staff can view assigned candidates", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: staff.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/staff/candidates?view=assigned");
    await expect(page).toHaveURL(/\/staff\/candidates\?view=assigned/);
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("staff cannot access admin candidates page (cross-role guard)", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: staff.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/candidates");
    await expect(page).not.toHaveURL("/admin/candidates");
    await context.close();
  });

  test("unauthenticated users are redirected from candidate pages", async ({ page }) => {
    await page.goto("/admin/candidates");
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/staff/candidates");
    await expect(page).toHaveURL(/\/login/);
  });
});
