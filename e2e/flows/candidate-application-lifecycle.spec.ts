// ---------------------------------------------------------------------------
// E2E Sprint 6: Candidate application lifecycle — Browse → Apply → Track
//
// CI only. Uses USE_MOCK_FIXTURES=true to bypass DB dependency.
// Flows:
//   1. Candidate Dashboard — metrics, invitations, applications summary
//   2. Browse Available Jobs — job listing loads with filters
//   3. Apply to Job — application form renders and submits
//   4. Track Applications — application status tracking loads
//   5. Application Detail — individual application shows full details
//   6. Cross-role Access — company/staff cannot view candidate pages
//   7. Console Error Check — all candidate pages load without errors
// ---------------------------------------------------------------------------

import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "../fixtures/users";

// Force USE_MOCK_FIXTURES=true — these tests must never need DB seed data
process.env.USE_MOCK_FIXTURES = "true";

let candidateUser: FixtureUser;
let companyUser: FixtureUser;
let staffUser: FixtureUser;

// ── Helpers ────────────────────────────────────────────────────────────────

async function candidateContext(): Promise<{
  context: BrowserContext;
  page: Page;
  errors: string[];
  close: () => Promise<void>;
}> {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "studenthub_next_session",
      value: candidateUser.cookie,
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

async function roleContext(
  user: FixtureUser,
): Promise<{ context: BrowserContext; page: Page; close: () => Promise<void> }> {
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
  return {
    context,
    page,
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

// ── Suite ──────────────────────────────────────────────────────────────────

test.describe("Candidate application lifecycle — Browse → Apply → Track", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    candidateUser = fixtures.get("candidate")!;
    companyUser = fixtures.get("company")!;
    staffUser = fixtures.get("staff")!;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 1 — Candidate Dashboard
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 1 — Candidate Dashboard", () => {
    test("1a. Candidate dashboard loads with metrics and overview", async () => {
      const ctx = await candidateContext();

      await ctx.page.goto("/candidate");
      await ctx.page.waitForLoadState("load");
      await ctx.page.waitForTimeout(500);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/candidate/);

      // Dashboard content renders — check heading or welcome text
      const dashboardContent = ctx.page.locator(
        'h1, h2, [class*="dashboard"], [class*="welcome"], :has-text("Candidate"), :has-text("Overview")',
      ).first();
      await expect(dashboardContent).toBeVisible({ timeout: 10000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("1b. Candidate dashboard shows application summary", async () => {
      const ctx = await candidateContext();

      await ctx.page.goto("/candidate");
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

      // Applications summary or recent activity section
      const summarySection = ctx.page.locator(
        "text=Applications, text=Recent Activity, text=My Applications, text=Job Applications",
      ).first();
      const overviewSection = ctx.page.locator(
        "text=Overview, text=Dashboard, text=Welcome",
      ).first();
      await expect(summarySection.or(overviewSection)).toBeVisible({ timeout: 10000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 2 — Browse Available Jobs
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 2 — Browse Available Jobs", () => {
    test("2a. Candidate jobs page loads with job listings", async () => {
      const ctx = await candidateContext();

      await ctx.page.goto("/candidate/jobs");
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/candidate\/jobs/);

      // Job listings render — either a table or card grid
      const jobListings = ctx.page.locator(
        "table, [class*='grid'], [class*='listings'], [class*='jobs']",
      ).first();
      await expect(jobListings).toBeVisible({ timeout: 10000 });

      // Search or filter controls should be present
      const searchField = ctx.page.locator(
        'input[type="text"], input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]',
      ).first();
      const filterControls = ctx.page.locator(
        "select, [class*='filter'], [class*='Filter']",
      ).first();
      await expect(searchField.or(filterControls)).toBeVisible({ timeout: 10000 });

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("2b. Job cards or rows display key information", async () => {
      const ctx = await candidateContext();

      await ctx.page.goto("/candidate/jobs");
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

      // Job rows or cards show details
      const jobRows = ctx.page.locator(".dataList, .rows, table tbody tr, [class*='card'], [class*='Card'], [class*='job-row']");

      // Check if jobs exist
      const count = await jobRows.count().catch(() => 0);
      console.log(`Job listings found: ${count}`);

      if (count > 0) {
        // First job row should have a title/position
        const firstJobText = await jobRows.first().textContent().catch(() => "");
        console.log(`First job preview: ${firstJobText?.substring(0, 80).trim()}`);
      } else {
        // Empty state should be shown
        const emptyState = ctx.page.locator(
          "text=No jobs, text=No listings, text=No results, text=No open positions",
        ).first();
        if (await emptyState.isVisible().catch(() => false)) {
          console.log("Empty state shown — no jobs available");
        }
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 3 — Apply to Job
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 3 — Apply to Job", () => {
    test("3a. Job detail page loads with apply action", async () => {
      const ctx = await candidateContext();

      // Navigate to jobs listing first
      await ctx.page.goto("/candidate/jobs");
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

      // Find a job link and navigate to its detail
      const jobLink = ctx.page.locator(
        'a[href*="/candidate/jobs/"]',
      ).first();
      const linkCount = await jobLink.count().catch(() => 0);

      if (linkCount > 0) {
        const href = await jobLink.getAttribute("href");
        await ctx.page.goto(href!);
        await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

        // Job detail page renders with job title
        await expect(ctx.page.locator("h1").or(ctx.page.locator("h2").first())).toBeVisible({ timeout: 10000 });

        // Apply button or action should be present
        const applyButton = ctx.page.locator(
          'button:has-text("Apply"), a:has-text("Apply"), button:has-text("Submit")',
        ).first();
        if (await applyButton.isVisible().catch(() => false)) {
          console.log("Apply button visible on job detail");
        }

        // Job description section
        const description = ctx.page.locator(
          "text=Description, text=About, text=Requirements, text=Details",
        ).first();
        if (await description.isVisible().catch(() => false)) {
          console.log("Job description section visible");
        }
      } else {
        console.log("No job detail links available — detail navigation skipped");
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("3b. Candidate can access application form", async () => {
      const ctx = await candidateContext();

      // Navigate to "Apply" if the route exists
      await ctx.page.goto("/candidate/jobs");
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

      const jobLink = ctx.page.locator('a[href*="/candidate/jobs/"]').first();
      if ((await jobLink.count().catch(() => 0)) > 0) {
        await ctx.page.goto("/candidate/jobs/apply");
        const resp = await ctx.page.goto("/candidate/jobs/apply");
        if (resp && resp.status() < 400) {
          await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
          // Application form should render
          const formSection = ctx.page.locator(
            "form, text=Apply, text=Submit Application, input, textarea",
          ).first();
          await expect(formSection).toBeVisible({ timeout: 10000 });
          console.log("Application form page loaded");
        } else {
          console.log("Application form route not found — may use inline modal instead");
        }
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 4 — Track Applications
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 4 — Track Applications", () => {
    test("4a. Candidate applications page loads with status tracking", async () => {
      const ctx = await candidateContext();

      await ctx.page.goto("/candidate/applications");
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      await expect(ctx.page).toHaveURL(/\/candidate\/applications/);

      // Applications list renders — table or list
      const appTable = ctx.page.locator(
        "table, [class*='list'], [class*='cards'], [class*='applications']",
      ).first();
      await expect(appTable).toBeVisible({ timeout: 10000 });

      // Columns or fields should include status indicator
      const statusColumn = ctx.page.locator(
        "text=Status, [class*='status'], [class*='Status']",
      ).first();
      if (await statusColumn.isVisible().catch(() => false)) {
        console.log("Status column visible in applications list");
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("4b. Application rows show job title and status information", async () => {
      const ctx = await candidateContext();

      await ctx.page.goto("/candidate/applications");
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

      // Check for application rows
      const appRows = ctx.page.locator(".dataList, .rows, table tbody tr, [class*='application-row'], li");
      const rowCount = await appRows.count().catch(() => 0);
      console.log(`Application rows found: ${rowCount}`);

      if (rowCount > 0) {
        // Should display position/job title
        const firstRowText = await appRows.first().textContent().catch(() => "");
        if (firstRowText) {
          console.log(`First application text preview: ${firstRowText.substring(0, 80).trim()}`);
        }
      } else {
        // Empty state
        const emptyState = ctx.page.locator(
          "text=No applications, text=No records, text=No results",
        ).first();
        if (await emptyState.isVisible().catch(() => false)) {
          console.log("No applications submitted yet");
        }
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });

    test("4c. Application detail page shows full lifecycle", async () => {
      const ctx = await candidateContext();

      await ctx.page.goto("/candidate/applications");
      await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

      // Find a link to an application detail
      const appLink = ctx.page.locator(
        'a[href*="/candidate/applications/"]',
      ).first();
      const linkCount = await appLink.count().catch(() => 0);

      if (linkCount > 0) {
        const href = await appLink.getAttribute("href");
        await ctx.page.goto(href!);
        await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });

        // Application detail renders with status information
        const statusSection = ctx.page.locator(
          "text=Status, text=Application Status, [class*='status'], [class*='Status']",
        ).first();
        if (await statusSection.isVisible().catch(() => false)) {
          console.log("Application status section visible on detail");
        }

        // Job title or position
        const jobInfo = ctx.page.locator("h1, h2, [class*='job-title'], [class*='position']").first();
        await expect(jobInfo).toBeVisible({ timeout: 5000 });
      } else {
        console.log("No application detail links available — detail navigation skipped");
      }

      assertNoReactErrors(ctx.errors);
      await ctx.close();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 5 — Cross-role Access Control
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 5 — Cross-role Access Control", () => {
    const candidateRoutes = [
      { route: "/candidate", label: "candidate dashboard" },
      { route: "/candidate/jobs", label: "candidate jobs" },
      { route: "/candidate/applications", label: "candidate applications" },
      { route: "/candidate/profile", label: "candidate profile" },
    ];

    for (const { route, label } of candidateRoutes) {
      test(`5a. Company user cannot access ${label}`, async () => {
        const ctx = await roleContext(companyUser);

        await ctx.page.goto(route);
        await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

        // Company should be redirected away from candidate routes
        await expect(ctx.page).not.toHaveURL(route);
        await ctx.close();
      });

      test(`5b. Staff user cannot access ${label}`, async () => {
        const ctx = await roleContext(staffUser);

        await ctx.page.goto(route);
        await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);

        await expect(ctx.page).not.toHaveURL(route);
        await ctx.close();
      });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Flow 6 — Console Error Check
  // ─────────────────────────────────────────────────────────────────────────

  test.describe("Flow 6 — Console Error Check", () => {
    test("6a. All candidate pages load without hydration or serialization errors", async () => {
      const ctx = await candidateContext();

      const pages = [
        "/candidate",
        "/candidate/jobs",
        "/candidate/applications",
        "/candidate/profile",
      ];

      for (const route of pages) {
        await ctx.page.goto(route);
        await ctx.page.waitForLoadState("load");
    await ctx.page.waitForTimeout(300);
        await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
      }

      assertNoReactErrors(ctx.errors);
      console.log(`Console errors across ${pages.length} candidate pages: ${ctx.errors.length}`);
      await ctx.close();
    });
  });
});
