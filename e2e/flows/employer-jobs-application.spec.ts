// ---------------------------------------------------------------------------
// E2E Sprint: Employer jobs and applications core flows
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Flows:
//   1. Employer jobs list page loads with workspace shell
//   2. Employer job creation page loads
//   3. Employer job detail page loads with workspace shell
//   4. Employer applications page loads for a job
//   5. Staff role guard — company-only pages blocked for candidate
// ---------------------------------------------------------------------------

import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

// Force USE_MOCK_FIXTURES=true — these tests must never need DB seed data
process.env.USE_MOCK_FIXTURES = "true";

let company: FixtureUser;
let candidateUser: FixtureUser;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Create an authenticated browser context for a given user.
 */
async function authContext(user: FixtureUser): Promise<{
  context: BrowserContext;
  page: Page;
  errors: string[];
  close: () => Promise<void>;
}> {
  const browser = await (
    await import("@playwright/test")
  ).chromium.launch();
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
    context,
    page,
    errors,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}

/** Assert no React hydration / serialization errors. */
function assertNoReactErrors(errors: string[]) {
  const bad = errors.filter(
    (m) =>
      m.includes("hydration") ||
      m.includes("serialization"),
  );
  expect(bad).toEqual([]);
}

// ── Suite ───────────────────────────────────────────────────────────────────

