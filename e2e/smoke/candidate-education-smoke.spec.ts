// ---------------------------------------------------------------------------
// E2E Smoke: Candidate education page
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Verifies the education page renders with expected UI elements.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let candidate: FixtureUser;
let company: FixtureUser;

test.describe("Candidate education page", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    candidate = fixtures.get("candidate")!;
    company = fixtures.get("company")!;
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

  test("education page loads without errors", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/education");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("education page renders heading or list container", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/education");
    await ctx.page.waitForLoadState("load");

    const hasHeading = await ctx.page.locator("h1, h2, h3").first().isVisible().catch(() => false);
    const hasList = await ctx.page.locator("ul, [role='list'], table, main").first().isVisible().catch(() => false);
    expect(hasHeading || hasList).toBe(true);

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("company user is redirected from candidate education (cross-role guard)", async () => {
    const browser = await (await import("@playwright/test")).chromium.launch();
    const bContext = await browser.newContext();
    await bContext.addCookies([
      { name: "studenthub_next_session", value: company.cookie, domain: "127.0.0.1", path: "/" },
    ]);
    const page = await bContext.newPage();
    await page.goto("/candidate/education");
    await page.waitForLoadState("load");
    await expect(page).not.toHaveURL("/candidate/education");
    await bContext.close();
    await browser.close();
  });
});
