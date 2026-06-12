// ---------------------------------------------------------------------------
// E2E Smoke: Staff candidates management page
//
// CI only. Uses USE_MOCK_FIXTURES=true.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let staff: FixtureUser;

test.describe("Staff candidates management page", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
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
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    return { browser, context, page, errors, close: async () => { await context.close(); await browser.close(); } };
  }

  function assertNoReactErrors(errors: string[]) {
    const bad = errors.filter(m => m.includes("hydration") || m.includes("serialization") || m.includes("Functions cannot be passed"));
    expect(bad).toEqual([]);
  }

  test("staff candidates page loads without errors", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/staff/candidates");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff candidates page renders list or heading", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/staff/candidates");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page.locator("h1, h2, table, [role='list'], main").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff interviews page loads without errors", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/staff/interviews");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff requests page loads without errors", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/staff/requests");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff hub page loads without errors", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/staff");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("candidate cannot access staff hub (cross-role guard)", async () => {
    const fixtures = getMockFixtures();
    const candidate = fixtures.get("candidate")!;
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: candidate.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto("/staff");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/staff");
    await bContext.close();
    await browser.close();
  });
});
