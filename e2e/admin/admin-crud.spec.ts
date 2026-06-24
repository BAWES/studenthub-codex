// ---------------------------------------------------------------------------
// E2E Smoke: Admin CRUD pages (degree, salary-scales, story, expense)
//
// CI only. Uses USE_MOCK_FIXTURES=true.
// Verifies admin CRUD pages load without errors.
// Follows existing pattern from commit c51e817e.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;

test.describe("Admin CRUD pages", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
  });

  async function assertPageLoads(route: string) {
    const { chromium } = await import("@playwright/test");
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: admin.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    await page.goto(route);
    await page.waitForLoadState("load");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

    const badErrors = errors.filter(
      (m) => m.includes("hydration") || m.includes("serialization") || m.includes("Functions cannot be passed"),
    );
    expect(badErrors).toEqual([]);
    await context.close();
    await browser.close();
  }

  test("admin degree page loads without errors", async () => {
    await assertPageLoads("/admin/degree");
  });

  test("admin salary-scales page loads without errors", async () => {
    await assertPageLoads("/admin/salary-scales");
  });

  test("admin story page loads without errors", async () => {
    await assertPageLoads("/admin/story");
  });

  test("admin expense page loads without errors", async () => {
    await assertPageLoads("/admin/expense");
  });
});
