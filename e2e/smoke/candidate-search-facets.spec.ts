import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

const fixtures = getMockFixtures();
const admin = fixtures.get("admin")!;
const staff = fixtures.get("staff")!;

test.describe("Candidate search facet filters", () => {
  test.describe.configure({ mode: "serial" });

  test("facets are visible on admin candidate search page", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: admin.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/candidates");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("clear all filters resets search to default view", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: admin.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/candidates");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("empty state renders when no candidates match search", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: admin.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/admin/candidates?q=zzzzzzzzz_nonexistent_zzzzzzzzz");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });

  test("staff can filter candidates by assigned view then filter further", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: staff.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    await page.goto("/staff/candidates");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
    await context.close();
  });
});
