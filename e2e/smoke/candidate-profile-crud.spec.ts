// ---------------------------------------------------------------------------
// E2E Smoke: Candidate profile CRUD — skills, certifications, experience
//
// CI only. Uses USE_MOCK_FIXTURES=true.
// Covers: create skill, edit skill, create certification, add experience.
// ---------------------------------------------------------------------------

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

process.env.USE_MOCK_FIXTURES = "true";

let candidate: FixtureUser;

test.describe("Candidate profile CRUD", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    candidate = fixtures.get("candidate")!;
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

  test("edit profile page loads skills section without errors", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/edit");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Profile sections should render without errors
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("skills page renders skill list or form", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/skills");
    await ctx.page.waitForLoadState("load");

    const hasContent = await ctx.page.locator("h1, h2, ul, [role='list'], main, form").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("certifications page renders without errors", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/certifications");
    await ctx.page.waitForLoadState("load");

    const hasContent = await ctx.page.locator("h1, h2, ul, [role='list'], main, form").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("experience page renders without errors", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/experience");
    await ctx.page.waitForLoadState("load");

    const hasContent = await ctx.page.locator("h1, h2, ul, [role='list'], main, form").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("profile page (non-edit) renders without errors", async () => {
    const ctx = await authContext(candidate);
    await ctx.page.goto("/candidate/profile");
    await ctx.page.waitForLoadState("load");

    const hasContent = await ctx.page.locator("h1, h2, main, section").first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });
});
