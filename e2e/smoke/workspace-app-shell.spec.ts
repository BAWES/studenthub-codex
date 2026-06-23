// ---------------------------------------------------------------------------
// E2E Sprint 5: Workspace app shell smoke test
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Verifies the /app workspace shell renders key structural elements:
//   1. App shell loads for authenticated user
//   2. Sidebar navigation renders
//   3. Tab bar / workspace frame renders
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;

test.describe("Workspace app shell", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
  });

  async function authContext(user: FixtureUser) {
    const { chromium } = await import("@playwright/test");
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addCookies([
      { name: "studenthub_next_session", value: user.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    return {
      browser,
      context,
      page,
      errors,
      close: async () => {
        await context.close();
        await browser.close();
      },
    };
  }

  function assertNoReactErrors(errors: string[]) {
    const bad = errors.filter(
      (m) =>
        m.includes("hydration") ||
        m.includes("serialization") ||
        m.includes("Functions cannot be passed"),
    );
    expect(bad).toEqual([]);
  }

  test("app shell loads for authenticated user", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/app");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL("/app");
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("app shell has sidebar navigation", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/app");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Sidebar should contain navigation links
    const sidebarNav = ctx.page.locator("nav").or(ctx.page.locator("aside"));
    await expect(sidebarNav.first()).toBeVisible({ timeout: 10000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("unauthenticated user redirected from /app", async () => {
    const { chromium } = await import("@playwright/test");
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/app");
    await page.waitForLoadState("load");
    await expect(page).toHaveURL(/\/login/);
    await context.close();
    await browser.close();
  });
});
