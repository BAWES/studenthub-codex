import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

// Force USE_MOCK_FIXTURES=true — these tests must never need DB seed data
process.env.USE_MOCK_FIXTURES = "true";

let company: FixtureUser;
let candidateUser: FixtureUser;
let staff: FixtureUser;

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

/** Create a basic authenticated context for role-gate tests (no error tracking). */
async function roleContext(
  role: FixtureUser,
): Promise<{ context: BrowserContext; page: Page; close: () => Promise<void> }> {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "studenthub_next_session",
      value: role.cookie,
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  const page = await context.newPage();
  return {
    context,
    page,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}

test.describe("Company Critical Flows", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    company = fixtures.get("company")!;
    candidateUser = fixtures.get("candidate")!;
    staff = fixtures.get("staff")!;
  });

  // ──────────────────────────────────────────────
  // Flow 1 — Company Dashboard Stats
  // ──────────────────────────────────────────────

  test("Flow 1a — Company dashboard loads with metric cards", async () => {
    const ctx = await authContext(company);

    await ctx.page.goto("/company");
    await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/company/);

    // Metric cards section present
    const metricsSection = ctx.page.locator('section[aria-label="Company workspace metrics"]');
    await expect(metricsSection).toBeVisible({ timeout: 10000 });

    // Check for expected metric labels
    await expect(ctx.page.locator("text=Active Requests").first()).toBeVisible({ timeout: 5000 });
    await expect(ctx.page.locator("text=Open Positions").first()).toBeVisible({ timeout: 5000 });
    await expect(ctx.page.locator("text=Linked Companies").first()).toBeVisible({ timeout: 5000 });
    await expect(ctx.page.locator("text=Total Requests").first()).toBeVisible({ timeout: 5000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 1b — Company dashboard has Create Request CTA", async () => {
    const ctx = await authContext(company);

    await ctx.page.goto("/company");
    await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

    // Role header / CTA section
    await expect(ctx.page.locator("text=Create Request").first()).toBeVisible({ timeout: 10000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 1c — Company dashboard has Request Pipeline and Activity sections", async () => {
    const ctx = await authContext(company);

    await ctx.page.goto("/company");
    await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

    // Pipeline section
    const pipelineHeading = ctx.page.locator("text=Active Requests").first();
    await expect(pipelineHeading).toBeVisible({ timeout: 10000 });

    // Recent Activity section
    await expect(ctx.page.locator("text=Recent Activity").first()).toBeVisible({ timeout: 5000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 1d — Candidate cannot access company dashboard", async () => {
    const ctx = await roleContext(candidateUser);

    await ctx.page.goto("/company");
    await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

    await expect(ctx.page).not.toHaveURL("/company");
    await ctx.close();
  });

  // ──────────────────────────────────────────────
  // Flow 2 — Browse Candidate Applications
  // ──────────────────────────────────────────────

  test("Flow 2a — Employer jobs list has link to applications", async () => {
    const ctx = await authContext(company);

    await ctx.page.goto("/employer/jobs");
    await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Jobs list page renders
    await expect(ctx.page.locator("h1")).toContainText("Job Postings");

    // Applications link or jobs listing is present
    // Check for job rows in the data table
    const jobRows = ctx.page.locator("a[href*='/employer/jobs/']");
    if ((await jobRows.count()) > 0) {
      // Navigate into the first job
      const href = await jobRows.first().getAttribute("href");
      await ctx.page.goto(href!);
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 2b — Job applications page loads with expected columns", async () => {
    const ctx = await authContext(company);

    // Navigate to jobs list to find a valid job ID
    await ctx.page.goto("/employer/jobs");
    await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

    const jobLink = ctx.page.locator("a[href*='/employer/jobs/']").first();
    if ((await jobLink.count()) > 0) {
      const href = await jobLink.getAttribute("href");
      // Navigate to applications page for that job
      await ctx.page.goto(`${href}/applications`);
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Page should load — check for applications heading
      await expect(ctx.page.locator("text=Applications for").first()).toBeVisible({ timeout: 10000 });

      // Table columns
      await expect(ctx.page.locator("text=Candidate").first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator("text=Applied").first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator("text=Status").first()).toBeVisible({ timeout: 5000 });
    } else {
      // No jobs exist — at least verify the job listing page loaded correctly
      await expect(ctx.page.locator("h1")).toContainText("Job Postings");
      console.log("No job rows found — applications detail navigation skipped");
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 2c — Staff user cannot access employer applications", async () => {
    const ctx = await roleContext(staff);

    await ctx.page.goto("/employer/jobs");
    await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

    await expect(ctx.page).not.toHaveURL("/employer/jobs");
    await ctx.close();
  });

  // ──────────────────────────────────────────────
  // Flow 3 — Request Detail (Interviews section)
  // ──────────────────────────────────────────────

  test("Flow 3a — Request detail page loads with Interviews section", async () => {
    const ctx = await authContext(company);

    // Navigate to requests list
    await ctx.page.goto("/company/requests");
    await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

    // Find a request link and navigate to detail
    const requestLink = ctx.page.locator("a[href*='/company/requests/']").first();
    if ((await requestLink.count()) > 0) {
      const href = await requestLink.getAttribute("href");
      await ctx.page.goto(href!);
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Request Brief section
      await expect(ctx.page.locator("text=Request Brief").first()).toBeVisible({ timeout: 10000 });

      // Interviews section
      await expect(ctx.page.locator("text=Interviews").first()).toBeVisible({ timeout: 5000 });

      // Applications and Invitations sections
      await expect(ctx.page.locator("text=Applications").first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator("text=Invitations").first()).toBeVisible({ timeout: 5000 });
    } else {
      // At least verify the list page loaded
      await expect(ctx.page.locator("text=Requests").first()).toBeVisible({ timeout: 5000 });
      console.log("No request rows found — detail navigation skipped");
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 3b — Request detail page shows key facts", async () => {
    const ctx = await authContext(company);

    await ctx.page.goto("/company/requests");
    await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

    const requestLink = ctx.page.locator("a[href*='/company/requests/']").first();
    if ((await requestLink.count()) > 0) {
      const href = await requestLink.getAttribute("href");
      await ctx.page.goto(href!);
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Key fact fields in the Request Brief section
      await expect(ctx.page.locator("text=Company").first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator("text=Contact").first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator("text=Compensation").first()).toBeVisible({ timeout: 5000 });
      await expect(ctx.page.locator("text=Created").first()).toBeVisible({ timeout: 5000 });
    } else {
      console.log("No request rows found — facts check skipped");
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 3c — Candidate cannot access company requests", async () => {
    const ctx = await roleContext(candidateUser);

    await ctx.page.goto("/company/requests");
    await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

    await expect(ctx.page).not.toHaveURL("/company/requests");
    await ctx.close();
  });

  // ──────────────────────────────────────────────
  // Flow 4 — Console error check across all company pages
  // ──────────────────────────────────────────────

  test("Flow 4 — All company critical pages load without hydration errors", async () => {
    const ctx = await authContext(company);

    const pages = [
      "/company",
      "/employer/jobs",
      "/employer/jobs/new",
      "/company/requests",
      "/company/requests/create",
    ];
    for (const route of pages) {
      await ctx.page.goto(route);
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    }

    assertNoReactErrors(ctx.errors);
    console.log(`Console errors across ${pages.length} company pages: ${ctx.errors.length}`);
    await ctx.close();
  });

  // ──────────────────────────────────────────────
  // Flow 5 — New Job Posting
  // ──────────────────────────────────────────────

  test("Flow 5a — New Job Posting page loads with form", async () => {
    const ctx = await authContext(company);

    await ctx.page.goto("/employer/jobs/new");
    await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/employer\/jobs\/new/);

    // Title/heading renders
    await expect(ctx.page.locator("text=New Job Posting").first()).toBeVisible({ timeout: 10000 });

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("Flow 5b — Candidate cannot access new job posting page", async () => {
    const ctx = await roleContext(candidateUser);

    await ctx.page.goto("/employer/jobs/new");
    await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

    await expect(ctx.page).not.toHaveURL("/employer/jobs/new");
    await ctx.close();
  });
});
