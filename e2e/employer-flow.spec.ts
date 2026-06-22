import { test, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { getMockFixtures, type FixtureUser } from "./fixtures/users";

// Force USE_MOCK_FIXTURES=true — no DB dependency
process.env.USE_MOCK_FIXTURES = "true";

let company: FixtureUser;
let staff: FixtureUser;
let candidateUser: FixtureUser;

test.describe("Employer job posting flow", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    const fixtures = getMockFixtures();
    company = fixtures.get("company")!;
    staff = fixtures.get("staff")!;
    candidateUser = fixtures.get("candidate")!;
  });

  /**
   * Create an authenticated browser context for the company user.
   * Returns { context, page, errors } — caller must close context.
   */
  async function companyContext(browser: Browser): Promise<{
    context: BrowserContext;
    page: Page;
    errors: string[];
    close: () => Promise<void>;
  }> {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "studenthub_next_session",
        value: company.cookie,
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
      },
    };
  }

  /** Navigate with a cookie context for any role. */
  async function roleContext(
    role: FixtureUser,
    browser: Browser,
  ): Promise<{ context: BrowserContext; page: Page; close: () => Promise<void> }> {
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
      },
    };
  }

  /** Assert no React hydration/serialization errors. */
  function assertNoReactErrors(errors: string[]) {
    const bad = errors.filter(
      (m) =>
        m.includes("hydration") ||
        m.includes("serialization") ||
        m.includes("Functions cannot be passed"),
    );
    expect(bad).toEqual([]);
  }

  // ──────────────────────────────────────────────
  // 1. Jobs list page (/employer/jobs)
  // ──────────────────────────────────────────────

  test("1. Jobs list page renders with heading and metrics", async ({ browser }) => {
    const ctx = await companyContext(browser);

    await ctx.page.goto("/employer/jobs");
    await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    await expect(ctx.page).toHaveURL(/\/employer\/jobs/);

    // H1 heading
    await expect(ctx.page.locator("h1")).toContainText("Job Postings");

    // Search results or empty state shows content
    await expect(
      ctx.page.locator("text=jobs found").or(ctx.page.locator("text=No records found")).first()
    ).toBeVisible({
      timeout: 10000,
    });

    // Empty state text when no jobs exist
    const emptyState = ctx.page.locator("text=No records found");
    if ((await emptyState.count()) > 0) {
      await expect(emptyState.first()).toBeVisible();
    }

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("2. '+ New Job Posting' link navigates to /employer/jobs/new", async ({ browser }) => {
    const ctx = await companyContext(browser);

    await ctx.page.goto("/employer/jobs");
    await ctx.page.waitForLoadState("load");

    const newJobLink = ctx.page.locator('a[href="/employer/jobs/new"]');
    await expect(newJobLink).toBeVisible({ timeout: 10000 });
    await expect(newJobLink).toContainText("New Job Posting");

    await ctx.close();
  });

  test("3. Staff user cannot access /employer/jobs", async ({ browser }) => {
    const ctx = await roleContext(staff, browser);

    await ctx.page.goto("/employer/jobs");

    // Staff should be redirected away from employer
    await expect(ctx.page).not.toHaveURL("/employer/jobs");
    await ctx.close();
  });

  // ──────────────────────────────────────────────
  // 2. New job page (/employer/jobs/new)
  // ──────────────────────────────────────────────

  test("4. New job form renders all fields", async ({ browser }) => {
    const ctx = await companyContext(browser);

    await ctx.page.goto("/employer/jobs/new");
    await ctx.page.waitForLoadState("load");
    await expect(ctx.page).toHaveURL(/\/employer\/jobs\/new/);

    // All form fields by id
    await expect(ctx.page.locator("#title")).toBeVisible({ timeout: 10000 });
    await expect(ctx.page.locator("#description")).toBeVisible();
    await expect(ctx.page.locator("#requirements")).toBeVisible();
    await expect(ctx.page.locator("#location")).toBeVisible();
    await expect(ctx.page.locator("#employmentType")).toBeVisible();
    await expect(ctx.page.locator("#salaryMin")).toBeVisible();
    await expect(ctx.page.locator("#salaryMax")).toBeVisible();
    await expect(ctx.page.locator("#status")).toBeVisible();

    // Submit button
    await expect(ctx.page.locator('button:has-text("Create Job Posting")')).toBeVisible();

    // Cancel link (use button text, not sidebar nav link)
    await expect(ctx.page.getByRole("button", { name: /cancel/i })).toBeVisible();

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  test("5. New job form has correct field types and placeholders", async ({ browser }) => {
    const ctx = await companyContext(browser);

    await ctx.page.goto("/employer/jobs/new");
    await ctx.page.waitForLoadState("load");

    // Title is a text input with placeholder
    await expect(ctx.page.locator("#title")).toHaveAttribute("type", "text");
    await expect(ctx.page.locator("#title")).toHaveAttribute("placeholder", /Software Engineer Intern/);

    // Description is a textarea
    await expect(ctx.page.locator("#description")).toHaveAttribute("placeholder", /role/);
    expect(await ctx.page.locator("#description").evaluate((e) => e.tagName)).toBe("TEXTAREA");

    // Employment type is a select with options
    const employmentType = ctx.page.locator("#employmentType");
    const options = await employmentType.locator("option").allTextContents();
    expect(options).toContain("Full-time");
    expect(options).toContain("Part-time");
    expect(options).toContain("Internship");

    // Salary inputs are numbers
    await expect(ctx.page.locator("#salaryMin")).toHaveAttribute("type", "number");
    await expect(ctx.page.locator("#salaryMax")).toHaveAttribute("type", "number");

    // Status options with parenthetical labels
    const status = ctx.page.locator("#status");
    const statusOptions = await status.locator("option").allTextContents();
    expect(statusOptions.some((s) => s.startsWith("Active"))).toBe(true);
    expect(statusOptions.some((s) => s.startsWith("Draft"))).toBe(true);

    assertNoReactErrors(ctx.errors);
    await ctx.close();
  });

  // ──────────────────────────────────────────────
  // 3. Console error / hydration check
  // ──────────────────────────────────────────────

  test("6. All employer pages load without hydration or serialization errors", async ({ browser }) => {
    const ctx = await companyContext(browser);

    const pages = ["/employer/jobs", "/employer/jobs/new"];
    for (const route of pages) {
      await ctx.page.goto(route);
      await ctx.page.waitForLoadState("load");
      await expect(ctx.page.locator("body")).toBeVisible({ timeout: 15000 });
    }

    assertNoReactErrors(ctx.errors);
    console.log(`Console errors across ${pages.length} employer pages: ${ctx.errors.length}`);
    await ctx.close();
  });

  // ──────────────────────────────────────────────
  // 4. Navigation guard
  // ──────────────────────────────────────────────

  test("7. Candidate user cannot access employer pages", async ({ browser }) => {
    const ctx = await roleContext(candidateUser, browser);

    await ctx.page.goto("/employer/jobs");

    // Candidate should be redirected away from employer
    await expect(ctx.page).not.toHaveURL("/employer/jobs");
    await ctx.close();
  });
});
