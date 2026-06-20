// ---------------------------------------------------------------------------
// E2E Flows: WorkspaceOS navigation — multi-role workspace navigation flows
//
// Verifies that authenticated users can navigate through the workspace
// across key role portals without encountering errors.
//
// Tests:
//   1. Admin workspace: navigate from /app to /app/candidates
//   2. Staff workspace: navigate from /app to /app/requests
//   3. Each page loads body content and fires no React errors
//
// CI only. Uses USE_MOCK_FIXTURES=true.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let admin: FixtureUser;
let staff: FixtureUser;

test.describe("WorkspaceOS navigation flows", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    admin = fixtures.get("admin")!;
    staff = fixtures.get("staff")!;
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

  test("admin navigates /app -> /app/candidates", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/app");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Navigate to candidates via direct URL (simulating sidebar click)
    await ctx.page.goto("/app/candidates");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Should not be on the login page
    const url = ctx.page.url();
    expect(url).not.toContain("/login");

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("admin navigates /app -> /app/candidates -> back to /app", async () => {
    const ctx = await authContext(admin);
    await ctx.page.goto("/app/candidates");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Navigate back to /app (home)
    await ctx.page.goto("/app");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    const url = ctx.page.url();
    expect(url).toContain("/app");
    expect(url).not.toContain("/login");

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff workspace loads without errors", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/app");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Staff should see their workspace
    const url = ctx.page.url();
    expect(url).not.toContain("/login");
    expect(url).toContain("/app");

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff navigates to /app/requests from workspace", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/app/requests");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    const url = ctx.page.url();
    expect(url).not.toContain("/login");
    expect(url).toContain("/requests");

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });
});
