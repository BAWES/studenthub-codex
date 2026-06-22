// ---------------------------------------------------------------------------
// E2E Smoke: Candidate chat page
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Verifies /candidate/chat loads without React
// hydration/serialization errors.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let candidate: FixtureUser;
let staff: FixtureUser;

test.describe("Candidate chat page", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    candidate = fixtures.get("candidate")!;
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
    const bad = errors.filter(
      (m) =>
        m.includes("hydration") ||
        m.includes("serialization") ||
        m.includes("Functions cannot be passed"),
    );
    expect(bad).toEqual([]);
  }

  test("candidate chat page loads without errors", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/chat");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("candidate chat page renders heading or content", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/chat");
    await ctx.page.waitForLoadState("load");
    const hasContent = await ctx.page.locator("h1, h2, table, [role='list'], main").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("candidate chat page shows Messages heading", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/chat");
    await ctx.page.waitForLoadState("load");
    const heading = ctx.page.locator("h1, h2").filter({ hasText: "Messages" });
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff is redirected from candidate chat (cross-role guard)", async () => {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: staff.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto("/candidate/chat");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/candidate/chat");
    await bContext.close();
    await browser.close();
  });
});
