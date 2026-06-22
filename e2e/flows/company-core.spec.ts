// Force USE_MOCK_FIXTURES=true — these tests must never need DB seed data
process.env.USE_MOCK_FIXTURES = "true";

import { test, expect } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

let company: FixtureUser;
let candidateUser: FixtureUser;

/**
 * Create an authenticated browser context for the given fixture user.
 * Returns { browser, context, page, close } — caller must close.
 */
async function authContext(user: FixtureUser) {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "studenthub_next_session",
      value: user.cookie,
      domain: "127.0.0.1",
      path: "/",
    },
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

/** Assert no React hydration/serialization errors in captured console errors. */
function assertNoReactErrors(errors: string[]) {
  const bad = errors.filter(
    (m) =>
      m.includes("hydration") ||
      m.includes("serialization") ||
      m.includes("Functions cannot be passed"),
  );
  expect(bad).toEqual([]);
}

test.describe("Company Core Flows", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    company = fixtures.get("company")!;
    candidateUser = fixtures.get("candidate")!;
  });

  // ──────────────────────────────────────────────
  // Flow 1 — Store Management
  // ──────────────────────────────────────────────

  test("Flow 1a — Stores page loads with heading and table", async () => {
    const ctx = await authContext(company);

    await ctx.page.goto("/company/stores");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/company\/stores/);

    // Title/heading renders
    await expect(ctx.page.locator("text=Stores & Branches").first()).toBeVisible({ timeout: 10000 });

    // DataTable renders with expected columns
    await expect(ctx.page.locator("text=Store").first()).toBeVisible();
    await expect(ctx.page.locator("text=Location").first()).toBeVisible();
    await expect(ctx.page.locator("text=Mall").first()).toBeVisible();

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 1b — Company account detail shows stores and contacts sections", async () => {
    const ctx = await authContext(company);

    // Navigate to companies list, then into first company detail
    await ctx.page.goto("/company/companies");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Companies list has rows — click the first DataTable row
    const firstRowLink = ctx.page.locator("article.row a, a[href*='/company/stores/']").first();
    if ((await firstRowLink.count()) > 0) {
      const href = await firstRowLink.getAttribute("href");
      await ctx.page.goto(href!);
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Detail page shows Stores section
      await expect(ctx.page.locator("text=Stores").first()).toBeVisible({ timeout: 10000 });

      // Detail page shows Contacts section
      await expect(ctx.page.locator("text=Contacts").first()).toBeVisible({ timeout: 5000 });
    } else {
      // No companies — at least verify the list page loaded
      await expect(ctx.page.locator("text=Company").first()).toBeVisible({ timeout: 5000 });
      console.log("No company rows found — detail navigation skipped");
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 1c — Candidate cannot access company stores", async () => {
    const ctx = await authContext(candidateUser);

    await ctx.page.goto("/company/stores");
    await ctx.page.waitForLoadState("load");

    // Candidate should be redirected away
    await expect(ctx.page).not.toHaveURL("/company/stores");
    await ctx.close();
  });

  // ──────────────────────────────────────────────
  // Flow 2 — Workspace
  // ──────────────────────────────────────────────

  test("Flow 2a — Workspace page loads with expected widgets", async () => {
    const ctx = await authContext(company);

    await ctx.page.goto("/company/workspace");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/company\/workspace/);

    // Workspace header
    await expect(ctx.page.locator("text=Company Workspace").first()).toBeVisible({ timeout: 10000 });

    // Linked Companies section
    await expect(ctx.page.locator("text=Linked Companies").first()).toBeVisible({ timeout: 10000 });

    // Recent Requests section
    await expect(ctx.page.locator("text=Recent Requests").first()).toBeVisible({ timeout: 5000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 2b — Candidate cannot access company workspace", async () => {
    const ctx = await authContext(candidateUser);

    await ctx.page.goto("/company/workspace");
    await ctx.page.waitForLoadState("load");

    await expect(ctx.page).not.toHaveURL("/company/workspace");
    await ctx.close();
  });

  // ──────────────────────────────────────────────
  // Flow 3 — Requests
  // ──────────────────────────────────────────────

  test("Flow 3a — Requests list page loads with table and status badges", async () => {
    const ctx = await authContext(company);

    await ctx.page.goto("/company/requests");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/company\/requests/);

    // Title
    await expect(ctx.page.locator("text=Requests").first()).toBeVisible({ timeout: 10000 });

    // New Request button
    const newRequestBtn = ctx.page.locator('a[href="/company/requests/create"]');
    await expect(newRequestBtn).toBeVisible({ timeout: 5000 });

    // Table columns
    await expect(ctx.page.locator("text=Request").first()).toBeVisible({ timeout: 5000 });
    await expect(ctx.page.locator("text=Status").first()).toBeVisible({ timeout: 5000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 3b — Request detail page loads with status and actions", async () => {
    const ctx = await authContext(company);

    // Navigate to requests list
    await ctx.page.goto("/company/requests");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Find a request row and navigate to detail
    const firstRequestLink = ctx.page.locator("a[href*='/company/requests/']").first();
    if ((await firstRequestLink.count()) > 0) {
      const href = await firstRequestLink.getAttribute("href");
      await ctx.page.goto(href!);
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Request Brief section
      await expect(ctx.page.locator("text=Request Brief").first()).toBeVisible({ timeout: 10000 });

      // Application and Interviews sections
      await expect(ctx.page.locator("text=Applications").first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator("text=Interviews").first()).toBeVisible({ timeout: 5000 });
    } else {
      console.log("No request rows found — detail navigation skipped");
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 3c — All company pages load without hydration errors", async () => {
    const ctx = await authContext(company);

    const pages = [
      "/company",
      "/company/stores",
      "/company/companies",
      "/company/contacts",
      "/company/requests",
      "/company/workspace",
    ];
    for (const route of pages) {
      await ctx.page.goto(route);
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    }

    assertNoReactErrors(ctx.errors);
    console.log(`Console errors across ${pages.length} company pages: ${ctx.errors.length}`);
    await ctx.close();
  });

  // ──────────────────────────────────────────────
  // Cross-role access
  // ──────────────────────────────────────────────

  test("Flow 3d — Candidate cannot view company requests", async () => {
    const ctx = await authContext(candidateUser);

    await ctx.page.goto("/company/requests");
    await ctx.page.waitForLoadState("load");

    await expect(ctx.page).not.toHaveURL("/company/requests");
    await ctx.close();
  });
});
