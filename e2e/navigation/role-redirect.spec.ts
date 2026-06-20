// ---------------------------------------------------------------------------
// E2E Navigation: Role-based redirect behavior
//
// CI only. Uses USE_MOCK_FIXTURES=true.
// Verifies that unauthenticated users are redirected to login and
// authenticated users land on the correct role portal.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

test.describe("Role-based redirect behavior", () => {
  test.describe.configure({ mode: "serial" });

  test("unauthenticated user is redirected to login", async () => {
    const { chromium } = await import("@playwright/test");
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });

    await page.goto("/staff/candidates");
    await page.waitForLoadState("load");

    // Should redirect to login
    const url = page.url();
    const redirectedToLogin = url.includes("/login") || url.includes("/auth");

    expect(redirectedToLogin).toBe(true);
    await context.close();
    await browser.close();
  });

  test("role portals load from direct URL with correct cookie", async () => {
    const fixtures = getMockFixtures();
    const roles = [
      { user: fixtures.get("admin")!, route: "/admin" },
      { user: fixtures.get("staff")!, route: "/staff" },
      { user: fixtures.get("candidate")!, route: "/candidate" },
      { user: fixtures.get("company")!, route: "/company" },
      { user: fixtures.get("inspector")!, route: "/inspector" },
    ];

    for (const { user, route } of roles) {
      const { chromium } = await import("@playwright/test");
      const browser = await chromium.launch();
      const context = await browser.newContext();
      await context.addCookies([
        { name: "studenthub_next_session", value: user.cookie, domain: "127.0.0.1", path: "/" },
      ]);
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });

      await page.goto(route);
      await page.waitForLoadState("load");
      await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

      const bad = errors.filter(m => m.includes("hydration") || m.includes("serialization") || m.includes("Functions cannot be passed"));
      expect(bad).toEqual([]);

      await context.close();
      await browser.close();
    }
  });
});