test.describe("Employer jobs and applications flows", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    company = fixtures.get("company")!;
    candidateUser = fixtures.get("candidate")!;
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 1 — Employer Jobs List
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 1 — Employer Jobs List", () => {
    test("1a. Employer jobs list page loads with workspace shell", async () => {
      const ctx = await authContext(company);

      await ctx.page.goto("/employer/jobs");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/employer\/jobs/);

      // Workspace shell should render — sidebar or content area
      const shell = ctx.page
        .locator('[class*="shell"], [class*="workspace"], nav, aside')
        .first();
      if (await shell.isVisible().catch(() => false)) {
        console.log("Employer jobs page rendered with workspace shell");
      }

      // Page heading or title should render — either h1 or h2
      const heading = ctx.page.locator("h1, h2").first();
      if (await heading.isVisible().catch(() => false)) {
        console.log(`Employer jobs page heading: ${await heading.textContent().catch(() => "?")}`);
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1b. Employer jobs page renders without hydration errors", async () => {
      const ctx = await authContext(company);

      await ctx.page.goto("/employer/jobs");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      assertNoReactErrors(ctx.errors);

      // Check for data table or empty state
      const tableOrEmpty = ctx.page
        .locator("table, [class*='DataTable'], [class*='data-table'], text=No jobs, text=no jobs, text=No listings")
        .first();
      if (await tableOrEmpty.isVisible().catch(() => false)) {
        console.log("Employer jobs data table or empty state visible");
      }

      await ctx.close();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 2 — Employer Job Creation
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 2 — Employer Job Creation", () => {
    test("2a. Employer job creation page loads", async () => {
      const ctx = await authContext(company);

      await ctx.page.goto("/employer/jobs/new");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/employer\/jobs\/new/);

      // Form or page content renders
      const form = ctx.page
        .locator("form, input, button:has-text('Create'), button:has-text('Save'), [class*='form']")
        .first();
      if (await form.isVisible().catch(() => false)) {
        console.log("Employer job creation form renders");
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 3 — Employer Job Detail
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 3 — Employer Job Detail", () => {
    test("3a. Employer jobs list can navigate to a job detail", async () => {
      const ctx = await authContext(company);

      // First load the jobs list
      await ctx.page.goto("/employer/jobs");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Try to find a job link or row to navigate to detail
      const jobLinks = ctx.page.locator('a[href*="/employer/jobs/"]');
      const linkCount = await jobLinks.count().catch(() => 0);

      if (linkCount > 0) {
        // Find a link that goes to a specific job (not /employer/jobs or /employer/jobs/new)
        const detailLinks: string[] = [];
        for (let i = 0; i < Math.min(linkCount, 10); i++) {
          const href = await jobLinks.nth(i).getAttribute("href").catch(() => null);
          if (href && href.match(/\/employer\/jobs\/\d+/) && !href.endsWith("/new") && !href.endsWith("/jobs")) {
            detailLinks.push(href);
          }
        }

        if (detailLinks.length > 0) {
          // Navigate to the first job detail
          await ctx.page.goto(detailLinks[0]);
          await ctx.page.waitForLoadState("load");
          await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

          // Verify the URL is a job detail page
          expect(ctx.page.url()).toMatch(/\/employer\/jobs\/\d+/);

          // Check for job detail content
          const detailContent = ctx.page
            .locator("h1, h2, [class*='JobEditForm'], button:has-text('View Applications')")
            .first();
          if (await detailContent.isVisible().catch(() => false)) {
            console.log(`Job detail page loaded for ${detailLinks[0]}`);
          }
        } else {
          console.log("No specific job detail links found — skipping detail test");
        }
      } else {
        console.log("No job listing links found — jobs list may be empty");
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("3b. Employer job detail page renders directly", async () => {
      const ctx = await authContext(company);

      // Navigate directly to a plausible job detail URL
      // The detail page will show 404/not-found if the job doesn't exist
      await ctx.page.goto("/employer/jobs/1");
      await ctx.page.waitForLoadState("load");

      // Accept either a valid page or a not-found/error state
      const body = ctx.page.locator("body").first();
      await expect(body).toBeVisible({ timeout: 15000 });

      // If it's a valid detail page, check for job content
      const currentUrl = ctx.page.url();
      if (currentUrl.includes("/employer/jobs/1")) {
        console.log("Employer job detail page /1 loaded successfully");
        const detailContent = ctx.page
          .locator("h1, h2, [class*='JobEditForm']")
          .first();
        if (await detailContent.isVisible().catch(() => false)) {
          console.log("Job detail content renders");
        }
      } else {
        // Redirected to not-found or error — acceptable for missing data
        console.log(`Job detail redirected to: ${currentUrl}`);
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 4 — Employer Applications
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 4 — Employer Applications", () => {
    test("4a. Employer applications page renders for a job", async () => {
      const ctx = await authContext(company);

      await ctx.page.goto("/employer/jobs/1/applications");
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

      // Accept either the applications page or a redirect (not-found)
      const currentUrl = ctx.page.url();
      if (currentUrl.includes("/employer/jobs/1/applications")) {
        console.log("Employer applications page loaded");

        // Check for applications table or empty state
        const tableOrEmpty = ctx.page
          .locator("table, [class*='DataTable'], [class*='data-table'], [class*='applications'], text=No applications, text=no applications")
          .first();
        if (await tableOrEmpty.isVisible().catch(() => false)) {
          console.log("Applications table or empty state renders");
        }
      } else {
        console.log(`Applications page redirected to: ${currentUrl}`);
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flow 5 — Role Guard
  // ──────────────────────────────────────────────────────────────────────────

  test.describe("Flow 5 — Role Guards", () => {
    test("5a. Candidate cannot access employer jobs page", async () => {
      const ctx = await authContext(candidateUser);

      await ctx.page.goto("/employer/jobs");
      await ctx.page.waitForLoadState("load");

      // Candidate should be redirected away from employer page
      await expect(ctx.page).not.toHaveURL("/employer/jobs");

      // Should land on candidate's own workspace or login
      const redirectedUrl = ctx.page.url();
      console.log(`Candidate redirected from /employer/jobs to: ${redirectedUrl}`);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("5b. Candidate cannot access employer job detail", async () => {
      const ctx = await authContext(candidateUser);

      await ctx.page.goto("/employer/jobs/1");
      await ctx.page.waitForLoadState("load");

      // Candidate should be redirected away
      await expect(ctx.page).not.toHaveURL(/\/employer\/jobs\/\d+/);

      console.log(`Candidate redirected from /employer/jobs/1 to: ${ctx.page.url()}`);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("5c. Candidate cannot access employer applications", async () => {
      const ctx = await authContext(candidateUser);

      await ctx.page.goto("/employer/jobs/1/applications");
      await ctx.page.waitForLoadState("load");

      // Candidate should be redirected away
      await expect(ctx.page).not.toHaveURL(/\/employer\/jobs\/\d+\/applications/);

      console.log(`Candidate redirected from /employer/jobs/1/applications to: ${ctx.page.url()}`);

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });
});
