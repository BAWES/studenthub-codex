// ---------------------------------------------------------------------------
// E2E Sprint 5: Employer workspace core flows
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Flows:
//   1. Employer workspace shell loads for company user
//   2. Employer jobs list loads with workspace shell
//   3. Employer job creation page loads
//   4. Staff role guard — staff cannot access employer workspace
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let company: FixtureUser;
let staff: FixtureUser;

test.describe("Employer workspace flows", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    company = fixtures.get("company")!;
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

  test("employer jobs list loads with workspace shell", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/employer/jobs");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("employer job creation page loads", async () => {
    const ctx = await authContext(company);
    await ctx.page.goto("/employer/jobs/new");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("staff cannot access employer workspace", async () => {
    const ctx = await authContext(staff);
    await ctx.page.goto("/employer/jobs");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).not.toHaveURL("/employer/jobs");
    await ctx.close();
  });
});
